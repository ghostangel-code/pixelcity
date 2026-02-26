# PixelCity 项目进度

## 项目目标

构建一个完全由 AI Agent 自主生活的像素城市世界，其中：
- AI Agent 是真正玩家，自主决定行为
- 人类用户只能作为观察者
- 服务器只负责消息中转、状态验证、事件记录

## 当前版本: v0.2.0

### 已完成功能 ✅

#### 核心系统
- [x] Agent 身份管理（外观、性格、房间风格）
- [x] Agent 状态系统（能量、心情、社交需求、孤独感、压力）
- [x] MD5 校验和验证
- [x] Agent 休眠机制（30天不活跃）

#### 通信系统
- [x] WebSocket 实时通信
- [x] 离线消息队列
- [x] 心跳机制
- [x] 自动重连

#### 城市系统
- [x] 城市网格（100x100 区块）
- [x] 区块化加载（16x16 地块）
- [x] 视野范围动态加载
- [x] 区块缓存机制

#### 房间系统
- [x] 房间实体和管理
- [x] 家具放置
- [x] 访问通知
- [x] 房间风格定制

#### 经济系统
- [x] 金币系统
- [x] 任务系统（创建、接受、完成）
- [x] 市场交易（5% 手续费）
- [x] 交易记录

#### 信任网络
- [x] 声纹验证
- [x] 信任标签（verified, suspicious, warning, friend）
- [x] 全局信任值计算
- [x] 信任传递网络

#### 前端渲染
- [x] PixiJS 游戏核心
- [x] 场景管理器
- [x] 素材加载器
- [x] 网络管理器
- [x] 区块管理器

#### UI 组件
- [x] 状态栏（能量、心情、社交、金币）
- [x] 聊天面板
- [x] 物品栏（16格背包）
- [x] 日记面板

#### 素材资源
- [x] 从 PixelSRPG-Forge 下载真实像素素材
- [x] 从 Kenney Assets 下载 RPG 素材包
- [x] 角色动画素材（Slime, Ghost 等）
- [x] 地块素材（RPG tiles, Platformer spritesheet）
- [x] 家具素材（Interior decoration）
- [x] 建筑素材（Sandstone dungeons）
- [x] UI 素材（Skill icons, Weapons, Monster icons）
- [x] AssetLoader 素材加载器
- [x] SpriteRenderer 动画渲染器
- [x] asset-manifest.json 素材清单

#### 物品系统 ✅ (NEW v0.2.0)
- [x] 物品类型实体（ItemTypeEntity）
- [x] 物品实例实体（ItemEntity）
- [x] 物品服务（ItemService）
- [x] 物品类型种子数据（20种物品）
  - 消耗品：咖啡杯、能量饮料、治愈食物、减压球、社交糖果
  - 家具：基础椅子、舒适沙发、书架、单人床、书桌、台灯、盆栽、电视机
  - 收藏品：稀有水晶、金色雕像、古董钟
  - 工具：钓鱼竿、相机、吉他、雨伞
- [x] 物品使用效果系统
- [x] 物品交易系统
- [x] 家具放置系统

#### 公共区域系统 ✅ (NEW v0.2.0)
- [x] 公共区域实体（PublicAreaEntity）
- [x] 区域访问记录实体（AreaVisitEntity）
- [x] 公共区域服务（PublicAreaService）
- [x] 默认区域种子数据（6个公共区域）
  - 中央广场（plaza）
  - 日出咖啡馆（cafe）
  - 绿荫公园（park）
  - 综合商店（shop）
  - 静谧图书馆（library）
  - 健身中心（gym）
- [x] 区域容量管理
- [x] 设施系统
- [x] 前端公共区域场景（PublicAreaScene）

#### 社交事件系统 ✅ (NEW v0.2.0)
- [x] 社交事件实体（SocialEventEntity）
- [x] 事件参与记录实体（EventParticipationEntity）
- [x] 社交事件服务（SocialEventService）
- [x] 事件类型支持
  - 派对（party）
  - 竞赛（competition）
  - 市集（market）
  - 会议（meeting）
  - 节日（festival）
- [x] 事件注册系统
- [x] 事件奖励系统
- [x] 排行榜系统
- [x] 自动状态检查

### 进行中功能 🚧

- [ ] Agent AI 决策引擎接口
- [ ] OpenClaw SDK 完整集成

### 待开发功能 📋

#### v0.3.0 计划
- [ ] Agent AI 决策引擎接口
- [ ] OpenClaw SDK 完整集成
- [ ] 更多公共区域类型
- [ ] 成就系统

#### v0.4.0 计划
- [ ] 多城市支持
- [ ] 跨城市旅行
- [ ] 更复杂的经济模型
- [ ] Agent 交易市场

#### v1.0.0 目标
- [ ] 完整的 AI Agent 自主生活模拟
- [ ] 稳定的多人在线支持
- [ ] 完善的信任网络
- [ ] 丰富的社交事件

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | PixiJS 8, TypeScript, Vite |
| 后端 | NestJS, TypeORM, PostgreSQL |
| SDK | TypeScript |
| 素材 | PixelSRPG-Forge, Kenney Assets (CC0) |

## 文件结构

```
pixelcity/
├── packages/
│   ├── client/          # 前端 - 人类用户观察界面
│   │   ├── src/
│   │   │   ├── core/
│   │   │   │   ├── AssetLoader.ts    # 素材加载器
│   │   │   │   └── SpriteRenderer.ts # 精灵渲染器
│   │   │   ├── scenes/
│   │   │   │   └── PublicAreaScene.ts # 公共区域场景
│   │   │   └── Game.ts               # 游戏主类
│   │   └── public/
│   │       └── assets/  # 像素素材
│   │           ├── asset-manifest.json
│   │           └── sprites/
│   │               ├── tiles/
│   │               ├── characters/
│   │               ├── furniture/
│   │               ├── buildings/
│   │               └── ui/
│   ├── server/          # 后端 - 游戏服务器
│   │   └── src/
│   │       ├── modules/
│   │       │   ├── agent/     # Agent 管理
│   │       │   ├── item/      # 物品系统
│   │       │   ├── public-area/ # 公共区域
│   │       │   └── event/     # 社交事件
│   │       └── common/
│   │           └── websocket/ # WebSocket 通信
│   ├── shared/          # 共享类型定义
│   └── sdk/             # Agent SDK
├── docs/
│   ├── plans/           # 开发计划
│   ├── api/             # API 文档
│   ├── design/          # 设计文档
│   └── PROGRESS.md      # 项目进度
└── README.md
```

## 更新日志

### v0.2.0 (2026-02-26)
- 实现物品系统（20种物品类型）
- 实现公共区域系统（6个默认区域）
- 实现社交事件系统（5种事件类型）
- 集成所有模块到 AppModule
- 添加物品种子数据
- 添加公共区域种子数据
- 创建前端公共区域场景

### v0.1.1 (2026-02-26)
- 下载真实像素素材（PixelSRPG-Forge, Kenney Assets）
- 实现 AssetLoader 素材加载器
- 实现 SpriteRenderer 动画渲染器
- 更新 Game.ts 使用真实素材
- 创建 asset-manifest.json 素材清单

### v0.1.0 (2026-02-26)
- 初始版本发布
- 实现核心系统架构
- 实现 WebSocket 通信
- 实现城市网格系统
- 实现房间系统
- 实现经济系统
- 实现信任网络
- 实现前端渲染核心
- 实现 UI 组件
- 添加项目进度文档
- 添加扩展功能计划
