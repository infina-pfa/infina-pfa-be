/**
 * Test Environment Configuration
 *
 * This module sets up the test environment with appropriate configurations
 * for integration testing with Supabase and Prisma.
 */

export const testConfig = {
  // Database configuration for tests
  database: {
    url:
      process.env.E2E_TEST_DATABASE_URL ||
      'postgresql://postgres:postgres@127.0.0.1:54322/postgres',
  },

  // Supabase configuration for tests (using local Supabase instance)
  supabase: {
    url: process.env.E2E_TEST_SUPABASE_URL || 'http://127.0.0.1:54321',
    anonKey:
      process.env.E2E_TEST_SUPABASE_ANON_KEY ||
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0',
    // Service role key for admin operations in tests (if needed)
    serviceRoleKey:
      process.env.E2E_TEST_SUPABASE_SERVICE_ROLE_KEY ||
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU',
  },

  // Test-specific settings
  test: {
    timeout: 30000, // 30 seconds timeout for integration tests
    retries: 0, // No retries for tests to avoid flaky behavior
    verbose: true,
  },

  // JWT configuration for test tokens
  jwt: {
    secret: 'test-jwt-secret',
    expiresIn: '1h',
  },
};

/**
 * Environment validation for tests
 */
export const validateTestEnvironment = (): void => {
  const requiredEnvVars = [
    'E2E_TEST_DATABASE_URL',
    'E2E_TEST_SUPABASE_URL',
    'E2E_TEST_SUPABASE_ANON_KEY',
  ];

  const missingVars = requiredEnvVars.filter(
    (varName) => !process.env[varName],
  );

  if (missingVars.length > 0) {
    console.warn(
      `Warning: Missing environment variables for tests: ${missingVars.join(', ')}`,
    );
    console.warn(
      'Using default test configuration. Make sure your local Supabase is running.',
    );
  }
};

/**
 * Sets up environment variables for testing
 */
export const setupTestEnvironment = (): void => {
  // Set NODE_ENV to test if not already set
  if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = 'test';
  }

  process.env.E2E_TEST_DATABASE_URL = testConfig.database.url;
  process.env.DATABASE_URL = testConfig.database.url;

  // Set default Supabase configuration if not provided
  if (!process.env.E2E_TEST_SUPABASE_URL) {
    process.env.E2E_TEST_SUPABASE_URL = testConfig.supabase.url;
  }

  if (!process.env.E2E_TEST_SUPABASE_ANON_KEY) {
    process.env.E2E_TEST_SUPABASE_ANON_KEY = testConfig.supabase.anonKey;
  }

  validateTestEnvironment();
};
