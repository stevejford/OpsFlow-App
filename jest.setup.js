// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    };
  },
  useSearchParams() {
    return {
      get: jest.fn(),
    };
  },
}));

// Mock environment variables
process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/testdb';
process.env.NODE_ENV = 'test';
