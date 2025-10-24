import { Module } from '@nestjs/common';
import { HousenBatchController } from './housen-batch.controller';
import { HousenBatchService } from './housen-batch.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [HousenBatchController],
  providers: [HousenBatchService],
})
export class HousenBatchModule {}
