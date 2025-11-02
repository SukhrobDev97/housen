import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { MemberService } from './member.service';
import { LoginInput, MemberInput } from '../../libs/dto/member/member.input';
import { Member } from '../../libs/dto/member/member';
import { UseGuards } from '@nestjs/common';
import mongoose from 'mongoose';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { AuthGuard } from '../auth/guards/auth.guard';
import { MemberType } from '../../libs/enums/member.enum';
import { Roles } from '../auth/decorators/roles.decorator';
import { MemberUpdate } from '../../libs/dto/member/member.update';

@Resolver()
export class MemberResolver {
    constructor( private readonly memberService: MemberService) {}

  @Mutation(() => Member)
  public async signup(@Args('input') input: MemberInput): Promise<Member> {
   
    console.log('Mutation: signup');
   
    return this.memberService.signup(input);
   
  }
  
  @Mutation(() => Member)
  public async login(@Args('input') input: LoginInput): Promise<Member> {    
    
        console.log('Mutation: login');
        return this.memberService.login(input);
      
  }
  
  @UseGuards(AuthGuard)
  @Mutation(() => Member)
  public async updateMember(
    @Args('input') input: MemberUpdate,
    @AuthMember('_id') memberId: mongoose.ObjectId
  ): Promise<Member> {
    console.log('Mutation: updateMember');
    delete input._id;
    return this.memberService.updateMember(memberId, input);
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


  @Query(() => String)
  public async getMember(): Promise<string> {
    console.log('Query: getMember');
    return this.memberService.getMember();
  }

  //Admin only;

  //Authorized Admin;
  @Mutation(() => String)
  public async getAllMembersByAdmin(): Promise<string> {
    console.log('Mutation: getAllMembersByAdmin ');
    return this.memberService.getAllMembersByAdmin();
  }

  //Authorized Admin;
  @Mutation(() => String)
  public async updateMemberByAdmin(): Promise<string> {
    console.log('Mutation: updateMemberByAdmin ');
    return this.memberService.updateMemberByAdmin();
  }

  }
