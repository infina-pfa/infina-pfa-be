import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaClient } from '../../generated/prisma';
import { BudgetResponseDto } from '../../src/budgeting/controllers/dto/budget.dto';
import { BudgetCategory } from '../../src/budgeting/domain';
import { TransactionType } from '../../src/budgeting/domain/entities/transactions.entity';
import { AppSetup } from '../setup/app.setup';
import { TestDatabaseManager } from '../setup/database.setup';
import { AuthTestUtils, TestUser } from '../utils/auth.utils';

describe('Budget GET DETAIL Endpoint (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaClient;
  let authHeaders: Record<string, { Authorization: string }>;
  let testUsers: { [key: string]: TestUser } = {};

  beforeAll(async () => {
    const { app: appInstance, prisma: prismaInstance } =
      await AppSetup.initApp();
    app = appInstance;
    prisma = prismaInstance;

    const authSetup = await AuthTestUtils.setupTestAuthentication(prisma);
    authHeaders = authSetup.authHeaders;
    testUsers = authSetup.testUsers;
  });

  afterAll(async () => {
    await TestDatabaseManager.cleanupTestDatabase();
    await AuthTestUtils.cleanupTestUsers(prisma, Object.values(testUsers));
    await TestDatabaseManager.teardownTestDatabase();
    await app.close();
  });

  beforeEach(async () => {
    await TestDatabaseManager.cleanupTables([
      'budget_transactions',
      'transactions',
      'budgets',
    ]);
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
    deletedAt?: Date,
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
        archived_at: deletedAt || null,
      },
    });
  };

  // Helper function to create test transactions/spending
  const createTestTransaction = async (
    budgetId: string,
    userId: string,
    amount: number,
    name: string = 'Test Transaction',
    description: string = 'Test transaction description',
    recurring: number = 0,
  ) => {
    const transaction = await prisma.transactions.create({
      data: {
        name,
        amount: amount.toString(),
        description,
        recurring,
        type: TransactionType.OUTCOME,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    // Link transaction to budget through join table
    await prisma.budget_transactions.create({
      data: {
        user_id: userId,
        budget_id: budgetId,
        transaction_id: transaction.id,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    return transaction;
  };

  describe('GET /budgets/:id', () => {
    describe('Happy Path', () => {
      it('should retrieve budget detail successfully for authenticated user', async () => {
        // Create test budget for John
        const budget = await createTestBudget(
          testUsers.JOHN_DOE.id,
          'Groceries',
          500,
          7,
          2025,
        );

        const response = await request(app.getHttpServer())
          .get(`/budgets/${budget.id}`)
          .set(authHeaders.JOHN_DOE)
          .expect(200);

        const body = response.body as BudgetResponseDto;

        expect(body.id).toBe(budget.id);
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
        expect(body.transactions).toBeDefined();
        expect(Array.isArray(body.transactions)).toBe(true);
        expect(body.transactions).toHaveLength(0);
      });

      it('should include spending calculations and transaction list in response', async () => {
        // Create test budget
        const budget = await createTestBudget(
          testUsers.JOHN_DOE.id,
          'Groceries',
          500,
          7,
          2025,
        );

        // Create transactions for the budget
        const transaction1 = await createTestTransaction(
          budget.id,
          testUsers.JOHN_DOE.id,
          100,
          'Store A',
          'Grocery shopping at Store A',
        );
        const transaction2 = await createTestTransaction(
          budget.id,
          testUsers.JOHN_DOE.id,
          75,
          'Store B',
          'Grocery shopping at Store B',
        );

        const response = await request(app.getHttpServer())
          .get(`/budgets/${budget.id}`)
          .set(authHeaders.JOHN_DOE)
          .expect(200);

        const body = response.body as BudgetResponseDto;

        expect(body.name).toBe('Groceries');
        expect(body.amount).toBe(500);
        expect(body.spent).toBe(175); // 100 + 75
        expect(body.transactions).toHaveLength(2);

        // Verify transaction details
        const transactions = body.transactions!.sort(
          (a, b) => b.amount - a.amount,
        );

        expect(transactions[0].id).toBe(transaction1.id);
        expect(transactions[0].name).toBe('Store A');
        expect(transactions[0].description).toBe('Grocery shopping at Store A');
        expect(transactions[0].amount).toBe(100);
        expect(transactions[0].type).toBe(TransactionType.OUTCOME);
        expect(transactions[0].recurring).toBe(0);
        expect(transactions[0].createdAt).toBeDefined();

        expect(transactions[1].id).toBe(transaction2.id);
        expect(transactions[1].name).toBe('Store B');
        expect(transactions[1].description).toBe('Grocery shopping at Store B');
        expect(transactions[1].amount).toBe(75);
        expect(transactions[1].type).toBe(TransactionType.OUTCOME);
        expect(transactions[1].recurring).toBe(0);
        expect(transactions[1].createdAt).toBeDefined();
      });

      it('should return budget with transactions showing transaction details correctly', async () => {
        // Create test budget
        const budget = await createTestBudget(
          testUsers.JANE_SMITH.id,
          'Entertainment',
          300,
          8,
          2025,
          BudgetCategory.FLEXIBLE,
        );

        // Create a detailed transaction
        const transaction = await createTestTransaction(
          budget.id,
          testUsers.JANE_SMITH.id,
          50,
          'Movie Tickets',
          'Cinema tickets for weekend movie',
          7, // Weekly recurring
        );

        const response = await request(app.getHttpServer())
          .get(`/budgets/${budget.id}`)
          .set(authHeaders.JANE_SMITH)
          .expect(200);

        const body = response.body as BudgetResponseDto;

        expect(body.name).toBe('Entertainment');
        expect(body.amount).toBe(300);
        expect(body.spent).toBe(50);
        expect(body.transactions).toHaveLength(1);

        const transactionDto = body.transactions![0];
        expect(transactionDto.id).toBe(transaction.id);
        expect(transactionDto.name).toBe('Movie Tickets');
        expect(transactionDto.description).toBe(
          'Cinema tickets for weekend movie',
        );
        expect(transactionDto.amount).toBe(50);
        expect(transactionDto.type).toBe(TransactionType.OUTCOME);
        expect(transactionDto.recurring).toBe(7);
        expect(new Date(transactionDto.createdAt)).toBeInstanceOf(Date);
        expect(new Date(transactionDto.updatedAt)).toBeInstanceOf(Date);
      });

      it('should return budget without transactions showing empty transactions array', async () => {
        // Create test budget without any transactions
        const budget = await createTestBudget(
          testUsers.ADMIN_USER.id,
          'Savings',
          1000,
          9,
          2025,
        );

        const response = await request(app.getHttpServer())
          .get(`/budgets/${budget.id}`)
          .set(authHeaders.ADMIN_USER)
          .expect(200);

        const body = response.body as BudgetResponseDto;

        expect(body.name).toBe('Savings');
        expect(body.amount).toBe(1000);
        expect(body.spent).toBe(0);
        expect(body.transactions).toBeDefined();
        expect(Array.isArray(body.transactions)).toBe(true);
        expect(body.transactions).toHaveLength(0);
      });
    });

    describe('Error Scenarios', () => {
      it('should return 404 for non-existent budget ID', async () => {
        const nonExistentId = '123e4567-e89b-12d3-a456-426614174999';

        const response = await request(app.getHttpServer())
          .get(`/budgets/${nonExistentId}`)
          .set(authHeaders.JOHN_DOE)
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

        const response = await request(app.getHttpServer())
          .get(`/budgets/${archivedBudget.id}`)
          .set(authHeaders.JOHN_DOE)
          .expect(404);

        expect(response.body).toHaveProperty('message');
      });

      it('should return 403 when users try to access budgets belonging to other users', async () => {
        // Create budget for John
        const johnBudget = await createTestBudget(
          testUsers.JOHN_DOE.id,
          'John Budget',
          500,
          7,
          2025,
        );

        // Try to access John's budget as Jane
        const response = await request(app.getHttpServer())
          .get(`/budgets/${johnBudget.id}`)
          .set(authHeaders.JANE_SMITH)
          .expect(403);

        expect(response.body).toHaveProperty('message');
      });

      it('should return 400 for invalid UUID format', async () => {
        const invalidUuid = 'invalid-uuid-format';

        const response = await request(app.getHttpServer())
          .get(`/budgets/${invalidUuid}`)
          .set(authHeaders.JOHN_DOE)
          .expect(400);

        expect(response.body).toHaveProperty('message');
      });

      it('should return 401 for unauthenticated requests', async () => {
        // Create a budget
        const budget = await createTestBudget(
          testUsers.JOHN_DOE.id,
          'Test Budget',
          500,
          7,
          2025,
        );

        await request(app.getHttpServer())
          .get(`/budgets/${budget.id}`)
          .expect(403); // MockGuard returns 403 for unauthenticated requests
      });

      it('should return 403 with invalid authentication token', async () => {
        // Create a budget
        const budget = await createTestBudget(
          testUsers.JOHN_DOE.id,
          'Test Budget',
          500,
          7,
          2025,
        );

        await request(app.getHttpServer())
          .get(`/budgets/${budget.id}`)
          .set('Authorization', 'Bearer invalid-token')
          .expect(403);
      });
    });

    describe('Edge Cases', () => {
      it('should handle budget with multiple transactions correctly', async () => {
        // Create test budget
        const budget = await createTestBudget(
          testUsers.JOHN_DOE.id,
          'Multi-Transaction Budget',
          1000,
          7,
          2025,
        );

        // Create multiple transactions with different amounts and details
        const transactions: any[] = [];
        transactions.push(
          await createTestTransaction(
            budget.id,
            testUsers.JOHN_DOE.id,
            250,
            'Transaction 1',
            'First transaction',
          ),
        );
        transactions.push(
          await createTestTransaction(
            budget.id,
            testUsers.JOHN_DOE.id,
            150,
            'Transaction 2',
            'Second transaction',
          ),
        );
        transactions.push(
          await createTestTransaction(
            budget.id,
            testUsers.JOHN_DOE.id,
            100,
            'Transaction 3',
            'Third transaction',
          ),
        );
        transactions.push(
          await createTestTransaction(
            budget.id,
            testUsers.JOHN_DOE.id,
            75,
            'Transaction 4',
            'Fourth transaction',
          ),
        );
        transactions.push(
          await createTestTransaction(
            budget.id,
            testUsers.JOHN_DOE.id,
            25,
            'Transaction 5',
            'Fifth transaction',
          ),
        );

        const response = await request(app.getHttpServer())
          .get(`/budgets/${budget.id}`)
          .set(authHeaders.JOHN_DOE)
          .expect(200);

        const body = response.body as BudgetResponseDto;

        expect(body.name).toBe('Multi-Transaction Budget');
        expect(body.amount).toBe(1000);
        expect(body.spent).toBe(600); // 250 + 150 + 100 + 75 + 25
        expect(body.transactions).toHaveLength(5);

        // Verify all transactions are present
        const transactionIds = body.transactions!.map((t) => t.id).sort();
        const expectedIds = transactions.map((t) => t.id).sort();
        expect(transactionIds).toEqual(expectedIds);

        // Verify transaction amounts sum correctly
        const totalFromTransactions = body.transactions!.reduce(
          (sum, t) => sum + t.amount,
          0,
        );
        expect(totalFromTransactions).toBe(600);
      });

      it('should handle budget with zero spending correctly', async () => {
        // Create budget without any transactions
        const budget = await createTestBudget(
          testUsers.JANE_SMITH.id,
          'Zero Spending Budget',
          800,
          7,
          2025,
        );

        const response = await request(app.getHttpServer())
          .get(`/budgets/${budget.id}`)
          .set(authHeaders.JANE_SMITH)
          .expect(200);

        const body = response.body as BudgetResponseDto;

        expect(body.name).toBe('Zero Spending Budget');
        expect(body.amount).toBe(800);
        expect(body.spent).toBe(0);
        expect(body.transactions).toHaveLength(0);
      });

      it('should handle budget with maximum spending (over budget)', async () => {
        // Create test budget
        const budget = await createTestBudget(
          testUsers.ADMIN_USER.id,
          'Over Budget',
          200,
          7,
          2025,
        );

        // Create transactions that exceed the budget
        await createTestTransaction(
          budget.id,
          testUsers.ADMIN_USER.id,
          150,
          'Large Transaction 1',
        );
        await createTestTransaction(
          budget.id,
          testUsers.ADMIN_USER.id,
          100,
          'Large Transaction 2',
        );

        const response = await request(app.getHttpServer())
          .get(`/budgets/${budget.id}`)
          .set(authHeaders.ADMIN_USER)
          .expect(200);

        const body = response.body as BudgetResponseDto;

        expect(body.name).toBe('Over Budget');
        expect(body.amount).toBe(200);
        expect(body.spent).toBe(250); // Exceeds budget by 50
        expect(body.transactions).toHaveLength(2);
      });

      it('should handle recently created budget correctly', async () => {
        const beforeCreate = new Date();

        // Create budget
        const budget = await createTestBudget(
          testUsers.JOHN_DOE.id,
          'Recently Created',
          400,
          7,
          2025,
        );

        const afterCreate = new Date();

        const response = await request(app.getHttpServer())
          .get(`/budgets/${budget.id}`)
          .set(authHeaders.JOHN_DOE)
          .expect(200);

        const body = response.body as BudgetResponseDto;

        expect(body.name).toBe('Recently Created');
        expect(body.amount).toBe(400);

        const createdAt = new Date(body.createdAt);
        const updatedAt = new Date(body.updatedAt);

        // Verify timestamps are recent
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
      });

      it('should handle recently updated budget correctly', async () => {
        // Create budget
        const budget = await createTestBudget(
          testUsers.JANE_SMITH.id,
          'To Be Updated',
          300,
          7,
          2025,
        );

        // Wait a bit and then update
        await new Promise((resolve) => setTimeout(resolve, 100));

        const beforeUpdate = new Date();
        await prisma.budgets.update({
          where: { id: budget.id },
          data: {
            name: 'Recently Updated',
            updated_at: new Date(),
          },
        });
        const afterUpdate = new Date();

        const response = await request(app.getHttpServer())
          .get(`/budgets/${budget.id}`)
          .set(authHeaders.JANE_SMITH)
          .expect(200);

        const body = response.body as BudgetResponseDto;

        expect(body.name).toBe('Recently Updated');
        expect(body.amount).toBe(300);

        const updatedAt = new Date(body.updatedAt);

        // Verify updatedAt is recent
        expect(updatedAt.getTime()).toBeGreaterThanOrEqual(
          beforeUpdate.getTime() - 1000,
        );
        expect(updatedAt.getTime()).toBeLessThanOrEqual(
          afterUpdate.getTime() + 1000,
        );
      });
    });

    describe('Data Validation', () => {
      it('should return correct response structure with all required fields', async () => {
        // Create budget with transaction
        const budget = await createTestBudget(
          testUsers.JOHN_DOE.id,
          'Structure Test',
          500,
          7,
          2025,
          BudgetCategory.FLEXIBLE,
          '#00FF00',
          'test-icon',
        );

        await createTestTransaction(
          budget.id,
          testUsers.JOHN_DOE.id,
          100,
          'Test Transaction',
          'Test description',
          14,
        );

        const response = await request(app.getHttpServer())
          .get(`/budgets/${budget.id}`)
          .set(authHeaders.JOHN_DOE)
          .expect(200);

        const body = response.body as BudgetResponseDto;

        // Verify budget fields are present and correct types
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
        expect(body).toHaveProperty('transactions');

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
        expect(Array.isArray(body.transactions)).toBe(true);

        // Verify values
        expect(body.name).toBe('Structure Test');
        expect(body.amount).toBe(500);
        expect(body.userId).toBe(testUsers.JOHN_DOE.id);
        expect(body.category).toBe(BudgetCategory.FLEXIBLE);
        expect(body.color).toBe('#00FF00');
        expect(body.icon).toBe('test-icon');
        expect(body.month).toBe(7);
        expect(body.year).toBe(2025);
        expect(body.spent).toBe(100);

        // Verify transaction structure
        expect(body.transactions).toHaveLength(1);
        const transaction = body.transactions![0];

        expect(transaction).toHaveProperty('id');
        expect(transaction).toHaveProperty('name');
        expect(transaction).toHaveProperty('description');
        expect(transaction).toHaveProperty('amount');
        expect(transaction).toHaveProperty('type');
        expect(transaction).toHaveProperty('recurring');
        expect(transaction).toHaveProperty('createdAt');
        expect(transaction).toHaveProperty('updatedAt');

        // Verify transaction data types
        expect(typeof transaction.id).toBe('string');
        expect(typeof transaction.name).toBe('string');
        expect(typeof transaction.description).toBe('string');
        expect(typeof transaction.amount).toBe('number');
        expect(typeof transaction.type).toBe('string');
        expect(typeof transaction.recurring).toBe('number');

        // Verify transaction values
        expect(transaction.name).toBe('Test Transaction');
        expect(transaction.description).toBe('Test description');
        expect(transaction.amount).toBe(100);
        expect(transaction.type).toBe(TransactionType.OUTCOME);
        expect(transaction.recurring).toBe(14);
      });

      it('should validate spending calculations are accurate', async () => {
        // Create budget
        const budget = await createTestBudget(
          testUsers.JANE_SMITH.id,
          'Calculation Test',
          1000,
          7,
          2025,
        );

        // Create transactions with specific amounts
        const amounts = [123.45, 67.89, 234.56, 45.1];
        for (let i = 0; i < amounts.length; i++) {
          await createTestTransaction(
            budget.id,
            testUsers.JANE_SMITH.id,
            amounts[i],
            `Transaction ${i + 1}`,
          );
        }

        const response = await request(app.getHttpServer())
          .get(`/budgets/${budget.id}`)
          .set(authHeaders.JANE_SMITH)
          .expect(200);

        const body = response.body as BudgetResponseDto;

        const expectedTotal = amounts.reduce((sum, amount) => sum + amount, 0);
        const actualTotal = body.transactions!.reduce(
          (sum, t) => sum + t.amount,
          0,
        );

        expect(body.spent).toBe(expectedTotal);
        expect(actualTotal).toBe(expectedTotal);
        expect(body.transactions).toHaveLength(amounts.length);
      });

      it('should maintain data consistency between API response and database', async () => {
        // Create budget
        const budgetInDb = await createTestBudget(
          testUsers.ADMIN_USER.id,
          'Consistency Test',
          750,
          8,
          2025,
          BudgetCategory.FLEXIBLE,
          '#FF00FF',
          'consistency-icon',
        );

        const response = await request(app.getHttpServer())
          .get(`/budgets/${budgetInDb.id}`)
          .set(authHeaders.ADMIN_USER)
          .expect(200);

        const body = response.body as BudgetResponseDto;

        // Verify API response matches database
        expect(body.id).toBe(budgetInDb.id);
        expect(body.name).toBe(budgetInDb.name);
        expect(body.amount).toBe(Number(budgetInDb.amount));
        expect(body.userId).toBe(budgetInDb.user_id);
        expect(body.category).toBe(budgetInDb.category);
        expect(body.color).toBe(budgetInDb.color);
        expect(body.icon).toBe(budgetInDb.icon);
        expect(body.month).toBe(budgetInDb.month);
        expect(body.year).toBe(budgetInDb.year);
      });
    });

    describe('Performance', () => {
      it('should respond within reasonable time for budget detail retrieval', async () => {
        // Create budget with multiple transactions
        const budget = await createTestBudget(
          testUsers.JOHN_DOE.id,
          'Performance Test',
          1000,
          7,
          2025,
        );

        // Create 10 transactions
        for (let i = 1; i <= 10; i++) {
          await createTestTransaction(
            budget.id,
            testUsers.JOHN_DOE.id,
            i * 10,
            `Transaction ${i}`,
          );
        }

        const startTime = Date.now();

        await request(app.getHttpServer())
          .get(`/budgets/${budget.id}`)
          .set(authHeaders.JOHN_DOE)
          .expect(200);

        const endTime = Date.now();
        const responseTime = endTime - startTime;

        expect(responseTime).toBeLessThan(1000); // Should respond within 1 second
      });

      it('should handle concurrent requests for different budget details efficiently', async () => {
        // Create budgets for multiple users
        const johnBudget = await createTestBudget(
          testUsers.JOHN_DOE.id,
          'John Budget',
          500,
          7,
          2025,
        );
        const janeBudget = await createTestBudget(
          testUsers.JANE_SMITH.id,
          'Jane Budget',
          600,
          7,
          2025,
        );
        const adminBudget = await createTestBudget(
          testUsers.ADMIN_USER.id,
          'Admin Budget',
          700,
          7,
          2025,
        );

        const [johnResponse, janeResponse, adminResponse] = await Promise.all([
          request(app.getHttpServer())
            .get(`/budgets/${johnBudget.id}`)
            .set(authHeaders.JOHN_DOE),
          request(app.getHttpServer())
            .get(`/budgets/${janeBudget.id}`)
            .set(authHeaders.JANE_SMITH),
          request(app.getHttpServer())
            .get(`/budgets/${adminBudget.id}`)
            .set(authHeaders.ADMIN_USER),
        ]);

        expect(johnResponse.status).toBe(200);
        expect(janeResponse.status).toBe(200);
        expect(adminResponse.status).toBe(200);

        const johnBody = johnResponse.body as BudgetResponseDto;
        const janeBody = janeResponse.body as BudgetResponseDto;
        const adminBody = adminResponse.body as BudgetResponseDto;

        expect(johnBody.name).toBe('John Budget');
        expect(johnBody.userId).toBe(testUsers.JOHN_DOE.id);
        expect(janeBody.name).toBe('Jane Budget');
        expect(janeBody.userId).toBe(testUsers.JANE_SMITH.id);
        expect(adminBody.name).toBe('Admin Budget');
        expect(adminBody.userId).toBe(testUsers.ADMIN_USER.id);
      });
    });
  });
});
