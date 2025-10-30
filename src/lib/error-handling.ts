// Error types and interfaces
export interface AppErrorData {
  code: string;
  message: string;
  details?: string;
  statusCode?: number;
  timestamp: string;
  stack?: string;
}

export interface ValidationErrorData {
  field: string;
  message: string;
  value?: unknown;
}

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: string;
    validationErrors?: ValidationErrorData[];
  };
  timestamp: string;
  path: string;
}

// Custom error classes
export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: string;
  public readonly timestamp: string;

  constructor(
    message: string,
    code: string = 'UNKNOWN_ERROR',
    statusCode: number = 500,
    details?: string
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.timestamp = new Date().toISOString();

    // Maintains proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }
}

export class ValidationError extends Error {
  public readonly field: string;
  public readonly value?: unknown;
  public readonly timestamp: string;

  constructor(field: string, message: string, value?: unknown) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
    this.value = value;
    this.timestamp = new Date().toISOString();
  }
}

export class ApiError extends AppError {
  public readonly path: string;
  public readonly validationErrors?: ValidationErrorData[];

  constructor(
    message: string,
    code: string = 'API_ERROR',
    statusCode: number = 500,
    path: string = '',
    details?: string,
    validationErrors?: ValidationErrorData[]
  ) {
    super(message, code, statusCode, details);
    this.name = 'ApiError';
    this.path = path;
    this.validationErrors = validationErrors;
  }
}

export class NetworkError extends AppError {
  constructor(message: string = 'Network error occurred') {
    super(message, 'NETWORK_ERROR', 0);
    this.name = 'NetworkError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed') {
    super(message, 'AUTHENTICATION_ERROR', 401);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Access denied') {
    super(message, 'AUTHORIZATION_ERROR', 403);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 'NOT_FOUND_ERROR', 404);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource conflict') {
    super(message, 'CONFLICT_ERROR', 409);
    this.name = 'ConflictError';
  }
}

// Error handling utilities
export const isAppError = (error: unknown): error is AppError => {
  return error instanceof AppError;
};

export const isValidationError = (
  error: unknown
): error is ValidationError => {
  return error instanceof ValidationError;
};

export const isApiError = (error: unknown): error is ApiError => {
  return error instanceof ApiError;
};

export const isNetworkError = (
  error: unknown
): error is NetworkError => {
  return error instanceof NetworkError;
};

export const isAuthenticationError = (
  error: unknown
): error is AuthenticationError => {
  return error instanceof AuthenticationError;
};

export const isAuthorizationError = (
  error: unknown
): error is AuthorizationError => {
  return error instanceof AuthorizationError;
};

export const isNotFoundError = (
  error: unknown
): error is NotFoundError => {
  return error instanceof NotFoundError;
};

export const isConflictError = (
  error: unknown
): error is ConflictError => {
  return error instanceof ConflictError;
};

// Error message formatter
export const formatErrorMessage = (error: unknown): string => {
  if (isAppError(error)) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'An unexpected error occurred';
};

// Error logger
export const logError = (error: unknown, context?: string): void => {
  const timestamp = new Date().toISOString();
  const errorMessage = formatErrorMessage(error);
  const contextInfo = context ? ` [${context}]` : '';

  console.error(`[${timestamp}]${contextInfo} Error:`, errorMessage);

  // In production, you would send this to a logging service like Sentry
  if (process.env.NODE_ENV === 'production') {
    // Example: Sentry.captureException(error, { tags: { context } })
    console.log('Error logged to external service');
  }
};

// Retry utility for network requests
export const retry = async <T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry on certain errors
      if (
        isAuthenticationError(error) ||
        isAuthorizationError(error) ||
        isNotFoundError(error)
      ) {
        throw error;
      }

      // Don't retry on the last attempt
      if (attempt === maxAttempts) {
        throw error;
      }

      // Wait before retrying
      await new Promise((resolve) =>
        setTimeout(resolve, delay * attempt)
      );
    }
  }

  throw lastError;
};

// Error boundary error formatter
export const formatErrorBoundaryError = (
  error: Error,
  errorInfo: { componentStack: string }
): AppError => {
  return new AppError(
    'An unexpected error occurred in the application',
    'COMPONENT_ERROR',
    500,
    `Component: ${errorInfo.componentStack}\nOriginal Error: ${error.message}`
  );
};

