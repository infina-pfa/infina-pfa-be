import { CurrentUser } from '@/common/decorators';
import { SupabaseAuthGuard } from '@/common/guards';
import { AuthUser } from '@/common/types';
import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { MessageSender } from '../domain';
import {
  CreateOnboardingMessageUseCase,
  GetOnboardingMessagesUseCase,
} from '../use-cases';
import {
  CreateOnboardingMessageDto,
  OnboardingMessageResponseDto,
} from './dto';

@ApiTags('Onboarding Messages')
@ApiBearerAuth()
@Controller('onboarding/messages')
@UseGuards(SupabaseAuthGuard)
export class OnboardingMessageController {
  constructor(
    private readonly createOnboardingMessageUseCase: CreateOnboardingMessageUseCase,
    private readonly getOnboardingMessagesUseCase: GetOnboardingMessagesUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new onboarding message' })
  @ApiResponse({
    status: 201,
    description: 'Onboarding message created successfully',
    type: OnboardingMessageResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid message content or sender',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createMessage(
    @Body() createMessageDto: CreateOnboardingMessageDto,
    @CurrentUser() user: AuthUser,
  ): Promise<OnboardingMessageResponseDto> {
    const message = await this.createOnboardingMessageUseCase.execute({
      ...createMessageDto,
      userId: user.id,
    });

    return OnboardingMessageResponseDto.fromEntity(message);
  }

  @Get()
  @ApiOperation({ summary: 'Get onboarding messages for the current user' })
  @ApiQuery({
    name: 'sender',
    required: false,
    enum: MessageSender,
    description: 'Filter messages by sender',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Limit number of messages (when using latest=true)',
  })
  @ApiQuery({
    name: 'latest',
    required: false,
    type: Boolean,
    description: 'Get latest messages in descending order',
  })
  @ApiResponse({
    status: 200,
    description: 'Onboarding messages retrieved successfully',
    type: [OnboardingMessageResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMessages(
    @CurrentUser() user: AuthUser,
  ): Promise<OnboardingMessageResponseDto[]> {
    const messages = await this.getOnboardingMessagesUseCase.execute({
      userId: user.id,
    });

    return messages.map((message) =>
      OnboardingMessageResponseDto.fromEntity(message),
    );
  }
}
