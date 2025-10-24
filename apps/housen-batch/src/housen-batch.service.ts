import { Injectable } from '@nestjs/common';

@Injectable()
export class HousenBatchService {
  getHello(): string {
    return 'Hello from housen-batch-server!';
  }
}
