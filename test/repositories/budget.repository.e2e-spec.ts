import { Test, TestingModule } from '@nestjs/testing';
import { BudgetRepository } from '../../src/budgeting/domain/repositories/budget.repository';
import { BudgetRepositoryImpl } from '../../src/budgeting/infrastructure/repositories/budget.repository';
import { PrismaModule } from '../../src/common/prisma/prisma.module';
import { TestDatabaseManager } from '../setup/database.setup';
import { BudgetFactory } from '../factories/budget.factory';
import { TestDataFactory } from '../factories';
import { TEST_USERS } from '../utils/auth.utils';
import { PrismaClient } from '../../generated/prisma';
import { BudgetCategory } from '../../src/budgeting/domain/entities/budget.entity';

describe('Budget Repository Integration', () => {
  let repository: BudgetRepository;
  let prisma: PrismaClient;
  let moduleRef: TestingModule;

  beforeAll(async () => {
    // Setup test database
    prisma = await TestDatabaseManager.setupTestDatabase();

    // Create testing module with repository
    moduleRef = await Test.createTestingModule({
      imports: [PrismaModule],
      providers: [
        {
          provide: BudgetRepository,
          useClass: BudgetRepositoryImpl,
        },
      ],
    }).compile();

    repository = moduleRef.get<BudgetRepository>(BudgetRepository);
  });

  afterAll(async () => {
    await TestDatabaseManager.teardownTestDatabase();
    await moduleRef.close();
  });

  beforeEach(async () => {
    // Clean up test data before each test
    await TestDatabaseManager.cleanupTestDatabase();

    // Create test user
    await prisma.auth_users.create({
      data: {
        id: TEST_USERS.JOHN_DOE.id,
        email: TEST_USERS.JOHN_DOE.email,
        aud: 'authenticated',
        role: 'authenticated',
        email_confirmed_at: new Date(),
        confirmed_at: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    await prisma.public_users.create({
      data: {
        user_id: TEST_USERS.JOHN_DOE.id,
        name: TEST_USERS.JOHN_DOE.name || 'John Doe',
        created_at: new Date(),
        updated_at: new Date(),
      },
    });
  });

  describe('create', () => {
    it('should create a budget and return the entity', async () => {
      const budgetEntity = BudgetFactory.create({
        userId: TEST_USERS.JOHN_DOE.id,
        name: 'Groceries',
        amount: 500,
        category: BudgetCategory.FLEXIBLE,
        month: 7,
        year: 2024,
      });

      const createdBudget = await repository.create(budgetEntity);

      expect(createdBudget).toBeDefined();
      expect(createdBudget.id).toBeDefined();
      expect(createdBudget.props.name).toBe('Groceries');
      expect(createdBudget.props.amount).toBe(500);
      expect(createdBudget.props.userId).toBe(TEST_USERS.JOHN_DOE.id);

      // Verify budget was actually saved to database
      const savedBudget = await prisma.budgets.findUnique({
        where: { id: createdBudget.id },
      });

      expect(savedBudget).toBeTruthy();
      expect(savedBudget?.name).toBe('Groceries');
      expect(Number(savedBudget?.amount)).toBe(500);
    });

    it('should create multiple budgets with unique IDs', async () => {
      const budget1 = BudgetFactory.create({
        userId: TEST_USERS.JOHN_DOE.id,
        name: 'Groceries',
      });

      const budget2 = BudgetFactory.create({
        userId: TEST_USERS.JOHN_DOE.id,
        name: 'Entertainment',
      });

      const createdBudget1 = await repository.create(budget1);
      const createdBudget2 = await repository.create(budget2);

      expect(createdBudget1.id).not.toBe(createdBudget2.id);
      expect(createdBudget1.props.name).toBe('Groceries');
      expect(createdBudget2.props.name).toBe('Entertainment');
    });
  });

  describe('findById', () => {
    it('should find a budget by ID', async () => {
      // Create a budget first
      const budgetEntity = BudgetFactory.create({
        userId: TEST_USERS.JOHN_DOE.id,
        name: 'Rent',
        amount: 1200,
      });

      const createdBudget = await repository.create(budgetEntity);

      // Find the budget by ID
      const foundBudget = await repository.findById(createdBudget.id);

      expect(foundBudget).toBeDefined();
      expect(foundBudget!.id).toBe(createdBudget.id);
      expect(foundBudget!.props.name).toBe('Rent');
      expect(foundBudget!.props.amount).toBe(1200);
    });

    it('should return null for non-existent budget ID', async () => {
      const foundBudget = await repository.findById('non-existent-id');
      expect(foundBudget).toBeNull();
    });
  });

  describe('findManyByUserId', () => {
    beforeEach(async () => {
      // Create multiple budgets for testing
      const budgets = BudgetFactory.createMany(3, {
        userId: TEST_USERS.JOHN_DOE.id,
        month: 7,
        year: 2024,
      });

      for (const budget of budgets) {
        await repository.create(budget);
      }

      // Create budget for different user (should not be returned)
      await prisma.auth_users.create({
        data: {
          id: TEST_USERS.JANE_SMITH.id,
          email: TEST_USERS.JANE_SMITH.email,
          aud: 'authenticated',
          role: 'authenticated',
          email_confirmed_at: new Date(),
          confirmed_at: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
      });

      await prisma.public_users.create({
        data: {
          user_id: TEST_USERS.JANE_SMITH.id,
          name: TEST_USERS.JANE_SMITH.name || 'Jane Smith',
          created_at: new Date(),
          updated_at: new Date(),
        },
      });

      const janeBudget = BudgetFactory.create({
        userId: TEST_USERS.JANE_SMITH.id,
        name: 'Jane Budget',
      });
      await repository.create(janeBudget);
    });

    it('should return budgets only for the specified user', async () => {
      const johnBudgets = await repository.findMany({
        userId: TEST_USERS.JOHN_DOE.id,
      });
      const janeBudgets = await repository.findMany({
        userId: TEST_USERS.JANE_SMITH.id,
      });

      expect(johnBudgets).toHaveLength(3);
      expect(janeBudgets).toHaveLength(1);

      // Verify all returned budgets belong to the correct user
      johnBudgets.forEach((budget) => {
        expect(budget.props.userId).toBe(TEST_USERS.JOHN_DOE.id);
      });

      janeBudgets.forEach((budget) => {
        expect(budget.props.userId).toBe(TEST_USERS.JANE_SMITH.id);
      });
    });

    it('should return empty array for user with no budgets', async () => {
      const budgets = await repository.findMany({
        userId: 'non-existent-user',
      });
      expect(budgets).toHaveLength(0);
    });
  });

  describe('findManyByMonth', () => {
    beforeEach(async () => {
      // Create budgets for different months
      const july2024Budgets = BudgetFactory.createMonthlyBudgets(
        TEST_USERS.JOHN_DOE.id,
        7,
        2024,
        2,
      );

      const august2024Budgets = BudgetFactory.createMonthlyBudgets(
        TEST_USERS.JOHN_DOE.id,
        8,
        2024,
        1,
      );

      for (const budget of [...july2024Budgets, ...august2024Budgets]) {
        await repository.create(budget);
      }
    });

    it('should return budgets for specific month and year', async () => {
      const july2024Budgets = await repository.findManyByMonth(
        TEST_USERS.JOHN_DOE.id,
        7,
        2024,
      );

      const august2024Budgets = await repository.findManyByMonth(
        TEST_USERS.JOHN_DOE.id,
        8,
        2024,
      );

      expect(july2024Budgets).toHaveLength(2);
      expect(august2024Budgets).toHaveLength(1);

      // Verify correct month and year
      july2024Budgets.forEach((budget) => {
        expect(budget.props.month).toBe(7);
        expect(budget.props.year).toBe(2024);
      });

      august2024Budgets.forEach((budget) => {
        expect(budget.props.month).toBe(8);
        expect(budget.props.year).toBe(2024);
      });
    });

    it('should return empty array for month with no budgets', async () => {
      const budgets = await repository.findManyByMonth(
        TEST_USERS.JOHN_DOE.id,
        12,
        2024,
      );

      expect(budgets).toHaveLength(0);
    });
  });

  describe('findManyWithSpending', () => {
    beforeEach(async () => {
      // Create a complete test scenario with budgets, transactions, and relationships
      await TestDataFactory.createCompleteTestScenario(
        prisma,
        TEST_USERS.JOHN_DOE.id,
      );
    });

    it('should return budgets with spending data', async () => {
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();

      const budgetsWithSpending = await repository.findManyWithSpending(
        TEST_USERS.JOHN_DOE.id,
        currentMonth,
        currentYear,
      );

      expect(budgetsWithSpending.length).toBeGreaterThan(0);

      // Verify structure of returned data
      budgetsWithSpending.forEach((item) => {
        expect(item).toHaveProperty('budget');
        expect(item).toHaveProperty('totalSpent');
        expect(item).toHaveProperty('transactionCount');

        // Verify budget entity
        expect(item.budget.props.userId).toBe(TEST_USERS.JOHN_DOE.id);
        expect(item.budget.props.month).toBe(currentMonth);
        expect(item.budget.props.year).toBe(currentYear);

        // Verify spending data types
        expect(typeof item.totalSpent).toBe('number');
        expect(typeof item.transactionCount).toBe('number');
        expect(item.totalSpent).toBeGreaterThanOrEqual(0);
        expect(item.transactionCount).toBeGreaterThanOrEqual(0);
      });
    });

    it('should return budgets with zero spending when no transactions exist', async () => {
      // Clean up transactions to test zero spending scenario
      await prisma.budget_transactions.deleteMany({
        where: { user_id: TEST_USERS.JOHN_DOE.id },
      });
      await prisma.transactions.deleteMany({
        where: { user_id: TEST_USERS.JOHN_DOE.id },
      });

      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();

      const budgetsWithSpending = await repository.findManyWithSpending(
        TEST_USERS.JOHN_DOE.id,
        currentMonth,
        currentYear,
      );

      expect(budgetsWithSpending.length).toBeGreaterThan(0);

      // Verify zero spending data
      budgetsWithSpending.forEach((item) => {
        expect(item.totalSpent).toBe(0);
        expect(item.transactionCount).toBe(0);
      });
    });
  });

  describe('update', () => {
    it('should update a budget and return the updated entity', async () => {
      // Create initial budget
      const budgetEntity = BudgetFactory.create({
        userId: TEST_USERS.JOHN_DOE.id,
        name: 'Groceries',
        amount: 500,
      });

      const createdBudget = await repository.create(budgetEntity);

      // Update the budget by creating a new entity with updated props
      const updatedBudgetEntity = BudgetFactory.create({
        id: createdBudget.id,
        userId: createdBudget.props.userId,
        name: 'Updated Groceries',
        amount: 600,
        category: createdBudget.props.category,
        color: createdBudget.props.color,
        icon: createdBudget.props.icon,
        month: createdBudget.props.month,
        year: createdBudget.props.year,
      });

      const updatedBudget = await repository.update(updatedBudgetEntity);

      expect(updatedBudget.id).toBe(createdBudget.id);
      expect(updatedBudget.props.name).toBe('Updated Groceries');
      expect(updatedBudget.props.amount).toBe(600);

      // Verify update was persisted to database
      const savedBudget = await prisma.budgets.findUnique({
        where: { id: createdBudget.id },
      });

      expect(savedBudget?.name).toBe('Updated Groceries');
      expect(Number(savedBudget?.amount)).toBe(600);
    });
  });

  describe('delete', () => {
    it('should delete a budget', async () => {
      // Create initial budget
      const budgetEntity = BudgetFactory.create({
        userId: TEST_USERS.JOHN_DOE.id,
        name: 'Temporary Budget',
        amount: 100,
      });

      const createdBudget = await repository.create(budgetEntity);

      // Verify budget exists
      const foundBeforeDelete = await repository.findById(createdBudget.id);
      expect(foundBeforeDelete).toBeDefined();

      // Delete the budget
      await repository.delete(createdBudget);

      // Verify budget no longer exists
      const foundAfterDelete = await repository.findById(createdBudget.id);
      expect(foundAfterDelete).toBeNull();

      // Verify deletion from database
      const savedBudget = await prisma.budgets.findUnique({
        where: { id: createdBudget.id },
      });
      expect(savedBudget).toBeNull();
    });

    it('should handle deletion of non-existent budget gracefully', async () => {
      // Create a budget to delete
      const budgetToDelete = BudgetFactory.create({
        id: 'non-existent-id',
        userId: 'test-user',
      });

      // This should not throw an error
      await expect(repository.delete(budgetToDelete)).resolves.not.toThrow();
    });
  });

  describe('Performance and consistency', () => {
    it('should handle concurrent budget creation', async () => {
      const concurrentBudgets = Array.from({ length: 10 }, (_, i) =>
        BudgetFactory.create({
          userId: TEST_USERS.JOHN_DOE.id,
          name: `Concurrent Budget ${i}`,
          amount: 100 + i,
        }),
      );

      // Create all budgets concurrently
      const createdBudgets = await Promise.all(
        concurrentBudgets.map((budget) => repository.create(budget)),
      );

      expect(createdBudgets).toHaveLength(10);

      // Verify all budgets have unique IDs
      const ids = createdBudgets.map((budget) => budget.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(10);

      // Verify all budgets were saved
      const allBudgets = await repository.findMany({
        userId: TEST_USERS.JOHN_DOE.id,
      });
      expect(allBudgets).toHaveLength(10);
    });

    it('should maintain data consistency across operations', async () => {
      const budget = BudgetFactory.create({
        userId: TEST_USERS.JOHN_DOE.id,
        name: 'Consistency Test',
        amount: 1000,
      });

      // Create
      const created = await repository.create(budget);
      expect(created.props.name).toBe('Consistency Test');

      // Read
      const found = await repository.findById(created.id);
      expect(found!.props.name).toBe('Consistency Test');

      // Update
      const updatedEntity = BudgetFactory.create({
        id: found!.id,
        userId: found!.props.userId,
        name: 'Updated Name',
        amount: found!.props.amount,
        category: found!.props.category,
        color: found!.props.color,
        icon: found!.props.icon,
        month: found!.props.month,
        year: found!.props.year,
      });

      const updated = await repository.update(updatedEntity);
      expect(updated.props.name).toBe('Updated Name');

      // Verify update
      const foundAgain = await repository.findById(created.id);
      expect(foundAgain!.props.name).toBe('Updated Name');

      // Delete
      await repository.delete(created);

      // Verify deletion
      const foundAfterDelete = await repository.findById(created.id);
      expect(foundAfterDelete).toBeNull();
    });
  });
});
