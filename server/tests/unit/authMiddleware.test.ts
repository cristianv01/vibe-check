const jwt = require('jsonwebtoken');
const { authMiddleWare } = require('../../src/middleware/authMiddleware');

// Mock jwt.decode
const mockJwtDecode = jest.fn();
jwt.decode = mockJwtDecode;

describe('authMiddleware', () => {
  let mockRequest: any;
  let mockResponse: any;
  let mockNext: any;

  beforeEach(() => {
    // Setup mock request and response objects
    mockRequest = {
      headers: {},
      user: undefined,
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockNext = jest.fn();

    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('Authorization Header Validation', () => {
    test('should return 401 when no authorization header is provided', () => {
      const middleware = authMiddleWare(['user']);
      
      middleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    test('should return 401 when authorization header is malformed', () => {
      mockRequest.headers = { authorization: 'invalid-header' };
      const middleware = authMiddleWare(['user']);
      
      middleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    test('should return 401 when Bearer token is missing', () => {
      mockRequest.headers = { authorization: 'Bearer' };
      const middleware = authMiddleWare(['user']);
      
      middleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('JWT Token Processing', () => {
    test('should successfully process valid JWT token with user role', () => {
      const mockToken = 'valid.jwt.token';
      const mockDecodedToken = {
        sub: 'user123',
        'custom:role': 'user',
      };

      mockRequest.headers = { authorization: `Bearer ${mockToken}` };
      mockJwtDecode.mockReturnValue(mockDecodedToken);

      const middleware = authMiddleWare(['user']);
      middleware(mockRequest, mockResponse, mockNext);

      expect(mockJwtDecode).toHaveBeenCalledWith(mockToken);
      expect(mockRequest.user).toEqual({
        id: 'user123',
        role: 'user',
      });
      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    test('should successfully process valid JWT token with owner role', () => {
      const mockToken = 'valid.jwt.token';
      const mockDecodedToken = {
        sub: 'owner456',
        'custom:role': 'owner',
      };

      mockRequest.headers = { authorization: `Bearer ${mockToken}` };
      mockJwtDecode.mockReturnValue(mockDecodedToken);

      const middleware = authMiddleWare(['owner']);
      middleware(mockRequest, mockResponse, mockNext);

      expect(mockRequest.user).toEqual({
        id: 'owner456',
        role: 'owner',
      });
      expect(mockNext).toHaveBeenCalled();
    });

    test('should handle JWT token without custom:role claim', () => {
      const mockToken = 'valid.jwt.token';
      const mockDecodedToken = {
        sub: 'user123',
        // No custom:role claim
      };

      mockRequest.headers = { authorization: `Bearer ${mockToken}` };
      mockJwtDecode.mockReturnValue(mockDecodedToken);

      const middleware = authMiddleWare(['user']);
      middleware(mockRequest, mockResponse, mockNext);

      expect(mockRequest.user).toEqual({
        id: 'user123',
        role: '',
      });
      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Forbidden' });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('Role-Based Access Control', () => {
    test('should allow access when user role matches allowed roles', () => {
      const mockToken = 'valid.jwt.token';
      const mockDecodedToken = {
        sub: 'user123',
        'custom:role': 'USER', // Test case insensitive matching
      };

      mockRequest.headers = { authorization: `Bearer ${mockToken}` };
      mockJwtDecode.mockReturnValue(mockDecodedToken);

      const middleware = authMiddleWare(['user', 'admin']);
      middleware(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    test('should deny access when user role does not match allowed roles', () => {
      const mockToken = 'valid.jwt.token';
      const mockDecodedToken = {
        sub: 'user123',
        'custom:role': 'user',
      };

      mockRequest.headers = { authorization: `Bearer ${mockToken}` };
      mockJwtDecode.mockReturnValue(mockDecodedToken);

      const middleware = authMiddleWare(['admin', 'owner']);
      middleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Forbidden' });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    test('should handle JWT decode errors gracefully', () => {
      const mockToken = 'invalid.jwt.token';
      mockRequest.headers = { authorization: `Bearer ${mockToken}` };
      
      // Mock jwt.decode to throw an error
      mockJwtDecode.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const middleware = authMiddleWare(['user']);
      middleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Invalid token' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    test('should handle null decoded token', () => {
      const mockToken = 'invalid.jwt.token';
      mockRequest.headers = { authorization: `Bearer ${mockToken}` };
      
      // Mock jwt.decode to return null
      mockJwtDecode.mockReturnValue(null);

      const middleware = authMiddleWare(['user']);
      middleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Invalid token' });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty allowed roles array', () => {
      const mockToken = 'valid.jwt.token';
      const mockDecodedToken = {
        sub: 'user123',
        'custom:role': 'user',
      };

      mockRequest.headers = { authorization: `Bearer ${mockToken}` };
      mockJwtDecode.mockReturnValue(mockDecodedToken);

      const middleware = authMiddleWare([]);
      middleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Forbidden' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    test('should handle case sensitivity in role comparison', () => {
      const mockToken = 'valid.jwt.token';
      const mockDecodedToken = {
        sub: 'user123',
        'custom:role': 'ADMIN',
      };

      mockRequest.headers = { authorization: `Bearer ${mockToken}` };
      mockJwtDecode.mockReturnValue(mockDecodedToken);

      const middleware = authMiddleWare(['admin']);
      middleware(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });
  });
}); 