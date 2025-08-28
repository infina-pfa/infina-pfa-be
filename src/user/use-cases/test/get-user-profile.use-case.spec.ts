import { Test, TestingModule } from '@nestjs/testing';
import { Currency, FinancialStage, Language } from '@/common/types/user';
import { UserEntity } from '../../domain/entities/user.entity';
import { UserErrorFactory } from '../../domain/errors';
import { UserRepository } from '../../domain/repositories/user.repository';
import { GetUserProfileUseCase } from '../get-user-profile.use-case';

describe('GetUserProfileUseCase', () => {
  let useCase: GetUserProfileUseCase;
  let userRepository: jest.Mocked<UserRepository>;

  const mockDate = new Date('2024-01-01T00:00:00Z');

  beforeEach(async () => {
    const mockUserRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetUserProfileUseCase,
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    useCase = module.get<GetUserProfileUseCase>(GetUserProfileUseCase);
    userRepository = module.get(UserRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    describe('Happy Path', () => {
      it('should return user profile when user exists', async () => {
        const userId = 'auth-user-123';
        const expectedUser = UserEntity.create({
          name: 'John Doe',
          userId: 'auth-user-123',
          financialStage: FinancialStage.START_INVESTING,

          currency: Currency.USD,
          language: Language.EN,
          createdAt: mockDate,
          updatedAt: mockDate,
        });

        userRepository.findOne.mockResolvedValue(expectedUser);

        const result = await useCase.execute(userId);

        expect(userRepository.findOne).toHaveBeenCalledWith({
          userId: 'auth-user-123',
        });
        expect(result).toBe(expectedUser);
        expect(result.name).toBe('John Doe');
        expect(result.userId).toBe('auth-user-123');
        expect(result.financialStage).toBe(FinancialStage.START_INVESTING);
        expect(result.currency).toBe(Currency.USD);
        expect(result.language).toBe(Language.EN);
      });

      it('should return user profile with default values', async () => {
        const userId = 'auth-user-456';
        const expectedUser = UserEntity.create({
          name: 'Jane Smith',
          userId: 'auth-user-456',
          financialStage: null,

          currency: Currency.VND,
          language: Language.VI,
          createdAt: mockDate,
          updatedAt: mockDate,
        });

        userRepository.findOne.mockResolvedValue(expectedUser);

        const result = await useCase.execute(userId);

        expect(userRepository.findOne).toHaveBeenCalledWith({
          userId: 'auth-user-456',
        });
        expect(result).toBe(expectedUser);
        expect(result.name).toBe('Jane Smith');
        expect(result.financialStage).toBeNull();

        expect(result.currency).toBe(Currency.VND);
        expect(result.language).toBe(Language.VI);
      });

      it('should return user profile with completed onboarding', async () => {
        const userId = 'auth-user-onboarded';

        const expectedUser = UserEntity.create({
          name: 'Onboarded User',
          userId: 'auth-user-onboarded',
          financialStage: FinancialStage.START_SAVING,

          currency: Currency.EUR,
          language: Language.EN,
          createdAt: mockDate,
          updatedAt: mockDate,
        });

        userRepository.findOne.mockResolvedValue(expectedUser);

        const result = await useCase.execute(userId);

        expect(result).toBe(expectedUser);
        expect(result.name).toBe('Onboarded User');
        expect(result.financialStage).toBe(FinancialStage.START_SAVING);
        expect(result.currency).toBe(Currency.EUR);
        expect(result.language).toBe(Language.EN);
      });

      it('should handle different financial stages correctly', async () => {
        const testCases = [
          FinancialStage.DEBT,
          FinancialStage.START_SAVING,
          FinancialStage.START_INVESTING,
          null,
        ];

        for (const stage of testCases) {
          const userId = `auth-user-${stage || 'null'}`;
          const expectedUser = UserEntity.create({
            name: `User ${stage || 'null'}`,
            userId,
            financialStage: stage,

            currency: Currency.VND,
            language: Language.VI,
            createdAt: mockDate,
            updatedAt: mockDate,
          });

          userRepository.findOne.mockResolvedValue(expectedUser);

          const result = await useCase.execute(userId);

          expect(userRepository.findOne).toHaveBeenCalledWith({ userId });
          expect(result.financialStage).toBe(stage);

          jest.clearAllMocks();
        }
      });

      it('should handle different currencies correctly', async () => {
        const testCases = [Currency.VND, Currency.USD, Currency.EUR];

        for (const currency of testCases) {
          const userId = `auth-user-${currency}`;
          const expectedUser = UserEntity.create({
            name: `User ${currency}`,
            userId,
            financialStage: null,

            currency,
            language: Language.VI,
            createdAt: mockDate,
            updatedAt: mockDate,
          });

          userRepository.findOne.mockResolvedValue(expectedUser);

          const result = await useCase.execute(userId);

          expect(result.currency).toBe(currency);

          jest.clearAllMocks();
        }
      });

      it('should handle different languages correctly', async () => {
        const testCases = [Language.VI, Language.EN];

        for (const language of testCases) {
          const userId = `auth-user-${language}`;
          const expectedUser = UserEntity.create({
            name: `User ${language}`,
            userId,
            financialStage: null,

            currency: Currency.VND,
            language,
            createdAt: mockDate,
            updatedAt: mockDate,
          });

          userRepository.findOne.mockResolvedValue(expectedUser);

          const result = await useCase.execute(userId);

          expect(result.language).toBe(language);

          jest.clearAllMocks();
        }
      });
    });

    describe('Error Cases', () => {
      it('should throw UserErrorFactory.userProfileNotFound when user does not exist', async () => {
        const userId = 'non-existent-user';

        userRepository.findOne.mockResolvedValue(null);

        await expect(useCase.execute(userId)).rejects.toThrow(
          UserErrorFactory.userProfileNotFound(),
        );

        expect(userRepository.findOne).toHaveBeenCalledWith({
          userId: 'non-existent-user',
        });
      });

      it('should throw specific error type for not found user', async () => {
        const userId = 'missing-user';

        userRepository.findOne.mockResolvedValue(null);

        try {
          await useCase.execute(userId);
          fail('Should have thrown an error');
        } catch (error) {
          expect(error).toEqual(UserErrorFactory.userProfileNotFound());
          expect(error.getStatus()).toBe(404);
          expect(error.getResponse()).toEqual({
            code: 'USER_PROFILE_NOT_FOUND',
            message: 'User profile not found',
          });
        }
      });

      it('should propagate repository errors', async () => {
        const userId = 'auth-user-error';
        const repositoryError = new Error('Database connection failed');

        userRepository.findOne.mockRejectedValue(repositoryError);

        await expect(useCase.execute(userId)).rejects.toThrow(
          'Database connection failed',
        );
        expect(userRepository.findOne).toHaveBeenCalledWith({
          userId: 'auth-user-error',
        });
      });

      it('should handle repository timeout errors', async () => {
        const userId = 'auth-user-timeout';
        const timeoutError = new Error('Query timeout');

        userRepository.findOne.mockRejectedValue(timeoutError);

        await expect(useCase.execute(userId)).rejects.toThrow('Query timeout');
        expect(userRepository.findOne).toHaveBeenCalledTimes(1);
      });
    });

    describe('Repository Integration', () => {
      it('should call repository with correct parameters', async () => {
        const userId = 'auth-user-params';
        const expectedUser = UserEntity.create({
          name: 'Params User',
          userId: 'auth-user-params',
          financialStage: null,

          currency: Currency.VND,
          language: Language.VI,
          createdAt: mockDate,
          updatedAt: mockDate,
        });

        userRepository.findOne.mockResolvedValue(expectedUser);

        await useCase.execute(userId);

        expect(userRepository.findOne).toHaveBeenCalledWith({
          userId: 'auth-user-params',
        });
        expect(userRepository.findOne).toHaveBeenCalledTimes(1);
      });

      it('should only call findOne method and not other repository methods', async () => {
        const userId = 'auth-user-single-call';
        const expectedUser = UserEntity.create({
          name: 'Single Call User',
          userId: 'auth-user-single-call',
          financialStage: null,

          currency: Currency.VND,
          language: Language.VI,
          createdAt: mockDate,
          updatedAt: mockDate,
        });

        userRepository.findOne.mockResolvedValue(expectedUser);

        await useCase.execute(userId);

        expect(userRepository.findOne).toHaveBeenCalledTimes(1);
        expect(userRepository.create).not.toHaveBeenCalled();
        expect(userRepository.update).not.toHaveBeenCalled();
        expect(userRepository.delete).not.toHaveBeenCalled();
        expect(userRepository.findMany).not.toHaveBeenCalled();
      });

      it('should handle repository returning undefined', async () => {
        const userId = 'auth-user-undefined';

        userRepository.findOne.mockResolvedValue(undefined as any);

        await expect(useCase.execute(userId)).rejects.toThrow(
          UserErrorFactory.userProfileNotFound(),
        );
      });
    });

    describe('Input Validation and Edge Cases', () => {
      it('should handle empty userId', async () => {
        const userId = '';

        userRepository.findOne.mockResolvedValue(null);

        await expect(useCase.execute(userId)).rejects.toThrow(
          UserErrorFactory.userProfileNotFound(),
        );

        expect(userRepository.findOne).toHaveBeenCalledWith({ userId: '' });
      });

      it('should handle null userId gracefully', async () => {
        const userId = null as any;

        userRepository.findOne.mockResolvedValue(null);

        await expect(useCase.execute(userId)).rejects.toThrow(
          UserErrorFactory.userProfileNotFound(),
        );

        expect(userRepository.findOne).toHaveBeenCalledWith({ userId: null });
      });

      it('should handle undefined userId gracefully', async () => {
        const userId = undefined as any;

        userRepository.findOne.mockResolvedValue(null);

        await expect(useCase.execute(userId)).rejects.toThrow(
          UserErrorFactory.userProfileNotFound(),
        );

        expect(userRepository.findOne).toHaveBeenCalledWith({
          userId: undefined,
        });
      });

      it('should handle very long userId', async () => {
        const userId = 'a'.repeat(1000);
        const expectedUser = UserEntity.create({
          name: 'Long UserId User',
          userId,
          financialStage: null,

          currency: Currency.VND,
          language: Language.VI,
          createdAt: mockDate,
          updatedAt: mockDate,
        });

        userRepository.findOne.mockResolvedValue(expectedUser);

        const result = await useCase.execute(userId);

        expect(userRepository.findOne).toHaveBeenCalledWith({ userId });
        expect(result.userId).toBe(userId);
      });

      it('should handle special characters in userId', async () => {
        const userId = 'auth-user-特殊字符-123-@#$%';
        const expectedUser = UserEntity.create({
          name: 'Special Chars User',
          userId,
          financialStage: null,

          currency: Currency.VND,
          language: Language.VI,
          createdAt: mockDate,
          updatedAt: mockDate,
        });

        userRepository.findOne.mockResolvedValue(expectedUser);

        const result = await useCase.execute(userId);

        expect(userRepository.findOne).toHaveBeenCalledWith({ userId });
        expect(result.userId).toBe(userId);
      });
    });

    describe('Return Value Validation', () => {
      it('should return UserEntity instance with all expected properties', async () => {
        const userId = 'auth-user-complete';

        const expectedUser = UserEntity.create({
          name: 'Complete User',
          userId: 'auth-user-complete',
          financialStage: FinancialStage.START_INVESTING,

          currency: Currency.EUR,
          language: Language.EN,
          createdAt: mockDate,
          updatedAt: new Date('2024-01-02T00:00:00Z'),
        });

        userRepository.findOne.mockResolvedValue(expectedUser);

        const result = await useCase.execute(userId);

        expect(result).toBeInstanceOf(UserEntity);
        expect(result.id).toBeDefined();
        expect(typeof result.id).toBe('string');
        expect(result.name).toBe('Complete User');
        expect(result.userId).toBe('auth-user-complete');
        expect(result.financialStage).toBe(FinancialStage.START_INVESTING);

        expect(result.currency).toBe(Currency.EUR);
        expect(result.language).toBe(Language.EN);
        expect(result.props.createdAt).toEqual(mockDate);
        expect(result.props.updatedAt).toEqual(
          new Date('2024-01-02T00:00:00Z'),
        );
      });

      it('should return exact same instance as repository returns', async () => {
        const userId = 'auth-user-instance';
        const expectedUser = UserEntity.create({
          name: 'Instance User',
          userId: 'auth-user-instance',
          financialStage: null,

          currency: Currency.VND,
          language: Language.VI,
          createdAt: mockDate,
          updatedAt: mockDate,
        });

        userRepository.findOne.mockResolvedValue(expectedUser);

        const result = await useCase.execute(userId);

        expect(result).toBe(expectedUser);
        expect(result === expectedUser).toBe(true);
      });

      it('should preserve all entity methods in returned object', async () => {
        const userId = 'auth-user-methods';
        const expectedUser = UserEntity.create({
          name: 'Methods User',
          userId: 'auth-user-methods',
          financialStage: FinancialStage.DEBT,

          currency: Currency.USD,
          language: Language.EN,
          createdAt: mockDate,
          updatedAt: mockDate,
        });

        userRepository.findOne.mockResolvedValue(expectedUser);

        const result = await useCase.execute(userId);

        expect(typeof result.updateName).toBe('function');
        expect(typeof result.setFinancialStage).toBe('function');
        expect(typeof result.updateCurrency).toBe('function');
        expect(typeof result.updateLanguage).toBe('function');
        expect(typeof result.equals).toBe('function');
        expect(typeof result.toObject).toBe('function');
      });
    });

    describe('Performance and Efficiency', () => {
      it('should make only one repository call', async () => {
        const userId = 'auth-user-efficiency';
        const expectedUser = UserEntity.create({
          name: 'Efficiency User',
          userId: 'auth-user-efficiency',
          financialStage: null,

          currency: Currency.VND,
          language: Language.VI,
          createdAt: mockDate,
          updatedAt: mockDate,
        });

        userRepository.findOne.mockResolvedValue(expectedUser);

        await useCase.execute(userId);

        expect(userRepository.findOne).toHaveBeenCalledTimes(1);
      });

      it('should not perform unnecessary operations on found user', async () => {
        const userId = 'auth-user-no-ops';
        const originalUser = UserEntity.create({
          name: 'No Ops User',
          userId: 'auth-user-no-ops',
          financialStage: FinancialStage.START_SAVING,

          currency: Currency.VND,
          language: Language.VI,
          createdAt: mockDate,
          updatedAt: mockDate,
        });

        userRepository.findOne.mockResolvedValue(originalUser);

        const result = await useCase.execute(userId);

        // Verify no mutations occurred
        expect(result.props.updatedAt).toEqual(mockDate);
        expect(result.name).toBe('No Ops User');
        expect(result.financialStage).toBe(FinancialStage.START_SAVING);
      });
    });
  });
});
