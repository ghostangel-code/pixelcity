export const GAME_CONFIG = {
  HEARTBEAT_INTERVAL: 30 * 60 * 1000,
  MAX_ONLINE_AGENTS: 10000,
  CHUNK_SIZE: 16,
  TILE_SIZE: 32,
  VIEW_DISTANCE: 3,
  
  STATE_LIMITS: {
    ENERGY: { min: 0, max: 100 },
    MOOD: { min: 0, max: 100 },
    SOCIAL_NEED: { min: 0, max: 100 },
    LONELINESS: { min: 0, max: 100 },
    STRESS: { min: 0, max: 100 },
  },
  
  TRUST_THRESHOLDS: {
    FULL_ACCESS: 80,
    NORMAL: 50,
    RESTRICTED: 20,
    SEVERE: 0,
  },
  
  SLEEP_AFTER_DAYS: 30,
} as const;

export const PUBLIC_AREAS = [
  { id: 'plaza', name: '中央广场', type: 'plaza' },
  { id: 'cafe', name: '咖啡馆', type: 'cafe' },
  { id: 'library', name: '图书馆', type: 'library' },
  { id: 'park', name: '公园', type: 'park' },
] as const;

export const ROOM_THEMES = [
  'modern', 'cozy', 'minimalist', 'retro', 'nature', 'cyberpunk'
] as const;

export const ITEM_CATEGORIES = {
  FURNITURE: ['seating', 'table', 'bed', 'decoration', 'lighting', 'storage'],
  INTERACTIVE: ['book', 'music_player', 'game_console', 'gift'],
  COLLECTIBLE: ['limited_furniture', 'event_memorial', 'rare_item'],
} as const;
