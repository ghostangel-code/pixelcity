import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PublicAreaEntity } from './public-area.entity';
import { AreaVisitEntity } from './area-visit.entity';
import { PublicAreaService } from './public-area.service';
import { AgentModule } from '../agent/agent.module';

@Module({
  imports: [TypeOrmModule.forFeature([PublicAreaEntity, AreaVisitEntity]), AgentModule],
  providers: [PublicAreaService],
  exports: [PublicAreaService],
})
export class PublicAreaModule implements OnModuleInit {
  constructor(private readonly publicAreaService: PublicAreaService) {}

  async onModuleInit() {
    await this.publicAreaService.seedDefaultAreas();
  }
}
