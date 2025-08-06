import { CurrentUser } from '@/common/decorators';
import { SupabaseAuthGuard } from '@/common/guards';
import { AuthUser } from '@/common/types';
import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  CreateConversationUseCase,
  CreateMessageUseCase,
  GetConversationUseCase,
  GetMessagesUseCase,
} from '../use-cases';
import { ConversationDto } from './dto/conversation.dto';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { MessageDto } from './dto/message.dto';

@ApiTags('AI Advisor')
@ApiBearerAuth()
@Controller('ai-advisor')
@UseGuards(SupabaseAuthGuard)
export class AiAdvisorController {
  constructor(
    private readonly createConversationUseCase: CreateConversationUseCase,
    private readonly getConversationUseCase: GetConversationUseCase,
    private readonly createMessageUseCase: CreateMessageUseCase,
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
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthUser,
  ): Promise<ConversationDto> {
    const conversation = await this.getConversationUseCase.execute({
      conversationId: id,
      userId: user.id,
    });

    return ConversationDto.fromEntity(conversation);
  }

  @Post('messages')
  @ApiOperation({ summary: 'Create a new message in a conversation' })
  @ApiResponse({
    status: 201,
    description: 'Message created successfully',
    type: MessageDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Conversation not found' })
  async createMessage(
    @Body() createMessageDto: CreateMessageDto,
    @CurrentUser() user: AuthUser,
  ): Promise<MessageDto> {
    const message = await this.createMessageUseCase.execute({
      userId: user.id,
      conversationId: createMessageDto.conversationId,
      content: createMessageDto.content,
      metadata: createMessageDto.metadata,
    });

    return MessageDto.fromEntity(message);
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
    @Param('id', ParseUUIDPipe) conversationId: string,
    @CurrentUser() user: AuthUser,
  ): Promise<MessageDto[]> {
    const messages = await this.getMessagesUseCase.execute({
      conversationId,
      userId: user.id,
    });

    return messages.map((message) => MessageDto.fromEntity(message));
  }
}
