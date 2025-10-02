module.exports = {
    testEnvironment: 'node',
    roots: ['<rootDir>/tests'],
    coverageDirectory: 'coverage',
    collectCoverageFrom: ['src/**/*.js', '!src/db/**'],
    moduleFileExtensions: ['js', 'json'],
    setupFiles: ['<rootDir>/tests/setup/globalSetup.js'],
};