import { registerEnumType } from '@nestjs/graphql';

export enum ProjectType {
	RESIDENTIAL = 'RESIDENTIAL',
	COMMERCIAL = 'COMMERCIAL',
	OFFICE = 'OFFICE',
	ENTERTAINMENT = 'ENTERTAINMENT'
}
registerEnumType(ProjectType, {
	name: 'ProjectType',
});

export enum ProjectStatus {
	DRAFT = 'DRAFT',
	ACTIVE = 'ACTIVE',
	COMPLETED = 'COMPLETED',
	DELETE = 'DELETE',
}
registerEnumType(ProjectStatus, {
	name: 'ProjectStatus',
});

export enum ProjectStyle {
	MODERN = 'MODERN',
	MINIMAL = 'MINIMAL',
	CLASSIC = 'CLASSIC',
	TRADITIONAL = 'TRADITIONAL',
	INDUSTRIAL = 'INDUSTRIAL',
	SCANDINAVIAN = 'SCANDINAVIAN',
}

registerEnumType(ProjectStyle, {
	name: 'ProjectStyle',
});
