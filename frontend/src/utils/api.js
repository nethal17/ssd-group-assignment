import axios from 'axios';

/**
 * Centralized API Configuration
 * 
 * This module provides a configured axios instance for all API calls.
 * Benefits:
 * - Single source of truth for API URL
 * - Centralized request/response interceptors
 * - Automatic authentication token handling
 * - Consistent error handling
 */

// Get the API base URL from environment variables
// In development: http://localhost:3000
// In production: your deployed backend URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Timeout after 30 seconds
  timeout: 30000,
});

// Request interceptor - Add auth token to requests
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    // If token exists, add it to Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle common errors
api.interceptors.response.use(
  (response) => {
    // Return successful response data
    return response;
  },
  (error) => {
    // Handle common error scenarios
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          break;
        case 403:
          // Forbidden - user doesn't have permission
          console.error('Access forbidden:', data.message || 'You do not have permission to perform this action');
          break;
        case 404:
          // Not found
          console.error('Resource not found:', data.message || 'The requested resource was not found');
          break;
        case 500:
          // Server error
          console.error('Server error:', data.message || 'An internal server error occurred');
          break;
        default:
          console.error(`API Error (${status}):`, data.message || 'An error occurred');
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error('Network error: No response from server. Please check your internet connection.');
    } else {
      // Something else happened
      console.error('Request error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

/**
 * API Helper Methods
 * These provide convenient wrappers around common HTTP methods
 */

export const apiService = {
  /**
   * GET request
   * @param {string} url - Endpoint URL (relative to base URL)
   * @param {object} config - Optional axios config
   * @returns {Promise} Axios response promise
   */
  get: (url, config = {}) => api.get(url, config),

  /**
   * POST request
   * @param {string} url - Endpoint URL (relative to base URL)
   * @param {object} data - Request body data
   * @param {object} config - Optional axios config
   * @returns {Promise} Axios response promise
   */
  post: (url, data, config = {}) => api.post(url, data, config),

  /**
   * PUT request
   * @param {string} url - Endpoint URL (relative to base URL)
   * @param {object} data - Request body data
   * @param {object} config - Optional axios config
   * @returns {Promise} Axios response promise
   */
  put: (url, data, config = {}) => api.put(url, data, config),

  /**
   * PATCH request
   * @param {string} url - Endpoint URL (relative to base URL)
   * @param {object} data - Request body data
   * @param {object} config - Optional axios config
   * @returns {Promise} Axios response promise
   */
  patch: (url, data, config = {}) => api.patch(url, data, config),

  /**
   * DELETE request
   * @param {string} url - Endpoint URL (relative to base URL)
   * @param {object} config - Optional axios config
   * @returns {Promise} Axios response promise
   */
  delete: (url, config = {}) => api.delete(url, config),

  /**
   * Upload file(s) with FormData
   * @param {string} url - Endpoint URL (relative to base URL)
   * @param {FormData} formData - FormData object with files
   * @param {Function} onUploadProgress - Optional progress callback
   * @returns {Promise} Axios response promise
   */
  upload: (url, formData, onUploadProgress = null) => {
    return api.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });
  },
};

// Export the base API URL for components that need it
export const API_URL = API_BASE_URL;

// Export the axios instance as default for advanced usage
export default api;
