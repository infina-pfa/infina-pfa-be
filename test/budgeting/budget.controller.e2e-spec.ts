/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { TestDatabaseManager } from '../setup/database.setup';
import { AuthTestUtils, TEST_USERS } from '../utils/auth.utils';
// cSpell:ignore Supabase
import { SupabaseAuthGuard } from '../../src/common/guards/supabase-auth.guard';
import { Request } from 'express';
import { PrismaClient } from '../../generated/prisma';
import { Decimal } from '../../generated/prisma/runtime/library';
import {
  BudgetResponseDto,
  BudgetWithSpendingResponseDto,
} from '../../src/budgeting/controllers/dto/budget.dto';
import { TestDataFactory } from '../factories';
import { BudgetFactory } from '../factories/budget.factory';

describe('Budget Controller (e2e)', () => {
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
      .overrideGuard(SupabaseAuthGuard)
      .useValue({
        canActivate: jest
          .fn()
          .mockImplementation((context: ExecutionContext) => {
            const request: Request & { user?: any } = context
              .switchToHttp()
              .getRequest();
            const authHeader = request.headers.authorization;

            if (!authHeader || !authHeader.startsWith('Bearer ')) {
              return false;
            }

            // Extract user ID from test token (simplified for testing)
            const token = authHeader.split(' ')[1];
            const mockUsers = Object.values(TEST_USERS);
            const user = mockUsers.find((u) => token.includes(u.id ?? ''));

            if (user) {
              request.user = AuthTestUtils.createMockSupabaseUser(user);
              return true;
            }

            return false;
          }),
      })
      .compile();

    app = moduleFixture.createNestApplication();
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

  describe('POST /budgets', () => {
    it('should create a new budget with valid data', async () => {
      const budgetData = {
        name: 'Groceries',
        amount: 500,
        category: 'variable',
        color: '#28a745',
        icon: 'shopping-basket',
        month: 7,
        year: 2024,
        userId: TEST_USERS.JOHN_DOE.id,
      };

      const response = await request(app.getHttpServer())
        .post('/budgets')
        .set(authHeaders.JOHN_DOE)
        .send(budgetData)
        .expect(201);

      expect(response.body).toMatchObject({
        name: budgetData.name,
        amount: budgetData.amount,
        category: budgetData.category,
        color: budgetData.color,
        icon: budgetData.icon,
        month: budgetData.month,
        year: budgetData.year,
        userId: budgetData.userId,
      });

      const body = response.body as {
        id: string;
        createdAt: Date;
        updatedAt: Date;
      };

      expect(body.id).toBeDefined();
      expect(body.createdAt).toBeDefined();
      expect(body.updatedAt).toBeDefined();

      // Verify budget was saved to database
      const savedBudget = await prisma.budgets.findUnique({
        where: { id: body.id },
      });
      expect(savedBudget).toBeTruthy();
      expect(savedBudget?.name).toBe(budgetData.name);
    });

    it('should return 400 for invalid budget data', async () => {
      const invalidBudgetData = {
        name: '', // Invalid: empty name
        amount: -100, // Invalid: negative amount
        category: 'invalid_category',
        month: 13, // Invalid: month > 12
        year: 2020,
        userId: TEST_USERS.JOHN_DOE.id,
      };

      await request(app.getHttpServer())
        .post('/budgets')
        .set(authHeaders.JOHN_DOE)
        .send(invalidBudgetData)
        .expect(400);
    });

    it('should return 401 when no authentication token provided', async () => {
      const budgetData = {
        name: 'Test Budget',
        amount: 500,
        category: 'variable',
        month: 7,
        year: 2024,
        userId: TEST_USERS.JOHN_DOE.id,
      };

      await request(app.getHttpServer())
        .post('/budgets')
        .send(budgetData)
        .expect(401);
    });

    it('should return 401 with invalid authentication token', async () => {
      const budgetData = {
        name: 'Test Budget',
        amount: 500,
        category: 'variable',
        month: 7,
        year: 2024,
        userId: TEST_USERS.JOHN_DOE.id,
      };

      await request(app.getHttpServer())
        .post('/budgets')
        .set('Authorization', 'Bearer invalid-token')
        .send(budgetData)
        .expect(401);
    });
  });

  describe('GET /budgets', () => {
    beforeEach(async () => {
      // Create test budgets for John Doe
      const budgets = BudgetFactory.createMonthlyBudgets(
        TEST_USERS.JOHN_DOE.id,
        7,
        2024,
        3,
      );

      for (const budget of budgets) {
        const budgetData = BudgetFactory.createDatabaseData({
          user_id: budget.props.userId,
          name: budget.props.name,
          amount: new Decimal(budget.props.amount),
          category: budget.props.category,
          color: budget.props.color,
          icon: budget.props.icon,
          month: 7,
          year: 2024,
        });

        await prisma.budgets.create({ data: budgetData });
      }

      // Create budgets for Jane Smith (should not be returned)
      const janeBudget = BudgetFactory.createDatabaseData({
        user_id: TEST_USERS.JANE_SMITH.id,
        name: "Jane's Budget",
        month: 7,
        year: 2024,
      });

      await prisma.budgets.create({ data: janeBudget });
    });

    it('should return budgets for authenticated user only', async () => {
      const response = await request(app.getHttpServer())
        .get('/budgets')
        .set(authHeaders.JOHN_DOE)
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body).toHaveLength(3);

      // Verify all budgets belong to John Doe
      (response.body as BudgetResponseDto[]).forEach((budget) => {
        expect(budget.userId).toBe(TEST_USERS.JOHN_DOE.id);
      });
    });

    it('should return empty array when user has no budgets', async () => {
      // Use admin user who has no budgets
      const response = await request(app.getHttpServer())
        .get('/budgets')
        .set(authHeaders.ADMIN_USER)
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body).toHaveLength(0);
    });

    it('should return 401 when not authenticated', async () => {
      await request(app.getHttpServer()).get('/budgets').expect(401);
    });
  });

  describe('GET /budgets/with-spending', () => {
    beforeEach(async () => {
      // Create a complete test scenario with budgets, transactions, and relationships
      await TestDataFactory.createCompleteTestScenario(
        prisma,
        TEST_USERS.JOHN_DOE.id,
      );
    });

    it('should return budgets with spending analytics', async () => {
      const response = await request(app.getHttpServer())
        .get('/budgets/with-spending')
        .set(authHeaders.JOHN_DOE)
        .expect(200);

      const responseBody = response.body as BudgetWithSpendingResponseDto[];
      expect(responseBody).toBeInstanceOf(Array);
      expect(responseBody.length).toBeGreaterThan(0);

      // Verify structure of budget with spending data
      const budgetWithSpending = responseBody[0];
      expect(budgetWithSpending).toHaveProperty('id');
      expect(budgetWithSpending).toHaveProperty('name');
      expect(budgetWithSpending).toHaveProperty('amount');
      expect(budgetWithSpending).toHaveProperty('totalSpent');
      expect(budgetWithSpending).toHaveProperty('transactionCount');
      expect(budgetWithSpending).toHaveProperty('remainingAmount');
      expect(budgetWithSpending).toHaveProperty('spentPercentage');

      // Verify data types
      expect(typeof budgetWithSpending.totalSpent).toBe('number');
      expect(typeof budgetWithSpending.transactionCount).toBe('number');
      expect(typeof budgetWithSpending.remainingAmount).toBe('number');
      expect(typeof budgetWithSpending.spentPercentage).toBe('number');
    });

    it('should filter budgets by month and year parameters', async () => {
      const response = await request(app.getHttpServer())
        .get('/budgets/with-spending?month=7&year=2024')
        .set(authHeaders.JOHN_DOE)
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);

      // Verify all returned budgets are for the specified month/year
      (response.body as BudgetWithSpendingResponseDto[]).forEach((budget) => {
        expect(budget.month).toBe(7);
        expect(budget.year).toBe(2024);
      });
    });

    it('should return 400 for invalid month parameter', async () => {
      await request(app.getHttpServer())
        .get('/budgets/with-spending?month=13')
        .set(authHeaders.JOHN_DOE)
        .expect(400);
    });

    it('should return 400 for invalid year parameter', async () => {
      await request(app.getHttpServer())
        .get('/budgets/with-spending?year=abc')
        .set(authHeaders.JOHN_DOE)
        .expect(400);
    });

    it('should handle edge case when no spending data exists', async () => {
      // Clean up transactions to test zero spending scenario
      await prisma.budget_transactions.deleteMany({
        where: { user_id: TEST_USERS.JOHN_DOE.id },
      });
      await prisma.transactions.deleteMany({
        where: { user_id: TEST_USERS.JOHN_DOE.id },
      });

      const response = await request(app.getHttpServer())
        .get('/budgets/with-spending')
        .set(authHeaders.JOHN_DOE)
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);

      // Verify budgets still returned with zero spending
      (response.body as BudgetWithSpendingResponseDto[]).forEach((budget) => {
        expect(budget.totalSpent).toBe(0);
        expect(budget.transactionCount).toBe(0);
        expect(budget.spentPercentage).toBe(0);
        expect(budget.remainingAmount).toBe(budget.amount);
      });
    });

    it('should return 401 when not authenticated', async () => {
      await request(app.getHttpServer())
        .get('/budgets/with-spending')
        .expect(401);
    });
  });

  describe('Cross-user data isolation', () => {
    beforeEach(async () => {
      // Create budgets for both users
      await TestDataFactory.createCompleteTestScenario(
        prisma,
        TEST_USERS.JOHN_DOE.id,
      );
      await TestDataFactory.createCompleteTestScenario(
        prisma,
        TEST_USERS.JANE_SMITH.id,
      );
    });

    it('should only return budgets for the authenticated user', async () => {
      const johnResponse = await request(app.getHttpServer())
        .get('/budgets')
        .set(authHeaders.JOHN_DOE)
        .expect(200);

      const janeResponse = await request(app.getHttpServer())
        .get('/budgets')
        .set(authHeaders.JANE_SMITH)
        .expect(200);

      // Verify John only sees his budgets
      (johnResponse.body as BudgetResponseDto[]).forEach((budget) => {
        expect(budget.userId).toBe(TEST_USERS.JOHN_DOE.id);
      });

      // Verify Jane only sees her budgets
      (janeResponse.body as BudgetResponseDto[]).forEach((budget) => {
        expect(budget.userId).toBe(TEST_USERS.JANE_SMITH.id);
      });

      // Verify they don't see each other's budgets
      expect(johnResponse.body).not.toEqual(janeResponse.body);
    });

    it('should maintain data isolation in spending analytics', async () => {
      const johnResponse = await request(app.getHttpServer())
        .get('/budgets/with-spending')
        .set(authHeaders.JOHN_DOE)
        .expect(200);

      const janeResponse = await request(app.getHttpServer())
        .get('/budgets/with-spending')
        .set(authHeaders.JANE_SMITH)
        .expect(200);

      // Verify each user only sees their own data
      (johnResponse.body as BudgetWithSpendingResponseDto[]).forEach(
        (budget) => {
          expect(budget.userId).toBe(TEST_USERS.JOHN_DOE.id);
        },
      );

      (janeResponse.body as BudgetWithSpendingResponseDto[]).forEach(
        (budget) => {
          expect(budget.userId).toBe(TEST_USERS.JANE_SMITH.id);
        },
      );
    });
  });

  describe('Performance and load testing', () => {
    beforeEach(async () => {
      // Create a larger dataset for performance testing
      const budgets = BudgetFactory.createMany(20, {
        userId: TEST_USERS.JOHN_DOE.id,
        month: 7,
        year: 2024,
      });

      for (const budget of budgets) {
        const budgetData = BudgetFactory.createDatabaseData({
          user_id: budget.props.userId,
          name: budget.props.name,
          amount: new Decimal(budget.props.amount),
          category: budget.props.category,
          month: 7,
          year: 2024,
        });

        await prisma.budgets.create({ data: budgetData });
      }
    });

    it('should handle large budget lists efficiently', async () => {
      const startTime = Date.now();

      const response = await request(app.getHttpServer())
        .get('/budgets')
        .set(authHeaders.JOHN_DOE)
        .expect(200);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(response.body).toHaveLength(20);
      expect(responseTime).toBeLessThan(1000); // Should respond within 1 second
    });

    it('should handle spending analytics for large datasets efficiently', async () => {
      const startTime = Date.now();

      const response = await request(app.getHttpServer())
        .get('/budgets/with-spending')
        .set(authHeaders.JOHN_DOE)
        .expect(200);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(
        (response.body as BudgetWithSpendingResponseDto[]).length,
      ).toBeGreaterThan(0);
      expect(responseTime).toBeLessThan(2000); // Should respond within 2 seconds
    });
  });
});
