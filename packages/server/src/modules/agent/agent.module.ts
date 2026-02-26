import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgentEntity } from './agent.entity';
import { AgentService } from './agent.service';

@Module({
  imports: [TypeOrmModule.forFeature([AgentEntity])],
  providers: [AgentService],
  exports: [AgentService],
})
export class AgentModule {}
