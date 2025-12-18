module.exports = {
  preset: 'ts-jest',
  // Use jsdom so React/Next components can be tested alongside Node utilities.
  testEnvironment: 'jsdom',
  // Sweep all workspaces so tests can live anywhere under /packages.
  roots: ['<rootDir>/packages'],
  // Skip compiled outputs so we only run source tests.
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  testMatch: ['**/__tests__/**/*.test.ts', '**/?(*.)+(spec|test).[tj]s?(x)'],
  transform: {
    '^.+\\.[tj]sx?$': 'ts-jest',
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/packages/web/src/$1',
    '^@metalmaster/shared-types(.*)$': '<rootDir>/packages/shared-types/src$1',
    '^@metalmaster/shared-validation(.*)$': '<rootDir>/packages/shared-validation/src$1',
    '^@metalmaster/(.+)$': '<rootDir>/packages/$1/src',
    '\\.(css|less|scss|sass)$': '<rootDir>/tests/__mocks__/styleMock.js',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};
