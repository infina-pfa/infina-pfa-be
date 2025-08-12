import { CurrentUser } from '@/common/decorators';
import { InternalServiceAuthGuard } from '@/common/guards';
import { AuthUser } from '@/common/types';
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';
import { AiAdvisorService } from '../domain';
import {
  CreateConversationUseCase,
  CreateMessageUseCase,
  GetConversationUseCase,
  GetMessagesUseCase,
} from '../use-cases';
import { ConversationDto } from './dto/conversation.dto';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { MessageDto } from './dto/message.dto';
import { StreamMessageDto } from './dto/stream-message.dto';

@ApiTags('AI Advisor')
@ApiBearerAuth()
@Controller('internal/ai-advisor')
@UseGuards(InternalServiceAuthGuard)
export class AiInternalAdvisorController {
  constructor(
    private readonly createConversationUseCase: CreateConversationUseCase,
    private readonly getConversationUseCase: GetConversationUseCase,
    private readonly createMessageUseCase: CreateMessageUseCase,
    private readonly aiAdvisorService: AiAdvisorService,
    private readonly getMessagesUseCase: GetMessagesUseCase,
  ) {}

  @Post('conversations')
  @ApiOperation({ summary: 'Create a new conversation' })
  @ApiResponse({
    status: 201,
    description: 'Conversation created successfully',
    type: ConversationDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createConversation(
    @Body() createConversationDto: CreateConversationDto,
    @CurrentUser() user: AuthUser,
  ): Promise<ConversationDto> {
    const conversation = await this.createConversationUseCase.execute({
      userId: user.id,
      name: createConversationDto.name,
    });

    return ConversationDto.fromEntity(conversation);
  }

  @Get('conversations/:id')
  @ApiOperation({ summary: 'Get conversation by ID' })
  @ApiParam({ name: 'id', description: 'Conversation ID' })
  @ApiResponse({
    status: 200,
    description: 'Conversation retrieved successfully',
    type: ConversationDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid conversation ID format' })
  @ApiResponse({ status: 401, description: 'User not authenticated' })
  @ApiResponse({ status: 403, description: 'Access denied to conversation' })
  @ApiResponse({ status: 404, description: 'Conversation not found' })
  async getConversation(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
  ): Promise<ConversationDto> {
    const conversation = await this.getConversationUseCase.execute({
      conversationId: id,
      userId: user.id,
    });

    return ConversationDto.fromEntity(conversation);
  }

  @Post('conversations/:id/stream/:user_id')
  @ApiOperation({ summary: 'Create a new message in a conversation' })
  @ApiResponse({
    status: 201,
    description: 'Message created successfully',
    type: MessageDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Conversation not found' })
  async streamMessage(
    @Body() createMessageDto: StreamMessageDto,
    @Param('id') conversationId: string,
    @Param('user_id') userId: string,
    @Res() res: Response,
  ): Promise<void> {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    await this.aiAdvisorService.stream(
      userId,
      createMessageDto.sender,
      conversationId,
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

  @Get('conversations/:id/messages')
  @ApiOperation({ summary: 'Get all messages in a conversation' })
  @ApiParam({ name: 'id', description: 'Conversation ID' })
  @ApiResponse({
    status: 200,
    description: 'Messages retrieved successfully',
    type: [MessageDto],
  })
  @ApiResponse({ status: 400, description: 'Invalid conversation ID format' })
  @ApiResponse({ status: 401, description: 'User not authenticated' })
  @ApiResponse({ status: 403, description: 'Access denied to conversation' })
  @ApiResponse({ status: 404, description: 'Conversation not found' })
  async getMessages(
    @Param('id') conversationId: string,
    @CurrentUser() user: AuthUser,
  ): Promise<MessageDto[]> {
    const messages = await this.getMessagesUseCase.execute({
      conversationId,
      userId: user.id,
    });

    return messages.map((message) => MessageDto.fromEntity(message));
  }
}
