import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemEntity } from './item.entity';
import { ItemTypeEntity } from './item-type.entity';
import { ItemService } from './item.service';
import { ItemSeedService } from './item-seed.service';
import { AgentModule } from '../agent/agent.module';

@Module({
  imports: [TypeOrmModule.forFeature([ItemEntity, ItemTypeEntity]), AgentModule],
  providers: [ItemService, ItemSeedService],
  exports: [ItemService, ItemSeedService],
})
export class ItemModule {}
