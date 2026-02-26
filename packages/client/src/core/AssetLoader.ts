import { Assets, Sprite, Spritesheet, Texture } from 'pixi.js';
import assetManifest from '../../public/assets/asset-manifest.json';

export interface AssetConfig {
  path: string;
  width?: number;
  height?: number;
  tileWidth?: number;
  tileHeight?: number;
  frames?: number;
  description?: string;
}

export interface SpriteAnimation {
  frames: Array<{ x: number; y: number; width: number; height: number }>;
  frameRate: number;
  loop: boolean;
}

export class AssetLoader {
  private static instance: AssetLoader;
  private loaded: boolean = false;
  private textures: Map<string, Texture> = new Map();
  private spritesheets: Map<string, Spritesheet> = new Map();
  private animations: Map<string, SpriteAnimation> = new Map();

  private constructor() {}

  static getInstance(): AssetLoader {
    if (!AssetLoader.instance) {
      AssetLoader.instance = new AssetLoader();
    }
    return AssetLoader.instance;
  }

  async loadAll(): Promise<void> {
    if (this.loaded) return;

    await this.loadSprites();
    this.loadAnimations();
    this.loaded = true;
    console.log('All assets loaded successfully');
  }

  private async loadSprites(): Promise<void> {
    const spriteCategories = assetManifest.sprites;
    const loadPromises: Promise<void>[] = [];

    for (const [category, sprites] of Object.entries(spriteCategories)) {
      if (category === 'characters') {
        loadPromises.push(this.loadCharacterSprites(sprites as Record<string, unknown>));
      } else {
        loadPromises.push(this.loadCategorySprites(category, sprites as Record<string, AssetConfig>));
      }
    }

    await Promise.all(loadPromises);
  }

  private async loadCategorySprites(category: string, sprites: Record<string, AssetConfig>): Promise<void> {
    for (const [name, config] of Object.entries(sprites)) {
      const key = `${category}/${name}`;
      try {
        const texture = await Assets.load<Texture>(`/assets/${config.path}`);
        this.textures.set(key, texture);
        console.log(`Loaded: ${key}`);
      } catch (error) {
        console.error(`Failed to load ${key}:`, error);
      }
    }
  }

  private async loadCharacterSprites(characters: Record<string, unknown>): Promise<void> {
    for (const [charName, charData] of Object.entries(characters)) {
      if (charName === 'monster_preview') {
        const config = charData as AssetConfig;
        const key = `characters/${charName}`;
        try {
          const texture = await Assets.load<Texture>(`/assets/${config.path}`);
          this.textures.set(key, texture);
          console.log(`Loaded: ${key}`);
        } catch (error) {
          console.error(`Failed to load ${key}:`, error);
        }
      } else {
        const animations = charData as Record<string, AssetConfig>;
        for (const [animName, config] of Object.entries(animations)) {
          const key = `characters/${charName}/${animName}`;
          try {
            const texture = await Assets.load<Texture>(`/assets/${config.path}`);
            this.textures.set(key, texture);
            console.log(`Loaded: ${key}`);
          } catch (error) {
            console.error(`Failed to load ${key}:`, error);
          }
        }
      }
    }
  }

  private loadAnimations(): void {
    const animData = assetManifest.animations;
    for (const [name, data] of Object.entries(animData)) {
      this.animations.set(name, data as SpriteAnimation);
    }
  }

  getTexture(key: string): Texture | undefined {
    return this.textures.get(key);
  }

  getAnimation(name: string): SpriteAnimation | undefined {
    return this.animations.get(name);
  }

  createSprite(key: string): Sprite | null {
    const texture = this.getTexture(key);
    if (!texture) {
      console.warn(`Texture not found: ${key}`);
      return null;
    }
    return new Sprite(texture);
  }

  getTileTexture(category: string, name: string): Texture | undefined {
    return this.getTexture(`${category}/${name}`);
  }

  getCharacterTexture(charName: string, animName?: string): Texture | undefined {
    if (animName) {
      return this.getTexture(`characters/${charName}/${animName}`);
    }
    return this.getTexture(`characters/${charName}`);
  }

  isLoaded(): boolean {
    return this.loaded;
  }

  getAssetInfo(): { textures: number; animations: number } {
    return {
      textures: this.textures.size,
      animations: this.animations.size,
    };
  }
}

export const assetLoader = AssetLoader.getInstance();
