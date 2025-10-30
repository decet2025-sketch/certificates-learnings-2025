import { toast } from 'react-toastify';
import {
  ApiError,
  isApiError,
  isAppError,
  parseResponseBodyError,
  getUserFriendlyErrorMessage,
  logError,
} from './error-handling';

// Global logout function - will be set by the auth store
let globalLogout: (() => void) | null = null;

export const setGlobalLogout = (logoutFn: () => void) => {
  globalLogout = logoutFn;
};

// Toast configuration for different error types
const ERROR_TOAST_CONFIG = {
  error: {
    autoClose: false as const, // Don't auto-close error toasts
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  },
  warning: {
    autoClose: 8000,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  },
  info: {
    autoClose: 5000,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  },
};

// Enhanced error handler that shows toasts instead of breaking UI
export const handleApiErrorWithToast = (
  error: unknown,
  context?: string
): void => {
  // Log the error for debugging
  logError(error, context);

  let apiError: ApiError | null = null;

  // Try to parse as API error first
  if (isApiError(error)) {
    apiError = error;
  } else if (isAppError(error)) {
    // Convert AppError to ApiError for consistent handling
    apiError = new ApiError(
      error.message,
      error.code,
      error.statusCode
    );
  } else if (error instanceof Error) {
    // Try to parse response body if it's a string that might be JSON
    try {
      const parsed = JSON.parse(error.message);
      apiError = parseResponseBodyError(parsed);
    } catch {
      // If not JSON, create a generic API error
      apiError = new ApiError(error.message, 'UNKNOWN_ERROR', 500);
    }
  } else if (typeof error === 'object' && error !== null) {
    // Try to parse as response body error
    apiError = parseResponseBodyError(error);
  }

  if (!apiError) {
    // Fallback for unknown error types
    apiError = new ApiError(
      'An unexpected error occurred',
      'UNKNOWN_ERROR',
      500
    );
  }

  // Get user-friendly message
  const userMessage = getUserFriendlyErrorMessage(apiError);

  // Determine toast type based on error code
  let toastType: 'error' | 'warning' = 'error';
  let title = 'Error';

  switch (apiError.code) {
    case 'COURSE_EXISTS':
    case 'ORGANIZATION_EXISTS':
    case 'LEARNER_EXISTS':
      toastType = 'warning';
      title = 'Duplicate Entry';
      break;
    case 'VALIDATION_ERROR':
      toastType = 'warning';
      title = 'Validation Error';
      break;
    case 'AUTHENTICATION_ERROR':
      toastType = 'error';
      title = 'Session Expired';
      // Automatically logout on authentication error
      if (globalLogout) {
        setTimeout(() => {
          globalLogout?.();
        }, 2000); // Give user time to see the message
      }
      break;
    case 'AUTHORIZATION_ERROR':
      toastType = 'error';
      title = 'Access Denied';
      break;
    case 'NOT_FOUND_ERROR':
      toastType = 'warning';
      title = 'Not Found';
      break;
    case 'NETWORK_ERROR':
    case 'TIMEOUT_ERROR':
      toastType = 'error';
      title = 'Connection Error';
      break;
    default:
      if (apiError.statusCode === 401) {
        toastType = 'error';
        title = 'Session Expired';
        // Automatically logout on 401 error
        if (globalLogout) {
          setTimeout(() => {
            globalLogout?.();
          }, 2000); // Give user time to see the message
        }
      } else if (apiError.statusCode >= 500) {
        toastType = 'error';
        title = 'Server Error';
      } else if (apiError.statusCode >= 400) {
        toastType = 'warning';
        title = 'Request Error';
      }
  }

  // Show appropriate toast using simple string content
  const toastMessage = context
    ? `${userMessage}\n\nContext: ${context}`
    : userMessage;

  switch (toastType) {
    case 'error':
      toast.error(toastMessage, ERROR_TOAST_CONFIG.error);
      break;
    case 'warning':
      toast.warning(toastMessage, ERROR_TOAST_CONFIG.warning);
      break;
  }
};

// Wrapper for API calls that handles errors with toasts
export const withErrorToast = async <T>(
  apiCall: () => Promise<T>,
  context?: string
): Promise<T | null> => {
  try {
    return await apiCall();
  } catch (error) {
    handleApiErrorWithToast(error, context);
    return null;
  }
};

// Enhanced API request wrapper that parses response body errors
export const apiRequestWithToast = async <T>(
  endpoint: string,
  config: RequestInit = {},
  context?: string
): Promise<T | null> => {
  try {
    const response = await fetch(endpoint, config);

    if (!response.ok) {
      let errorData: unknown;

      try {
        errorData = await response.json();
      } catch {
        errorData = { error: { message: response.statusText } };
      }

      // Try to parse as response body error
      const apiError = parseResponseBodyError(errorData);
      if (apiError) {
        throw apiError;
      }

      // Fallback to generic error
      throw new Error(
        `HTTP ${response.status}: ${response.statusText}`
      );
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return (await response.json()) as T;
    }

    return (await response.text()) as T;
  } catch (error) {
    handleApiErrorWithToast(
      error,
      context || `API Request: ${config.method || 'GET'} ${endpoint}`
    );
    return null;
  }
};

// Utility to clear all toasts
export const clearAllErrorToasts = () => {
  toast.dismiss();
};

// Utility to show success toast
export const showSuccessToast = (
  message: string,
  title: string = 'Success'
) => {
  const toastMessage = `${title}\n\n${message}`;

  toast.success(toastMessage, {
    autoClose: 3000,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
};
