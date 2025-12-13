import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { View } from '../../libs/dto/view/view';
import { ViewInput } from '../../libs/dto/view/view.input';
import { T } from '../../libs/types/common';
import { OrdinaryInquiry } from '../../libs/dto/project/project.input';
import { Projects } from '../../libs/dto/project/project';
import { ViewGroup } from '../../libs/enums/view.enum';
import { lookupVisit, shapeItIntoMongoObjectId } from '../../libs/config';

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

    public async getVisitedProjects(memberId: ObjectId, input: OrdinaryInquiry): Promise<Projects> {
        const { page, limit } = input;
        const match = { viewGroup: ViewGroup.PROJECT, memberId: shapeItIntoMongoObjectId(memberId) };
        
        console.log('getVisitedProjects match:', match);
      
        const data: T = await this.viewModel
        
          .aggregate([
            { $match: match },
            { $sort: { updatedAt: -1 } },
            {
              $lookup: {
                from: 'projects',
                localField: 'viewRefId',
                foreignField: '_id',
                as: 'visitedProject',
              },
            },
            { $unwind: '$visitedProject' },
            {
                $facet:{
                    list: [{$skip: (page -1) * limit}, 
                    {$limit: limit}, 
                    lookupVisit,
                    { $unwind: '$visitedProject.memberData' }],
                    metaCounter: [{$count: "total"}]
                }
            }
          ])
          .exec();
          const result : Projects = {list :[], metaCounter: data[0].metaCounter}
          result.list = data[0].list.map((ele) => ele.visitedProject)
        console.log('data', data);
        return result;
      }
}
