import { Injectable } from '@nestjs/common';

@Injectable()
export class BatchService {
  public getHello(): string {
    return 'Welcome to Nestar BATCH Server!';
  }

  public async batchRollback(): Promise<void> {
    console.log("batchRollback")
  }

  public async batchProjects(): Promise<void> {
    console.log("batchProjects")
  }

  public async batchAgencies(): Promise<void> {
    console.log("batchAgencies")
  }
}

