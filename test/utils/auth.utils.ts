/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import * as jwt from 'jsonwebtoken';
import { PrismaClient } from '../../generated/prisma';
import { SupabaseAuthGuard } from '../../src/common/guards/supabase-auth.guard';
import { testConfig } from '../setup/test-environment';
import { v4 as uuidv4 } from 'uuid';

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

export const createTestUser = (): {
  [key: string]: TestUser;
} => {
  return {
    JOHN_DOE: {
      id: uuidv4(),
      email: 'john.doe@test.com',
      name: 'John Doe',
      aud: 'authenticated',
      role: 'authenticated',
    },
    JANE_SMITH: {
      id: uuidv4(),
      email: 'jane.smith@test.com',
      name: 'Jane Smith',
      aud: 'authenticated',
      role: 'authenticated',
    },
    ADMIN_USER: {
      id: uuidv4(),
      email: 'admin@test.com',
      name: 'Admin User',
      aud: 'authenticated',
      role: 'authenticated',
    },
  };
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

  static verifyMockJwtToken(token: string): {
    user: {
      sub: string;
      user_metadata: {
        name: string;
        email: string;
      };
    } | null;
    isValid: boolean;
  } {
    try {
      const decoded = jwt.verify(token, testConfig.jwt.secret);
      return {
        user: decoded as {
          sub: string;
          user_metadata: {
            name: string;
            email: string;
          };
        },
        isValid: true,
      };
    } catch {
      return {
        user: null,
        isValid: false,
      };
    }
  }

  /**
   * Create authorization header for API requests
   */
  static createAuthHeader(user: TestUser): { Authorization: string } {
    return {
      Authorization: `Bearer ${this.createMockJwtToken(user)}`,
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
   * Create a test user in the database (auth.users table only)
   * This is useful for testing profile creation where public.users should not exist yet
   * DON'T USE THIS AND createTestUserInDatabase at the same time
   */
  static async createAuthUserOnly(
    prisma: PrismaClient,
    testUser: TestUser,
  ): Promise<void> {
    try {
      const uniqueEmail = `test-${testUser.id.slice(0, 8)}@random.com`;
      await prisma.auth_users.create({
        data: {
          id: testUser.id,
          email: uniqueEmail,
          aud: testUser.aud,
          role: testUser.role,
          email_confirmed_at: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
          raw_user_meta_data: {
            name: testUser.name,
            email: uniqueEmail,
          },
          raw_app_meta_data: {
            provider: 'email',
            providers: ['email'],
          },
        },
      });
    } catch (error) {
      // Ignore duplicate key errors since we clean up between tests
      if (!error?.message?.includes('duplicate key')) {
        console.error('Error creating auth user:', error);
        throw error;
      }
    }
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
    } catch (error) {
      console.error('Error creating test user:', error);
      throw error;
    }
  }

  /**
   * Clean up test users from database
   */
  static async cleanupTestUsers(
    prisma: PrismaClient,
    testUsers: TestUser[],
  ): Promise<void> {
    try {
      const testUserIds = testUsers.map((user) => user.id);

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
  static async setupTestAuthentication(
    prisma: PrismaClient,
    options: {
      authOnly?: boolean;
    } = {},
  ): Promise<{
    testUsers: { [key: string]: TestUser };
    authHeaders: Record<string, { Authorization: string }>;
  }> {
    // Create test users
    const testUsers = createTestUser();

    // Create test users in database
    for (const testUser of Object.values(testUsers)) {
      if (options.authOnly) {
        await this.createAuthUserOnly(prisma, testUser);
      } else {
        await this.createTestUserInDatabase(prisma, testUser);
      }
    }

    // Create auth headers for each test user
    const authHeaders: Record<string, { Authorization: string }> = {};
    for (const [key, testUser] of Object.entries(testUsers)) {
      authHeaders[key] = this.createAuthHeader(testUser);
    }

    return {
      testUsers,
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
