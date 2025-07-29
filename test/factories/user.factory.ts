import { UserEntity } from '../../src/user/domain/entities/user.entity';

/**
 * Factory for creating consistent user test data
 */
export class UserFactory {
  /**
   * Create a user entity with default test values
   */
  static create(
    overrides: Partial<{
      id: string;
      userId: string;
      name: string;
      onboardingCompletedAt: Date | null;
      financialStage: string | null;
      createdAt: Date;
      updatedAt: Date;
    }> = {},
  ): UserEntity {
    const defaults = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId: 'test-user-john-doe-uuid',
      name: 'Test User',
      onboardingCompletedAt: new Date(),
      financialStage: 'start_saving',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const userData = { ...defaults, ...overrides };

    return UserEntity.create(
      {
        user_id: userData.userId,
        name: userData.name,
        financial_stage: userData.financialStage,
        onboarding_completed_at: userData.onboardingCompletedAt,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt,
      },
      defaults.id,
    );
  }

  /**
   * Create user data for direct database insertion (public.users table)
   */
  static createDatabaseData(
    overrides: Partial<{
      id: string;
      user_id: string;
      name: string;
      onboarding_completed_at: Date | null;
      financial_stage: string | null;
      created_at: Date;
      updated_at: Date;
    }> = {},
  ) {
    const defaults = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      user_id: 'test-user-john-doe-uuid',
      name: 'Test User',
      onboarding_completed_at: new Date(),
      financial_stage: 'building_foundation',
      created_at: new Date(),
      updated_at: new Date(),
    };

    return { ...defaults, ...overrides };
  }

  /**
   * Create auth user data for direct database insertion (auth.users table)
   */
  static createAuthUserData(
    overrides: Partial<{
      id: string;
      email: string;
      aud: string;
      role: string;
      email_confirmed_at: Date;
      confirmed_at: Date;
      created_at: Date;
      updated_at: Date;
      raw_user_meta_data: object;
      raw_app_meta_data: object;
    }> = {},
  ) {
    const defaults = {
      id: 'test-user-john-doe-uuid',
      email: 'john.doe@test.com',
      aud: 'authenticated',
      role: 'authenticated',
      email_confirmed_at: new Date(),
      confirmed_at: new Date(),
      created_at: new Date(),
      updated_at: new Date(),
      raw_user_meta_data: {
        name: 'Test User',
        email: 'john.doe@test.com',
      },
      raw_app_meta_data: {
        provider: 'email',
        providers: ['email'],
      },
    };

    return { ...defaults, ...overrides };
  }

  /**
   * Create a new user (just started)
   */
  static createNewUser(
    userId: string,
    email: string,
    name: string,
  ): UserEntity {
    return this.create({
      userId,
      name,
      onboardingCompletedAt: null,
      financialStage: null,
    });
  }

  /**
   * Create an onboarded user
   */
  static createOnboardedUser(
    userId: string,
    email: string,
    name: string,
  ): UserEntity {
    return this.create({
      userId,
      name,
      onboardingCompletedAt: new Date(),
      financialStage: 'building_foundation',
    });
  }

  /**
   * Create an experienced user
   */
  static createExperiencedUser(
    userId: string,
    email: string,
    name: string,
  ): UserEntity {
    return this.create({
      userId,
      name,
      onboardingCompletedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 days ago
      financialStage: 'growing_wealth',
    });
  }

  /**
   * Create multiple users with different stages
   */
  static createUsersWithDifferentStages(): UserEntity[] {
    const stages = [
      'building_foundation',
      'growing_wealth',
      'securing_future',
      'financial_independence',
    ];

    return stages.map((stage, index) =>
      this.create({
        userId: `test-user-${stage}-uuid`,
        name: `User ${index + 1}`,
        financialStage: stage,
        onboardingCompletedAt: new Date(
          Date.now() - (index + 1) * 30 * 24 * 60 * 60 * 1000,
        ),
      }),
    );
  }

  /**
   * Create onboarding profile data
   */
  static createOnboardingProfileData(
    overrides: Partial<{
      id: string;
      user_id: string;
      profile_data: object;
      is_completed: boolean;
      completed_at: Date | null;
      expense: number | null;
      income: number | null;
      created_at: Date;
      updated_at: Date;
    }> = {},
  ) {
    const defaults = {
      id: `onboarding-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      user_id: 'test-user-john-doe-uuid',
      profile_data: {
        age: 28,
        occupation: 'Software Developer',
        financial_goals: ['emergency_fund', 'home_purchase'],
        risk_tolerance: 'moderate',
        budgeting_style: 'detail_tracker',
      },
      is_completed: true,
      completed_at: new Date(),
      expense: 2500,
      income: 4000,
      created_at: new Date(),
      updated_at: new Date(),
    };

    return { ...defaults, ...overrides };
  }

  /**
   * Create a complete user setup (auth user + public user + onboarding)
   */
  static createCompleteUserSetup(overrides: {
    userId: string;
    email: string;
    name: string;
  }) {
    return {
      authUser: this.createAuthUserData({
        id: overrides.userId,
        email: overrides.email,
        raw_user_meta_data: {
          name: overrides.name,
          email: overrides.email,
        },
      }),
      publicUser: this.createDatabaseData({
        user_id: overrides.userId,
        name: overrides.name,
      }),
      onboardingProfile: this.createOnboardingProfileData({
        user_id: overrides.userId,
      }),
    };
  }
}
