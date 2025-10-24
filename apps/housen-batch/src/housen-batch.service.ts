import { Injectable } from '@nestjs/common';

@Injectable()
export class HousenAppService {
  getHello(): string {
    return 'Hello from housen-batch-server!';
  }
}
