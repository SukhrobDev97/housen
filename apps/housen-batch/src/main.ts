import { NestFactory } from '@nestjs/core';
import { HousenAppModule } from './housen-batch.module';

async function bootstrap() {
  const app = await NestFactory.create(HousenAppModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
