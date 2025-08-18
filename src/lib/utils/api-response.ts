/**
 * Standardized API response utilities
 */

export type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  meta?: Record<string, any>;
};

/**
 * Create a success response
 */
export function successResponse<T>(
  data: T,
  meta?: Record<string, any>
): ApiResponse<T> {
  return {
    success: true,
    data,
    ...(meta && { meta }),
  };
}

/**
 * Create a paginated success response
 */
export function paginatedResponse<T>(
  data: T[],
  pagination: {
    page: number;
    limit: number;
    total: number;
  },
  meta?: Record<string, any>
): ApiResponse<T[]> {
  return {
    success: true,
    data,
    pagination: {
      ...pagination,
      pages: Math.ceil(pagination.total / pagination.limit),
    },
    ...(meta && { meta }),
  };
}

/**
 * Create an error response
 */
export function errorResponse(
  error: string,
  message?: string,
  meta?: Record<string, any>
): ApiResponse {
  return {
    success: false,
    error,
    ...(message && { message }),
    ...(meta && { meta }),
  };
}

/**
 * Handle and format API errors consistently
 */
export function handleApiError(error: unknown): {
  message: string;
  status: number;
} {
  console.error("API Error:", error);

  if (error instanceof Error) {
    // Handle specific error types
    if (error.message.includes("not found")) {
      return { message: "Resource not found", status: 404 };
    }
    if (
      error.message.includes("unauthorized") ||
      error.message.includes("forbidden")
    ) {
      return { message: "Access denied", status: 403 };
    }
    if (
      error.message.includes("validation") ||
      error.message.includes("invalid")
    ) {
      return { message: "Invalid request data", status: 400 };
    }

    return { message: error.message, status: 500 };
  }

  return { message: "An unexpected error occurred", status: 500 };
}
