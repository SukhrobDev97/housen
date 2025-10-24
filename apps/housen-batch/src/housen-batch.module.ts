import { Module } from '@nestjs/common';
import { HousenAppController } from './housen-batch.controller';
import { HousenAppService } from './housen-batch.service';

@Module({
  imports: [],
  controllers: [HousenAppController],
  providers: [HousenAppService],
})
export class HousenAppModule {}
