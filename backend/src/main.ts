import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Aktivera validering för alla requests
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Tar bort fält som inte finns i DTO
      transform: true, // Transformerar till rätt typer
    }),
  );

  // Aktivera CORS så frontend kan prata med backend
  app.enableCors();

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
