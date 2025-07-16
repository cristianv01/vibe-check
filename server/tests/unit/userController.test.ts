// Mock Prisma Client before importing the controller
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
  favoritePost: {
    create: jest.fn(),
    delete: jest.fn(),
  },
  $disconnect: jest.fn(),
};

// Mock the PrismaClient constructor
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => mockPrismaInstance),
}));

// Now import the controller functions
const {
  getUser,
  createUser,
  updateUser,
  addFavoritePost,
  removeFavoritePost,
} = require('../../src/controllers/userController');

describe('UserController', () => {
  let mockRequest: any;
  let mockResponse: any;

  beforeEach(() => {
    mockRequest = {
      params: {},
      body: {},
      user: { id: 'user123', role: 'user' },
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('getUser', () => {
    test('should return user when found', async () => {
      const mockUser = {
        id: 1,
        cognitoId: 'cognito123',
        username: 'testuser',
        email: 'test@example.com',
        favoriteLocations: [],
        favoritePosts: [],
      };

      mockRequest.params = { cognitoId: 'cognito123' };
      mockPrismaInstance.user.findUnique.mockResolvedValue(mockUser);

      await getUser(mockRequest, mockResponse);

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
      expect(mockResponse.json).toHaveBeenCalledWith(mockUser);
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    test('should return 404 when user not found', async () => {
      mockRequest.params = { cognitoId: 'nonexistent' };
      mockPrismaInstance.user.findUnique.mockResolvedValue(null);

      await getUser(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'User not found' });
    });

    test('should handle database errors', async () => {
      mockRequest.params = { cognitoId: 'cognito123' };
      const errorMessage = 'Database connection failed';
      mockPrismaInstance.user.findUnique.mockRejectedValue(new Error(errorMessage));

      await getUser(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Error fetching user',
        error: errorMessage,
      });
    });
  });

  describe('createUser', () => {
    test('should create user successfully', async () => {
      const userData = {
        cognitoId: 'cognito123',
        username: 'newuser',
        email: 'newuser@example.com',
        profilePictureUrl: 'https://example.com/pic.jpg',
      };

      const createdUser = {
        id: 1,
        ...userData,
        profilePictureUrl: null, // As per the controller logic
      };

      mockRequest.body = userData;
      mockPrismaInstance.user.create.mockResolvedValue(createdUser);

      await createUser(mockRequest, mockResponse);

      expect(mockPrismaInstance.user.create).toHaveBeenCalledWith({
        data: {
          cognitoId: userData.cognitoId,
          username: userData.username,
          email: userData.email,
          profilePictureUrl: null,
        },
      });
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(createdUser);
    });

    test('should handle missing required fields', async () => {
      mockRequest.body = {
        cognitoId: 'cognito123',
        // Missing username and email
      };

      const errorMessage = 'Missing required fields';
      mockPrismaInstance.user.create.mockRejectedValue(new Error(errorMessage));

      await createUser(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: `Error creating user ${errorMessage}`,
      });
    });
  });

  describe('updateUser', () => {
    test('should update user successfully', async () => {
      const updateData = {
        username: 'updateduser',
        email: 'updated@example.com',
      };

      const updatedUser = {
        id: 1,
        cognitoId: 'cognito123',
        ...updateData,
      };

      mockRequest.params = { cognitoId: 'cognito123' };
      mockRequest.body = updateData;
      mockPrismaInstance.user.update.mockResolvedValue(updatedUser);

      await updateUser(mockRequest, mockResponse);

      expect(mockPrismaInstance.user.update).toHaveBeenCalledWith({
        where: { cognitoId: 'cognito123' },
        data: {
          username: updateData.username,
          email: updateData.email,
          phoneNumber: undefined,
        },
      });
    });

    test('should handle user not found during update', async () => {
      mockRequest.params = { cognitoId: 'nonexistent' };
      mockRequest.body = { username: 'newname' };

      const errorMessage = 'Record to update not found';
      mockPrismaInstance.user.update.mockRejectedValue(new Error(errorMessage));

      await updateUser(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: `Error creating user ${errorMessage}`, // Note: The controller has wrong error message
      });
    });
  });

  describe('addFavoritePost', () => {
    test('should add favorite post successfully', async () => {
      const mockUser = {
        id: 1,
        cognitoId: 'cognito123',
        username: 'testuser',
      };

      const mockPost = {
        id: 5,
        title: 'Test Post',
        content: 'Test content',
      };

      const updatedUser = {
        ...mockUser,
        favoritePosts: [{ post: mockPost }],
      };

      mockRequest.params = { cognitoId: 'cognito123', postId: '5' };

      // Mock the sequence of calls
      mockPrismaInstance.user.findUnique
        .mockResolvedValueOnce(mockUser) // First call to find user
        .mockResolvedValueOnce(updatedUser); // Final call to return updated user

      mockPrismaInstance.post.findUnique.mockResolvedValue(mockPost);
      mockPrismaInstance.postFavorite.findUnique.mockResolvedValue(null); // Not already favorited
      mockPrismaInstance.postFavorite.create.mockResolvedValue({ id: 1, userId: 1, postId: 5 });

      await addFavoritePost(mockRequest, mockResponse);

      expect(mockPrismaInstance.postFavorite.create).toHaveBeenCalledWith({
        data: {
          userId: 1,
          postId: 5,
        },
      });
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(updatedUser);
    });

    test('should return 404 when user not found', async () => {
      mockRequest.params = { cognitoId: 'nonexistent', postId: '5' };
      mockPrismaInstance.user.findUnique.mockResolvedValue(null);

      await addFavoritePost(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'User not found',
      });
    });

    test('should return 404 when post not found', async () => {
      const mockUser = { id: 1, cognitoId: 'cognito123' };
      
      mockRequest.params = { cognitoId: 'cognito123', postId: '999' };
      mockPrismaInstance.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaInstance.post.findUnique.mockResolvedValue(null);

      await addFavoritePost(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Post not found',
      });
    });

    test('should return 400 when post already favorited', async () => {
      const mockUser = { id: 1, cognitoId: 'cognito123' };
      const mockPost = { id: 5, title: 'Test Post' };
      const existingFavorite = { id: 1, userId: 1, postId: 5 };

      mockRequest.params = { cognitoId: 'cognito123', postId: '5' };
      mockPrismaInstance.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaInstance.post.findUnique.mockResolvedValue(mockPost);
      mockPrismaInstance.postFavorite.findUnique.mockResolvedValue(existingFavorite);

      await addFavoritePost(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Post already favorited',
      });
    });
  });

  describe('removeFavoritePost', () => {
    test('should remove favorite post successfully', async () => {
      const mockUser = {
        id: 1,
        cognitoId: 'cognito123',
        username: 'testuser',
      };

      const updatedUser = {
        ...mockUser,
        favoritePosts: [],
      };

      mockRequest.params = { cognitoId: 'cognito123', postId: '5' };

      mockPrismaInstance.user.findUnique
        .mockResolvedValueOnce(mockUser) // First call to find user
        .mockResolvedValueOnce(updatedUser); // Final call to return updated user

      mockPrismaInstance.postFavorite.delete.mockResolvedValue({ id: 1 });

      await removeFavoritePost(mockRequest, mockResponse);

      expect(mockPrismaInstance.postFavorite.delete).toHaveBeenCalledWith({
        where: {
          userId_postId: {
            userId: 1,
            postId: 5,
          },
        },
      });
      expect(mockResponse.json).toHaveBeenCalledWith(updatedUser);
    });

    test('should return 404 when user not found', async () => {
      mockRequest.params = { cognitoId: 'nonexistent', postId: '5' };
      mockPrismaInstance.user.findUnique.mockResolvedValue(null);

      await removeFavoritePost(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'User not found',
      });
    });
  });
}); 