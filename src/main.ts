import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { loadEnvFile } from 'process';

loadEnvFile('.env');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Apply global interceptors
  // app.useGlobalInterceptors(
  //   new LoggingInterceptor(),
  //   new ResponseInterceptor(),
  // );

  // // Apply global filters - order matters, more specific (HttpExceptionFilter) first
  // app.useGlobalFilters(new HttpExceptionFilter(), new AllExceptionsFilter());

  // const config = new DocumentBuilder()
  //   .setTitle('Infina Financial Hub APIs')
  //   .setDescription('API documentation for Infina Financial Hub')
  //   .setVersion('1.0')
  //   .build();
  // const documentFactory = () => SwaggerModule.createDocument(app, config);
  // SwaggerModule.setup('api', app, documentFactory);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
