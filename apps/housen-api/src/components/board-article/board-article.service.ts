import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { BoardArticle, BoardArticles } from '../../libs/dto/board-article/board-article';
import { Model, ObjectId } from 'mongoose';
import { MemberService } from '../member/member.service';
import { ViewService } from '../view/view.service';
import { AllBoardArticlesInquiry, BoardArticleInput, BoardArticlesInquiry } from '../../libs/dto/board-article/board-article.input';
import { Direction, Message } from '../../libs/enums/common.enum';
import { ViewGroup } from '../../libs/enums/view.enum';
import { BoardArticleStatus } from '../../libs/enums/board-article.enum';
import { StatisticModifier, T } from '../../libs/types/common';
import { lookupMember, shapeItIntoMongoObjectId } from '../../libs/config';
import { BoardArticleUpdate } from '../../libs/dto/board-article/board-article-update';
import { LikeService } from '../like/like.service';
import { LikeInput } from '../../libs/dto/like/like.input';
import { LikeGroup } from '../../libs/enums/like.enum';


@Injectable()
export class BoardArticleService {
    constructor(     
            @InjectModel("BoardArticle") private readonly boardArticleModel: Model<BoardArticle>,
            private memberService: MemberService,
            private viewService: ViewService,
            private likeService: LikeService,
        ){}

        public async createBoardArticle(
            memberId: ObjectId,
            input: BoardArticleInput,
          ): Promise<BoardArticle> {
            input.memberId = memberId;
            try {
              const result = await this.boardArticleModel.create(input);
              await this.memberService.memberStatsEditor(
                {
                  _id: memberId,
                  targetKey: 'memberArticles',
                  modifier: 1,
                },
              );
          
              return result;
            } catch (err) {
              console.log('Error, Service.model:', err.message);
              throw new BadRequestException(Message.CREATE_FAILED);
            }
          }
          
          public async getBoardArticle(
            memberId: ObjectId,
            articleId: ObjectId,
          ): Promise<BoardArticle> {
            const search: T = {
              _id: articleId,
              articleStatus: BoardArticleStatus.ACTIVE,
            };
          
            const targetBoardArticle : BoardArticle | null = await this.boardArticleModel.findOne(search).lean().exec() ;
            if (!targetBoardArticle) throw new InternalServerErrorException(Message.NO_DATA_FOUND);
          
            if (memberId) {
              const viewInput = { memberId: memberId, viewRefId: articleId, viewGroup: ViewGroup.ARTICLE };
              const newView = await this.viewService.recordView(viewInput);
              if (!newView) {
                await this.boardArticleStatsEditor({ _id: articleId, targetKey: 'articleViews', modifier: 1 });
                targetBoardArticle.articleViews++;
              }

              const likeInput = {memberId: memberId, likeRefId: articleId , likeGroup: LikeGroup.ARTICLE}
              targetBoardArticle.meLiked = await this.likeService.checkLikeExistence(likeInput)                
             
              // meLiked
            }
          
            const memberData = await this.memberService.getMember(null, targetBoardArticle.memberId);
            (targetBoardArticle as any).memberData = memberData;
            return targetBoardArticle;
          }
          

          public async boardArticleStatsEditor(input: StatisticModifier): Promise<BoardArticle | null> {
            const { _id, targetKey, modifier } = input;
            return await this.boardArticleModel
              .findOneAndUpdate(
                { _id },
                { $inc: { [targetKey]: modifier } },
                { new: true },
              )
              .exec();
          }

          public async updateBoardArticle(
            memberId: ObjectId,
            input: BoardArticleUpdate,
          ): Promise<BoardArticle> {
            const { _id, articleStatus } = input;
          
            try {
              const result = await this.boardArticleModel
                .findOneAndUpdate(
                  { _id, memberId, articleStatus: BoardArticleStatus.ACTIVE },
                  input,
                  { new: true },
                )
                .exec();
          
              if (!result) {
                throw new InternalServerErrorException(Message.UPDATE_FAILED);
              }
          
              // agar maqola o'chirildi deb belgilanayotgan bo'lsa — member statistikani yangilash
              if (articleStatus === BoardArticleStatus.DELETE) {
                await this.memberService.memberStatsEditor({
                  _id: memberId,
                  targetKey: 'memberArticles',
                  modifier: -1,
                });
              }
          
              return result as unknown as BoardArticle;
            } catch (err) {
              console.log('Error, Service.model:', err?.message ?? err);
              throw new BadRequestException(Message.UPDATE_FAILED);
            }
          }

