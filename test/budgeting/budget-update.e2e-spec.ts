import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppSetup } from '../setup/app.setup';
import { PrismaClient } from '../../generated/prisma';
import { BudgetResponseDto } from '../../src/budgeting/controllers/dto/budget.dto';
import { UpdateBudgetDto } from '../../src/budgeting/controllers/dto/update-budget.dto';
import { BudgetCategory } from '../../src/budgeting/domain';
import { TestDatabaseManager } from '../setup/database.setup';
import { AuthTestUtils, TestUser } from '../utils/auth.utils';

describe('Budget UPDATE Endpoint (e2e)', () => {
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

  // Helper function to create test budgets
  const createTestBudget = async (
    userId: string,
    name: string,
    amount: number,
    month: number,
    year: number,
    category: BudgetCategory = BudgetCategory.FIXED,
    color: string = '#FF5733',
    icon: string = 'shopping-cart',
    archivedAt?: Date,
  ) => {
    return await prisma.budgets.create({
      data: {
        name,
        amount: amount.toString(),
        user_id: userId,
        category,
        color,
        icon,
        month,
        year,
        created_at: new Date(),
        updated_at: new Date(),
        archived_at: archivedAt || null,
      },
    });
  };

  describe('PATCH /budgets/:id', () => {
    describe('Happy Path', () => {
      it('should update budget name successfully', async () => {
        // Create test budget
        const budget = await createTestBudget(
          testUsers.JOHN_DOE.id,
          'Original Name',
          500,
          7,
          2025,
        );

        const updateData: UpdateBudgetDto = {
          name: 'Updated Budget Name',
        };

        const response = await request(app.getHttpServer())
          .patch(`/budgets/${budget.id}`)
          .set(authHeaders.JOHN_DOE)
          .send(updateData);

        expect(response.status).toBe(200);

        const body = response.body as BudgetResponseDto;

        expect(body.id).toBe(budget.id);
        expect(body.name).toBe('Updated Budget Name');
        expect(body.amount).toBe(500);
        expect(body.userId).toBe(testUsers.JOHN_DOE.id);
        expect(body.category).toBe(BudgetCategory.FIXED);
        expect(body.color).toBe('#FF5733');
        expect(body.icon).toBe('shopping-cart');
        expect(body.month).toBe(7);
        expect(body.year).toBe(2025);
        expect(body.createdAt).toBeDefined();
        expect(body.updatedAt).toBeDefined();

        // Verify database was updated
        const updatedBudget = await prisma.budgets.findUnique({
          where: { id: budget.id },
        });
        expect(updatedBudget?.name).toBe('Updated Budget Name');
      });

      it('should update budget category successfully', async () => {
        // Create test budget with FIXED category
        const budget = await createTestBudget(
          testUsers.JANE_SMITH.id,
          'Test Budget',
          800,
          8,
          2025,
          BudgetCategory.FIXED,
        );

        const updateData: UpdateBudgetDto = {
          category: BudgetCategory.FLEXIBLE,
        };

        const response = await request(app.getHttpServer())
          .patch(`/budgets/${budget.id}`)
          .set(authHeaders.JANE_SMITH)
          .send(updateData)
          .expect(200);

        const body = response.body as BudgetResponseDto;

        expect(body.id).toBe(budget.id);
        expect(body.name).toBe('Test Budget');
        expect(body.category).toBe(BudgetCategory.FLEXIBLE);
        expect(body.amount).toBe(800);
        expect(body.userId).toBe(testUsers.JANE_SMITH.id);

        // Verify database was updated
        const updatedBudget = await prisma.budgets.findUnique({
          where: { id: budget.id },
        });
        expect(updatedBudget?.category).toBe(BudgetCategory.FLEXIBLE);
      });

      it('should update budget color and icon successfully', async () => {
        // Create test budget
        const budget = await createTestBudget(
          testUsers.ADMIN_USER.id,
          'Visual Test Budget',
          300,
          9,
          2025,
          BudgetCategory.FIXED,
          '#FF0000',
          'old-icon',
        );

        const updateData: UpdateBudgetDto = {
          color: '#00FF00',
          icon: 'new-icon',
        };

        const response = await request(app.getHttpServer())
          .patch(`/budgets/${budget.id}`)
          .set(authHeaders.ADMIN_USER)
          .send(updateData)
          .expect(200);

        const body = response.body as BudgetResponseDto;

        expect(body.id).toBe(budget.id);
        expect(body.name).toBe('Visual Test Budget');
        expect(body.color).toBe('#00FF00');
        expect(body.icon).toBe('new-icon');
        expect(body.amount).toBe(300);
        expect(body.category).toBe(BudgetCategory.FIXED);

        // Verify database was updated
        const updatedBudget = await prisma.budgets.findUnique({
          where: { id: budget.id },
        });
        expect(updatedBudget?.color).toBe('#00FF00');
        expect(updatedBudget?.icon).toBe('new-icon');
      });

      it('should update multiple budget fields simultaneously', async () => {
        // Create test budget
        const budget = await createTestBudget(
          testUsers.JOHN_DOE.id,
          'Multi Update Test',
          600,
          10,
          2025,
          BudgetCategory.FIXED,
          '#FFFFFF',
          'old-icon',
        );

        const updateData: UpdateBudgetDto = {
          name: 'Completely Updated Budget',
          category: BudgetCategory.FLEXIBLE,
          color: '#123456',
          icon: 'updated-icon',
        };

        const response = await request(app.getHttpServer())
          .patch(`/budgets/${budget.id}`)
          .set(authHeaders.JOHN_DOE)
          .send(updateData)
          .expect(200);

        const body = response.body as BudgetResponseDto;

        expect(body.id).toBe(budget.id);
        expect(body.name).toBe('Completely Updated Budget');
        expect(body.category).toBe(BudgetCategory.FLEXIBLE);
        expect(body.color).toBe('#123456');
        expect(body.icon).toBe('updated-icon');
        expect(body.amount).toBe(600); // Should remain unchanged
        expect(body.userId).toBe(testUsers.JOHN_DOE.id);
        expect(body.month).toBe(10); // Should remain unchanged
        expect(body.year).toBe(2025); // Should remain unchanged

        // Verify database was updated
        const updatedBudget = await prisma.budgets.findUnique({
          where: { id: budget.id },
        });
        expect(updatedBudget?.name).toBe('Completely Updated Budget');
        expect(updatedBudget?.category).toBe(BudgetCategory.FLEXIBLE);
        expect(updatedBudget?.color).toBe('#123456');
        expect(updatedBudget?.icon).toBe('updated-icon');
      });

      it('should update budget with empty update (no changes)', async () => {
        // Create test budget
        const budget = await createTestBudget(
          testUsers.JANE_SMITH.id,
          'No Change Budget',
          400,
          11,
          2025,
        );

        const updateData: UpdateBudgetDto = {};

        const response = await request(app.getHttpServer())
          .patch(`/budgets/${budget.id}`)
          .set(authHeaders.JANE_SMITH)
          .send(updateData)
          .expect(200);

        const body = response.body as BudgetResponseDto;

        // All fields should remain the same
        expect(body.id).toBe(budget.id);
        expect(body.name).toBe('No Change Budget');
        expect(body.amount).toBe(400);
        expect(body.category).toBe(BudgetCategory.FIXED);
        expect(body.color).toBe('#FF5733');
        expect(body.icon).toBe('shopping-cart');
        expect(body.userId).toBe(testUsers.JANE_SMITH.id);
      });

      it('should preserve timestamps correctly on update', async () => {
        const beforeCreate = new Date();

        // Create test budget
        const budget = await createTestBudget(
          testUsers.ADMIN_USER.id,
          'Timestamp Test',
          500,
          12,
          2025,
        );

        const afterCreate = new Date();

        // Wait a bit before updating
        await new Promise((resolve) => setTimeout(resolve, 100));

        const beforeUpdate = new Date();

        const updateData: UpdateBudgetDto = {
          name: 'Updated Timestamp Test',
        };

        const response = await request(app.getHttpServer())
          .patch(`/budgets/${budget.id}`)
          .set(authHeaders.ADMIN_USER)
          .send(updateData)
          .expect(200);

        const afterUpdate = new Date();
        const body = response.body as BudgetResponseDto;

        const createdAt = new Date(body.createdAt);
        const updatedAt = new Date(body.updatedAt);

        // CreatedAt should be close to original creation time
        expect(createdAt.getTime()).toBeGreaterThanOrEqual(
          beforeCreate.getTime() - 1000,
        );
        expect(createdAt.getTime()).toBeLessThanOrEqual(
          afterCreate.getTime() + 1000,
        );

        // UpdatedAt should be close to update time
        expect(updatedAt.getTime()).toBeGreaterThanOrEqual(
          beforeUpdate.getTime() - 1000,
        );
        expect(updatedAt.getTime()).toBeLessThanOrEqual(
          afterUpdate.getTime() + 1000,
        );

        // UpdatedAt should be after createdAt
        expect(updatedAt.getTime()).toBeGreaterThan(createdAt.getTime());
      });
    });

    describe('Authentication Tests', () => {
      it('should return 403 for unauthenticated requests', async () => {
        // Create test budget
        const budget = await createTestBudget(
          testUsers.JOHN_DOE.id,
          'Auth Test Budget',
          500,
          7,
          2025,
        );

        const updateData: UpdateBudgetDto = {
          name: 'Updated Name',
        };

        await request(app.getHttpServer())
          .patch(`/budgets/${budget.id}`)
          .send(updateData)
          .expect(403); // MockGuard returns 403 for unauthenticated requests
      });

      it('should return 403 with invalid authentication token', async () => {
        // Create test budget
        const budget = await createTestBudget(
          testUsers.JOHN_DOE.id,
          'Invalid Auth Test',
          500,
          7,
          2025,
        );

        const updateData: UpdateBudgetDto = {
          name: 'Updated Name',
        };

        await request(app.getHttpServer())
          .patch(`/budgets/${budget.id}`)
          .set('Authorization', 'Bearer invalid-token')
          .send(updateData)
          .expect(403);
      });

      it('should return 404 when users try to update budgets belonging to other users', async () => {
        // Create budget for John
        const johnBudget = await createTestBudget(
          testUsers.JOHN_DOE.id,
          'John Budget',
          500,
          7,
          2025,
        );

        const updateData: UpdateBudgetDto = {
          name: 'Malicious Update',
        };

        // Try to update John's budget as Jane
        const response = await request(app.getHttpServer())
          .patch(`/budgets/${johnBudget.id}`)
          .set(authHeaders.JANE_SMITH)
          .send(updateData)
          .expect(404);

        expect(response.body).toHaveProperty('message');

        // Verify budget was not updated
        const unchangedBudget = await prisma.budgets.findUnique({
          where: { id: johnBudget.id },
        });
        expect(unchangedBudget?.name).toBe('John Budget');
      });

      it('should successfully update own budget with valid authentication', async () => {
        // Create budget for Jane
        const janeBudget = await createTestBudget(
          testUsers.JANE_SMITH.id,
          'Jane Budget',
          600,
          8,
          2025,
        );

        const updateData: UpdateBudgetDto = {
          name: 'Jane Updated Budget',
        };

        const response = await request(app.getHttpServer())
          .patch(`/budgets/${janeBudget.id}`)
          .set(authHeaders.JANE_SMITH)
          .send(updateData)
          .expect(200);

        const body = response.body as BudgetResponseDto;
        expect(body.name).toBe('Jane Updated Budget');
        expect(body.userId).toBe(testUsers.JANE_SMITH.id);
      });
    });

    describe('Data Validation Tests', () => {
      it('should validate required string fields are not empty', async () => {
        // Create test budget
        const budget = await createTestBudget(
          testUsers.JOHN_DOE.id,
          'Validation Test',
          500,
          7,
          2025,
        );

        const updateData = {
          name: '', // Empty string should fail validation
        };

        const response = await request(app.getHttpServer())
          .patch(`/budgets/${budget.id}`)
          .set(authHeaders.JOHN_DOE)
          .send(updateData)
          .expect(400);

        expect(response.body).toHaveProperty('message');
      });

      it('should validate budget category enum values', async () => {
        // Create test budget
        const budget = await createTestBudget(
          testUsers.JANE_SMITH.id,
          'Category Validation Test',
          500,
          7,
          2025,
        );

        const updateData = {
          category: 'invalid_category', // Invalid enum value
        };

        const response = await request(app.getHttpServer())
          .patch(`/budgets/${budget.id}`)
          .set(authHeaders.JANE_SMITH)
          .send(updateData)
          .expect(400);

        expect(response.body).toHaveProperty('message');
      });

      it('should reject amount field in updates', async () => {
        // Create test budget
        const budget = await createTestBudget(
          testUsers.ADMIN_USER.id,
          'Amount Update Test',
          500,
          7,
          2025,
        );

        const updateData = {
          name: 'Updated Name',
          amount: 1000, // Amount field should be rejected
        };

        const response = await request(app.getHttpServer())
          .patch(`/budgets/${budget.id}`)
          .set(authHeaders.ADMIN_USER)
          .send(updateData)
          .expect(400);

        expect(response.body).toHaveProperty('message');
      });

      it('should reject unknown fields in request body', async () => {
        // Create test budget
        const budget = await createTestBudget(
          testUsers.JOHN_DOE.id,
          'Unknown Fields Test',
          500,
          7,
          2025,
        );

        const updateData = {
          name: 'Valid Update',
          unknownField: 'should be rejected',
          anotherUnknownField: 12345,
        };

        const response = await request(app.getHttpServer())
          .patch(`/budgets/${budget.id}`)
          .set(authHeaders.JOHN_DOE)
          .send(updateData)
          .expect(400);

        expect(response.body).toHaveProperty('message');
      });
    });

    describe('Error Handling Tests', () => {
      it('should return 404 for non-existent budget ID', async () => {
        const nonExistentId = '123e4567-e89b-12d3-a456-426614174999';

        const updateData: UpdateBudgetDto = {
          name: 'Update Non-existent',
        };

        const response = await request(app.getHttpServer())
          .patch(`/budgets/${nonExistentId}`)
          .set(authHeaders.JOHN_DOE)
          .send(updateData)
          .expect(404);

        expect(response.body).toHaveProperty('message');
      });

      it('should return 404 for archived budgets', async () => {
        // Create archived budget
        const archivedBudget = await createTestBudget(
          testUsers.JOHN_DOE.id,
          'Archived Budget',
          500,
          7,
          2025,
          BudgetCategory.FIXED,
          '#FF5733',
          'shopping-cart',
          new Date(), // archived_at
        );

        const updateData: UpdateBudgetDto = {
          name: 'Update Archived',
        };

        const response = await request(app.getHttpServer())
          .patch(`/budgets/${archivedBudget.id}`)
          .set(authHeaders.JOHN_DOE)
          .send(updateData)
          .expect(404);

        expect(response.body).toHaveProperty('message');

        // Verify budget was not updated
        const unchangedBudget = await prisma.budgets.findUnique({
          where: { id: archivedBudget.id },
        });
        expect(unchangedBudget?.name).toBe('Archived Budget');
      });

      it('should return 400 for invalid UUID format', async () => {
        const invalidUuid = 'invalid-uuid-format';

        const updateData: UpdateBudgetDto = {
          name: 'Update Invalid UUID',
        };

        const response = await request(app.getHttpServer())
          .patch(`/budgets/${invalidUuid}`)
          .set(authHeaders.JOHN_DOE)
          .send(updateData)
          .expect(400);

        expect(response.body).toHaveProperty('message');
      });

      it('should return 400 for malformed JSON in request body', async () => {
        // Create test budget
        const budget = await createTestBudget(
          testUsers.JANE_SMITH.id,
          'JSON Test Budget',
          500,
          7,
          2025,
        );

        await request(app.getHttpServer())
          .patch(`/budgets/${budget.id}`)
          .set(authHeaders.JANE_SMITH)
          .set('Content-Type', 'application/json')
          .send('{ invalid json }')
          .expect(400);
      });

      it('should handle validation errors gracefully', async () => {
        // Create test budget
        const budget = await createTestBudget(
          testUsers.ADMIN_USER.id,
          'Validation Test',
          500,
          7,
          2025,
        );

        // Try to update with empty string (validation should fail)
        const updateData = {
          name: '', // Empty name should fail validation
        };

        const response = await request(app.getHttpServer())
          .patch(`/budgets/${budget.id}`)
          .set(authHeaders.ADMIN_USER)
          .send(updateData)
          .expect(400);

        expect(response.body).toHaveProperty('message');
      });
    });

    describe('Business Logic Tests', () => {
      it('should preserve budget month and year on update', async () => {
        // Create test budget
        const budget = await createTestBudget(
          testUsers.JOHN_DOE.id,
          'Business Logic Test',
          500,
          7,
          2025,
        );

        const updateData: UpdateBudgetDto = {
          name: 'Updated Business Logic Test',
          category: BudgetCategory.FLEXIBLE,
        };

        const response = await request(app.getHttpServer())
          .patch(`/budgets/${budget.id}`)
          .set(authHeaders.JOHN_DOE)
          .send(updateData)
          .expect(200);

        const body = response.body as BudgetResponseDto;

        // Month and year should remain unchanged
        expect(body.month).toBe(7);
        expect(body.year).toBe(2025);
        expect(body.name).toBe('Updated Business Logic Test');
        expect(body.category).toBe(BudgetCategory.FLEXIBLE);
      });

      it('should preserve budget userId on update', async () => {
        // Create test budget
        const budget = await createTestBudget(
          testUsers.JANE_SMITH.id,
          'User ID Preservation Test',
          500,
          8,
          2025,
        );

        const updateData: UpdateBudgetDto = {
          name: 'Updated User ID Test',
          color: '#ABCDEF',
        };

        const response = await request(app.getHttpServer())
          .patch(`/budgets/${budget.id}`)
          .set(authHeaders.JANE_SMITH)
          .send(updateData)
          .expect(200);

        const body = response.body as BudgetResponseDto;

        // User ID should remain unchanged
        expect(body.userId).toBe(testUsers.JANE_SMITH.id);
        expect(body.name).toBe('Updated User ID Test');
        expect(body.color).toBe('#ABCDEF');
      });

      it('should not affect spending calculations when updating budget metadata', async () => {
        // Create test budget
        const budget = await createTestBudget(
          testUsers.ADMIN_USER.id,
          'Spending Test Budget',
          1000,
          9,
          2025,
        );

        // Create some transactions for the budget
        const transaction = await prisma.transactions.create({
          data: {
            name: 'Test Transaction',
            amount: '250.00',
            description: 'Test spending',
            recurring: 0,
            type: 'outcome',
            created_at: new Date(),
            updated_at: new Date(),
          },
        });

        await prisma.budget_transactions.create({
          data: {
            user_id: testUsers.ADMIN_USER.id,
            budget_id: budget.id,
            transaction_id: transaction.id,
            created_at: new Date(),
            updated_at: new Date(),
          },
        });

        const updateData: UpdateBudgetDto = {
          name: 'Updated Spending Test',
          color: '#000000',
        };

        const response = await request(app.getHttpServer())
          .patch(`/budgets/${budget.id}`)
          .set(authHeaders.ADMIN_USER)
          .send(updateData)
          .expect(200);

        const body = response.body as BudgetResponseDto;

        expect(body.name).toBe('Updated Spending Test');
        expect(body.color).toBe('#000000');
        expect(body.amount).toBe(1000);
        // Spending should be preserved
        expect(body.spent).toBe(250);
      });

      it('should handle concurrent updates correctly', async () => {
        // Create test budget
        const budget = await createTestBudget(
          testUsers.JOHN_DOE.id,
          'Concurrent Test',
          500,
          10,
          2025,
        );

        // Prepare two different updates
        const updateData1: UpdateBudgetDto = {
          name: 'First Update',
          color: '#111111',
        };

        const updateData2: UpdateBudgetDto = {
          name: 'Second Update',
          color: '#222222',
        };

        // Execute concurrent updates
        const [response1, response2] = await Promise.allSettled([
          request(app.getHttpServer())
            .patch(`/budgets/${budget.id}`)
            .set(authHeaders.JOHN_DOE)
            .send(updateData1),
          request(app.getHttpServer())
            .patch(`/budgets/${budget.id}`)
            .set(authHeaders.JOHN_DOE)
            .send(updateData2),
        ]);

        // Both requests should succeed (last-write-wins scenario)
        expect(response1.status).toBe('fulfilled');
        expect(response2.status).toBe('fulfilled');

        if (
          response1.status === 'fulfilled' &&
          response2.status === 'fulfilled'
        ) {
          expect(response1.value.status).toBe(200);
          expect(response2.value.status).toBe(200);
        }

        // Verify final state in database
        const finalBudget = await prisma.budgets.findUnique({
          where: { id: budget.id },
        });
        expect(finalBudget).toBeDefined();
        expect(['First Update', 'Second Update']).toContain(finalBudget?.name);
      });
    });

    describe('Data Validation and Response Structure', () => {
      it('should return correct response structure with all required fields', async () => {
        // Create test budget
        const budget = await createTestBudget(
          testUsers.JANE_SMITH.id,
          'Structure Test',
          750,
          11,
          2025,
          BudgetCategory.FLEXIBLE,
          '#ABCDEF',
          'test-icon',
        );

        const updateData: UpdateBudgetDto = {
          name: 'Updated Structure Test',
          category: BudgetCategory.FIXED,
        };

        const response = await request(app.getHttpServer())
          .patch(`/budgets/${budget.id}`)
          .set(authHeaders.JANE_SMITH)
          .send(updateData)
          .expect(200);

        const body = response.body as BudgetResponseDto;

        // Verify all required fields are present
        expect(body).toHaveProperty('id');
        expect(body).toHaveProperty('name');
        expect(body).toHaveProperty('amount');
        expect(body).toHaveProperty('userId');
        expect(body).toHaveProperty('category');
        expect(body).toHaveProperty('color');
        expect(body).toHaveProperty('icon');
        expect(body).toHaveProperty('month');
        expect(body).toHaveProperty('year');
        expect(body).toHaveProperty('spent');
        expect(body).toHaveProperty('createdAt');
        expect(body).toHaveProperty('updatedAt');

        // Verify data types
        expect(typeof body.id).toBe('string');
        expect(typeof body.name).toBe('string');
        expect(typeof body.amount).toBe('number');
        expect(typeof body.userId).toBe('string');
        expect(typeof body.category).toBe('string');
        expect(typeof body.color).toBe('string');
        expect(typeof body.icon).toBe('string');
        expect(typeof body.month).toBe('number');
        expect(typeof body.year).toBe('number');
        expect(typeof body.spent).toBe('number');

        // Verify updated values
        expect(body.name).toBe('Updated Structure Test');
        expect(body.category).toBe(BudgetCategory.FIXED);

        // Verify unchanged values
        expect(body.amount).toBe(750);
        expect(body.color).toBe('#ABCDEF');
        expect(body.icon).toBe('test-icon');
        expect(body.month).toBe(11);
        expect(body.year).toBe(2025);
        expect(body.userId).toBe(testUsers.JANE_SMITH.id);
      });

      it('should maintain data consistency between API response and database', async () => {
        // Create test budget
        const budget = await createTestBudget(
          testUsers.ADMIN_USER.id,
          'Consistency Test',
          900,
          12,
          2025,
        );

        const updateData: UpdateBudgetDto = {
          name: 'Updated Consistency Test',
          category: BudgetCategory.FLEXIBLE,
          color: '#FEDCBA',
          icon: 'updated-icon',
        };

        const response = await request(app.getHttpServer())
          .patch(`/budgets/${budget.id}`)
          .set(authHeaders.ADMIN_USER)
          .send(updateData)
          .expect(200);

        const body = response.body as BudgetResponseDto;

        // Verify API response matches database
        const dbBudget = await prisma.budgets.findUnique({
          where: { id: budget.id },
        });

        expect(dbBudget).toBeDefined();
        expect(body.id).toBe(dbBudget!.id);
        expect(body.name).toBe(dbBudget!.name);
        expect(body.amount).toBe(Number(dbBudget!.amount));
        expect(body.userId).toBe(dbBudget!.user_id);
        expect(body.category).toBe(dbBudget!.category);
        expect(body.color).toBe(dbBudget!.color);
        expect(body.icon).toBe(dbBudget!.icon);
        expect(body.month).toBe(dbBudget!.month);
        expect(body.year).toBe(dbBudget!.year);
      });
    });

    describe('Performance Tests', () => {
      it('should respond within reasonable time for budget update', async () => {
        // Create test budget
        const budget = await createTestBudget(
          testUsers.JOHN_DOE.id,
          'Performance Test',
          1000,
          7,
          2025,
        );

        const updateData: UpdateBudgetDto = {
          name: 'Updated Performance Test',
          category: BudgetCategory.FLEXIBLE,
          color: '#PERFORMANCE',
          icon: 'perf-icon',
        };

        const startTime = Date.now();

        await request(app.getHttpServer())
          .patch(`/budgets/${budget.id}`)
          .set(authHeaders.JOHN_DOE)
          .send(updateData)
          .expect(200);

        const endTime = Date.now();
        const responseTime = endTime - startTime;

        expect(responseTime).toBeLessThan(1500); // Should respond within 1 second
      });

      it('should handle concurrent budget updates for different users efficiently', async () => {
        // Create test budgets for different users
        const johnBudget = await createTestBudget(
          testUsers.JOHN_DOE.id,
          'John Performance',
          500,
          7,
          2025,
        );
        const janeBudget = await createTestBudget(
          testUsers.JANE_SMITH.id,
          'Jane Performance',
          600,
          7,
          2025,
        );
        const adminBudget = await createTestBudget(
          testUsers.ADMIN_USER.id,
          'Admin Performance',
          700,
          7,
          2025,
        );

        const [johnResponse, janeResponse, adminResponse] = await Promise.all([
          request(app.getHttpServer())
            .patch(`/budgets/${johnBudget.id}`)
            .set(authHeaders.JOHN_DOE)
            .send({ name: 'Updated John Performance' }),
          request(app.getHttpServer())
            .patch(`/budgets/${janeBudget.id}`)
            .set(authHeaders.JANE_SMITH)
            .send({ name: 'Updated Jane Performance' }),
          request(app.getHttpServer())
            .patch(`/budgets/${adminBudget.id}`)
            .set(authHeaders.ADMIN_USER)
            .send({ name: 'Updated Admin Performance' }),
        ]);

        expect(johnResponse.status).toBe(200);
        expect(janeResponse.status).toBe(200);
        expect(adminResponse.status).toBe(200);

        const johnBody = johnResponse.body as BudgetResponseDto;
        const janeBody = janeResponse.body as BudgetResponseDto;
        const adminBody = adminResponse.body as BudgetResponseDto;

        expect(johnBody.name).toBe('Updated John Performance');
        expect(johnBody.userId).toBe(testUsers.JOHN_DOE.id);
        expect(janeBody.name).toBe('Updated Jane Performance');
        expect(janeBody.userId).toBe(testUsers.JANE_SMITH.id);
        expect(adminBody.name).toBe('Updated Admin Performance');
        expect(adminBody.userId).toBe(testUsers.ADMIN_USER.id);
      });
    });
  });
});
