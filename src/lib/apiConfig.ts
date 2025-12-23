// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const API_BASE_PATH = '/api';

export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  BASE_PATH: API_BASE_PATH,
  ENDPOINTS: {
    // Users
    USERS: {
      BASE: `${API_BASE_URL}${API_BASE_PATH}/users`,
      REGISTER: `${API_BASE_URL}${API_BASE_PATH}/users/register`,
      LOGIN: `${API_BASE_URL}${API_BASE_PATH}/users/login`,
      PROFILE: `${API_BASE_URL}${API_BASE_PATH}/users/profile`,
      SEARCH: `${API_BASE_URL}${API_BASE_PATH}/users/search`,
      ASSIGN_ROLE: `${API_BASE_URL}${API_BASE_PATH}/users/assign-role`,
    },
    // Pumps
    PUMPS: {
      BASE: `${API_BASE_URL}${API_BASE_PATH}/pumps`,
      NEARBY: `${API_BASE_URL}${API_BASE_PATH}/pumps/nearby`,
    },
    // Bookings
    BOOKINGS: {
      BASE: `${API_BASE_URL}${API_BASE_PATH}/bookings`,
    },
    // Tokens
    TOKENS: {
      BASE: `${API_BASE_URL}${API_BASE_PATH}/tokens`,
    },
    // Payments
    PAYMENTS: {
      BASE: `${API_BASE_URL}${API_BASE_PATH}/payments`,
    },
    // Reminders
    REMINDERS: {
      BASE: `${API_BASE_URL}${API_BASE_PATH}/reminders`,
    },
    // AI Predictions
    AI: {
      BASE: `${API_BASE_URL}${API_BASE_PATH}/ai`,
    },
  },
};

// Helper function to get the API URL
export const getApiUrl = (endpoint: string) => {
  return `${API_BASE_URL}${API_BASE_PATH}/${endpoint}`;
};