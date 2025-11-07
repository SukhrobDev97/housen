import { ObjectId } from 'bson';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';

export const availableAgencySort = ['createdAt', 'updatedAt', 'memberLikes', 'memberViews', 'memberRank']

export const availableMemberSort = ['createdAt', 'updatedAt', 'memberLikes', 'memberViews']

export const availableOptions = ['projectStarter', 'projectPublic'];
export const availableProjectSorts = [
  'createdAt',
  'updatedAt',
  'projectLikes',
  'projectViews',
  'projectRank',
  'projectPrice',
];

export const availableBoardArticleSorts = ['createdAt', 'updatedAt', 'articleLikes', 'articleViews' ]

export const availableCommentsSorts = ['createdAt', 'updatedAt' ]


/** IMAGE CONFIGURATION **/
export const validMimeTypes = ['image/png', 'image/jpg', 'image/jpeg'];
export const getSerialForImage = (filename: string) => {
	const ext = path.parse(filename).ext;
	return uuidv4() + ext;
};

export const shapeItIntoMongoObjectId = (target: any) => {
  return typeof target == 'string' ? new ObjectId(target) : target;
};

export const lookupMember = {
	$lookup: {
	  from: 'members',
	  localField: 'memberId',
	  foreignField: '_id',
	  as: 'memberData',
	},
  };