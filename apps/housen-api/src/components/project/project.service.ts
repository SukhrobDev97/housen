import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { AgencyProjectsInquiry, AllProjectsInquiry, OrdinaryInquiry, ProjectInput, ProjectsInquiry } from '../../libs/dto/project/project.input';
import { Project, Projects } from '../../libs/dto/project/project';
import { Direction, Message } from '../../libs/enums/common.enum';
import { MemberService } from '../member/member.service';
import { ViewService } from '../view/view.service';
import { ProjectStatus } from '../../libs/enums/project.enum';
import { ViewInput } from '../../libs/dto/view/view.input';
import { ViewGroup } from '../../libs/enums/view.enum';
import { StatisticModifier, T } from '../../libs/types/common';
import { ProjectUpdate } from '../../libs/dto/project/project.update';
import moment from 'moment';
import { lookupAuthMemberLiked, lookupMember, shapeItIntoMongoObjectId } from '../../libs/config';
import { LikeService } from '../like/like.service';
import { LikeInput } from '../../libs/dto/like/like.input';
import { LikeGroup } from '../../libs/enums/like.enum';

@Injectable()
export class ProjectService {
    constructor(     
        @InjectModel("Project") private readonly projectModel: Model<Project>,
        private memberService: MemberService,
        private viewService: ViewService,
        private likeService: LikeService
   ){}

   public async createProject(input: ProjectInput): Promise<Project> {
    try {
      const result = await this.projectModel.create(input);
  
      await this.memberService.memberStatsEditor({
        _id: result.memberId,
        targetKey: 'memberProjects',
        modifier: 1,
      });
  
      return result;
    } catch (err) {
      console.log('Error, Service.model:', err.message);
      throw new BadRequestException(Message.CREATE_FAILED);
    }
  }

  public async getProject(memberId: ObjectId, projectId: ObjectId): Promise<Project> {
    const search : T = {
      _id: projectId,
      projectStatus: ProjectStatus.ACTIVE              
    }

    const targetProject = await this.projectModel.findOne(search);

    if(!targetProject) {
      throw new InternalServerErrorException(Message.NO_DATA_FOUND)
    }

    if(memberId){
      const viewInput : ViewInput = {memberId: memberId, viewRefId: projectId, viewGroup: ViewGroup.PROJECT} 
      const newView = await this.viewService.recordView(viewInput);
      if(newView) {
        await this.projectStatsEditor({_id: projectId, targetKey: "projectViews", modifier: 1});
        targetProject.projectViews ++ ;
      }
     
      const likeInput = {memberId: memberId, likeRefId: projectId, likeGroup: LikeGroup.PROJECT}
      targetProject.meLiked = await this.likeService.checkLikeExistence(likeInput)                
              

    }
     targetProject.memberData = await this.memberService.getMember(null, targetProject.memberId)

    return targetProject;
}


public async updateProject(
    memberId: ObjectId,
    input: ProjectUpdate,
  ): Promise<Project> {
    let { projectStatus, deletedAt } = input;
  
    const search: T = {
      _id: input._id,
      memberId: memberId,
      projectStatus: ProjectStatus.ACTIVE,
    };
  
    if (projectStatus === ProjectStatus.DELETE) deletedAt  = moment().toDate();
  
    const result = await this.projectModel
      .findOneAndUpdate(search, input, {
        new: true,
      })
      .exec();
  
    if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);
  
    if (deletedAt) {
      await this.memberService.memberStatsEditor({
        _id: memberId,
        targetKey: 'memberProjects',
        modifier: -1,
      });
    }
  
