import { Currency } from '@/common/types/user';
import { CurrencyVO } from '@/common/base';
import { TransactionEntity, TransactionType } from '../transactions.entity';

describe('TransactionEntity', () => {
  const mockDate = new Date('2024-01-01T00:00:00Z');

  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(mockDate);
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  describe('create', () => {
    it('should create a new TransactionEntity with all properties', () => {
      const amount = new CurrencyVO(500, Currency.USD);
      const props = {
        userId: 'user-123',
        amount,
        recurring: 0,
        name: 'Grocery Shopping',
        description: 'Weekly grocery shopping at supermarket',
        type: TransactionType.OUTCOME,
        createdAt: mockDate,
        updatedAt: mockDate,
      };

      const transaction = TransactionEntity.create(props);

      expect(transaction.props.userId).toBe('user-123');
      expect(transaction.amount.value).toBe(500);
      expect(transaction.amount.currency).toBe(Currency.USD);
      expect(transaction.props.recurring).toBe(0);
      expect(transaction.props.name).toBe('Grocery Shopping');
      expect(transaction.props.description).toBe(
        'Weekly grocery shopping at supermarket',
      );
      expect(transaction.props.type).toBe(TransactionType.OUTCOME);
      expect(transaction.id).toBeDefined();
      expect(typeof transaction.id).toBe('string');
    });

    it('should create a new TransactionEntity with custom id', () => {
      const amount = new CurrencyVO(1200, Currency.VND);
      const props = {
        userId: 'user-456',
        amount,
        recurring: 1,
        name: 'Salary',
        description: 'Monthly salary payment',
        type: TransactionType.INCOME,
        createdAt: mockDate,
        updatedAt: mockDate,
      };
      const customId = 'custom-transaction-id-123';

      const transaction = TransactionEntity.create(props, customId);

      expect(transaction.id).toBe(customId);
      expect(transaction.props.name).toBe('Salary');
      expect(transaction.amount.value).toBe(1200);
      expect(transaction.amount.currency).toBe(Currency.VND);
      expect(transaction.props.type).toBe(TransactionType.INCOME);
    });

    it('should create TransactionEntity with provided timestamps', () => {
      const amount = new CurrencyVO(300, Currency.EUR);
      const props = {
        userId: 'user-timestamps',
        amount,
        recurring: 2,
        name: 'Bank Transfer',
        description: 'Transfer to savings account',
        type: TransactionType.TRANSFER,
        createdAt: mockDate,
        updatedAt: mockDate,
      };

      const transaction = TransactionEntity.create(props);

      expect(transaction.props.createdAt).toEqual(mockDate);
      expect(transaction.props.updatedAt).toEqual(mockDate);
      expect(transaction.props.createdAt).toBeInstanceOf(Date);
      expect(transaction.props.updatedAt).toBeInstanceOf(Date);
    });

    it('should handle different transaction types correctly', () => {
      const testCases = [
        TransactionType.INCOME,
        TransactionType.OUTCOME,
        TransactionType.TRANSFER,
      ];

      testCases.forEach((type) => {
        const amount = new CurrencyVO(400, Currency.USD);
        const props = {
          userId: 'user-type-test',
          amount,
          recurring: 0,
          name: `${type} Transaction`,
          description: `Test ${type} transaction`,
          type,
          createdAt: mockDate,
          updatedAt: mockDate,
        };

        const transaction = TransactionEntity.create(props);
        expect(transaction.props.type).toBe(type);
      });
    });

    it('should handle different currencies correctly', () => {
      const testCases = [Currency.VND, Currency.USD, Currency.EUR];

      testCases.forEach((currency) => {
        const amount = new CurrencyVO(600, currency);
        const props = {
          userId: 'user-currency-test',
          amount,
          recurring: 0,
          name: `${currency} Transaction`,
          description: `Test transaction in ${currency}`,
          type: TransactionType.OUTCOME,
          createdAt: mockDate,
          updatedAt: mockDate,
        };

        const transaction = TransactionEntity.create(props);
        expect(transaction.amount.currency).toBe(currency);
      });
    });

    it('should handle different recurring values correctly', () => {
      const testCases = [0, 1, 2, 12, 30];

      testCases.forEach((recurring) => {
        const amount = new CurrencyVO(700, Currency.USD);
        const props = {
          userId: 'user-recurring-test',
          amount,
          recurring,
          name: `Recurring ${recurring} Transaction`,
          description: `Test transaction with recurring ${recurring}`,
          type: TransactionType.INCOME,
          createdAt: mockDate,
          updatedAt: mockDate,
        };

        const transaction = TransactionEntity.create(props);
        expect(transaction.props.recurring).toBe(recurring);
      });
    });
  });

  describe('getter methods', () => {
    let transaction: TransactionEntity;

    beforeEach(() => {
      const amount = new CurrencyVO(1500, Currency.EUR);
      const props = {
        userId: 'user-getter-test',
        amount,
        recurring: 3,
        name: 'Test Getter Transaction',
        description: 'Transaction for testing getters',
        type: TransactionType.TRANSFER,
        createdAt: mockDate,
        updatedAt: mockDate,
      };
      transaction = TransactionEntity.create(props);
    });

    it('should return correct amount', () => {
      expect(transaction.amount.value).toBe(1500);
      expect(transaction.amount.currency).toBe(Currency.EUR);
    });
  });

  describe('inheritance from BaseEntity', () => {
    it('should have an id property', () => {
      const amount = new CurrencyVO(1700, Currency.VND);
      const props = {
        userId: 'user-id-test',
        amount,
        recurring: 0,
        name: 'ID Test Transaction',
        description: 'Transaction for testing ID',
        type: TransactionType.OUTCOME,
        createdAt: mockDate,
        updatedAt: mockDate,
      };
      const transaction = TransactionEntity.create(props);

      expect(transaction.id).toBeDefined();
      expect(typeof transaction.id).toBe('string');
      expect(transaction.id.length).toBeGreaterThan(0);
    });

    it('should have props property with readonly access', () => {
      const amount = new CurrencyVO(1800, Currency.USD);
      const props = {
        userId: 'user-props-test',
        amount,
        recurring: 4,
        name: 'Props Test Transaction',
        description: 'Transaction for testing props',
        type: TransactionType.INCOME,
        createdAt: mockDate,
        updatedAt: mockDate,
      };
      const transaction = TransactionEntity.create(props);

      expect(transaction.props).toBeDefined();
      expect(transaction.props.name).toBe('Props Test Transaction');
      expect(transaction.props.userId).toBe('user-props-test');
      expect(transaction.props.createdAt).toEqual(mockDate);
      expect(transaction.props.updatedAt).toEqual(mockDate);
    });

    it('should support equals method', () => {
      const amount = new CurrencyVO(1900, Currency.EUR);
      const props = {
        userId: 'user-equals-test',
        amount,
        recurring: 1,
        name: 'Equals Test Transaction',
        description: 'Transaction for testing equals',
        type: TransactionType.TRANSFER,
        createdAt: mockDate,
        updatedAt: mockDate,
      };

      const transaction1 = TransactionEntity.create(
        props,
        'test-transaction-id',
      );
      const transaction2 = TransactionEntity.create(
        props,
        'test-transaction-id',
      );
      const transaction3 = TransactionEntity.create(
        props,
        'different-transaction-id',
      );

      expect(transaction1.equals(transaction2)).toBe(true);
      expect(transaction1.equals(transaction3)).toBe(false);
      expect(transaction1.equals(null as any)).toBe(false);
      expect(transaction1.equals(undefined)).toBe(false);
    });

    it('should support toObject method', () => {
      const amount = new CurrencyVO(2000, Currency.VND);
      const props = {
        userId: 'user-toobject-test',
        amount,
        recurring: 6,
        name: 'ToObject Test Transaction',
        description: 'Transaction for testing toObject',
        type: TransactionType.OUTCOME,
        createdAt: mockDate,
        updatedAt: mockDate,
      };
      const transaction = TransactionEntity.create(props);

      const object = transaction.toObject();

      expect(object).toHaveProperty('id');
      expect(object).toHaveProperty('userId', 'user-toobject-test');
      expect(object).toHaveProperty('recurring', 6);
      expect(object).toHaveProperty('name', 'ToObject Test Transaction');
      expect(object).toHaveProperty(
        'description',
        'Transaction for testing toObject',
      );
      expect(object).toHaveProperty('type', TransactionType.OUTCOME);
      expect(object).toHaveProperty('createdAt');
      expect(object).toHaveProperty('updatedAt');
    });
  });

  describe('edge cases and error scenarios', () => {
    it('should handle empty string name gracefully in entity creation', () => {
      const amount = new CurrencyVO(100, Currency.USD);
      const props = {
        userId: 'user-empty-name',
        amount,
        recurring: 0,
        name: '',
        description: 'Transaction with empty name',
        type: TransactionType.OUTCOME,
        createdAt: mockDate,
        updatedAt: mockDate,
      };

      const transaction = TransactionEntity.create(props);
      expect(transaction.props.name).toBe('');
    });

    it('should handle empty string description gracefully in entity creation', () => {
      const amount = new CurrencyVO(200, Currency.EUR);
      const props = {
        userId: 'user-empty-desc',
        amount,
        recurring: 0,
        name: 'Transaction with empty description',
        description: '',
        type: TransactionType.INCOME,
        createdAt: mockDate,
        updatedAt: mockDate,
      };

      const transaction = TransactionEntity.create(props);
      expect(transaction.props.description).toBe('');
    });

    it('should handle zero recurring value', () => {
      const amount = new CurrencyVO(300, Currency.VND);
      const props = {
        userId: 'user-zero-recurring',
        amount,
        recurring: 0,
        name: 'Non-recurring transaction',
        description: 'One-time transaction',
        type: TransactionType.TRANSFER,
        createdAt: mockDate,
        updatedAt: mockDate,
      };

      const transaction = TransactionEntity.create(props);
      expect(transaction.props.recurring).toBe(0);
    });

    it('should handle negative recurring value', () => {
      const amount = new CurrencyVO(400, Currency.USD);
      const props = {
        userId: 'user-negative-recurring',
        amount,
        recurring: -1,
        name: 'Negative recurring transaction',
        description: 'Transaction with negative recurring',
        type: TransactionType.OUTCOME,
        createdAt: mockDate,
        updatedAt: mockDate,
      };

      const transaction = TransactionEntity.create(props);
      expect(transaction.props.recurring).toBe(-1);
    });

    it('should maintain immutability of core properties', () => {
      const amount = new CurrencyVO(2200, Currency.EUR);
      const props = {
        userId: 'original-user-id',
        amount,
        recurring: 5,
        name: 'Immutability Test Transaction',
        description: 'Transaction for testing immutability',
        type: TransactionType.INCOME,
        createdAt: mockDate,
        updatedAt: mockDate,
      };
      const transaction = TransactionEntity.create(props);

      expect(transaction.props.userId).toBe('original-user-id');
      expect(transaction.amount.value).toBe(2200);
      expect(transaction.amount.currency).toBe(Currency.EUR);
      expect(transaction.props.type).toBe(TransactionType.INCOME);
    });
  });
});
