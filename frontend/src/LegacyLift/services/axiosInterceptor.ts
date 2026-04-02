import axios, {
  AxiosInstance,
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";
import Cookies from "js-cookie";

// Environment variables for Vite
const API_BASE_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:3007/api/v1";
// const API_TIMEOUT = 10000;

// ============================================
// Refresh Token State Management
// ============================================
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

/**
 * Process queued requests after refresh token attempt
 * @param error - If provided, rejects all queued requests; otherwise resolves them
 */
const processQueue = (error: AxiosError | null): void => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

/**
 * Clear authentication state and redirect to login
 */
const handleAuthFailure = (): void => {
  Cookies.remove("IsToken");
  localStorage.removeItem("userName");
  localStorage.removeItem("currentStep");

  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
};

// Create axios instance with default configuration
const APIInterceptor: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  // timeout: API_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Request Interceptor
APIInterceptor.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    // No need to manually add token since HttpOnly cookie is sent automatically
    // Add custom headers if needed
    if (config.headers) {
      config.headers["X-Requested-With"] = "XMLHttpRequest";
      config.headers["X-Client-Version"] = "1.0.0";
    }
    return config;
  },
  (error: AxiosError): Promise<AxiosError> => Promise.reject(error)
);

// Response Interceptor with Refresh Token Logic
APIInterceptor.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => response,
  async (error: AxiosError): Promise<unknown> => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response) {
      const { status, data } = error.response;

      // Handle 401 Unauthorized - Attempt Token Refresh
      if (status === 401 && !originalRequest._retry) {
        // Skip refresh for auth endpoints to prevent infinite loops
        const isAuthEndpoint = originalRequest.url?.includes("/auth/");
        if (isAuthEndpoint) {
          handleAuthFailure();
          return Promise.reject(error);
        }

        // If already refreshing, queue this request
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then(() => APIInterceptor(originalRequest))
            .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          // Attempt to refresh the token
          await axios.post(
            `${API_BASE_URL}/auth/refresh`,
            {},
            { withCredentials: true }
          );

          // Refresh successful - process queued requests
          processQueue(null);

          // Retry the original request
          return APIInterceptor(originalRequest);
        } catch (refreshError) {
          // Refresh failed - reject all queued requests
          processQueue(refreshError as AxiosError);

          // Clear auth state and redirect to login
          handleAuthFailure();

          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      } else if (status !== 401) {
        // Handle other HTTP errors
        handleHttpError(status, data);
      }
    } else if (error.request) {
      // Network error
      handleNetworkError();
    }

    return Promise.reject(error);
  }
);
function handleHttpError(status: number, data: any): void {
  let message = "An unexpected error occurred";

  switch (status) {
    case 400:
      message = "Bad Request: Please check your input";
      break;
    case 403:
      message = "Forbidden: Access denied";
      break;
    case 404:
      message = "Not Found: Resource not available";
      break;
    case 422:
      message = "Validation Error: Please check your data";
      break;
    case 500:
      message = "Server Error: Please try again later";
      break;
    default:
      if (data?.message) {
        message = data.message;
      }
  }
}

function handleNetworkError(): void {
  const message = "Network Error: Please check your connection";

  if (import.meta.env.DEV) {
    console.error(message);
  }
}

export default APIInterceptor;

// Export additional utilities if needed
export { APIInterceptor };