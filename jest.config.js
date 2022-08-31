/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  modulePathIgnorePatterns: ['types/lib/', 'backend/mongodb/lib/'],
  moduleDirectories: ['backend/mongodb/node_modules/'],
  globals: {
    'ts-jest': {
      diagnostics: false, // set to true to enable type checking
    },
  },
};
