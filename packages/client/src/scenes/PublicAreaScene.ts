import { Container, Sprite, Text, Graphics, FederatedPointerEvent } from 'pixi.js';
import { assetLoader } from '../core/AssetLoader';

export interface PublicAreaData {
  id: string;
  name: string;
  type: 'plaza' | 'cafe' | 'park' | 'shop' | 'library' | 'gym';
  description: string;
  position: { x: number; y: number };
  capacity: { max: number; current: number };
  facilities: Array<{
    id: string;
    name: string;
    type: string;
    position: { x: number; y: number };
  }>;
  active: boolean;
}

export class PublicAreaScene extends Container {
  private areaData: PublicAreaData;
  private background: Sprite | null = null;
  private facilities: Container[] = [];
  private agents: Map<string, Sprite> = new Map();
  private infoPanel: Container | null = null;
  private tileSize: number = 32;

  constructor(areaData: PublicAreaData) {
    super();
    this.areaData = areaData;
    this.setupScene();
  }

  private setupScene(): void {
    this.createBackground();
    this.createFacilities();
    this.createInfoPanel();
  }

  private createBackground(): void {
    const textureKey = this.getTextureKeyForAreaType();
    const texture = assetLoader.getTexture(textureKey);

    if (texture) {
      this.background = new Sprite(texture);
      this.background.width = this.tileSize * 10;
      this.background.height = this.tileSize * 10;
      this.background.x = 0;
      this.background.y = 0;
      this.addChild(this.background);
    } else {
      const graphics = new Graphics();
      graphics.rect(0, 0, this.tileSize * 10, this.tileSize * 10);
      graphics.fill(this.getColorForAreaType());
      this.addChild(graphics);
    }
  }

  private createFacilities(): void {
    for (const facility of this.areaData.facilities) {
      const container = new Container();
      container.x = this.tileSize * 5 + facility.position.x * this.tileSize;
      container.y = this.tileSize * 5 + facility.position.y * this.tileSize;

      const facilityGraphics = new Graphics();
      const size = this.tileSize;

      switch (facility.type) {
        case 'decoration':
          facilityGraphics.rect(-size / 4, -size / 4, size / 2, size / 2);
          facilityGraphics.fill(0x4caf50);
          break;
        case 'seat':
          facilityGraphics.rect(-size / 3, -size / 3, size / 1.5, size / 1.5);
          facilityGraphics.fill(0x8b4513);
          break;
        case 'service':
          facilityGraphics.rect(-size / 2, -size / 3, size, size / 1.5);
          facilityGraphics.fill(0x2196f3);
          break;
        case 'display':
          facilityGraphics.rect(-size / 4, -size / 2, size / 2, size);
          facilityGraphics.fill(0x9c27b0);
          break;
        case 'equipment':
          facilityGraphics.rect(-size / 3, -size / 3, size / 1.5, size / 1.5);
          facilityGraphics.fill(0xff9800);
          break;
        case 'activity':
          facilityGraphics.circle(0, 0, size / 3);
          facilityGraphics.fill(0x00bcd4);
          break;
        default:
          facilityGraphics.rect(-size / 4, -size / 4, size / 2, size / 2);
          facilityGraphics.fill(0x9e9e9e);
      }

      container.addChild(facilityGraphics);

      const label = new Text({
        text: facility.name,
        style: {
          fontSize: 10,
          fill: 0xffffff,
        },
      });
      label.x = -label.width / 2;
      label.y = size / 2 + 2;
      container.addChild(label);

      container.eventMode = 'static';
      container.cursor = 'pointer';
      container.on('pointerover', () => {
        this.showFacilityInfo(facility);
      });

      this.facilities.push(container);
      this.addChild(container);
    }
  }

