import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import 'dotenv/config';
import { AppModule } from './app.module';
import { BudgetingInternalModule } from './budgeting/module/budgeting-internal.module';
import { BudgetingModule } from './budgeting/module/budgeting.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { GoalInternalModule, GoalModule } from './goals/module';
import {
  OnboardingInternalModule,
  OnboardingModule,
} from './onboarding/module';
import { UserInternalModule } from './user';
import { UserModule } from './user/module/user.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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
  app.useGlobalFilters(new AllExceptionsFilter());

  const config = new DocumentBuilder()
    .setTitle('Infina Personal Finance Advisor APIs')
    .setDescription('API documentation for Infina Personal Finance Advisor')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const documentFactory = () =>
    SwaggerModule.createDocument(app, config, {
      include: [UserModule, BudgetingModule, GoalModule, OnboardingModule],
    });
  SwaggerModule.setup('api', app, documentFactory);

  const internalConfig = new DocumentBuilder()
    .setTitle('Internal APIs for Infina Personal Finance Advisor')
    .setDescription(
      'API documentation for internal services of Infina Personal Finance Advisor',
    )
    .setVersion('1.0')
    .addApiKey(
      {
        type: 'apiKey',
        name: 'x-api-key',
        in: 'header',
      },
      'x-api-key',
    )
    .build();
  const internalDocumentFactory = () =>
    SwaggerModule.createDocument(app, internalConfig, {
      include: [
        UserInternalModule,
        BudgetingInternalModule,
        GoalInternalModule,
        OnboardingInternalModule,
      ],
    });
  SwaggerModule.setup('api-internal', app, internalDocumentFactory);

  await app.listen(process.env.PORT ?? 3000, () => {
    Logger.log(`Server is running on port ${process.env.PORT ?? 3000}`);
  });
}
bootstrap();
