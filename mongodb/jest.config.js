/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */

// Note: https://mongoosejs.com/docs/jest.html#globalsetup-and-globalteardown

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns: ['./lib'],
  setupFiles: ['./src/jest/env.ts'],
  // globalSetup: './src/jest/globalSetup.ts',
  // globalTeardown: './src/jest/globalTeardown.ts',
};
