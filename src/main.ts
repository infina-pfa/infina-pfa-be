import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import 'dotenv/config';
import { AiAdvisorInternalModule } from './ai-advisor/module/ai-advisor-internal.module';
import { AiAdvisorModule } from './ai-advisor/module/ai-advisor.module';
import { AppModule } from './app.module';
import { BudgetingInternalModule } from './budgeting/module/budgeting-internal.module';
import { BudgetingModule } from './budgeting/module/budgeting.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { LoggerService } from './common/logger/logger.service';
import { GoalInternalModule, GoalModule } from './goals/module';
import {
  OnboardingInternalModule,
  OnboardingModule,
} from './onboarding/module';
import { UserInternalModule } from './user';
import { UserModule } from './user/module/user.module';
import { DebtModule } from './debt/modules/debt.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  // Get the logger service instance
  const logger = app.get(LoggerService);
  app.useLogger(logger);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // Apply global interceptors with dependency injection
  const loggingInterceptor = app.get(LoggingInterceptor, { strict: false });
  app.useGlobalInterceptors(loggingInterceptor, new ResponseInterceptor());

  // Apply global filters with dependency injection
  const allExceptionsFilter = app.get(AllExceptionsFilter, { strict: false });
  app.useGlobalFilters(allExceptionsFilter);

  const config = new DocumentBuilder()
    .setTitle('Infina Personal Finance Advisor APIs')
    .setDescription('API documentation for Infina Personal Finance Advisor')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const documentFactory = () =>
    SwaggerModule.createDocument(app, config, {
      include: [
        UserModule,
        BudgetingModule,
        GoalModule,
        OnboardingModule,
        AiAdvisorModule,
        DebtModule,
      ],
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
        AiAdvisorInternalModule,
      ],
    });
  SwaggerModule.setup('api-internal', app, internalDocumentFactory);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  logger.log(`Server is running on port ${port}`, 'Bootstrap');
}
void bootstrap();
