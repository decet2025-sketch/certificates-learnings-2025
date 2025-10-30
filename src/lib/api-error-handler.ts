import { 
  AppError, 
  ApiError, 
  NetworkError, 
  AuthenticationError, 
  AuthorizationError, 
  NotFoundError, 
  ConflictError,
  parseApiError,
  logError,
  retry
} from './error-handling'

// API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api'
const DEFAULT_TIMEOUT = 10000
const MAX_RETRIES = 3

// Request configuration interface
interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  headers?: Record<string, string>
  body?: unknown
  timeout?: number
  retries?: number
  skipAuth?: boolean
}

// Enhanced fetch with error handling
export const apiRequest = async <T = unknown>(
  endpoint: string,
  config: RequestConfig = {}
): Promise<T> => {
  const {
    method = 'GET',
    headers = {},
    body,
    timeout = DEFAULT_TIMEOUT,
    retries = MAX_RETRIES,
    skipAuth = false
  } = config

  const url = `${API_BASE_URL}${endpoint}`
  
  // Prepare headers
  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers
  }

  // Add authentication header if not skipped
  if (!skipAuth) {
    const token = localStorage.getItem('auth-token')
    if (token) {
      requestHeaders.Authorization = `Bearer ${token}`
    }
  }

  // Prepare request options
  const requestOptions: RequestInit = {
    method,
    headers: requestHeaders,
    signal: AbortSignal.timeout(timeout)
  }

  // Add body for non-GET requests
  if (body && method !== 'GET') {
    requestOptions.body = JSON.stringify(body)
  }

  // Execute request with retry logic
  return retry(
    async () => {
      try {
        const response = await fetch(url, requestOptions)
        
        // Handle different response types
        if (!response.ok) {
          let errorData: unknown
          
          try {
            errorData = await response.json()
          } catch {
            errorData = { error: { message: response.statusText } }
          }
          
          const apiError = parseApiError(response, errorData)
          logError(apiError, `API Request: ${method} ${endpoint}`)
          throw apiError
        }

        // Parse response
        const contentType = response.headers.get('content-type')
        if (contentType && contentType.includes('application/json')) {
          return await response.json() as T
        }
        
        return await response.text() as T
      } catch (error) {
        // Handle different types of errors
        if (error instanceof ApiError) {
          throw error
        }
        
        if (error instanceof DOMException && error.name === 'AbortError') {
          throw new AppError('Request timeout', 'TIMEOUT_ERROR', 408)
        }
        
        if (error instanceof TypeError && error.message.includes('fetch')) {
          throw new NetworkError('Network connection failed')
        }
        
        logError(error, `API Request: ${method} ${endpoint}`)
        throw new AppError('Request failed', 'REQUEST_ERROR', 500)
      }
    },
    retries,
    1000
  )
}

// Specific API methods
export const apiGet = <T = unknown>(endpoint: string, config?: Omit<RequestConfig, 'method' | 'body'>) =>
  apiRequest<T>(endpoint, { ...config, method: 'GET' })

export const apiPost = <T = unknown>(endpoint: string, body?: unknown, config?: Omit<RequestConfig, 'method'>) =>
  apiRequest<T>(endpoint, { ...config, method: 'POST', body })

export const apiPut = <T = unknown>(endpoint: string, body?: unknown, config?: Omit<RequestConfig, 'method'>) =>
  apiRequest<T>(endpoint, { ...config, method: 'PUT', body })

export const apiPatch = <T = unknown>(endpoint: string, body?: unknown, config?: Omit<RequestConfig, 'method'>) =>
  apiRequest<T>(endpoint, { ...config, method: 'PATCH', body })

export const apiDelete = <T = unknown>(endpoint: string, config?: Omit<RequestConfig, 'method' | 'body'>) =>
  apiRequest<T>(endpoint, { ...config, method: 'DELETE' })

