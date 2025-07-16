const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');

// Mock Prisma Client before importing anything
const mockPrismaInstance = {
  user: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  post: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  postFavorite: {
    findUnique: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
  },
  $disconnect: jest.fn(),
};

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => mockPrismaInstance),
}));

// Mock JWT decode
const mockJwtDecode = jest.fn();
jwt.decode = mockJwtDecode;

// Import functions directly to create custom routes
const {
  getUser,
  createUser,
  updateUser,
  addFavoritePost,
  removeFavoritePost,
} = require('../../src/controllers/userController');

const { authMiddleWare } = require('../../src/middleware/authMiddleware');

describe('User Routes Integration Tests', () => {
  let app: any;

  beforeAll(() => {
    // Create Express app
    app = express();
    app.use(express.json());
    
    // Create router manually
    const userRouter = express.Router();
    userRouter.get('/:cognitoId', getUser);
    userRouter.put('/:cognitoId', updateUser);
    userRouter.post('/:cognitoId/favorites/:postId', addFavoritePost);
    userRouter.delete('/:cognitoId/favorites/:postId', removeFavoritePost);
    userRouter.post('/', createUser);
    
    // Use routes with auth middleware
    app.use('/users', authMiddleWare(['user']), userRouter);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /users/:cognitoId', () => {
    test('should get user successfully with valid token', async () => {
      const mockUser = {
        id: 1,
        cognitoId: 'cognito123',
        username: 'testuser',
        email: 'test@example.com',
        favoriteLocations: [],
        favoritePosts: [],
      };

      const mockToken = 'valid.jwt.token';
      const mockDecodedToken = {
        sub: 'cognito123',
        'custom:role': 'user',
      };

      mockJwtDecode.mockReturnValue(mockDecodedToken);
      mockPrismaInstance.user.findUnique.mockResolvedValue(mockUser);

      const response = await request(app)
        .get('/users/cognito123')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUser);
      expect(mockPrismaInstance.user.findUnique).toHaveBeenCalledWith({
        where: { cognitoId: 'cognito123' },
        include: {
          favoriteLocations: true,
          favoritePosts: {
            include: {
              post: true,
            },
          },
        },
      });
    });

    test('should return 401 without authorization token', async () => {
      const response = await request(app)
        .get('/users/cognito123');

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ message: 'Unauthorized' });
    });

    test('should return 403 with invalid role', async () => {
      const mockToken = 'valid.jwt.token';
      const mockDecodedToken = {
        sub: 'cognito123',
        'custom:role': 'admin', // Not allowed for user routes
      };

      mockJwtDecode.mockReturnValue(mockDecodedToken);

      const response = await request(app)
        .get('/users/cognito123')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(403);
      expect(response.body).toEqual({ message: 'Forbidden' });
    });

    test('should return 404 when user not found', async () => {
      const mockToken = 'valid.jwt.token';
      const mockDecodedToken = {
        sub: 'cognito123',
        'custom:role': 'user',
      };

      mockJwtDecode.mockReturnValue(mockDecodedToken);
      mockPrismaInstance.user.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .get('/users/nonexistent')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: 'User not found' });
    });
  });

  describe('POST /users', () => {
    test('should create user successfully', async () => {
      const userData = {
        cognitoId: 'cognito123',
        username: 'newuser',
        email: 'newuser@example.com',
      };

      const createdUser = {
        id: 1,
        ...userData,
        profilePictureUrl: null,
      };

      const mockToken = 'valid.jwt.token';
      const mockDecodedToken = {
        sub: 'cognito123',
        'custom:role': 'user',
      };

      mockJwtDecode.mockReturnValue(mockDecodedToken);
      mockPrismaInstance.user.create.mockResolvedValue(createdUser);

      const response = await request(app)
        .post('/users')
        .set('Authorization', `Bearer ${mockToken}`)
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body).toEqual(createdUser);
      expect(mockPrismaInstance.user.create).toHaveBeenCalledWith({
        data: {
          cognitoId: userData.cognitoId,
          username: userData.username,
          email: userData.email,
          profilePictureUrl: null,
        },
      });
    });

    test('should handle missing required fields', async () => {
      const invalidData = {
        cognitoId: 'cognito123',
        // Missing username and email
      };

      const mockToken = 'valid.jwt.token';
      const mockDecodedToken = {
        sub: 'cognito123',
        'custom:role': 'user',
      };

      mockJwtDecode.mockReturnValue(mockDecodedToken);
      mockPrismaInstance.user.create.mockRejectedValue(new Error('Missing required fields'));

      const response = await request(app)
        .post('/users')
        .set('Authorization', `Bearer ${mockToken}`)
        .send(invalidData);

      expect(response.status).toBe(500);
      expect(response.body.message).toContain('Error creating user');
    });
  });

  describe('Integration Error Handling', () => {
    test('should handle database connection errors', async () => {
      const mockToken = 'valid.jwt.token';
      const mockDecodedToken = {
        sub: 'cognito123',
        'custom:role': 'user',
      };

      mockJwtDecode.mockReturnValue(mockDecodedToken);
      mockPrismaInstance.user.findUnique.mockRejectedValue(new Error('Database connection failed'));

      const response = await request(app)
        .get('/users/cognito123')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Error fetching user');
      expect(response.body.error).toBe('Database connection failed');
    });

    test('should handle malformed JWT tokens', async () => {
      mockJwtDecode.mockImplementation(() => {
        throw new Error('Invalid token format');
      });

      const response = await request(app)
        .get('/users/cognito123')
        .set('Authorization', 'Bearer invalid.token.format');

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid token');
    });

    test('should handle null JWT decode result', async () => {
      mockJwtDecode.mockReturnValue(null);

      const response = await request(app)
        .get('/users/cognito123')
        .set('Authorization', 'Bearer null.token.result');

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid token');
    });
  });

  describe('Route Parameter Validation', () => {
    test('should handle special characters in cognitoId', async () => {
      const specialCognitoId = 'cognito-user_123';
      const mockToken = 'valid.jwt.token';
      const mockDecodedToken = {
        sub: specialCognitoId,
        'custom:role': 'user',
      };

      mockJwtDecode.mockReturnValue(mockDecodedToken);
      mockPrismaInstance.user.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .get(`/users/${specialCognitoId}`)
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(404);
      expect(mockPrismaInstance.user.findUnique).toHaveBeenCalledWith({
        where: { cognitoId: specialCognitoId },
        include: {
          favoriteLocations: true,
          favoritePosts: {
            include: {
              post: true,
            },
          },
        },
      });
    });

    test('should handle numeric postId in favorites routes', async () => {
      const mockToken = 'valid.jwt.token';
      const mockDecodedToken = {
        sub: 'cognito123',
        'custom:role': 'user',
      };

      mockJwtDecode.mockReturnValue(mockDecodedToken);
      mockPrismaInstance.user.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .post('/users/cognito123/favorites/12345')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('User not found');
    });
  });
}); 