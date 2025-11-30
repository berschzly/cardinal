// Error handling utilities for network and app errors

/**
 * Parse Supabase error messages into user-friendly text
 * @param {object} error - Supabase error object
 * @returns {string} - User-friendly error message
 */
export function parseSupabaseError(error) {
  if (!error) return 'An unknown error occurred';

  // Network errors
  if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
    return 'Network error. Please check your internet connection and try again.';
  }

  // Auth errors
  if (error.message?.includes('Invalid login credentials')) {
    return 'Invalid email or password. Please try again.';
  }
  if (error.message?.includes('Email not confirmed')) {
    return 'Please verify your email address before signing in.';
  }
  if (error.message?.includes('User already registered')) {
    return 'An account with this email already exists.';
  }

  // Database errors
  if (error.code === '23505') {
    return 'This record already exists.';
  }
  if (error.code === '23503') {
    return 'Cannot complete action due to related records.';
  }
  if (error.code === 'PGRST116') {
    return 'No records found.';
  }

  // RLS (Row Level Security) errors
  if (error.message?.includes('row-level security')) {
    return 'You do not have permission to perform this action.';
  }

  // Timeout errors
  if (error.message?.includes('timeout')) {
    return 'Request timed out. Please try again.';
  }

  // Default to the error message if it's somewhat readable
  if (error.message && error.message.length < 150) {
    return error.message;
  }

  return 'An error occurred. Please try again.';
}

/**
 * Handle async errors with user feedback
 * @param {Function} asyncFn - Async function to execute
 * @param {object} options - Options for error handling
 * @returns {object} - { data, error, success }
 */
export async function handleAsync(asyncFn, options = {}) {
  const {
    onError = null,
    onSuccess = null,
    showDefaultError = true,
    errorPrefix = '',
  } = options;

  try {
    const result = await asyncFn();
    
    if (result?.error) {
      const errorMessage = errorPrefix + parseSupabaseError(result.error);
      
      if (onError) {
        onError(errorMessage, result.error);
      } else if (showDefaultError) {
        console.error('Error:', errorMessage);
      }
      
      return { data: null, error: errorMessage, success: false };
    }

    if (onSuccess) {
      onSuccess(result?.data);
    }

    return { data: result?.data, error: null, success: true };
  } catch (err) {
    const errorMessage = errorPrefix + parseSupabaseError(err);
    
    if (onError) {
      onError(errorMessage, err);
    } else if (showDefaultError) {
      console.error('Caught error:', errorMessage);
    }

    return { data: null, error: errorMessage, success: false };
  }
}

/**
 * Retry a function with exponential backoff
 * @param {Function} fn - Function to retry
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} initialDelay - Initial delay in ms
 * @returns {Promise} - Result of the function
 */
export async function retryWithBackoff(fn, maxRetries = 3, initialDelay = 1000) {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (i < maxRetries - 1) {
        // Exponential backoff: 1s, 2s, 4s
        const delay = initialDelay * Math.pow(2, i);
        console.log(`Retry ${i + 1}/${maxRetries} after ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}

/**
 * Check if error is a network error
 * @param {Error} error - Error to check
 * @returns {boolean} - True if network error
 */
export function isNetworkError(error) {
  if (!error) return false;
  
  const networkIndicators = [
    'Failed to fetch',
    'NetworkError',
    'Network request failed',
    'timeout',
    'ECONNREFUSED',
    'ETIMEDOUT',
    'no internet',
  ];
  
  const errorMessage = error.message?.toLowerCase() || '';
  return networkIndicators.some(indicator => 
    errorMessage.includes(indicator.toLowerCase())
  );
}

/**
 * Check if error is an auth error
 * @param {Error} error - Error to check
 * @returns {boolean} - True if auth error
 */
export function isAuthError(error) {
  if (!error) return false;
  
  const authIndicators = [
    'Invalid login',
    'not authenticated',
    'unauthorized',
    'JWT',
    'token',
    'session',
  ];
  
  const errorMessage = error.message?.toLowerCase() || '';
  return authIndicators.some(indicator => 
    errorMessage.includes(indicator.toLowerCase())
  );
}

/**
 * Log error with context for debugging
 * @param {string} context - Where the error occurred
 * @param {Error} error - The error object
 * @param {object} metadata - Additional metadata
 */
export function logError(context, error, metadata = {}) {
  const timestamp = new Date().toISOString();
  const errorInfo = {
    timestamp,
    context,
    message: error?.message || 'Unknown error',
    code: error?.code,
    stack: error?.stack,
    metadata,
  };
  
  console.error(`[${timestamp}] Error in ${context}:`, errorInfo);
  
  // In production, you could send this to a logging service
  // Example: Sentry, LogRocket, etc.
}

/**
 * Create a safe error boundary wrapper for functions
 * @param {Function} fn - Function to wrap
 * @param {string} context - Context for error logging
 * @returns {Function} - Wrapped function
 */
export function withErrorBoundary(fn, context) {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      logError(context, error, { args });
      throw error;
    }
  };
}

/**
 * Validate network connectivity
 * @returns {Promise<boolean>} - True if connected
 */
export async function checkNetworkConnectivity() {
  try {
    // Try to fetch a small, reliable endpoint
    const response = await fetch('https://www.google.com/favicon.ico', {
      method: 'HEAD',
      mode: 'no-cors',
    });
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Get user-friendly error title based on error type
 * @param {Error} error - The error
 * @returns {string} - Error title
 */
export function getErrorTitle(error) {
  if (isNetworkError(error)) return 'Connection Error';
  if (isAuthError(error)) return 'Authentication Error';
  return 'Error';
}

/**
 * Get suggested action based on error type
 * @param {Error} error - The error
 * @returns {string} - Suggested action
 */
export function getErrorAction(error) {
  if (isNetworkError(error)) {
    return 'Check your internet connection and try again';
  }
  if (isAuthError(error)) {
    return 'Please sign in again';
  }
  return 'Please try again or contact support if the problem persists';
}