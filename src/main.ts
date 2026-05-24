import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { LogExceptionFilter } from './log/log.filter';
import { LogService } from './log/log.service';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Required to read req.cookies in guards and controllers
  // Without this, req.cookies is always undefined and JWT auth breaks
  app.use(cookieParser());

  // Catches every thrown exception across the entire app and logs it to the database via LogService before sending the error response

  const logService = app.get(LogService);
  app.useGlobalFilters(new LogExceptionFilter(logService));
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  // Automatically validates every incoming request body against its DTO
  // whitelist: true          → strips fields not defined in the DTO
  // forbidNonWhitelisted: true → throws 400 if unknown fields are sent
  // transform: true          → converts plain objects to DTO class instances also auto-converts types e.g. "25" → 25
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  // Auto-generates interactive API docs from decorators on controllers and DTOs
  const options = new DocumentBuilder()
    .setTitle('Dating App API')
    .setDescription('API documentation for the dating app matching system')
    .setVersion('1.0')
    .addCookieAuth('accessToken')
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('docs', app, document);
  await app.listen(process.env.PORT ?? 3000);
  console.log(`Server running on http://localhost:${process.env.PORT ?? 8000}`);
  console.log(`API Docs: http://localhost:${process.env.PORT ?? 8000}/docs`);
}
bootstrap();
