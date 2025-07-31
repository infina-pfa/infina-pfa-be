import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { TestDatabaseManager } from '../setup/database.setup';
import { AuthTestUtils, TEST_USERS } from '../utils/auth.utils';
import { SupabaseAuthGuard } from '@/common/guards/supabase-auth.guard';
import { MockGuard } from '../mocks/guard.mock';
import { PrismaClient } from '../../generated/prisma';
import { Currency, Language } from '../../src/common/types/user';
import { CreateUserProfileDto } from '../../src/user/controllers/dto/create-user-profile.dto';
import { FinancialStage } from '../../src/user/domain/entities/user.entity';
import { UserProfileResponseDto } from '../../src/user/dto/user-profile.dto';

describe('User Profile CREATE Endpoints (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaClient;
  let authHeaders: Record<string, { Authorization: string }>;

  beforeAll(async () => {
    // Setup test database
    prisma = await TestDatabaseManager.setupTestDatabase();

    // Create test module
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(SupabaseAuthGuard)
      .useClass(MockGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    // Setup test authentication
    const authSetup = await AuthTestUtils.setupTestAuthentication(prisma);
    authHeaders = authSetup.authHeaders;
  });

  afterAll(async () => {
    await TestDatabaseManager.cleanupTestDatabase();
    await AuthTestUtils.cleanupTestUsers(prisma);
    await TestDatabaseManager.teardownTestDatabase();
    await app.close();
  });

  beforeEach(async () => {
    // Clean up test data before each test
    await TestDatabaseManager.cleanupTestDatabase();

    // Create auth users but NOT public users for profile creation tests
    for (const testUser of Object.values(TEST_USERS)) {
      await AuthTestUtils.createAuthUserOnly(prisma, testUser);
    }
  });

  describe('POST /users/profile', () => {
    describe('Happy Path', () => {
      it('should create user profile with all fields', async () => {
        const createData: CreateUserProfileDto = {
          name: 'John Doe',
          financialStage: FinancialStage.START_INVESTING,
          currency: Currency.EUR,
          language: Language.EN,
        };

        const response = await request(app.getHttpServer())
          .post('/users/profile')
          .set(authHeaders.JOHN_DOE)
          .send(createData)
          .expect(201);

        const body = response.body as UserProfileResponseDto;

        expect(body.id).toBeDefined();
        expect(body.name).toBe('John Doe');
        expect(body.financialStage).toBe(FinancialStage.START_INVESTING);
        expect(body.currency).toBe(Currency.EUR);
        expect(body.language).toBe(Language.EN);
        expect(body.onboardingCompletedAt).toBeNull();
        expect(body.createdAt).toBeDefined();
        expect(body.updatedAt).toBeDefined();

        // Verify data was persisted in database
        const userInDb = await prisma.public_users.findUnique({
          where: { user_id: TEST_USERS.JOHN_DOE.id },
        });

        expect(userInDb).toBeTruthy();
        expect(userInDb?.name).toBe('John Doe');
        expect(userInDb?.financial_stage).toBe(FinancialStage.START_INVESTING);
        expect(userInDb?.currency).toBe(Currency.EUR);
        expect(userInDb?.language).toBe(Language.EN);
        expect(userInDb?.onboarding_completed_at).toBeNull();
      });

      it('should create user profile with minimal required data', async () => {
        const createData: CreateUserProfileDto = {
          name: 'Jane Smith',
        };

        const response = await request(app.getHttpServer())
          .post('/users/profile')
          .set(authHeaders.JANE_SMITH)
          .send(createData)
          .expect(201);

        const body = response.body as UserProfileResponseDto;

        expect(body.id).toBeDefined();
        expect(body.name).toBe('Jane Smith');
        expect(body.financialStage).toBeNull();
        expect(body.currency).toBe(Currency.VND); // Default
        expect(body.language).toBe(Language.VI); // Default
        expect(body.onboardingCompletedAt).toBeNull();
        expect(body.createdAt).toBeDefined();
        expect(body.updatedAt).toBeDefined();

        // Verify in database
        const userInDb = await prisma.public_users.findUnique({
          where: { user_id: TEST_USERS.JANE_SMITH.id },
        });

        expect(userInDb).toBeTruthy();
        expect(userInDb?.name).toBe('Jane Smith');
        expect(userInDb?.financial_stage).toBeNull();
        expect(userInDb?.currency).toBe(Currency.VND);
        expect(userInDb?.language).toBe(Language.VI);
      });

      it('should apply default values for optional fields', async () => {
        const createData: CreateUserProfileDto = {
          name: 'Default User',
          financialStage: FinancialStage.DEBT, // Only set financial stage
        };

        const response = await request(app.getHttpServer())
          .post('/users/profile')
          .set(authHeaders.JOHN_DOE)
          .send(createData)
          .expect(201);

        const body = response.body as UserProfileResponseDto;

        expect(body.name).toBe('Default User');
        expect(body.financialStage).toBe(FinancialStage.DEBT);
        expect(body.currency).toBe(Currency.VND); // Default applied
        expect(body.language).toBe(Language.VI); // Default applied
        expect(body.onboardingCompletedAt).toBeNull(); // Initially not completed

        // Verify defaults in database
        const userInDb = await prisma.public_users.findUnique({
          where: { user_id: TEST_USERS.JOHN_DOE.id },
        });

        expect(userInDb?.currency).toBe(Currency.VND);
        expect(userInDb?.language).toBe(Language.VI);
        expect(userInDb?.onboarding_completed_at).toBeNull();
      });
    });

    describe('Validation', () => {
      it('should return 400 for missing name', async () => {
        const createData = {
          financialStage: FinancialStage.START_SAVING,
        };

        const response = await request(app.getHttpServer())
          .post('/users/profile')
          .set(authHeaders.JOHN_DOE)
          .send(createData)
          .expect(400);

        expect(response.body).toHaveProperty('message');
      });

      it('should return 400 for name too short', async () => {
        const createData: CreateUserProfileDto = {
          name: 'A', // Single character
        };

        const response = await request(app.getHttpServer())
          .post('/users/profile')
          .set(authHeaders.JOHN_DOE)
          .send(createData)
          .expect(400);

        expect(response.body).toHaveProperty('message');
      });

      it('should return 400 for name too long', async () => {
        const createData: CreateUserProfileDto = {
          name: 'A'.repeat(101), // More than 100 characters
        };

        const response = await request(app.getHttpServer())
          .post('/users/profile')
          .set(authHeaders.JOHN_DOE)
          .send(createData)
          .expect(400);

        expect(response.body).toHaveProperty('message');
      });

      it('should return 400 for name with only whitespace', async () => {
        const createData: CreateUserProfileDto = {
          name: '   ', // Only whitespace
        };

        const response = await request(app.getHttpServer())
          .post('/users/profile')
          .set(authHeaders.JOHN_DOE)
          .send(createData)
          .expect(400);

        expect(response.body).toHaveProperty('message');
      });

      it('should return 400 for invalid financial stage', async () => {
        const createData = {
          name: 'John Doe',
          financialStage: 'invalid_stage',
        };

        const response = await request(app.getHttpServer())
          .post('/users/profile')
          .set(authHeaders.JOHN_DOE)
          .send(createData)
          .expect(400);

        expect(response.body).toHaveProperty('message');
      });

      it('should return 400 for invalid currency', async () => {
        const createData = {
          name: 'John Doe',
          currency: 'invalid_currency',
        };

        const response = await request(app.getHttpServer())
          .post('/users/profile')
          .set(authHeaders.JOHN_DOE)
          .send(createData)
          .expect(400);

        expect(response.body).toHaveProperty('message');
      });

      it('should return 400 for invalid language', async () => {
        const createData = {
          name: 'John Doe',
          language: 'invalid_language',
        };

        const response = await request(app.getHttpServer())
          .post('/users/profile')
          .set(authHeaders.JOHN_DOE)
          .send(createData)
          .expect(400);

        expect(response.body).toHaveProperty('message');
      });

      it('should return 400 for multiple validation errors', async () => {
        const createData = {
          name: 'A', // Too short
          financialStage: 'invalid_stage',
          currency: 'invalid_currency',
          language: 'invalid_language',
        };

        const response = await request(app.getHttpServer())
          .post('/users/profile')
          .set(authHeaders.JOHN_DOE)
          .send(createData)
          .expect(400);

        expect(response.body).toHaveProperty('message');
      });
    });

    describe('Business Logic', () => {
      it('should return 409 if profile already exists', async () => {
        // First, create a user profile in public_users table (bypassing our create endpoint)
        await prisma.public_users.create({
          data: {
            user_id: TEST_USERS.JOHN_DOE.id,
            name: 'Existing User',
            created_at: new Date(),
            updated_at: new Date(),
          },
        });

        const createData: CreateUserProfileDto = {
          name: 'John Doe Duplicate',
        };

        const response = await request(app.getHttpServer())
          .post('/users/profile')
          .set(authHeaders.JOHN_DOE)
          .send(createData)
          .expect(409);

        expect(response.body).toHaveProperty('message');
      });

      it('should set onboarding as incomplete initially', async () => {
        const createData: CreateUserProfileDto = {
          name: 'Onboarding Test',
          financialStage: FinancialStage.START_SAVING,
        };

        const response = await request(app.getHttpServer())
          .post('/users/profile')
          .set(authHeaders.JOHN_DOE)
          .send(createData)
          .expect(201);

        const body = response.body as UserProfileResponseDto;
        expect(body.onboardingCompletedAt).toBeNull();

        // Verify in database
        const userInDb = await prisma.public_users.findUnique({
          where: { user_id: TEST_USERS.JOHN_DOE.id },
        });

        expect(userInDb?.onboarding_completed_at).toBeNull();
      });

      it('should handle different financial stages correctly', async () => {
        const testCases = [
          FinancialStage.DEBT,
          FinancialStage.START_SAVING,
          FinancialStage.START_INVESTING,
        ];

        for (let i = 0; i < testCases.length; i++) {
          const stage = testCases[i];
          const testUser = Object.values(TEST_USERS)[i]; // Use different users

          const createData: CreateUserProfileDto = {
            name: `User ${stage}`,
            financialStage: stage,
          };

          const response = await request(app.getHttpServer())
            .post('/users/profile')
            .set(authHeaders[Object.keys(TEST_USERS)[i]])
            .send(createData)
            .expect(201);

          const body = response.body as UserProfileResponseDto;
          expect(body.financialStage).toBe(stage);

          // Verify in database
          const userInDb = await prisma.public_users.findUnique({
            where: { user_id: testUser.id },
          });

          expect(userInDb?.financial_stage).toBe(stage);
        }
      });

      it('should handle different currencies correctly', async () => {
        const testCases = [Currency.USD, Currency.EUR, Currency.VND];

        for (let i = 0; i < testCases.length; i++) {
          const currency = testCases[i];
          const testUser = Object.values(TEST_USERS)[i];

          const createData: CreateUserProfileDto = {
            name: `User ${currency}`,
            currency: currency,
          };

          const response = await request(app.getHttpServer())
            .post('/users/profile')
            .set(authHeaders[Object.keys(TEST_USERS)[i]])
            .send(createData)
            .expect(201);

          const body = response.body as UserProfileResponseDto;
          expect(body.currency).toBe(currency);

          // Verify in database
          const userInDb = await prisma.public_users.findUnique({
            where: { user_id: testUser.id },
          });

          expect(userInDb?.currency).toBe(currency);
        }
      });

      it('should handle different languages correctly', async () => {
        const testCases = [Language.VI, Language.EN];

        for (let i = 0; i < testCases.length; i++) {
          const language = testCases[i];
          const testUser = Object.values(TEST_USERS)[i];

          const createData: CreateUserProfileDto = {
            name: `User ${language}`,
            language: language,
          };

          const response = await request(app.getHttpServer())
            .post('/users/profile')
            .set(authHeaders[Object.keys(TEST_USERS)[i]])
            .send(createData)
            .expect(201);

          const body = response.body as UserProfileResponseDto;
          expect(body.language).toBe(language);

          // Verify in database
          const userInDb = await prisma.public_users.findUnique({
            where: { user_id: testUser.id },
          });

          expect(userInDb?.language).toBe(language);
        }
      });
    });

    describe('Authentication', () => {
      it('should return 403 when not authenticated', async () => {
        const createData: CreateUserProfileDto = {
          name: 'Should Fail',
        };

        await request(app.getHttpServer())
          .post('/users/profile')
          .send(createData)
          .expect(403);
      });

      it('should return 403 with invalid authentication token', async () => {
        const createData: CreateUserProfileDto = {
          name: 'Should Fail',
        };

        await request(app.getHttpServer())
          .post('/users/profile')
          .set('Authorization', 'Bearer invalid-token')
          .send(createData)
          .expect(403);
      });

      it('should return 403 with malformed authorization header', async () => {
        const createData: CreateUserProfileDto = {
          name: 'Should Fail',
        };

        await request(app.getHttpServer())
          .post('/users/profile')
          .set('Authorization', 'invalid-format')
          .send(createData)
          .expect(403);
      });

      it('should work with valid authentication for different users', async () => {
        const createData1: CreateUserProfileDto = {
          name: 'John Valid Auth',
        };

        const createData2: CreateUserProfileDto = {
          name: 'Jane Valid Auth',
        };

        const [response1, response2] = await Promise.all([
          request(app.getHttpServer())
            .post('/users/profile')
            .set(authHeaders.JOHN_DOE)
            .send(createData1),
          request(app.getHttpServer())
            .post('/users/profile')
            .set(authHeaders.JANE_SMITH)
            .send(createData2),
        ]);

        expect(response1.status).toBe(201);
        expect(response2.status).toBe(201);

        const body1 = response1.body as UserProfileResponseDto;
        const body2 = response2.body as UserProfileResponseDto;

        expect(body1.name).toBe('John Valid Auth');
        expect(body2.name).toBe('Jane Valid Auth');
        expect(body1.id).toBeDefined();
        expect(body2.id).toBeDefined();
        expect(body1.id).not.toBe(body2.id);
      });
    });

    describe('Data Structure Validation', () => {
      it('should return correct response structure on successful creation', async () => {
        const createData: CreateUserProfileDto = {
          name: 'Structure Test',
          financialStage: FinancialStage.START_SAVING,
          currency: Currency.USD,
          language: Language.EN,
        };

        const response = await request(app.getHttpServer())
          .post('/users/profile')
          .set(authHeaders.JOHN_DOE)
          .send(createData)
          .expect(201);

        const body = response.body as UserProfileResponseDto;

        // Verify all required fields are present
        expect(body).toHaveProperty('id');
        expect(body).toHaveProperty('name');
        expect(body).toHaveProperty('financialStage');
        expect(body).toHaveProperty('onboardingCompletedAt');
        expect(body).toHaveProperty('currency');
        expect(body).toHaveProperty('language');
        expect(body).toHaveProperty('createdAt');
        expect(body).toHaveProperty('updatedAt');

        // Verify data types
        expect(typeof body.id).toBe('string');
        expect(typeof body.name).toBe('string');
        expect(typeof body.currency).toBe('string');
        expect(typeof body.language).toBe('string');
        expect(
          body.financialStage === null ||
            typeof body.financialStage === 'string',
        ).toBe(true);
        expect(body.onboardingCompletedAt).toBeNull();

        // Verify values
        expect(body.name).toBe('Structure Test');
        expect(body.financialStage).toBe(FinancialStage.START_SAVING);
        expect(body.currency).toBe(Currency.USD);
        expect(body.language).toBe(Language.EN);

        // Dates should be valid date strings
        expect(new Date(body.createdAt)).toBeInstanceOf(Date);
        expect(new Date(body.updatedAt)).toBeInstanceOf(Date);
      });

      it('should maintain data consistency between API and database', async () => {
        const createData: CreateUserProfileDto = {
          name: 'Consistency Test',
          financialStage: FinancialStage.START_INVESTING,
          currency: Currency.EUR,
          language: Language.EN,
        };

        const response = await request(app.getHttpServer())
          .post('/users/profile')
          .set(authHeaders.JOHN_DOE)
          .send(createData)
          .expect(201);

        const body = response.body as UserProfileResponseDto;

        // Verify consistency between API response and database
        const userInDb = await prisma.public_users.findUnique({
          where: { user_id: TEST_USERS.JOHN_DOE.id },
        });

        expect(body.name).toBe(userInDb?.name);
        expect(body.financialStage).toBe(userInDb?.financial_stage);
        expect(body.currency).toBe(userInDb?.currency);
        expect(body.language).toBe(userInDb?.language);
        expect(body.onboardingCompletedAt).toBe(
          userInDb?.onboarding_completed_at,
        );
      });

      it('should set correct timestamps on creation', async () => {
        const beforeCreate = new Date();

        const createData: CreateUserProfileDto = {
          name: 'Timestamp Test',
        };

        const response = await request(app.getHttpServer())
          .post('/users/profile')
          .set(authHeaders.JOHN_DOE)
          .send(createData)
          .expect(201);

        const afterCreate = new Date();
        const body = response.body as UserProfileResponseDto;

        const createdAt = new Date(body.createdAt);
        const updatedAt = new Date(body.updatedAt);

        // Timestamps should be within reasonable range
        expect(createdAt.getTime()).toBeGreaterThanOrEqual(
          beforeCreate.getTime() - 1000,
        );
        expect(createdAt.getTime()).toBeLessThanOrEqual(
          afterCreate.getTime() + 1000,
        );
        expect(updatedAt.getTime()).toBeGreaterThanOrEqual(
          beforeCreate.getTime() - 1000,
        );
        expect(updatedAt.getTime()).toBeLessThanOrEqual(
          afterCreate.getTime() + 1000,
        );

        // CreatedAt and updatedAt should be equal on creation
        expect(
          Math.abs(createdAt.getTime() - updatedAt.getTime()),
        ).toBeLessThan(1000);
      });
    });

    describe('Error Handling', () => {
      it('should handle malformed JSON payload', async () => {
        await request(app.getHttpServer())
          .post('/users/profile')
          .set(authHeaders.JOHN_DOE)
          .set('Content-Type', 'application/json')
          .send('{ invalid json }')
          .expect(400);
      });

      it('should handle empty request body', async () => {
        const response = await request(app.getHttpServer())
          .post('/users/profile')
          .set(authHeaders.JOHN_DOE)
          .send({})
          .expect(400);

        expect(response.body).toHaveProperty('message');
      });

      it('should handle non-string name field', async () => {
        const createData = {
          name: 123, // Should be string
        };

        const response = await request(app.getHttpServer())
          .post('/users/profile')
          .set(authHeaders.JOHN_DOE)
          .send(createData)
          .expect(400);

        expect(response.body).toHaveProperty('message');
      });
    });

    describe('Performance', () => {
      it('should respond within reasonable time for profile creation', async () => {
        const createData: CreateUserProfileDto = {
          name: 'Performance Test',
          financialStage: FinancialStage.START_INVESTING,
          currency: Currency.USD,
          language: Language.EN,
        };

        const startTime = Date.now();

        await request(app.getHttpServer())
          .post('/users/profile')
          .set(authHeaders.JOHN_DOE)
          .send(createData)
          .expect(201);

        const endTime = Date.now();
        const responseTime = endTime - startTime;

        expect(responseTime).toBeLessThan(1000); // Should respond within 1 second
      });

      it('should handle concurrent profile creation for different users', async () => {
        const createData1: CreateUserProfileDto = {
          name: 'Concurrent User 1',
        };

        const createData2: CreateUserProfileDto = {
          name: 'Concurrent User 2',
        };

        const [response1, response2] = await Promise.all([
          request(app.getHttpServer())
            .post('/users/profile')
            .set(authHeaders.JOHN_DOE)
            .send(createData1),
          request(app.getHttpServer())
            .post('/users/profile')
            .set(authHeaders.JANE_SMITH)
            .send(createData2),
        ]);

        expect(response1.status).toBe(201);
        expect(response2.status).toBe(201);

        const body1 = response1.body as UserProfileResponseDto;
        const body2 = response2.body as UserProfileResponseDto;

        expect(body1.name).toBe('Concurrent User 1');
        expect(body2.name).toBe('Concurrent User 2');
        expect(body1.id).toBeDefined();
        expect(body2.id).toBeDefined();
        expect(body1.id).not.toBe(body2.id);
      });
    });
  });
});
