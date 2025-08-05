import { Test, TestingModule } from '@nestjs/testing';
import { Currency, Language } from '@/common/types/user';
import { UserORM } from '@/common/types/orms';
import { PrismaClient } from '@/common/prisma';
import { UserPrismaRepository } from '@/common/prisma/repositories/user-prisma.repository';
import {
  UserEntity,
  FinancialStage,
} from '../../../domain/entities/user.entity';

describe('UserPrismaRepository', () => {
  let repository: UserPrismaRepository;
  let prismaClient: any;

  const mockDate = new Date('2024-01-01T00:00:00Z');
  const updateDate = new Date('2024-01-02T00:00:00Z');

  beforeEach(async () => {
    const mockPrismaClient = {
      public_users: {
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        createMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserPrismaRepository,
        {
          provide: PrismaClient,
          useValue: mockPrismaClient,
        },
      ],
    }).compile();

    repository = module.get<UserPrismaRepository>(UserPrismaRepository);
    prismaClient = module.get(PrismaClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('toORM', () => {
    it('should convert UserEntity to UserORM with all fields', () => {
      const userEntity = UserEntity.create({
        name: 'John Doe',
        userId: 'auth-user-123',
        financialStage: FinancialStage.START_INVESTING,
        onboardingCompletedAt: new Date('2024-01-15T00:00:00Z'),
        currency: Currency.USD,
        language: Language.EN,
        createdAt: mockDate,
        updatedAt: updateDate,
      });

      const result = repository.toORM(userEntity);

      expect(result).toEqual({
        id: userEntity.id,
        name: 'John Doe',
        user_id: 'auth-user-123',
        financial_stage: FinancialStage.START_INVESTING,
        onboarding_completed_at: new Date('2024-01-15T00:00:00Z'),
        currency: Currency.USD,
        language: Language.EN,
        created_at: mockDate,
        updated_at: updateDate,
        deleted_at: null,
      });
    });

    it('should convert UserEntity to UserORM with null onboardingCompletedAt', () => {
      const userEntity = UserEntity.create({
        name: 'Jane Smith',
        userId: 'auth-user-456',
        financialStage: FinancialStage.DEBT,
        onboardingCompletedAt: null,
        currency: Currency.VND,
        language: Language.VI,
        createdAt: mockDate,
        updatedAt: mockDate,
      });

      const result = repository.toORM(userEntity);

      expect(result).toEqual({
        id: userEntity.id,
        name: 'Jane Smith',
        user_id: 'auth-user-456',
        financial_stage: FinancialStage.DEBT,
        onboarding_completed_at: null,
        currency: Currency.VND,
        language: Language.VI,
        created_at: mockDate,
        updated_at: mockDate,
        deleted_at: null,
      });
    });

    it('should convert UserEntity to UserORM with null financial stage', () => {
      const userEntity = UserEntity.create({
        name: 'No Stage User',
        userId: 'auth-user-null-stage',
        financialStage: null,
        onboardingCompletedAt: null,
        currency: Currency.EUR,
        language: Language.EN,
        createdAt: mockDate,
        updatedAt: mockDate,
      });

      const result = repository.toORM(userEntity);

      expect(result).toEqual({
        id: userEntity.id,
        name: 'No Stage User',
        user_id: 'auth-user-null-stage',
        financial_stage: null,
        onboarding_completed_at: null,
        currency: Currency.EUR,
        language: Language.EN,
        created_at: mockDate,
        updated_at: mockDate,
        deleted_at: null,
      });
    });

    it('should handle different currencies correctly', () => {
      const testCases = [Currency.VND, Currency.USD, Currency.EUR];

      testCases.forEach((currency) => {
        const userEntity = UserEntity.create({
          name: `User ${currency}`,
          userId: `auth-user-${currency}`,
          financialStage: FinancialStage.START_SAVING,
          onboardingCompletedAt: null,
          currency,
          language: Language.VI,
          createdAt: mockDate,
          updatedAt: mockDate,
        });

        const result = repository.toORM(userEntity);

        expect(result).toMatchObject({
          currency,
        });
      });
    });

    it('should handle different languages correctly', () => {
      const testCases = [Language.VI, Language.EN];

      testCases.forEach((language) => {
        const userEntity = UserEntity.create({
          name: `User ${language}`,
          userId: `auth-user-${language}`,
          financialStage: FinancialStage.START_SAVING,
          onboardingCompletedAt: null,
          currency: Currency.VND,
          language,
          createdAt: mockDate,
          updatedAt: mockDate,
        });

        const result = repository.toORM(userEntity);

        expect(result).toMatchObject({
          language,
        });
      });
    });

    it('should handle different financial stages correctly', () => {
      const testCases = [
        FinancialStage.DEBT,
        FinancialStage.START_SAVING,
        FinancialStage.START_INVESTING,
        null,
      ];

      testCases.forEach((financialStage) => {
        const userEntity = UserEntity.create({
          name: `User ${financialStage || 'null'}`,
          userId: `auth-user-${financialStage || 'null'}`,
          financialStage,
          onboardingCompletedAt: null,
          currency: Currency.VND,
          language: Language.VI,
          createdAt: mockDate,
          updatedAt: mockDate,
        });

        const result = repository.toORM(userEntity);

        expect(result).toMatchObject({
          financial_stage: financialStage,
        });
      });
    });

    it('should preserve date objects for timestamps', () => {
      const specificDate = new Date('2023-12-25T10:30:45Z');
      const userEntity = UserEntity.create({
        name: 'Date Test User',
        userId: 'auth-user-date-test',
        financialStage: FinancialStage.START_SAVING,
        onboardingCompletedAt: specificDate,
        currency: Currency.USD,
        language: Language.EN,
        createdAt: mockDate,
        updatedAt: updateDate,
      });

      const result = repository.toORM(userEntity);

      expect(result).toMatchObject({
        onboarding_completed_at: specificDate,
        created_at: mockDate,
        updated_at: updateDate,
      });
      expect(result.onboarding_completed_at).toBeInstanceOf(Date);
      expect(result.created_at).toBeInstanceOf(Date);
      expect(result.updated_at).toBeInstanceOf(Date);
    });
  });

  describe('toEntity', () => {
    it('should convert UserORM to UserEntity with all fields', () => {
      const userORM: UserORM = {
        id: 'test-id-123',
        name: 'John Doe',
        user_id: 'auth-user-123',
        financial_stage: FinancialStage.START_INVESTING,
        onboarding_completed_at: new Date('2024-01-15T00:00:00Z'),
        currency: Currency.USD,
        language: Language.EN,
        created_at: mockDate,
        updated_at: updateDate,
        deleted_at: null,
      };

      const result = repository.toEntity(userORM);

      expect(result).toBeInstanceOf(UserEntity);
      expect(result.id).toBe('test-id-123');
      expect(result.name).toBe('John Doe');
      expect(result.userId).toBe('auth-user-123');
      expect(result.financialStage).toBe(FinancialStage.START_INVESTING);
      expect(result.onboardingCompletedAt).toEqual(
        new Date('2024-01-15T00:00:00Z'),
      );
      expect(result.currency).toBe(Currency.USD);
      expect(result.language).toBe(Language.EN);
      expect(result.props.createdAt).toEqual(mockDate);
      expect(result.props.updatedAt).toEqual(updateDate);
    });

    it('should convert UserORM to UserEntity with null onboardingCompletedAt', () => {
      const userORM: UserORM = {
        id: 'test-id-456',
        name: 'Jane Smith',
        user_id: 'auth-user-456',
        financial_stage: FinancialStage.DEBT,
        onboarding_completed_at: null,
        currency: Currency.VND,
        language: Language.VI,
        created_at: mockDate,
        updated_at: mockDate,
        deleted_at: null,
      };

      const result = repository.toEntity(userORM);

      expect(result.id).toBe('test-id-456');
      expect(result.name).toBe('Jane Smith');
      expect(result.userId).toBe('auth-user-456');
      expect(result.financialStage).toBe(FinancialStage.DEBT);
      expect(result.onboardingCompletedAt).toBeNull();
      expect(result.currency).toBe(Currency.VND);
      expect(result.language).toBe(Language.VI);
    });

    it('should convert UserORM to UserEntity with null financial stage', () => {
      const userORM: UserORM = {
        id: 'test-id-null-stage',
        name: 'No Stage User',
        user_id: 'auth-user-null-stage',
        financial_stage: null,
        onboarding_completed_at: null,
        currency: Currency.EUR,
        language: Language.EN,
        created_at: mockDate,
        updated_at: mockDate,
        deleted_at: null,
      };

      const result = repository.toEntity(userORM);

      expect(result.financialStage).toBeNull();
      expect(result.name).toBe('No Stage User');
      expect(result.currency).toBe(Currency.EUR);
      expect(result.language).toBe(Language.EN);
    });

    it('should handle different currencies correctly', () => {
      const testCases = [Currency.VND, Currency.USD, Currency.EUR];

      testCases.forEach((currency) => {
        const userORM: UserORM = {
          id: `test-id-${currency}`,
          name: `User ${currency}`,
          user_id: `auth-user-${currency}`,
          financial_stage: FinancialStage.START_SAVING,
          onboarding_completed_at: null,
          currency,
          language: Language.VI,
          created_at: mockDate,
          updated_at: mockDate,
          deleted_at: null,
        };

        const result = repository.toEntity(userORM);

        expect(result.currency).toBe(currency);
      });
    });

    it('should handle different languages correctly', () => {
      const testCases = [Language.VI, Language.EN];

      testCases.forEach((language) => {
        const userORM: UserORM = {
          id: `test-id-${language}`,
          name: `User ${language}`,
          user_id: `auth-user-${language}`,
          financial_stage: FinancialStage.START_SAVING,
          onboarding_completed_at: null,
          currency: Currency.VND,
          language,
          created_at: mockDate,
          updated_at: mockDate,
          deleted_at: null,
        };

        const result = repository.toEntity(userORM);

        expect(result.language).toBe(language);
      });
    });

    it('should handle different financial stages correctly', () => {
      const testCases = [
        FinancialStage.DEBT,
        FinancialStage.START_SAVING,
        FinancialStage.START_INVESTING,
        null,
      ];

      testCases.forEach((financialStage) => {
        const userORM: UserORM = {
          id: `test-id-${financialStage || 'null'}`,
          name: `User ${financialStage || 'null'}`,
          user_id: `auth-user-${financialStage || 'null'}`,
          financial_stage: financialStage,
          onboarding_completed_at: null,
          currency: Currency.VND,
          language: Language.VI,
          created_at: mockDate,
          updated_at: mockDate,
          deleted_at: null,
        };

        const result = repository.toEntity(userORM);

        expect(result.financialStage).toBe(financialStage);
      });
    });

    it('should convert string dates to Date objects', () => {
      const userORM: UserORM = {
        id: 'test-id-date-conversion',
        name: 'Date Conversion User',
        user_id: 'auth-user-date-conversion',
        financial_stage: FinancialStage.START_SAVING,
        onboarding_completed_at: '2024-01-15T00:00:00Z' as any, // Simulating string from DB
        currency: Currency.USD,
        language: Language.EN,
        created_at: '2024-01-01T00:00:00Z' as any, // Simulating string from DB
        updated_at: '2024-01-02T00:00:00Z' as any, // Simulating string from DB
        deleted_at: null,
      };

      const result = repository.toEntity(userORM);

      expect(result.onboardingCompletedAt).toBeInstanceOf(Date);
      expect(result.props.createdAt).toBeInstanceOf(Date);
      expect(result.props.updatedAt).toBeInstanceOf(Date);
      expect(result.onboardingCompletedAt).toEqual(
        new Date('2024-01-15T00:00:00Z'),
      );
      expect(result.props.createdAt).toEqual(new Date('2024-01-01T00:00:00Z'));
      expect(result.props.updatedAt).toEqual(new Date('2024-01-02T00:00:00Z'));
    });

    it('should preserve entity methods after conversion', () => {
      const userORM: UserORM = {
        id: 'test-id-methods',
        name: 'Methods User',
        user_id: 'auth-user-methods',
        financial_stage: FinancialStage.START_INVESTING,
        onboarding_completed_at: new Date(),
        currency: Currency.EUR,
        language: Language.EN,
        created_at: mockDate,
        updated_at: updateDate,
        deleted_at: null,
      };

      const result = repository.toEntity(userORM);

      expect(typeof result.updateName).toBe('function');
      expect(typeof result.setFinancialStage).toBe('function');
      expect(typeof result.completeOnboarding).toBe('function');
      expect(typeof result.updateCurrency).toBe('function');
      expect(typeof result.updateLanguage).toBe('function');
      expect(typeof result.isOnboardingCompleted).toBe('function');
      expect(typeof result.equals).toBe('function');
      expect(typeof result.toObject).toBe('function');
    });
  });

  describe('Bi-directional Conversion', () => {
    it('should maintain data integrity through toORM -> toEntity conversion', () => {
      const originalEntity = UserEntity.create({
        name: 'Bidirectional Test',
        userId: 'auth-user-bidirectional',
        financialStage: FinancialStage.START_INVESTING,
        onboardingCompletedAt: new Date('2024-01-20T00:00:00Z'),
        currency: Currency.EUR,
        language: Language.EN,
        createdAt: mockDate,
        updatedAt: updateDate,
      });

      const orm = repository.toORM(originalEntity);
      const convertedEntity = repository.toEntity(orm);

      expect(convertedEntity.id).toBe(originalEntity.id);
      expect(convertedEntity.name).toBe(originalEntity.name);
      expect(convertedEntity.userId).toBe(originalEntity.userId);
      expect(convertedEntity.financialStage).toBe(
        originalEntity.financialStage,
      );
      expect(convertedEntity.onboardingCompletedAt).toEqual(
        originalEntity.onboardingCompletedAt,
      );
      expect(convertedEntity.currency).toBe(originalEntity.currency);
      expect(convertedEntity.language).toBe(originalEntity.language);
      expect(convertedEntity.props.createdAt).toEqual(
        originalEntity.props.createdAt,
      );
      expect(convertedEntity.props.updatedAt).toEqual(
        originalEntity.props.updatedAt,
      );
    });

    it('should maintain data integrity through toEntity -> toORM conversion', () => {
      const originalORM: UserORM = {
        id: 'test-id-reverse',
        name: 'Reverse Test',
        user_id: 'auth-user-reverse',
        financial_stage: FinancialStage.DEBT,
        onboarding_completed_at: new Date('2024-01-25T00:00:00Z'),
        currency: Currency.VND,
        language: Language.VI,
        created_at: mockDate,
        updated_at: updateDate,
        deleted_at: null,
      };

      const entity = repository.toEntity(originalORM);
      const convertedORM = repository.toORM(entity);

      expect(convertedORM).toEqual(originalORM);
    });

    it('should handle null values correctly in bidirectional conversion', () => {
      const originalEntity = UserEntity.create({
        name: 'Null Values Test',
        userId: 'auth-user-null-values',
        financialStage: null,
        onboardingCompletedAt: null,
        currency: Currency.USD,
        language: Language.EN,
        createdAt: mockDate,
        updatedAt: updateDate,
        deletedAt: null,
      });

      const orm = repository.toORM(originalEntity);
      const convertedEntity = repository.toEntity(orm);

      expect(convertedEntity.financialStage).toBeNull();
      expect(convertedEntity.onboardingCompletedAt).toBeNull();
      expect(convertedEntity.name).toBe(originalEntity.name);
      expect(convertedEntity.currency).toBe(originalEntity.currency);
      expect(convertedEntity.language).toBe(originalEntity.language);
    });
  });

  describe('Repository Method Integration', () => {
    it('should call Prisma create method with correct data when creating entity', async () => {
      const userEntity = UserEntity.create({
        name: 'Create Test',
        userId: 'auth-user-create',
        financialStage: FinancialStage.START_SAVING,
        onboardingCompletedAt: null,
        currency: Currency.VND,
        language: Language.VI,
        createdAt: mockDate,
        updatedAt: mockDate,
      });

      const expectedORM = repository.toORM(userEntity);
      prismaClient.public_users.create.mockResolvedValue(expectedORM as any);

      const result = await repository.create(userEntity);

      expect(prismaClient.public_users.create).toHaveBeenCalledWith({
        data: expectedORM,
      });
      expect(result).toBe(userEntity);
    });

    it('should call Prisma update method with correct data when updating entity', async () => {
      const userEntity = UserEntity.create({
        name: 'Update Test',
        userId: 'auth-user-update',
        financialStage: FinancialStage.START_INVESTING,
        onboardingCompletedAt: new Date(),
        currency: Currency.EUR,
        language: Language.EN,
        createdAt: mockDate,
        updatedAt: updateDate,
      });

      const expectedORM = repository.toORM(userEntity);
      prismaClient.public_users.update.mockResolvedValue(expectedORM as any);

      const result = await repository.update(userEntity);

      expect(prismaClient.public_users.update).toHaveBeenCalledWith({
        where: { id: userEntity.id },
        data: expectedORM,
      });
      expect(result).toBe(userEntity);
    });

    it('should call Prisma findFirst method and convert result when finding one entity', async () => {
      const mockORM: UserORM = {
        id: 'test-find-one-id',
        name: 'Find One Test',
        user_id: 'auth-user-find-one',
        financial_stage: FinancialStage.START_SAVING,
        onboarding_completed_at: null,
        currency: Currency.USD,
        language: Language.EN,
        created_at: mockDate,
        updated_at: mockDate,
        deleted_at: null,
      };

      prismaClient.public_users.findFirst.mockResolvedValue(mockORM as any);

      const result = await repository.findOne({ userId: 'auth-user-find-one' });

      expect(prismaClient.public_users.findFirst).toHaveBeenCalledWith({
        where: { user_id: 'auth-user-find-one' },
      });
      expect(result).toBeInstanceOf(UserEntity);
      expect(result?.id).toBe('test-find-one-id');
      expect(result?.name).toBe('Find One Test');
    });

    it('should return null when Prisma findFirst returns null', async () => {
      prismaClient.public_users.findFirst.mockResolvedValue(null);

      const result = await repository.findOne({ userId: 'non-existent' });

      expect(result).toBeNull();
    });

    it('should call Prisma findUnique method and convert result when finding by ID', async () => {
      const mockORM: UserORM = {
        id: 'test-find-by-id',
        name: 'Find By ID Test',
        user_id: 'auth-user-find-by-id',
        financial_stage: FinancialStage.DEBT,
        onboarding_completed_at: null,
        currency: Currency.VND,
        language: Language.VI,
        created_at: mockDate,
        updated_at: mockDate,
        deleted_at: null,
      };

      prismaClient.public_users.findUnique.mockResolvedValue(mockORM as any);

      const result = await repository.findById('test-find-by-id');

      expect(prismaClient.public_users.findUnique).toHaveBeenCalledWith({
        where: { id: 'test-find-by-id' },
      });
      expect(result).toBeInstanceOf(UserEntity);
      expect(result?.id).toBe('test-find-by-id');
    });

    it('should call Prisma findMany method and convert results when finding multiple entities', async () => {
      const mockORMs: UserORM[] = [
        {
          id: 'test-find-many-1',
          name: 'Find Many Test 1',
          user_id: 'auth-user-find-many-1',
          financial_stage: FinancialStage.START_SAVING,
          onboarding_completed_at: null,
          currency: Currency.USD,
          language: Language.EN,
          created_at: mockDate,
          updated_at: mockDate,
          deleted_at: null,
        },
        {
          id: 'test-find-many-2',
          name: 'Find Many Test 2',
          user_id: 'auth-user-find-many-2',
          financial_stage: FinancialStage.START_INVESTING,
          onboarding_completed_at: new Date(),
          currency: Currency.EUR,
          language: Language.EN,
          created_at: mockDate,
          updated_at: updateDate,
          deleted_at: null,
        },
      ];

      prismaClient.public_users.findMany.mockResolvedValue(mockORMs as any);

      const result = await repository.findMany({ currency: Currency.USD });

      expect(prismaClient.public_users.findMany).toHaveBeenCalledWith({
        where: { currency: Currency.USD },
        skip: 0,
        take: undefined,
        orderBy: undefined,
      });
      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(UserEntity);
      expect(result[1]).toBeInstanceOf(UserEntity);
      expect(result[0].id).toBe('test-find-many-1');
      expect(result[1].id).toBe('test-find-many-2');
    });

    it('should call Prisma delete method when deleting entity', async () => {
      const userEntity = UserEntity.create({
        name: 'Delete Test',
        userId: 'auth-user-delete',
        financialStage: FinancialStage.START_SAVING,
        onboardingCompletedAt: null,
        currency: Currency.VND,
        language: Language.VI,
        createdAt: mockDate,
        updatedAt: mockDate,
      });

      prismaClient.public_users.delete.mockResolvedValue({} as any);

      await repository.delete(userEntity);

      expect(prismaClient.public_users.delete).toHaveBeenCalledWith({
        where: { id: userEntity.id },
      });
    });
  });

  describe('Error Handling', () => {
    it('should propagate Prisma errors from create method', async () => {
      const userEntity = UserEntity.create({
        name: 'Error Test',
        userId: 'auth-user-error',
        financialStage: FinancialStage.START_SAVING,
        onboardingCompletedAt: null,
        currency: Currency.VND,
        language: Language.VI,
        createdAt: mockDate,
        updatedAt: mockDate,
      });

      const prismaError = new Error('Prisma create failed');
      prismaClient.public_users.create.mockRejectedValue(prismaError);

      await expect(repository.create(userEntity)).rejects.toThrow(
        'Prisma create failed',
      );
    });

    it('should propagate Prisma errors from update method', async () => {
      const userEntity = UserEntity.create({
        name: 'Update Error Test',
        userId: 'auth-user-update-error',
        financialStage: FinancialStage.START_SAVING,
        onboardingCompletedAt: null,
        currency: Currency.VND,
        language: Language.VI,
        createdAt: mockDate,
        updatedAt: mockDate,
      });

      const prismaError = new Error('Prisma update failed');
      prismaClient.public_users.update.mockRejectedValue(prismaError);

      await expect(repository.update(userEntity)).rejects.toThrow(
        'Prisma update failed',
      );
    });

    it('should propagate Prisma errors from findOne method', async () => {
      const prismaError = new Error('Prisma findFirst failed');
      prismaClient.public_users.findFirst.mockRejectedValue(prismaError);

      await expect(
        repository.findOne({ userId: 'error-user' }),
      ).rejects.toThrow('Prisma findFirst failed');
    });

    it('should handle malformed ORM data gracefully', () => {
      const malformedORM = {
        id: 'malformed-id',
        name: 'Malformed User',
        user_id: 'auth-user-malformed',
        // Missing required fields
        financial_stage: undefined,
        currency: undefined,
        language: undefined,
      } as any;

      // This might throw or handle gracefully depending on implementation
      expect(() => repository.toEntity(malformedORM)).not.toThrow();
    });
  });
});
