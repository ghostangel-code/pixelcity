import { Sprite, Texture, Ticker } from 'pixi.js';
import { assetLoader, SpriteAnimation } from './AssetLoader';

export interface AnimatedSpriteConfig {
  textureKey: string;
  animationKey: string;
  x: number;
  y: number;
  scale?: number;
}

export class SpriteRenderer {
  private sprite: Sprite;
  private animation: SpriteAnimation | undefined;
  private currentFrame: number = 0;
  private frameTimer: number = 0;
  private isPlaying: boolean = false;
  private baseTexture: Texture | undefined;
  private frameWidth: number = 0;
  private frameHeight: number = 0;

  constructor(config: AnimatedSpriteConfig) {
    this.baseTexture = assetLoader.getTexture(config.textureKey);
    this.animation = assetLoader.getAnimation(config.animationKey);

    if (!this.baseTexture) {
      console.warn(`Texture not found: ${config.textureKey}`);
      this.sprite = new Sprite();
    } else {
      this.sprite = new Sprite(this.baseTexture);
      
      if (this.animation && this.animation.frames.length > 0) {
        this.frameWidth = this.animation.frames[0].width;
        this.frameHeight = this.animation.frames[0].height;
        this.updateFrame(0);
      }
    }

    this.sprite.x = config.x;
    this.sprite.y = config.y;
    if (config.scale) {
      this.sprite.scale.set(config.scale);
    }
  }

  private updateFrame(frameIndex: number): void {
    if (!this.animation || !this.baseTexture) return;

    const frame = this.animation.frames[frameIndex];
    if (!frame) return;

    const frameTexture = new Texture({
      source: this.baseTexture.source,
      frame: {
        x: frame.x,
        y: frame.y,
        width: frame.width,
        height: frame.height,
      },
    });

    this.sprite.texture = frameTexture;
  }

  play(): void {
    if (!this.animation) return;
    this.isPlaying = true;
    this.currentFrame = 0;
    this.frameTimer = 0;
  }

  stop(): void {
    this.isPlaying = false;
    this.currentFrame = 0;
    this.updateFrame(0);
  }

  update(delta: number): void {
    if (!this.isPlaying || !this.animation) return;

    const frameDuration = 1 / this.animation.frameRate;
    this.frameTimer += delta / 60;

    if (this.frameTimer >= frameDuration) {
      this.frameTimer = 0;
      this.currentFrame++;

      if (this.currentFrame >= this.animation.frames.length) {
        if (this.animation.loop) {
          this.currentFrame = 0;
        } else {
          this.currentFrame = this.animation.frames.length - 1;
          this.isPlaying = false;
        }
      }

      this.updateFrame(this.currentFrame);
    }
  }

  getSprite(): Sprite {
    return this.sprite;
  }

  setPosition(x: number, y: number): void {
    this.sprite.x = x;
    this.sprite.y = y;
  }

  setScale(scale: number): void {
    this.sprite.scale.set(scale);
  }

  setVisibility(visible: boolean): void {
    this.sprite.visible = visible;
  }

  destroy(): void {
    this.sprite.destroy();
  }
}

export class TileMap {
  private tiles: Sprite[][] = [];
  private tileWidth: number;
  private tileHeight: number;

  constructor(tileWidth: number = 16, tileHeight: number = 16) {
    this.tileWidth = tileWidth;
    this.tileHeight = tileHeight;
  }

  setTile(x: number, y: number, textureKey: string): Sprite {
    const texture = assetLoader.getTexture(textureKey);
    const sprite = new Sprite(texture);
    
    sprite.x = x * this.tileWidth;
    sprite.y = y * this.tileHeight;
    sprite.width = this.tileWidth;
    sprite.height = this.tileHeight;

    if (!this.tiles[x]) {
      this.tiles[x] = [];
    }

    if (this.tiles[x][y]) {
      this.tiles[x][y].destroy();
    }

    this.tiles[x][y] = sprite;
    return sprite;
  }

  getTile(x: number, y: number): Sprite | undefined {
    return this.tiles[x]?.[y];
  }

  clear(): void {
    for (const row of this.tiles) {
      for (const tile of row) {
        tile.destroy();
      }
    }
    this.tiles = [];
  }
}
