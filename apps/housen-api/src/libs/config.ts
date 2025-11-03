import { ObjectId } from 'bson';

export const availableAgencySort = ['createdAt', 'updatedAt', 'memberLikes', 'memberViews', 'memberRank']


export const shapeItIntoMongoObjectId = (target: any) => {
  return typeof target == 'string' ? new ObjectId(target) : target;
};
