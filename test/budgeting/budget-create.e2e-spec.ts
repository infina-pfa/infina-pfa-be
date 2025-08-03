import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaClient } from '../../generated/prisma';
import { BudgetResponseDto } from '../../src/budgeting/controllers/dto/budget.dto';
import { CreateBudgetDto } from '../../src/budgeting/controllers/dto/create-budget.dto';
import { BudgetCategory } from '../../src/budgeting/domain';
import { AppSetup } from '../setup/app.setup';
import { TestDatabaseManager } from '../setup/database.setup';
import { AuthTestUtils, TestUser } from '../utils/auth.utils';

describe('Budget CREATE Endpoints (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaClient;
  let authHeaders: Record<string, { Authorization: string }>;
  let testUsers: { [key: string]: TestUser } = {};

  beforeAll(async () => {
    const { app: appInstance, prisma: prismaInstance } =
      await AppSetup.initApp();
    app = appInstance;
    prisma = prismaInstance;

    // Setup test authentication
    const authSetup = await AuthTestUtils.setupTestAuthentication(prisma);
    authHeaders = authSetup.authHeaders;
    testUsers = authSetup.testUsers;
  });

  beforeEach(async () => {
    await TestDatabaseManager.cleanupTables([
      'budget_transactions',
      'transactions',
      'budgets',
    ]);
  });

  afterAll(async () => {
    await TestDatabaseManager.cleanupTestDatabase();
    await AuthTestUtils.cleanupTestUsers(prisma, Object.values(testUsers));
    await TestDatabaseManager.teardownTestDatabase();
    await app.close();
  });

  describe('POST /budgets', () => {
    describe('Happy Path', () => {
      it('should create budget with all required fields', async () => {
        const createData: CreateBudgetDto = {
          name: 'Groceries',
          amount: 500,
          userId: testUsers.JOHN_DOE.id,
          category: BudgetCategory.FIXED,
          color: '#FF5733',
          icon: 'shopping-cart',
          month: 7,
          year: 2025,
        };

        const response = await request(app.getHttpServer())
          .post('/budgets')
          .set(authHeaders.JOHN_DOE)
          .send(createData)
          .expect(201);

        const body = response.body as BudgetResponseDto;

        expect(body.id).toBeDefined();
        expect(body.name).toBe('Groceries');
        expect(body.amount).toBe(500);
        expect(body.userId).toBe(testUsers.JOHN_DOE.id);
        expect(body.category).toBe(BudgetCategory.FIXED);
        expect(body.color).toBe('#FF5733');
        expect(body.icon).toBe('shopping-cart');
        expect(body.month).toBe(7);
        expect(body.year).toBe(2025);
        expect(body.spent).toBe(0);
        expect(body.createdAt).toBeDefined();
        expect(body.updatedAt).toBeDefined();

        // Verify data was persisted in database
        const budgetInDb = await prisma.budgets.findFirst({
          where: {
            name: 'Groceries',
            user_id: testUsers.JOHN_DOE.id,
          },
        });

        expect(budgetInDb).toBeTruthy();
        expect(budgetInDb?.name).toBe('Groceries');
        expect(Number(budgetInDb?.amount)).toBe(500);
        expect(budgetInDb?.category).toBe(BudgetCategory.FIXED);
        expect(budgetInDb?.color).toBe('#FF5733');
        expect(budgetInDb?.icon).toBe('shopping-cart');
        expect(budgetInDb?.month).toBe(7);
        expect(budgetInDb?.year).toBe(2025);
      });

      it('should create budget with FLEXIBLE category', async () => {
        const createData: CreateBudgetDto = {
          name: 'Entertainment',
          amount: 200,
          userId: testUsers.JANE_SMITH.id,
          category: BudgetCategory.FLEXIBLE,
          color: '#00FF00',
          icon: 'movie',
          month: 8,
          year: 2025,
        };

        const response = await request(app.getHttpServer())
          .post('/budgets')
          .set(authHeaders.JANE_SMITH)
          .send(createData)
          .expect(201);

        const body = response.body as BudgetResponseDto;

        expect(body.category).toBe(BudgetCategory.FLEXIBLE);
        expect(body.name).toBe('Entertainment');
        expect(body.amount).toBe(200);
        expect(body.spent).toBe(0);

        // Verify in database
        const budgetInDb = await prisma.budgets.findFirst({
          where: {
            name: 'Entertainment',
            user_id: testUsers.JANE_SMITH.id,
          },
        });

        expect(budgetInDb?.category).toBe(BudgetCategory.FLEXIBLE);
      });

      it('should create multiple budgets for same user in different months', async () => {
        const budgetData1: CreateBudgetDto = {
          name: 'Groceries July',
          amount: 500,
          userId: testUsers.JOHN_DOE.id,
          category: BudgetCategory.FIXED,
          color: '#FF0000',
          icon: 'food',
          month: 7,
          year: 2025,
        };

        const budgetData2: CreateBudgetDto = {
          name: 'Groceries August',
          amount: 550,
          userId: testUsers.JOHN_DOE.id,
          category: BudgetCategory.FIXED,
          color: '#FF0000',
          icon: 'food',
          month: 8,
          year: 2025,
        };

        const [response1, response2] = await Promise.all([
          request(app.getHttpServer())
            .post('/budgets')
            .set(authHeaders.JOHN_DOE)
            .send(budgetData1),
          request(app.getHttpServer())
            .post('/budgets')
            .set(authHeaders.JOHN_DOE)
            .send(budgetData2),
        ]);

        expect(response1.status).toBe(201);
        expect(response2.status).toBe(201);

        const body1 = response1.body as BudgetResponseDto;
        const body2 = response2.body as BudgetResponseDto;

        expect(body1.month).toBe(7);
        expect(body2.month).toBe(8);
        expect(body1.amount).toBe(500);
        expect(body2.amount).toBe(550);
        expect(body1.id).not.toBe(body2.id);
      });

      it('should create budgets with minimal amount (0.01)', async () => {
        const createData: CreateBudgetDto = {
          name: 'Minimal Budget',
          amount: 0.01,
          userId: testUsers.JOHN_DOE.id,
          category: BudgetCategory.FIXED,
          color: '#000000',
          icon: 'coin',
          month: 7,
          year: 2025,
        };

        const response = await request(app.getHttpServer())
          .post('/budgets')
          .set(authHeaders.JOHN_DOE)
          .send(createData)
          .expect(201);

        const body = response.body as BudgetResponseDto;
        expect(body.amount).toBe(0.01);
      });
    });

    describe('Validation', () => {
      it('should return 400 for missing name', async () => {
        const createData = {
          amount: 500,
          userId: testUsers.JOHN_DOE.id,
          category: BudgetCategory.FIXED,
          color: '#FF5733',
          icon: 'shopping-cart',
          month: 7,
          year: 2025,
        };

        const response = await request(app.getHttpServer())
          .post('/budgets')
          .set(authHeaders.JOHN_DOE)
          .send(createData)
          .expect(400);

        expect(response.body).toHaveProperty('message');
      });

      it('should return 400 for empty name', async () => {
        const createData: CreateBudgetDto = {
          name: '',
          amount: 500,
          userId: testUsers.JOHN_DOE.id,
          category: BudgetCategory.FIXED,
          color: '#FF5733',
          icon: 'shopping-cart',
          month: 7,
          year: 2025,
        };

        const response = await request(app.getHttpServer())
          .post('/budgets')
          .set(authHeaders.JOHN_DOE)
          .send(createData)
          .expect(400);

        expect(response.body).toHaveProperty('message');
      });

      it('should return 400 for missing amount', async () => {
        const createData = {
          name: 'Test Budget',
          userId: testUsers.JOHN_DOE.id,
          category: BudgetCategory.FIXED,
          color: '#FF5733',
          icon: 'shopping-cart',
          month: 7,
          year: 2025,
        };

        const response = await request(app.getHttpServer())
          .post('/budgets')
          .set(authHeaders.JOHN_DOE)
          .send(createData)
          .expect(400);

        expect(response.body).toHaveProperty('message');
      });

      it('should return 400 for zero amount', async () => {
        const createData: CreateBudgetDto = {
          name: 'Zero Budget',
          amount: 0,
          userId: testUsers.JOHN_DOE.id,
          category: BudgetCategory.FIXED,
          color: '#FF5733',
          icon: 'shopping-cart',
          month: 7,
          year: 2025,
        };

        const response = await request(app.getHttpServer())
          .post('/budgets')
          .set(authHeaders.JOHN_DOE)
          .send(createData)
          .expect(400);

        expect(response.body).toHaveProperty('message');
      });

      it('should return 400 for negative amount', async () => {
        const createData: CreateBudgetDto = {
          name: 'Negative Budget',
          amount: -100,
          userId: testUsers.JOHN_DOE.id,
          category: BudgetCategory.FIXED,
          color: '#FF5733',
          icon: 'shopping-cart',
          month: 7,
          year: 2025,
        };

        const response = await request(app.getHttpServer())
          .post('/budgets')
          .set(authHeaders.JOHN_DOE)
          .send(createData)
          .expect(400);

        expect(response.body).toHaveProperty('message');
      });

      it('should return 400 for invalid userId format', async () => {
        const createData = {
          name: 'Invalid User Budget',
          amount: 500,
          userId: 'invalid-uuid',
          category: BudgetCategory.FIXED,
          color: '#FF5733',
          icon: 'shopping-cart',
          month: 7,
          year: 2025,
        };

        const response = await request(app.getHttpServer())
          .post('/budgets')
          .set(authHeaders.JOHN_DOE)
          .send(createData)
          .expect(400);

        expect(response.body).toHaveProperty('message');
      });

      it('should return 400 for invalid category', async () => {
        const createData = {
          name: 'Invalid Category Budget',
          amount: 500,
          userId: testUsers.JOHN_DOE.id,
          category: 'invalid_category',
          color: '#FF5733',
          icon: 'shopping-cart',
          month: 7,
          year: 2025,
        };

        const response = await request(app.getHttpServer())
          .post('/budgets')
          .set(authHeaders.JOHN_DOE)
          .send(createData)
          .expect(400);

        expect(response.body).toHaveProperty('message');
      });

      it('should return 400 for invalid month (0)', async () => {
        const createData: CreateBudgetDto = {
          name: 'Invalid Month Budget',
          amount: 500,
          userId: testUsers.JOHN_DOE.id,
          category: BudgetCategory.FIXED,
          color: '#FF5733',
          icon: 'shopping-cart',
          month: 0,
          year: 2025,
        };

        const response = await request(app.getHttpServer())
          .post('/budgets')
          .set(authHeaders.JOHN_DOE)
          .send(createData)
          .expect(400);

        expect(response.body).toHaveProperty('message');
      });

      it('should return 400 for invalid month (13)', async () => {
        const createData: CreateBudgetDto = {
          name: 'Invalid Month Budget',
          amount: 500,
          userId: testUsers.JOHN_DOE.id,
          category: BudgetCategory.FIXED,
          color: '#FF5733',
          icon: 'shopping-cart',
          month: 13,
          year: 2025,
        };

        const response = await request(app.getHttpServer())
          .post('/budgets')
          .set(authHeaders.JOHN_DOE)
          .send(createData)
          .expect(400);

        expect(response.body).toHaveProperty('message');
      });

      it('should return 400 for year before 2025', async () => {
        const createData: CreateBudgetDto = {
          name: 'Past Year Budget',
          amount: 500,
          userId: testUsers.JOHN_DOE.id,
          category: BudgetCategory.FIXED,
          color: '#FF5733',
          icon: 'shopping-cart',
          month: 7,
          year: 2024,
        };

        const response = await request(app.getHttpServer())
          .post('/budgets')
          .set(authHeaders.JOHN_DOE)
          .send(createData)
          .expect(400);

        expect(response.body).toHaveProperty('message');
      });

      it('should return 400 for multiple validation errors', async () => {
        const createData = {
          name: '', // Empty name
          amount: -100, // Negative amount
          userId: 'invalid-uuid', // Invalid UUID
          category: 'invalid_category', // Invalid category
          color: '#FF5733',
          icon: 'shopping-cart',
          month: 13, // Invalid month
          year: 2024, // Invalid year
        };

        const response = await request(app.getHttpServer())
          .post('/budgets')
          .set(authHeaders.JOHN_DOE)
          .send(createData)
          .expect(400);

        expect(response.body).toHaveProperty('message');
      });
    });

    describe('Business Logic', () => {
      it('should prevent duplicate budget names for same user in same month', async () => {
        const budgetData: CreateBudgetDto = {
          name: 'Groceries',
          amount: 500,
          userId: testUsers.JOHN_DOE.id,
          category: BudgetCategory.FIXED,
          color: '#FF5733',
          icon: 'shopping-cart',
          month: 7,
          year: 2025,
        };

        // Create first budget
        await request(app.getHttpServer())
          .post('/budgets')
          .set(authHeaders.JOHN_DOE)
          .send(budgetData)
          .expect(201);

        // Try to create duplicate budget
        const response = await request(app.getHttpServer())
          .post('/budgets')
          .set(authHeaders.JOHN_DOE)
          .send(budgetData)
          .expect(409);

        expect(response.body).toHaveProperty('message');
      });

      it('should allow same budget name for different users', async () => {
        const budgetDataJohn: CreateBudgetDto = {
          name: 'Groceries',
          amount: 500,
          userId: testUsers.JOHN_DOE.id,
          category: BudgetCategory.FIXED,
          color: '#FF5733',
          icon: 'shopping-cart',
          month: 7,
          year: 2025,
        };

        const budgetDataJane: CreateBudgetDto = {
          name: 'Groceries',
          amount: 600,
          userId: testUsers.JANE_SMITH.id,
          category: BudgetCategory.FLEXIBLE,
          color: '#00FF00',
          icon: 'food',
          month: 7,
          year: 2025,
        };

        const [response1, response2] = await Promise.all([
          request(app.getHttpServer())
            .post('/budgets')
            .set(authHeaders.JOHN_DOE)
            .send(budgetDataJohn),
          request(app.getHttpServer())
            .post('/budgets')
            .set(authHeaders.JANE_SMITH)
            .send(budgetDataJane),
        ]);

        expect(response1.status).toBe(201);
        expect(response2.status).toBe(201);

        const body1 = response1.body as BudgetResponseDto;
        const body2 = response2.body as BudgetResponseDto;

        expect(body1.name).toBe('Groceries');
        expect(body2.name).toBe('Groceries');
        expect(body1.userId).toBe(testUsers.JOHN_DOE.id);
        expect(body2.userId).toBe(testUsers.JANE_SMITH.id);
        expect(body1.id).not.toBe(body2.id);
      });

      it('should allow same budget name for same user in different months', async () => {
        const budgetJuly: CreateBudgetDto = {
          name: 'Groceries',
          amount: 500,
          userId: testUsers.JOHN_DOE.id,
          category: BudgetCategory.FIXED,
          color: '#FF5733',
          icon: 'shopping-cart',
          month: 7,
          year: 2025,
        };

        const budgetAugust: CreateBudgetDto = {
          name: 'Groceries',
          amount: 550,
          userId: testUsers.JOHN_DOE.id,
          category: BudgetCategory.FIXED,
          color: '#FF5733',
          icon: 'shopping-cart',
          month: 8,
          year: 2025,
        };

        const response1 = await request(app.getHttpServer())
          .post('/budgets')
          .set(authHeaders.JOHN_DOE)
          .send(budgetJuly)
          .expect(201);

        const response2 = await request(app.getHttpServer())
          .post('/budgets')
          .set(authHeaders.JOHN_DOE)
          .send(budgetAugust)
          .expect(201);

        const body1 = response1.body as BudgetResponseDto;
        const body2 = response2.body as BudgetResponseDto;

        expect(body1.month).toBe(7);
        expect(body2.month).toBe(8);
        expect(body1.id).not.toBe(body2.id);
      });

      it('should initialize spent amount to zero', async () => {
        const createData: CreateBudgetDto = {
          name: 'New Budget',
          amount: 1000,
          userId: testUsers.JOHN_DOE.id,
          category: BudgetCategory.FIXED,
          color: '#FF5733',
          icon: 'shopping-cart',
          month: 7,
          year: 2025,
        };

        const response = await request(app.getHttpServer())
          .post('/budgets')
          .set(authHeaders.JOHN_DOE)
          .send(createData)
          .expect(201);

        const body = response.body as BudgetResponseDto;
        expect(body.spent).toBe(0);
      });

      it('should handle different budget categories correctly', async () => {
        const testCases = [BudgetCategory.FIXED, BudgetCategory.FLEXIBLE];

        for (let i = 0; i < testCases.length; i++) {
          const category = testCases[i];
          const testUser = Object.values(testUsers)[i];

          const createData: CreateBudgetDto = {
            name: `Budget ${category}`,
            amount: 500 + i * 100,
            userId: testUser.id,
            category: category,
            color: `#FF${i}${i}33`,
            icon: `icon-${i}`,
            month: 7,
            year: 2025,
          };

          const response = await request(app.getHttpServer())
            .post('/budgets')
            .set(authHeaders[Object.keys(testUsers)[i]])
            .send(createData)
            .expect(201);

          const body = response.body as BudgetResponseDto;
          expect(body.category).toBe(category);

          // Verify in database
          const budgetInDb = await prisma.budgets.findFirst({
            where: {
              name: `Budget ${category}`,
              user_id: testUser.id,
            },
          });

          expect(budgetInDb?.category).toBe(category);
        }
      });
    });

    describe('Authentication', () => {
      it('should return 403 when not authenticated', async () => {
        const createData: CreateBudgetDto = {
          name: 'Should Fail',
          amount: 500,
          userId: testUsers.JOHN_DOE.id,
          category: BudgetCategory.FIXED,
          color: '#FF5733',
          icon: 'shopping-cart',
          month: 7,
          year: 2025,
        };

        await request(app.getHttpServer())
          .post('/budgets')
          .send(createData)
          .expect(403);
      });

      it('should return 403 with invalid authentication token', async () => {
        const createData: CreateBudgetDto = {
          name: 'Should Fail',
          amount: 500,
          userId: testUsers.JOHN_DOE.id,
          category: BudgetCategory.FIXED,
          color: '#FF5733',
          icon: 'shopping-cart',
          month: 7,
          year: 2025,
        };

        await request(app.getHttpServer())
          .post('/budgets')
          .set('Authorization', 'Bearer invalid-token')
          .send(createData)
          .expect(403);
      });

      it('should return 403 with malformed authorization header', async () => {
        const createData: CreateBudgetDto = {
          name: 'Should Fail',
          amount: 500,
          userId: testUsers.JOHN_DOE.id,
          category: BudgetCategory.FIXED,
          color: '#FF5733',
          icon: 'shopping-cart',
          month: 7,
          year: 2025,
        };

        await request(app.getHttpServer())
          .post('/budgets')
          .set('Authorization', 'invalid-format')
          .send(createData)
          .expect(403);
      });

      it('should work with valid authentication for different users', async () => {
        const createData1: CreateBudgetDto = {
          name: 'John Budget',
          amount: 500,
          userId: testUsers.JOHN_DOE.id,
          category: BudgetCategory.FIXED,
          color: '#FF5733',
          icon: 'shopping-cart',
          month: 7,
          year: 2025,
        };

        const createData2: CreateBudgetDto = {
          name: 'Jane Budget',
          amount: 600,
          userId: testUsers.JANE_SMITH.id,
          category: BudgetCategory.FLEXIBLE,
          color: '#00FF00',
          icon: 'movie',
          month: 7,
          year: 2025,
        };

        const [response1, response2] = await Promise.all([
          request(app.getHttpServer())
            .post('/budgets')
            .set(authHeaders.JOHN_DOE)
            .send(createData1),
          request(app.getHttpServer())
            .post('/budgets')
            .set(authHeaders.JANE_SMITH)
            .send(createData2),
        ]);

        expect(response1.status).toBe(201);
        expect(response2.status).toBe(201);

        const body1 = response1.body as BudgetResponseDto;
        const body2 = response2.body as BudgetResponseDto;

        expect(body1.name).toBe('John Budget');
        expect(body2.name).toBe('Jane Budget');
        expect(body1.id).toBeDefined();
        expect(body2.id).toBeDefined();
        expect(body1.id).not.toBe(body2.id);
      });
    });

    describe('Data Structure Validation', () => {
      it('should return correct response structure on successful creation', async () => {
        const createData: CreateBudgetDto = {
          name: 'Structure Test',
          amount: 500,
          userId: testUsers.JOHN_DOE.id,
          category: BudgetCategory.FIXED,
          color: '#FF5733',
          icon: 'shopping-cart',
          month: 7,
          year: 2025,
        };

        const response = await request(app.getHttpServer())
          .post('/budgets')
          .set(authHeaders.JOHN_DOE)
          .send(createData)
          .expect(201);

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

        // Verify values
        expect(body.name).toBe('Structure Test');
        expect(body.amount).toBe(500);
        expect(body.userId).toBe(testUsers.JOHN_DOE.id);
        expect(body.category).toBe(BudgetCategory.FIXED);
        expect(body.color).toBe('#FF5733');
        expect(body.icon).toBe('shopping-cart');
        expect(body.month).toBe(7);
        expect(body.year).toBe(2025);
        expect(body.spent).toBe(0);

        // Dates should be valid date strings
        expect(new Date(body.createdAt)).toBeInstanceOf(Date);
        expect(new Date(body.updatedAt)).toBeInstanceOf(Date);
      });

      it('should maintain data consistency between API and database', async () => {
        const createData: CreateBudgetDto = {
          name: 'Consistency Test',
          amount: 750,
          userId: testUsers.JOHN_DOE.id,
          category: BudgetCategory.FLEXIBLE,
          color: '#00FF00',
          icon: 'test-icon',
          month: 8,
          year: 2025,
        };

        const response = await request(app.getHttpServer())
          .post('/budgets')
          .set(authHeaders.JOHN_DOE)
          .send(createData)
          .expect(201);

        const body = response.body as BudgetResponseDto;

        // Verify consistency between API response and database
        const budgetInDb = await prisma.budgets.findFirst({
          where: {
            name: 'Consistency Test',
            user_id: testUsers.JOHN_DOE.id,
          },
        });

        expect(body.name).toBe(budgetInDb?.name);
        expect(body.amount).toBe(Number(budgetInDb?.amount));
        expect(body.userId).toBe(budgetInDb?.user_id);
        expect(body.category).toBe(budgetInDb?.category);
        expect(body.color).toBe(budgetInDb?.color);
        expect(body.icon).toBe(budgetInDb?.icon);
        expect(body.month).toBe(budgetInDb?.month);
        expect(body.year).toBe(budgetInDb?.year);
      });

      it('should set correct timestamps on creation', async () => {
        const beforeCreate = new Date();

        const createData: CreateBudgetDto = {
          name: 'Timestamp Test',
          amount: 500,
          userId: testUsers.JOHN_DOE.id,
          category: BudgetCategory.FIXED,
          color: '#FF5733',
          icon: 'shopping-cart',
          month: 7,
          year: 2025,
        };

        const response = await request(app.getHttpServer())
          .post('/budgets')
          .set(authHeaders.JOHN_DOE)
          .send(createData)
          .expect(201);

        const afterCreate = new Date();
        const body = response.body as BudgetResponseDto;

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
          .post('/budgets')
          .set(authHeaders.JOHN_DOE)
          .set('Content-Type', 'application/json')
          .send('{ invalid json }')
          .expect(400);
      });

      it('should handle empty request body', async () => {
        const response = await request(app.getHttpServer())
          .post('/budgets')
          .set(authHeaders.JOHN_DOE)
          .send({})
          .expect(400);

        expect(response.body).toHaveProperty('message');
      });

      it('should handle non-string name field', async () => {
        const createData = {
          name: 123, // Should be string
          amount: 500,
          userId: testUsers.JOHN_DOE.id,
          category: BudgetCategory.FIXED,
          color: '#FF5733',
          icon: 'shopping-cart',
          month: 7,
          year: 2025,
        };

        const response = await request(app.getHttpServer())
          .post('/budgets')
          .set(authHeaders.JOHN_DOE)
          .send(createData)
          .expect(400);

        expect(response.body).toHaveProperty('message');
      });

      it('should handle non-number amount field', async () => {
        const createData = {
          name: 'Test Budget',
          amount: 'invalid-amount', // Should be number
          userId: testUsers.JOHN_DOE.id,
          category: BudgetCategory.FIXED,
          color: '#FF5733',
          icon: 'shopping-cart',
          month: 7,
          year: 2025,
        };

        const response = await request(app.getHttpServer())
          .post('/budgets')
          .set(authHeaders.JOHN_DOE)
          .send(createData)
          .expect(400);

        expect(response.body).toHaveProperty('message');
      });

      it('should handle non-number month field', async () => {
        const createData = {
          name: 'Test Budget',
          amount: 500,
          userId: testUsers.JOHN_DOE.id,
          category: BudgetCategory.FIXED,
          color: '#FF5733',
          icon: 'shopping-cart',
          month: 'invalid-month', // Should be number
          year: 2025,
        };

        const response = await request(app.getHttpServer())
          .post('/budgets')
          .set(authHeaders.JOHN_DOE)
          .send(createData)
          .expect(400);

        expect(response.body).toHaveProperty('message');
      });

      it('should handle non-number year field', async () => {
        const createData = {
          name: 'Test Budget',
          amount: 500,
          userId: testUsers.JOHN_DOE.id,
          category: BudgetCategory.FIXED,
          color: '#FF5733',
          icon: 'shopping-cart',
          month: 7,
          year: 'invalid-year', // Should be number
        };

        const response = await request(app.getHttpServer())
          .post('/budgets')
          .set(authHeaders.JOHN_DOE)
          .send(createData)
          .expect(400);

        expect(response.body).toHaveProperty('message');
      });
    });

    // describe('Performance', () => {
    //   it('should respond within reasonable time for budget creation', async () => {
    //     const createData: CreateBudgetDto = {
    //       name: 'Performance Test',
    //       amount: 500,
    //       userId: testUsers.JOHN_DOE.id,
    //       category: BudgetCategory.FIXED,
    //       color: '#FF5733',
    //       icon: 'shopping-cart',
    //       month: 7,
    //       year: 2025,
    //     };

    //     const startTime = Date.now();

    //     await request(app.getHttpServer())
    //       .post('/budgets')
    //       .set(authHeaders.JOHN_DOE)
    //       .send(createData)
    //       .expect(201);

    //     const endTime = Date.now();
    //     const responseTime = endTime - startTime;

    //     expect(responseTime).toBeLessThan(1500); // Should respond within 1 second
    //   });

    //   it('should handle concurrent budget creation for different users', async () => {
    //     const createData1: CreateBudgetDto = {
    //       name: 'Concurrent Budget 1',
    //       amount: 500,
    //       userId: testUsers.JOHN_DOE.id,
    //       category: BudgetCategory.FIXED,
    //       color: '#FF0000',
    //       icon: 'icon1',
    //       month: 7,
    //       year: 2025,
    //     };

    //     const createData2: CreateBudgetDto = {
    //       name: 'Concurrent Budget 2',
    //       amount: 600,
    //       userId: testUsers.JANE_SMITH.id,
    //       category: BudgetCategory.FLEXIBLE,
    //       color: '#00FF00',
    //       icon: 'icon2',
    //       month: 7,
    //       year: 2025,
    //     };

    //     const [response1, response2] = await Promise.all([
    //       request(app.getHttpServer())
    //         .post('/budgets')
    //         .set(authHeaders.JOHN_DOE)
    //         .send(createData1),
    //       request(app.getHttpServer())
    //         .post('/budgets')
    //         .set(authHeaders.JANE_SMITH)
    //         .send(createData2),
    //     ]);

    //     expect(response1.status).toBe(201);
    //     expect(response2.status).toBe(201);

    //     const body1 = response1.body as BudgetResponseDto;
    //     const body2 = response2.body as BudgetResponseDto;

    //     expect(body1.name).toBe('Concurrent Budget 1');
    //     expect(body2.name).toBe('Concurrent Budget 2');
    //     expect(body1.id).toBeDefined();
    //     expect(body2.id).toBeDefined();
    //     expect(body1.id).not.toBe(body2.id);
    //   });

    //   it('should handle multiple sequential budget creations efficiently', async () => {
    //     const budgets = Array.from({ length: 5 }, (_, i) => ({
    //       name: `Sequential Budget ${i + 1}`,
    //       amount: 100 * (i + 1),
    //       userId: testUsers.JOHN_DOE.id,
    //       category:
    //         i % 2 === 0 ? BudgetCategory.FIXED : BudgetCategory.FLEXIBLE,
    //       color: `#FF${i}${i}33`,
    //       icon: `icon-${i}`,
    //       month: 7,
    //       year: 2025,
    //     }));

    //     const startTime = Date.now();

    //     for (const budgetData of budgets) {
    //       await request(app.getHttpServer())
    //         .post('/budgets')
    //         .set(authHeaders.JOHN_DOE)
    //         .send(budgetData)
    //         .expect(201);
    //     }

    //     const endTime = Date.now();
    //     const totalTime = endTime - startTime;

    //     expect(totalTime).toBeLessThan(6000); // Should complete all in under 5 seconds
    //   });
    // });
  });
});
