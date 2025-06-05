// Jest setup file
process.env.NODE_ENV = 'test';

// Set test environment variables
process.env.ZOOM_ACCOUNT_ID = 'test_account_id';
process.env.ZOOM_CLIENT_ID = 'test_client_id';
process.env.ZOOM_CLIENT_SECRET = 'test_client_secret';
process.env.DEFAULT_EVENT_ID = 'test_event_id';
process.env.PORT = '0'; // Use random port for tests

// Suppress console logs during tests unless debugging
if (!process.env.DEBUG_TESTS) {
  console.log = jest.fn();
  console.error = jest.fn();
  console.warn = jest.fn();
}