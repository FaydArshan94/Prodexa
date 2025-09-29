/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "node",
  testMatch: ["**/_tests_/**/*.test.js"],
  setupFilesAfterEnv: ["<rootDir>/tests/setup.js"],
  collectCoverageFrom: ["src/**/*.js", "!src/**/index.js"],
  verbose: true,
};
