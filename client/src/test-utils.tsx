import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { ThemeProvider } from 'next-themes'

// Mock Redux store for testing
const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      // Add your actual reducers here when available
      auth: (state = { user: null, isAuthenticated: false }, action) => {
        switch (action.type) {
          case 'auth/login':
            return { ...state, user: action.payload, isAuthenticated: true }
          case 'auth/logout':
            return { ...state, user: null, isAuthenticated: false }
          default:
            return state
        }
      },
      posts: (state = { items: [], loading: false }, action) => {
        switch (action.type) {
          case 'posts/fetchStart':
            return { ...state, loading: true }
          case 'posts/fetchSuccess':
            return { ...state, items: action.payload, loading: false }
          default:
            return state
        }
      },
    },
    preloadedState: initialState,
  })
}

// All providers wrapper for testing
const AllTheProviders: React.FC<{
  children: React.ReactNode
  initialState?: any
}> = ({ children, initialState = {} }) => {
  const store = createMockStore(initialState)

  return (
    <Provider store={store}>
      <ThemeProvider attribute="class" defaultTheme="light">
        {children}
      </ThemeProvider>
    </Provider>
  )
}

// Custom render function
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & {
    initialState?: any
  }
) => {
  const { initialState, ...renderOptions } = options || {}

  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <AllTheProviders initialState={initialState}>{children}</AllTheProviders>
  )

  return render(ui, { wrapper: Wrapper, ...renderOptions })
}

// Mock user object for tests
export const mockUser = {
  id: '1',
  cognitoId: 'cognito-test-123',
  username: 'testuser',
  email: 'test@example.com',
  profilePictureUrl: null,
  favoriteLocations: [],
  favoritePosts: [],
}

// Mock post object for tests
export const mockPost = {
  id: 1,
  title: 'Test Post',
  content: 'This is a test post content',
  authorId: 1,
  locationId: 1,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  author: {
    id: 1,
    username: 'testuser',
    profilePictureUrl: null,
  },
  location: {
    id: 1,
    name: 'Test Location',
    latitude: 40.7128,
    longitude: -74.0060,
  },
  _count: {
    likes: 5,
    comments: 3,
  },
}

// Mock location object for tests
export const mockLocation = {
  id: 1,
  name: 'Test Location',
  description: 'A test location',
  latitude: 40.7128,
  longitude: -74.0060,
  address: '123 Test St, Test City, TC 12345',
  isVerified: true,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
}

// Test utilities for API mocking
export const mockFetch = (data: any, ok = true) => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok,
      status: ok ? 200 : 400,
      json: () => Promise.resolve(data),
      text: () => Promise.resolve(JSON.stringify(data)),
    })
  ) as jest.Mock
}

// Cleanup function for fetch mocks
export const cleanupFetch = () => {
  if (global.fetch && jest.isMockFunction(global.fetch)) {
    (global.fetch as jest.MockedFunction<typeof fetch>).mockRestore()
  }
}

// Helper to wait for async operations
export const waitFor = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms))

// Mock localStorage for tests
export const mockLocalStorage = () => {
  const storage: { [key: string]: string } = {}

  return {
    getItem: jest.fn((key: string) => storage[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      storage[key] = value
    }),
    removeItem: jest.fn((key: string) => {
      delete storage[key]
    }),
    clear: jest.fn(() => {
      Object.keys(storage).forEach((key) => delete storage[key])
    }),
    length: Object.keys(storage).length,
    key: jest.fn((index: number) => Object.keys(storage)[index] || null),
  }
}

// Mock geolocation for map tests
export const mockGeolocation = () => {
  const mockGeolocation = {
    getCurrentPosition: jest.fn((success) =>
      success({
        coords: {
          latitude: 40.7128,
          longitude: -74.0060,
          accuracy: 100,
        },
      })
    ),
    watchPosition: jest.fn(),
    clearWatch: jest.fn(),
  }

  Object.defineProperty(global.navigator, 'geolocation', {
    value: mockGeolocation,
    writable: true,
  })

  return mockGeolocation
}

// Re-export everything from React Testing Library
export * from '@testing-library/react'
export { customRender as render } 