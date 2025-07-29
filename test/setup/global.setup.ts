import { setupGlobalDatabase } from './database.setup';
import { setupTestEnvironment } from './test-environment';

/**
 * Global setup for Jest integration tests
 * This runs once before all test suites
 */
export default async (): Promise<void> => {
  console.log('🚀 Setting up integration test environment...');

  try {
    // Setup test environment variables
    setupTestEnvironment();

    // Setup test database
    await setupGlobalDatabase();

    console.log('✅ Integration test environment setup completed');
  } catch (error) {
    console.error('❌ Failed to setup integration test environment:', error);
    throw error;
  }
};
