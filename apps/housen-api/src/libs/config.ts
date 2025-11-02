import { ObjectId } from 'bson';

export const shapeItIntoMongoObjectId = (target: any) => {
  return typeof target == 'string' ? new ObjectId(target) : target;
};
