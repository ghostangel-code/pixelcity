import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { randomUUID } from 'crypto';
import { SocialEventEntity, EventType, EventStatus, EventReward, EventRequirement } from './social-event.entity';
import { EventParticipationEntity, ParticipationStatus } from './event-participation.entity';
import { AgentService } from '../agent/agent.service';
import { ItemService } from '../item/item.service';

@Injectable()
export class SocialEventService {
  constructor(
    @InjectRepository(SocialEventEntity)
    private readonly eventRepository: Repository<SocialEventEntity>,
    @InjectRepository(EventParticipationEntity)
    private readonly participationRepository: Repository<EventParticipationEntity>,
    private readonly agentService: AgentService,
    private readonly itemService: ItemService
  ) {}

  async createEvent(
    name: string,
    type: EventType,
    description: string,
    organizerId: string,
    startTime: Date,
    endTime: Date,
    maxParticipants: number,
    areaId?: string,
    rewards?: EventReward[],
    requirements?: EventRequirement[],
    rules?: Record<string, unknown>
  ): Promise<SocialEventEntity> {
    if (startTime >= endTime) {
      throw new BadRequestException('End time must be after start time');
    }

    if (startTime < new Date()) {
      throw new BadRequestException('Start time cannot be in the past');
    }

    const event = this.eventRepository.create({
      id: randomUUID(),
      name,
      type,
      description,
      areaId: areaId || null,
      startTime,
      endTime,
      status: 'scheduled',
      organizerId,
      maxParticipants,
      currentParticipants: 0,
      rewards: rewards || [],
      requirements: requirements || [],
      rules: rules || null,
    });

    return this.eventRepository.save(event);
  }

  async registerForEvent(eventId: string, agentId: string): Promise<EventParticipationEntity> {
    const event = await this.eventRepository.findOne({ where: { id: eventId } });
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.status !== 'scheduled' && event.status !== 'active') {
      throw new BadRequestException('Event is not open for registration');
    }

    if (event.currentParticipants >= event.maxParticipants) {
      throw new BadRequestException('Event is at full capacity');
    }

    const existing = await this.participationRepository.findOne({
      where: { eventId, agentId },
    });

    if (existing) {
      throw new ConflictException('Already registered for this event');
    }

    await this.checkRequirements(event, agentId);

    event.currentParticipants++;
    await this.eventRepository.save(event);

    const participation = this.participationRepository.create({
      id: randomUUID(),
      eventId,
      agentId,
      status: 'registered',
      score: 0,
    });

