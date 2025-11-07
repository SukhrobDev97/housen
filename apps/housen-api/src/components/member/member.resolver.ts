import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { MemberService } from './member.service';
import { AgencyInquiry, LoginInput, MemberInput, MembersInquiry } from '../../libs/dto/member/member.input';
import { Member, Members } from '../../libs/dto/member/member';
import { UseGuards } from '@nestjs/common';
import mongoose from 'mongoose';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { AuthGuard } from '../auth/guards/auth.guard';
import { MemberType } from '../../libs/enums/member.enum';
import { Roles } from '../auth/decorators/roles.decorator';
import { MemberUpdate } from '../../libs/dto/member/member.update';
import { getSerialForImage, shapeItIntoMongoObjectId, validMimeTypes } from '../../libs/config';
import { WithoutGuard } from '../auth/guards/without.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { GraphQLUpload, FileUpload } from 'graphql-upload';
import { createWriteStream } from 'fs';
import { Message } from '../../libs/enums/common.enum';
import { LikeService } from '../like/like.service';
import  { ObjectId } from 'mongoose';

@Resolver()
export class MemberResolver {
    constructor( 
      private readonly memberService: MemberService,
      private readonly likeService: LikeService
    ) {}

  @Mutation(() => Member)
  public async signup(@Args('input') input: MemberInput): Promise<Member> {
   
    console.log('Mutation: signup');
   
    return await this.memberService.signup(input);
   
  }
  
  @Mutation(() => Member)
  public async login(@Args('input') input: LoginInput): Promise<Member> {    
    
        console.log('Mutation: login');
        return await this.memberService.login(input);
      
  }
  
  @UseGuards(AuthGuard)
  @Query(() => String)
  public async checkAuth(@AuthMember('memberNick') memberNick: string ): Promise<string> {
    console.log('Query: checkAuth');
    console.log('memberNick:', memberNick)
    return `Hi ${memberNick}`
  }

  @Roles (MemberType.ADMIN, MemberType.USER)
  @UseGuards(AuthGuard)
  @Query(() => String)
  public async checkAuthRoles(@AuthMember() authMember: Member ): Promise<string> {
    console.log('Query: checkAuthRoles');
    return `Hi ${authMember.memberNick}, you are ${authMember.memberType} (member_id) ${authMember._id}`
  }

  @UseGuards(AuthGuard)
  @Mutation(() => Member)
  public async updateMember(
    @Args('input') input: MemberUpdate,
    @AuthMember('_id') memberId: mongoose.ObjectId
  ): Promise<Member> {
    console.log('Mutation: updateMember');
    delete input._id;
    return await this.memberService.updateMember(memberId, input);
  }


  @UseGuards(WithoutGuard)
  @Query(() => Member)
  public async getMember(
    @Args("memberId") input: string,
    @AuthMember('_id') memberId: mongoose.ObjectId
  ): Promise<Member> {
    console.log('Query: getMember');
    const targetId = shapeItIntoMongoObjectId(input)
    return await this.memberService.getMember(memberId, targetId);
  }

  @UseGuards(WithoutGuard)
  @Query(() => Members)
  public async getAgencies(
    @Args("input") input: AgencyInquiry,
    @AuthMember('_id') memberId: mongoose.ObjectId
  ): Promise<Members> {
    console.log('Query: getAgencies');
    
    return this.memberService.getAgencies(memberId, input);
  }


  @UseGuards(AuthGuard)
  @Mutation(() => Member)
  public async likeTargetMember(
    @Args("memberId") input: string,
    @AuthMember('_id') memberId: mongoose.ObjectId
  ): Promise<Member> {
    console.log('Query: getMember');
    const likeRefId = shapeItIntoMongoObjectId(input)
    return await this.memberService.likeTargetMember(memberId,likeRefId);
  }


  //Admin only;

  @Roles (MemberType.ADMIN)
  @UseGuards(RolesGuard)
  @Query(() => Members)
  public async getAllMembersByAdmin(
    @Args("input") input: MembersInquiry
  ): Promise<Members> {
    console.log('Query: getAllMembersByAdmin');
    return await this.memberService.getAllMembersByAdmin(input);
  }
  
  //Authorized Admin;
  @Roles (MemberType.ADMIN)
  @UseGuards(RolesGuard)
  @Mutation(() => Member)
  public async updateMemberByAdmin(@Args('input') input: MemberUpdate): Promise<Member> {
    console.log('Mutation: updateMemberByAdmin ');
    return await this.memberService.updateMemberByAdmin(input);
  }


/** IMAGE UPLOADER  **/

@UseGuards(AuthGuard)
@Mutation((returns) => String)
public async imageUploader(
	@Args({ name: 'file', type: () => GraphQLUpload })
{ createReadStream, filename, mimetype }: FileUpload,
@Args('target') target: String,
): Promise<string> {
	console.log('Mutation: imageUploader');

	if (!filename) throw new Error(Message.UPLOAD_FAILED);
const validMime = validMimeTypes.includes(mimetype);
if (!validMime) throw new Error(Message.PROVIDE_ALLOWED_FORMAT);

const imageName = getSerialForImage(filename);
const url = `uploads/${target}/${imageName}`;
const stream = createReadStream();

const result = await new Promise((resolve, reject) => {
	stream
		.pipe(createWriteStream(url))
		.on('finish', async () => resolve(true))
		.on('error', () => reject(false));
});
if (!result) throw new Error(Message.UPLOAD_FAILED);

return url;
}

@UseGuards(AuthGuard)
@Mutation((returns) => [String])
public async imagesUploader(
	@Args('files', { type: () => [GraphQLUpload] })
files: Promise<FileUpload>[],
@Args('target') target: String,
): Promise<string[]> {
	console.log('Mutation: imagesUploader');

	const uploadedImages: string[] = [];
	const promisedList = files.map(async (img: Promise<FileUpload>, index: number): Promise<Promise<void>> => {
		try {
			const { filename, mimetype, encoding, createReadStream } = await img;

			const validMime = validMimeTypes.includes(mimetype);
			if (!validMime) throw new Error(Message.PROVIDE_ALLOWED_FORMAT);

			const imageName = getSerialForImage(filename);
			const url = `uploads/${target}/${imageName}`;
			const stream = createReadStream();

			const result = await new Promise((resolve, reject) => {
				stream
					.pipe(createWriteStream(url))
					.on('finish', () => resolve(true))
					.on('error', () => reject(false));
			});
			if (!result) throw new Error(Message.UPLOAD_FAILED);

			uploadedImages[index] = url;
		} catch (err) {
			console.log('Error, file missing!');
		}
	});

	await Promise.all(promisedList);
	return uploadedImages;
}



  }
