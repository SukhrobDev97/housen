import { Module } from '@nestjs/common';
import { ViewService } from './view.service';
import { MongooseModule } from '@nestjs/mongoose';
import ViewSchema from '../../schemas/View.model';

@Module({
  imports:[MongooseModule.forFeature([{name:"view", schema: ViewSchema}])],
  providers: [ViewService],
  exports:[ViewService]
})
export class ViewModule {}
