import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Like, MeLiked } from '../../libs/dto/like/like';
import { Model, ObjectId } from 'mongoose';
import { Message } from '../../libs/enums/common.enum';
import { T } from '../../libs/types/common';
import { LikeInput } from '../../libs/dto/like/like.input';
import { Projects } from '../../libs/dto/project/project';
import { OrdinaryInquiry } from '../../libs/dto/project/project.input';
import { LikeGroup } from '../../libs/enums/like.enum';
import { lookupFavorite } from '../../libs/config';

@Injectable()
export class LikeService {
    constructor (@InjectModel('Like') private readonly likeModel: Model<Like>) {}

    public async toggleLike(input: LikeInput): Promise<number>{
        const search :T ={
            memberId: input.memberId,
            likeRefId: input.likeRefId 
        }
        const exist  = await this.likeModel.findOne(search).exec();
        let modifier = 1;

        if(exist) {
            await this.likeModel.findOneAndDelete(search).exec()
            modifier = -1;
        }else{
            try{
                await this.likeModel.create(input)
            } catch(err){
                console.log("Error, Service.model:", err.message);
                throw new BadRequestException(Message.CREATE_FAILED)
            }
        }
        console.log(`-Like modifier ${modifier} -` )
        return modifier;
    }


    public async checkLikeExistence(input: LikeInput): Promise<MeLiked[]> {
        const { memberId, likeRefId } = input;
        const result = await this.likeModel.findOne({ memberId: memberId, likeRefId: likeRefId }).exec();
        return result ? [{ memberId: memberId, likeRefId: likeRefId, myFavorite: true }] : [];
      }
    
      public async getFavoriteProjects(memberId: ObjectId, input: OrdinaryInquiry): Promise<Projects> {
        const { page, limit } = input;
        const match = { likeGroup: LikeGroup.PROJECT, memberId: memberId };
      
        const data: T = await this.likeModel
          .aggregate([
            { $match: match },
            { $sort: { updatedAt: -1 } },
            {
              $lookup: {
                from: 'projects',
                localField: 'likeRefId',
                foreignField: '_id',
                as: 'favoriteProject',
              },
            },
            { $unwind: '$favoriteProject' },
            {
                $facet:{
                    list: [{$skip: (page -1) * limit}, 
                    {$limit: limit}, 
                    lookupFavorite,
                    { $unwind: '$favoriteProject.memberData' }],
                    metaCounter: [{$count: "total"}]
                }
            }
          ])
          .exec();

          const result : Projects = {list :[], metaCounter: data[0].metaCounter}
          result.list = data[0].list.map((ele) => ele.favoriteProject)
        console.log('data', data);
        return result;
      }
      
}
