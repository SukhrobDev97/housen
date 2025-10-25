import { Schema } from 'mongoose';
import { ViewGroup } from '../libs/enums/view.enum';

const LikeSchema = new Schema(
	{
		likeGroup: {
			type: String,
			enum: ViewGroup,
			required: true,
		},

		likeRefId: {
			type: Schema.Types.ObjectId,
			required: true,
		},
		
		memberId: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: 'Member',
		},
	},
	{ timestamps: true, collection: 'likes' },
);

LikeSchema.index({ memberId: 1, likeRefId: 1 }, { unique: true });

export default LikeSchema;
