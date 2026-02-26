import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { randomUUID } from 'crypto';
import { PublicAreaEntity, PublicAreaType, AreaPosition, AreaFacility } from './public-area.entity';
import { AreaVisitEntity } from './area-visit.entity';
import { AgentService } from '../agent/agent.service';
import { VisibilityService } from './visibility.service';

const DEFAULT_AREAS: Partial<PublicAreaEntity>[] = [
  {
    id: 'plaza-main',
    name: '中央广场',
    type: 'plaza',
    description: '城市中心的中央广场，是居民聚集交流的主要场所',
    position: { x: 50, y: 50 },
    maxVisibleAgents: 30,
    facilities: [
      { id: 'fountain', name: '喷泉', type: 'decoration', position: { x: 0, y: 0 } },
      { id: 'bench-1', name: '长椅', type: 'seat', position: { x: -2, y: 2 } },
      { id: 'bench-2', name: '长椅', type: 'seat', position: { x: 2, y: 2 } },
      { id: 'bench-3', name: '长椅', type: 'seat', position: { x: -2, y: -2 } },
      { id: 'bench-4', name: '长椅', type: 'seat', position: { x: 2, y: -2 } },
    ],
    spriteData: { path: 'sprites/tiles/rpg_tiles.png', width: 256, height: 256 },
    active: true,
  },
  {
    id: 'cafe-sunrise',
    name: '日出咖啡馆',
    type: 'cafe',
    description: '温馨的咖啡馆，提供各种饮品和小食',
    position: { x: 45, y: 48 },
    maxVisibleAgents: 20,
    facilities: [
      { id: 'counter', name: '吧台', type: 'service', position: { x: 0, y: -3 } },
      { id: 'table-1', name: '圆桌', type: 'seat', position: { x: -2, y: 0 } },
      { id: 'table-2', name: '圆桌', type: 'seat', position: { x: 2, y: 0 } },
      { id: 'table-3', name: '圆桌', type: 'seat', position: { x: -2, y: 2 } },
      { id: 'table-4', name: '圆桌', type: 'seat', position: { x: 2, y: 2 } },
    ],
    spriteData: { path: 'sprites/furniture/interior_1.png', width: 128, height: 128 },
    active: true,
  },
  {
    id: 'park-green',
    name: '绿荫公园',
    type: 'park',
    description: '宁静的公园，有茂密的树木和清澈的池塘',
    position: { x: 55, y: 45 },
    maxVisibleAgents: 25,
    facilities: [
      { id: 'pond', name: '池塘', type: 'decoration', position: { x: 0, y: 0 } },
      { id: 'tree-1', name: '大树', type: 'decoration', position: { x: -3, y: -3 } },
      { id: 'tree-2', name: '大树', type: 'decoration', position: { x: 3, y: -3 } },
      { id: 'bench-1', name: '长椅', type: 'seat', position: { x: -2, y: 2 } },
      { id: 'bench-2', name: '长椅', type: 'seat', position: { x: 2, y: 2 } },
      { id: 'fishing-spot', name: '钓鱼点', type: 'activity', position: { x: 0, y: 3 } },
    ],
    spriteData: { path: 'sprites/tiles/cave.png', width: 192, height: 192 },
    active: true,
  },
  {
    id: 'shop-general',
    name: '综合商店',
    type: 'shop',
    description: '出售各种日常用品和特色商品',
    position: { x: 48, y: 52 },
    maxVisibleAgents: 15,
    facilities: [
      { id: 'counter', name: '收银台', type: 'service', position: { x: 0, y: -2 } },
      { id: 'shelf-1', name: '货架', type: 'display', position: { x: -2, y: 0 } },
      { id: 'shelf-2', name: '货架', type: 'display', position: { x: 2, y: 0 } },
      { id: 'shelf-3', name: '货架', type: 'display', position: { x: -2, y: 1 } },
      { id: 'shelf-4', name: '货架', type: 'display', position: { x: 2, y: 1 } },
    ],
    spriteData: { path: 'sprites/buildings/sandstone_dungeons.png', width: 128, height: 128 },
    active: true,
  },
  {
    id: 'library-quiet',
    name: '静谧图书馆',
    type: 'library',
    description: '安静的图书馆，藏书丰富，适合阅读和学习',
    position: { x: 52, y: 55 },
    maxVisibleAgents: 20,
    facilities: [
      { id: 'desk-main', name: '借阅台', type: 'service', position: { x: 0, y: -3 } },
      { id: 'shelf-1', name: '书架', type: 'display', position: { x: -3, y: 0 } },
      { id: 'shelf-2', name: '书架', type: 'display', position: { x: 3, y: 0 } },
      { id: 'reading-1', name: '阅读位', type: 'seat', position: { x: -1, y: 2 } },
      { id: 'reading-2', name: '阅读位', type: 'seat', position: { x: 1, y: 2 } },
      { id: 'reading-3', name: '阅读位', type: 'seat', position: { x: -1, y: 3 } },
      { id: 'reading-4', name: '阅读位', type: 'seat', position: { x: 1, y: 3 } },
    ],
    spriteData: { path: 'sprites/furniture/interior_2.png', width: 160, height: 128 },
    active: true,
  },
  {
    id: 'gym-fitness',
    name: '健身中心',
    type: 'gym',
    description: '现代化的健身中心，提供各种运动设施',
    position: { x: 58, y: 50 },
    maxVisibleAgents: 20,
    facilities: [
      { id: 'reception', name: '前台', type: 'service', position: { x: 0, y: -3 } },
      { id: 'treadmill-1', name: '跑步机', type: 'equipment', position: { x: -2, y: 0 } },
      { id: 'treadmill-2', name: '跑步机', type: 'equipment', position: { x: 0, y: 0 } },
      { id: 'treadmill-3', name: '跑步机', type: 'equipment', position: { x: 2, y: 0 } },
      { id: 'weights', name: '哑铃区', type: 'equipment', position: { x: -2, y: 2 } },
      { id: 'yoga', name: '瑜伽区', type: 'activity', position: { x: 2, y: 2 } },
    ],
    spriteData: { path: 'sprites/tiles/platformer_spritesheet.png', width: 128, height: 128 },
    active: true,
  },
];

