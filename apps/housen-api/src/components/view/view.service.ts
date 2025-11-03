import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { View } from '../../libs/dto/view/view';
import { ViewInput } from '../../libs/dto/view/view.input';
import { T } from '../../libs/types/common';

@Injectable()
export class ViewService {
    constructor (@InjectModel("view") private readonly viewModel: Model<View>) {}

    public async recordView(input: ViewInput):Promise<View | null>{
        const viewExist = await this.checkViewExictance(input);
        if(!viewExist) {
            console.log(" - New View Insert - ");
            return await this.viewModel.create(input)
        }else return null
    }

    private async checkViewExictance(input: ViewInput): Promise<View | null>{
        const {memberId, viewRefId} = input;
        const search: T = {memberId: memberId, viewRefId: viewRefId}
        return await this.viewModel.findOne(search).exec();
    }
}
