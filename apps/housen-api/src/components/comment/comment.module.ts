import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentResolver } from './comment.resolver';
import CommentSchema from '../../schemas/Comment.model';
import { AuthModule } from '../auth/auth.module';
import { MemberModule } from '../member/member.module';
import { MongooseModule } from '@nestjs/mongoose';
import { BoardArticleModule } from '../board-article/board-article.module';
import { ProjectModule } from '../project/project.module';

@Module({
  imports:[
    MongooseModule.forFeature([
      {name: "Comment", schema: CommentSchema }
    ]), 
    AuthModule,
    MemberModule,
    ProjectModule,
    BoardArticleModule
  ],
  providers: [CommentResolver, CommentService]
})
export class CommentModule {}
