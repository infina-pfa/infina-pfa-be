import { InternalServiceAuthGuard } from '@/common/guards';
import { Body, Controller, Post, Query, Res, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';
import { OnboardingAiAdvisorService } from '../domain';
import { OnboardingMessageResponseDto } from './dto';
import { StreamOnboardingMessageDto } from './dto/stream-onboarding-message.dto';

@ApiTags('Onboarding Messages')
@ApiBearerAuth('x-api-key')
@Controller('/internal/onboarding/messages')
@UseGuards(InternalServiceAuthGuard)
export class OnboardingMessageInternalController {
  constructor(
    private readonly onboardingAiAdvisorService: OnboardingAiAdvisorService,
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
  @ApiQuery({ name: 'userId', type: String, required: true })
  async stream(
    @Body() createMessageDto: StreamOnboardingMessageDto,
    @Query('userId') userId: string,
    @Res() res: Response,
  ): Promise<void> {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    await this.onboardingAiAdvisorService.stream(
      userId,
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
}
