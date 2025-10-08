process.env.NODE_ENV = 'test';
process.env.MONGO_URI = 'mongodb://localhost:27017/test-db-skip-real';
process.env.JWT_SECRET = process.env.JWT_SECRET || '5d83b96dee398e6fa994f67b7ac59eb4a101c956ef33c6a3e01421ff69055915';
process.env.JWT_COOKIE_NAME = process.env.JWT_COOKIE_NAME || 'token';