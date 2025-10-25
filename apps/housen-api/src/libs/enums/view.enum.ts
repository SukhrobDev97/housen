import { registerEnumType } from '@nestjs/graphql';

export enum ViewGroup {
	MEMBER = 'MEMBER',
	ARTICLE = 'ARTICLE',
	PROJECT = 'PROJECT',
}
registerEnumType(ViewGroup, {
	name: 'ViewGroup',
});
