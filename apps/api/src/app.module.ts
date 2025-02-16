import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ChatflowModule } from './chatflow/chatflow.module';
import { AccessTokenStrategy } from './common/strategies/access-token.strategy';
import { RefreshTokenStrategy } from './common/strategies/refresh-token.strategy';
import { config } from './config';
import { PrismaModule } from './prisma/prisma.module';
import { SchedulerService } from './scheduler/scheduler.service';
import { SourcesModule } from './sources/sources.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [() => config],
    }),
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    ChatflowModule,
    SourcesModule
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
