import { Test, TestingModule } from '@nestjs/testing';
import { Currency, Language } from '@/common/types/user';
import { AuthUser } from '@/common/types/auth-user';
import { CreateUserProfileDto } from '../dto/create-user-profile.dto';
import { UpdateUserProfileDto } from '../dto/update-user-profile.dto';
import { UserProfileResponseDto } from '../../dto/user-profile.dto';
import { UserEntity, FinancialStage } from '../../domain/entities/user.entity';
import { UserErrorFactory } from '../../domain/errors';
import { GetUserProfileUseCase } from '../../use-cases/get-user-profile.use-case';
import { CreateUserProfileUseCase } from '../../use-cases/create-user-profile.use-case';
import { UpdateUserProfileUseCase } from '../../use-cases/update-user-profile.use-case';
import { UserController } from '../user.controller';

describe('UserController', () => {
  let controller: UserController;
  let getUserProfileUseCase: jest.Mocked<GetUserProfileUseCase>;
  let createUserProfileUseCase: jest.Mocked<CreateUserProfileUseCase>;
  let updateUserProfileUseCase: jest.Mocked<UpdateUserProfileUseCase>;

  const mockDate = new Date('2024-01-01T00:00:00Z');
  const updateDate = new Date('2024-01-02T00:00:00Z');

  const mockAuthUser: AuthUser = {
    id: 'auth-user-123',
    email: 'test@example.com',
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: '2024-01-01T00:00:00Z',
  } as AuthUser;

  beforeEach(async () => {
    const mockGetUserProfileUseCase = {
      execute: jest.fn(),
    };

    const mockCreateUserProfileUseCase = {
      execute: jest.fn(),
    };

    const mockUpdateUserProfileUseCase = {
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: GetUserProfileUseCase,
          useValue: mockGetUserProfileUseCase,
        },
        {
          provide: CreateUserProfileUseCase,
          useValue: mockCreateUserProfileUseCase,
        },
        {
          provide: UpdateUserProfileUseCase,
          useValue: mockUpdateUserProfileUseCase,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    getUserProfileUseCase = module.get(GetUserProfileUseCase);
    createUserProfileUseCase = module.get(CreateUserProfileUseCase);
    updateUserProfileUseCase = module.get(UpdateUserProfileUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserProfile', () => {
    describe('Happy Path', () => {
      it('should return user profile when user exists', async () => {
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

        getUserProfileUseCase.execute.mockResolvedValue(userEntity);

        const result = await controller.getUserProfile(mockAuthUser);

        expect(getUserProfileUseCase.execute).toHaveBeenCalledWith(
          'auth-user-123',
        );
        expect(result).toEqual({
          id: userEntity.id,
          name: 'John Doe',
          financialStage: FinancialStage.START_INVESTING,
          onboardingCompletedAt: new Date('2024-01-15T00:00:00Z'),
          currency: Currency.USD,
          language: Language.EN,
          createdAt: mockDate,
          updatedAt: updateDate,
        });
      });

      it('should return user profile with default values', async () => {
        const userEntity = UserEntity.create({
          name: 'Jane Smith',
          userId: 'auth-user-123',
          financialStage: null,
          onboardingCompletedAt: null,
          currency: Currency.VND,
          language: Language.VI,
          createdAt: mockDate,
          updatedAt: mockDate,
        });

        getUserProfileUseCase.execute.mockResolvedValue(userEntity);

        const result = await controller.getUserProfile(mockAuthUser);

        expect(result).toEqual({
          id: userEntity.id,
          name: 'Jane Smith',
          financialStage: null,
          onboardingCompletedAt: null,
          currency: Currency.VND,
          language: Language.VI,
          createdAt: mockDate,
          updatedAt: mockDate,
        });
      });

      it('should call use case with correct user ID', async () => {
        const differentUser: AuthUser = {
          id: 'different-user-456',
          email: 'different@example.com',
          app_metadata: {},
          user_metadata: {},
          aud: 'authenticated',
          created_at: '2024-01-01T00:00:00Z',
        } as AuthUser;

        const userEntity = UserEntity.create({
          name: 'Different User',
          userId: 'different-user-456',
          financialStage: FinancialStage.DEBT,
          onboardingCompletedAt: null,
          currency: Currency.EUR,
          language: Language.EN,
          createdAt: mockDate,
          updatedAt: mockDate,
        });

        getUserProfileUseCase.execute.mockResolvedValue(userEntity);

        await controller.getUserProfile(differentUser);

        expect(getUserProfileUseCase.execute).toHaveBeenCalledWith(
          'different-user-456',
        );
      });

      it('should return UserProfileResponseDto with all expected properties', async () => {
        const userEntity = UserEntity.create({
          name: 'Complete User',
          userId: 'auth-user-123',
          financialStage: FinancialStage.START_SAVING,
          onboardingCompletedAt: new Date('2024-01-20T00:00:00Z'),
          currency: Currency.EUR,
          language: Language.EN,
          createdAt: mockDate,
          updatedAt: updateDate,
        });

        getUserProfileUseCase.execute.mockResolvedValue(userEntity);

        const result = await controller.getUserProfile(mockAuthUser);

        expect(result).toHaveProperty('id');
        expect(result).toHaveProperty('name');
        expect(result).toHaveProperty('financialStage');
        expect(result).toHaveProperty('onboardingCompletedAt');
        expect(result).toHaveProperty('currency');
        expect(result).toHaveProperty('language');
        expect(result).toHaveProperty('createdAt');
        expect(result).toHaveProperty('updatedAt');
      });
    });

    describe('Error Cases', () => {
      it('should propagate use case errors', async () => {
        const userNotFoundError = UserErrorFactory.userProfileNotFound();
        getUserProfileUseCase.execute.mockRejectedValue(userNotFoundError);

        await expect(controller.getUserProfile(mockAuthUser)).rejects.toThrow(
          userNotFoundError,
        );
        expect(getUserProfileUseCase.execute).toHaveBeenCalledWith(
          'auth-user-123',
        );
      });

      it('should handle repository errors', async () => {
        const repositoryError = new Error('Database connection failed');
        getUserProfileUseCase.execute.mockRejectedValue(repositoryError);

        await expect(controller.getUserProfile(mockAuthUser)).rejects.toThrow(
          'Database connection failed',
        );
      });

      it('should handle unexpected errors', async () => {
        const unexpectedError = new Error('Unexpected error');
        getUserProfileUseCase.execute.mockRejectedValue(unexpectedError);

        await expect(controller.getUserProfile(mockAuthUser)).rejects.toThrow(
          'Unexpected error',
        );
      });
    });

    describe('DTO Conversion', () => {
      it('should properly convert entity to response DTO', async () => {
        const userEntity = UserEntity.create({
          name: 'DTO Test User',
          userId: 'auth-user-123',
          financialStage: FinancialStage.START_INVESTING,
          onboardingCompletedAt: new Date('2024-01-25T00:00:00Z'),
          currency: Currency.USD,
          language: Language.EN,
          createdAt: mockDate,
          updatedAt: updateDate,
        });

        getUserProfileUseCase.execute.mockResolvedValue(userEntity);

        const result = await controller.getUserProfile(mockAuthUser);

        // Verify the result follows the expected DTO structure
        expect(result.id).toBe(userEntity.id);
        expect(result.name).toBe('DTO Test User');
        expect(result.financialStage).toBe(FinancialStage.START_INVESTING);
        expect(result.onboardingCompletedAt).toEqual(
          new Date('2024-01-25T00:00:00Z'),
        );
        expect(result.currency).toBe(Currency.USD);
        expect(result.language).toBe(Language.EN);
        expect(result.createdAt).toEqual(mockDate);
        expect(result.updatedAt).toEqual(updateDate);
      });

      it('should use UserProfileResponseDto.fromEntity method', async () => {
        const userEntity = UserEntity.create({
          name: 'FromEntity Test',
          userId: 'auth-user-123',
          financialStage: FinancialStage.DEBT,
          onboardingCompletedAt: null,
          currency: Currency.VND,
          language: Language.VI,
          createdAt: mockDate,
          updatedAt: mockDate,
        });

        getUserProfileUseCase.execute.mockResolvedValue(userEntity);

        const fromEntitySpy = jest.spyOn(UserProfileResponseDto, 'fromEntity');

        await controller.getUserProfile(mockAuthUser);

        expect(fromEntitySpy).toHaveBeenCalledWith(userEntity);
      });
    });
  });

  describe('createUserProfile', () => {
    describe('Happy Path', () => {
      it('should create user profile with all fields provided', async () => {
        const createDto: CreateUserProfileDto = {
          name: 'New User',
          financialStage: FinancialStage.START_SAVING,
          currency: Currency.EUR,
          language: Language.EN,
        };

        const createdEntity = UserEntity.create({
          name: 'New User',
          userId: 'auth-user-123',
          financialStage: FinancialStage.START_SAVING,
          onboardingCompletedAt: null,
          currency: Currency.EUR,
          language: Language.EN,
          createdAt: mockDate,
          updatedAt: mockDate,
        });

        createUserProfileUseCase.execute.mockResolvedValue(createdEntity);

        const result = await controller.createUserProfile(
          mockAuthUser,
          createDto,
        );

        expect(createUserProfileUseCase.execute).toHaveBeenCalledWith({
          userId: 'auth-user-123',
          profileData: createDto,
        });
        expect(result).toEqual({
          id: createdEntity.id,
          name: 'New User',
          financialStage: FinancialStage.START_SAVING,
          onboardingCompletedAt: null,
          currency: Currency.EUR,
          language: Language.EN,
          createdAt: mockDate,
          updatedAt: mockDate,
        });
      });

      it('should create user profile with minimal data', async () => {
        const createDto: CreateUserProfileDto = {
          name: 'Minimal User',
        };

        const createdEntity = UserEntity.create({
          name: 'Minimal User',
          userId: 'auth-user-123',
          financialStage: null,
          onboardingCompletedAt: null,
          currency: Currency.VND,
          language: Language.VI,
          createdAt: mockDate,
          updatedAt: mockDate,
        });

        createUserProfileUseCase.execute.mockResolvedValue(createdEntity);

        const result = await controller.createUserProfile(
          mockAuthUser,
          createDto,
        );

        expect(createUserProfileUseCase.execute).toHaveBeenCalledWith({
          userId: 'auth-user-123',
          profileData: createDto,
        });
        expect(result.name).toBe('Minimal User');
        expect(result.financialStage).toBeNull();
      });

      it('should pass correct input to use case', async () => {
        const createDto: CreateUserProfileDto = {
          name: 'Input Test User',
          financialStage: FinancialStage.START_INVESTING,
          currency: Currency.USD,
          language: Language.EN,
        };

        const createdEntity = UserEntity.create({
          name: 'Input Test User',
          userId: 'auth-user-123',
          financialStage: FinancialStage.START_INVESTING,
          onboardingCompletedAt: null,
          currency: Currency.USD,
          language: Language.EN,
          createdAt: mockDate,
          updatedAt: mockDate,
        });

        createUserProfileUseCase.execute.mockResolvedValue(createdEntity);

        await controller.createUserProfile(mockAuthUser, createDto);

        expect(createUserProfileUseCase.execute).toHaveBeenCalledWith({
          userId: 'auth-user-123',
          profileData: {
            name: 'Input Test User',
            financialStage: FinancialStage.START_INVESTING,
            currency: Currency.USD,
            language: Language.EN,
          },
        });
      });

      it('should work with different user IDs', async () => {
        const differentUser: AuthUser = {
          id: 'different-user-789',
          email: 'different@test.com',
          app_metadata: {},
          user_metadata: {},
          aud: 'authenticated',
          created_at: '2024-01-01T00:00:00Z',
        } as AuthUser;

        const createDto: CreateUserProfileDto = {
          name: 'Different User Profile',
        };

        const createdEntity = UserEntity.create({
          name: 'Different User Profile',
          userId: 'different-user-789',
          financialStage: null,
          onboardingCompletedAt: null,
          currency: Currency.VND,
          language: Language.VI,
          createdAt: mockDate,
          updatedAt: mockDate,
        });

        createUserProfileUseCase.execute.mockResolvedValue(createdEntity);

        await controller.createUserProfile(differentUser, createDto);

        expect(createUserProfileUseCase.execute).toHaveBeenCalledWith({
          userId: 'different-user-789',
          profileData: createDto,
        });
      });
    });

    describe('Error Cases', () => {
      it('should propagate user already exists error', async () => {
        const createDto: CreateUserProfileDto = {
          name: 'Existing User',
        };

        const alreadyExistsError = UserErrorFactory.userProfileAlreadyExists();
        createUserProfileUseCase.execute.mockRejectedValue(alreadyExistsError);

        await expect(
          controller.createUserProfile(mockAuthUser, createDto),
        ).rejects.toThrow(alreadyExistsError);
      });

      it('should handle validation errors', async () => {
        const createDto: CreateUserProfileDto = {
          name: 'Validation Error User',
        };

        const validationError = new Error('Validation failed');
        createUserProfileUseCase.execute.mockRejectedValue(validationError);

        await expect(
          controller.createUserProfile(mockAuthUser, createDto),
        ).rejects.toThrow('Validation failed');
      });

      it('should handle repository errors during creation', async () => {
        const createDto: CreateUserProfileDto = {
          name: 'Repository Error User',
        };

        const repositoryError = new Error('Database insert failed');
        createUserProfileUseCase.execute.mockRejectedValue(repositoryError);

        await expect(
          controller.createUserProfile(mockAuthUser, createDto),
        ).rejects.toThrow('Database insert failed');
      });
    });

    describe('DTO Handling', () => {
      it('should handle all DTO fields correctly', async () => {
        const createDto: CreateUserProfileDto = {
          name: 'Complete DTO User',
          financialStage: FinancialStage.START_INVESTING,
          currency: Currency.EUR,
          language: Language.EN,
        };

        const createdEntity = UserEntity.create({
          name: 'Complete DTO User',
          userId: 'auth-user-123',
          financialStage: FinancialStage.START_INVESTING,
          onboardingCompletedAt: null,
          currency: Currency.EUR,
          language: Language.EN,
          createdAt: mockDate,
          updatedAt: mockDate,
        });

        createUserProfileUseCase.execute.mockResolvedValue(createdEntity);

        const result = await controller.createUserProfile(
          mockAuthUser,
          createDto,
        );

        expect(result.name).toBe('Complete DTO User');
        expect(result.financialStage).toBe(FinancialStage.START_INVESTING);
        expect(result.currency).toBe(Currency.EUR);
        expect(result.language).toBe(Language.EN);
      });

      it('should handle optional DTO fields', async () => {
        const createDto: CreateUserProfileDto = {
          name: 'Optional Fields User',
          // other fields are optional
        };

        const createdEntity = UserEntity.create({
          name: 'Optional Fields User',
          userId: 'auth-user-123',
          financialStage: null,
          onboardingCompletedAt: null,
          currency: Currency.VND,
          language: Language.VI,
          createdAt: mockDate,
          updatedAt: mockDate,
        });

        createUserProfileUseCase.execute.mockResolvedValue(createdEntity);

        await controller.createUserProfile(mockAuthUser, createDto);

        expect(createUserProfileUseCase.execute).toHaveBeenCalledWith({
          userId: 'auth-user-123',
          profileData: {
            name: 'Optional Fields User',
          },
        });
      });
    });
  });

  describe('updateUserProfile', () => {
    describe('Happy Path', () => {
      it('should update user profile with all fields', async () => {
        const updateDto: UpdateUserProfileDto = {
          name: 'Updated Name',
          financialStage: FinancialStage.START_INVESTING,
          currency: Currency.EUR,
          language: Language.EN,
        };

        const updatedEntity = UserEntity.create({
          name: 'Updated Name',
          userId: 'auth-user-123',
          financialStage: FinancialStage.START_INVESTING,
          onboardingCompletedAt: null,
          currency: Currency.EUR,
          language: Language.EN,
          createdAt: mockDate,
          updatedAt: updateDate,
        });

        updateUserProfileUseCase.execute.mockResolvedValue(updatedEntity);

        const result = await controller.updateUserProfile(
          mockAuthUser,
          updateDto,
        );

        expect(updateUserProfileUseCase.execute).toHaveBeenCalledWith({
          userId: 'auth-user-123',
          updates: updateDto,
        });
        expect(result).toEqual({
          id: updatedEntity.id,
          name: 'Updated Name',
          financialStage: FinancialStage.START_INVESTING,
          onboardingCompletedAt: null,
          currency: Currency.EUR,
          language: Language.EN,
          createdAt: mockDate,
          updatedAt: updateDate,
        });
      });

      it('should update user profile with partial fields', async () => {
        const updateDto: UpdateUserProfileDto = {
          name: 'Partially Updated Name',
        };

        const updatedEntity = UserEntity.create({
          name: 'Partially Updated Name',
          userId: 'auth-user-123',
          financialStage: FinancialStage.DEBT,
          onboardingCompletedAt: null,
          currency: Currency.VND,
          language: Language.VI,
          createdAt: mockDate,
          updatedAt: updateDate,
        });

        updateUserProfileUseCase.execute.mockResolvedValue(updatedEntity);

        const result = await controller.updateUserProfile(
          mockAuthUser,
          updateDto,
        );

        expect(updateUserProfileUseCase.execute).toHaveBeenCalledWith({
          userId: 'auth-user-123',
          updates: { name: 'Partially Updated Name' },
        });
        expect(result.name).toBe('Partially Updated Name');
      });

      it('should handle empty update DTO', async () => {
        const updateDto: UpdateUserProfileDto = {};

        const unchangedEntity = UserEntity.create({
          name: 'Unchanged User',
          userId: 'auth-user-123',
          financialStage: FinancialStage.START_SAVING,
          onboardingCompletedAt: null,
          currency: Currency.USD,
          language: Language.EN,
          createdAt: mockDate,
          updatedAt: mockDate,
        });

        updateUserProfileUseCase.execute.mockResolvedValue(unchangedEntity);

        const result = await controller.updateUserProfile(
          mockAuthUser,
          updateDto,
        );

        expect(updateUserProfileUseCase.execute).toHaveBeenCalledWith({
          userId: 'auth-user-123',
          updates: {},
        });
        expect(result.name).toBe('Unchanged User');
      });

      it('should work with different user IDs', async () => {
        const differentUser: AuthUser = {
          id: 'different-user-update',
          email: 'update@test.com',
          app_metadata: {},
          user_metadata: {},
          aud: 'authenticated',
          created_at: '2024-01-01T00:00:00Z',
        } as AuthUser;

        const updateDto: UpdateUserProfileDto = {
          financialStage: FinancialStage.START_INVESTING,
        };

        const updatedEntity = UserEntity.create({
          name: 'Different Update User',
          userId: 'different-user-update',
          financialStage: FinancialStage.START_INVESTING,
          onboardingCompletedAt: null,
          currency: Currency.VND,
          language: Language.VI,
          createdAt: mockDate,
          updatedAt: updateDate,
        });

        updateUserProfileUseCase.execute.mockResolvedValue(updatedEntity);

        await controller.updateUserProfile(differentUser, updateDto);

        expect(updateUserProfileUseCase.execute).toHaveBeenCalledWith({
          userId: 'different-user-update',
          updates: updateDto,
        });
      });
    });

    describe('Error Cases', () => {
      it('should propagate user not found error', async () => {
        const updateDto: UpdateUserProfileDto = {
          name: 'Nonexistent User',
        };

        const userNotFoundError = UserErrorFactory.userProfileNotFound();
        updateUserProfileUseCase.execute.mockRejectedValue(userNotFoundError);

        await expect(
          controller.updateUserProfile(mockAuthUser, updateDto),
        ).rejects.toThrow(userNotFoundError);
      });

      it('should handle validation errors', async () => {
        const updateDto: UpdateUserProfileDto = {
          name: 'Invalid User',
        };

        const validationError = new Error('Validation failed');
        updateUserProfileUseCase.execute.mockRejectedValue(validationError);

        await expect(
          controller.updateUserProfile(mockAuthUser, updateDto),
        ).rejects.toThrow('Validation failed');
      });

      it('should handle repository errors during update', async () => {
        const updateDto: UpdateUserProfileDto = {
          name: 'Repository Error User',
        };

        const repositoryError = new Error('Database update failed');
        updateUserProfileUseCase.execute.mockRejectedValue(repositoryError);

        await expect(
          controller.updateUserProfile(mockAuthUser, updateDto),
        ).rejects.toThrow('Database update failed');
      });
    });

    describe('Field Updates', () => {
      it('should handle name updates correctly', async () => {
        const updateDto: UpdateUserProfileDto = {
          name: 'New Name Only',
        };

        const updatedEntity = UserEntity.create({
          name: 'New Name Only',
          userId: 'auth-user-123',
          financialStage: FinancialStage.START_SAVING,
          onboardingCompletedAt: null,
          currency: Currency.VND,
          language: Language.VI,
          createdAt: mockDate,
          updatedAt: updateDate,
        });

        updateUserProfileUseCase.execute.mockResolvedValue(updatedEntity);

        const result = await controller.updateUserProfile(
          mockAuthUser,
          updateDto,
        );

        expect(result.name).toBe('New Name Only');
      });

      it('should handle financial stage updates correctly', async () => {
        const updateDto: UpdateUserProfileDto = {
          financialStage: FinancialStage.START_INVESTING,
        };

        const updatedEntity = UserEntity.create({
          name: 'Stage Update User',
          userId: 'auth-user-123',
          financialStage: FinancialStage.START_INVESTING,
          onboardingCompletedAt: null,
          currency: Currency.VND,
          language: Language.VI,
          createdAt: mockDate,
          updatedAt: updateDate,
        });

        updateUserProfileUseCase.execute.mockResolvedValue(updatedEntity);

        const result = await controller.updateUserProfile(
          mockAuthUser,
          updateDto,
        );

        expect(result.financialStage).toBe(FinancialStage.START_INVESTING);
      });

      it('should handle currency updates correctly', async () => {
        const updateDto: UpdateUserProfileDto = {
          currency: Currency.EUR,
        };

        const updatedEntity = UserEntity.create({
          name: 'Currency Update User',
          userId: 'auth-user-123',
          financialStage: FinancialStage.START_SAVING,
          onboardingCompletedAt: null,
          currency: Currency.EUR,
          language: Language.VI,
          createdAt: mockDate,
          updatedAt: updateDate,
        });

        updateUserProfileUseCase.execute.mockResolvedValue(updatedEntity);

        const result = await controller.updateUserProfile(
          mockAuthUser,
          updateDto,
        );

        expect(result.currency).toBe(Currency.EUR);
      });

      it('should handle language updates correctly', async () => {
        const updateDto: UpdateUserProfileDto = {
          language: Language.EN,
        };

        const updatedEntity = UserEntity.create({
          name: 'Language Update User',
          userId: 'auth-user-123',
          financialStage: FinancialStage.START_SAVING,
          onboardingCompletedAt: null,
          currency: Currency.VND,
          language: Language.EN,
          createdAt: mockDate,
          updatedAt: updateDate,
        });

        updateUserProfileUseCase.execute.mockResolvedValue(updatedEntity);

        const result = await controller.updateUserProfile(
          mockAuthUser,
          updateDto,
        );

        expect(result.language).toBe(Language.EN);
      });
    });
  });

  describe('Controller Integration', () => {
    it('should properly inject all use cases', () => {
      expect(controller).toBeDefined();
      expect(getUserProfileUseCase).toBeDefined();
      expect(createUserProfileUseCase).toBeDefined();
      expect(updateUserProfileUseCase).toBeDefined();
    });

    it('should handle concurrent requests correctly', async () => {
      const userEntity = UserEntity.create({
        name: 'Concurrent User',
        userId: 'auth-user-123',
        financialStage: FinancialStage.START_SAVING,
        onboardingCompletedAt: null,
        currency: Currency.VND,
        language: Language.VI,
        createdAt: mockDate,
        updatedAt: mockDate,
      });

      getUserProfileUseCase.execute.mockResolvedValue(userEntity);

      // Simulate concurrent requests
      const promises = [
        controller.getUserProfile(mockAuthUser),
        controller.getUserProfile(mockAuthUser),
        controller.getUserProfile(mockAuthUser),
      ];

      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      expect(getUserProfileUseCase.execute).toHaveBeenCalledTimes(3);
      results.forEach((result) => {
        expect(result.name).toBe('Concurrent User');
      });
    });

    it('should maintain proper error propagation across all methods', async () => {
      const testError = new Error('Test error');

      getUserProfileUseCase.execute.mockRejectedValue(testError);
      createUserProfileUseCase.execute.mockRejectedValue(testError);
      updateUserProfileUseCase.execute.mockRejectedValue(testError);

      await expect(controller.getUserProfile(mockAuthUser)).rejects.toThrow(
        'Test error',
      );
      await expect(
        controller.createUserProfile(mockAuthUser, { name: 'Test' }),
      ).rejects.toThrow('Test error');
      await expect(
        controller.updateUserProfile(mockAuthUser, { name: 'Test' }),
      ).rejects.toThrow('Test error');
    });
  });

  describe('Authentication Integration', () => {
    it('should extract user ID from AuthUser for all methods', async () => {
      const testUser: AuthUser = {
        id: 'test-auth-user-456',
        email: 'auth-test@example.com',
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated',
        created_at: '2024-01-01T00:00:00Z',
      } as AuthUser;

      const userEntity = UserEntity.create({
        name: 'Auth Test User',
        userId: 'test-auth-user-456',
        financialStage: FinancialStage.START_SAVING,
        onboardingCompletedAt: null,
        currency: Currency.VND,
        language: Language.VI,
        createdAt: mockDate,
        updatedAt: mockDate,
      });

      getUserProfileUseCase.execute.mockResolvedValue(userEntity);
      createUserProfileUseCase.execute.mockResolvedValue(userEntity);
      updateUserProfileUseCase.execute.mockResolvedValue(userEntity);

      // Test getUserProfile
      await controller.getUserProfile(testUser);
      expect(getUserProfileUseCase.execute).toHaveBeenCalledWith(
        'test-auth-user-456',
      );

      // Test createUserProfile
      await controller.createUserProfile(testUser, { name: 'Create Test' });
      expect(createUserProfileUseCase.execute).toHaveBeenCalledWith({
        userId: 'test-auth-user-456',
        profileData: { name: 'Create Test' },
      });

      // Test updateUserProfile
      await controller.updateUserProfile(testUser, { name: 'Update Test' });
      expect(updateUserProfileUseCase.execute).toHaveBeenCalledWith({
        userId: 'test-auth-user-456',
        updates: { name: 'Update Test' },
      });
    });

    it('should handle empty or null user gracefully', async () => {
      const emptyUser = {} as AuthUser;

      // This should handle missing ID by passing undefined to use case
      // The use cases should handle validation
      getUserProfileUseCase.execute.mockResolvedValue(
        UserEntity.create({
          name: 'Test',
          userId: 'test',
          financialStage: null,
          onboardingCompletedAt: null,
          currency: Currency.VND,
          language: Language.VI,
          createdAt: mockDate,
          updatedAt: mockDate,
        }),
      );

      await controller.getUserProfile(emptyUser);
      expect(getUserProfileUseCase.execute).toHaveBeenCalledWith(undefined);
    });
  });
});
