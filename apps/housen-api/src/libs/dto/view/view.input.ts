import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty} from 'class-validator';
import { ViewGroup } from '../../enums/view.enum';
import type { ObjectId } from 'mongoose';

@InputType()
export class ViewInput {

  @IsNotEmpty()
  @Field(() => String)
  memberId: ObjectId;

  @IsNotEmpty()
  @Field(() => String)
  viewRefId: ObjectId;

  @IsNotEmpty()
  @Field(() => ViewGroup)
  viewGroup: ViewGroup;
}