          public async getBoardArticles(memberId: ObjectId, input: BoardArticlesInquiry): Promise<BoardArticles> {
            const {articleCategory, text} = input.search
            const match: T = {
              articleStatus: BoardArticleStatus.ACTIVE,
            };
            const sort: T = {
              [input.sort ?? 'createdAt']: input?.direction ?? Direction.DESC,
            };
          
            if (articleCategory) match.articleCategory = articleCategory;
            if (text) match.articleTitle = { $regex: new RegExp(text, 'i') };
            if (input.search?.memberId) match.memberId = shapeItIntoMongoObjectId(input.search.memberId);
          
            console.log('match', match);
          
            const result = await this.boardArticleModel.aggregate([
              { $match: match },
              { $sort: sort },
              {
                $facet: {
                  list: [
                    { $skip: (input.page - 1) * input.limit },
                    { $limit: input.limit },
                    {
                      $lookup: {
                        from: 'member',
                        localField: 'memberId',
                        foreignField: '_id',
                        as: 'memberData',
                      },
                    },
                    { $unwind: '$memberData' },
                  ],
                  metaCounter: [{ $count: 'total' }],
                },
              },
            ]).exec();
          
            if (!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);
          
            return result[0];
          }

        
          public async likeTargetBoardArticle ( memberId: ObjectId, likeRefId: ObjectId ): Promise<BoardArticle>{
            const target: BoardArticle | null = await this.boardArticleModel.findOne({_id: likeRefId, boardArticleStatus: BoardArticleStatus.ACTIVE}).exec()
            if(!target) throw new InternalServerErrorException(Message.NO_DATA_FOUND)
            
            const input : LikeInput = {
              memberId: memberId,
              likeRefId: likeRefId,
              likeGroup: LikeGroup.ARTICLE
            }
    
            const modifier: number = await this.likeService.toggleLike(input)
            const result =  await this.boardArticleStatsEditor({_id: likeRefId, targetKey: "articleLikes", modifier: modifier})
            if(!result) throw new InternalServerErrorException(Message.SOMETHING_WENT_WRONG)
    
            return result
        }            

          /*ADMIN only */
          
          public async getAllBoardArticlesByAdmin(input: AllBoardArticlesInquiry): Promise<BoardArticles> {
            const { articleStatus, articleCategory } = input.search;
            const match :T = {}
            const sortT: T = { [input.sort ?? 'createdAt']: input.direction ?? Direction.DESC };
          
            if (articleStatus) match.articleStatus = articleStatus;
            if (articleCategory) match.articleCategory = articleCategory;
          
            const result = await this.boardArticleModel
              .aggregate([
                { $match: match },
                { $sort: sortT },
                {
                  $facet: {
                    list: [
                      { $skip: (input.page - 1) * input.limit },
                      { $limit: input.limit },
                      lookupMember,
                      { $unwind: '$memberData' },
                    ],
                    metaCounter: [{ $count: 'total' }],
                  },
                },
              ])
              .exec();
          
            if (!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);
          
            return result[0];
          }
          

        public async updateBoardArticleByAdmin(input: BoardArticleUpdate): Promise<BoardArticle> {
            const { _id, articleStatus } = input;
          
            const result = await this.boardArticleModel
              .findByIdAndUpdate({ _id, articleStatus: BoardArticleStatus.ACTIVE }, input, {
                new: true,
              })
              .exec();
          
            if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);
          
            if (articleStatus === BoardArticleStatus.DELETE) {
              await this.memberService.memberStatsEditor({
                _id: result.memberId,
                targetKey: 'memberArticles',
                modifier: -1,
              });
            }
          
            return result;
          }

            // board-article.service.ts
        public async removeBoardArticleByAdmin(articleId: ObjectId): Promise<BoardArticle> {
            const search: T = { _id: articleId, articleStatus: BoardArticleStatus.DELETE };
            const result = await this.boardArticleModel.findOneAndDelete(search).exec();
            if (!result) throw new InternalServerErrorException(Message.REMOVE_FAILED);
            return result;
        }            
                      
}