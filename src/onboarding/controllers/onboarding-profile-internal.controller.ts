import { InternalServiceAuthGuard } from '@/common/guards';
import { Body, Controller, Get, Patch, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  GetOnboardingProfileUseCase,
  UpdateOnboardingProfileUseCase,
} from '../use-cases';
import {
  OnboardingProfileResponseDto,
  UpdateOnboardingProfileDto,
} from './dto';

@ApiTags('Onboarding Profiles')
@ApiBearerAuth('x-api-key')
@Controller('internal/onboarding/profile')
@UseGuards(InternalServiceAuthGuard)
export class OnboardingProfileInternalController {
  constructor(
    private readonly updateOnboardingProfileUseCase: UpdateOnboardingProfileUseCase,
    private readonly getOnboardingProfileUseCase: GetOnboardingProfileUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get onboarding profile for the current user' })
  @ApiResponse({
    status: 200,
    description: 'Onboarding profile retrieved successfully',
    type: OnboardingProfileResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Onboarding profile not found' })
  async getProfile(
    @Query('userId') userId: string,
  ): Promise<OnboardingProfileResponseDto> {
    const profile = await this.getOnboardingProfileUseCase.execute({
      userId,
    });

    return OnboardingProfileResponseDto.fromEntity(profile);
  }

  @Patch()
  @ApiOperation({ summary: 'Update onboarding profile' })
  @ApiResponse({
    status: 200,
    description: 'Onboarding profile updated successfully',
    type: OnboardingProfileResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Onboarding profile not found' })
  async updateProfile(
    @Body() updateProfileDto: UpdateOnboardingProfileDto,
    @Query('userId') userId: string,
  ): Promise<OnboardingProfileResponseDto> {
    const profile = await this.updateOnboardingProfileUseCase.execute({
      ...updateProfileDto,
      userId,
    });

    return OnboardingProfileResponseDto.fromEntity(profile);
  }
}
