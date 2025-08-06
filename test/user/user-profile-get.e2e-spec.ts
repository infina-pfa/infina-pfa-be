import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaClient } from '../../generated/prisma';
import { UserProfileResponseDto } from '../../src/user/controllers/dto/user-profile.dto';
import { AppSetup } from '../setup/app.setup';
import { TestDatabaseManager } from '../setup/database.setup';
import { AuthTestUtils, TestUser } from '../utils/auth.utils';

describe('User Profile GET Endpoints (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaClient;
  let authHeaders: Record<string, { Authorization: string }>;
  let testUsers: { [key: string]: TestUser } = {};
  beforeAll(async () => {
    const { app: appInstance, prisma: prismaInstance } =
      await AppSetup.initApp();
    app = appInstance;
    prisma = prismaInstance;
  });

  afterAll(async () => {
    await TestDatabaseManager.cleanupTestDatabase();
    await AuthTestUtils.cleanupTestUsers(prisma, Object.values(testUsers));
    await TestDatabaseManager.teardownTestDatabase();
    await app.close();
  });

  beforeEach(async () => {
    // Clean up test data before each test
    await TestDatabaseManager.cleanupTestDatabase();

    const authSetup = await AuthTestUtils.setupTestAuthentication(prisma);
    authHeaders = authSetup.authHeaders;
    testUsers = authSetup.testUsers;
  });

  describe('GET /users/profile', () => {
    it('should return current user profile', async () => {
      const response = await request(app.getHttpServer())
        .get('/users/profile')
        .set(authHeaders.JOHN_DOE)
        .expect(200);

      const body = response.body as UserProfileResponseDto;

      expect(body.id).toBeDefined();
      expect(body.name).toBeDefined();
      expect(body.createdAt).toBeDefined();
      expect(body.updatedAt).toBeDefined();

      // Financial stage and onboarding can be null for new users
      expect(body.financialStage).toBeDefined();
      expect(body.onboardingCompletedAt).toBeDefined();
    });

    it('should return 403 when not authenticated', async () => {
      await request(app.getHttpServer()).get('/users/profile').expect(403);
    });

    it('should return 403 with invalid authentication token', async () => {
      await request(app.getHttpServer())
        .get('/users/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(403);
    });

    it('should return correct user data structure', async () => {
      const response = await request(app.getHttpServer())
        .get('/users/profile')
        .set(authHeaders.JOHN_DOE)
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

      // Financial stage can be string or null
      expect(
        body.financialStage === null || typeof body.financialStage === 'string',
      ).toBe(true);

      // Dates should be valid date strings
      expect(new Date(body.createdAt)).toBeInstanceOf(Date);
      expect(new Date(body.updatedAt)).toBeInstanceOf(Date);

      if (body.onboardingCompletedAt) {
        expect(new Date(body.onboardingCompletedAt)).toBeInstanceOf(Date);
      }
    });
  });

  describe('Profile endpoint behavior', () => {
    it('should handle user with completed onboarding', async () => {
      // Update user to have completed onboarding
      await prisma.public_users.update({
        where: { user_id: testUsers.JOHN_DOE.id },
        data: {
          onboarding_completed_at: new Date(),
          financial_stage: 'start_investing',
        },
      });

      const response = await request(app.getHttpServer())
        .get('/users/profile')
        .set(authHeaders.JOHN_DOE)
        .expect(200);

      const body = response.body as UserProfileResponseDto;
      expect(body.financialStage).toBe('start_investing');
      expect(body.onboardingCompletedAt).toBeTruthy();
    });

    it('should handle user without completed onboarding', async () => {
      // Ensure user has no onboarding completion
      await prisma.public_users.update({
        where: { user_id: testUsers.JOHN_DOE.id },
        data: {
          onboarding_completed_at: null,
          financial_stage: null,
        },
      });

      const response = await request(app.getHttpServer())
        .get('/users/profile')
        .set(authHeaders.JOHN_DOE)
        .expect(200);

      const body = response.body as UserProfileResponseDto;
      expect(body.financialStage).toBeNull();
      expect(body.onboardingCompletedAt).toBeNull();
    });

    it('should return 404 if user profile not found in database', async () => {
      // Delete the user from public_users table but keep auth
      await prisma.public_users.delete({
        where: { user_id: testUsers.JOHN_DOE.id },
      });

      await request(app.getHttpServer())
        .get('/users/profile')
        .set(authHeaders.JOHN_DOE)
        .expect(404);
    });
  });

  describe('Performance', () => {
    it('should respond within reasonable time', async () => {
      const startTime = Date.now();

      await request(app.getHttpServer())
        .get('/users/profile')
        .set(authHeaders.JOHN_DOE)
        .expect(200);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(responseTime).toBeLessThan(500); // Should respond within 500ms
    });
  });
});
