import type { Config } from 'jest'
import nextJest from 'next/jest.js'

const createJestConfig = nextJest({
  dir: './', // Path to your Next.js app
})

const config: Config = {
  // Display name for this configuration
  displayName: 'API',
  
  // Use node environment for API routes
  testEnvironment: 'node',
  
  // Test file patterns
  testMatch: ['**/src/app/api/**/*.test.ts'],
  
  // Module name mapper for path aliases
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  
  // Transform configuration for TypeScript
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  
  // File extensions to include
  moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  
  // Module resolution
  moduleDirectories: ['node_modules', '<rootDir>/'],
  
  // Ignore patterns
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
  ],
  
  // Test timeout (30 seconds)
  testTimeout: 30000,
  
  // Verbose output
  verbose: true,
  
  // Show test location in results
  testLocationInResults: true,
  
  // Collect coverage
  collectCoverage: true,
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/app/api/**/*.ts',
    '!**/node_modules/**',
    '!**/vendor/**',
  ],
}

// Create and export the configuration
export default createJestConfig(config)
