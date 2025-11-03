import { Field, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsNotEmpty, IsOptional, Length, Min } from 'class-validator';
import type { ObjectId } from 'mongoose';
import { ProjectStyle, ProjectType } from '../../enums/project.enum';

@InputType()
export class ProjectInput {
    @IsNotEmpty()
    @Field(() => ProjectType)
    propertyType: ProjectType;
  
    @IsNotEmpty()
    @Field(() => ProjectStyle)
    projectStyle: ProjectStyle;
  
    @IsNotEmpty()
    @Length(3, 100)
    @Field(() => String)
    projectTitle: string;
  
    @IsNotEmpty()
    @Field(() => Number)
    projectPrice: number;

    @IsNotEmpty()
    @Field(() => Number)
    projectDuration: number;
  
    @IsNotEmpty()
    @Field(() => [String])
    projectImages: string[];
  
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
  
    @IsOptional()
    @Field(() => String, { nullable: true })
    memberId?: ObjectId;
  
  }