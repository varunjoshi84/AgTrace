import axios from 'axios';

// Create axios instance with base configuration
const axiosClient = axios.create({
  baseURL: 'http://localhost:5000/api', // Backend API base URL
  timeout: 10000, // 10 seconds timeout
  withCredentials: true, // Include cookies for session auth
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor (runs before every request)
axiosClient.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor (runs after every response)
axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response?.status === 401) {
      console.log('Unauthorized - redirecting to login');
      // Could dispatch logout action here
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
