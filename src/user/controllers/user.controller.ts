import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { AuthUser } from '@/common/types/auth-user';
import { Body, Controller, Get, Put } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserProfileResponseDto } from '../dto/user-profile.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { GetUserProfileUseCase } from '../use-cases/get-user-profile.use-case';
import { UpdateUserProfileUseCase } from '../use-cases/update-user-profile.use-case';

@ApiTags('Users')
@Controller('users')
@ApiBearerAuth()
export class UserController {
  constructor(
    private readonly getUserProfileUseCase: GetUserProfileUseCase,
    private readonly updateUserProfileUseCase: UpdateUserProfileUseCase,
  ) {}

  @Get('profile')
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
    @CurrentUser() user: AuthUser,
  ): Promise<UserProfileResponseDto> {
    const userProfile = await this.getUserProfileUseCase.execute(user.id);

    return UserProfileResponseDto.fromEntity(userProfile);
  }

  @Put('profile')
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
    @CurrentUser() user: AuthUser,
    @Body() updateDto: UpdateUserProfileDto,
  ): Promise<UserProfileResponseDto> {
    const updatedUser = await this.updateUserProfileUseCase.execute({
      userId: user.id,
      updates: updateDto,
    });

    return UserProfileResponseDto.fromEntity(updatedUser);
  }
}
