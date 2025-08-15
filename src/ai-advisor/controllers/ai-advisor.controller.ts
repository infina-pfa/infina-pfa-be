import { CurrentUser } from '@/common/decorators';
import { SupabaseAuthGuard } from '@/common/guards';
import { ImageValidationPipe } from '@/common/pipes';
import { AuthUser } from '@/common/types';
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
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
  GetStartMessageUseCase,
} from '../use-cases';
import { UploadImageUseCase } from '../use-cases/upload-image.use-case';
import { ConversationDto } from './dto/conversation.dto';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { MessageDto } from './dto/message.dto';
import { StreamMessageDto } from './dto/stream-message.dto';
import { UploadImageDto, UploadImageResponseDto } from './dto/upload-image.dto';

@ApiTags('AI Advisor')
@ApiBearerAuth()
@Controller('ai-advisor')
@UseGuards(SupabaseAuthGuard)
export class AiAdvisorController {
  constructor(
    private readonly createConversationUseCase: CreateConversationUseCase,
    private readonly getConversationUseCase: GetConversationUseCase,
    private readonly aiAdvisorService: AiAdvisorService,
    private readonly getMessagesUseCase: GetMessagesUseCase,
    private readonly createMessageUseCase: CreateMessageUseCase,
    private readonly getStartMessageUseCase: GetStartMessageUseCase,
    private readonly uploadImageUseCase: UploadImageUseCase,
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

  @Post('conversations/:id/stream')
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
    @CurrentUser() user: AuthUser,
    @Res() res: Response,
  ): Promise<void> {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    await this.aiAdvisorService.stream(
      user.id,
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

  @Post('conversations/:id/messages')
  @ApiOperation({ summary: 'Create a new message in a conversation' })
  @ApiResponse({
    status: 201,
    description: 'Message created successfully',
    type: MessageDto,
  })
  async createMessage(
    @Body() createMessageDto: CreateMessageDto,
    @Param('id') conversationId: string,
    @CurrentUser() user: AuthUser,
  ): Promise<MessageDto> {
    const message = await this.createMessageUseCase.execute({
      conversationId,
      userId: user.id,
      sender: createMessageDto.sender,
      content: createMessageDto.content || null,
      type: createMessageDto.type,
      metadata: createMessageDto.metadata,
    });

    return MessageDto.fromEntity(message);
  }

  @Get('start-message')
  @ApiOperation({ summary: 'Get the start message for the user' })
  @ApiResponse({
    status: 200,
    description: 'Start message retrieved successfully',
    type: String,
  })
  async getStartMessage(@CurrentUser() user: AuthUser): Promise<string> {
    return this.getStartMessageUseCase.execute({ userId: user.id });
  }

  @Post('conversations/:id/upload-image')
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({ summary: 'Upload an image for a conversation' })
  @ApiParam({ name: 'id', description: 'Conversation ID' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadImageDto })
  @ApiResponse({
    status: 201,
    description: 'Image uploaded successfully',
    type: UploadImageResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid file type or size' })
  @ApiResponse({ status: 401, description: 'User not authenticated' })
  @ApiResponse({ status: 404, description: 'Conversation not found' })
  async uploadImage(
    @Param('id') conversationId: string,
    @UploadedFile(new ImageValidationPipe()) file: Express.Multer.File,
    @CurrentUser() user: AuthUser,
  ): Promise<UploadImageResponseDto> {
    return await this.uploadImageUseCase.execute({
      conversationId,
      file,
      userId: user.id,
    });
  }
}
