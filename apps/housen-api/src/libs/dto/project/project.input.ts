import { Field, InputType, Int } from '@nestjs/graphql';
import { IsIn, IsInt, IsNotEmpty, IsOptional, Length, Min } from 'class-validator';
import type { ObjectId } from 'mongoose';
import { ProjectStatus, ProjectStyle, ProjectType } from '../../enums/project.enum';
import { availableOptions, availableProjectSorts } from '../../config';
import { Direction } from '../../enums/common.enum';

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


  @InputType()
export class PricesRange {
  @Field(() => Int)
  start: number;

  @Field(() => Int)
  end: number;
}

@InputType()
export class SquaresRange {
  @Field(() => Int)
  start: number;

  @Field(() => Int)
  end: number;
}

@InputType()
export class PeriodsRange {
  @Field(() => Date)
  start: Date;

  @Field(() => Date)
  end: Date;
}

@InputType()
class PISearch {
  @IsOptional()
  @Field(() => String, { nullable: true })
  memberId?: ObjectId;

  @IsOptional()
  @Field(() => [ProjectStyle], { nullable: true })
  projectStyleList?: ProjectStyle[];

  @IsOptional()
  @Field(() => [ProjectType], { nullable: true })
  typeList?: ProjectType[];

  @IsOptional()
  @IsIn(availableOptions, { each: true })
  @Field(() => [String], { nullable: true })
  options?: string[];

  @IsOptional()
  @Field(() => PricesRange, { nullable: true })
  pricesRange?: PricesRange;

  @IsOptional()
  @Field(() => PeriodsRange, { nullable: true })
  periodsRange?: PeriodsRange;

  @IsOptional()
  @Field(() => String, { nullable: true })
  text?: string;
}
@InputType()
export class ProjectsInquiry {
  @IsNotEmpty()
  @Min(1)
  @Field(() => Int)
  page: number;

  @IsNotEmpty()
  @Min(1)
  @Field(() => Int)
  limit: number;

  @IsOptional()
  @IsIn(availableProjectSorts)
  @Field(() => String, { nullable: true })
  sort?: string;

  @IsOptional()
  @Field(() => Direction, { nullable: true })
  direction?: Direction;

  @IsNotEmpty()
  @Field(() => PISearch)
  search: PISearch;
}


@InputType()
class APISearch {
  @IsOptional()
  @Field(() => ProjectStatus, { nullable: true })
  projectStatus?: ProjectStatus;
}

@InputType()
export class AgencyProjectsInquiry {
  @IsNotEmpty()
  @Min(1)
  @Field(() => Int)
  page: number;

  @IsNotEmpty()
  @Min(1)
  @Field(() => Int)
  limit: number;

  @IsOptional()
  @IsIn(availableProjectSorts)
  @Field(() => String, { nullable: true })
  sort?: string;

  @IsOptional()
  @Field(() => Direction, { nullable: true })
  direction?: Direction;

  @IsNotEmpty()
  @Field(() => APISearch)
  search: APISearch;
}
