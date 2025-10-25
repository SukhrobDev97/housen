import { Module } from '@nestjs/common';
import { MemberModule } from './member/member.module';
import { ProjectModule } from './project/project.module';

@Module({
  imports: [MemberModule, ProjectModule]
})
export class ComponentsModule {}
