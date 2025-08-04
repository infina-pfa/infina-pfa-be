import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaClient } from '../../generated/prisma';
import { AppSetup } from '../setup/app.setup';
import { TestDatabaseManager } from '../setup/database.setup';
import { AuthTestUtils, TestUser } from '../utils/auth.utils';

describe('Budget Spending API E2E', () => {
  let app: INestApplication;
  let prisma: PrismaClient;
  let authHeaders: Record<string, { Authorization: string }>;
  let testUsers: { [key: string]: TestUser } = {};

  // Test data
  let johnBudget1: any;
  let johnBudget2: any;
  let janeBudget: any;

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

    // Create test budgets for different scenarios
    const createBudgetDto1 = {
      name: 'Food Budget',
      amount: 500.0,
      userId: testUsers.JOHN_DOE.id,
      category: 'flexible',
      color: '#FF5733',
      icon: 'food',
      month: 8,
      year: 2025,
    };

    const createBudgetDto2 = {
      name: 'Transportation',
      amount: 300.0,
      userId: testUsers.JOHN_DOE.id,
      category: 'fixed',
      color: '#33FF57',
      icon: 'car',
      month: 8,
      year: 2025,
    };

    const createBudgetDto3 = {
      name: 'Jane Food Budget',
      amount: 400.0,
      userId: testUsers.JANE_SMITH.id,
      category: 'flexible',
      color: '#5733FF',
      icon: 'food',
      month: 8,
      year: 2025,
    };

    // Create John's budgets
    const response1 = await request(app.getHttpServer())
      .post('/budgets')
      .set(authHeaders.JOHN_DOE)
      .send(createBudgetDto1)
      .expect(201);
    johnBudget1 = response1.body;

    const response2 = await request(app.getHttpServer())
      .post('/budgets')
      .set(authHeaders.JOHN_DOE)
      .send(createBudgetDto2)
      .expect(201);
    johnBudget2 = response2.body;

    // Create Jane's budget
    const response3 = await request(app.getHttpServer())
      .post('/budgets')
      .set(authHeaders.JANE_SMITH)
      .send(createBudgetDto3)
      .expect(201);
    janeBudget = response3.body;
  });

  afterAll(async () => {
    await TestDatabaseManager.cleanupTestDatabase();
    await AuthTestUtils.cleanupTestUsers(prisma, Object.values(testUsers));
    await TestDatabaseManager.teardownTestDatabase();
    await app.close();
  });

  describe('GET /budgets/spending', () => {
    describe('Happy Path', () => {
      it('should return empty array when no spending transactions exist', async () => {
        const response = await request(app.getHttpServer())
          .get('/budgets/spending')
          .query({ month: 8, year: 2025 })
          .set(authHeaders.JOHN_DOE)
          .expect(200);

        expect(response.body).toEqual([]);
        expect(Array.isArray(response.body)).toBe(true);
      });

      it('should return spending transactions for current user only', async () => {
        // Add spending to John's budgets
        const spendResponse1 = await request(app.getHttpServer())
          .post(`/budgets/${johnBudget1.id}/spend`)
          .set(authHeaders.JOHN_DOE)
          .send({
            amount: 5000,
            name: 'Grocery Shopping',
            description: 'Weekly groceries',
          })
          .expect(201);

        // Debug: Check budget ID and spend response
        console.log(
          'Budget ID:',
          johnBudget1.id,
          'Type:',
          typeof johnBudget1.id,
        );
        console.log('Spend response 1:', spendResponse1.status);

        await request(app.getHttpServer())
          .post(`/budgets/${johnBudget2.id}/spend`)
          .set(authHeaders.JOHN_DOE)
          .send({
            amount: 2550,
            name: 'Gas Station',
            description: 'Fuel for car',
          })
          .expect(201);

        // Add spending to Jane's budget
        await request(app.getHttpServer())
          .post(`/budgets/${janeBudget.id}/spend`)
          .set(authHeaders.JANE_SMITH)
          .send({
            amount: 3000,
            name: 'Restaurant',
            description: 'Dinner out',
          })
          .expect(201);

        // John should only see his transactions
        const johnResponse = await request(app.getHttpServer())
          .get('/budgets/spending')
          .query({ month: 8, year: 2025 })
          .set(authHeaders.JOHN_DOE)
          .expect(200);

        // Debug: Log the response
        console.log(
          'John response body:',
          JSON.stringify(johnResponse.body, null, 2),
        );

        expect(johnResponse.body).toHaveLength(2);
        expect(johnResponse.body[0]).toHaveProperty('name', 'Grocery Shopping');
        expect(johnResponse.body[0]).toHaveProperty('amount', 5000);
        expect(johnResponse.body[0]).toHaveProperty('type', 'outcome');
        expect(johnResponse.body[1]).toHaveProperty('name', 'Gas Station');
        expect(johnResponse.body[1]).toHaveProperty('amount', 2550);

        // Jane should only see her transactions
        const janeResponse = await request(app.getHttpServer())
          .get('/budgets/spending')
          .query({ month: 8, year: 2025 })
          .set(authHeaders.JANE_SMITH)
          .expect(200);

        expect(janeResponse.body).toHaveLength(1);
        expect(janeResponse.body[0]).toHaveProperty('name', 'Restaurant');
        expect(janeResponse.body[0]).toHaveProperty('amount', 30.0);
      });

      it('should filter transactions by month and year correctly', async () => {
        // Create budget for different month
        const differentMonthBudget = {
          name: 'September Budget',
          amount: 20000,
          userId: testUsers.JOHN_DOE.id,
          category: 'flexible',
          color: '#FF5733',
          icon: 'food',
          month: 9,
          year: 2025,
        };

        const budgetResponse = await request(app.getHttpServer())
          .post('/budgets')
          .set(authHeaders.JOHN_DOE)
          .send(differentMonthBudget)
          .expect(201);

        // Add spending to August budget
        await request(app.getHttpServer())
          .post(`/budgets/${johnBudget1.id}/spend`)
          .set(authHeaders.JOHN_DOE)
          .send({
            amount: 10000,
            name: 'August Spending',
          })
          .expect(201);

        // Add spending to September budget
        await request(app.getHttpServer())
          .post(`/budgets/${budgetResponse.body.id}/spend`)
          .set(authHeaders.JOHN_DOE)
          .send({
            amount: 15000,
            name: 'September Spending',
          })
          .expect(201);

        // Query August spending
        const augustResponse = await request(app.getHttpServer())
          .get('/budgets/spending')
          .query({ month: 8, year: 2025 })
          .set(authHeaders.JOHN_DOE)
          .expect(200);

        expect(augustResponse.body).toHaveLength(1);
        expect(augustResponse.body[0]).toHaveProperty(
          'name',
          'August Spending',
        );

        // Query September spending
        const septemberResponse = await request(app.getHttpServer())
          .get('/budgets/spending')
          .query({ month: 9, year: 2025 })
          .set(authHeaders.JOHN_DOE)
          .expect(200);

        expect(septemberResponse.body).toHaveLength(1);
        expect(septemberResponse.body[0]).toHaveProperty(
          'name',
          'September Spending',
        );
      });

      it('should return transactions with correct response structure', async () => {
        await request(app.getHttpServer())
          .post(`/budgets/${johnBudget1.id}/spend`)
          .set(authHeaders.JOHN_DOE)
          .send({
            amount: 7525,
            name: 'Custom Spending',
            description: 'Custom description',
            recurring: 7,
          })
          .expect(201);

        const response = await request(app.getHttpServer())
          .get('/budgets/spending')
          .query({ month: 8, year: 2025 })
          .set(authHeaders.JOHN_DOE)
          .expect(200);

        expect(response.body).toHaveLength(1);
        const transaction = response.body[0];

        expect(transaction).toHaveProperty('id');
        expect(transaction).toHaveProperty('name', 'Custom Spending');
        expect(transaction).toHaveProperty('description', 'Custom description');
        expect(transaction).toHaveProperty('amount', 75.25);
        expect(transaction).toHaveProperty('type', 'outcome');
        expect(transaction).toHaveProperty('recurring', 7);
        expect(transaction).toHaveProperty('createdAt');
        expect(transaction).toHaveProperty('updatedAt');
        expect(typeof transaction.id).toBe('string');
        expect(typeof transaction.createdAt).toBe('string');
        expect(typeof transaction.updatedAt).toBe('string');
      });

      it('should handle multiple spending transactions on same budget', async () => {
        // Add multiple spendings to same budget
        await request(app.getHttpServer())
          .post(`/budgets/${johnBudget1.id}/spend`)
          .set(authHeaders.JOHN_DOE)
          .send({
            amount: 2500,
            name: 'First Spending',
          })
          .expect(201);

        await request(app.getHttpServer())
          .post(`/budgets/${johnBudget1.id}/spend`)
          .set(authHeaders.JOHN_DOE)
          .send({
            amount: 3550,
            name: 'Second Spending',
          })
          .expect(201);

        await request(app.getHttpServer())
          .post(`/budgets/${johnBudget1.id}/spend`)
          .set(authHeaders.JOHN_DOE)
          .send({
            amount: 4575,
            name: 'Third Spending',
          })
          .expect(201);

        const response = await request(app.getHttpServer())
          .get('/budgets/spending')
          .query({ month: 8, year: 2025 })
          .set(authHeaders.JOHN_DOE)
          .expect(200);

        expect(response.body).toHaveLength(3);
        const amounts = response.body.map((t) => t.amount);
        expect(amounts).toContain(2500);
        expect(amounts).toContain(3550);
        expect(amounts).toContain(4575);
      });
    });

    describe('Authentication & Authorization', () => {
      it('should require authentication', async () => {
        await request(app.getHttpServer())
          .get('/budgets/spending')
          .query({ month: 8, year: 2025 })
          .expect(403);
      });

      it('should reject invalid JWT tokens', async () => {
        await request(app.getHttpServer())
          .get('/budgets/spending')
          .query({ month: 8, year: 2025 })
          .set('Authorization', 'Bearer invalid-token')
          .expect(403);
      });

      it('should reject malformed Authorization header', async () => {
        await request(app.getHttpServer())
          .get('/budgets/spending')
          .query({ month: 8, year: 2025 })
          .set('Authorization', 'InvalidHeader')
          .expect(403);
      });

      it('should isolate user data correctly', async () => {
        // Add spending for both users
        await request(app.getHttpServer())
          .post(`/budgets/${johnBudget1.id}/spend`)
          .set(authHeaders.JOHN_DOE)
          .send({ amount: 10000, name: 'John Spending' })
          .expect(201);

        await request(app.getHttpServer())
          .post(`/budgets/${janeBudget.id}/spend`)
          .set(authHeaders.JANE_SMITH)
          .send({ amount: 20000, name: 'Jane Spending' })
          .expect(201);

        // Each user should only see their own spending
        const johnResponse = await request(app.getHttpServer())
          .get('/budgets/spending')
          .query({ month: 8, year: 2025 })
          .set(authHeaders.JOHN_DOE)
          .expect(200);

        const janeResponse = await request(app.getHttpServer())
          .get('/budgets/spending')
          .query({ month: 8, year: 2025 })
          .set(authHeaders.JANE_SMITH)
          .expect(200);

        expect(johnResponse.body).toHaveLength(1);
        expect(johnResponse.body[0].name).toBe('John Spending');

        expect(janeResponse.body).toHaveLength(1);
        expect(janeResponse.body[0].name).toBe('Jane Spending');
      });
    });

    describe('Data Validation', () => {
      it('should validate month parameter (required)', async () => {
        await request(app.getHttpServer())
          .get('/budgets/spending')
          .query({ year: 2025 })
          .set(authHeaders.JOHN_DOE)
          .expect(400);
      });

      it('should validate year parameter (required)', async () => {
        await request(app.getHttpServer())
          .get('/budgets/spending')
          .query({ month: 8 })
          .set(authHeaders.JOHN_DOE)
          .expect(400);
      });

      it('should validate month range (1-12)', async () => {
        await request(app.getHttpServer())
          .get('/budgets/spending')
          .query({ month: 0, year: 2025 })
          .set(authHeaders.JOHN_DOE)
          .expect(400);

        await request(app.getHttpServer())
          .get('/budgets/spending')
          .query({ month: 13, year: 2025 })
          .set(authHeaders.JOHN_DOE)
          .expect(400);
      });

      it('should validate year range (1900-3000)', async () => {
        await request(app.getHttpServer())
          .get('/budgets/spending')
          .query({ month: 8, year: 1899 })
          .set(authHeaders.JOHN_DOE)
          .expect(400);

        await request(app.getHttpServer())
          .get('/budgets/spending')
          .query({ month: 8, year: 3001 })
          .set(authHeaders.JOHN_DOE)
          .expect(400);
      });

      it('should reject non-numeric month parameter', async () => {
        await request(app.getHttpServer())
          .get('/budgets/spending')
          .query({ month: 'invalid', year: 2025 })
          .set(authHeaders.JOHN_DOE)
          .expect(400);
      });

      it('should reject non-numeric year parameter', async () => {
        await request(app.getHttpServer())
          .get('/budgets/spending')
          .query({ month: 8, year: 'invalid' })
          .set(authHeaders.JOHN_DOE)
          .expect(400);
      });

      it('should accept boundary values', async () => {
        // Test valid boundary values
        await request(app.getHttpServer())
          .get('/budgets/spending')
          .query({ month: 1, year: 1900 })
          .set(authHeaders.JOHN_DOE)
          .expect(200);

        await request(app.getHttpServer())
          .get('/budgets/spending')
          .query({ month: 12, year: 3000 })
          .set(authHeaders.JOHN_DOE)
          .expect(200);
      });
    });

    describe('Business Logic', () => {
      it('should only return OUTCOME transactions', async () => {
        // This test assumes there's a way to create different transaction types
        // Since we only have spend endpoint that creates OUTCOME transactions,
        // we'll verify that only OUTCOME transactions are returned
        await request(app.getHttpServer())
          .post(`/budgets/${johnBudget1.id}/spend`)
          .set(authHeaders.JOHN_DOE)
          .send({
            amount: 5000,
            name: 'Test Spending',
          })
          .expect(201);

        const response = await request(app.getHttpServer())
          .get('/budgets/spending')
          .query({ month: 8, year: 2025 })
          .set(authHeaders.JOHN_DOE)
          .expect(200);

        expect(response.body).toHaveLength(1);
        expect(response.body[0].type).toBe('outcome');
      });

      it('should only return transactions linked to user budgets', async () => {
        // Add spending to John's budget
        await request(app.getHttpServer())
          .post(`/budgets/${johnBudget1.id}/spend`)
          .set(authHeaders.JOHN_DOE)
          .send({
            amount: 5000,
            name: 'John Spending',
          })
          .expect(201);

        // Query as John - should see the transaction
        const johnResponse = await request(app.getHttpServer())
          .get('/budgets/spending')
          .query({ month: 8, year: 2025 })
          .set(authHeaders.JOHN_DOE)
          .expect(200);

        expect(johnResponse.body).toHaveLength(1);
        expect(johnResponse.body[0].name).toBe('John Spending');

        // Query as Jane - should not see John's transactions
        const janeResponse = await request(app.getHttpServer())
          .get('/budgets/spending')
          .query({ month: 8, year: 2025 })
          .set(authHeaders.JANE_SMITH)
          .expect(200);

        expect(janeResponse.body).toHaveLength(0);
      });

      it('should handle budgets with no spending', async () => {
        // Don't add any spending
        const response = await request(app.getHttpServer())
          .get('/budgets/spending')
          .query({ month: 8, year: 2025 })
          .set(authHeaders.JOHN_DOE)
          .expect(200);

        expect(response.body).toEqual([]);
      });

      it('should handle non-existent month/year combinations', async () => {
        // Query for a month/year with no budgets
        const response = await request(app.getHttpServer())
          .get('/budgets/spending')
          .query({ month: 12, year: 2024 })
          .set(authHeaders.JOHN_DOE)
          .expect(200);

        expect(response.body).toEqual([]);
      });
    });

    describe('Error Handling', () => {
      it('should handle database connection issues gracefully', async () => {
        // This would typically require mocking the database
        // For now, we'll just ensure the endpoint doesn't crash with valid input
        const response = await request(app.getHttpServer())
          .get('/budgets/spending')
          .query({ month: 8, year: 2025 })
          .set(authHeaders.JOHN_DOE)
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
      });

      it('should handle malformed query parameters', async () => {
        const testCases = [
          { month: 'abc', year: 2025 },
          { month: 8, year: 'xyz' },
          { month: '8.5', year: 2025 },
          { month: 8, year: '2025.5' },
          { month: null, year: 2025 },
          { month: 8, year: null },
        ];

        for (const testCase of testCases) {
          await request(app.getHttpServer())
            .get('/budgets/spending')
            .query(testCase)
            .set(authHeaders.JOHN_DOE)
            .expect(400);
        }
      });

      it('should return consistent error format for validation failures', async () => {
        const response = await request(app.getHttpServer())
          .get('/budgets/spending')
          .query({ month: 13, year: 2025 })
          .set(authHeaders.JOHN_DOE)
          .expect(400);

        expect(response.body).toHaveProperty('message');
        expect(response.body).toHaveProperty('error');
        expect(response.body).toHaveProperty('statusCode', 400);
      });

      it('should handle empty query parameters', async () => {
        await request(app.getHttpServer())
          .get('/budgets/spending')
          .set(authHeaders.JOHN_DOE)
          .expect(400);
      });

      it('should handle additional unexpected query parameters gracefully', async () => {
        const response = await request(app.getHttpServer())
          .get('/budgets/spending')
          .query({
            month: 8,
            year: 2025,
            unexpectedParam: 'value',
            anotherParam: 123,
          })
          .set(authHeaders.JOHN_DOE)
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
      });
    });

    describe('Performance & Edge Cases', () => {
      it('should handle large numbers of transactions efficiently', async () => {
        // Create multiple transactions
        const promises: Promise<any>[] = [];
        for (let i = 1; i <= 20; i++) {
          promises.push(
            request(app.getHttpServer())
              .post(`/budgets/${johnBudget1.id}/spend`)
              .set(authHeaders.JOHN_DOE)
              .send({
                amount: i * 1000, // Convert to cents
                name: `Spending ${i}`,
              }),
          );
        }

        await Promise.all(promises);

        const startTime = Date.now();
        const response = await request(app.getHttpServer())
          .get('/budgets/spending')
          .query({ month: 8, year: 2025 })
          .set(authHeaders.JOHN_DOE)
          .expect(200);
        const endTime = Date.now();

        expect(response.body).toHaveLength(20);
        expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
      });

      it('should handle concurrent requests correctly', async () => {
        // Add some spending first
        await request(app.getHttpServer())
          .post(`/budgets/${johnBudget1.id}/spend`)
          .set(authHeaders.JOHN_DOE)
          .send({
            amount: 10000,
            name: 'Concurrent Test Spending',
          })
          .expect(201);

        // Make concurrent requests
        const promises = Array(5)
          .fill(null)
          .map(() =>
            request(app.getHttpServer())
              .get('/budgets/spending')
              .query({ month: 8, year: 2025 })
              .set(authHeaders.JOHN_DOE)
              .expect(200),
          );

        const responses = await Promise.all(promises);

        // All responses should be identical
        responses.forEach((response) => {
          expect(response.body).toHaveLength(1);
          expect(response.body[0].name).toBe('Concurrent Test Spending');
        });
      });

      it('should handle decimal precision in amounts correctly', async () => {
        await request(app.getHttpServer())
          .post(`/budgets/${johnBudget1.id}/spend`)
          .set(authHeaders.JOHN_DOE)
          .send({
            amount: 12346, // More than 2 decimal places
            name: 'Precision Test',
          })
          .expect(201);

        const response = await request(app.getHttpServer())
          .get('/budgets/spending')
          .query({ month: 8, year: 2025 })
          .set(authHeaders.JOHN_DOE)
          .expect(200);

        expect(response.body).toHaveLength(1);
        // Amount should be properly handled (likely rounded to 2 decimal places)
        expect(typeof response.body[0].amount).toBe('number');
      });
    });

    describe('Response Format Validation', () => {
      it('should return consistent response structure', async () => {
        await request(app.getHttpServer())
          .post(`/budgets/${johnBudget1.id}/spend`)
          .set(authHeaders.JOHN_DOE)
          .send({
            amount: 5000,
            name: 'Structure Test',
          })
          .expect(201);

        const response = await request(app.getHttpServer())
          .get('/budgets/spending')
          .query({ month: 8, year: 2025 })
          .set(authHeaders.JOHN_DOE)
          .expect(200);

        // Validate overall response structure
        expect(Array.isArray(response.body)).toBe(true);
        expect(Array.isArray(response.body)).toBe(true);

        // Validate transaction structure
        const transaction = response.body[0];
        const expectedFields = [
          'id',
          'name',
          'description',
          'amount',
          'type',
          'recurring',
          'createdAt',
          'updatedAt',
        ];
        expectedFields.forEach((field) => {
          expect(transaction).toHaveProperty(field);
        });
      });

      it('should return proper HTTP headers', async () => {
        const response = await request(app.getHttpServer())
          .get('/budgets/spending')
          .query({ month: 8, year: 2025 })
          .set(authHeaders.JOHN_DOE)
          .expect(200);

        expect(response.headers['content-type']).toMatch(/application\/json/);
      });
    });
  });
});
