import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, BadRequestException } from '@nestjs/common';
import {
  CreateGoalUseCase,
  CreateGoalUseCaseInput,
} from '../create-goal.use-case';
import { GoalAggregateRepository, GoalErrorFactory } from '@/goals/domain';
import { CurrencyVO } from '@/common/base';

describe('CreateGoalUseCase', () => {
  let useCase: CreateGoalUseCase;
  let goalAggregateRepository: jest.Mocked<GoalAggregateRepository>;

  beforeEach(async () => {
    const goalAggregateRepositoryMock = {
      findOne: jest.fn(),
      save: jest.fn(),
      findById: jest.fn(),
      findMany: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateGoalUseCase,
        {
          provide: GoalAggregateRepository,
          useValue: goalAggregateRepositoryMock,
        },
      ],
    }).compile();

    useCase = module.get<CreateGoalUseCase>(CreateGoalUseCase);
    goalAggregateRepository = module.get(GoalAggregateRepository);
  });

  describe('execute', () => {
    const validInput: CreateGoalUseCaseInput = {
      userId: 'user-123',
      title: 'Save for vacation',
      description: 'Save money for a vacation to Japan',
      targetAmount: 5000,
      dueDate: new Date('2025-12-31'),
    };

    it('should create a goal successfully', async () => {
      // Arrange
      goalAggregateRepository.findOne.mockResolvedValue(null);
      goalAggregateRepository.save.mockResolvedValue(undefined);

      // Act
      const result = await useCase.execute(validInput);

      // Assert
      expect(goalAggregateRepository.findOne).toHaveBeenCalledWith({
        title: validInput.title,
        userId: validInput.userId,
      });
      expect(goalAggregateRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          props: expect.objectContaining({
            goal: expect.objectContaining({
              props: expect.objectContaining({
                userId: validInput.userId,
                title: validInput.title,
                description: validInput.description,
                targetAmount: validInput.targetAmount
                  ? new CurrencyVO(validInput.targetAmount)
                  : undefined,
                dueDate: validInput.dueDate,
              }),
            }),
            contributions: expect.objectContaining({
              items: [],
            }),
          }),
        }),
      );
      expect(result).toBeDefined();
      expect(result.props.goal.props.title).toBe(validInput.title);
    });

    it('should throw ConflictException when goal title already exists', async () => {
      // Arrange
      const existingGoal = {} as any; // Mock existing goal
      goalAggregateRepository.findOne.mockResolvedValue(existingGoal);

      // Act & Assert
      await expect(useCase.execute(validInput)).rejects.toThrow(
        GoalErrorFactory.goalTitleAlreadyExists(validInput.title),
      );
      expect(goalAggregateRepository.save).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when target amount is negative', async () => {
      // Arrange
      goalAggregateRepository.findOne.mockResolvedValue(null);
      const invalidInput = { ...validInput, targetAmount: -100 };

      // Act & Assert
      await expect(useCase.execute(invalidInput)).rejects.toThrow(
        GoalErrorFactory.goalInvalidTargetAmount(),
      );
      expect(goalAggregateRepository.save).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when target amount is zero', async () => {
      // Arrange
      goalAggregateRepository.findOne.mockResolvedValue(null);
      const invalidInput = { ...validInput, targetAmount: 0 };

      // Act & Assert
      await expect(useCase.execute(invalidInput)).rejects.toThrow(
        GoalErrorFactory.goalInvalidTargetAmount(),
      );
      expect(goalAggregateRepository.save).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when due date is in the past', async () => {
      // Arrange
      goalAggregateRepository.findOne.mockResolvedValue(null);
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      const invalidInput = { ...validInput, dueDate: pastDate };

      // Act & Assert
      await expect(useCase.execute(invalidInput)).rejects.toThrow(
        GoalErrorFactory.goalInvalidDueDate(),
      );
      expect(goalAggregateRepository.save).not.toHaveBeenCalled();
    });

    it('should create goal without target amount', async () => {
      // Arrange
      goalAggregateRepository.findOne.mockResolvedValue(null);
      goalAggregateRepository.save.mockResolvedValue(undefined);
      const inputWithoutTarget = { ...validInput };
      delete inputWithoutTarget.targetAmount;

      // Act
      const result = await useCase.execute(inputWithoutTarget);

      // Assert
      expect(result.props.goal.props.targetAmount).toBeUndefined();
      expect(goalAggregateRepository.save).toHaveBeenCalled();
    });

    it('should create goal without due date', async () => {
      // Arrange
      goalAggregateRepository.findOne.mockResolvedValue(null);
      goalAggregateRepository.save.mockResolvedValue(undefined);
      const inputWithoutDueDate = { ...validInput };
      delete inputWithoutDueDate.dueDate;

      // Act
      const result = await useCase.execute(inputWithoutDueDate);

      // Assert
      expect(result.props.goal.props.dueDate).toBeUndefined();
      expect(goalAggregateRepository.save).toHaveBeenCalled();
    });

    it('should create goal with minimal required fields only', async () => {
      // Arrange
      goalAggregateRepository.findOne.mockResolvedValue(null);
      goalAggregateRepository.save.mockResolvedValue(undefined);
      const minimalInput = {
        userId: 'user-123',
        title: 'Minimal Goal',
      };

      // Act
      const result = await useCase.execute(minimalInput);

      // Assert
      expect(result.props.goal.props.userId).toBe(minimalInput.userId);
      expect(result.props.goal.props.title).toBe(minimalInput.title);
      expect(result.props.goal.props.description).toBeUndefined();
      expect(result.props.goal.props.targetAmount).toBeUndefined();
      expect(result.props.goal.props.dueDate).toBeUndefined();
      expect(result.props.goal.props.currentAmount.value).toBe(0);
      expect(result.props.contributions.items).toEqual([]);
      expect(goalAggregateRepository.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException when due date is exactly current time', async () => {
      // Arrange
      goalAggregateRepository.findOne.mockResolvedValue(null);
      const currentDate = new Date();
      const invalidInput = { ...validInput, dueDate: currentDate };

      // Act & Assert
      await expect(useCase.execute(invalidInput)).rejects.toThrow(
        GoalErrorFactory.goalInvalidDueDate(),
      );
      expect(goalAggregateRepository.save).not.toHaveBeenCalled();
    });

    it('should successfully create goal with due date 1 millisecond in the future', async () => {
      // Arrange
      goalAggregateRepository.findOne.mockResolvedValue(null);
      goalAggregateRepository.save.mockResolvedValue(undefined);
      const futureDate = new Date(Date.now() + 1);
      const validFutureInput = { ...validInput, dueDate: futureDate };

      // Act
      const result = await useCase.execute(validFutureInput);

      // Assert
      expect(result.props.goal.props.dueDate).toEqual(futureDate);
      expect(goalAggregateRepository.save).toHaveBeenCalled();
    });

    it('should handle repository findOne error and rethrow', async () => {
      // Arrange
      const repositoryError = new Error('Database connection failed');
      goalAggregateRepository.findOne.mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(useCase.execute(validInput)).rejects.toThrow(
        repositoryError,
      );
      expect(goalAggregateRepository.save).not.toHaveBeenCalled();
    });

    it('should handle repository save error and rethrow', async () => {
      // Arrange
      goalAggregateRepository.findOne.mockResolvedValue(null);
      const repositoryError = new Error('Database save failed');
      goalAggregateRepository.save.mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(useCase.execute(validInput)).rejects.toThrow(
        repositoryError,
      );
      expect(goalAggregateRepository.findOne).toHaveBeenCalled();
    });

    it('should verify proper aggregate structure with computed properties', async () => {
      // Arrange
      goalAggregateRepository.findOne.mockResolvedValue(null);
      goalAggregateRepository.save.mockResolvedValue(undefined);

      // Act
      const result = await useCase.execute(validInput);

      // Assert - Verify GoalAggregate structure
      expect(result).toBeInstanceOf(Object);
      expect(result.props).toBeDefined();
      expect(result.props.goal).toBeDefined();
      expect(result.props.contributions).toBeDefined();

      // Verify goal properties
      expect(result.props.goal.props.userId).toBe(validInput.userId);
      expect(result.props.goal.props.title).toBe(validInput.title);
      expect(result.props.goal.props.description).toBe(validInput.description);
      expect(result.props.goal.props.targetAmount).toEqual(
        new CurrencyVO(validInput.targetAmount!),
      );
      expect(result.props.goal.props.dueDate).toBe(validInput.dueDate);
      expect(result.props.goal.props.currentAmount).toEqual(new CurrencyVO(0));

      // Verify empty contributions list
      expect(result.props.contributions.items).toEqual([]);

      // Verify timestamps are set
      expect(result.props.createdAt).toBeInstanceOf(Date);
      expect(result.props.updatedAt).toBeInstanceOf(Date);
    });

    it('should validate exact repository method calls', async () => {
      // Arrange
      goalAggregateRepository.findOne.mockResolvedValue(null);
      goalAggregateRepository.save.mockResolvedValue(undefined);

      // Act
      await useCase.execute(validInput);

      // Assert - Verify exact method calls
      expect(goalAggregateRepository.findOne).toHaveBeenCalledTimes(1);
      expect(goalAggregateRepository.findOne).toHaveBeenCalledWith({
        title: validInput.title,
        userId: validInput.userId,
      });

      expect(goalAggregateRepository.save).toHaveBeenCalledTimes(1);
      expect(goalAggregateRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          props: expect.objectContaining({
            goal: expect.objectContaining({
              props: expect.objectContaining({
                userId: validInput.userId,
                title: validInput.title,
                description: validInput.description,
                targetAmount: new CurrencyVO(validInput.targetAmount!),
                dueDate: validInput.dueDate,
                currentAmount: new CurrencyVO(0),
              }),
            }),
            contributions: expect.objectContaining({
              items: [],
            }),
          }),
        }),
      );
    });

    it('should handle very large target amounts', async () => {
      // Arrange
      goalAggregateRepository.findOne.mockResolvedValue(null);
      goalAggregateRepository.save.mockResolvedValue(undefined);
      const largeAmountInput = {
        ...validInput,
        targetAmount: Number.MAX_SAFE_INTEGER,
      };

      // Act
      const result = await useCase.execute(largeAmountInput);

      // Assert
      expect(result.props.goal.props.targetAmount!.value).toBe(
        Number.MAX_SAFE_INTEGER,
      );
      expect(goalAggregateRepository.save).toHaveBeenCalled();
    });

    it('should handle edge case target amount of 0.01', async () => {
      // Arrange
      goalAggregateRepository.findOne.mockResolvedValue(null);
      goalAggregateRepository.save.mockResolvedValue(undefined);
      const smallAmountInput = { ...validInput, targetAmount: 0.01 };

      // Act
      const result = await useCase.execute(smallAmountInput);

      // Assert
      expect(result.props.goal.props.targetAmount!.value).toBe(0.01);
      expect(goalAggregateRepository.save).toHaveBeenCalled();
    });

    it('should reject decimal values very close to zero but negative', async () => {
      // Arrange
      goalAggregateRepository.findOne.mockResolvedValue(null);
      const invalidInput = { ...validInput, targetAmount: -0.01 };

      // Act & Assert
      await expect(useCase.execute(invalidInput)).rejects.toThrow(
        GoalErrorFactory.goalInvalidTargetAmount(),
      );
      expect(goalAggregateRepository.save).not.toHaveBeenCalled();
    });
  });
});
