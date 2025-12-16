import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { LoggingInterceptor } from './libs/interceptor/Logging.interceptor';
import {graphqlUploadExpress} from 'graphql-upload';
import * as express from 'express'
import { WsAdapter } from '@nestjs/platform-ws';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    transform: true,              // Auto-transform payloads to DTO instances
    whitelist: true,              // Strip properties without decorators
    forbidNonWhitelisted: false,  // Don't throw on extra properties
    exceptionFactory: (errors) => {
      // Log detailed validation errors
      console.log('Validation Errors:', JSON.stringify(errors, null, 2));
      return new BadRequestException(errors);
    }
  }))
  app.useGlobalInterceptors( new LoggingInterceptor())
  app.enableCors({origin:true, credentials:true})

  app.use(graphqlUploadExpress({maxFileSize: 15000000, maxFiles: 10}))
  app.use("/uploads", express.static("./uploads"))
  app.useWebSocketAdapter(new WsAdapter(app))
  await app.listen(process.env.PORT_API ?? 3000);
}
bootstrap();
