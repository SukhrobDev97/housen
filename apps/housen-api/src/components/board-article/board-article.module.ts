import { Module } from '@nestjs/common';
import { BoardArticleResolver } from './board-article.resolver';
import { BoardArticleService } from './board-article.service';
import BoardArticleSchema from '../../schemas/BoardArticle.model';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { MemberModule } from '../member/member.module';
import { ViewModule } from '../view/view.module';
import { LikeModule } from '../like/like.module';

@Module({
  imports:[
    MongooseModule.forFeature([
      {name: "BoardArticle", schema: BoardArticleSchema }
    ]), 
    AuthModule,
    MemberModule,
    ViewModule,
    LikeModule
  ],
  providers: [BoardArticleResolver, BoardArticleService],
  exports: [BoardArticleService]
})
export class BoardArticleModule {}
