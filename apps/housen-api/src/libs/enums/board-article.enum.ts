import { registerEnumType } from '@nestjs/graphql';

export enum BoardArticleCategory {
	FREE = 'FREE',
	RECOMMEND = 'RECOMMEND',
	NEWS = 'NEWS',
	HUMOR = 'HUMOR',
}
registerEnumType(BoardArticleCategory, {
	name: 'BoardArticleCategory',
});

export enum BoardArticleStatus {
	ACTIVE = 'ACTIVE',
	DELETE = 'DELETE',
}
registerEnumType(BoardArticleStatus, {
	name: 'BoardArticleStatus',
});
