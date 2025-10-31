import { Module } from '@nestjs/common';
import { MemberResolver } from './member.resolver';
import { MemberService } from './member.service';
import MemberSchema from '../../schemas/Member.model';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports:[MongooseModule.forFeature([{name: "Member", schema: MemberSchema }])],
  providers: [MemberResolver, MemberService]
})
export class MemberModule {}
