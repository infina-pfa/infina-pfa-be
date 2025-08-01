export enum CommonErrorCode {
  // Authentication errors
  UNAUTHORIZED_NO_TOKEN = 'AUTH_001',
  UNAUTHORIZED_INVALID_TOKEN = 'AUTH_002',

  // Value object errors
  CURRENCY_MISMATCH = 'COMMON_001',

  // General errors
  INTERNAL_SERVER_ERROR = 'COMMON_500',
}
