/**
 * Error handling utilities
 * Standardized error handling and formatting across the application
 */

export interface AppError {
  message: string;
  code?: string;
  status?: number;
  field?: string;
  details?: Record<string, any>;
}

/**
 * Extract user-friendly error message from API error response
 */
export const extractErrorMessage = (error: any): string => {
  // Check for response data
  if (error?.response?.data) {
    const data = error.response.data;
    
    // Handle Django REST Framework validation errors
    if (typeof data === 'object') {
      // Non-field errors
      if (data.non_field_errors) {
        return Array.isArray(data.non_field_errors) 
          ? data.non_field_errors[0] 
          : data.non_field_errors;
      }
      
      // Detail error
      if (data.detail) {
        return typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail);
      }
      
      // Message error
      if (data.message) {
        return data.message;
      }
      
      // Field-specific errors - return first field error
      const fieldErrors = Object.entries(data)
        .filter(([key]) => !['status', 'code'].includes(key))
        .map(([field, errors]) => {
          const errorMsg = Array.isArray(errors) ? errors[0] : errors;
          return `${field}: ${errorMsg}`;
        });
      
      if (fieldErrors.length > 0) {
        return fieldErrors[0];
      }
    }
    
    // If data is a string
    if (typeof data === 'string') {
      return data;
    }
  }
  
  // Check for error message
  if (error?.message) {
    return error.message;
  }
  
  // Default error
  return 'An unexpected error occurred. Please try again.';
};

/**
 * Parse API error into structured AppError object
 */
export const parseApiError = (error: any): AppError => {
  const message = extractErrorMessage(error);
  const status = error?.response?.status;
  const code = error?.response?.data?.code || error?.code;
  
  return {
    message,
    status,
    code,
    details: error?.response?.data,
  };
};

/**
 * Format validation errors for form display
 */
export const formatValidationErrors = (error: any): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  if (error?.response?.data && typeof error.response.data === 'object') {
    Object.entries(error.response.data).forEach(([field, messages]) => {
      if (Array.isArray(messages)) {
        errors[field] = messages[0];
      } else if (typeof messages === 'string') {
        errors[field] = messages;
      }
    });
  }
  
  return errors;
};

/**
 * Check if error is network-related
 */
export const isNetworkError = (error: any): boolean => {
  return !error?.response && error?.request;
};

/**
 * Check if error is authentication-related
 */
export const isAuthError = (error: any): boolean => {
  return error?.response?.status === 401 || error?.response?.status === 403;
};

/**
 * Check if error is validation-related
 */
export const isValidationError = (error: any): boolean => {
  return error?.response?.status === 400;
};

/**
 * Check if error is not found
 */
export const isNotFoundError = (error: any): boolean => {
  return error?.response?.status === 404;
};

/**
 * Check if error is server error
 */
export const isServerError = (error: any): boolean => {
  const status = error?.response?.status;
  return status && status >= 500 && status < 600;
};

/**
 * Get error status code
 */
export const getErrorStatus = (error: any): number | undefined => {
  return error?.response?.status;
};

/**
 * Log error to console (can be extended to send to logging service)
 */
export const logError = (error: any, context?: string): void => {
  const appError = parseApiError(error);
  
  console.error(`[${context || 'Error'}]`, {
    message: appError.message,
    status: appError.status,
    code: appError.code,
    details: appError.details,
    originalError: error,
  });
};

/**
 * Handle error with toast notification (to be used with toaster)
 */
export const handleErrorWithToast = (
  error: any,
  toaster: any,
  context?: string
): void => {
  const message = extractErrorMessage(error);
  logError(error, context);
  
  toaster.create({
    title: 'Error',
    description: message,
    type: 'error',
    duration: 5000,
  });
};

export default {
  extractErrorMessage,
  parseApiError,
  formatValidationErrors,
  isNetworkError,
  isAuthError,
  isValidationError,
  isNotFoundError,
  isServerError,
  getErrorStatus,
  logError,
  handleErrorWithToast,
};
