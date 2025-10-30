import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { mockAuthService } from '@/lib/mockData';
import { setGlobalLogout } from '@/lib/error-toast-handler';

// Mock API functions for demo
const loginAPI = async (email: string, password: string) => {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Calculate token expiry (24 hours from now)
  const tokenExpiry = Date.now() + 24 * 60 * 60 * 1000;

  // Admin login
  if (email === 'admin@example.com' && password === 'password') {
    return {
      id: '1',
      email: 'admin@example.com',
      name: 'Admin User',
      role: 'admin' as const,
      organizationWebsite: 'https://example.com',
      apiToken: 'mock-admin-token',
      tokenExpiry,
    };
  }

  // SOP login using mock service
  const sopResult = await mockAuthService.sopLogin(email, password);
  if (sopResult.success && sopResult.user) {
    return {
      ...sopResult.user,
      apiToken: 'mock-sop-token',
      tokenExpiry,
    };
  }

  throw new Error(sopResult.error || 'Invalid credentials');
};

const checkAuthAPI = async () => {
  // Only run in browser environment
  if (typeof window === 'undefined') {
    return null;
  }

  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Check if user exists in localStorage
  const userData = localStorage.getItem('user');
  if (userData) {
    try {
      const parsedUser = JSON.parse(userData);
      // Validate that the user object has required fields
      if (
        parsedUser &&
        parsedUser.id &&
        parsedUser.email &&
        parsedUser.role
      ) {
        return parsedUser;
      }
    } catch (error) {
      console.error(
        'Failed to parse user data from localStorage:',
        error
      );
      // Clear invalid data
      localStorage.removeItem('user');
      localStorage.removeItem('auth-token');
      localStorage.removeItem('token');
    }
  }

  // Return null if no user data found
  return null;
};

export const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      (set, get) => ({
        // State
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,

        // Actions
        setUser: (user) => {
          // Store user data in localStorage for persistence
          if (user) {
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem(
              'auth-token',
              user.apiToken || 'mock-token'
            );
            // Also store token for SOP API compatibility
            localStorage.setItem(
              'token',
              user.apiToken || 'mock-token'
            );
          } else {
            localStorage.removeItem('user');
            localStorage.removeItem('auth-token');
            localStorage.removeItem('token');
          }

          set(
            {
              user,
              isAuthenticated: !!user,
            },
            false,
            'setUser'
          );
        },

        setLoading: (loading) => {
          set({ isLoading: loading }, false, 'setLoading');
        },

        setError: (error) => {
          set({ error }, false, 'setError');
        },

        login: async (email, password) => {
          set({ isLoading: true, error: null }, false, 'login/start');

          try {
            const user = await loginAPI(email, password);

            // Store auth token (in real implementation)
            localStorage.setItem('auth-token', 'mock-token');
            localStorage.setItem('user', JSON.stringify(user));

            set(
              {
                user,
                isAuthenticated: true,
                isLoading: false,
              },
              false,
              'login/success'
            );
          } catch (error) {
            set(
              {
                error:
                  error instanceof Error
                    ? error.message
                    : 'Login failed',
                isLoading: false,
              },
              false,
              'login/error'
            );
          }
        },

        logout: () => {
          // Clear auth token and user data
          localStorage.removeItem('auth-token');
          localStorage.removeItem('user');
          localStorage.removeItem('token');

          // Force clear the Zustand store state
          set(
            {
              user: null,
              isAuthenticated: false,
              error: null,
              isLoading: false,
            },
            false,
            'logout'
          );
        },

        checkAuth: async () => {
          set({ isLoading: true }, false, 'checkAuth/start');

          try {
            const user = await checkAuthAPI();

            if (user) {
              // Check if token is expired
              if (user.tokenExpiry && Date.now() > user.tokenExpiry) {
                // Token is expired, clear auth state
                localStorage.removeItem('user');
                localStorage.removeItem('auth-token');
                localStorage.removeItem('token');
                set(
                  {
                    user: null,
                    isAuthenticated: false,
                    isLoading: false,
                  },
                  false,
                  'checkAuth/tokenExpired'
                );
                return;
              }

              set(
                {
                  user,
                  isAuthenticated: true,
                  isLoading: false,
                },
                false,
                'checkAuth/success'
              );
            } else {
              set(
                {
                  user: null,
                  isAuthenticated: false,
                  isLoading: false,
                },
                false,
                'checkAuth/unauthorized'
              );
            }
          } catch (error) {
            set(
              {
                error:
                  error instanceof Error
                    ? error.message
                    : 'Auth check failed',
                isLoading: false,
              },
              false,
              'checkAuth/error'
            );
          }
        },

        isTokenExpired: () => {
          // Check if token exists and if it has an expiry
          if (typeof window !== 'undefined') {
            const user = localStorage.getItem('user');
            if (user) {
              try {
                const userData = JSON.parse(user);
                if (
                  userData.tokenExpiry &&
                  Date.now() > userData.tokenExpiry
                ) {
                  return true;
                }
              } catch (error) {
                console.error('Failed to parse user data:', error);
                return true; // If we can't parse, consider it expired
              }
            }
          }
          return false;
        },
      }),
      {
        name: 'auth-storage',
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
        }),
        onRehydrateStorage: () => (state) => {
          // Use setTimeout to ensure localStorage is available
          setTimeout(() => {
            if (typeof window !== 'undefined' && state) {
              const userData = localStorage.getItem('user');
              if (!userData) {
                state.user = null;
                state.isAuthenticated = false;
              } else {
                // Ensure the state is properly set from localStorage
                try {
                  const parsedUser = JSON.parse(userData);
                  if (
                    parsedUser &&
                    parsedUser.id &&
                    parsedUser.email &&
                    parsedUser.role
                  ) {
                    state.user = parsedUser;
                    state.isAuthenticated = true;
                  } else {
                    state.user = null;
                    state.isAuthenticated = false;
                  }
                } catch {
                  // If parsing fails, clear the state
                  state.user = null;
                  state.isAuthenticated = false;
                }
              }
            }
          }, 0);
        },
      }
    ),
    {
      name: 'auth-store',
    }
  )
);

// Register the logout function with the error handler
setGlobalLogout(() => {
  useAuthStore.getState().logout();
});

// Types
export interface AuthStore {
  // State
  user: {
    id: string;
    email: string;
    name: string;
    role: 'admin' | 'sop' | 'student';
    organizationWebsite?: string;
    apiToken?: string;
  } | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  setUser: (user: AuthStore['user']) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  isTokenExpired: () => boolean;
}
