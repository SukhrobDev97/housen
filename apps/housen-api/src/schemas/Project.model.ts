import { Schema } from 'mongoose';
import { ProjectStatus, ProjectStyle, ProjectType } from '../libs/enums/project.enum';

const ProjectSchema = new Schema(
	{
		projectType: {
			type: String,
			enum: ProjectType,
			required: true,
		},

		projectStatus: {
			type: String,
			enum: ProjectStatus,
			default: ProjectStatus.ACTIVE,
		},

		projectStyle: {
			type: String,
			enum: ProjectStyle,
			required: true,
		},

		projectTitle: {
			type: String,
			required: true,
		},

		projectPrice: {
			type: Number,
			required: true,
		},

		projectDuration: {
			type: Number,
			required: true,
		},

		projectViews: {
			type: Number,
			default: 0,
		},

		projectLikes: {
			type: Number,
			default: 0,
		},

		projectComments: {
			type: Number,
			default: 0,
		},

		projectRank: {
			type: Number,
			default: 0,
		},

		projectImages: {
			type: [String],
			required: true,
		},

		projectDesc: {
			type: String,
		},

		projectCollaboration: {
			type: Boolean,
			default: false,
		},

		projectPublic: {
			type: Boolean,
			default: false,
		},

		memberId: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: 'Member',
		},

		constructedAt: {
			type: Date,
		},

		deletedAt: {
			type: Date,
		},

		
	},
	{ timestamps: true, collection: 'projects' },
);

ProjectSchema.index({ projectType: 1, projectStyle: 1, projectTitle: 1, projectPrice: 1 }, { unique: true });

export default ProjectSchema;
