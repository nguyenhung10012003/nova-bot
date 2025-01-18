import { Logger } from '@nestjs/common';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const port = process.env.PORT || 3000;
  const app = await NestFactory.create(AppModule);

  const corsOptions: CorsOptions = {
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders:
      'Content-Type, Accept, Authorization, X-Requested-With, X-HTTP-Method-Override, Origin, X-User-Agent, X-Auth-Token',
  };
  app.enableCors(corsOptions);

  await app.listen(port, () => {
    Logger.log(`Server started on port ${port}`, 'Bootstrap');
  });
}
bootstrap();
