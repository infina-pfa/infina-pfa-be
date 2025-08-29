import { CurrentUser } from '@/common/decorators';
import { SupabaseAuthGuard } from '@/common/guards';
import { AuthUser } from '@/common/types';
import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  CompleteOnboardingUseCase,
  CreateOnboardingProfileUseCase,
  GetOnboardingProfileUseCase,
  StartOverUseCase,
  UpdateOnboardingProfileUseCase,
} from '../use-cases';
import {
  CreateOnboardingProfileDto,
  OnboardingProfileResponseDto,
  UpdateOnboardingProfileDto,
} from './dto';

@ApiTags('Onboarding Profiles')
@ApiBearerAuth()
@Controller('onboarding/profile')
@UseGuards(SupabaseAuthGuard)
export class OnboardingProfileController {
  constructor(
    private readonly createOnboardingProfileUseCase: CreateOnboardingProfileUseCase,
    private readonly updateOnboardingProfileUseCase: UpdateOnboardingProfileUseCase,
    private readonly getOnboardingProfileUseCase: GetOnboardingProfileUseCase,
    private readonly completeOnboardingUseCase: CompleteOnboardingUseCase,
    private readonly startOverUseCase: StartOverUseCase,
  ) {}

  @Post('start-over')
  @ApiOperation({ summary: 'Start over onboarding' })
  @ApiResponse({
    status: 201,
    description: 'Onboarding started over successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Onboarding profile not found' })
  async startOver(@CurrentUser() user: AuthUser): Promise<void> {
    await this.startOverUseCase.execute({ userId: user.id });
  }

  @Post()
  @ApiOperation({ summary: 'Create a new onboarding profile' })
  @ApiResponse({
    status: 201,
    description: 'Onboarding profile created successfully',
    type: OnboardingProfileResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 409,
    description: 'User already has an onboarding profile',
  })
  @ApiResponse({
    status: 422,
    description: 'Financial amounts must be greater than or equal to 0',
  })
  async createProfile(
    @Body() createProfileDto: CreateOnboardingProfileDto,
    @CurrentUser() user: AuthUser,
  ): Promise<OnboardingProfileResponseDto> {
    const profile = await this.createOnboardingProfileUseCase.execute({
      ...createProfileDto,
      userId: user.id,
    });

    return OnboardingProfileResponseDto.fromEntity(profile);
  }

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
    @CurrentUser() user: AuthUser,
  ): Promise<OnboardingProfileResponseDto> {
    const profile = await this.getOnboardingProfileUseCase.execute({
      userId: user.id,
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
  @ApiResponse({
    status: 422,
    description: 'Financial amounts must be greater than or equal to 0',
  })
  async updateProfile(
    @Body() updateProfileDto: UpdateOnboardingProfileDto,
    @CurrentUser() user: AuthUser,
  ): Promise<OnboardingProfileResponseDto> {
    const profile = await this.updateOnboardingProfileUseCase.execute({
      ...updateProfileDto,
      userId: user.id,
    });

    return OnboardingProfileResponseDto.fromEntity(profile);
  }

  @Post('complete')
  @ApiOperation({ summary: 'Complete onboarding profile' })
  @ApiResponse({
    status: 200,
    description: 'Onboarding profile completed successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Onboarding profile not found' })
  async completeProfile(@CurrentUser() user: AuthUser): Promise<void> {
    await this.completeOnboardingUseCase.execute({ userId: user.id });
  }
}