@Injectable()
export class PublicAreaService {
  private interactionHistory: Map<string, Array<{ type: string; timestamp: Date }>> = new Map();

  constructor(
    @InjectRepository(PublicAreaEntity)
    private readonly areaRepository: Repository<PublicAreaEntity>,
    @InjectRepository(AreaVisitEntity)
    private readonly visitRepository: Repository<AreaVisitEntity>,
    private readonly agentService: AgentService,
    private readonly visibilityService: VisibilityService
  ) {}

  async seedDefaultAreas(): Promise<void> {
    const count = await this.areaRepository.count();
    if (count > 0) {
      console.log('Public areas already seeded, skipping...');
      return;
    }

    for (const areaData of DEFAULT_AREAS) {
      const area = this.areaRepository.create(areaData);
      await this.areaRepository.save(area);
    }

    console.log(`Seeded ${DEFAULT_AREAS.length} public areas`);
  }

  async enterArea(areaId: string, agentId: string): Promise<AreaVisitEntity> {
    const area = await this.areaRepository.findOne({ where: { id: areaId } });
    if (!area) {
      throw new NotFoundException('Area not found');
    }

    if (!area.active) {
      throw new BadRequestException('This area is currently closed');
    }

    const existingVisit = await this.visitRepository.findOne({
      where: { agentId, exitedAt: IsNull() },
    });

    if (existingVisit) {
      await this.leaveArea(existingVisit.areaId, agentId);
    }

    await this.agentService.setCurrentArea(agentId, areaId);

    const visit = this.visitRepository.create({
      id: randomUUID(),
      areaId,
      agentId,
      enteredAt: new Date(),
      activities: [],
      visibleUsers: [],
      totalInteractions: 0,
    });

    await this.visitRepository.save(visit);

    const allVisits = await this.visitRepository.find({
      where: { areaId, exitedAt: IsNull() },
      relations: ['area'],
    });

    this.visibilityService.onAgentEnter(visit, allVisits, this.interactionHistory);

    await this.visitRepository.save(visit);

    for (const otherVisit of allVisits) {
      if (otherVisit.id !== visit.id) {
        this.visibilityService.onAgentEnter(otherVisit, allVisits, this.interactionHistory);
        await this.visitRepository.save(otherVisit);
      }
    }

    return visit;
  }

  async leaveArea(areaId: string, agentId: string): Promise<void> {
    const visit = await this.visitRepository.findOne({
      where: { areaId, agentId, exitedAt: IsNull() },
    });

    if (!visit) {
      return;
    }

    visit.exitedAt = new Date();
    await this.visitRepository.save(visit);

    await this.agentService.setCurrentArea(agentId, null);

    const remainingVisits = await this.visitRepository.find({
      where: { areaId, exitedAt: IsNull() },
      relations: ['area'],
    });

    this.visibilityService.onAgentLeave(visit, remainingVisits, this.interactionHistory);

    for (const otherVisit of remainingVisits) {
      if (otherVisit.id !== visit.id) {
        await this.visitRepository.save(otherVisit);
      }
    }
  }

  async getAreaById(id: string): Promise<PublicAreaEntity> {
    const area = await this.areaRepository.findOne({ where: { id } });
    if (!area) {
      throw new NotFoundException('Area not found');
    }
    return area;
  }

  async getAreasByType(type: PublicAreaType): Promise<PublicAreaEntity[]> {
    return this.areaRepository.find({
      where: { type, active: true },
      order: { name: 'ASC' },
    });
  }

