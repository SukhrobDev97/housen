import { Module } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';
import { AuthModule } from '../components/auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [SocketGateway]
})
export class SocketModule {}
