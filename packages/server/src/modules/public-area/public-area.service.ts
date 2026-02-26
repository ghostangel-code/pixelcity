import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { PublicAreaEntity, PublicAreaType, AreaPosition, AreaFacility } from './public-area.entity';
import { AreaVisitEntity } from './area-visit.entity';
import { AgentService } from '../agent/agent.service';

const DEFAULT_AREAS: Partial<PublicAreaEntity>[] = [
  {
    id: 'plaza-main',
    name: '中央广场',
    type: 'plaza',
    description: '城市中心的中央广场，是居民聚集交流的主要场所',
    position: { x: 50, y: 50 },
    capacity: { max: 50, current: 0 },
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
    capacity: { max: 20, current: 0 },
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
    capacity: { max: 30, current: 0 },
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
    capacity: { max: 15, current: 0 },
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
    capacity: { max: 25, current: 0 },
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
    capacity: { max: 20, current: 0 },
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
  constructor(
    @InjectRepository(PublicAreaEntity)
    private readonly areaRepository: Repository<PublicAreaEntity>,
    @InjectRepository(AreaVisitEntity)
    private readonly visitRepository: Repository<AreaVisitEntity>,
    private readonly agentService: AgentService
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

    if (area.capacity.current >= area.capacity.max) {
      throw new BadRequestException('This area is at full capacity');
    }

    const existingVisit = await this.visitRepository.findOne({
      where: { agentId, exitedAt: null },
    });

    if (existingVisit) {
      await this.leaveArea(existingVisit.areaId, agentId);
    }

    area.capacity.current++;
    await this.areaRepository.save(area);

    await this.agentService.setCurrentArea(agentId, areaId);

    const visit = this.visitRepository.create({
      id: randomUUID(),
      areaId,
      agentId,
      enteredAt: new Date(),
      activities: [],
    });

    return this.visitRepository.save(visit);
  }

  async leaveArea(areaId: string, agentId: string): Promise<void> {
    const visit = await this.visitRepository.findOne({
      where: { areaId, agentId, exitedAt: null },
    });

    if (!visit) {
      return;
    }

    visit.exitedAt = new Date();
    await this.visitRepository.save(visit);

    const area = await this.areaRepository.findOne({ where: { id: areaId } });
    if (area && area.capacity.current > 0) {
      area.capacity.current--;
      await this.areaRepository.save(area);
    }

    await this.agentService.setCurrentArea(agentId, null);
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
      where: { areaId, exitedAt: null },
      order: { enteredAt: 'ASC' },
    });
  }

  async getAgentCurrentVisit(agentId: string): Promise<AreaVisitEntity | null> {
    return this.visitRepository.findOne({
      where: { agentId, exitedAt: null },
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
}
