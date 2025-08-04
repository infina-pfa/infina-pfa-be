import { Currency, Language } from '@/common/types/user';
import { UserEntity, UserEntityProps, FinancialStage } from '../user.entity';

describe('UserEntity', () => {
  const mockDate = new Date('2024-01-01T00:00:00Z');

  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(mockDate);
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  describe('create', () => {
    it('should create a new UserEntity with all properties', () => {
      const props: Omit<UserEntityProps, 'id'> = {
        name: 'John Doe',
        userId: 'auth-user-123',
        financialStage: FinancialStage.START_INVESTING,
        onboardingCompletedAt: new Date(),
        currency: Currency.USD,
        language: Language.EN,
        createdAt: mockDate,
        updatedAt: mockDate,
      };

      const user = UserEntity.create(props);

      expect(user.name).toBe('John Doe');
      expect(user.userId).toBe('auth-user-123');
      expect(user.financialStage).toBe(FinancialStage.START_INVESTING);
      expect(user.onboardingCompletedAt).toEqual(new Date());
      expect(user.currency).toBe(Currency.USD);
      expect(user.language).toBe(Language.EN);
      expect(user.id).toBeDefined();
      expect(typeof user.id).toBe('string');
    });

    it('should create a new UserEntity with custom id', () => {
      const props: Omit<UserEntityProps, 'id'> = {
        name: 'Jane Smith',
        userId: 'auth-user-456',
        financialStage: null,
        onboardingCompletedAt: null,
        currency: Currency.VND,
        language: Language.VI,
        createdAt: mockDate,
        updatedAt: mockDate,
      };
      const customId = 'custom-id-123';

      const user = UserEntity.create(props, customId);

      expect(user.id).toBe(customId);
      expect(user.name).toBe('Jane Smith');
      expect(user.userId).toBe('auth-user-456');
      expect(user.financialStage).toBeNull();
      expect(user.onboardingCompletedAt).toBeNull();
    });

    it('should create UserEntity with null financial stage and onboarding date', () => {
      const props: Omit<UserEntityProps, 'id'> = {
        name: 'Test User',
        userId: 'auth-user-789',
        financialStage: null,
        onboardingCompletedAt: null,
        currency: Currency.EUR,
        language: Language.EN,
        createdAt: mockDate,
        updatedAt: mockDate,
      };

      const user = UserEntity.create(props);

      expect(user.financialStage).toBeNull();
      expect(user.onboardingCompletedAt).toBeNull();
      expect(user.isOnboardingCompleted()).toBe(false);
    });
  });

  describe('updateName', () => {
    it('should update the name and updatedAt timestamp', () => {
      const props: Omit<UserEntityProps, 'id'> = {
        name: 'Old Name',
        userId: 'auth-user-123',
        financialStage: null,
        onboardingCompletedAt: null,
        currency: Currency.VND,
        language: Language.VI,
        createdAt: mockDate,
        updatedAt: mockDate,
      };
      const user = UserEntity.create(props);

      const newMockDate = new Date('2024-01-02T00:00:00Z');
      jest.setSystemTime(newMockDate);

      user.updateName('New Name');

      expect(user.name).toBe('New Name');
      expect(user.props.updatedAt).toEqual(newMockDate);
    });

    it('should not affect other properties when updating name', () => {
      const props: Omit<UserEntityProps, 'id'> = {
        name: 'Original Name',
        userId: 'auth-user-123',
        financialStage: FinancialStage.DEBT,
        onboardingCompletedAt: null,
        currency: Currency.USD,
        language: Language.EN,
        createdAt: mockDate,
        updatedAt: mockDate,
      };
      const user = UserEntity.create(props);

      user.updateName('Updated Name');

      expect(user.name).toBe('Updated Name');
      expect(user.userId).toBe('auth-user-123');
      expect(user.financialStage).toBe(FinancialStage.DEBT);
      expect(user.currency).toBe(Currency.USD);
      expect(user.language).toBe(Language.EN);
    });
  });

  describe('setFinancialStage', () => {
    it('should update the financial stage and updatedAt timestamp', () => {
      const props: Omit<UserEntityProps, 'id'> = {
        name: 'John Doe',
        userId: 'auth-user-123',
        financialStage: null,
        onboardingCompletedAt: null,
        currency: Currency.VND,
        language: Language.VI,
        createdAt: mockDate,
        updatedAt: mockDate,
      };
      const user = UserEntity.create(props);

      const newMockDate = new Date('2024-01-02T00:00:00Z');
      jest.setSystemTime(newMockDate);

      user.setFinancialStage(FinancialStage.START_SAVING);

      expect(user.financialStage).toBe(FinancialStage.START_SAVING);
      expect(user.props.updatedAt).toEqual(newMockDate);
    });

    it('should handle all financial stage values', () => {
      // Test all financial stages
      const stages = [
        FinancialStage.DEBT,
        FinancialStage.START_SAVING,
        FinancialStage.START_INVESTING,
      ];

      stages.forEach((stage) => {
        const props: Omit<UserEntityProps, 'id'> = {
          name: 'John Doe',
          userId: 'auth-user-123',
          financialStage: null,
          onboardingCompletedAt: null,
          currency: Currency.VND,
          language: Language.VI,
          createdAt: mockDate,
          updatedAt: mockDate,
        };
        const user = UserEntity.create(props);

        user.setFinancialStage(stage);
        expect(user.financialStage).toBe(stage);
      });
    });
  });

  describe('completeOnboarding', () => {
    it('should set onboardingCompletedAt to current date and update timestamp', () => {
      const props: Omit<UserEntityProps, 'id'> = {
        name: 'John Doe',
        userId: 'auth-user-123',
        financialStage: FinancialStage.START_SAVING,
        onboardingCompletedAt: null,
        currency: Currency.VND,
        language: Language.VI,
        createdAt: mockDate,
        updatedAt: mockDate,
      };
      const user = UserEntity.create(props);

      const completionDate = new Date('2024-01-03T00:00:00Z');
      jest.setSystemTime(completionDate);

      user.completeOnboarding();

      expect(user.onboardingCompletedAt).toEqual(completionDate);
      expect(user.props.updatedAt).toEqual(completionDate);
      expect(user.isOnboardingCompleted()).toBe(true);
    });

    it('should overwrite existing onboarding completion date', () => {
      const existingDate = new Date('2024-01-01T00:00:00Z');
      const props: Omit<UserEntityProps, 'id'> = {
        name: 'John Doe',
        userId: 'auth-user-123',
        financialStage: FinancialStage.START_SAVING,
        onboardingCompletedAt: existingDate,
        currency: Currency.VND,
        language: Language.VI,
        createdAt: mockDate,
        updatedAt: mockDate,
      };
      const user = UserEntity.create(props);

      const newCompletionDate = new Date('2024-01-05T00:00:00Z');
      jest.setSystemTime(newCompletionDate);

      user.completeOnboarding();

      expect(user.onboardingCompletedAt).toEqual(newCompletionDate);
      expect(user.onboardingCompletedAt).not.toEqual(existingDate);
    });
  });

  describe('updateCurrency', () => {
    it('should update the currency and updatedAt timestamp', () => {
      const props: Omit<UserEntityProps, 'id'> = {
        name: 'John Doe',
        userId: 'auth-user-123',
        financialStage: null,
        onboardingCompletedAt: null,
        currency: Currency.VND,
        language: Language.VI,
        createdAt: mockDate,
        updatedAt: mockDate,
      };
      const user = UserEntity.create(props);

      const newMockDate = new Date('2024-01-02T00:00:00Z');
      jest.setSystemTime(newMockDate);

      user.updateCurrency(Currency.USD);

      expect(user.currency).toBe(Currency.USD);
      expect(user.props.updatedAt).toEqual(newMockDate);
    });

    it('should handle all currency values', () => {
      const currencies = [Currency.VND, Currency.USD, Currency.EUR];

      currencies.forEach((currency) => {
        const props: Omit<UserEntityProps, 'id'> = {
          name: 'John Doe',
          userId: 'auth-user-123',
          financialStage: null,
          onboardingCompletedAt: null,
          currency: Currency.VND,
          language: Language.VI,
          createdAt: mockDate,
          updatedAt: mockDate,
        };
        const user = UserEntity.create(props);

        user.updateCurrency(currency);
        expect(user.currency).toBe(currency);
      });
    });
  });

  describe('updateLanguage', () => {
    it('should update the language and updatedAt timestamp', () => {
      const props: Omit<UserEntityProps, 'id'> = {
        name: 'John Doe',
        userId: 'auth-user-123',
        financialStage: null,
        onboardingCompletedAt: null,
        currency: Currency.VND,
        language: Language.VI,
        createdAt: mockDate,
        updatedAt: mockDate,
      };
      const user = UserEntity.create(props);

      const newMockDate = new Date('2024-01-02T00:00:00Z');
      jest.setSystemTime(newMockDate);

      user.updateLanguage(Language.EN);

      expect(user.language).toBe(Language.EN);
      expect(user.props.updatedAt).toEqual(newMockDate);
    });

    it('should handle all language values', () => {
      const languages = [Language.VI, Language.EN];

      languages.forEach((language) => {
        const props: Omit<UserEntityProps, 'id'> = {
          name: 'John Doe',
          userId: 'auth-user-123',
          financialStage: null,
          onboardingCompletedAt: null,
          currency: Currency.VND,
          language: Language.VI,
          createdAt: mockDate,
          updatedAt: mockDate,
        };
        const user = UserEntity.create(props);

        user.updateLanguage(language);
        expect(user.language).toBe(language);
      });
    });
  });

  describe('isOnboardingCompleted', () => {
    it('should return true when onboardingCompletedAt is set', () => {
      const props: Omit<UserEntityProps, 'id'> = {
        name: 'John Doe',
        userId: 'auth-user-123',
        financialStage: FinancialStage.START_SAVING,
        onboardingCompletedAt: new Date(),
        currency: Currency.VND,
        language: Language.VI,
        createdAt: mockDate,
        updatedAt: mockDate,
      };
      const user = UserEntity.create(props);

      expect(user.isOnboardingCompleted()).toBe(true);
    });

    it('should return false when onboardingCompletedAt is null', () => {
      const props: Omit<UserEntityProps, 'id'> = {
        name: 'John Doe',
        userId: 'auth-user-123',
        financialStage: FinancialStage.START_SAVING,
        onboardingCompletedAt: null,
        currency: Currency.VND,
        language: Language.VI,
        createdAt: mockDate,
        updatedAt: mockDate,
      };
      const user = UserEntity.create(props);

      expect(user.isOnboardingCompleted()).toBe(false);
    });

    it('should return false when onboardingCompletedAt is undefined', () => {
      const props: Omit<UserEntityProps, 'id'> = {
        name: 'John Doe',
        userId: 'auth-user-123',
        financialStage: FinancialStage.START_SAVING,
        onboardingCompletedAt: undefined as any,
        currency: Currency.VND,
        language: Language.VI,
        createdAt: mockDate,
        updatedAt: mockDate,
      };
      const user = UserEntity.create(props);

      expect(user.isOnboardingCompleted()).toBe(false);
    });
  });

  describe('getter methods', () => {
    let user: UserEntity;

    beforeEach(() => {
      const props: Omit<UserEntityProps, 'id'> = {
        name: 'Test User',
        userId: 'auth-user-456',
        financialStage: FinancialStage.DEBT,
        onboardingCompletedAt: new Date('2024-01-15T00:00:00Z'),
        currency: Currency.EUR,
        language: Language.EN,
        createdAt: mockDate,
        updatedAt: mockDate,
      };
      user = UserEntity.create(props);
    });

    it('should return correct name', () => {
      expect(user.name).toBe('Test User');
    });

    it('should return correct userId', () => {
      expect(user.userId).toBe('auth-user-456');
    });

    it('should return correct financialStage', () => {
      expect(user.financialStage).toBe(FinancialStage.DEBT);
    });

    it('should return correct onboardingCompletedAt', () => {
      expect(user.onboardingCompletedAt).toEqual(
        new Date('2024-01-15T00:00:00Z'),
      );
    });

    it('should return correct currency', () => {
      expect(user.currency).toBe(Currency.EUR);
    });

    it('should return correct language', () => {
      expect(user.language).toBe(Language.EN);
    });
  });

  describe('inheritance from BaseEntity', () => {
    it('should have an id property', () => {
      const props: Omit<UserEntityProps, 'id'> = {
        name: 'John Doe',
        userId: 'auth-user-123',
        financialStage: null,
        onboardingCompletedAt: null,
        currency: Currency.VND,
        language: Language.VI,
        createdAt: mockDate,
        updatedAt: mockDate,
      };
      const user = UserEntity.create(props);

      expect(user.id).toBeDefined();
      expect(typeof user.id).toBe('string');
      expect(user.id.length).toBeGreaterThan(0);
    });

    it('should have props property with readonly access', () => {
      const props: Omit<UserEntityProps, 'id'> = {
        name: 'John Doe',
        userId: 'auth-user-123',
        financialStage: FinancialStage.START_SAVING,
        onboardingCompletedAt: null,
        currency: Currency.VND,
        language: Language.VI,
        createdAt: mockDate,
        updatedAt: mockDate,
      };
      const user = UserEntity.create(props);

      expect(user.props).toBeDefined();
      expect(user.props.name).toBe('John Doe');
      expect(user.props.userId).toBe('auth-user-123');
      expect(user.props.createdAt).toEqual(mockDate);
      expect(user.props.updatedAt).toEqual(mockDate);
    });

    it('should support equals method', () => {
      const props: Omit<UserEntityProps, 'id'> = {
        name: 'John Doe',
        userId: 'auth-user-123',
        financialStage: null,
        onboardingCompletedAt: null,
        currency: Currency.VND,
        language: Language.VI,
        createdAt: mockDate,
        updatedAt: mockDate,
      };

      const user1 = UserEntity.create(props, 'test-id');
      const user2 = UserEntity.create(props, 'test-id');
      const user3 = UserEntity.create(props, 'different-id');

      expect(user1.equals(user2)).toBe(true);
      expect(user1.equals(user3)).toBe(false);
      expect(user1.equals(null as any)).toBe(false);
      expect(user1.equals(undefined)).toBe(false);
    });

    it('should support toObject method', () => {
      const props: Omit<UserEntityProps, 'id'> = {
        name: 'John Doe',
        userId: 'auth-user-123',
        financialStage: FinancialStage.START_INVESTING,
        onboardingCompletedAt: new Date('2024-01-15T00:00:00Z'),
        currency: Currency.USD,
        language: Language.EN,
        createdAt: mockDate,
        updatedAt: mockDate,
      };
      const user = UserEntity.create(props);

      const object = user.toObject();

      expect(object).toHaveProperty('id');
      expect(object).toHaveProperty('name', 'John Doe');
      expect(object).toHaveProperty('userId', 'auth-user-123');
      expect(object).toHaveProperty(
        'financialStage',
        FinancialStage.START_INVESTING,
      );
      expect(object).toHaveProperty('onboardingCompletedAt');
      expect(object).toHaveProperty('currency', Currency.USD);
      expect(object).toHaveProperty('language', Language.EN);
      expect(object).toHaveProperty('createdAt');
      expect(object).toHaveProperty('updatedAt');
    });
  });

  describe('edge cases and error scenarios', () => {
    it('should handle empty string name gracefully in entity creation', () => {
      // Note: This tests the entity itself, validation should be handled at DTO level
      const props: Omit<UserEntityProps, 'id'> = {
        name: '',
        userId: 'auth-user-123',
        financialStage: null,
        onboardingCompletedAt: null,
        currency: Currency.VND,
        language: Language.VI,
        createdAt: mockDate,
        updatedAt: mockDate,
      };

      const user = UserEntity.create(props);
      expect(user.name).toBe('');
    });

    it('should handle multiple property updates correctly', () => {
      const props: Omit<UserEntityProps, 'id'> = {
        name: 'Original Name',
        userId: 'auth-user-123',
        financialStage: null,
        onboardingCompletedAt: null,
        currency: Currency.VND,
        language: Language.VI,
        createdAt: mockDate,
        updatedAt: mockDate,
      };
      const user = UserEntity.create(props);

      // Update multiple properties
      user.updateName('New Name');
      user.setFinancialStage(FinancialStage.START_INVESTING);
      user.updateCurrency(Currency.USD);
      user.updateLanguage(Language.EN);
      user.completeOnboarding();

      expect(user.name).toBe('New Name');
      expect(user.financialStage).toBe(FinancialStage.START_INVESTING);
      expect(user.currency).toBe(Currency.USD);
      expect(user.language).toBe(Language.EN);
      expect(user.isOnboardingCompleted()).toBe(true);
    });

    it('should maintain userId immutability', () => {
      const props: Omit<UserEntityProps, 'id'> = {
        name: 'John Doe',
        userId: 'original-user-id',
        financialStage: null,
        onboardingCompletedAt: null,
        currency: Currency.VND,
        language: Language.VI,
        createdAt: mockDate,
        updatedAt: mockDate,
      };
      const user = UserEntity.create(props);

      // Try various updates - userId should remain unchanged
      user.updateName('New Name');
      user.setFinancialStage(FinancialStage.DEBT);
      user.completeOnboarding();

      expect(user.userId).toBe('original-user-id');
    });
  });
});
