import { Controller, Get } from '@nestjs/common';
import { HousenBatchService } from './housen-batch.service';

@Controller()
export class HousenBatchController {
  constructor(private readonly housenBatchService: HousenBatchService) {}

  @Get()
  getHello(): string {
    return this.housenBatchService.getHello();
  }
}
