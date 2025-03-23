import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { ChatflowModule } from './chatflow/chatflow.module';
import { AccessTokenStrategy } from './common/strategies/access-token.strategy';
import { RefreshTokenStrategy } from './common/strategies/refresh-token.strategy';
import { getConfig } from './config';
import { IntegrationModule } from './integration/integration.module';
import { PrismaModule } from './prisma/prisma.module';
import { SchedulerModule } from './scheduler/scheduler.module';
import { SchedulerService } from './scheduler/scheduler.service';
import { SourcesModule } from './sources/sources.module';
import { StorageModule } from './storage-disk/storage.module';
import { TaskModule } from './task/task.module';
import { WebhookModule } from './webhook/webhook.module';
import { WorkerModule } from './worker/worker.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [getConfig],
    }),
    ScheduleModule.forRoot(),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>('REDIS_HOST'),
          port: configService.get<number>('REDIS_PORT'),
          password: configService.get<string>('REDIS_PASSWORD'),
        },
      }),
    }),
    EventEmitterModule.forRoot(),
    PrismaModule,
    AuthModule,
    ChatflowModule,
    SourcesModule,
    ChatModule,
    WebhookModule,
    StorageModule,
    IntegrationModule,
    WorkerModule,
    SchedulerModule,
    TaskModule,
  ],
  controllers: [AppController],
  providers: [
    SchedulerService,
    AppService,
    AccessTokenStrategy,
    RefreshTokenStrategy,
  ],
})
export class AppModule {}
