import { Currency } from '@/common/types/user';
import { CurrencyVO } from '@/common/base';
import { BudgetErrorFactory } from '../../errors';
import {
  BudgetEntity,
  BudgetEntityProps,
  BudgetCategory,
} from '../budget.entity';

describe('BudgetEntity', () => {
  const mockDate = new Date('2024-01-01T00:00:00Z');

  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(mockDate);
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  describe('create', () => {
    it('should create a new BudgetEntity with all properties', () => {
      const amount = new CurrencyVO(1000, Currency.USD);
      const props: Omit<BudgetEntityProps, 'id'> = {
        name: 'Food Budget',
        amount,
        userId: 'user-123',
        category: BudgetCategory.FLEXIBLE,
        color: '#FF5733',
        icon: 'food',
        month: 1,
        year: 2024,
        archivedAt: null,
        createdAt: mockDate,
        updatedAt: mockDate,
      };

      const budget = BudgetEntity.create(props);

      expect(budget.name).toBe('Food Budget');
      expect(budget.amount.value).toBe(1000);
      expect(budget.amount.currency).toBe(Currency.USD);
      expect(budget.userId).toBe('user-123');
      expect(budget.props.category).toBe(BudgetCategory.FLEXIBLE);
      expect(budget.props.color).toBe('#FF5733');
      expect(budget.props.icon).toBe('food');
      expect(budget.props.month).toBe(1);
      expect(budget.props.year).toBe(2024);
      expect(budget.archivedAt).toBeNull();
      expect(budget.id).toBeDefined();
      expect(typeof budget.id).toBe('string');
    });

    it('should create a new BudgetEntity with custom id', () => {
      const amount = new CurrencyVO(500, Currency.VND);
      const props: Omit<BudgetEntityProps, 'id'> = {
        name: 'Transport Budget',
        amount,
        userId: 'user-456',
        category: BudgetCategory.FIXED,
        color: '#33FF57',
        icon: 'transport',
        month: 2,
        year: 2024,
        archivedAt: null,
        createdAt: mockDate,
        updatedAt: mockDate,
      };
      const customId = 'custom-budget-id-123';

      const budget = BudgetEntity.create(props, customId);

      expect(budget.id).toBe(customId);
      expect(budget.name).toBe('Transport Budget');
      expect(budget.amount.value).toBe(500);
      expect(budget.amount.currency).toBe(Currency.VND);
      expect(budget.props.category).toBe(BudgetCategory.FIXED);
    });

    it('should create BudgetEntity with default archivedAt as null', () => {
      const amount = new CurrencyVO(200, Currency.EUR);
      const props: Omit<BudgetEntityProps, 'id' | 'archivedAt'> = {
        name: 'Entertainment Budget',
        amount,
        userId: 'user-789',
        category: BudgetCategory.FLEXIBLE,
        color: '#5733FF',
        icon: 'entertainment',
        month: 3,
        year: 2024,
        createdAt: mockDate,
        updatedAt: mockDate,
      };

      const budget = BudgetEntity.create(props);

      expect(budget.archivedAt).toBeNull();
      expect(budget.isArchived()).toBe(false);
    });

    it('should create BudgetEntity with default timestamps when not provided', () => {
      const amount = new CurrencyVO(300, Currency.USD);
      const props = {
        name: 'Default Timestamps Budget',
        amount,
        userId: 'user-default',
        category: BudgetCategory.FLEXIBLE,
        color: '#FF3357',
        icon: 'default',
        month: 4,
        year: 2024,
      };

      const budget = BudgetEntity.create(props);

      expect(budget.props.createdAt).toEqual(mockDate);
      expect(budget.props.updatedAt).toEqual(mockDate);
      expect(budget.archivedAt).toBeNull();
    });

    it('should handle different budget categories correctly', () => {
      const testCases = [BudgetCategory.FIXED, BudgetCategory.FLEXIBLE];

      testCases.forEach((category) => {
        const amount = new CurrencyVO(400, Currency.USD);
        const props: Omit<BudgetEntityProps, 'id'> = {
          name: `${category} Budget`,
          amount,
          userId: 'user-category-test',
          category,
          color: '#123456',
          icon: 'test',
          month: 5,
          year: 2024,
          archivedAt: null,
          createdAt: mockDate,
          updatedAt: mockDate,
        };

        const budget = BudgetEntity.create(props);
        expect(budget.props.category).toBe(category);
      });
    });

    it('should handle different currencies correctly', () => {
      const testCases = [Currency.VND, Currency.USD, Currency.EUR];

      testCases.forEach((currency) => {
        const amount = new CurrencyVO(600, currency);
        const props: Omit<BudgetEntityProps, 'id'> = {
          name: `${currency} Budget`,
          amount,
          userId: 'user-currency-test',
          category: BudgetCategory.FLEXIBLE,
          color: '#789ABC',
          icon: 'test',
          month: 6,
          year: 2024,
          archivedAt: null,
          createdAt: mockDate,
          updatedAt: mockDate,
        };

        const budget = BudgetEntity.create(props);
        expect(budget.amount.currency).toBe(currency);
      });
    });

    it('should throw error when amount is zero', () => {
      const amount = new CurrencyVO(0, Currency.USD);
      const props: Omit<BudgetEntityProps, 'id'> = {
        name: 'Zero Amount Budget',
        amount,
        userId: 'user-zero',
        category: BudgetCategory.FLEXIBLE,
        color: '#000000',
        icon: 'zero',
        month: 7,
        year: 2024,
        archivedAt: null,
        createdAt: mockDate,
        updatedAt: mockDate,
      };

      expect(() => BudgetEntity.create(props)).toThrow(
        BudgetErrorFactory.budgetInvalidAmount(),
      );
    });

    it('should throw error when amount is negative', () => {
      const amount = new CurrencyVO(-100, Currency.USD);
      const props: Omit<BudgetEntityProps, 'id'> = {
        name: 'Negative Amount Budget',
        amount,
        userId: 'user-negative',
        category: BudgetCategory.FLEXIBLE,
        color: '#FF0000',
        icon: 'negative',
        month: 8,
        year: 2024,
        archivedAt: null,
        createdAt: mockDate,
        updatedAt: mockDate,
      };

      expect(() => BudgetEntity.create(props)).toThrow(
        BudgetErrorFactory.budgetInvalidAmount(),
      );
    });
  });

  describe('getter methods', () => {
    let budget: BudgetEntity;

    beforeEach(() => {
      const amount = new CurrencyVO(1500, Currency.EUR);
      const props: Omit<BudgetEntityProps, 'id'> = {
        name: 'Test Getter Budget',
        amount,
        userId: 'user-getter-test',
        category: BudgetCategory.FIXED,
        color: '#ABCDEF',
        icon: 'getter',
        month: 9,
        year: 2024,
        archivedAt: null,
        createdAt: mockDate,
        updatedAt: mockDate,
      };
      budget = BudgetEntity.create(props);
    });

    it('should return correct name', () => {
      expect(budget.name).toBe('Test Getter Budget');
    });

    it('should return correct userId', () => {
      expect(budget.userId).toBe('user-getter-test');
    });

    it('should return correct amount', () => {
      expect(budget.amount.value).toBe(1500);
      expect(budget.amount.currency).toBe(Currency.EUR);
    });

    it('should return correct archivedAt', () => {
      expect(budget.archivedAt).toBeNull();
    });
  });

  describe('update', () => {
    it('should update name and update timestamp', () => {
      const amount = new CurrencyVO(800, Currency.USD);
      const props: Omit<BudgetEntityProps, 'id'> = {
        name: 'Original Name',
        amount,
        userId: 'user-update',
        category: BudgetCategory.FLEXIBLE,
        color: '#111111',
        icon: 'original',
        month: 10,
        year: 2024,
        archivedAt: null,
        createdAt: mockDate,
        updatedAt: mockDate,
      };
      const budget = BudgetEntity.create(props);

      const newMockDate = new Date('2024-01-02T00:00:00Z');
      jest.setSystemTime(newMockDate);

      budget.update({ name: 'Updated Name' });

      expect(budget.name).toBe('Updated Name');
      expect(budget.props.updatedAt).toEqual(newMockDate);
    });

    it('should update category and icon', () => {
      const amount = new CurrencyVO(900, Currency.USD);
      const props: Omit<BudgetEntityProps, 'id'> = {
        name: 'Update Test Budget',
        amount,
        userId: 'user-update-category',
        category: BudgetCategory.FLEXIBLE,
        color: '#222222',
        icon: 'old-icon',
        month: 11,
        year: 2024,
        archivedAt: null,
        createdAt: mockDate,
        updatedAt: mockDate,
      };
      const budget = BudgetEntity.create(props);

      budget.update({
        category: BudgetCategory.FIXED,
        icon: 'new-icon',
        color: '#FFFFFF',
      });

      expect(budget.props.category).toBe(BudgetCategory.FIXED);
      expect(budget.props.icon).toBe('new-icon');
      expect(budget.props.color).toBe('#FFFFFF');
    });

    it('should update month and year', () => {
      const amount = new CurrencyVO(1100, Currency.VND);
      const props: Omit<BudgetEntityProps, 'id'> = {
        name: 'Date Update Budget',
        amount,
        userId: 'user-date-update',
        category: BudgetCategory.FLEXIBLE,
        color: '#333333',
        icon: 'date',
        month: 1,
        year: 2024,
        archivedAt: null,
        createdAt: mockDate,
        updatedAt: mockDate,
      };
      const budget = BudgetEntity.create(props);

      budget.update({ month: 12, year: 2024 });

      expect(budget.props.month).toBe(12);
      expect(budget.props.year).toBe(2024);
    });

    it('should not affect immutable properties during update', () => {
      const amount = new CurrencyVO(1200, Currency.EUR);
      const props: Omit<BudgetEntityProps, 'id'> = {
        name: 'Immutable Test Budget',
        amount,
        userId: 'user-immutable',
        category: BudgetCategory.FIXED,
        color: '#444444',
        icon: 'immutable',
        month: 5,
        year: 2024,
        archivedAt: null,
        createdAt: mockDate,
        updatedAt: mockDate,
      };
      const budget = BudgetEntity.create(props);

      budget.update({ name: 'Updated Name', color: '#CHANGED' });

      expect(budget.userId).toBe('user-immutable');
      expect(budget.amount.value).toBe(1200);
      expect(budget.amount.currency).toBe(Currency.EUR);
      expect(budget.props.createdAt).toEqual(mockDate);
    });
  });

  describe('archive', () => {
    it('should set archivedAt to current date and update timestamp', () => {
      const amount = new CurrencyVO(700, Currency.USD);
      const props: Omit<BudgetEntityProps, 'id'> = {
        name: 'Archive Test Budget',
        amount,
        userId: 'user-archive',
        category: BudgetCategory.FLEXIBLE,
        color: '#555555',
        icon: 'archive',
        month: 6,
        year: 2024,
        archivedAt: null,
        createdAt: mockDate,
        updatedAt: mockDate,
      };
      const budget = BudgetEntity.create(props);

      const archiveDate = new Date('2024-01-03T00:00:00Z');
      jest.setSystemTime(archiveDate);

      budget.archive();

      expect(budget.archivedAt).toEqual(archiveDate);
      expect(budget.props.updatedAt).toEqual(archiveDate);
      expect(budget.isArchived()).toBe(true);
    });

    it('should overwrite existing archivedAt date', () => {
      const existingArchiveDate = new Date('2024-01-01T00:00:00Z');
      const amount = new CurrencyVO(1300, Currency.VND);
      const props: Omit<BudgetEntityProps, 'id'> = {
        name: 'Re-archive Test Budget',
        amount,
        userId: 'user-re-archive',
        category: BudgetCategory.FIXED,
        color: '#666666',
        icon: 're-archive',
        month: 7,
        year: 2024,
        archivedAt: existingArchiveDate,
        createdAt: mockDate,
        updatedAt: mockDate,
      };
      const budget = BudgetEntity.create(props);

      const newArchiveDate = new Date('2024-01-05T00:00:00Z');
      jest.setSystemTime(newArchiveDate);

      budget.archive();

      expect(budget.archivedAt).toEqual(newArchiveDate);
      expect(budget.archivedAt).not.toEqual(existingArchiveDate);
    });
  });

  describe('isArchived', () => {
    it('should return true when archivedAt is set', () => {
      const archiveDate = new Date('2024-01-15T00:00:00Z');
      const amount = new CurrencyVO(1400, Currency.EUR);
      const props: Omit<BudgetEntityProps, 'id'> = {
        name: 'Archived Budget',
        amount,
        userId: 'user-archived',
        category: BudgetCategory.FLEXIBLE,
        color: '#777777',
        icon: 'archived',
        month: 8,
        year: 2024,
        archivedAt: archiveDate,
        createdAt: mockDate,
        updatedAt: mockDate,
      };
      const budget = BudgetEntity.create(props);

      expect(budget.isArchived()).toBe(true);
    });

    it('should return false when archivedAt is null', () => {
      const amount = new CurrencyVO(1500, Currency.USD);
      const props: Omit<BudgetEntityProps, 'id'> = {
        name: 'Active Budget',
        amount,
        userId: 'user-active',
        category: BudgetCategory.FIXED,
        color: '#888888',
        icon: 'active',
        month: 9,
        year: 2024,
        archivedAt: null,
        createdAt: mockDate,
        updatedAt: mockDate,
      };
      const budget = BudgetEntity.create(props);

      expect(budget.isArchived()).toBe(false);
    });

    it('should return false when archivedAt is undefined', () => {
      const amount = new CurrencyVO(1600, Currency.VND);
      const props: Omit<BudgetEntityProps, 'id'> = {
        name: 'Undefined Archive Budget',
        amount,
        userId: 'user-undefined-archive',
        category: BudgetCategory.FLEXIBLE,
        color: '#999999',
        icon: 'undefined',
        month: 10,
        year: 2024,
        archivedAt: undefined as any,
        createdAt: mockDate,
        updatedAt: mockDate,
      };
      const budget = BudgetEntity.create(props);

      expect(budget.isArchived()).toBe(false);
    });
  });

  describe('inheritance from BaseEntity', () => {
    it('should have an id property', () => {
      const amount = new CurrencyVO(1700, Currency.EUR);
      const props: Omit<BudgetEntityProps, 'id'> = {
        name: 'ID Test Budget',
        amount,
        userId: 'user-id-test',
        category: BudgetCategory.FIXED,
        color: '#AAAAAA',
        icon: 'id-test',
        month: 11,
        year: 2024,
        archivedAt: null,
        createdAt: mockDate,
        updatedAt: mockDate,
      };
      const budget = BudgetEntity.create(props);

      expect(budget.id).toBeDefined();
      expect(typeof budget.id).toBe('string');
      expect(budget.id.length).toBeGreaterThan(0);
    });

    it('should have props property with readonly access', () => {
      const amount = new CurrencyVO(1800, Currency.USD);
      const props: Omit<BudgetEntityProps, 'id'> = {
        name: 'Props Test Budget',
        amount,
        userId: 'user-props-test',
        category: BudgetCategory.FLEXIBLE,
        color: '#BBBBBB',
        icon: 'props-test',
        month: 12,
        year: 2024,
        archivedAt: null,
        createdAt: mockDate,
        updatedAt: mockDate,
      };
      const budget = BudgetEntity.create(props);

      expect(budget.props).toBeDefined();
      expect(budget.props.name).toBe('Props Test Budget');
      expect(budget.props.userId).toBe('user-props-test');
      expect(budget.props.createdAt).toEqual(mockDate);
      expect(budget.props.updatedAt).toEqual(mockDate);
    });

    it('should support equals method', () => {
      const amount = new CurrencyVO(1900, Currency.VND);
      const props: Omit<BudgetEntityProps, 'id'> = {
        name: 'Equals Test Budget',
        amount,
        userId: 'user-equals-test',
        category: BudgetCategory.FIXED,
        color: '#CCCCCC',
        icon: 'equals-test',
        month: 1,
        year: 2025,
        archivedAt: null,
        createdAt: mockDate,
        updatedAt: mockDate,
      };

      const budget1 = BudgetEntity.create(props, 'test-budget-id');
      const budget2 = BudgetEntity.create(props, 'test-budget-id');
      const budget3 = BudgetEntity.create(props, 'different-budget-id');

      expect(budget1.equals(budget2)).toBe(true);
      expect(budget1.equals(budget3)).toBe(false);
      expect(budget1.equals(null as any)).toBe(false);
      expect(budget1.equals(undefined)).toBe(false);
    });

    it('should support toObject method', () => {
      const amount = new CurrencyVO(2000, Currency.EUR);
      const props: Omit<BudgetEntityProps, 'id'> = {
        name: 'ToObject Test Budget',
        amount,
        userId: 'user-toobject-test',
        category: BudgetCategory.FLEXIBLE,
        color: '#DDDDDD',
        icon: 'toobject-test',
        month: 2,
        year: 2025,
        archivedAt: null,
        createdAt: mockDate,
        updatedAt: mockDate,
      };
      const budget = BudgetEntity.create(props);

      const object = budget.toObject();

      expect(object).toHaveProperty('id');
      expect(object).toHaveProperty('name', 'ToObject Test Budget');
      expect(object).toHaveProperty('userId', 'user-toobject-test');
      expect(object).toHaveProperty('category', BudgetCategory.FLEXIBLE);
      expect(object).toHaveProperty('color', '#DDDDDD');
      expect(object).toHaveProperty('icon', 'toobject-test');
      expect(object).toHaveProperty('month', 2);
      expect(object).toHaveProperty('year', 2025);
      expect(object).toHaveProperty('archivedAt', null);
      expect(object).toHaveProperty('createdAt');
      expect(object).toHaveProperty('updatedAt');
    });
  });

  describe('edge cases and error scenarios', () => {
    it('should handle empty string name gracefully in entity creation', () => {
      const amount = new CurrencyVO(100, Currency.USD);
      const props: Omit<BudgetEntityProps, 'id'> = {
        name: '',
        amount,
        userId: 'user-empty-name',
        category: BudgetCategory.FLEXIBLE,
        color: '#EEEEEE',
        icon: 'empty',
        month: 3,
        year: 2025,
        archivedAt: null,
        createdAt: mockDate,
        updatedAt: mockDate,
      };

      const budget = BudgetEntity.create(props);
      expect(budget.name).toBe('');
    });

    it('should handle multiple property updates correctly', () => {
      const amount = new CurrencyVO(2100, Currency.VND);
      const props: Omit<BudgetEntityProps, 'id'> = {
        name: 'Multiple Updates Budget',
        amount,
        userId: 'user-multiple-updates',
        category: BudgetCategory.FIXED,
        color: '#FFFFFF',
        icon: 'multiple',
        month: 4,
        year: 2025,
        archivedAt: null,
        createdAt: mockDate,
        updatedAt: mockDate,
      };
      const budget = BudgetEntity.create(props);

      budget.update({
        name: 'Updated Multiple Budget',
        category: BudgetCategory.FLEXIBLE,
        color: '#000000',
        icon: 'updated',
        month: 5,
        year: 2025,
      });

      expect(budget.name).toBe('Updated Multiple Budget');
      expect(budget.props.category).toBe(BudgetCategory.FLEXIBLE);
      expect(budget.props.color).toBe('#000000');
      expect(budget.props.icon).toBe('updated');
      expect(budget.props.month).toBe(5);
      expect(budget.props.year).toBe(2025);
    });

    it('should maintain userId and amount immutability', () => {
      const amount = new CurrencyVO(2200, Currency.EUR);
      const props: Omit<BudgetEntityProps, 'id'> = {
        name: 'Immutability Test Budget',
        amount,
        userId: 'original-user-id',
        category: BudgetCategory.FLEXIBLE,
        color: '#123456',
        icon: 'immutability',
        month: 6,
        year: 2025,
        archivedAt: null,
        createdAt: mockDate,
        updatedAt: mockDate,
      };
      const budget = BudgetEntity.create(props);

      budget.update({ name: 'New Name', color: '#FEDCBA' });
      budget.archive();

      expect(budget.userId).toBe('original-user-id');
      expect(budget.amount.value).toBe(2200);
      expect(budget.amount.currency).toBe(Currency.EUR);
    });
  });
});
