import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { ScheduleModule } from '@nestjs/schedule';
import { BatchController } from './batch.controller';
import { BatchService } from './batch.service';
import { MongooseModule } from '@nestjs/mongoose';
import MemberSchema from 'apps/housen-api/src/schemas/Member.model';
import ProjectSchema from 'apps/housen-api/src/schemas/Project.model';

@Module({
  imports: [
    ConfigModule.forRoot(),
    DatabaseModule,
    ScheduleModule.forRoot(),
    MongooseModule.forFeature([
      { name: 'Project', schema: ProjectSchema },
      { name: 'Member', schema: MemberSchema },
    ]),
  ],
  controllers: [BatchController],
  providers: [BatchService],
})
export class BatchModule {}