  async getAllAreas(): Promise<PublicAreaEntity[]> {
    return this.areaRepository.find({
      order: { type: 'ASC', name: 'ASC' },
    });
  }

  async getActiveAreas(): Promise<PublicAreaEntity[]> {
    return this.areaRepository.find({
      where: { active: true },
      order: { name: 'ASC' },
    });
  }

  async getAreaVisitors(areaId: string): Promise<AreaVisitEntity[]> {
    return this.visitRepository.find({
      where: { areaId, exitedAt: IsNull() },
      order: { enteredAt: 'ASC' },
    });
  }

  async getAgentCurrentVisit(agentId: string): Promise<AreaVisitEntity | null> {
    return this.visitRepository.findOne({
      where: { agentId, exitedAt: IsNull() },
      relations: ['area'],
    });
  }

  async addActivity(visitId: string, activity: string): Promise<void> {
    const visit = await this.visitRepository.findOne({ where: { id: visitId } });
    if (visit) {
      if (!visit.activities) {
        visit.activities = [];
      }
      visit.activities.push(activity);
      await this.visitRepository.save(visit);
    }
  }

  async getNearbyAreas(position: AreaPosition, radius: number = 5): Promise<PublicAreaEntity[]> {
    const allAreas = await this.areaRepository.find({ where: { active: true } });

    return allAreas.filter((area) => {
      const dx = Math.abs(area.position.x - position.x);
      const dy = Math.abs(area.position.y - position.y);
      return dx <= radius && dy <= radius;
    });
  }

  async setAreaActive(id: string, active: boolean): Promise<PublicAreaEntity> {
    const area = await this.getAreaById(id);
    area.active = active;
    return this.areaRepository.save(area);
  }

  async getAreaStats(areaId: string): Promise<{
    totalVisits: number;
    avgDuration: number;
    peakHours: number[];
  }> {
    const visits = await this.visitRepository.find({
      where: { areaId },
    });

    const totalVisits = visits.length;

    const completedVisits = visits.filter((v) => v.exitedAt);
    let totalDuration = 0;
    const hourCounts: Record<number, number> = {};

    for (const visit of completedVisits) {
      const duration = visit.exitedAt!.getTime() - visit.enteredAt.getTime();
      totalDuration += duration;

      const hour = visit.enteredAt.getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    }

    const avgDuration = completedVisits.length > 0 ? totalDuration / completedVisits.length : 0;

    const peakHours = Object.entries(hourCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([hour]) => parseInt(hour));

    return { totalVisits, avgDuration, peakHours };
  }

  async recordInteraction(
    agentId1: string,
    agentId2: string,
    interactionType: 'chat' | 'trade' | 'gift' | 'event' | 'visit',
  ): Promise<void> {
    this.visibilityService.recordInteraction(
      agentId1,
      agentId2,
      interactionType,
      this.interactionHistory,
    );

    const visit1 = await this.visitRepository.findOne({
      where: { agentId: agentId1, exitedAt: IsNull() },
    });
    const visit2 = await this.visitRepository.findOne({
      where: { agentId: agentId2, exitedAt: IsNull() },
    });

    if (visit1) {
      visit1.totalInteractions = (visit1.totalInteractions || 0) + 1;
      await this.visitRepository.save(visit1);
    }
    if (visit2) {
      visit2.totalInteractions = (visit2.totalInteractions || 0) + 1;
      await this.visitRepository.save(visit2);
    }
  }

  async getVisibleAgentsForUser(agentId: string): Promise<string[]> {
    const visit = await this.visitRepository.findOne({
      where: { agentId, exitedAt: IsNull() },
    });

    if (!visit) {
      return [];
    }

    return visit.visibleUsers?.map((u) => u.oderId) || [];
  }

  async isAgentVisibleTo(targetAgentId: string, observerAgentId: string): Promise<boolean> {
    const observerVisit = await this.visitRepository.findOne({
      where: { agentId: observerAgentId, exitedAt: IsNull() },
    });

    if (!observerVisit) {
      return false;
    }

    return this.visibilityService.isAgentVisibleTo(targetAgentId, observerVisit);
  }

  async broadcastToAreaVisible(
    areaId: string,
    message: { type: string; agentId: string; [key: string]: unknown },
    excludeAgentId?: string,
  ): Promise<void> {
    const allVisits = await this.visitRepository.find({
      where: { areaId, exitedAt: IsNull() },
    });

    for (const visit of allVisits) {
      if (excludeAgentId && visit.agentId === excludeAgentId) {
        continue;
      }

      const visibleAgentIds = visit.visibleUsers?.map((u) => u.oderId) || [];
      if (visibleAgentIds.includes(message.agentId)) {
        continue;
      }
    }
  }
}
