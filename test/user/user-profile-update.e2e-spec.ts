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
import { UpdateUserProfileDto } from '../../src/user/controllers/dto/update-user-profile.dto';
import { FinancialStage } from '../../src/user/domain/entities/user.entity';
import { UserProfileResponseDto } from '../../src/user/dto/user-profile.dto';

describe('User Profile UPDATE Endpoints (e2e)', () => {
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

    // Recreate test users for each test
    for (const testUser of Object.values(TEST_USERS)) {
      await AuthTestUtils.createTestUserInDatabase(prisma, testUser);
    }
  });

  describe('PUT /users/profile', () => {
    describe('Happy Path', () => {
      it('should update user profile with all fields', async () => {
        const updateData: UpdateUserProfileDto = {
          name: 'John Updated',
          financialStage: FinancialStage.START_INVESTING,
          currency: Currency.EUR,
          language: Language.EN,
        };

        const response = await request(app.getHttpServer())
          .put('/users/profile')
          .set(authHeaders.JOHN_DOE)
          .send(updateData)
          .expect(200);

        const body = response.body as UserProfileResponseDto;

        expect(body.id).toBeDefined();
        expect(body.name).toBe('John Updated');
        expect(body.financialStage).toBe(FinancialStage.START_INVESTING);
        expect(body.createdAt).toBeDefined();
        expect(body.updatedAt).toBeDefined();

        // Verify data was persisted in database
        const userInDb = await prisma.public_users.findUnique({
          where: { user_id: TEST_USERS.JOHN_DOE.id },
        });

        expect(userInDb?.name).toBe('John Updated');
        expect(userInDb?.financial_stage).toBe(FinancialStage.START_INVESTING);
        expect(userInDb?.currency).toBe(Currency.EUR);
        expect(userInDb?.language).toBe(Language.EN);
      });

      it('should update user profile with partial fields (name only)', async () => {
        const updateData: UpdateUserProfileDto = {
          name: 'Partial Update',
        };

        const response = await request(app.getHttpServer())
          .put('/users/profile')
          .set(authHeaders.JOHN_DOE)
          .send(updateData)
          .expect(200);

        const body = response.body as UserProfileResponseDto;
        expect(body.name).toBe('Partial Update');

        // Verify other fields weren't changed
        const userInDb = await prisma.public_users.findUnique({
          where: { user_id: TEST_USERS.JOHN_DOE.id },
        });

        expect(userInDb?.name).toBe('Partial Update');
        // Original values should be preserved
        expect(userInDb?.currency).toBe(Currency.VND); // Default from test data
        expect(userInDb?.language).toBe(Language.VI); // Default from test data
      });

      it('should update user profile with partial fields (financial stage only)', async () => {
        const updateData: UpdateUserProfileDto = {
          financialStage: FinancialStage.DEBT,
        };

        const response = await request(app.getHttpServer())
          .put('/users/profile')
          .set(authHeaders.JOHN_DOE)
          .send(updateData)
          .expect(200);

        const body = response.body as UserProfileResponseDto;
        expect(body.financialStage).toBe(FinancialStage.DEBT);

        // Verify in database
        const userInDb = await prisma.public_users.findUnique({
          where: { user_id: TEST_USERS.JOHN_DOE.id },
        });

        expect(userInDb?.financial_stage).toBe(FinancialStage.DEBT);
      });

      it('should update user profile with currency and language only', async () => {
        const updateData: UpdateUserProfileDto = {
          currency: Currency.USD,
          language: Language.EN,
        };

        await request(app.getHttpServer())
          .put('/users/profile')
          .set(authHeaders.JOHN_DOE)
          .send(updateData)
          .expect(200);

        // Verify in database
        const userInDb = await prisma.public_users.findUnique({
          where: { user_id: TEST_USERS.JOHN_DOE.id },
        });

        expect(userInDb?.currency).toBe(Currency.USD);
        expect(userInDb?.language).toBe(Language.EN);
      });

      it('should handle empty update payload', async () => {
        const updateData: UpdateUserProfileDto = {};

        const response = await request(app.getHttpServer())
          .put('/users/profile')
          .set(authHeaders.JOHN_DOE)
          .send(updateData)
          .expect(200);

        const body = response.body as UserProfileResponseDto;
        expect(body.id).toBeDefined();
        expect(body.name).toBeDefined();
      });
    });

    describe('Authentication', () => {
      it('should return 403 when not authenticated', async () => {
        const updateData: UpdateUserProfileDto = {
          name: 'Should Fail',
        };

        await request(app.getHttpServer())
          .put('/users/profile')
          .send(updateData)
          .expect(403);
      });

      it('should return 403 with invalid authentication token', async () => {
        const updateData: UpdateUserProfileDto = {
          name: 'Should Fail',
        };

        await request(app.getHttpServer())
          .put('/users/profile')
          .set('Authorization', 'Bearer invalid-token')
          .send(updateData)
          .expect(403);
      });

      it('should return 403 with malformed authorization header', async () => {
        const updateData: UpdateUserProfileDto = {
          name: 'Should Fail',
        };

        await request(app.getHttpServer())
          .put('/users/profile')
          .set('Authorization', 'invalid-format')
          .send(updateData)
          .expect(403);
      });

      it('should work with valid authentication for different users', async () => {
        const updateData: UpdateUserProfileDto = {
          name: 'Jane Updated',
        };

        const response = await request(app.getHttpServer())
          .put('/users/profile')
          .set(authHeaders.JANE_SMITH)
          .send(updateData)
          .expect(200);

        const body = response.body as UserProfileResponseDto;
        expect(body.name).toBe('Jane Updated');
        expect(body.id).toBeDefined();
      });
    });

    describe('Data Structure Validation', () => {
      it('should return correct response structure on successful update', async () => {
        const updateData: UpdateUserProfileDto = {
          name: 'Structure Test',
          financialStage: FinancialStage.START_SAVING,
        };

        const response = await request(app.getHttpServer())
          .put('/users/profile')
          .set(authHeaders.JOHN_DOE)
          .send(updateData)
          .expect(200);

        const body = response.body as UserProfileResponseDto;

        // Verify all required fields are present
        expect(body).toHaveProperty('id');
        expect(body).toHaveProperty('name');
        expect(body).toHaveProperty('financialStage');
        expect(body).toHaveProperty('onboardingCompletedAt');
        expect(body).toHaveProperty('createdAt');
        expect(body).toHaveProperty('updatedAt');

        // Verify data types
        expect(typeof body.id).toBe('string');
        expect(typeof body.name).toBe('string');
        expect(
          body.financialStage === null ||
            typeof body.financialStage === 'string',
        ).toBe(true);

        // Verify updated values
        expect(body.name).toBe('Structure Test');
        expect(body.financialStage).toBe(FinancialStage.START_SAVING);

        // Dates should be valid date strings
        expect(new Date(body.createdAt)).toBeInstanceOf(Date);
        expect(new Date(body.updatedAt)).toBeInstanceOf(Date);

        if (body.onboardingCompletedAt) {
          expect(new Date(body.onboardingCompletedAt)).toBeInstanceOf(Date);
        }
      });

      it('should maintain data consistency after update', async () => {
        const updateData: UpdateUserProfileDto = {
          name: 'Consistency Test',
          financialStage: FinancialStage.START_INVESTING,
          currency: Currency.USD,
          language: Language.EN,
        };

        const response = await request(app.getHttpServer())
          .put('/users/profile')
          .set(authHeaders.JOHN_DOE)
          .send(updateData)
          .expect(200);

        const body = response.body as UserProfileResponseDto;

        // Verify updatedAt is more recent than createdAt
        const createdAt = new Date(body.createdAt);
        const updatedAt = new Date(body.updatedAt);
        expect(updatedAt.getTime()).toBeGreaterThanOrEqual(createdAt.getTime());

        // Verify consistency between API response and database
        const userInDb = await prisma.public_users.findUnique({
          where: { user_id: TEST_USERS.JOHN_DOE.id },
        });

        expect(body.name).toBe(userInDb?.name);
        expect(body.financialStage).toBe(userInDb?.financial_stage);
      });
    });

    describe('Business Logic', () => {
      it('should preserve onboarding status when updating profile', async () => {
        // Set user as onboarded
        await prisma.public_users.update({
          where: { user_id: TEST_USERS.JOHN_DOE.id },
          data: {
            onboarding_completed_at: new Date('2024-01-01'),
            financial_stage: FinancialStage.START_SAVING,
          },
        });

        const updateData: UpdateUserProfileDto = {
          name: 'Onboarded User',
          financialStage: FinancialStage.START_INVESTING,
        };

        const response = await request(app.getHttpServer())
          .put('/users/profile')
          .set(authHeaders.JOHN_DOE)
          .send(updateData)
          .expect(200);

        const body = response.body as UserProfileResponseDto;

        expect(body.name).toBe('Onboarded User');
        expect(body.financialStage).toBe(FinancialStage.START_INVESTING);
        expect(body.onboardingCompletedAt).toBeTruthy();

        // Verify onboarding status preserved in database
        const userInDb = await prisma.public_users.findUnique({
          where: { user_id: TEST_USERS.JOHN_DOE.id },
        });

        expect(userInDb?.onboarding_completed_at).toBeTruthy();
      });

      it('should update profile for user without onboarding completed', async () => {
        // Ensure user has no onboarding completion
        await prisma.public_users.update({
          where: { user_id: TEST_USERS.JOHN_DOE.id },
          data: {
            onboarding_completed_at: null,
            financial_stage: null,
          },
        });

        const updateData: UpdateUserProfileDto = {
          name: 'Non-Onboarded User',
          financialStage: FinancialStage.DEBT,
        };

        const response = await request(app.getHttpServer())
          .put('/users/profile')
          .set(authHeaders.JOHN_DOE)
          .send(updateData)
          .expect(200);

        const body = response.body as UserProfileResponseDto;

        expect(body.name).toBe('Non-Onboarded User');
        expect(body.financialStage).toBe(FinancialStage.DEBT);
        expect(body.onboardingCompletedAt).toBeNull();
      });

      it('should handle updates with different financial stages', async () => {
        const testCases = [
          FinancialStage.DEBT,
          FinancialStage.START_SAVING,
          FinancialStage.START_INVESTING,
        ];

        for (const stage of testCases) {
          const updateData: UpdateUserProfileDto = {
            financialStage: stage,
          };

          const response = await request(app.getHttpServer())
            .put('/users/profile')
            .set(authHeaders.JOHN_DOE)
            .send(updateData)
            .expect(200);

          const body = response.body as UserProfileResponseDto;
          expect(body.financialStage).toBe(stage);

          // Verify in database
          const userInDb = await prisma.public_users.findUnique({
            where: { user_id: TEST_USERS.JOHN_DOE.id },
          });

          expect(userInDb?.financial_stage).toBe(stage);
        }
      });

      it('should handle updates with different currencies', async () => {
        const testCases = [Currency.USD, Currency.EUR, Currency.VND];

        for (const currency of testCases) {
          const updateData: UpdateUserProfileDto = {
            currency: currency,
          };

          await request(app.getHttpServer())
            .put('/users/profile')
            .set(authHeaders.JOHN_DOE)
            .send(updateData)
            .expect(200);

          // Verify in database
          const userInDb = await prisma.public_users.findUnique({
            where: { user_id: TEST_USERS.JOHN_DOE.id },
          });

          expect(userInDb?.currency).toBe(currency);
        }
      });

      it('should handle updates with different languages', async () => {
        const testCases = [Language.VI, Language.EN];

        for (const language of testCases) {
          const updateData: UpdateUserProfileDto = {
            language: language,
          };

          await request(app.getHttpServer())
            .put('/users/profile')
            .set(authHeaders.JOHN_DOE)
            .send(updateData)
            .expect(200);

          // Verify in database
          const userInDb = await prisma.public_users.findUnique({
            where: { user_id: TEST_USERS.JOHN_DOE.id },
          });

          expect(userInDb?.language).toBe(language);
        }
      });
    });

    describe('Error Handling', () => {
      it('should return 400 if name is too short', async () => {
        const updateData: UpdateUserProfileDto = {
          name: 'A', // Single character - gets accepted without validation
        };

        const response = await request(app.getHttpServer())
          .put('/users/profile')
          .set(authHeaders.JOHN_DOE)
          .send(updateData)
          .expect(400);

        expect(response.body).toHaveProperty('message');
      });

      it('should return 400 if name is too long', async () => {
        const updateData: UpdateUserProfileDto = {
          name: 'A'.repeat(101), // More than 100 characters - gets accepted without validation
        };

        const response = await request(app.getHttpServer())
          .put('/users/profile')
          .set(authHeaders.JOHN_DOE)
          .send(updateData)
          .expect(400);

        expect(response.body).toHaveProperty('message');
      });

      it('should return 400 if financial stage is invalid', async () => {
        const updateData = {
          financialStage: 'invalid_stage',
        };

        const response = await request(app.getHttpServer())
          .put('/users/profile')
          .set(authHeaders.JOHN_DOE)
          .send(updateData)
          .expect(400);

        expect(response.body).toHaveProperty('message');
      });

      it('should return 400 if currency is invalid', async () => {
        const updateData = {
          currency: 'invalid_currency',
        };

        const response = await request(app.getHttpServer())
          .put('/users/profile')
          .set(authHeaders.JOHN_DOE)
          .send(updateData)
          .expect(400);

        expect(response.body).toHaveProperty('message');
      });

      it('should return 400 for invalid language (no validation pipe configured)', async () => {
        const updateData = {
          language: 'invalid_language',
        };

        const response = await request(app.getHttpServer())
          .put('/users/profile')
          .set(authHeaders.JOHN_DOE)
          .send(updateData)
          .expect(400);

        expect(response.body).toHaveProperty('message');
      });

      it('should return 400 if name is not a string', async () => {
        const updateData = {
          name: 123, // Should be string
        };

        const response = await request(app.getHttpServer())
          .put('/users/profile')
          .set(authHeaders.JOHN_DOE)
          .send(updateData)
          .expect(400);

        expect(response.body).toHaveProperty('message');
      });

      it('should return 400 if multiple validation errors occur', async () => {
        const updateData = {
          name: 123, // Invalid type
          financialStage: 'invalid_stage', // Invalid enum
          currency: 'invalid_currency', // Invalid enum
          language: 'invalid_language', // Invalid enum
        };

        const response = await request(app.getHttpServer())
          .put('/users/profile')
          .set(authHeaders.JOHN_DOE)
          .send(updateData)
          .expect(400);

        expect(response.body).toHaveProperty('message');
      });

      it('should return 404 if user profile not found in database', async () => {
        // Delete the user from public_users table but keep auth
        await prisma.public_users.delete({
          where: { user_id: TEST_USERS.JOHN_DOE.id },
        });

        const updateData: UpdateUserProfileDto = {
          name: 'Should Fail',
        };

        await request(app.getHttpServer())
          .put('/users/profile')
          .set(authHeaders.JOHN_DOE)
          .send(updateData)
          .expect(404);
      });

      it('should handle malformed JSON payload', async () => {
        await request(app.getHttpServer())
          .put('/users/profile')
          .set(authHeaders.JOHN_DOE)
          .set('Content-Type', 'application/json')
          .send('{ invalid json }')
          .expect(400);
      });

      it('should return 400 if name is only whitespace', async () => {
        const updateData: UpdateUserProfileDto = {
          name: '   ', // Only whitespace - gets accepted without validation
        };

        const response = await request(app.getHttpServer())
          .put('/users/profile')
          .set(authHeaders.JOHN_DOE)
          .send(updateData)
          .expect(400);

        expect(response.body).toHaveProperty('message');
      });
    });

    describe('Performance', () => {
      it('should respond within reasonable time for profile update', async () => {
        const updateData: UpdateUserProfileDto = {
          name: 'Performance Test',
          financialStage: FinancialStage.START_INVESTING,
          currency: Currency.USD,
          language: Language.EN,
        };

        const startTime = Date.now();

        await request(app.getHttpServer())
          .put('/users/profile')
          .set(authHeaders.JOHN_DOE)
          .send(updateData)
          .expect(200);

        const endTime = Date.now();
        const responseTime = endTime - startTime;

        expect(responseTime).toBeLessThan(1000); // Should respond within 1 second
      });

      it('should handle concurrent updates for different users', async () => {
        const updateData1: UpdateUserProfileDto = {
          name: 'Concurrent User 1',
        };

        const updateData2: UpdateUserProfileDto = {
          name: 'Concurrent User 2',
        };

        const [response1, response2] = await Promise.all([
          request(app.getHttpServer())
            .put('/users/profile')
            .set(authHeaders.JOHN_DOE)
            .send(updateData1),
          request(app.getHttpServer())
            .put('/users/profile')
            .set(authHeaders.JANE_SMITH)
            .send(updateData2),
        ]);

        expect(response1.status).toBe(200);
        expect(response2.status).toBe(200);

        const body1 = response1.body as UserProfileResponseDto;
        const body2 = response2.body as UserProfileResponseDto;

        expect(body1.name).toBe('Concurrent User 1');
        expect(body2.name).toBe('Concurrent User 2');
        expect(body1.id).toBeDefined();
        expect(body2.id).toBeDefined();
        expect(body1.id).not.toBe(body2.id);
      });

      it('should maintain performance with minimal data payload', async () => {
        const updateData: UpdateUserProfileDto = {
          name: 'Minimal Update',
        };

        const startTime = Date.now();

        await request(app.getHttpServer())
          .put('/users/profile')
          .set(authHeaders.JOHN_DOE)
          .send(updateData)
          .expect(200);

        const endTime = Date.now();
        const responseTime = endTime - startTime;

        expect(responseTime).toBeLessThan(500); // Should be even faster with minimal data
      });
    });
  });
});
