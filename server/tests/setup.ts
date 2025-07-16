// Test setup for Jest
// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key-for-testing';

// Simple mock factory for Prisma client methods
export const createMockPrismaClient = () => {
  const mockFn = () => Promise.resolve();
  
  return {
    user: {
      findUnique: mockFn,
      findMany: mockFn,
      create: mockFn,
      update: mockFn,
      delete: mockFn,
    },
    post: {
      findUnique: mockFn,
      findMany: mockFn,
      create: mockFn,
      update: mockFn,
      delete: mockFn,
    },
    location: {
      findUnique: mockFn,
      findMany: mockFn,
      create: mockFn,
      update: mockFn,
      delete: mockFn,
    },
    owner: {
      findUnique: mockFn,
      findMany: mockFn,
      create: mockFn,
      update: mockFn,
      delete: mockFn,
    },
    $queryRaw: mockFn,
    $disconnect: mockFn,
  };
}; 