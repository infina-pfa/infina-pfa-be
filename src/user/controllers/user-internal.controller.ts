import { InternalServiceAuthGuard } from '@/common/guards';
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserProfileResponseDto } from '../dto/user-profile.dto';
import { CreateUserProfileUseCase } from '../use-cases/create-user-profile.use-case';
import { GetUserProfileUseCase } from '../use-cases/get-user-profile.use-case';
import { UpdateUserProfileUseCase } from '../use-cases/update-user-profile.use-case';
import { CreateUserProfileDto } from './dto/create-user-profile.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';

@ApiTags('Users')
@Controller('/internal/users')
@UseGuards(InternalServiceAuthGuard)
@ApiBearerAuth('x-api-key')
export class UserInternalController {
  constructor(
    private readonly getUserProfileUseCase: GetUserProfileUseCase,
    private readonly updateUserProfileUseCase: UpdateUserProfileUseCase,
    private readonly createUserProfileUseCase: CreateUserProfileUseCase,
  ) {}

  @Get('profile/:userId')
  @ApiOperation({
    summary: 'Get current user profile',
    description:
      "Retrieve the authenticated user's profile information including financial stage and onboarding status",
  })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
    type: UserProfileResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Authentication required',
  })
  async getUserProfile(
    @Param('userId') userId: string,
  ): Promise<UserProfileResponseDto> {
    const userProfile = await this.getUserProfileUseCase.execute(userId);

    return UserProfileResponseDto.fromEntity(userProfile);
  }

  @Post('profile/:userId')
  @ApiOperation({
    summary: 'Create user profile',
    description:
      'Create a new user profile for the authenticated user with basic information',
  })
  @ApiResponse({
    status: 201,
    description: 'User profile created successfully',
    type: UserProfileResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: 401,
    description: 'Authentication required',
  })
  @ApiResponse({
    status: 409,
    description: 'User profile already exists',
  })
  async createUserProfile(
    @Param('userId') userId: string,
    @Body() createDto: CreateUserProfileDto,
  ): Promise<UserProfileResponseDto> {
    const createdUser = await this.createUserProfileUseCase.execute({
      userId,
      profileData: createDto,
    });

    return UserProfileResponseDto.fromEntity(createdUser);
  }

  @Put('profile/:userId')
  @ApiOperation({
    summary: 'Update user profile',
    description:
      "Update the authenticated user's profile information including name and financial stage",
  })
  @ApiResponse({
    status: 200,
    description: 'User profile updated successfully',
    type: UserProfileResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: 401,
    description: 'Authentication required',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async updateUserProfile(
    @Param('userId') userId: string,
    @Body() updateDto: UpdateUserProfileDto,
  ): Promise<UserProfileResponseDto> {
    const updatedUser = await this.updateUserProfileUseCase.execute({
      userId,
      updates: updateDto,
    });

    return UserProfileResponseDto.fromEntity(updatedUser);
  }
}
