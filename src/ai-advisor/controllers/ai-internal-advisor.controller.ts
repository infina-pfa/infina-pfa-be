import { CurrentUser } from '@/common/decorators';
import { InternalServiceAuthGuard } from '@/common/guards';
import { ImageValidationPipe } from '@/common/pipes';
import { AuthUser } from '@/common/types';
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
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
  GetConversationUseCase,
  GetMessagesUseCase,
  GetUserFinancialActionUseCase,
  UploadImageUseCase,
} from '../use-cases';
import { ConversationDto } from './dto/conversation.dto';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { MessageDto } from './dto/message.dto';
import { SpeechToTextResponseDto } from './dto/speech-to-text.dto';
import { StreamMessageDto } from './dto/stream-message.dto';
import { UploadImageDto, UploadImageResponseDto } from './dto/upload-image.dto';
import { UserFinancialActionDto } from './dto/user-financial-action.dto';

@ApiTags('AI Advisor')
@ApiBearerAuth('x-api-key')
@Controller('internal/ai-advisor')
@UseGuards(InternalServiceAuthGuard)
export class AiInternalAdvisorController {
  constructor(
    private readonly createConversationUseCase: CreateConversationUseCase,
    private readonly getConversationUseCase: GetConversationUseCase,
    private readonly aiAdvisorService: AiAdvisorService,
    private readonly getMessagesUseCase: GetMessagesUseCase,
    private readonly getUserFinancialActionUseCase: GetUserFinancialActionUseCase,
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
    @Query('user_id') userId: string,
  ): Promise<ConversationDto> {
    const conversation = await this.createConversationUseCase.execute({
      userId,
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
      {
        sender: createMessageDto.sender,
        conversationId,
        message: createMessageDto.content,
        imageUrls: createMessageDto.imageUrls,
      },
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

  @Get('user-financial-action')
  @ApiOperation({ summary: 'Get user financial action' })
  @ApiResponse({
    status: 200,
    description: 'User financial action retrieved successfully',
    type: UserFinancialActionDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 404,
    description: 'User not found or onboarding profile not found',
  })
  async getUserFinancialAction(
    @Query('user_id') userId: string,
  ): Promise<UserFinancialActionDto> {
    return await this.getUserFinancialActionUseCase.execute({
      userId,
    });
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
    @Query('user_id') userId: string,
  ): Promise<UploadImageResponseDto> {
    return await this.uploadImageUseCase.execute({
      conversationId,
      file,
      userId,
    });
  }

  @Post('speech-to-text')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Convert speech to text' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Audio file to transcribe',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Audio successfully transcribed',
    type: SpeechToTextResponseDto,
  })
  async speechToText(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<SpeechToTextResponseDto> {
    const result = await this.aiAdvisorService.speechToText(file);
    return {
      text: result,
    };
  }
}
