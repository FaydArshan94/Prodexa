const { Redis } = require("ioredis");

let redis;

if (process.env.NODE_ENV === 'test') {
  // Use redis-mock for testing
  const RedisMock = require('redis-mock');
  redis = RedisMock.createClient();
} else {
  // Use real Redis for development and production
  redis = new Redis({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD,
  });

  redis.on("connect", () => {
    console.log("Connected to Redis");
  });
}

module.exports = redis;
