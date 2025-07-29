import { setupTestEnvironment } from './test-environment';

// Setup test environment before each test file
setupTestEnvironment();

// Increase timeout for integration tests
jest.setTimeout(30000);

// Mock console methods to reduce noise in tests unless explicitly needed
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeAll(() => {
  // Suppress console.error and console.warn unless NODE_ENV is 'test-verbose'
  if (process.env.NODE_ENV !== 'test-verbose') {
    console.error = jest.fn();
    console.warn = jest.fn();
  }
});

afterAll(() => {
  // Restore original console methods
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});
