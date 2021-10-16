// eslint-disable-next-line no-undef
module.exports = {
    preset: 'ts-jest',
    // testEnvironment: 'node',
    modulePathIgnorePatterns: [
        '<rootDir>/.aws-sam',
        '<rootDir>/__tests__/fixtures',
        '<rootDir>/__tests__/utils',
        '<rootDir>/__tests__/global-setup.js',
    ],
    clearMocks: true,
    globalSetup: './node_modules/@shelf/jest-dynamodb/setup.js',
    globalTeardown: './node_modules/@shelf/jest-dynamodb/teardown.js',
    testEnvironment: './node_modules/@shelf/jest-dynamodb/environment.js',
    setupFilesAfterEnv: ['./src/test/setup.ts'],
};
