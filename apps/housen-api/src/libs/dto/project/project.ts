import { Field, Int, ObjectType } from "@nestjs/graphql";
import type { ObjectId } from "mongoose";
import { ProjectStatus, ProjectStyle, ProjectType } from "../../enums/project.enum";
import { Member } from "../member/member";

@ObjectType()
export class Project {
    @Field(() => String)
    _id: ObjectId;
  
    @Field(() => ProjectType)
    projectType: ProjectType;

    @Field(() => ProjectStyle)
    projectStyle: ProjectStyle;
  
    @Field(() => ProjectStatus)
    projectStatus: ProjectStatus;
  
    @Field(() => String)
    projectTitle: string;
  
    @Field(() => Number)
    projectPrice: number;

    @Field(() => Number)
    projectDuration: number;
  
    @Field(() => Int)
    projectViews: number;
  
    @Field(() => Int)
    projectLikes: number;
  
    @Field(() => Int)
    projectComments: number;
  
    @Field(() => Int)
    projectRank: number;
  
    @Field(() => [String])
    projectImages: string[];
  
    @Field(() => String, { nullable: true })
    projectDesc?: string;
  
    @Field(() => Boolean)
    projectCollaboration: boolean;
  
    @Field(() => Boolean)
    projectPublic: boolean;
  
    @Field(() => String)
    memberId: ObjectId;
  
    @Field(() => Date, { nullable: true })
    deletedAt?: Date;
  
    @Field(() => Date, { nullable: true })
    constructedAt?: Date;
  
    @Field(() => Date)
    createdAt: Date;
  
    @Field(() => Date)
    updatedAt: Date;

    @Field(() => Member, { nullable: true })
    memberData?: Member
  }