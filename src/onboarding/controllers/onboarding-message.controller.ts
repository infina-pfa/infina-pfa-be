import { CurrentUser } from '@/common/decorators';
import { SupabaseAuthGuard } from '@/common/guards';
import { AuthUser } from '@/common/types';
import { Body, Controller, Get, Post, Res, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';
import { OnboardingAiAdvisorService, OnboardingMessageSender } from '../domain';
import {
  CreateOnboardingMessageUseCase,
  GetOnboardingMessagesUseCase,
} from '../use-cases';
import {
  CreateOnboardingMessageDto,
  OnboardingMessageResponseDto,
} from './dto';
import { StreamOnboardingMessageDto } from './dto/stream-onboarding-message.dto';

@ApiTags('Onboarding Messages')
@ApiBearerAuth()
@Controller('onboarding/messages')
@UseGuards(SupabaseAuthGuard)
export class OnboardingMessageController {
  constructor(
    private readonly onboardingAiAdvisorService: OnboardingAiAdvisorService,
    private readonly getOnboardingMessagesUseCase: GetOnboardingMessagesUseCase,
    private readonly createOnboardingMessageUseCase: CreateOnboardingMessageUseCase,
  ) {}

  @Post('stream')
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
  async stream(
    @Body() createMessageDto: StreamOnboardingMessageDto,
    @CurrentUser() user: AuthUser,
    @Res() res: Response,
  ): Promise<void> {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    await this.onboardingAiAdvisorService.stream(
      user.id,
      createMessageDto.content,
      {
        onData: (chunk) => {
          res.write(chunk);
        },
        onEnd: () => {
          res.end();
        },
        onError: (error) => {
          res.status(500).send(error.message);
        },
      },
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get onboarding messages for the current user' })
  @ApiQuery({
    name: 'sender',
    required: false,
    enum: OnboardingMessageSender,
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
    return OnboardingMessageResponseDto.fromEntity(
      await this.createOnboardingMessageUseCase.execute({
        userId: user.id,
        content: createMessageDto.content,
        sender: createMessageDto.sender,
        componentId: createMessageDto.component_id,
        metadata: createMessageDto.metadata,
      }),
    );
  }
}
