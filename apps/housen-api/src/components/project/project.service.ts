import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ProjectInput } from '../../libs/dto/project/project.input';
import { Project } from '../../libs/dto/project/project';
import { Message } from '../../libs/enums/common.enum';
import { MemberService } from '../member/member.service';

@Injectable()
export class ProjectService {
    constructor(     
        @InjectModel("Project") private readonly projectModel: Model<Project>,
        private memberService: MemberService
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
  
}
