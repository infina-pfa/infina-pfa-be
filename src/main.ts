import 'dotenv/config';
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { SupabaseAuthGuard } from './common/guards/supabase-auth.guard';
import { loadEnvFile } from 'process';
import { ValidationPipe } from '@nestjs/common';

loadEnvFile('.env');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalGuards(new SupabaseAuthGuard(app.get(Reflector)));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Apply global interceptors
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new ResponseInterceptor(),
  );

  // Apply global filters - order matters, more specific (HttpExceptionFilter) first
  app.useGlobalFilters(new HttpExceptionFilter(), new AllExceptionsFilter());

  const config = new DocumentBuilder()
    .setTitle('Infina Personal Finance Advisor APIs')
    .setDescription('API documentation for Infina Personal Finance Advisor')
    .setVersion('1.0')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
