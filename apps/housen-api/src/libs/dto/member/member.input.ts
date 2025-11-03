import { Field, InputType, Int } from '@nestjs/graphql';
import { IsIn, IsNotEmpty, IsOptional, Length, Min } from 'class-validator';
import { MemberAuthType, MemberType } from '../../enums/member.enum';
import { Direction } from '../../enums/common.enum';
import { availableAgencySort } from '../../config';

@InputType()
export class MemberInput {
  @IsNotEmpty()
  @Length(3, 12)
  @Field(() => String)
  memberNick: string;

  @IsNotEmpty()
  @Length(5, 12)
  @Field(() => String)
  memberPassword: string;

  @IsNotEmpty()
  @Field(() => String)
  memberPhone: string;

  @IsOptional()
  @Field(() => MemberType, { nullable: true })
  memberType?: MemberType;

  @IsOptional()
  @Field(() => MemberAuthType, { nullable: true })
  memberAuthType?: MemberAuthType;
}



@InputType()
export class LoginInput {
  @IsNotEmpty()
  @Length(3, 12)
  @Field(() => String)
  memberNick: string;

  @IsNotEmpty()
  @Length(5, 12)
  @Field(() => String)
  memberPassword: string;

}


@InputType()
 class AISearch {
  @IsNotEmpty()
  @Field(() => String, {nullable: true})
  text?: string;
 }


@InputType()
export class AgencyInquiry {
  @Min(1)
  @IsNotEmpty()
  @Field(() => Int)
  page: number;

  @IsNotEmpty()
  @Min(1)
  @Field(() => Int)
  limit: number;

  @IsOptional()
  @IsIn(availableAgencySort)
  @Field(() => String, {nullable: true})
  sort?: string;

  @IsOptional()
  @Field(() => Direction, {nullable: true})
  direction?: Direction;

  @IsNotEmpty()
  @Field(() => AISearch)
  search: AISearch;

}

