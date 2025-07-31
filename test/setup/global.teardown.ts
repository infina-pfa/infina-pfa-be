import { teardownGlobalDatabase } from './database.setup';

/**
 * Global teardown for Jest integration tests
 * This runs once after all test suites
 */
export default async (): Promise<void> => {
  console.log('🧹 Tearing down integration test environment...');

  try {
    // Teardown test database
    await teardownGlobalDatabase();

    console.log('✅ Integration test environment teardown completed');
  } catch (error) {
    console.error('❌ Failed to teardown integration test environment:', error);
    throw error;
  }
};
