import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Like } from '../../libs/dto/like/like';
import { Model } from 'mongoose';
import { Message } from '../../libs/enums/common.enum';
import { T } from '../../libs/types/common';
import { LikeInput } from '../../libs/dto/like/like.input';

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

}
