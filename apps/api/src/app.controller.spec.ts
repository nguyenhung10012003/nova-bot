import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SchedulerService } from './scheduler/scheduler.service';
import { ConfigModule } from '@nestjs/config';
import { config } from '../dist/config';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './prisma/prisma.module';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({
            isGlobal: true,
            load: [() => config],
          }),
          ScheduleModule.forRoot(),
          PrismaModule,],
      controllers: [AppController],
      providers: [AppService, SchedulerService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "pong!"', async () => {
      expect(await appController.ping()).toBe('pong!');
    });
  });
});
