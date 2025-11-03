import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { ViewModule } from '../view/view.module';
import { ProjectResolver } from './project.resolver';
import { ProjectService } from './project.service';
import ProjectSchema from '../../schemas/Project.model';

@Module({
    imports:[
        MongooseModule.forFeature([
          {name: "Project", schema: ProjectSchema }
        ]), 
        AuthModule,
        ViewModule,
      ],
    providers: [ProjectResolver, ProjectService],
})
export class ProjectModule {}
