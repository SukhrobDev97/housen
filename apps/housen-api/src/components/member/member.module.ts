import { Module } from '@nestjs/common';
import { MemberResolver } from './member.resolver';
import { MemberService } from './member.service';
import MemberSchema from '../../schemas/Member.model';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports:[MongooseModule.forFeature([{name: "Member", schema: MemberSchema }]), AuthModule],
  providers: [MemberResolver, MemberService]
})
export class MemberModule {}
