// Represents a generic API error structure
export interface ApiError {
  message: string;
  code?: string;
  details?: string[];
  statusCode?: number;
}

// Represents the result of an operation that can either succeed or fail
export interface Result<T> {
  isSuccess: boolean;
  value?: T;
  error?: ApiError;
}
