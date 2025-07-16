# Testing Guide for VibeCheck

This guide explains the comprehensive testing setup for the VibeCheck project, covering both server-side (Node.js/Express) and client-side (Next.js/React) testing.

## Overview

The project uses Jest as the primary testing framework with different configurations for server and client:

- **Server**: Jest with TypeScript, Supertest for integration tests, mocked Prisma
- **Client**: Jest with Next.js support, React Testing Library, mocked dependencies

## Server Testing

### Setup

The server testing is configured with:
- Jest with TypeScript support (`ts-jest`)
- Supertest for HTTP endpoint testing
- Mocked Prisma Client for database operations
- JWT mocking for authentication

### File Structure

```
server/
├── tests/
│   ├── setup.ts                    # Global test configuration
│   ├── unit/
│   │   ├── authMiddleware.test.ts   # Unit tests for middleware
│   │   └── userController.test.ts   # Unit tests for controllers
│   └── integration/
│       └── userRoutes.test.ts       # Integration tests for API routes
├── jest.config.js                  # Jest configuration
└── package.json                    # Test scripts and dependencies
```

### Running Server Tests

```bash
cd server

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration

# Run specific test file
npm test -- tests/unit/authMiddleware.test.ts
```

### Writing Server Tests

#### Unit Tests

Unit tests focus on testing individual functions in isolation:

```typescript
// Example: Testing a controller function
describe('UserController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should get user successfully', async () => {
    const mockUser = { id: 1, username: 'test' };
    mockPrismaInstance.user.findUnique.mockResolvedValue(mockUser);

    await getUser(mockRequest, mockResponse);

    expect(mockResponse.json).toHaveBeenCalledWith(mockUser);
  });
});
```

#### Integration Tests

Integration tests test the full request/response cycle:

```typescript
// Example: Testing API endpoints
describe('User Routes Integration Tests', () => {
  test('should get user successfully with valid token', async () => {
    const mockToken = 'valid.jwt.token';
    mockJwtDecode.mockReturnValue({
      sub: 'user123',
      'custom:role': 'user',
    });

    const response = await request(app)
      .get('/users/user123')
      .set('Authorization', `Bearer ${mockToken}`);

    expect(response.status).toBe(200);
  });
});
```

### Server Test Patterns

1. **Authentication Testing**: Mock JWT tokens and test different auth scenarios
2. **Database Testing**: Mock Prisma operations and test various database states
3. **Error Handling**: Test error conditions and proper error responses
4. **Validation**: Test input validation and edge cases

## Client Testing

### Setup

The client testing is configured with:
- Jest with Next.js integration
- React Testing Library for component testing
- Mock implementations for external dependencies (Mapbox, AWS Amplify)
- Custom test utilities with Redux store mocking

### File Structure

```
client/
├── src/
│   ├── test-utils.tsx               # Custom testing utilities
│   └── components/
│       └── __tests__/
│           └── Button.test.tsx      # Component tests
├── jest.config.js                  # Jest configuration
├── jest.setup.js                   # Test setup and global mocks
└── package.json                    # Test scripts and dependencies
```

### Running Client Tests

```bash
cd client

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- src/components/__tests__/Button.test.tsx
```

### Writing Client Tests

#### Component Tests

Test React components using React Testing Library:

```typescript
import { render, screen, fireEvent } from '../test-utils'
import Button from '../Button'

describe('Button Component', () => {
  test('renders button with children', () => {
    render(<Button>Click me</Button>)
    
    const button = screen.getByRole('button', { name: /click me/i })
    expect(button).toBeInTheDocument()
  })

  test('calls onClick handler when clicked', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    
    const button = screen.getByRole('button')
    fireEvent.click(button)
    
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

#### Testing with Redux

Use the custom render function for components that need Redux:

```typescript
import { render, screen } from '../test-utils'
import UserProfile from '../UserProfile'
import { mockUser } from '../test-utils'

test('displays user information', () => {
  const initialState = {
    auth: { user: mockUser, isAuthenticated: true }
  }

  render(<UserProfile />, { initialState })
  
  expect(screen.getByText(mockUser.username)).toBeInTheDocument()
})
```

#### Testing API Calls

Mock fetch and test API interactions:

```typescript
import { mockFetch, cleanupFetch } from '../test-utils'

describe('API calls', () => {
  afterEach(() => {
    cleanupFetch()
  })

  test('fetches user data', async () => {
    mockFetch({ id: 1, username: 'test' })
    
    // Test component that makes API call
    render(<UserComponent />)
    
    await waitFor(() => {
      expect(screen.getByText('test')).toBeInTheDocument()
    })
  })
})
```

### Client Test Patterns

1. **Component Rendering**: Test that components render correctly with different props
2. **User Interactions**: Test click handlers, form submissions, and user events
3. **State Management**: Test Redux state changes and component updates
4. **API Integration**: Mock API calls and test loading/error states
5. **Accessibility**: Test ARIA labels, keyboard navigation, and screen reader support

## Test Utilities and Mocks

### Server Utilities

- **Prisma Mocking**: Mock database operations with `mockPrismaInstance`
- **JWT Mocking**: Mock token decoding for authentication tests
- **Express Mocking**: Mock request/response objects for controller tests

### Client Utilities

- **Custom Render**: Render components with Redux and Theme providers
- **Mock Data**: Pre-defined mock objects for users, posts, and locations
- **API Mocking**: Utilities for mocking fetch requests
- **External Service Mocks**: Mocks for Mapbox, AWS Amplify, and other services

## Testing Best Practices

### General Principles

1. **Test Behavior, Not Implementation**: Focus on what the user sees and does
2. **AAA Pattern**: Arrange, Act, Assert - structure tests clearly
3. **Descriptive Test Names**: Use clear, descriptive test names
4. **Single Responsibility**: Each test should test one specific behavior
5. **Test Edge Cases**: Include error conditions and boundary values

### Mocking Guidelines

1. **Mock External Dependencies**: Always mock external APIs, databases, and services
2. **Keep Mocks Simple**: Use minimal mocks that serve the test purpose
3. **Reset Mocks**: Clear mocks between tests to avoid interference
4. **Mock at the Right Level**: Mock at the boundary of your system

### Coverage Guidelines

- Aim for high coverage on critical business logic
- Don't chase 100% coverage at the expense of test quality
- Focus on testing user-facing functionality
- Use coverage reports to identify untested code paths

## Running All Tests

To run tests for both server and client:

```bash
# From project root
cd server && npm test && cd ../client && npm test

# Or use a simple script
./run-all-tests.sh
```

## Continuous Integration

The tests are designed to run in CI environments:

- All external dependencies are mocked
- Tests are deterministic and don't rely on external services
- Environment variables are mocked for consistent test environments
- Tests run without requiring actual database or API connections

## Debugging Tests

### Common Issues

1. **Mock Not Working**: Ensure mocks are set up before imports
2. **Async Issues**: Use `await` for async operations and `waitFor` for DOM updates
3. **State Issues**: Clear state between tests using cleanup functions
4. **Environment Issues**: Check that environment variables are properly mocked

### Debugging Tools

- Use `screen.debug()` to see the rendered DOM in React tests
- Use `console.log` in tests to debug values (remove before committing)
- Use Jest's `--verbose` flag for detailed test output
- Use `--bail` flag to stop on first failure

## Examples and Patterns

See the test files for comprehensive examples of:

- Authentication middleware testing
- CRUD operation testing
- API integration testing
- React component testing
- Redux state testing
- Error handling testing
- Form validation testing

This testing setup provides a solid foundation for maintaining code quality and preventing regressions as the VibeCheck application grows. 