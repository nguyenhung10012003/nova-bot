import { Logger, ValidationPipe } from '@nestjs/common';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LogRequestInterceptor } from './common/interceptors/log-request.interceptor';

async function bootstrap() {
  const port = process.env.PORT || 3000;
  const environment = process.env.NODE_ENV || 'development';
  const app = await NestFactory.create(AppModule, {
    logger:
      environment === 'development'
        ? ['debug', 'error', 'fatal', 'log', 'verbose', 'warn']
        : ['error', 'warn', 'log'],
  });

  const corsOptions: CorsOptions = {
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders:
      'Content-Type, Accept, Authorization, X-Requested-With, X-HTTP-Method-Override, Origin, X-User-Agent, X-Auth-Token',
  };
  app.enableCors(corsOptions);
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  // app.useGlobalInterceptors(new LogRequestInterceptor());
  // app.useGlobalFilters(new LoggingRouteFilter());

  await app.listen(port, () => {
    Logger.log(`Server started on port ${port}`, 'Bootstrap');
  });
}
bootstrap();
