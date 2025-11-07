import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { BoardArticleService } from './board-article.service';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { UseGuards } from '@nestjs/common';
import { BoardArticle, BoardArticles } from '../../libs/dto/board-article/board-article';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AllBoardArticlesInquiry, BoardArticleInput, BoardArticlesInquiry } from '../../libs/dto/board-article/board-article.input';
import type { ObjectId } from 'mongoose';
import { WithoutGuard } from '../auth/guards/without.guard';
import { shapeItIntoMongoObjectId } from '../../libs/config';
import { BoardArticleUpdate } from '../../libs/dto/board-article/board-article-update';
import { MemberType } from '../../libs/enums/member.enum';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import mongoose from 'mongoose';

@Resolver()
export class BoardArticleResolver {
            constructor(private readonly boardArticleService: BoardArticleService) {}
    
        @UseGuards(AuthGuard)
        @Mutation((returns) => BoardArticle)
        public async createBoardArticle(
            @Args('input') input: BoardArticleInput,
            @AuthMember('_id') memberId: ObjectId,
        ): Promise<BoardArticle> {
            console.log('Mutation: createBoardArticle');
            return await this.boardArticleService.createBoardArticle(memberId, input);
        }

        @UseGuards(WithoutGuard)
        @Query((returns) => BoardArticle)
        public async getBoardArticle(
            @Args('articleId') input: string,
            @AuthMember('_id') memberId: ObjectId,
        ): Promise<BoardArticle> {
            console.log('Query: getBoardArticle');
            const articleId = shapeItIntoMongoObjectId(input);
            return await this.boardArticleService.getBoardArticle(memberId, articleId);
        }

        @UseGuards(AuthGuard)
        @Mutation((returns) => BoardArticle)
        public async updateBoardArticle(
             @Args('input') input: BoardArticleUpdate,
             @AuthMember('_id') memberId: ObjectId,
        ): Promise<BoardArticle> {
            console.log('Mutation: updateBoardArticle');
            input._id = shapeItIntoMongoObjectId(input._id);
            return await this.boardArticleService.updateBoardArticle(memberId, input);
            }

        @UseGuards(WithoutGuard)
        @Query(() => BoardArticles)
        public async getBoardArticles(
              @Args('input') input: BoardArticlesInquiry,
              @AuthMember('_id') memberId: ObjectId,
        ): Promise<BoardArticles> {
              console.log('Query: getBoardArticles');
              return await this.boardArticleService.getBoardArticles(memberId, input);
            }
            
         
        @UseGuards(AuthGuard)
        @Mutation(() => BoardArticle)
        public async likeTargetBoardArticle(
            @Args("boardArticleId") input: string,
            @AuthMember('_id') memberId: mongoose.ObjectId
        ): Promise<BoardArticle> {
            console.log('Mutation: likeTargetBoardArticle');
            const likeRefId = shapeItIntoMongoObjectId(input)
            return await this.boardArticleService.likeTargetBoardArticle(memberId,likeRefId);
                
        }

        /* ADMIN only */

        @Roles(MemberType.ADMIN)
        @UseGuards(RolesGuard)
        @Query(() => BoardArticles)
        public async getAllBoardArticlesByAdmin(
          @Args('input') input: AllBoardArticlesInquiry,
          @AuthMember('_id') memberId: ObjectId,
        ): Promise<BoardArticles> {
          console.log('query getAllBoardArticlesByAdmin');
          return await this.boardArticleService.getAllBoardArticlesByAdmin(input);
        }
        
        @Mutation(() => BoardArticle)
        @Roles(MemberType.ADMIN)
        @UseGuards(RolesGuard)
        public async updateBoardArticleByAdmin(
          @Args('input') input: BoardArticleUpdate,
          @AuthMember('_id') memberId: ObjectId,
        ): Promise<BoardArticle> {
          console.log('mutation - updateBoardArticleByAdmin');
          input._id = shapeItIntoMongoObjectId(input._id);
          return await this.boardArticleService.updateBoardArticleByAdmin(input);
        }

        @Roles(MemberType.ADMIN)
        @UseGuards(RolesGuard)
        @Mutation(() => BoardArticle)
        public async removeBoardArticleByAdmin(
            @Args("articleId") input: string,
            @AuthMember("_id") memberId: ObjectId
        ): Promise<BoardArticle> {
             console.log("Mutation: removeBoardArticleByAdmin");
            const articleId = shapeItIntoMongoObjectId(input);
            return await this.boardArticleService.removeBoardArticleByAdmin(articleId);
}


}
