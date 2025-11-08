import { Controller, Logger } from '@nestjs/common';
import { Cron, Timeout } from '@nestjs/schedule';
import { BatchService } from './batch.service';
import { BATCH_ROLLBACK, BATCH_TOP_AGENCIES, BATCH_TOP_PROJECTS } from './lib/config';


@Controller('batch')
export class BatchController {
  private logger: Logger = new Logger('BatchController');

  constructor(private readonly batchService: BatchService) {}

  @Timeout(1000)
  handleTimeout() {
    this.logger.debug('BATCH SERVER READY!');
  }

  @Cron('00 00 01 * * *', { name: BATCH_ROLLBACK })
  public async batchRollback() {
    try {
      this.logger["context"] = BATCH_ROLLBACK
      this.logger.debug('BATCH_ROLLBACK EXECUTED');
      await this.batchService.batchRollback();
    } catch (err) {
      this.logger.error(err);
    }
  }

  @Cron('20 00 01 * * *', { name: BATCH_TOP_PROJECTS })
  public async batchProjects() {
    try {
      this.logger["context"] = BATCH_TOP_PROJECTS
      this.logger.debug('BATCH_TOP_PROJECTS EXECUTED');
      await this.batchService.batchTopProjects();
    } catch (err) {
      this.logger.error(err);
    }
  }

  @Cron('40 00 01 * * *', { name: BATCH_TOP_AGENCIES })
  public async batchAgencies() {
    try {
      this.logger["context"] = BATCH_TOP_AGENCIES
      this.logger.debug('BATCH_TOP_AGENCIES EXECUTED');
      await this.batchService.batchTopAgencies();
    } catch (err) {
      this.logger.error(err);
    }
  }
}
