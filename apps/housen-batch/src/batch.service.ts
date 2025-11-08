import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Member } from 'apps/housen-api/src/libs/dto/member/member';
import { Project } from 'apps/housen-api/src/libs/dto/project/project';
import { MemberStatus, MemberType } from 'apps/housen-api/src/libs/enums/member.enum';
import { ProjectStatus } from 'apps/housen-api/src/libs/enums/project.enum';
import { Model } from 'mongoose';

@Injectable()
export class BatchService {
    constructor(
        @InjectModel("Project") private readonly projectModel: Model<Project>,
        @InjectModel("Member") private readonly memberModel: Model<Member>
    
      ){}
    
      public getHello(): string {
        return 'Welcome to Nestar BATCH Server!';
      }
    
      public async batchRollback(): Promise<void> {
        await this.projectModel
        .updateMany(
          {
            projectStatus: ProjectStatus.ACTIVE,
          },
          {
            projectRank: 0,
          }
        )
        .exec();
    
      await this.memberModel
        .updateMany(
          {
            memberStatus: MemberStatus.ACTIVE,
            memberType: MemberType.AGENCY,
          },
          {
            memberRank: 0,
          }
        )
        .exec();
      }
    
      public async batchTopProjects(): Promise<void> {
        const projects: Project[] = await this.projectModel
        .find({
          projectStatus: ProjectStatus.ACTIVE,
          projectRank: 0,
        })
        .exec();
    
        const promisedList = projects.map(async (ele: Project) => {
          const { _id, projectLikes, projectViews } = ele;
          const rank = projectLikes * 2 + projectViews * 1;
          return await this.projectModel.findByIdAndUpdate(_id, { projectRank: rank });
        });
    
        await Promise.all(promisedList);
        
      }
    
      public async batchTopAgencies(): Promise<void> {
        const agencies: Member[] = await this.memberModel
        .find({
          memberType: MemberType.AGENCY,
          memberStatus: MemberStatus.ACTIVE,
          memberRank: 0,
        })
        .exec();
    
        const promisedList = agencies.map(async (ele: Member) => {
          const { _id, memberProjects, memberLikes, memberArticles, memberViews } = ele;
          const rank = memberProjects * 4 + memberArticles * 3 + memberLikes * 2 + memberViews * 1;
          return await this.memberModel.findByIdAndUpdate(_id, { memberRank: rank });
        });
    
        await Promise.all(promisedList);
      }
}

