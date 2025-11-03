import { Field, InputType, Int } from '@nestjs/graphql';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  Length,
  Min,
} from 'class-validator';
import type { ObjectId } from 'mongoose';
import { ProjectStatus, ProjectStyle, ProjectType } from '../../enums/project.enum';

@InputType()
export class ProjectUpdate {
  @IsNotEmpty()
  @Field(() => String)
  _id: ObjectId;

  @IsOptional()
  @Field(() => ProjectType, { nullable: true })
  projectType?: ProjectType;

  @IsOptional()
  @Field(() => ProjectStatus, { nullable: true })
  projectStatus?: ProjectStatus;

  @IsOptional()
  @Field(() => ProjectStyle, { nullable: true })
  projectStyle?: ProjectStyle;

  @IsOptional()
  @Length(3, 100)
  @Field(() => String, { nullable: true })
  projectTitle?: string;

  //  Narxi
  @IsOptional()
  @Field(() => Number, { nullable: true })
  projectPrice?: number;

  @IsOptional()
  @Field(() => Number, { nullable: true })
  projectDuration?: number;


  @IsOptional()
  @Field(() => [String], { nullable: true })
  projectImages?: string[];

  @IsOptional()
  @Length(5, 500)
  @Field(() => String, { nullable: true })
  projectDesc?: string;

  @IsOptional()
  @Field(() => Boolean, { nullable: true })
  projectCollaboration?: boolean;

  @IsOptional()
  @Field(() => Boolean, { nullable: true })
  projectPublic?: boolean;

  deletedAt?: Date;

  
}