    return this.participationRepository.save(participation);
  }

  async joinEvent(eventId: string, agentId: string): Promise<EventParticipationEntity> {
    const participation = await this.participationRepository.findOne({
      where: { eventId, agentId },
    });

    if (!participation) {
      throw new NotFoundException('Not registered for this event');
    }

    const event = await this.eventRepository.findOne({ where: { id: eventId } });
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.status !== 'active') {
      throw new BadRequestException('Event is not currently active');
    }

    participation.status = 'attended';
    participation.joinedAt = new Date();

    return this.participationRepository.save(participation);
  }

  async completeEvent(eventId: string): Promise<SocialEventEntity> {
    const event = await this.eventRepository.findOne({ where: { id: eventId } });
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    event.status = 'completed';
    await this.eventRepository.save(event);

    const participations = await this.participationRepository.find({
      where: { eventId, status: 'attended' },
    });

    for (const participation of participations) {
      participation.status = 'completed';
      participation.completedAt = new Date();
      await this.participationRepository.save(participation);

      await this.distributeRewards(event, participation.agentId);
    }

    return event;
  }

  async cancelEvent(eventId: string, organizerId: string): Promise<SocialEventEntity> {
    const event = await this.eventRepository.findOne({ where: { id: eventId } });
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.organizerId !== organizerId) {
      throw new BadRequestException('Only the organizer can cancel this event');
    }

    event.status = 'cancelled';
    return this.eventRepository.save(event);
  }

  async updateEventStatus(eventId: string, status: EventStatus): Promise<SocialEventEntity> {
    const event = await this.eventRepository.findOne({ where: { id: eventId } });
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    event.status = status;
    return this.eventRepository.save(event);
  }

  async getEventById(id: string): Promise<SocialEventEntity> {
    const event = await this.eventRepository.findOne({ where: { id } });
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    return event;
  }

  async getActiveEvents(): Promise<SocialEventEntity[]> {
    return this.eventRepository.find({
      where: { status: 'active' },
      order: { startTime: 'ASC' },
    });
  }

  async getUpcomingEvents(limit: number = 10): Promise<SocialEventEntity[]> {
    return this.eventRepository.find({
      where: {
        status: 'scheduled',
        startTime: Between(new Date(), new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
      },
      order: { startTime: 'ASC' },
      take: limit,
    });
  }

  async getEventsByType(type: EventType): Promise<SocialEventEntity[]> {
    return this.eventRepository.find({
      where: { type },
      order: { startTime: 'DESC' },
    });
  }

  async getEventsByOrganizer(organizerId: string): Promise<SocialEventEntity[]> {
    return this.eventRepository.find({
      where: { organizerId },
      order: { createdAt: 'DESC' },
    });
  }

  async getEventParticipants(eventId: string): Promise<EventParticipationEntity[]> {
    return this.participationRepository.find({
      where: { eventId },
      order: { createdAt: 'ASC' },
    });
  }

  async getAgentParticipations(agentId: string): Promise<EventParticipationEntity[]> {
    return this.participationRepository.find({
      where: { agentId },
      relations: ['event'],
      order: { createdAt: 'DESC' },
    });
  }

  async updateScore(eventId: string, agentId: string, score: number): Promise<EventParticipationEntity> {
    const participation = await this.participationRepository.findOne({
      where: { eventId, agentId },
    });

    if (!participation) {
      throw new NotFoundException('Participation not found');
    }

    participation.score = score;
    return this.participationRepository.save(participation);
  }

  async getLeaderboard(eventId: string): Promise<EventParticipationEntity[]> {
    return this.participationRepository.find({
      where: { eventId, status: 'attended' },
      order: { score: 'DESC' },
      take: 10,
    });
  }

  async checkScheduledEvents(): Promise<void> {
    const now = new Date();

    const eventsToStart = await this.eventRepository.find({
      where: {
        status: 'scheduled',
        startTime: Between(new Date(now.getTime() - 60000), now),
      },
    });

    for (const event of eventsToStart) {
      event.status = 'active';
      await this.eventRepository.save(event);
      console.log(`Event "${event.name}" has started`);
    }

    const eventsToEnd = await this.eventRepository.find({
      where: {
        status: 'active',
        endTime: Between(new Date(now.getTime() - 60000), now),
      },
    });

    for (const event of eventsToEnd) {
      await this.completeEvent(event.id);
      console.log(`Event "${event.name}" has ended`);
    }
  }

  private async checkRequirements(event: SocialEventEntity, agentId: string): Promise<void> {
    for (const requirement of event.requirements) {
      switch (requirement.type) {
        case 'level':
          break;
        case 'item':
          break;
        case 'reputation':
          const agent = await this.agentService.findById(agentId);
          if (agent.trustScore < (requirement.value as number)) {
            throw new BadRequestException('Insufficient reputation to join this event');
          }
          break;
      }
    }
  }

  private async distributeRewards(event: SocialEventEntity, agentId: string): Promise<void> {
    for (const reward of event.rewards) {
      switch (reward.type) {
        case 'coins':
          await this.agentService.updateCoins(agentId, reward.value as number);
          break;
        case 'item':
          await this.itemService.createItem(reward.value as string, agentId);
          break;
        case 'reputation':
          await this.agentService.updateTrustScore(agentId, reward.value as number);
          break;
      }
    }
  }
}
