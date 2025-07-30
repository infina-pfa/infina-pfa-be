import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { AuthUser } from '@/common/types/auth-user';
import { Controller, Get } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserProfileResponseDto } from '../dto/user-profile.dto';
import { GetUserProfileUseCase } from '../use-cases/get-user-profile.use-case';

@ApiTags('Users')
@Controller('users')
@ApiBearerAuth()
export class UserController {
  constructor(private readonly getUserProfileUseCase: GetUserProfileUseCase) {}

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
}
