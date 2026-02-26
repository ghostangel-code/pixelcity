import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SocialEventEntity } from './social-event.entity';
import { EventParticipationEntity } from './event-participation.entity';
import { SocialEventService } from './social-event.service';
import { AgentModule } from '../agent/agent.module';
import { ItemModule } from '../item/item.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SocialEventEntity, EventParticipationEntity]),
    AgentModule,
    ItemModule,
  ],
  providers: [SocialEventService],
  exports: [SocialEventService],
})
export class EventModule {}
