// Global test setup for Cart service
process.env.JWT_SECRET = process.env.JWT_SECRET || 'testsecret';
process.env.NODE_ENV = 'test';

// Note: afterAll() is not available in setupFiles
// If you need global teardown, use Jest's globalTeardown option instead