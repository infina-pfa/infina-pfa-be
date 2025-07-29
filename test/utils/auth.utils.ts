/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { testConfig } from '../setup/test-environment';
import * as jwt from 'jsonwebtoken';
import { PrismaClient } from '../../generated/prisma';
import { SupabaseAuthGuard } from '../../src/common/guards/supabase-auth.guard';
import { v4 as uuid } from 'uuid';

/**
 * Mock user data for testing
 */
export interface TestUser {
  id: string;
  email: string;
  name?: string;
  aud: string;
  role: string;
}

/**
 * Default test users for consistent testing
 */
export const TEST_USERS: Record<string, TestUser> = {
  JOHN_DOE: {
    id: uuid(),
    email: 'john.doe@test.com',
    name: 'John Doe',
    aud: 'authenticated',
    role: 'authenticated',
  },
  // JANE_SMITH: {
  //   id: uuid(),
  //   email: 'jane.smith@test.com',
  //   name: 'Jane Smith',
  //   aud: 'authenticated',
  //   role: 'authenticated',
  // },
  // ADMIN_USER: {
  //   id: uuid(),
  //   email: 'admin@test.com',
  //   name: 'Admin User',
  //   aud: 'authenticated',
  //   role: 'authenticated',
  // },
};

/**
 * Authentication test utilities
 */
export class AuthTestUtils {
  private static supabaseClient: SupabaseClient;

  /**
   * Initialize Supabase client for testing
   */
  static getSupabaseClient(): SupabaseClient {
    if (!this.supabaseClient) {
      this.supabaseClient = createClient(
        testConfig.supabase.url,
        testConfig.supabase.anonKey,
      );
    }
    return this.supabaseClient;
  }

  /**
   * Create a mock JWT token for testing
   * This creates a token that bypasses Supabase auth validation for tests
   */
  static createMockJwtToken(user: TestUser): string {
    const payload = {
      aud: user.aud,
      exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
      iat: Math.floor(Date.now() / 1000),
      iss: 'supabase-demo',
      sub: user.id,
      email: user.email,
      role: user.role,
      user_metadata: {
        name: user.name,
        email: user.email,
      },
      app_metadata: {
        provider: 'email',
        providers: ['email'],
      },
    };

    return jwt.sign(payload, testConfig.jwt.secret);
  }

  /**
   * Create authorization header for API requests
   */
  static createAuthHeader(user: TestUser): { Authorization: string } {
    const token = this.createMockJwtToken(user);
    return {
      Authorization: `Bearer ${token}`,
    };
  }

  /**
   * Create a mock Supabase User object for testing
   */
  static createMockSupabaseUser(testUser: TestUser): User {
    return {
      id: testUser.id,
      aud: testUser.aud,
      role: testUser.role,
      email: testUser.email,
      email_confirmed_at: new Date().toISOString(),
      phone: '',
      confirmed_at: new Date().toISOString(),
      last_sign_in_at: new Date().toISOString(),
      app_metadata: {
        provider: 'email',
        providers: ['email'],
      },
      user_metadata: {
        name: testUser.name,
        email: testUser.email,
      },
      identities: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_anonymous: false,
    };
  }

  /**
   * Mock the Supabase Auth Guard for testing
   * This utility helps bypass authentication in integration tests
   */
  static mockSupabaseAuthGuard() {
    const mockGuard = {
      canActivate: jest.fn().mockResolvedValue(true),
    };

    return mockGuard;
  }

  /**
   * Create a test user in the database (auth.users table)
   * This is useful for integration tests that need real user data
   */
  static async createTestUserInDatabase(
    prisma: PrismaClient,
    testUser: TestUser,
  ): Promise<void> {
    try {
      testUser.id = uuid();
      testUser.email = `test-${testUser.id.slice(0, 8)}@random.com`;
      await prisma.auth_users.create({
        data: {
          id: testUser.id,
          email: testUser.email,
          aud: testUser.aud,
          role: testUser.role,
          email_confirmed_at: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
          raw_user_meta_data: {
            name: testUser.name,
            email: testUser.email,
          },
          raw_app_meta_data: {
            provider: 'email',
            providers: ['email'],
          },
        },
      });

      // Also create corresponding public.users record
      await prisma.public_users.create({
        data: {
          user_id: testUser.id,
          name: testUser.name || testUser.email,
          created_at: new Date(),
          updated_at: new Date(),
        },
      });

      console.log(`Test user created: ${testUser.email} (${testUser.id})`);
    } catch (error) {
      console.error('Error creating test user:', error);
      throw error;
    }
  }

  /**
   * Clean up test users from database
   */
  static async cleanupTestUsers(prisma: PrismaClient): Promise<void> {
    try {
      const testUserIds = Object.values(TEST_USERS).map((user) => user.id);

      // Clean up in correct order due to foreign key constraints
      await prisma.public_users.deleteMany({
        where: {
          user_id: {
            in: testUserIds,
          },
        },
      });

      await prisma.auth_users.deleteMany({
        where: {
          id: {
            in: testUserIds,
          },
        },
      });

      console.log('Test users cleaned up');
    } catch (error) {
      console.error('Error cleaning up test users:', error);
      throw error;
    }
  }

  /**
   * Setup test authentication for a specific test suite
   * This creates test users and returns authorization headers
   */
  static async setupTestAuthentication(prisma: PrismaClient): Promise<{
    users: typeof TEST_USERS;
    authHeaders: Record<string, { Authorization: string }>;
  }> {
    // Create test users in database
    for (const testUser of Object.values(TEST_USERS)) {
      await this.createTestUserInDatabase(prisma, testUser);
    }

    // Create auth headers for each test user
    const authHeaders: Record<string, { Authorization: string }> = {};
    for (const [key, testUser] of Object.entries(TEST_USERS)) {
      authHeaders[key] = this.createAuthHeader(testUser);
    }

    return {
      users: TEST_USERS,
      authHeaders,
    };
  }
}

/**
 * Decorator to bypass authentication in integration tests
 * Use this in test modules where you want to mock authentication
 */
export const mockAuthenticationForTesting = (testingModule: any) => {
  const mockGuard = AuthTestUtils.mockSupabaseAuthGuard();

  // Override the SupabaseAuthGuard with our mock
  testingModule.overrideGuard(SupabaseAuthGuard).useValue(mockGuard);

  return testingModule;
};
