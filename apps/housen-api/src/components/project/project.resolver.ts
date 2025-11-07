import { Query, Resolver } from '@nestjs/graphql';
import { ProjectService } from './project.service';
import { MemberType } from '../../libs/enums/member.enum';
import { Project, Projects } from '../../libs/dto/project/project';
import { AgencyProjectsInquiry, AllProjectsInquiry, ProjectInput, ProjectsInquiry } from '../../libs/dto/project/project.input';
import { Roles } from '../auth/decorators/roles.decorator';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { Args, Mutation } from '@nestjs/graphql';
import type { ObjectId } from 'mongoose';
import { WithoutGuard } from '../auth/guards/without.guard';
import { shapeItIntoMongoObjectId } from '../../libs/config';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ProjectUpdate } from '../../libs/dto/project/project.update';

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

    @UseGuards(WithoutGuard)
      @Query(() => Project)
      public async getProject(
            @Args('projectId', { type: () => String }) input : string,
            @AuthMember('_id') memberId: ObjectId
      ): Promise<Project> {
            console.log("Query: getProject");

            const projectId = shapeItIntoMongoObjectId(input)
            return await this.projectService.getProject(memberId, projectId)
      }

    
      @Roles(MemberType.AGENCY)
      @UseGuards(RolesGuard)
      @Mutation(() => Project)
      public async updateProject(
            @Args('input') input: ProjectUpdate,
            @AuthMember('_id') memberId: ObjectId,
      ): Promise<Project>{ 
            console.log('Mutation: updateProject');
            input._id = shapeItIntoMongoObjectId(input._id);
            return await this.projectService.updateProject(memberId, input);
            
        }

      @UseGuards(WithoutGuard)
      @Query(() => Projects)
      public async getProjects(
            @Args('input') input: ProjectsInquiry,
            @AuthMember('_id') memberId: ObjectId,
      ): Promise<Projects> {
            console.log('Query: getProperties');
            return await this.projectService.getProjects(memberId, input);
      }


      @Roles(MemberType.AGENCY)
      @UseGuards(RolesGuard)
      @Query(() => Projects)
      public async getAgencyProjects(
            @Args('input') input: AgencyProjectsInquiry,
            @AuthMember('_id') memberId: ObjectId
      ): Promise<Projects> {
            console.log('Query: getAgencyProjects');
            return await this.projectService.getAgencyProjects(memberId, input);
      }

      /* only by admin */
      @Roles(MemberType.ADMIN)
      @UseGuards(RolesGuard)
      @Query((returns) => Projects)
      public async getAllProjectsByAdmin(
            @Args('input') input: AllProjectsInquiry,
            @AuthMember('_id') memberId: ObjectId,
      ): Promise<Projects> {
            console.log('Query: getAllProjectsByAdmin');
            return await this.projectService.getAllProjectsByAdmin(input);
      }

      @Roles(MemberType.ADMIN)
      @UseGuards(RolesGuard)
      @Mutation((returns) => Project)
      public async updateProjectByAdmin(@Args('input') input: ProjectUpdate): Promise<Project> {
            console.log('Mutation: updateProjectByAdmin');
            input._id = shapeItIntoMongoObjectId(input._id);
            return await this.projectService.updateProjectByAdmin(input);
      }


      @Roles(MemberType.ADMIN)
      @UseGuards(RolesGuard)
      @Mutation(() => Project)
      public async removeProjectByAdmin(@Args('projectId') input: string): Promise<Project> {
            console.log('Mutation: removeProjectByAdmin');
            const projectId = shapeItIntoMongoObjectId(input);
            return await this.projectService.removeProjectByAdmin(projectId);
      }


}