  private createInfoPanel(): void {
    this.infoPanel = new Container();
    this.infoPanel.x = 10;
    this.infoPanel.y = 10;
    this.infoPanel.visible = false;

    const bg = new Graphics();
    bg.rect(0, 0, 200, 100);
    bg.fill({ r: 0, g: 0, b: 0, a: 0.7 });
    this.infoPanel.addChild(bg);

    const title = new Text({
      text: this.areaData.name,
      style: {
        fontSize: 16,
        fill: 0xffffff,
        fontWeight: 'bold',
      },
    });
    title.x = 10;
    title.y = 10;
    this.infoPanel.addChild(title);

    const typeText = new Text({
      text: `类型: ${this.getTypeLabel()}`,
      style: {
        fontSize: 12,
        fill: 0xcccccc,
      },
    });
    typeText.x = 10;
    typeText.y = 35;
    this.infoPanel.addChild(typeText);

    const capacityText = new Text({
      text: `人数: ${this.areaData.capacity.current}/${this.areaData.capacity.max}`,
      style: {
        fontSize: 12,
        fill: 0xcccccc,
      },
    });
    capacityText.x = 10;
    capacityText.y = 55;
    this.infoPanel.addChild(capacityText);

    const descText = new Text({
      text: this.areaData.description,
      style: {
        fontSize: 10,
        fill: 0xaaaaaa,
        wordWrap: true,
        wordWrapWidth: 180,
      },
    });
    descText.x = 10;
    descText.y = 75;
    this.infoPanel.addChild(descText);

    this.addChild(this.infoPanel);
  }

  private showFacilityInfo(facility: PublicAreaData['facilities'][0]): void {
    console.log(`Facility: ${facility.name} (${facility.type})`);
  }

  private getTextureKeyForAreaType(): string {
    const textureMap: Record<string, string> = {
      plaza: 'tiles/rpg_tiles',
      cafe: 'furniture/interior_1',
      park: 'tiles/cave',
      shop: 'buildings/sandstone_dungeons',
      library: 'furniture/interior_2',
      gym: 'tiles/platformer_spritesheet',
    };
    return textureMap[this.areaData.type] || 'tiles/rpg_tiles';
  }

  private getColorForAreaType(): number {
    const colorMap: Record<string, number> = {
      plaza: 0x90ee90,
      cafe: 0xffd700,
      park: 0x228b22,
      shop: 0x4169e1,
      library: 0x8b4513,
      gym: 0xff6347,
    };
    return colorMap[this.areaData.type] || 0xcccccc;
  }

  private getTypeLabel(): string {
    const labelMap: Record<string, string> = {
      plaza: '广场',
      cafe: '咖啡馆',
      park: '公园',
      shop: '商店',
      library: '图书馆',
      gym: '健身中心',
    };
    return labelMap[this.areaData.type] || this.areaData.type;
  }

  addAgent(agentId: string, x: number, y: number): void {
    if (this.agents.has(agentId)) {
      return;
    }

    const sprite = new Sprite();
    sprite.x = this.tileSize * 5 + x * this.tileSize;
    sprite.y = this.tileSize * 5 + y * this.tileSize;
    sprite.width = this.tileSize / 2;
    sprite.height = this.tileSize / 2;

    const agentGraphics = new Graphics();
    agentGraphics.circle(0, 0, this.tileSize / 4);
    agentGraphics.fill(0x4a90d9);
    sprite.addChild(agentGraphics);

    this.agents.set(agentId, sprite);
    this.addChild(sprite);
  }

  removeAgent(agentId: string): void {
    const sprite = this.agents.get(agentId);
    if (sprite) {
      this.removeChild(sprite);
      sprite.destroy();
      this.agents.delete(agentId);
    }
  }

  updateAgentPosition(agentId: string, x: number, y: number): void {
    const sprite = this.agents.get(agentId);
    if (sprite) {
      sprite.x = this.tileSize * 5 + x * this.tileSize;
      sprite.y = this.tileSize * 5 + y * this.tileSize;
    }
  }

  toggleInfoPanel(): void {
    if (this.infoPanel) {
      this.infoPanel.visible = !this.infoPanel.visible;
    }
  }

  getAreaData(): PublicAreaData {
    return this.areaData;
  }

  destroy(): void {
    this.facilities.forEach((f) => f.destroy());
    this.facilities = [];
    this.agents.forEach((s) => s.destroy());
    this.agents.clear();
    super.destroy();
  }
}
