import { NestFactory } from '@nestjs/core';
import { HousenBatchModule } from './housen-batch.module';

async function bootstrap() {
  const app = await NestFactory.create(HousenBatchModule);
  await app.listen(process.env.PORT_BATCH ?? 3000);
}
bootstrap();
