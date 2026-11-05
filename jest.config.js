/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  modulePathIgnorePatterns: ['types/lib/', 'backend/mongodb/lib/'],
  moduleDirectories: ['node_modules', 'backend/mongodb/node_modules/'],
  moduleNameMapper: {
    '^cutopia-types$': '<rootDir>/types/src/index.ts',
    '^mongodb$': '<rootDir>/backend/mongodb/node_modules/mongodb/lib/index.js',
  },
  globals: {
    'ts-jest': {
      diagnostics: false, // set to true to enable type checking
    },
  },
};
