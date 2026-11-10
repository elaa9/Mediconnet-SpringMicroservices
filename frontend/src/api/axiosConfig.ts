import axios from 'axios'

// All requests go through the API Gateway — single entry point
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
})

// Request interceptor — log requests in development
apiClient.interceptors.request.use(
  (config) => {
    if (import.meta.env.DEV) {
      console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`)
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor — handle common errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response
      if (status === 503) {
        const errorData = {
          message: data?.message || 'A backend service is temporarily unavailable.',
          error: data?.error || 'SERVICE_UNAVAILABLE',
          hint: data?.hint || 'Make sure all microservices are running.',
        }
        return Promise.reject({ ...error, friendlyMessage: errorData.message })
      }
    } else if (error.code === 'ECONNABORTED' || !error.response) {
      return Promise.reject({
        ...error,
        friendlyMessage: 'Cannot connect to the API Gateway. Is the backend running on port 8080?',
      })
    }
    return Promise.reject(error)
  }
)

export default apiClient
