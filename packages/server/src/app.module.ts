import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AgentModule } from './modules/agent/agent.module';
import { ItemModule } from './modules/item/item.module';
import { PublicAreaModule } from './modules/public-area/public-area.module';
import { EventModule } from './modules/event/event.module';
import { WebSocketModule } from './common/websocket/websocket.module';
import { ItemSeedService } from './modules/item/item-seed.service';

const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'ghost',
  password: process.env.DB_PASSWORD || 'Passw123321',
  database: process.env.DB_DATABASE || 'pixelcity',
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV !== 'production',
};

@Module({
  imports: [
    TypeOrmModule.forRoot(databaseConfig),
    AgentModule,
    ItemModule,
    PublicAreaModule,
    EventModule,
    WebSocketModule,
  ],
})
export class AppModule implements OnModuleInit {
  constructor(private readonly itemSeedService: ItemSeedService) {}

  async onModuleInit() {
    await this.itemSeedService.seed();
    console.log('AppModule initialized');
  }
}
