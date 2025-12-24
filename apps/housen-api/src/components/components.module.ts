import { Module } from '@nestjs/common';
import { MemberModule } from './member/member.module';
import { ProjectModule } from './project/project.module';
import { AuthModule } from './auth/auth.module';
import { CommentModule } from './comment/comment.module';
import { LikeModule } from './like/like.module';
import { ViewModule } from './view/view.module';
import { FollowModule } from './follow/follow.module';
import { CommunityModule } from './community/community.module';
import { BoardArticleModule } from './board-article/board-article.module';
import { AiModule } from './ai/ai.module';

@Module({
  imports: [
    AiModule,
    MemberModule,
    ProjectModule, 
    AuthModule, 
    CommentModule, 
    LikeModule, 
    ViewModule, 
    FollowModule, 
    CommunityModule, 
    BoardArticleModule
  ]
})
export class ComponentsModule {}
