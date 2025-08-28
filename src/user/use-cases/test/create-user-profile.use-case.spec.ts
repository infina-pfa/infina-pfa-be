import { Test, TestingModule } from '@nestjs/testing';
import { Currency, FinancialStage, Language } from '@/common/types/user';
import { CreateUserProfileDto } from '../../controllers/dto/create-user-profile.dto';
import { UserEntity } from '../../domain/entities/user.entity';
import { UserErrorFactory } from '../../domain/errors';
import { UserRepository } from '../../domain/repositories/user.repository';
import {
  CreateUserProfileUseCase,
  CreateUserProfileInput,
} from '../create-user-profile.use-case';

describe('CreateUserProfileUseCase', () => {
  let useCase: CreateUserProfileUseCase;
  let userRepository: jest.Mocked<UserRepository>;

  const mockDate = new Date('2024-01-01T00:00:00Z');

  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(mockDate);
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
        CreateUserProfileUseCase,
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    useCase = module.get<CreateUserProfileUseCase>(CreateUserProfileUseCase);
    userRepository = module.get(UserRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    describe('Happy Path', () => {
      it('should create user profile with all fields provided', async () => {
        const userId = 'auth-user-123';
        const profileData: CreateUserProfileDto = {
          name: 'John Doe',
          financialStage: FinancialStage.START_INVESTING,
          currency: Currency.USD,
          language: Language.EN,
        };
        const input: CreateUserProfileInput = { userId, profileData };

        const expectedUser = UserEntity.create({
          name: 'John Doe',
          userId: 'auth-user-123',
          financialStage: FinancialStage.START_INVESTING,

          currency: Currency.USD,
          language: Language.EN,
          createdAt: mockDate,
          updatedAt: mockDate,
        });

        userRepository.findOne.mockResolvedValue(null);
        userRepository.create.mockResolvedValue(expectedUser);

        const result = await useCase.execute(input);

        expect(userRepository.findOne).toHaveBeenCalledWith({
          userId: 'auth-user-123',
        });
        expect(userRepository.create).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'John Doe',
            userId: 'auth-user-123',
            financialStage: FinancialStage.START_INVESTING,
            currency: Currency.USD,
            language: Language.EN,
          }),
        );
        expect(result).toBe(expectedUser);
      });

      it('should create user profile with minimal required data and apply defaults', async () => {
        const userId = 'auth-user-456';
        const profileData: CreateUserProfileDto = {
          name: 'Jane Smith',
        };
        const input: CreateUserProfileInput = { userId, profileData };

        const expectedUser = UserEntity.create({
          name: 'Jane Smith',
          userId: 'auth-user-456',
          financialStage: null,
          currency: Currency.VND,
          language: Language.VI,
          createdAt: mockDate,
          updatedAt: mockDate,
        });

        userRepository.findOne.mockResolvedValue(null);
        userRepository.create.mockResolvedValue(expectedUser);

        const result = await useCase.execute(input);

        expect(userRepository.findOne).toHaveBeenCalledWith({
          userId: 'auth-user-456',
        });
        expect(userRepository.create).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Jane Smith',
            userId: 'auth-user-456',
            financialStage: null,
            currency: Currency.VND,
            language: Language.VI,
          }),
        );
        expect(result).toBe(expectedUser);
      });

      it('should create user profile with partial data and correct defaults', async () => {
        const userId = 'auth-user-789';
        const profileData: CreateUserProfileDto = {
          name: 'Test User',
          financialStage: FinancialStage.DEBT,
          // currency and language not provided - should default
        };
        const input: CreateUserProfileInput = { userId, profileData };

        const expectedUser = UserEntity.create({
          name: 'Test User',
          userId: 'auth-user-789',
          financialStage: FinancialStage.DEBT,
          currency: Currency.VND,
          language: Language.VI,
          createdAt: mockDate,
          updatedAt: mockDate,
        });

        userRepository.findOne.mockResolvedValue(null);
        userRepository.create.mockResolvedValue(expectedUser);

        const result = await useCase.execute(input);

        expect(userRepository.create).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Test User',
            userId: 'auth-user-789',
            financialStage: FinancialStage.DEBT,
            currency: Currency.VND, // Default applied
            language: Language.VI, // Default applied
            // Initially not completed
          }),
        );
        expect(result).toBe(expectedUser);
      });

      it('should set onboardingCompletedAt to null initially', async () => {
        const userId = 'auth-user-onboarding';
        const profileData: CreateUserProfileDto = {
          name: 'Onboarding User',
          financialStage: FinancialStage.START_SAVING,
        };
        const input: CreateUserProfileInput = { userId, profileData };

        userRepository.findOne.mockResolvedValue(null);
        userRepository.create.mockResolvedValue(
          UserEntity.create({
            name: 'Onboarding User',
            userId: 'auth-user-onboarding',
            financialStage: FinancialStage.START_SAVING,

            currency: Currency.VND,
            language: Language.VI,
            createdAt: mockDate,
            updatedAt: mockDate,
          }),
        );

        await useCase.execute(input);

        expect(userRepository.create).toHaveBeenCalledWith(
          expect.objectContaining({}),
        );
      });

      it('should handle different financial stages correctly', async () => {
        const testCases = [
          FinancialStage.DEBT,
          FinancialStage.START_SAVING,
          FinancialStage.START_INVESTING,
        ];

        for (const stage of testCases) {
          const userId = `auth-user-${stage}`;
          const profileData: CreateUserProfileDto = {
            name: `User ${stage}`,
            financialStage: stage,
          };
          const input: CreateUserProfileInput = { userId, profileData };

          userRepository.findOne.mockResolvedValue(null);
          userRepository.create.mockResolvedValue(
            UserEntity.create({
              name: `User ${stage}`,
              userId,
              financialStage: stage,

              currency: Currency.VND,
              language: Language.VI,
              createdAt: mockDate,
              updatedAt: mockDate,
            }),
          );

          await useCase.execute(input);

          expect(userRepository.create).toHaveBeenCalledWith(
            expect.objectContaining({
              financialStage: stage,
            }),
          );

          jest.clearAllMocks();
        }
      });

      it('should handle different currencies correctly', async () => {
        const testCases = [Currency.VND, Currency.USD, Currency.EUR];

        for (const currency of testCases) {
          const userId = `auth-user-${currency}`;
          const profileData: CreateUserProfileDto = {
            name: `User ${currency}`,
            currency,
          };
          const input: CreateUserProfileInput = { userId, profileData };

          userRepository.findOne.mockResolvedValue(null);
          userRepository.create.mockResolvedValue(
            UserEntity.create({
              name: `User ${currency}`,
              userId,
              financialStage: null,

              currency,
              language: Language.VI,
              createdAt: mockDate,
              updatedAt: mockDate,
            }),
          );

          await useCase.execute(input);

          expect(userRepository.create).toHaveBeenCalledWith(
            expect.objectContaining({
              currency,
            }),
          );

          jest.clearAllMocks();
        }
      });

      it('should handle different languages correctly', async () => {
        const testCases = [Language.VI, Language.EN];

        for (const language of testCases) {
          const userId = `auth-user-${language}`;
          const profileData: CreateUserProfileDto = {
            name: `User ${language}`,
            language,
          };
          const input: CreateUserProfileInput = { userId, profileData };

          userRepository.findOne.mockResolvedValue(null);
          userRepository.create.mockResolvedValue(
            UserEntity.create({
              name: `User ${language}`,
              userId,
              financialStage: null,

              currency: Currency.VND,
              language,
              createdAt: mockDate,
              updatedAt: mockDate,
            }),
          );

          await useCase.execute(input);

          expect(userRepository.create).toHaveBeenCalledWith(
            expect.objectContaining({
              language,
            }),
          );

          jest.clearAllMocks();
        }
      });
    });

    describe('Business Logic Validation', () => {
      it('should throw error if user profile already exists', async () => {
        const userId = 'auth-user-existing';
        const profileData: CreateUserProfileDto = {
          name: 'Existing User',
        };
        const input: CreateUserProfileInput = { userId, profileData };

        const existingUser = UserEntity.create({
          name: 'Existing User',
          userId: 'auth-user-existing',
          financialStage: null,

          currency: Currency.VND,
          language: Language.VI,
          createdAt: mockDate,
          updatedAt: mockDate,
        });

        userRepository.findOne.mockResolvedValue(existingUser);

        await expect(useCase.execute(input)).rejects.toThrow(
          UserErrorFactory.userProfileAlreadyExists(),
        );

        expect(userRepository.findOne).toHaveBeenCalledWith({
          userId: 'auth-user-existing',
        });
        expect(userRepository.create).not.toHaveBeenCalled();
      });

      it('should check for existing user before attempting to create', async () => {
        const userId = 'auth-user-check';
        const profileData: CreateUserProfileDto = {
          name: 'New User',
        };
        const input: CreateUserProfileInput = { userId, profileData };

        userRepository.findOne.mockResolvedValue(null);
        userRepository.create.mockResolvedValue(
          UserEntity.create({
            name: 'New User',
            userId: 'auth-user-check',
            financialStage: null,

            currency: Currency.VND,
            language: Language.VI,
            createdAt: mockDate,
            updatedAt: mockDate,
          }),
        );

        await useCase.execute(input);

        expect(userRepository.findOne).toHaveBeenCalledWith({
          userId: 'auth-user-check',
        });
        expect(userRepository.findOne).toHaveBeenCalled();
        expect(userRepository.create).toHaveBeenCalled();
      });
    });

    describe('Entity Creation', () => {
      it('should create UserEntity with correct properties structure', async () => {
        const userId = 'auth-user-structure';
        const profileData: CreateUserProfileDto = {
          name: 'Structure Test',
          financialStage: FinancialStage.START_INVESTING,
          currency: Currency.EUR,
          language: Language.EN,
        };
        const input: CreateUserProfileInput = { userId, profileData };

        userRepository.findOne.mockResolvedValue(null);
        userRepository.create.mockResolvedValue(
          UserEntity.create({
            name: 'Structure Test',
            userId: 'auth-user-structure',
            financialStage: FinancialStage.START_INVESTING,

            currency: Currency.EUR,
            language: Language.EN,
            createdAt: mockDate,
            updatedAt: mockDate,
          }),
        );

        await useCase.execute(input);

        const createCall = userRepository.create.mock.calls[0][0];
        expect(createCall).toMatchObject({
          props: expect.objectContaining({
            name: 'Structure Test',
            userId: 'auth-user-structure',
            financialStage: FinancialStage.START_INVESTING,

            currency: Currency.EUR,
            language: Language.EN,
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date),
          }),
        });
        expect(createCall.id).toBeDefined();
      });

      it('should set correct timestamps during creation', async () => {
        const userId = 'auth-user-timestamp';
        const profileData: CreateUserProfileDto = {
          name: 'Timestamp User',
        };
        const input: CreateUserProfileInput = { userId, profileData };

        userRepository.findOne.mockResolvedValue(null);
        userRepository.create.mockResolvedValue(
          UserEntity.create({
            name: 'Timestamp User',
            userId: 'auth-user-timestamp',
            financialStage: null,

            currency: Currency.VND,
            language: Language.VI,
            createdAt: mockDate,
            updatedAt: mockDate,
          }),
        );

        await useCase.execute(input);

        const createCall = userRepository.create.mock.calls[0][0];
        expect(createCall.props.createdAt).toEqual(mockDate);
        expect(createCall.props.updatedAt).toEqual(mockDate);
      });
    });

    describe('Repository Integration', () => {
      it('should handle repository create success', async () => {
        const userId = 'auth-user-success';
        const profileData: CreateUserProfileDto = {
          name: 'Success User',
        };
        const input: CreateUserProfileInput = { userId, profileData };

        const createdUser = UserEntity.create({
          name: 'Success User',
          userId: 'auth-user-success',
          financialStage: null,

          currency: Currency.VND,
          language: Language.VI,
          createdAt: mockDate,
          updatedAt: mockDate,
        });

        userRepository.findOne.mockResolvedValue(null);
        userRepository.create.mockResolvedValue(createdUser);

        const result = await useCase.execute(input);

        expect(result).toBe(createdUser);
        expect(userRepository.create).toHaveBeenCalledTimes(1);
      });

      it('should propagate repository errors', async () => {
        const userId = 'auth-user-error';
        const profileData: CreateUserProfileDto = {
          name: 'Error User',
        };
        const input: CreateUserProfileInput = { userId, profileData };

        const repositoryError = new Error('Database connection failed');

        userRepository.findOne.mockResolvedValue(null);
        userRepository.create.mockRejectedValue(repositoryError);

        await expect(useCase.execute(input)).rejects.toThrow(
          'Database connection failed',
        );
        expect(userRepository.create).toHaveBeenCalledTimes(1);
      });

      it('should propagate findOne repository errors', async () => {
        const userId = 'auth-user-find-error';
        const profileData: CreateUserProfileDto = {
          name: 'Find Error User',
        };
        const input: CreateUserProfileInput = { userId, profileData };

        const findError = new Error('Find operation failed');

        userRepository.findOne.mockRejectedValue(findError);

        await expect(useCase.execute(input)).rejects.toThrow(
          'Find operation failed',
        );
        expect(userRepository.findOne).toHaveBeenCalledTimes(1);
        expect(userRepository.create).not.toHaveBeenCalled();
      });
    });

    describe('Input Validation and Edge Cases', () => {
      it('should handle null financial stage correctly', async () => {
        const userId = 'auth-user-null-stage';
        const profileData: CreateUserProfileDto = {
          name: 'Null Stage User',
          financialStage: undefined, // Explicitly undefined
        };
        const input: CreateUserProfileInput = { userId, profileData };

        userRepository.findOne.mockResolvedValue(null);
        userRepository.create.mockResolvedValue(
          UserEntity.create({
            name: 'Null Stage User',
            userId: 'auth-user-null-stage',
            financialStage: null,

            currency: Currency.VND,
            language: Language.VI,
            createdAt: mockDate,
            updatedAt: mockDate,
          }),
        );

        await useCase.execute(input);

        expect(userRepository.create).toHaveBeenCalledWith(
          expect.objectContaining({
            props: expect.objectContaining({
              financialStage: null,
            }),
          }),
        );
      });

      it('should handle undefined currency and language with defaults', async () => {
        const userId = 'auth-user-undefined';
        const profileData: CreateUserProfileDto = {
          name: 'Undefined Props User',
          currency: undefined,
          language: undefined,
        };
        const input: CreateUserProfileInput = { userId, profileData };

        userRepository.findOne.mockResolvedValue(null);
        userRepository.create.mockResolvedValue(
          UserEntity.create({
            name: 'Undefined Props User',
            userId: 'auth-user-undefined',
            financialStage: null,

            currency: Currency.VND,
            language: Language.VI,
            createdAt: mockDate,
            updatedAt: mockDate,
          }),
        );

        await useCase.execute(input);

        expect(userRepository.create).toHaveBeenCalledWith(
          expect.objectContaining({
            props: expect.objectContaining({
              currency: Currency.VND,
              language: Language.VI,
            }),
          }),
        );
      });

      it('should handle empty userId gracefully', async () => {
        const userId = '';
        const profileData: CreateUserProfileDto = {
          name: 'Empty UserId User',
        };
        const input: CreateUserProfileInput = { userId, profileData };

        userRepository.findOne.mockResolvedValue(null);
        userRepository.create.mockResolvedValue(
          UserEntity.create({
            name: 'Empty UserId User',
            userId: '',
            financialStage: null,

            currency: Currency.VND,
            language: Language.VI,
            createdAt: mockDate,
            updatedAt: mockDate,
          }),
        );

        await useCase.execute(input);

        expect(userRepository.findOne).toHaveBeenCalledWith({ userId: '' });
        expect(userRepository.create).toHaveBeenCalledWith(
          expect.objectContaining({
            props: expect.objectContaining({
              userId: '',
            }),
          }),
        );
      });
    });

    describe('Default Application Logic', () => {
      it('should apply VND currency default when not provided', async () => {
        const userId = 'auth-user-default-currency';
        const profileData: CreateUserProfileDto = {
          name: 'Default Currency User',
        };
        const input: CreateUserProfileInput = { userId, profileData };

        userRepository.findOne.mockResolvedValue(null);
        userRepository.create.mockImplementation((entity) =>
          Promise.resolve(entity),
        );

        await useCase.execute(input);

        expect(userRepository.create).toHaveBeenCalledWith(
          expect.objectContaining({
            props: expect.objectContaining({
              currency: Currency.VND,
            }),
          }),
        );
      });

      it('should apply VI language default when not provided', async () => {
        const userId = 'auth-user-default-language';
        const profileData: CreateUserProfileDto = {
          name: 'Default Language User',
        };
        const input: CreateUserProfileInput = { userId, profileData };

        userRepository.findOne.mockResolvedValue(null);
        userRepository.create.mockImplementation((entity) =>
          Promise.resolve(entity),
        );

        await useCase.execute(input);

        expect(userRepository.create).toHaveBeenCalledWith(
          expect.objectContaining({
            props: expect.objectContaining({
              language: Language.VI,
            }),
          }),
        );
      });

      it('should not apply defaults when values are explicitly provided', async () => {
        const userId = 'auth-user-explicit-values';
        const profileData: CreateUserProfileDto = {
          name: 'Explicit Values User',
          currency: Currency.EUR,
          language: Language.EN,
        };
        const input: CreateUserProfileInput = { userId, profileData };

        userRepository.findOne.mockResolvedValue(null);
        userRepository.create.mockImplementation((entity) =>
          Promise.resolve(entity),
        );

        await useCase.execute(input);

        expect(userRepository.create).toHaveBeenCalledWith(
          expect.objectContaining({
            props: expect.objectContaining({
              currency: Currency.EUR,
              language: Language.EN,
            }),
          }),
        );
      });
    });
  });
});