    return result;
  }
  

 public async projectStatsEditor(input: StatisticModifier): Promise<Project | null> {
    const { _id, targetKey, modifier } = input;
    return await this.projectModel
      .findOneAndUpdate(
        { _id },
        { $inc: { [targetKey]: modifier } },
        { new: true },
      )
      .exec();
  }

  public async getProjects(
    memberId: ObjectId,
    input: ProjectsInquiry
  ): Promise<Projects> {
    const match: T = { projectStatus: ProjectStatus.ACTIVE };
    const sort: T = { [input.sort ?? 'createdAt']: input.direction ?? Direction.DESC };
  
    this.shapeMatchQuery(match, input);
  
    const result = await this.projectModel
      .aggregate([
        { $match: match },
        { $sort: sort },
        {
          $facet: {
            list: [
              { $skip: (input.page - 1) * input.limit },
              { $limit: input.limit },
              lookupAuthMemberLiked(memberId),
              lookupMember,
              { $unwind: { path: '$memberData', preserveNullAndEmptyArrays: true } },
            ],
            metaCounter: [{ $count: 'total' }],
          },
        },
      ])
      .exec();
  
    if (!result.length) {
      return {
        list: [],
        metaCounter: [],
      };
    }
  
    return {
      list: result[0].list || [],
      metaCounter: result[0].metaCounter || [],
    };
  }

  private shapeMatchQuery(match: T, input: ProjectsInquiry): void {
    const {
      memberId,
      projectStyleList,
      typeList,
      pricesRange,
      options,
      text,
    } = input.search;
  
    // memberId filter - faqat mavjud bo'lsa
    if (memberId) {
      match.memberId = shapeItIntoMongoObjectId(memberId);
    }
    
    // projectStyle filter - projectType kabi SODDA va ISHLAYDI
    if (Array.isArray(projectStyleList) && projectStyleList.length > 0) {
      // GraphQL enum'lar string sifatida keladi, to'g'ridan-to'g'ri ishlatamiz
      const styleValues = projectStyleList
        .map(style => {
          // String bo'lsa, to'g'ridan-to'g'ri ishlatamiz
          if (typeof style === 'string') {
            return style.toUpperCase();
          }
          // Enum object bo'lsa (ehtimol GraphQL enum object)
          if (typeof style === 'object' && style !== null) {
            const value = Object.values(style)[0];
            return typeof value === 'string' ? value.toUpperCase() : String(value).toUpperCase();
          }
          return String(style).toUpperCase();
        })
        .filter(style => style && style.length > 0);
      
      if (styleValues.length > 0) {
        match.projectStyle = { $in: styleValues };
      }
    }
    
    // projectType filter - SODDA va ISHLAYDI (projectStyle bilan bir xil)
    if (Array.isArray(typeList) && typeList.length > 0) {
      // GraphQL enum'lar string sifatida keladi, to'g'ridan-to'g'ri ishlatamiz
      const typeValues = typeList
        .map(type => {
          // String bo'lsa, to'g'ridan-to'g'ri ishlatamiz
          if (typeof type === 'string') {
            return type.toUpperCase();
          }
          // Enum object bo'lsa (ehtimol GraphQL enum object)
          if (typeof type === 'object' && type !== null) {
            const value = Object.values(type)[0];
            return typeof value === 'string' ? value.toUpperCase() : String(value).toUpperCase();
          }
          return String(type).toUpperCase();
        })
        .filter(type => type && type.length > 0);
      
      if (typeValues.length > 0) {
        match.projectType = { $in: typeValues };
      }
    }
  
    // priceRange filter - faqat mavjud va default emas bo'lsa
    if (pricesRange && typeof pricesRange.start === 'number' && typeof pricesRange.end === 'number') {
      if (!(pricesRange.start === 0 && pricesRange.end === 2000000)) {
        match.projectPrice = { $gte: pricesRange.start, $lte: pricesRange.end };
      }
    }
    
    // text filter - faqat mavjud va bo'sh bo'lmagan bo'lsa
    if (text && typeof text === 'string' && text.trim().length > 0) {
      const escapedText = text.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      match.projectTitle = { $regex: escapedText, $options: 'i' };
    }
  
    // options filter - faqat array mavjud va bo'sh bo'lmagan bo'lsa
    // MUAMMO: Agar $or va boshqa filterlar birga bo'lsa, MongoDB ularni $and bilan birlashtiradi
    // Shuning uchun $or ni to'g'ri struktura qilish kerak
    if (Array.isArray(options) && options.length > 0) {
      const validOptions = options.filter(opt => 
        typeof opt === 'string' && (opt === 'projectCollaboration' || opt === 'projectPublic')
      );
      
      if (validOptions.length > 0) {
        // Agar bitta option bo'lsa, to'g'ridan-to'g'ri field qo'shamiz
        if (validOptions.length === 1) {
          match[validOptions[0]] = true;
        } else {
          // Agar bir nechta option bo'lsa, $or ishlatamiz
          match['$or'] = validOptions.map((ele) => {
            return { [ele]: true };
          });
        }
      }
    }
  }
  
  public async getFavorites (memberId: ObjectId, input: OrdinaryInquiry): Promise<Projects>{
    return await this.likeService.getFavoriteProjects(memberId, input)
  }

  public async getVisited (memberId: ObjectId, input: OrdinaryInquiry): Promise<Projects>{
    return await this.viewService.getVisitedProjects(memberId, input)
  }
  
  public async getAgencyProjects(
    memberId: ObjectId,
    input: AgencyProjectsInquiry
  ): Promise<Projects> {
    if (input.search.projectStatus === ProjectStatus.DELETE)
      throw new BadRequestException(Message.NOT_ALLOWED_REQUEST);
  
    const match: T = {
      memberId,
      projectStatus: {
        $ne: ProjectStatus.DELETE,
      },
    };
  
    const sort: T = {
      [input?.sort ?? "createdAt"]: input?.direction ?? Direction.DESC,
    };
  
    const result = await this.projectModel
      .aggregate([
        { $match: match },
        { $sort: sort },
        {
          $facet: {
            list: [
              { $skip: (input.page - 1) * input.limit },
              { $limit: input.limit },
              { $lookup: { from: "memberData", localField: "memberId", foreignField: "_id", as: "memberData" } },
              { $unwind: "$memberData" },
            ],
            metaCounter: [{ $count: "total" }],
          },
        },
      ])
      .exec();
  
    if (!result.length)
      throw new InternalServerErrorException(Message.NO_DATA_FOUND);
  
    return result[0];
  }

  public async likeTargetProject ( memberId: ObjectId, likeRefId: ObjectId ): Promise<Project>{
    const target: Project | null = await this.projectModel.findOne({_id: likeRefId, projectStatus: ProjectStatus.ACTIVE}).exec()
    if(!target) throw new InternalServerErrorException(Message.NO_DATA_FOUND)
    
    const input : LikeInput = {
      memberId: memberId,
      likeRefId: likeRefId,
      likeGroup: LikeGroup.PROJECT
    }

    const modifier: number = await this.likeService.toggleLike(input)
    const result =  await this.projectStatsEditor({_id: likeRefId, targetKey: "projectLikes", modifier: modifier})
    if(!result) throw new InternalServerErrorException(Message.SOMETHING_WENT_WRONG)

    return result
}

  
  /* only by admin */
      
  public async getAllProjectsByAdmin(input: AllProjectsInquiry): Promise<Projects> {
    const { projectStatus, projectStyleList } = input.search;
    const match: T = {};
    const sort: T = { [input.sort ?? 'createdAt']: input.direction ?? Direction.DESC };
  
    if (projectStatus) match.projectStatus = projectStatus;
    // XATO: projectLocation emas, projectStyle bo'lishi kerak
    if (Array.isArray(projectStyleList) && projectStyleList.length > 0) {
      const styleValues = projectStyleList.map(style => {
        if (typeof style === 'string') return style.toUpperCase();
        if (typeof style === 'object' && style !== null) {
          const value = Object.values(style)[0];
          return typeof value === 'string' ? value.toUpperCase() : String(value).toUpperCase();
        }
        return String(style).toUpperCase();
      }).filter(Boolean);
      if (styleValues.length > 0) {
        match.projectStyle = { $in: styleValues };
      }
    }
  
    const result = await this.projectModel
      .aggregate([
        { $match: match },
        { $sort: sort },
        {
          $facet: {
            list: [
              { $skip: (input.page - 1) * input.limit },
              { $limit: input.limit },
              lookupMember,
              { $unwind: '$memberData' },
            ],
            metaCounter: [{ $count: 'total' }],
          },
        },
      ])
      .exec();
  
    if (!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);
  
    return result[0];            
  }


  public async updateProjectByAdmin(input: ProjectUpdate): Promise<Project> {
    let { projectStatus, deletedAt} = input;
    const search: T = {
        _id: input._id,
        projectStatus: ProjectStatus.ACTIVE,
    };

     if (projectStatus === ProjectStatus.DELETE) deletedAt = moment().toDate();

    const result = await this.projectModel
        .findOneAndUpdate(search, input, {
            new: true,
        })
        .exec();

    if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);

    if (deletedAt) {
        await this.memberService.memberStatsEditor({
            _id: result.memberId,
            targetKey: 'memberProjects',
            modifier: -1,
        });
    }

    return result;
  }

  public async removeProjectByAdmin(projectId: ObjectId): Promise<Project> {
    const search = { _id: projectId, projectStatus: ProjectStatus.DELETE };
    const result = await this.projectModel.findOneAndDelete(search).exec();
    if (!result) throw new InternalServerErrorException(Message.REMOVE_FAILED);
  
    return result;
  }
  
              
  
}