// API error response parser
export const parseApiError = (
  response: Response,
  data: unknown
): ApiError => {
  const statusCode = response.status;
  const path = response.url;

  if (typeof data === 'object' && data !== null && 'error' in data) {
    const errorData = data as ApiErrorResponse;
    return new ApiError(
      errorData.error.message,
      errorData.error.code,
      statusCode,
      path,
      errorData.error.details,
      errorData.error.validationErrors
    );
  }

  // Fallback error message based on status code
  let message = 'An error occurred';
  let code = 'API_ERROR';

  switch (statusCode) {
    case 400:
      message = 'Bad request';
      code = 'BAD_REQUEST';
      break;
    case 401:
      message = 'Unauthorized';
      code = 'UNAUTHORIZED';
      break;
    case 403:
      message = 'Forbidden';
      code = 'FORBIDDEN';
      break;
    case 404:
      message = 'Not found';
      code = 'NOT_FOUND';
      break;
    case 409:
      message = 'Conflict';
      code = 'CONFLICT';
      break;
    case 422:
      message = 'Validation error';
      code = 'VALIDATION_ERROR';
      break;
    case 500:
      message = 'Internal server error';
      code = 'INTERNAL_SERVER_ERROR';
      break;
    case 502:
      message = 'Bad gateway';
      code = 'BAD_GATEWAY';
      break;
    case 503:
      message = 'Service unavailable';
      code = 'SERVICE_UNAVAILABLE';
      break;
    default:
      message = `HTTP ${statusCode} error`;
      code = 'HTTP_ERROR';
  }

  return new ApiError(message, code, statusCode, path);
};

// Error recovery strategies
export const getErrorRecoveryAction = (error: unknown): string => {
  if (isNetworkError(error)) {
    return 'Please check your internet connection and try again';
  }

  if (isAuthenticationError(error)) {
    return 'Please log in again to continue';
  }

  if (isAuthorizationError(error)) {
    return 'You do not have permission to perform this action';
  }

  if (isNotFoundError(error)) {
    return 'The requested resource was not found';
  }

  if (isConflictError(error)) {
    return 'The resource already exists or is in use';
  }

  if (isValidationError(error)) {
    return 'Please check your input and try again';
  }

  return 'Please try again or contact support if the problem persists';
};

// Enhanced API error parser for response body errors
export const parseResponseBodyError = (
  responseBody: unknown
): ApiError | null => {
  if (typeof responseBody === 'object' && responseBody !== null) {
    const body = responseBody as any;

    // Check for the specific error format: {"ok":false,"status":409,"error":{"code":"COURSE_EXISTS","message":"..."}}
    if (
      body.ok === false &&
      body.error &&
      typeof body.error === 'object'
    ) {
      return new ApiError(
        body.error.message || 'An error occurred',
        body.error.code || 'API_ERROR',
        body.status || 500,
        '', // path not available in this context
        body.error.details,
        body.error.validationErrors
      );
    }

    // Check for nested error format: {"error": {"code": "...", "message": "..."}}
    if (body.error && typeof body.error === 'object') {
      return new ApiError(
        body.error.message || 'An error occurred',
        body.error.code || 'API_ERROR',
        body.status || 500,
        '',
        body.error.details,
        body.error.validationErrors
      );
    }
  }

  return null;
};

// User-friendly error message formatter
export const getUserFriendlyErrorMessage = (
  error: unknown
): string => {
  if (isApiError(error)) {
    switch (error.code) {
      case 'COURSE_EXISTS':
        return 'A course with this ID already exists. Please use a different ID.';
      case 'ORGANIZATION_EXISTS':
        return 'An organization with this name already exists. Please use a different name.';
      case 'LEARNER_EXISTS':
        return 'A learner with this email already exists for this course.';
      case 'VALIDATION_ERROR':
        return 'Please check your input and try again.';
      case 'AUTHENTICATION_ERROR':
        return 'Please log in again to continue.';
      case 'AUTHORIZATION_ERROR':
        return 'You do not have permission to perform this action.';
      case 'NOT_FOUND_ERROR':
        return 'The requested resource was not found.';
      case 'CONFLICT_ERROR':
        return 'The resource already exists or is in use.';
      case 'NETWORK_ERROR':
        return 'Please check your internet connection and try again.';
      case 'TIMEOUT_ERROR':
        return 'The request timed out. Please try again.';
      default:
        return error.message;
    }
  }

  if (isAppError(error)) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
};
