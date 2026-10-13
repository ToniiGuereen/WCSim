export class ApiError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, message: string, code = 'ERROR') {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

export const badRequest = (message: string) => new ApiError(400, message, 'BAD_REQUEST');
export const notFound = (message: string) => new ApiError(404, message, 'NOT_FOUND');
export const conflict = (message: string) => new ApiError(409, message, 'CONFLICT');
