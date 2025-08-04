import { Test, TestingModule } from '@nestjs/testing';
import { Currency, Language } from '@/common/types/user';
import { UpdateUserProfileDto } from '../../controllers/dto/update-user-profile.dto';
import { UserEntity, FinancialStage } from '../../domain/entities/user.entity';
import { UserErrorFactory } from '../../domain/errors';
import { UserRepository } from '../../domain/repositories/user.repository';
import {
  UpdateUserProfileUseCase,
  UpdateUserProfileInput,
} from '../update-user-profile.use-case';

describe('UpdateUserProfileUseCase', () => {
  let useCase: UpdateUserProfileUseCase;
  let userRepository: jest.Mocked<UserRepository>;

  const mockDate = new Date('2024-01-01T00:00:00Z');
  const updateDate = new Date('2024-01-02T00:00:00Z');

  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

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
        UpdateUserProfileUseCase,
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    useCase = module.get<UpdateUserProfileUseCase>(UpdateUserProfileUseCase);
    userRepository = module.get(UserRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    describe('Happy Path - Full Updates', () => {
      it('should update all fields when all are provided', async () => {
        const userId = 'auth-user-123';
        const updates: UpdateUserProfileDto = {
          name: 'Updated Name',
          financialStage: FinancialStage.START_INVESTING,
          currency: Currency.EUR,
          language: Language.EN,
        };
        const input: UpdateUserProfileInput = { userId, updates };

        const existingUser = UserEntity.create({
          name: 'Old Name',
          userId: 'auth-user-123',
          financialStage: FinancialStage.DEBT,
          onboardingCompletedAt: null,
          currency: Currency.VND,
          language: Language.VI,
          createdAt: mockDate,
          updatedAt: mockDate,
        });

        jest.setSystemTime(updateDate);
        const updatedUser = UserEntity.create({
          name: 'Updated Name',
          userId: 'auth-user-123',
          financialStage: FinancialStage.START_INVESTING,
          onboardingCompletedAt: null,
          currency: Currency.EUR,
          language: Language.EN,
          createdAt: mockDate,
          updatedAt: updateDate,
        });

        userRepository.findOne.mockResolvedValue(existingUser);
        userRepository.update.mockResolvedValue(updatedUser);

        const result = await useCase.execute(input);

        expect(userRepository.findOne).toHaveBeenCalledWith({
          userId: 'auth-user-123',
        });
        expect(userRepository.update).toHaveBeenCalledTimes(1);
        expect(result).toBe(updatedUser);
        expect(result.name).toBe('Updated Name');
        expect(result.financialStage).toBe(FinancialStage.START_INVESTING);
        expect(result.currency).toBe(Currency.EUR);
        expect(result.language).toBe(Language.EN);
      });

      it('should update only name when only name is provided', async () => {
        const userId = 'auth-user-456';
        const updates: UpdateUserProfileDto = {
          name: 'New Name Only',
        };
        const input: UpdateUserProfileInput = { userId, updates };

        const existingUser = UserEntity.create({
          name: 'Old Name',
          userId: 'auth-user-456',
          financialStage: FinancialStage.START_SAVING,
          onboardingCompletedAt: null,
          currency: Currency.USD,
          language: Language.EN,
          createdAt: mockDate,
          updatedAt: mockDate,
        });

        jest.setSystemTime(updateDate);
        const updatedUser = UserEntity.create({
          name: 'New Name Only',
          userId: 'auth-user-456',
          financialStage: FinancialStage.START_SAVING,
          onboardingCompletedAt: null,
          currency: Currency.USD,
          language: Language.EN,
          createdAt: mockDate,
          updatedAt: updateDate,
        });

        userRepository.findOne.mockResolvedValue(existingUser);
        userRepository.update.mockResolvedValue(updatedUser);

        const result = await useCase.execute(input);

        expect(result.name).toBe('New Name Only');
        expect(result.financialStage).toBe(FinancialStage.START_SAVING);
        expect(result.currency).toBe(Currency.USD);
        expect(result.language).toBe(Language.EN);
      });

      it('should update only financial stage when only financial stage is provided', async () => {
        const userId = 'auth-user-789';
        const updates: UpdateUserProfileDto = {
          financialStage: FinancialStage.START_INVESTING,
        };
        const input: UpdateUserProfileInput = { userId, updates };

        const existingUser = UserEntity.create({
          name: 'Same Name',
          userId: 'auth-user-789',
          financialStage: FinancialStage.DEBT,
          onboardingCompletedAt: null,
          currency: Currency.VND,
          language: Language.VI,
          createdAt: mockDate,
          updatedAt: mockDate,
        });

        jest.setSystemTime(updateDate);
        const updatedUser = UserEntity.create({
          name: 'Same Name',
          userId: 'auth-user-789',
          financialStage: FinancialStage.START_INVESTING,
          onboardingCompletedAt: null,
          currency: Currency.VND,
          language: Language.VI,
          createdAt: mockDate,
          updatedAt: updateDate,
        });

        userRepository.findOne.mockResolvedValue(existingUser);
        userRepository.update.mockResolvedValue(updatedUser);

        const result = await useCase.execute(input);

        expect(result.name).toBe('Same Name');
        expect(result.financialStage).toBe(FinancialStage.START_INVESTING);
        expect(result.currency).toBe(Currency.VND);
        expect(result.language).toBe(Language.VI);
      });

      it('should update only currency when only currency is provided', async () => {
        const userId = 'auth-user-currency';
        const updates: UpdateUserProfileDto = {
          currency: Currency.EUR,
        };
        const input: UpdateUserProfileInput = { userId, updates };

        const existingUser = UserEntity.create({
          name: 'Same Name',
          userId: 'auth-user-currency',
          financialStage: FinancialStage.START_SAVING,
          onboardingCompletedAt: null,
          currency: Currency.VND,
          language: Language.VI,
          createdAt: mockDate,
          updatedAt: mockDate,
        });

        jest.setSystemTime(updateDate);
        const updatedUser = UserEntity.create({
          name: 'Same Name',
          userId: 'auth-user-currency',
          financialStage: FinancialStage.START_SAVING,
          onboardingCompletedAt: null,
          currency: Currency.EUR,
          language: Language.VI,
          createdAt: mockDate,
          updatedAt: updateDate,
        });

        userRepository.findOne.mockResolvedValue(existingUser);
        userRepository.update.mockResolvedValue(updatedUser);

        const result = await useCase.execute(input);

        expect(result.currency).toBe(Currency.EUR);
        expect(result.name).toBe('Same Name');
        expect(result.financialStage).toBe(FinancialStage.START_SAVING);
        expect(result.language).toBe(Language.VI);
      });

      it('should update only language when only language is provided', async () => {
        const userId = 'auth-user-language';
        const updates: UpdateUserProfileDto = {
          language: Language.EN,
        };
        const input: UpdateUserProfileInput = { userId, updates };

        const existingUser = UserEntity.create({
          name: 'Same Name',
          userId: 'auth-user-language',
          financialStage: FinancialStage.START_SAVING,
          onboardingCompletedAt: null,
          currency: Currency.VND,
          language: Language.VI,
          createdAt: mockDate,
          updatedAt: mockDate,
        });

        jest.setSystemTime(updateDate);
        const updatedUser = UserEntity.create({
          name: 'Same Name',
          userId: 'auth-user-language',
          financialStage: FinancialStage.START_SAVING,
          onboardingCompletedAt: null,
          currency: Currency.VND,
          language: Language.EN,
          createdAt: mockDate,
          updatedAt: updateDate,
        });

        userRepository.findOne.mockResolvedValue(existingUser);
        userRepository.update.mockResolvedValue(updatedUser);

        const result = await useCase.execute(input);

        expect(result.language).toBe(Language.EN);
        expect(result.name).toBe('Same Name');
        expect(result.financialStage).toBe(FinancialStage.START_SAVING);
        expect(result.currency).toBe(Currency.VND);
      });
    });

    describe('Partial Updates', () => {
      it('should update name and financial stage only', async () => {
        const userId = 'auth-user-partial';
        const updates: UpdateUserProfileDto = {
          name: 'Partial Update',
          financialStage: FinancialStage.START_INVESTING,
        };
        const input: UpdateUserProfileInput = { userId, updates };

        const existingUser = UserEntity.create({
          name: 'Old Name',
          userId: 'auth-user-partial',
          financialStage: FinancialStage.DEBT,
          onboardingCompletedAt: null,
          currency: Currency.USD,
          language: Language.EN,
          createdAt: mockDate,
          updatedAt: mockDate,
        });

        jest.setSystemTime(updateDate);
        const updatedUser = UserEntity.create({
          name: 'Partial Update',
          userId: 'auth-user-partial',
          financialStage: FinancialStage.START_INVESTING,
          onboardingCompletedAt: null,
          currency: Currency.USD,
          language: Language.EN,
          createdAt: mockDate,
          updatedAt: updateDate,
        });

        userRepository.findOne.mockResolvedValue(existingUser);
        userRepository.update.mockResolvedValue(updatedUser);

        const result = await useCase.execute(input);

        expect(result.name).toBe('Partial Update');
        expect(result.financialStage).toBe(FinancialStage.START_INVESTING);
        expect(result.currency).toBe(Currency.USD); // Unchanged
        expect(result.language).toBe(Language.EN); // Unchanged
      });

      it('should update currency and language only', async () => {
        const userId = 'auth-user-localization';
        const updates: UpdateUserProfileDto = {
          currency: Currency.EUR,
          language: Language.EN,
        };
        const input: UpdateUserProfileInput = { userId, updates };

        const existingUser = UserEntity.create({
          name: 'Unchanged Name',
          userId: 'auth-user-localization',
          financialStage: FinancialStage.START_SAVING,
          onboardingCompletedAt: null,
          currency: Currency.VND,
          language: Language.VI,
          createdAt: mockDate,
          updatedAt: mockDate,
        });

        jest.setSystemTime(updateDate);
        const updatedUser = UserEntity.create({
          name: 'Unchanged Name',
          userId: 'auth-user-localization',
          financialStage: FinancialStage.START_SAVING,
          onboardingCompletedAt: null,
          currency: Currency.EUR,
          language: Language.EN,
          createdAt: mockDate,
          updatedAt: updateDate,
        });

        userRepository.findOne.mockResolvedValue(existingUser);
        userRepository.update.mockResolvedValue(updatedUser);

        const result = await useCase.execute(input);

        expect(result.name).toBe('Unchanged Name'); // Unchanged
        expect(result.financialStage).toBe(FinancialStage.START_SAVING); // Unchanged
        expect(result.currency).toBe(Currency.EUR);
        expect(result.language).toBe(Language.EN);
      });
    });

    describe('No Updates Scenario', () => {
      it('should handle empty updates object', async () => {
        const userId = 'auth-user-empty';
        const updates: UpdateUserProfileDto = {};
        const input: UpdateUserProfileInput = { userId, updates };

        const existingUser = UserEntity.create({
          name: 'Unchanged Name',
          userId: 'auth-user-empty',
          financialStage: FinancialStage.START_SAVING,
          onboardingCompletedAt: null,
          currency: Currency.VND,
          language: Language.VI,
          createdAt: mockDate,
          updatedAt: mockDate,
        });

        userRepository.findOne.mockResolvedValue(existingUser);
        userRepository.update.mockResolvedValue(existingUser);

        const result = await useCase.execute(input);

        expect(userRepository.findOne).toHaveBeenCalledWith({
          userId: 'auth-user-empty',
        });
        expect(userRepository.update).toHaveBeenCalledTimes(1);
        expect(result).toBe(existingUser);
        expect(result.name).toBe('Unchanged Name');
        expect(result.financialStage).toBe(FinancialStage.START_SAVING);
        expect(result.currency).toBe(Currency.VND);
        expect(result.language).toBe(Language.VI);
      });

      it('should handle updates with all undefined values', async () => {
        const userId = 'auth-user-undefined';
        const updates: UpdateUserProfileDto = {
          name: undefined,
          financialStage: undefined,
          currency: undefined,
          language: undefined,
        };
        const input: UpdateUserProfileInput = { userId, updates };

        const existingUser = UserEntity.create({
          name: 'Original Name',
          userId: 'auth-user-undefined',
          financialStage: FinancialStage.DEBT,
          onboardingCompletedAt: null,
          currency: Currency.USD,
          language: Language.EN,
          createdAt: mockDate,
          updatedAt: mockDate,
        });

        userRepository.findOne.mockResolvedValue(existingUser);
        userRepository.update.mockResolvedValue(existingUser);

        const result = await useCase.execute(input);

        expect(result.name).toBe('Original Name');
        expect(result.financialStage).toBe(FinancialStage.DEBT);
        expect(result.currency).toBe(Currency.USD);
        expect(result.language).toBe(Language.EN);
      });
    });

    describe('Error Cases', () => {
      it('should throw UserErrorFactory.userProfileNotFound when user does not exist', async () => {
        const userId = 'non-existent-user';
        const updates: UpdateUserProfileDto = {
          name: 'New Name',
        };
        const input: UpdateUserProfileInput = { userId, updates };

        userRepository.findOne.mockResolvedValue(null);

        await expect(useCase.execute(input)).rejects.toThrow(
          UserErrorFactory.userProfileNotFound(),
        );

        expect(userRepository.findOne).toHaveBeenCalledWith({
          userId: 'non-existent-user',
        });
        expect(userRepository.update).not.toHaveBeenCalled();
      });

      it('should throw specific error type for not found user', async () => {
        const userId = 'missing-user';
        const updates: UpdateUserProfileDto = {
          financialStage: FinancialStage.START_INVESTING,
        };
        const input: UpdateUserProfileInput = { userId, updates };

        userRepository.findOne.mockResolvedValue(null);

        try {
          await useCase.execute(input);
          fail('Should have thrown an error');
        } catch (error: any) {
          expect(error).toEqual(UserErrorFactory.userProfileNotFound());
          expect(error.getStatus()).toBe(404);
          expect(error.getResponse()).toEqual({
            code: 'USER_001',
            message: 'User profile not found',
          });
        }
      });

      it('should propagate findOne repository errors', async () => {
        const userId = 'auth-user-find-error';
        const updates: UpdateUserProfileDto = {
          name: 'Error Name',
        };
        const input: UpdateUserProfileInput = { userId, updates };

        const findError = new Error('Database find failed');
        userRepository.findOne.mockRejectedValue(findError);

        await expect(useCase.execute(input)).rejects.toThrow(
          'Database find failed',
        );
        expect(userRepository.findOne).toHaveBeenCalledTimes(1);
        expect(userRepository.update).not.toHaveBeenCalled();
      });

      it('should propagate update repository errors', async () => {
        const userId = 'auth-user-update-error';
        const updates: UpdateUserProfileDto = {
          name: 'Update Error Name',
        };
        const input: UpdateUserProfileInput = { userId, updates };

        const existingUser = UserEntity.create({
          name: 'Original Name',
          userId: 'auth-user-update-error',
          financialStage: FinancialStage.DEBT,
          onboardingCompletedAt: null,
          currency: Currency.VND,
          language: Language.VI,
          createdAt: mockDate,
          updatedAt: mockDate,
        });

        const updateError = new Error('Database update failed');
        userRepository.findOne.mockResolvedValue(existingUser);
        userRepository.update.mockRejectedValue(updateError);

        await expect(useCase.execute(input)).rejects.toThrow(
          'Database update failed',
        );
        expect(userRepository.findOne).toHaveBeenCalledTimes(1);
        expect(userRepository.update).toHaveBeenCalledTimes(1);
      });
    });

    describe('Entity Method Invocation', () => {
      it('should call updateName on entity when name is provided', async () => {
        const userId = 'auth-user-method-name';
        const updates: UpdateUserProfileDto = {
          name: 'Method Test Name',
        };
        const input: UpdateUserProfileInput = { userId, updates };

        const existingUser = UserEntity.create({
          name: 'Old Method Name',
          userId: 'auth-user-method-name',
          financialStage: FinancialStage.DEBT,
          onboardingCompletedAt: null,
          currency: Currency.VND,
          language: Language.VI,
          createdAt: mockDate,
          updatedAt: mockDate,
        });

        const updateNameSpy = jest.spyOn(existingUser, 'updateName');

        userRepository.findOne.mockResolvedValue(existingUser);
        userRepository.update.mockResolvedValue(existingUser);

        await useCase.execute(input);

        expect(updateNameSpy).toHaveBeenCalledWith('Method Test Name');
        expect(updateNameSpy).toHaveBeenCalledTimes(1);
      });

      it('should call setFinancialStage on entity when financial stage is provided', async () => {
        const userId = 'auth-user-method-stage';
        const updates: UpdateUserProfileDto = {
          financialStage: FinancialStage.START_INVESTING,
        };
        const input: UpdateUserProfileInput = { userId, updates };

        const existingUser = UserEntity.create({
          name: 'Method Test User',
          userId: 'auth-user-method-stage',
          financialStage: FinancialStage.DEBT,
          onboardingCompletedAt: null,
          currency: Currency.VND,
          language: Language.VI,
          createdAt: mockDate,
          updatedAt: mockDate,
        });

        const setFinancialStageSpy = jest.spyOn(
          existingUser,
          'setFinancialStage',
        );

        userRepository.findOne.mockResolvedValue(existingUser);
        userRepository.update.mockResolvedValue(existingUser);

        await useCase.execute(input);

        expect(setFinancialStageSpy).toHaveBeenCalledWith(
          FinancialStage.START_INVESTING,
        );
        expect(setFinancialStageSpy).toHaveBeenCalledTimes(1);
      });

      it('should call updateCurrency on entity when currency is provided', async () => {
        const userId = 'auth-user-method-currency';
        const updates: UpdateUserProfileDto = {
          currency: Currency.EUR,
        };
        const input: UpdateUserProfileInput = { userId, updates };

        const existingUser = UserEntity.create({
          name: 'Method Test User',
          userId: 'auth-user-method-currency',
          financialStage: FinancialStage.DEBT,
          onboardingCompletedAt: null,
          currency: Currency.VND,
          language: Language.VI,
          createdAt: mockDate,
          updatedAt: mockDate,
        });

        const updateCurrencySpy = jest.spyOn(existingUser, 'updateCurrency');

        userRepository.findOne.mockResolvedValue(existingUser);
        userRepository.update.mockResolvedValue(existingUser);

        await useCase.execute(input);

        expect(updateCurrencySpy).toHaveBeenCalledWith(Currency.EUR);
        expect(updateCurrencySpy).toHaveBeenCalledTimes(1);
      });

      it('should call updateLanguage on entity when language is provided', async () => {
        const userId = 'auth-user-method-language';
        const updates: UpdateUserProfileDto = {
          language: Language.EN,
        };
        const input: UpdateUserProfileInput = { userId, updates };

        const existingUser = UserEntity.create({
          name: 'Method Test User',
          userId: 'auth-user-method-language',
          financialStage: FinancialStage.DEBT,
          onboardingCompletedAt: null,
          currency: Currency.VND,
          language: Language.VI,
          createdAt: mockDate,
          updatedAt: mockDate,
        });

        const updateLanguageSpy = jest.spyOn(existingUser, 'updateLanguage');

        userRepository.findOne.mockResolvedValue(existingUser);
        userRepository.update.mockResolvedValue(existingUser);

        await useCase.execute(input);

        expect(updateLanguageSpy).toHaveBeenCalledWith(Language.EN);
        expect(updateLanguageSpy).toHaveBeenCalledTimes(1);
      });

      it('should not call entity methods when fields are undefined', async () => {
        const userId = 'auth-user-no-methods';
        const updates: UpdateUserProfileDto = {
          name: undefined,
          financialStage: undefined,
          currency: undefined,
          language: undefined,
        };
        const input: UpdateUserProfileInput = { userId, updates };

        const existingUser = UserEntity.create({
          name: 'No Method User',
          userId: 'auth-user-no-methods',
          financialStage: FinancialStage.DEBT,
          onboardingCompletedAt: null,
          currency: Currency.VND,
          language: Language.VI,
          createdAt: mockDate,
          updatedAt: mockDate,
        });

        const updateNameSpy = jest.spyOn(existingUser, 'updateName');
        const setFinancialStageSpy = jest.spyOn(
          existingUser,
          'setFinancialStage',
        );
        const updateCurrencySpy = jest.spyOn(existingUser, 'updateCurrency');
        const updateLanguageSpy = jest.spyOn(existingUser, 'updateLanguage');

        userRepository.findOne.mockResolvedValue(existingUser);
        userRepository.update.mockResolvedValue(existingUser);

        await useCase.execute(input);

        expect(updateNameSpy).not.toHaveBeenCalled();
        expect(setFinancialStageSpy).not.toHaveBeenCalled();
        expect(updateCurrencySpy).not.toHaveBeenCalled();
        expect(updateLanguageSpy).not.toHaveBeenCalled();
      });
    });

    describe('Repository Integration', () => {
      it('should call repository methods in correct order', async () => {
        const userId = 'auth-user-order';
        const updates: UpdateUserProfileDto = {
          name: 'Order Test',
        };
        const input: UpdateUserProfileInput = { userId, updates };

        const existingUser = UserEntity.create({
          name: 'Old Order',
          userId: 'auth-user-order',
          financialStage: FinancialStage.DEBT,
          onboardingCompletedAt: null,
          currency: Currency.VND,
          language: Language.VI,
          createdAt: mockDate,
          updatedAt: mockDate,
        });

        userRepository.findOne.mockResolvedValue(existingUser);
        userRepository.update.mockResolvedValue(existingUser);

        await useCase.execute(input);

        expect(userRepository.findOne).toHaveBeenCalledWith({
          userId: 'auth-user-order',
        });
        expect(userRepository.update).toHaveBeenCalledWith(existingUser);
        expect(userRepository.findOne).toHaveBeenCalled();
        expect(userRepository.update).toHaveBeenCalled();
      });

      it('should pass updated entity to repository update method', async () => {
        const userId = 'auth-user-entity-passed';
        const updates: UpdateUserProfileDto = {
          name: 'Entity Passed Test',
          financialStage: FinancialStage.START_INVESTING,
        };
        const input: UpdateUserProfileInput = { userId, updates };

        const existingUser = UserEntity.create({
          name: 'Original Entity',
          userId: 'auth-user-entity-passed',
          financialStage: FinancialStage.DEBT,
          onboardingCompletedAt: null,
          currency: Currency.VND,
          language: Language.VI,
          createdAt: mockDate,
          updatedAt: mockDate,
        });

        userRepository.findOne.mockResolvedValue(existingUser);
        userRepository.update.mockResolvedValue(existingUser);

        await useCase.execute(input);

        expect(userRepository.update).toHaveBeenCalledWith(existingUser);
        expect(userRepository.update).toHaveBeenCalledTimes(1);
      });

      it('should return the entity from repository update method', async () => {
        const userId = 'auth-user-return-value';
        const updates: UpdateUserProfileDto = {
          name: 'Return Value Test',
        };
        const input: UpdateUserProfileInput = { userId, updates };

        const existingUser = UserEntity.create({
          name: 'Original Return',
          userId: 'auth-user-return-value',
          financialStage: FinancialStage.DEBT,
          onboardingCompletedAt: null,
          currency: Currency.VND,
          language: Language.VI,
          createdAt: mockDate,
          updatedAt: mockDate,
        });

        const returnedUser = UserEntity.create({
          name: 'Return Value Test',
          userId: 'auth-user-return-value',
          financialStage: FinancialStage.DEBT,
          onboardingCompletedAt: null,
          currency: Currency.VND,
          language: Language.VI,
          createdAt: mockDate,
          updatedAt: updateDate,
        });

        userRepository.findOne.mockResolvedValue(existingUser);
        userRepository.update.mockResolvedValue(returnedUser);

        const result = await useCase.execute(input);

        expect(result).toBe(returnedUser);
      });
    });

    describe('Input Validation and Edge Cases', () => {
      it('should handle empty userId', async () => {
        const userId = '';
        const updates: UpdateUserProfileDto = {
          name: 'Empty UserId',
        };
        const input: UpdateUserProfileInput = { userId, updates };

        userRepository.findOne.mockResolvedValue(null);

        await expect(useCase.execute(input)).rejects.toThrow(
          UserErrorFactory.userProfileNotFound(),
        );

        expect(userRepository.findOne).toHaveBeenCalledWith({ userId: '' });
      });

      it('should handle null updates gracefully', async () => {
        const userId = 'auth-user-null-updates';
        const updates = null as any;
        const input: UpdateUserProfileInput = { userId, updates };

        const existingUser = UserEntity.create({
          name: 'Null Updates User',
          userId: 'auth-user-null-updates',
          financialStage: FinancialStage.DEBT,
          onboardingCompletedAt: null,
          currency: Currency.VND,
          language: Language.VI,
          createdAt: mockDate,
          updatedAt: mockDate,
        });

        userRepository.findOne.mockResolvedValue(existingUser);
        userRepository.update.mockResolvedValue(existingUser);

        // This should not throw since the use case checks for updates.fieldName !== undefined
        const result = await useCase.execute(input);

        expect(result).toBe(existingUser);
        expect(userRepository.update).not.toHaveBeenCalled();
      });

      it('should handle very long name updates', async () => {
        const userId = 'auth-user-long-name';
        const longName = 'a'.repeat(100); // Maximum allowed length
        const updates: UpdateUserProfileDto = {
          name: longName,
        };
        const input: UpdateUserProfileInput = { userId, updates };

        const existingUser = UserEntity.create({
          name: 'Short Name',
          userId: 'auth-user-long-name',
          financialStage: FinancialStage.DEBT,
          onboardingCompletedAt: null,
          currency: Currency.VND,
          language: Language.VI,
          createdAt: mockDate,
          updatedAt: mockDate,
        });

        userRepository.findOne.mockResolvedValue(existingUser);
        userRepository.update.mockResolvedValue(existingUser);

        await useCase.execute(input);

        expect(userRepository.update).toHaveBeenCalledWith(existingUser);
        expect(existingUser.name).toBe(longName);
      });
    });

    describe('Financial Stage Transitions', () => {
      it('should handle transition from DEBT to START_SAVING', async () => {
        const userId = 'auth-user-debt-to-saving';
        const updates: UpdateUserProfileDto = {
          financialStage: FinancialStage.START_SAVING,
        };
        const input: UpdateUserProfileInput = { userId, updates };

        const existingUser = UserEntity.create({
          name: 'Debt to Saving User',
          userId: 'auth-user-debt-to-saving',
          financialStage: FinancialStage.DEBT,
          onboardingCompletedAt: null,
          currency: Currency.VND,
          language: Language.VI,
          createdAt: mockDate,
          updatedAt: mockDate,
        });

        userRepository.findOne.mockResolvedValue(existingUser);
        userRepository.update.mockResolvedValue(existingUser);

        const result = await useCase.execute(input);

        expect(result.financialStage).toBe(FinancialStage.START_SAVING);
      });

      it('should handle transition from START_SAVING to START_INVESTING', async () => {
        const userId = 'auth-user-saving-to-investing';
        const updates: UpdateUserProfileDto = {
          financialStage: FinancialStage.START_INVESTING,
        };
        const input: UpdateUserProfileInput = { userId, updates };

        const existingUser = UserEntity.create({
          name: 'Saving to Investing User',
          userId: 'auth-user-saving-to-investing',
          financialStage: FinancialStage.START_SAVING,
          onboardingCompletedAt: null,
          currency: Currency.VND,
          language: Language.VI,
          createdAt: mockDate,
          updatedAt: mockDate,
        });

        userRepository.findOne.mockResolvedValue(existingUser);
        userRepository.update.mockResolvedValue(existingUser);

        const result = await useCase.execute(input);

        expect(result.financialStage).toBe(FinancialStage.START_INVESTING);
      });

      it('should handle reverse transitions', async () => {
        const userId = 'auth-user-reverse-transition';
        const updates: UpdateUserProfileDto = {
          financialStage: FinancialStage.DEBT,
        };
        const input: UpdateUserProfileInput = { userId, updates };

        const existingUser = UserEntity.create({
          name: 'Reverse Transition User',
          userId: 'auth-user-reverse-transition',
          financialStage: FinancialStage.START_INVESTING,
          onboardingCompletedAt: null,
          currency: Currency.VND,
          language: Language.VI,
          createdAt: mockDate,
          updatedAt: mockDate,
        });

        userRepository.findOne.mockResolvedValue(existingUser);
        userRepository.update.mockResolvedValue(existingUser);

        const result = await useCase.execute(input);

        expect(result.financialStage).toBe(FinancialStage.DEBT);
      });
    });
  });
});
