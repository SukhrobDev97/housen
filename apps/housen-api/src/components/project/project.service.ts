import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class ProjectService {
    constructor(     
        @InjectModel("Project") private readonly projectModel: Model<null>,
   ){}
}
