/* eslint-disable @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call */
import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { TestDatabaseManager } from '../setup/database.setup';
import { AuthTestUtils, TEST_USERS } from '../utils/auth.utils';
import { TestDataFactory } from '../factories';
import { TransactionFactory } from '../factories/transaction.factory';
import { SupabaseAuthGuard } from '../../src/common/guards/supabase-auth.guard';
import { PrismaClient } from '../../generated/prisma';
import { BudgetWithSpendingResponseDto } from '../../src/budgeting/controllers/dto/budget.dto';
import { Decimal } from '@prisma/client/runtime/library';
import { TransactionType } from '../../src/budgeting/domain/entities/transactions.entity';

describe('Budget-Transaction Integration (e2e)', () => {
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
            const request = context.switchToHttp().getRequest();
            const authHeader = request.headers.authorization;

            if (!authHeader || !authHeader.startsWith('Bearer ')) {
              return false;
            }

            // Extract user ID from test token (simplified for testing)
            const token = authHeader.split(' ')[1];
            const mockUsers = Object.values(TEST_USERS);
            const user = mockUsers.find((u) =>
              token.includes(u.id.split('-').pop() || ''),
            );

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

  describe('Budget and Transaction Workflow', () => {
    it('should create budget, add transactions, and show spending analytics', async () => {
      // Step 1: Create a budget
      const budgetData = {
        name: 'Groceries',
        amount: 600,
        category: 'variable',
        color: '#28a745',
        icon: 'shopping-basket',
        month: 7,
        year: 2024,
        userId: TEST_USERS.JOHN_DOE.id,
      };

      const budgetResponse = await request(app.getHttpServer())
        .post('/budgets')
        .set(authHeaders.JOHN_DOE)
        .send(budgetData)
        .expect(201);

      const createdBudgetId = budgetResponse.body.id;
      expect(createdBudgetId).toBeDefined();

      // Step 2: Create transactions
      const transaction1 = TransactionFactory.createDatabaseData({
        user_id: TEST_USERS.JOHN_DOE.id,
        name: 'Supermarket Shopping',
        amount: new Decimal(85.5),
        type: TransactionType.OUTCOME,
      });

      const transaction2 = TransactionFactory.createDatabaseData({
        user_id: TEST_USERS.JOHN_DOE.id,
        name: "Farmer's Market",
        amount: new Decimal(45.25),
        type: TransactionType.OUTCOME,
      });

      const createdTransaction1 = await prisma.transactions.create({
        data: transaction1,
      });

      const createdTransaction2 = await prisma.transactions.create({
        data: transaction2,
      });

      // Step 3: Link transactions to budget
      await prisma.budget_transactions.create({
        data: {
          user_id: TEST_USERS.JOHN_DOE.id,
          budget_id: createdBudgetId,
          transaction_id: createdTransaction1.id,
          created_at: new Date(),
          updated_at: new Date(),
        },
      });

      await prisma.budget_transactions.create({
        data: {
          user_id: TEST_USERS.JOHN_DOE.id,
          budget_id: createdBudgetId,
          transaction_id: createdTransaction2.id,
          created_at: new Date(),
          updated_at: new Date(),
        },
      });

      // Step 4: Verify spending analytics
      const analyticsResponse = await request(app.getHttpServer())
        .get('/budgets/with-spending?month=7&year=2024')
        .set(authHeaders.JOHN_DOE)
        .expect(200);

      expect(analyticsResponse.body).toHaveLength(1);

      const budgetWithSpending = analyticsResponse
        .body[0] as BudgetWithSpendingResponseDto;
      expect(budgetWithSpending.id).toBe(createdBudgetId);
      expect(budgetWithSpending.name).toBe('Groceries');
      expect(budgetWithSpending.amount).toBe(600);
      expect(budgetWithSpending.totalSpent).toBe(130.75); // 85.50 + 45.25
      expect(budgetWithSpending.transactionCount).toBe(2);
      expect(budgetWithSpending.remainingAmount).toBe(469.25); // 600 - 130.75
      expect(budgetWithSpending.spentPercentage).toBeCloseTo(21.79, 1); // (130.75 / 600) * 100
    });

    it('should handle multiple budgets with cross-category transactions', async () => {
      // Create multiple budgets
      const groceryBudget = await request(app.getHttpServer())
        .post('/budgets')
        .set(authHeaders.JOHN_DOE)
        .send({
          name: 'Groceries',
          amount: 400,
          category: 'variable',
          month: 7,
          year: 2024,
          userId: TEST_USERS.JOHN_DOE.id,
        })
        .expect(201);

      const entertainmentBudget = await request(app.getHttpServer())
        .post('/budgets')
        .set(authHeaders.JOHN_DOE)
        .send({
          name: 'Entertainment',
          amount: 200,
          category: 'variable',
          month: 7,
          year: 2024,
          userId: TEST_USERS.JOHN_DOE.id,
        })
        .expect(201);

      // Create transactions for different categories
      const groceryTransaction = await prisma.transactions.create({
        data: TransactionFactory.createDatabaseData({
          user_id: TEST_USERS.JOHN_DOE.id,
          name: 'Weekly Groceries',
          amount: new Decimal(120),
          type: TransactionType.OUTCOME,
        }),
      });

      const entertainmentTransaction = await prisma.transactions.create({
        data: TransactionFactory.createDatabaseData({
          user_id: TEST_USERS.JOHN_DOE.id,
          name: 'Movie Night',
          amount: new Decimal(35),
          type: TransactionType.OUTCOME,
        }),
      });

      // Link transactions to respective budgets
      await prisma.budget_transactions.createMany({
        data: [
          {
            user_id: TEST_USERS.JOHN_DOE.id,
            budget_id: groceryBudget.body.id,
            transaction_id: groceryTransaction.id,
            created_at: new Date(),
            updated_at: new Date(),
          },
          {
            user_id: TEST_USERS.JANE_SMITH.id,
            budget_id: entertainmentBudget.body.id,
            transaction_id: entertainmentTransaction.id,
            created_at: new Date(),
            updated_at: new Date(),
          },
        ],
      });

      // Verify analytics for both budgets
      const analyticsResponse = await request(app.getHttpServer())
        .get('/budgets/with-spending?month=7&year=2024')
        .set(authHeaders.JOHN_DOE)
        .expect(200);

      expect(analyticsResponse.body).toHaveLength(2);

      const responseBody =
        analyticsResponse.body as BudgetWithSpendingResponseDto[];
      const groceryAnalytics = responseBody.find((b) => b.name === 'Groceries');
      const entertainmentAnalytics = responseBody.find(
        (b) => b.name === 'Entertainment',
      );

      expect(groceryAnalytics?.totalSpent).toBe(120);
      expect(groceryAnalytics?.transactionCount).toBe(1);
      expect(groceryAnalytics?.spentPercentage).toBe(30); // (120 / 400) * 100

      expect(entertainmentAnalytics?.totalSpent).toBe(35);
      expect(entertainmentAnalytics?.transactionCount).toBe(1);
      expect(entertainmentAnalytics?.spentPercentage).toBe(17.5); // (35 / 200) * 100
    });

    it('should handle budget overspending scenarios', async () => {
      // Create a small budget
      const budgetResponse = await request(app.getHttpServer())
        .post('/budgets')
        .set(authHeaders.JOHN_DOE)
        .send({
          name: 'Coffee',
          amount: 50,
          category: 'variable',
          month: 7,
          year: 2024,
          userId: TEST_USERS.JOHN_DOE.id,
        })
        .expect(201);

      // Create transactions that exceed the budget
      const transactions = [
        { name: 'Coffee Shop 1', amount: 25 },
        { name: 'Coffee Shop 2', amount: 20 },
        { name: 'Coffee Shop 3', amount: 15 }, // This will cause overspending
      ];

      for (const transactionData of transactions) {
        const transaction = await prisma.transactions.create({
          data: TransactionFactory.createDatabaseData({
            user_id: TEST_USERS.JOHN_DOE.id,
            name: transactionData.name,
            amount: new Decimal(transactionData.amount),
            type: TransactionType.OUTCOME,
          }),
        });

        await prisma.budget_transactions.create({
          data: {
            user_id: TEST_USERS.JOHN_DOE.id,
            budget_id: budgetResponse.body.id,
            transaction_id: transaction.id,
            created_at: new Date(),
            updated_at: new Date(),
          },
        });
      }

      // Verify overspending is correctly calculated
      const analyticsResponse = await request(app.getHttpServer())
        .get('/budgets/with-spending?month=7&year=2024')
        .set(authHeaders.JOHN_DOE)
        .expect(200);

      const coffeeAnalytics = analyticsResponse
        .body[0] as BudgetWithSpendingResponseDto;
      expect(coffeeAnalytics.totalSpent).toBe(60); // 25 + 20 + 15
      expect(coffeeAnalytics.transactionCount).toBe(3);
      expect(coffeeAnalytics.remainingAmount).toBe(-10); // 50 - 60 (negative = overspent)
      expect(coffeeAnalytics.spentPercentage).toBe(120); // (60 / 50) * 100
    });
  });

  describe('Transaction and Budget Lifecycle', () => {
    it('should maintain data consistency when budgets are deleted', async () => {
      // Create budget and transactions
      const testScenario = await TestDataFactory.createCompleteTestScenario(
        prisma,
        TEST_USERS.JOHN_DOE.id,
      );

      const budgetId = testScenario.budgets[0].id;
      const transactionId = testScenario.transactions[0].id;

      // Verify relationship exists
      const budgetTransactionBefore =
        await prisma.budget_transactions.findFirst({
          where: {
            budget_id: budgetId,
            transaction_id: transactionId,
          },
        });
      expect(budgetTransactionBefore).toBeTruthy();

      // Delete budget
      await prisma.budgets.delete({
        where: { id: budgetId },
      });

      // Verify transaction still exists but relationship is handled
      const transactionAfter = await prisma.transactions.findUnique({
        where: { id: transactionId },
      });
      expect(transactionAfter).toBeTruthy();

      // Note: In a real application, you might want to handle orphaned budget_transactions
      // This depends on your business logic and database constraints
    });

    it('should handle concurrent budget-transaction operations', async () => {
      // Create a budget
      const budgetResponse = await request(app.getHttpServer())
        .post('/budgets')
        .set(authHeaders.JOHN_DOE)
        .send({
          name: 'Concurrent Test',
          amount: 1000,
          category: 'variable',
          month: 7,
          year: 2024,
          userId: TEST_USERS.JOHN_DOE.id,
        })
        .expect(201);

      const budgetId = budgetResponse.body.id;

      // Create multiple transactions concurrently
      const transactionPromises = Array.from({ length: 5 }, (_, i) =>
        prisma.transactions.create({
          data: TransactionFactory.createDatabaseData({
            user_id: TEST_USERS.JOHN_DOE.id,
            name: `Concurrent Transaction ${i}`,
            amount: new Decimal(50 + i),
            type: TransactionType.OUTCOME,
          }),
        }),
      );

      const transactions = await Promise.all(transactionPromises);

      // Link all transactions to budget concurrently
      const linkPromises = transactions.map((transaction) =>
        prisma.budget_transactions.create({
          data: {
            user_id: TEST_USERS.JOHN_DOE.id,
            budget_id: budgetId,
            transaction_id: transaction.id,
            created_at: new Date(),
            updated_at: new Date(),
          },
        }),
      );

      await Promise.all(linkPromises);

      // Verify all relationships were created
      const budgetTransactions = await prisma.budget_transactions.findMany({
        where: { budget_id: budgetId },
      });

      expect(budgetTransactions).toHaveLength(5);

      // Verify spending analytics are correct
      const analyticsResponse = await request(app.getHttpServer())
        .get('/budgets/with-spending?month=7&year=2024')
        .set(authHeaders.JOHN_DOE)
        .expect(200);

      const budgetAnalytics = analyticsResponse
        .body[0] as BudgetWithSpendingResponseDto;
      expect(budgetAnalytics.transactionCount).toBe(5);
      expect(budgetAnalytics.totalSpent).toBe(260); // 50+51+52+53+54
    });
  });

  describe('Cross-domain business rules', () => {
    it('should enforce user isolation across budget-transaction relationships', async () => {
      // Create budgets for different users
      const johnBudgetResponse = await request(app.getHttpServer())
        .post('/budgets')
        .set(authHeaders.JOHN_DOE)
        .send({
          name: "John's Budget",
          amount: 500,
          category: 'variable',
          month: 7,
          year: 2024,
          userId: TEST_USERS.JOHN_DOE.id,
        })
        .expect(201);

      const janeBudgetResponse = await request(app.getHttpServer())
        .post('/budgets')
        .set(authHeaders.JANE_SMITH)
        .send({
          name: "Jane's Budget",
          amount: 300,
          category: 'variable',
          month: 7,
          year: 2024,
          userId: TEST_USERS.JANE_SMITH.id,
        })
        .expect(201);

      // Create transactions for both users
      const johnTransaction = await prisma.transactions.create({
        data: TransactionFactory.createDatabaseData({
          user_id: TEST_USERS.JOHN_DOE.id,
          name: "John's Expense",
          amount: new Decimal(100),
          type: TransactionType.OUTCOME,
        }),
      });

      const janeTransaction = await prisma.transactions.create({
        data: TransactionFactory.createDatabaseData({
          user_id: TEST_USERS.JANE_SMITH.id,
          name: "Jane's Expense",
          amount: new Decimal(75),
          type: TransactionType.OUTCOME,
        }),
      });

      // Link transactions to respective budgets
      await prisma.budget_transactions.createMany({
        data: [
          {
            user_id: TEST_USERS.JOHN_DOE.id,
            budget_id: johnBudgetResponse.body.id,
            transaction_id: johnTransaction.id,
            created_at: new Date(),
            updated_at: new Date(),
          },
          {
            user_id: TEST_USERS.JANE_SMITH.id,
            budget_id: janeBudgetResponse.body.id,
            transaction_id: janeTransaction.id,
            created_at: new Date(),
            updated_at: new Date(),
          },
        ],
      });

      // Verify each user only sees their own data
      const johnAnalytics = await request(app.getHttpServer())
        .get('/budgets/with-spending?month=7&year=2024')
        .set(authHeaders.JOHN_DOE)
        .expect(200);

      const janeAnalytics = await request(app.getHttpServer())
        .get('/budgets/with-spending?month=7&year=2024')
        .set(authHeaders.JANE_SMITH)
        .expect(200);

      expect(johnAnalytics.body).toHaveLength(1);
      expect(janeAnalytics.body).toHaveLength(1);

      const johnBody = johnAnalytics.body[0] as BudgetWithSpendingResponseDto;
      const janeBody = janeAnalytics.body[0] as BudgetWithSpendingResponseDto;

      expect(johnBody.name).toBe("John's Budget");
      expect(johnBody.totalSpent).toBe(100);

      expect(janeBody.name).toBe("Jane's Budget");
      expect(janeBody.totalSpent).toBe(75);
    });

    it('should handle complex spending scenarios with multiple budget categories', async () => {
      // Create budgets for different time periods
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
      const nextYear = currentMonth === 12 ? currentYear + 1 : currentYear;

      // Create budgets for current month
      const currentMonthBudgets = await Promise.all([
        request(app.getHttpServer())
          .post('/budgets')
          .set(authHeaders.JOHN_DOE)
          .send({
            name: 'Current Groceries',
            amount: 400,
            category: 'variable',
            month: currentMonth,
            year: currentYear,
            userId: TEST_USERS.JOHN_DOE.id,
          }),
        request(app.getHttpServer())
          .post('/budgets')
          .set(authHeaders.JOHN_DOE)
          .send({
            name: 'Current Entertainment',
            amount: 150,
            category: 'variable',
            month: currentMonth,
            year: currentYear,
            userId: TEST_USERS.JOHN_DOE.id,
          }),
      ]);

      // Create budget for next month
      await request(app.getHttpServer())
        .post('/budgets')
        .set(authHeaders.JOHN_DOE)
        .send({
          name: 'Next Month Groceries',
          amount: 450,
          category: 'variable',
          month: nextMonth,
          year: nextYear,
          userId: TEST_USERS.JOHN_DOE.id,
        });

      // Create transactions and link to current month budgets
      const groceryTransaction = await prisma.transactions.create({
        data: TransactionFactory.createDatabaseData({
          user_id: TEST_USERS.JOHN_DOE.id,
          name: 'Grocery Store',
          amount: new Decimal(85),
          type: TransactionType.OUTCOME,
        }),
      });

      const entertainmentTransaction = await prisma.transactions.create({
        data: TransactionFactory.createDatabaseData({
          user_id: TEST_USERS.JOHN_DOE.id,
          name: 'Concert Tickets',
          amount: new Decimal(120),
          type: TransactionType.OUTCOME,
        }),
      });

      await prisma.budget_transactions.createMany({
        data: [
          {
            user_id: TEST_USERS.JOHN_DOE.id,
            budget_id: currentMonthBudgets[0].body.id,
            transaction_id: groceryTransaction.id,
            created_at: new Date(),
            updated_at: new Date(),
          },
          {
            user_id: TEST_USERS.JOHN_DOE.id,
            budget_id: currentMonthBudgets[1].body.id,
            transaction_id: entertainmentTransaction.id,
            created_at: new Date(),
            updated_at: new Date(),
          },
        ],
      });

      // Verify current month analytics
      const currentMonthAnalytics = await request(app.getHttpServer())
        .get(`/budgets/with-spending?month=${currentMonth}&year=${currentYear}`)
        .set(authHeaders.JOHN_DOE)
        .expect(200);

      expect(currentMonthAnalytics.body).toHaveLength(2);

      const responseBody =
        currentMonthAnalytics.body as BudgetWithSpendingResponseDto[];
      const groceryBudget = responseBody.find(
        (b) => b.name === 'Current Groceries',
      );
      const entertainmentBudget = responseBody.find(
        (b) => b.name === 'Current Entertainment',
      );

      expect(groceryBudget?.totalSpent).toBe(85);
      expect(entertainmentBudget?.totalSpent).toBe(120);

      // Verify next month has no spending yet
      const nextMonthAnalytics = await request(app.getHttpServer())
        .get(`/budgets/with-spending?month=${nextMonth}&year=${nextYear}`)
        .set(authHeaders.JOHN_DOE)
        .expect(200);

      expect(nextMonthAnalytics.body).toHaveLength(1);
      expect(
        (nextMonthAnalytics.body[0] as BudgetWithSpendingResponseDto)
          .totalSpent,
      ).toBe(0);
    });
  });
});
