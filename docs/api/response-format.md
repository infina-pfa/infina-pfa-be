# API Response Format Documentation

## Overview

All API responses in the Infina PFA Backend follow a consistent format for both success and error responses. This document describes the response structure and how to handle them in client applications.

## Success Response Format

All successful API responses are wrapped by the `ResponseInterceptor` with the following structure:

```typescript
interface SuccessResponse<T> {
  data: T; // The actual response payload
  status: number; // HTTP status code (200, 201, etc.)
  code: string; // Always "success" for successful responses
  timestamp: string; // ISO 8601 timestamp of the response
}
```

### Example Success Response

```json
{
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Monthly Groceries",
    "amount": 500.0,
    "category": "flexible"
  },
  "status": 201,
  "code": "success",
  "timestamp": "2025-01-11T10:30:45.123Z"
}
```

## Error Response Format

All error responses are handled by the `AllExceptionsFilter` with the following structure:

```typescript
interface ErrorResponse {
  statusCode: number; // HTTP status code (400, 404, 500, etc.)
  code: string; // Error code for identifying specific errors
  message: string; // Human-readable error message
  error: string; // Error type/name (e.g., "NotFoundException")
  timestamp: string; // ISO 8601 timestamp of the error
  path: string; // The API path that was called
}
```

### Example Error Responses

#### Validation Error (400)

```json
{
  "statusCode": 400,
  "code": "bad_request",
  "message": "amount must not be less than 0.01, name should not be empty",
  "error": "BadRequestException",
  "timestamp": "2025-01-11T10:30:45.123Z",
  "path": "/api/v1/budgets"
}
```

#### Resource Not Found (404)

```json
{
  "statusCode": 404,
  "code": "BUDGET_NOT_FOUND",
  "message": "Budget not found",
  "error": "NotFoundException",
  "timestamp": "2025-01-11T10:30:45.123Z",
  "path": "/api/v1/budgets/123"
}
```

#### Unauthorized (401)

```json
{
  "statusCode": 401,
  "code": "unauthorized",
  "message": "Invalid or expired token",
  "error": "UnauthorizedException",
  "timestamp": "2025-01-11T10:30:45.123Z",
  "path": "/api/v1/budgets"
}
```

## Summary

- All successful responses are wrapped with `data`, `status`, `code`, and `timestamp`
- All error responses include `statusCode`, `code`, `message`, `error`, `timestamp`, and `path`
- Always extract the `data` field from successful responses
- Use the `code` field to identify specific error types
- Consider using a centralized response handler for consistency
