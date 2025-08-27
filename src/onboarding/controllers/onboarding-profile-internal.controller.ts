import { InternalServiceAuthGuard } from '@/common/guards';
import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  GetOnboardingProfileUseCase,
  MonthlyResetPyfMetadataUseCase,
  UpdateOnboardingProfileUseCase,
} from '../use-cases';
import {
  OnboardingInternalProfileResponseDto,
  OnboardingProfileResponseDto,
  UpdateOnboardingProfileInternalDto,
} from './dto';
import { UserFinancialInfoService } from '../domain';

@ApiTags('Onboarding Profiles')
@ApiBearerAuth('x-api-key')
@Controller('internal/onboarding/profile')
@UseGuards(InternalServiceAuthGuard)
export class OnboardingProfileInternalController {
  constructor(
    private readonly updateOnboardingProfileUseCase: UpdateOnboardingProfileUseCase,
    private readonly getOnboardingProfileUseCase: GetOnboardingProfileUseCase,
    private readonly userFinancialInfoService: UserFinancialInfoService,
    private readonly monthlyResetPyfMetadataUseCase: MonthlyResetPyfMetadataUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get onboarding profile for the current user' })
  @ApiResponse({
    status: 200,
    description: 'Onboarding profile retrieved successfully',
    type: OnboardingInternalProfileResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Onboarding profile not found' })
  async getProfile(
    @Query('userId') userId: string,
  ): Promise<OnboardingInternalProfileResponseDto> {
    const profile = await this.getOnboardingProfileUseCase.execute({
      userId,
    });

    const remainingFreeToSpendThisWeek =
      await this.userFinancialInfoService.getThisWeekAllowance(userId);

    return OnboardingInternalProfileResponseDto.fromEntityAndExtra(profile, {
      remainingFreeToSpendThisWeek,
    });
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
    @Body() updateProfileDto: UpdateOnboardingProfileInternalDto,
    @Query('userId') userId: string,
  ): Promise<OnboardingProfileResponseDto> {
    const profile = await this.updateOnboardingProfileUseCase.execute({
      ...updateProfileDto,
      userId,
    });

    return OnboardingProfileResponseDto.fromEntity(profile);
  }

  @Post('monthly-reset-pyf-metadata')
  @ApiOperation({ summary: 'Reset Pyf metadata for all users' })
  @ApiResponse({ status: 201, description: 'Pyf metadata reset successfully' })
  async monthlyResetPyfMetadata(): Promise<void> {
    await this.monthlyResetPyfMetadataUseCase.execute();
  }
}
