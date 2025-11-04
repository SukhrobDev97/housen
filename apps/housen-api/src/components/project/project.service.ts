import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { AgencyProjectsInquiry, AllProjectsInquiry, ProjectInput, ProjectsInquiry } from '../../libs/dto/project/project.input';
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
import { lookupMember, shapeItIntoMongoObjectId } from '../../libs/config';

@Injectable()
export class ProjectService {
    constructor(     
        @InjectModel("Project") private readonly projectModel: Model<Project>,
        private memberService: MemberService,
        private viewService: ViewService
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
      const viewInput : ViewInput = {memberId: memberId, viewRefId: projectId, viewGroup: ViewGroup.MEMBER} 
      const newView = await this.viewService.recordView(viewInput);
      if(newView) {
        await this.projectStatsEditor({_id: projectId, targetKey: "projectViews", modifier: 1});
        targetProject.projectViews ++ ;
      }
     
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
      propertyStatus: ProjectStatus.ACTIVE,
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
  
    console.log('match:', match);
  
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
              { $lookup: { from: 'members', localField: 'memberId', foreignField: '_id', as: 'memberData' } },
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

  private shapeMatchQuery(match: T, input: ProjectsInquiry): void {
    const {
      memberId,
      projectStyleList,
      typeList,
      pricesRange,
      options,
      text,
    } = input.search;
  
    if (memberId) match.memberId = shapeItIntoMongoObjectId(memberId);
    if (projectStyleList) match.projectStyleList = { $in: projectStyleList };
    if (typeList) match.propertyType = { $in: typeList };
  
    if (pricesRange) match.propertyPrice = { $gte: pricesRange.start, $lte: pricesRange.end };  
    if (text) match.propertyTitle = { $regex: new RegExp(text, '') };
  
    if (options)
      match['$or'] = options.map((ele) => {
        return { [ele]: true };
      });
  }
  
  
  public async getAgencyProjects(
    memberId: ObjectId,
    input: AgencyProjectsInquiry
  ): Promise<Projects> {
    if (input.search.projectStatus === ProjectStatus.DELETE)
      throw new BadRequestException(Message.NOT_ALLOWED_REQUEST);
  
    const match: T = {
      memberId,
      propertyStatus: {
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
  
  /* only by admin */
      
  public async getAllProjectsByAdmin(input: AllProjectsInquiry): Promise<Projects> {
    const { projectStatus, projectStyleList } = input.search;
    const match: T = {};
    const sort: T = { [input.sort ?? 'createdAt']: input.direction ?? Direction.DESC };
  
    if (projectStatus) match.propertyStatus = projectStatus;
    if (projectStyleList) match.propertyLocation = { $in: projectStyleList };
  
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
              
  
}
