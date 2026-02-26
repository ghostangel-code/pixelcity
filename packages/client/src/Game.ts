import { Application, Container, Sprite, Ticker } from 'pixi.js';
import { assetLoader } from './core/AssetLoader';
import { SpriteRenderer, TileMap } from './core/SpriteRenderer';

export class Game {
  private app: Application;
  private mainContainer: Container;
  private worldContainer: Container;
  private uiContainer: Container;
  private tileMap: TileMap;
  private animatedSprites: SpriteRenderer[] = [];
  private lastTime: number = 0;

  constructor(app: Application) {
    this.app = app;
    this.mainContainer = new Container();
    this.worldContainer = new Container();
    this.uiContainer = new Container();
    this.tileMap = new TileMap(32, 32);
  }

  async init(): Promise<void> {
    this.app.stage.addChild(this.mainContainer);
    this.mainContainer.addChild(this.worldContainer);
    this.mainContainer.addChild(this.uiContainer);

    await this.loadAssets();
    this.createDemoScene();
    this.startGameLoop();

    console.log('PixelCity Game initialized with real assets');
  }

  private async loadAssets(): Promise<void> {
    console.log('Loading assets...');
    await assetLoader.loadAll();
    const info = assetLoader.getAssetInfo();
    console.log(`Loaded ${info.textures} textures and ${info.animations} animations`);
  }

  private createDemoScene(): void {
    this.createTileBackground();
    this.createDemoCharacters();
    this.createUIElements();
  }

  private createTileBackground(): void {
    const texture = assetLoader.getTexture('tiles/rpg_tiles');
    if (!texture) {
      console.warn('RPG tiles texture not found');
      return;
    }

    const tileSize = 32;
    const cols = Math.ceil(this.app.screen.width / tileSize) + 1;
    const rows = Math.ceil(this.app.screen.height / tileSize) + 1;

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const sprite = new Sprite(texture);
        sprite.x = x * tileSize;
        sprite.y = y * tileSize;
        sprite.width = tileSize;
        sprite.height = tileSize;
        
        const frameX = (x % 8) * tileSize;
        const frameY = (y % 8) * tileSize;
        
        this.worldContainer.addChild(sprite);
      }
    }
  }

  private createDemoCharacters(): void {
    const slimeRenderer = new SpriteRenderer({
      textureKey: 'characters/slime/idle-run',
      animationKey: 'slime_idle',
      x: 200,
      y: 300,
      scale: 3,
    });
    slimeRenderer.play();
    this.animatedSprites.push(slimeRenderer);
    this.worldContainer.addChild(slimeRenderer.getSprite());

    const ghostRenderer = new SpriteRenderer({
      textureKey: 'characters/ghost/idle',
      animationKey: 'ghost_idle',
      x: 400,
      y: 300,
      scale: 3,
    });
    ghostRenderer.play();
    this.animatedSprites.push(ghostRenderer);
    this.worldContainer.addChild(ghostRenderer.getSprite());

    const monsterPreview = assetLoader.createSprite('characters/monster_preview');
    if (monsterPreview) {
      monsterPreview.x = 600;
      monsterPreview.y = 200;
      monsterPreview.scale.set(0.3);
      this.worldContainer.addChild(monsterPreview);
    }
  }

  private createUIElements(): void {
    const skillIcons = assetLoader.createSprite('ui/skill_icons');
    if (skillIcons) {
      skillIcons.x = 20;
      skillIcons.y = this.app.screen.height - 120;
      skillIcons.scale.set(0.1);
      this.uiContainer.addChild(skillIcons);
    }

    const weapons = assetLoader.createSprite('ui/weapons');
    if (weapons) {
      weapons.x = 150;
      weapons.y = this.app.screen.height - 120;
      weapons.scale.set(0.1);
      this.uiContainer.addChild(weapons);
    }
  }

  private startGameLoop(): void {
    this.lastTime = performance.now();
    
    Ticker.shared.add((ticker) => {
      const delta = ticker.deltaTime;
      this.update(delta);
    });
  }

  private update(delta: number): void {
    for (const sprite of this.animatedSprites) {
      sprite.update(delta);
    }
  }

  resize(width: number, height: number): void {
    this.worldContainer.removeChildren();
    this.createTileBackground();
    
    for (const sprite of this.animatedSprites) {
      this.worldContainer.addChild(sprite.getSprite());
    }
  }
}
