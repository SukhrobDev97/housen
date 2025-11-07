import { ObjectId } from 'bson';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import { T } from './types/common';

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


export const lookupAuthMemberLiked = (memberId: T, targetRefId: string = '$_id') => {
  return{
    $lookup: {
      from: 'likes',
      let: {
        localLikeRefId: targetRefId,
        localMemberId: memberId,
        localMyFavorite: true,
      },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [
                { $eq: ['$likeRefId', '$$localLikeRefId'] },
                { $eq: ['$memberId', '$$localMemberId'] },
              ],
            },
          },
        },
        {
          $project: {
            _id: 0,
            memberId: 1,
            likeRefId: 1,
            myFavorite: '$$localMyFavorite',
          },
        },
      ],
      as: 'meLiked',
    },
  }
};



interface LookupAuthMemberFollowed {
  followerId: T;
  followingId: string;
}

export const lookupAuthMemberFollowed = (input: LookupAuthMemberFollowed) => {
  const { followerId, followingId } = input;

  return {
    $lookup: {
      from: 'follows',
      let: {
        localFollowerId: followerId,
        localFollowingId: followingId,
        localMyFavorite: true,
      },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [
                { $eq: ['$followerId', '$$localFollowerId'] },
                { $eq: ['$followingId', '$$localFollowingId'] },
              ],
            },
          },
        },
        {
          $project: {
            _id: 0,
            followerId: 1,
            followingId: 1,
            myFollowing: '$$localMyFavorite',
          },
        },
      ],
      as: 'meFollowed',
    },
  };
};


export const lookupMember = {
	$lookup: {
	  from: 'members',
	  localField: 'memberId',
	  foreignField: '_id',
	  as: 'memberData',
	},
  };

  export const lookupFollowingData = {
    $lookup: {
      from: 'members',
      localField: 'followingId',
      foreignField: '_id',
      as: 'followingData',
    },
    };

export const lookupFollowerData = {
	$lookup: {
	  from: 'members',
	  localField: 'followerId',
	  foreignField: '_id',
	  as: 'followerData',
	},
  };