// File upload utility
export const apiUpload = async <T = unknown>(
  endpoint: string,
  file: File,
  additionalData?: Record<string, unknown>
): Promise<T> => {
  const formData = new FormData()
  formData.append('file', file)
  
  if (additionalData) {
    Object.entries(additionalData).forEach(([key, value]) => {
      formData.append(key, String(value))
    })
  }

  const url = `${API_BASE_URL}${endpoint}`
  const token = localStorage.getItem('auth-token')
  
  const requestOptions: RequestInit = {
    method: 'POST',
    headers: {
      ...(token && { Authorization: `Bearer ${token}` })
    },
    body: formData,
    signal: AbortSignal.timeout(DEFAULT_TIMEOUT)
  }

  try {
    const response = await fetch(url, requestOptions)
    
    if (!response.ok) {
      let errorData: unknown
      
      try {
        errorData = await response.json()
      } catch {
        errorData = { error: { message: response.statusText } }
      }
      
      const apiError = parseApiError(response, errorData)
      logError(apiError, `File Upload: ${endpoint}`)
      throw apiError
    }

    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      return await response.json() as T
    }
    
    return await response.text() as T
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new AppError('Upload timeout', 'TIMEOUT_ERROR', 408)
    }
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new NetworkError('Network connection failed')
    }
    
    logError(error, `File Upload: ${endpoint}`)
    throw new AppError('Upload failed', 'UPLOAD_ERROR', 500)
  }
}

// Batch request utility
export const apiBatch = async <T = unknown>(
  requests: Array<{ endpoint: string; config?: RequestConfig }>
): Promise<T[]> => {
  try {
    const promises = requests.map(({ endpoint, config }) => 
      apiRequest<T>(endpoint, config)
    )
    
    return await Promise.all(promises)
  } catch (error) {
    logError(error, 'Batch API Request')
    throw error
  }
}

// Request interceptor for adding common headers
export const addRequestInterceptor = (interceptor: (config: RequestConfig) => RequestConfig) => {
  // This would be implemented with a request interceptor system
  // For now, we'll use a simple approach
  console.log('Request interceptor added:', interceptor)
}

// Response interceptor for handling common responses
export const addResponseInterceptor = (interceptor: (response: Response) => Response) => {
  // This would be implemented with a response interceptor system
  // For now, we'll use a simple approach
  console.log('Response interceptor added:', interceptor)
}

// Error interceptor for handling common errors
export const addErrorInterceptor = (interceptor: (error: AppError) => AppError) => {
  // This would be implemented with an error interceptor system
  // For now, we'll use a simple approach
  console.log('Error interceptor added:', interceptor)
}

// Utility to check if error is retryable
export const isRetryableError = (error: unknown): boolean => {
  if (error instanceof NetworkError) return true
  if (error instanceof AppError && error.statusCode && error.statusCode >= 500) return true
  if (error instanceof AppError && error.statusCode === 408) return true // Timeout
  if (error instanceof AppError && error.statusCode === 429) return true // Rate limit
  return false
}

// Utility to get user-friendly error message
export const getUserFriendlyMessage = (error: unknown): string => {
  if (error instanceof ApiError) {
    switch (error.code) {
      case 'VALIDATION_ERROR':
        return 'Please check your input and try again'
      case 'AUTHENTICATION_ERROR':
        return 'Please log in again to continue'
      case 'AUTHORIZATION_ERROR':
        return 'You do not have permission to perform this action'
      case 'NOT_FOUND_ERROR':
        return 'The requested resource was not found'
      case 'CONFLICT_ERROR':
        return 'The resource already exists or is in use'
      case 'NETWORK_ERROR':
        return 'Please check your internet connection and try again'
      case 'TIMEOUT_ERROR':
        return 'The request timed out. Please try again'
      default:
        return error.message
    }
  }
  
  if (error instanceof AppError) {
    return error.message
  }
  
  return 'An unexpected error occurred. Please try again'
}
