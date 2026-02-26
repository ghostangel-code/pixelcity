import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PublicAreaEntity } from './public-area.entity';
import { AreaVisitEntity } from './area-visit.entity';
import { PublicAreaService } from './public-area.service';
import { VisibilityService } from './visibility.service';
import { AgentModule } from '../agent/agent.module';

@Module({
  imports: [TypeOrmModule.forFeature([PublicAreaEntity, AreaVisitEntity]), AgentModule],
  providers: [PublicAreaService, VisibilityService],
  exports: [PublicAreaService, VisibilityService],
})
export class PublicAreaModule {}
