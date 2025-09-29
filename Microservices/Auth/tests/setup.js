const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

// Set test environment
process.env.NODE_ENV = 'test';

let mongo;
let redis;

beforeAll(async () => {
    // Start in-memory MongoDB
    mongo = await MongoMemoryServer.create();
    const uri = mongo.getUri();

    process.env.MONGO_URI = uri; // ensure app's db connector uses this
    process.env.JWT_SECRET = "test_jwt_secret"; // set a test JWT secret

    // Clear Redis mock requires cache to ensure fresh instance
    jest.resetModules();
    redis = require('../src/db/redis');

    await mongoose.connect(uri);
});

afterEach(async () => {
    // Cleanup all collections between tests
    const collections = await mongoose.connection.db.collections();
    for (let collection of collections) {
        await collection.deleteMany({});
    }
    // Clear Redis mock data
    if (redis && redis.flushall) {
        await new Promise(resolve => redis.flushall(resolve));
    }
});

afterAll(async () => {
    await mongoose.connection.close();
    if (mongo) await mongo.stop();
    // Clean up Redis mock
    if (redis && redis.quit) {
        await new Promise(resolve => redis.quit(resolve));
    }
});