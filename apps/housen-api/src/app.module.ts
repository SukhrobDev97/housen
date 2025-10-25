import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {ConfigModule} from '@nestjs/config'
import {GraphQLModule} from "@nestjs/graphql"
import{ApolloDriver} from "@nestjs/apollo"

@Module({
  imports: [
    ConfigModule.forRoot(), 
    GraphQLModule.forRoot({
      driver: ApolloDriver,
      playground: true,
      uploads: false,
      autoSchemaFile: true
    })
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
