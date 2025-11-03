import { Resolver } from '@nestjs/graphql';
import { ProjectService } from './project.service';
import { MemberType } from '../../libs/enums/member.enum';
import { Project } from '../../libs/dto/project/project';
import { ProjectInput } from '../../libs/dto/project/project.input';
import { Roles } from '../auth/decorators/roles.decorator';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { Args, Mutation } from '@nestjs/graphql';
import type { ObjectId } from 'mongoose';

@Resolver(() => Project)
export class ProjectResolver {
    constructor(private readonly projectService: ProjectService) {} 
      @Roles (MemberType.AGENCY)
        @UseGuards(AuthGuard)
      @Mutation(() => Project)
      public async createProject(
            @Args('input') input: ProjectInput,
            @AuthMember("_id") memberId: ObjectId
      ): Promise<Project>{
            console.log('Mutation: createProject');
            input.memberId = memberId

            return await this.projectService.createProject(input)
      
    }
}
