/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/*.test.ts'],
  moduleNameMapper: {
    '^@mapples/state$': '<rootDir>/../state/src/valueSource.ts',
  },
  transform: {
    '^.+\\.ts$': 'babel-jest',
  },
};
