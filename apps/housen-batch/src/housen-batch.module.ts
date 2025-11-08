import { Module } from '@nestjs/common';
import { HousenBatchController } from './housen-batch.controller';
import { HousenBatchService } from './housen-batch.service';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [ConfigModule.forRoot(), DatabaseModule, ScheduleModule.forRoot()],
  controllers: [HousenBatchController],
  providers: [HousenBatchService],
})
export class HousenBatchModule {}
