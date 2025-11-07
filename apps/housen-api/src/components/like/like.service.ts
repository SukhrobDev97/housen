import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Like } from '../../libs/dto/like/like';
import { Model } from 'mongoose';

@Injectable()
export class LikeService {
    constructor (@InjectModel('Like') private readonly likeModel: Model<Like>) {}

}
