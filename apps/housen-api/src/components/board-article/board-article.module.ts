import { Module } from '@nestjs/common';
import { BoardArticleResolver } from './board-article.resolver';
import { BoardArticleService } from './board-article.service';

@Module({
  providers: [BoardArticleResolver, BoardArticleService]
})
export class BoardArticleModule {}
