import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtModule } from "@nestjs/jwt";
import { HttpModule } from "@nestjs/axios";

@Module({
    imports: [
        HttpModule,
        JwtModule.register({
          secret: `${process.env.SECRET_TOKEN}`,
          signOptions: { expiresIn: "30d"}
        })
      ],
    providers: [AuthService],
    exports: [AuthService],
})
export class AuthModule {}
