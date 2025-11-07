import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';
import type { ObjectId } from 'mongoose';
import { LikeGroup } from '../../enums/like.enum';

@InputType()
export class LikeInput {
	@IsNotEmpty()
	@Field(() => String)
	memberId: ObjectId;

	@IsNotEmpty()
	@Field(() => String)
	likeRefId: ObjectId;

	@IsNotEmpty()
	@Field(() => LikeGroup)
	likeGroup: LikeGroup;
}
