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


// Enhanced error handler that logs to console instead of showing toasts
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

  // Log to console with context if provided
  if (context) {
    console.error(`Error in ${context}: ${userMessage}`, apiError);
  } else {
    console.error(userMessage, apiError);
  }

  // Handle authentication errors that need logout
  if (apiError.code === 'AUTHENTICATION_ERROR' || apiError.statusCode === 401) {
    if (globalLogout) {
      setTimeout(() => {
        globalLogout?.();
      }, 100); // Quick logout on auth error
    }
  }
};

// Wrapper for API calls that handles errors with console logging
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

// Enhanced API request wrapper that parses response body errors and logs to console
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

// Utility to clear all toasts (for success/info toasts only)
export const clearAllErrorToasts = () => {
  toast.dismiss();
};
