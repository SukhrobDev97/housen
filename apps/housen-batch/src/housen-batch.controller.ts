import { Controller, Get } from '@nestjs/common';
import { HousenAppService } from './housen-batch.service';

@Controller()
export class HousenAppController {
  constructor(private readonly housenAppService: HousenAppService) {}

  @Get()
  getHello(): string {
    return this.housenAppService.getHello();
  }
}
