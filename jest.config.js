// Minimal Jest configuration for testing Next.js API routes with TypeScript
module.exports = {
  // Clear mock calls between tests
  clearMocks: true,
  
  // The directory where Jest should output coverage files
  coverageDirectory: "coverage",
  
  // Use the node test environment for API routes
  testEnvironment: "node",
  
  // Test file patterns
  testMatch: [
    "**/__tests__/**/*.test.[jt]s?(x)",
    "**/?(*.)+(spec|test).[jt]s?(x)"
  ],
  
  // Ignore these paths
  testPathIgnorePatterns: [
    "<rootDir>/.next/",
    "<rootDir>/node_modules/"
  ],
  
  // Transform TypeScript files with ts-jest
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest'
  },
  
  // Module name mapper for path aliases
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  
  // File extensions to include
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  
  // Show verbose output
  verbose: true,
  
  // Force exit when tests are done
  forceExit: true,
  
  // Detect open handles
  detectOpenHandles: true,
  
  // Test timeout (30 seconds)
  testTimeout: 30000
};
