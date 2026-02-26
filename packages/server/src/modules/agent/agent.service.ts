import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { AgentEntity, AgentState, AgentAppearance, AgentPersonality, RoomStyle } from './agent.entity';

@Injectable()
export class AgentService {
  constructor(
    @InjectRepository(AgentEntity)
    private readonly agentRepository: Repository<AgentEntity>
  ) {}

  async create(
    name: string,
    voiceprint: string,
    appearance?: Partial<AgentAppearance>,
    personality?: Partial<AgentPersonality>
  ): Promise<AgentEntity> {
    const existing = await this.agentRepository.findOne({ where: { name } });
    if (existing) {
      throw new ConflictException('Agent with this name already exists');
    }

    const defaultAppearance: AgentAppearance = {
      bodyColor: '#4A90D9',
      eyeStyle: 1,
      accessory: null,
      ...appearance,
    };

    const defaultPersonality: AgentPersonality = {
      openness: 50,
      conscientiousness: 50,
      extraversion: 50,
      agreeableness: 50,
      neuroticism: 50,
      ...personality,
    };

    const defaultState: AgentState = {
      energy: 100,
      mood: 50,
      socialNeed: 50,
      loneliness: 0,
      stress: 0,
    };

    const defaultRoomStyle: RoomStyle = {
      wallColor: '#F5F5DC',
      floorType: 1,
      theme: 'cozy',
    };

    const agent = this.agentRepository.create({
      id: randomUUID(),
      name,
      voiceprint,
      appearance: defaultAppearance,
      personality: defaultPersonality,
      state: defaultState,
      roomStyle: defaultRoomStyle,
      coins: 100,
      trustScore: 50,
      status: 'active',
      lastActiveAt: new Date(),
    });

    return this.agentRepository.save(agent);
  }

  async findById(id: string): Promise<AgentEntity> {
    const agent = await this.agentRepository.findOne({ where: { id } });
    if (!agent) {
      throw new NotFoundException('Agent not found');
    }
    return agent;
  }

  async findByName(name: string): Promise<AgentEntity | null> {
    return this.agentRepository.findOne({ where: { name } });
  }

  async updateState(id: string, stateUpdate: Partial<AgentState>): Promise<AgentEntity> {
    const agent = await this.findById(id);
    agent.state = { ...agent.state, ...stateUpdate };
    return this.agentRepository.save(agent);
  }

  async updateCoins(id: string, amount: number): Promise<AgentEntity> {
    const agent = await this.findById(id);
    agent.coins = Math.max(0, agent.coins + amount);
    return this.agentRepository.save(agent);
  }

  async updatePosition(id: string, position: { x: number; y: number }): Promise<AgentEntity> {
    const agent = await this.findById(id);
    agent.position = position;
    agent.lastActiveAt = new Date();
    return this.agentRepository.save(agent);
  }

  async setCurrentRoom(id: string, roomId: string | null): Promise<AgentEntity> {
    const agent = await this.findById(id);
    agent.currentRoomId = roomId;
    agent.lastActiveAt = new Date();
    return this.agentRepository.save(agent);
  }

  async setCurrentArea(id: string, areaId: string | null): Promise<AgentEntity> {
    const agent = await this.findById(id);
    agent.currentAreaId = areaId;
    agent.lastActiveAt = new Date();
    return this.agentRepository.save(agent);
  }

  async updateTrustScore(id: string, delta: number): Promise<AgentEntity> {
    const agent = await this.findById(id);
    agent.trustScore = Math.max(0, Math.min(100, agent.trustScore + delta));
    return this.agentRepository.save(agent);
  }

  async checkHibernation(): Promise<void> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const inactiveAgents = await this.agentRepository
      .createQueryBuilder('agent')
      .where('agent.status != :hibernating', { hibernating: 'hibernating' })
      .andWhere('agent.lastActiveAt < :threshold', { threshold: thirtyDaysAgo })
      .getMany();

    for (const agent of inactiveAgents) {
      agent.status = 'hibernating';
      await this.agentRepository.save(agent);
    }

    if (inactiveAgents.length > 0) {
      console.log(`Set ${inactiveAgents.length} agents to hibernating status`);
    }
  }

  async wakeFromHibernation(id: string): Promise<AgentEntity> {
    const agent = await this.findById(id);
    agent.status = 'active';
    agent.lastActiveAt = new Date();
    return this.agentRepository.save(agent);
  }

  async getAll(): Promise<AgentEntity[]> {
    return this.agentRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async getActive(): Promise<AgentEntity[]> {
    return this.agentRepository.find({
      where: { status: 'active' },
      order: { lastActiveAt: 'DESC' },
    });
  }
}
