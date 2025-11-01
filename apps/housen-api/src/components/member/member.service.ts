import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MemberInput } from '../../libs/dto/member/member.input';
import { Member } from '../../libs/dto/member/member';

@Injectable()
export class MemberService {
    constructor(@InjectModel("Member") private readonly memberModel: Model<null>) {}


    public async signup(input: MemberInput): Promise<Member> {
      try{
          const result = await this.memberModel.create(input)
          return result;
      }catch(err){
          console.log("Error, Service model", err)
          throw new BadRequestException(err)
      }
    }
    
      public async login(): Promise<string> {
        return 'login executed';
      }
    
      public async updateMember(): Promise<string> {
        return 'updateMember executed';
      }
    
      public async getMember(): Promise<string> {
        return 'getMember executed';
      }
}
