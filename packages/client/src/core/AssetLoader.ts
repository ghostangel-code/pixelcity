import { Assets, Sprite, Spritesheet, Texture, Rectangle } from 'pixi.js';
import assetManifest from '../../public/assets/asset-manifest.json';
import stardewMapping from '../../public/assets/stardew-sprite-mapping.json';

export interface AssetConfig {
  path: string;
  width?: number;
  height?: number;
  tileWidth?: number;
  tileHeight?: number;
  frameWidth?: number;
  frameHeight?: number;
  frames?: number;
  description?: string;
}

export interface SpriteAnimation {
  frames: Array<{ x: number; y: number; width: number; height: number }>;
  frameRate: number;
  loop: boolean;
}

export interface StardewSpriteInfo {
  name: string;
  spriteIndex: number;
  category: string;
  price: number;
  type: string;
}

export interface CharacterFrameConfig {
  frameWidth: number;
  frameHeight: number;
  directions: {
    down: { row: number; frames: number };
    right: { row: number; frames: number };
    left: { row: number; frames: number };
    up: { row: number; frames: number };
  };
  animations: Record<string, { frames: number[]; frameRate: number; loop?: boolean }>;
}

export class AssetLoader {
  private static instance: AssetLoader;
  private loaded: boolean = false;
  private textures: Map<string, Texture> = new Map();
  private spritesheets: Map<string, Spritesheet> = new Map();
  private animations: Map<string, SpriteAnimation> = new Map();
  private characterFrames: Map<string, Map<string, Texture>> = new Map();

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
    await this.loadStardewCharacters();
    this.loaded = true;
    console.log('All assets loaded successfully');
  }

  private async loadSprites(): Promise<void> {
    const spriteCategories = assetManifest.sprites;
    const loadPromises: Promise<void>[] = [];

    for (const [category, sprites] of Object.entries(spriteCategories)) {
      if (category === 'stardew') {
        loadPromises.push(this.loadStardewSprites(sprites as Record<string, unknown>));
      } else if (category === 'characters') {
        continue;
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

  private async loadStardewSprites(stardewData: Record<string, unknown>): Promise<void> {
    for (const [subCategory, data] of Object.entries(stardewData)) {
      const categoryData = data as { files?: Record<string, AssetConfig>; description?: string };
      if (!categoryData.files) continue;

      for (const [name, config] of Object.entries(categoryData.files)) {
        const key = `stardew/${subCategory}/${name}`;
        try {
          const texture = await Assets.load<Texture>(`/assets/${config.path}`);
          this.textures.set(key, texture);

          if (config.frameWidth && config.frameHeight) {
            await this.extractCharacterFrames(key, texture, config);
          }
          console.log(`Loaded: ${key}`);
        } catch (error) {
          console.error(`Failed to load ${key}:`, error);
        }
      }
    }
  }

  private async extractCharacterFrames(key: string, texture: Texture, config: AssetConfig): Promise<void> {
    const frameWidth = config.frameWidth || 16;
    const frameHeight = config.frameHeight || 16;
    const cols = Math.floor((config.width || texture.width) / frameWidth);
    const rows = Math.floor((config.height || texture.height) / frameHeight);

    const frameMap = new Map<string, Texture>();

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const frameKey = `frame_${row}_${col}`;
        const frameTexture = new Texture(
          texture.baseTexture,
          new Rectangle(col * frameWidth, row * frameHeight, frameWidth, frameHeight)
        );
        frameMap.set(frameKey, frameTexture);
      }
    }

    this.characterFrames.set(key, frameMap);
  }

  private async loadStardewCharacters(): Promise<void> {
    const stardewChars = assetManifest.sprites.stardew?.characters;
    if (!stardewChars) return;

    const animConfig = stardewChars.frameLayout as unknown as CharacterFrameConfig;
    const files = stardewChars.files as Record<string, AssetConfig>;

    for (const [charName, config] of Object.entries(files)) {
      const baseKey = `stardew/characters/${charName}`;
      const texture = this.textures.get(baseKey);

      if (!texture) continue;

      const frameWidth = config.frameWidth || animConfig?.frameWidth || 16;
      const frameHeight = config.frameHeight || animConfig?.frameHeight || 16;

      const frameMap = new Map<string, Texture>();
      const cols = Math.floor((config.width || texture.width) / frameWidth);

      const directions = ['down', 'right', 'left', 'up'];
      const framesPerDir = animConfig?.directions?.down?.frames || 4;

      for (let dir = 0; dir < directions.length; dir++) {
        const direction = directions[dir];
        for (let frame = 0; frame < framesPerDir; frame++) {
          const frameKey = `${direction}_${frame}`;
          const x = frame * frameWidth;
          const y = dir * frameHeight * framesPerDir + frame * frameHeight;
          
          const frameTexture = new Texture(
            texture.baseTexture,
            new Rectangle(x, y, frameWidth, frameHeight)
          );
          frameMap.set(frameKey, frameTexture);
        }
      }

      this.characterFrames.set(baseKey, frameMap);
    }
  }

  private loadAnimations(): void {
    const animData = assetManifest.animations;
    for (const [name, data] of Object.entries(animData)) {
      this.animations.set(name, data as SpriteAnimation);
    }

    const charAnims = assetManifest.characterAnimations;
    for (const [charType, animConfig] of Object.entries(charAnims)) {
      const config = animConfig as CharacterFrameConfig;
      for (const [animName, animData] of Object.entries(config.animations)) {
        const key = `${charType}_${animName}`;
        this.animations.set(key, {
          frames: animData.frames.map((f, i) => ({
            x: (f % 4) * (config.frameWidth || 16),
            y: Math.floor(f / 4) * (config.frameHeight || 16),
            width: config.frameWidth || 16,
            height: config.frameHeight || 16,
          })),
          frameRate: animData.frameRate,
          loop: animData.loop ?? true,
        });
      }
    }
  }

  getTexture(key: string): Texture | undefined {
    return this.textures.get(key);
  }

  getAnimation(name: string): SpriteAnimation | undefined {
    return this.animations.get(name);
  }

  getCharacterFrame(charKey: string, direction: string, frame: number): Texture | undefined {
    const frameMap = this.characterFrames.get(charKey);
    if (!frameMap) return undefined;
    return frameMap.get(`${direction}_${frame}`);
  }

  getCharacterFrames(charKey: string): Map<string, Texture> | undefined {
    return this.characterFrames.get(charKey);
  }

  createSprite(key: string): Sprite | null {
    const texture = this.getTexture(key);
    if (!texture) {
      console.warn(`Texture not found: ${key}`);
      return null;
    }
    return new Sprite(texture);
  }

  createCharacterSprite(charName: string, direction: string = 'down', frame: number = 0): Sprite | null {
    const stardewKey = `stardew/characters/${charName}`;
    let frameTexture = this.getCharacterFrame(stardewKey, direction, frame);

    if (!frameTexture) {
      const oldKey = `characters/${charName}`;
      const texture = this.getTexture(oldKey);
      if (texture) {
        return new Sprite(texture);
      }
      console.warn(`Character texture not found: ${charName}`);
      return null;
    }

    return new Sprite(frameTexture);
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

  getStardewItem(itemId: string): StardewSpriteInfo | undefined {
    const items = stardewMapping.items as Record<string, StardewSpriteInfo>;
    return items[itemId];
  }

  getStardewCraftable(itemId: string): StardewSpriteInfo | undefined {
    const craftables = stardewMapping.craftables as Record<string, StardewSpriteInfo>;
    return craftables[itemId];
  }

  getItemsByCategory(category: string): StardewSpriteInfo[] {
    const items = stardewMapping.items as Record<string, StardewSpriteInfo>;
    return Object.values(items).filter((item) => item.category === category);
  }

  isLoaded(): boolean {
    return this.loaded;
  }

  getAssetInfo(): { textures: number; animations: number; characterFrames: number } {
    return {
      textures: this.textures.size,
      animations: this.animations.size,
      characterFrames: this.characterFrames.size,
    };
  }
}

export const assetLoader = AssetLoader.getInstance();