export interface ErrorDetails {
  code: string;
  message: string;
}

export class AppError extends Error {
  readonly code: string;

  constructor(errorDetails: ErrorDetails) {
    super(errorDetails.message);
    this.code = errorDetails.code;
    this.name = 'AppError';
  }
}
