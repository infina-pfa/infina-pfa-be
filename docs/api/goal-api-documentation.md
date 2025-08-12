# Goal API Documentation

## Overview

This document provides API documentation for financial goal management endpoints. All endpoints require authentication via Supabase Auth JWT tokens.

**Note:** All responses follow the standard wrapped format. See [Response Format Documentation](./response-format.md) for details on handling responses and errors.

## Base Configuration

### Base URL

```
http://localhost:3000/api/v1
```

### Authentication

```typescript
headers: {
  'Authorization': `Bearer ${accessToken}`,
  'Content-Type': 'application/json'
}
```

## Goal-Specific Error Codes

```typescript
enum GoalErrorCode {
  INVALID_GOAL = 'INVALID_GOAL', // Invalid goal data
  GOAL_NOT_FOUND = 'GOAL_NOT_FOUND', // Goal doesn't exist
  GOAL_INVALID_TARGET_AMOUNT = 'GOAL_INVALID_TARGET_AMOUNT', // Invalid target amount
  GOAL_INVALID_DUE_DATE = 'GOAL_INVALID_DUE_DATE', // Invalid due date
  GOAL_TITLE_ALREADY_EXISTS = 'GOAL_TITLE_ALREADY_EXISTS', // Duplicate title for user
  GOAL_INSUFFICIENT_BALANCE = 'GOAL_INSUFFICIENT_BALANCE', // Not enough funds to withdraw
}
```

## Data Types

### GoalResponseDto

```typescript
interface GoalResponseDto {
  id: string; // UUID
  title: string; // Goal title
  description?: string; // Goal description (nullable)
  currentAmount: number; // Currently saved amount
  targetAmount?: number; // Target amount (nullable)
  dueDate?: string; // ISO 8601 date (nullable)
  createdAt: string; // ISO 8601 timestamp
  updatedAt: string; // ISO 8601 timestamp
  remainingAmount: number; // Computed: targetAmount - currentAmount
  transactions: TransactionResponseDto[]; // Related transactions
}

interface TransactionResponseDto {
  id: string; // Transaction UUID
  name: string; // Transaction name
  description: string; // Transaction description
  amount: number; // Transaction amount
  type: 'goal_contribution' | 'goal_withdrawal'; // Transaction type
  recurring: number; // 0 = one-time, >0 = frequency in days
  createdAt: string; // ISO 8601 timestamp
  updatedAt: string; // ISO 8601 timestamp
}
```

## API Endpoints

### 1. Create Goal

Creates a new financial goal for the authenticated user.

**Endpoint:** `POST /goals`

**Request Body:**

```typescript
{
  title: string;           // Required, non-empty
  description?: string;    // Optional
  targetAmount?: number;   // Optional, min: 0
  dueDate?: string;        // Optional, ISO 8601 date string
}
```

**Response:** `201 Created`

Returns a `GoalResponseDto` object.

**Possible Errors:**

- `400 Bad Request` - Validation errors (invalid amount, invalid date)
- `401 Unauthorized` - Missing or invalid token
- `409 Conflict` - Goal with same title already exists for this user

**NextJS Implementation:**

```typescript
// app/lib/api/goals.ts
export async function createGoal(data: CreateGoalRequest) {
  const session = await getSession();

  const response = await fetch(`${API_URL}/goals`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  return handleApiResponse<GoalResponseDto>(response);
}
```

### 2. Get All Goals

Retrieves all financial goals for the authenticated user.

**Endpoint:** `GET /goals`

**Response:** `200 OK`

Returns an array of `GoalResponseDto[]`.

**Possible Errors:**

- `401 Unauthorized` - Missing or invalid token

**NextJS Implementation:**

```typescript
// app/lib/api/goals.ts
export async function getGoals() {
  const session = await getSession();

  const response = await fetch(`${API_URL}/goals`, {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  return handleApiResponse<GoalResponseDto[]>(response);
}
```

### 3. Update Goal

Updates an existing financial goal.

**Endpoint:** `PATCH /goals/{id}`

**Path Parameters:**

- `id` - Goal UUID (required)

**Request Body (all fields optional):**

```typescript
{
  title?: string;          // If provided, must be non-empty
  description?: string;
  targetAmount?: number;   // If provided, min: 0
  dueDate?: string;        // ISO 8601 date string
}
```

**Response:** `200 OK`

Returns updated `GoalResponseDto`.

**Possible Errors:**

- `400 Bad Request` - Validation errors
- `401 Unauthorized` - Missing or invalid token
- `404 Not Found` - Goal doesn't exist
- `409 Conflict` - Goal with same title already exists

**NextJS Implementation:**

```typescript
// app/lib/api/goals.ts
export async function updateGoal(goalId: string, data: UpdateGoalRequest) {
  const session = await getSession();

  const response = await fetch(`${API_URL}/goals/${goalId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  return handleApiResponse<GoalResponseDto>(response);
}
```

### 4. Contribute to Goal

Adds money to a financial goal.

**Endpoint:** `POST /goals/{id}/contribute`

**Path Parameters:**

- `id` - Goal UUID (required)

**Request Body:**

```typescript
{
  amount: number;          // Required, min: 0.01
  name?: string;           // Optional, transaction name
  description?: string;    // Optional, transaction description
  recurring?: number;      // Optional, default: 0 (0 = one-time, >0 = days)
}
```

**Response:** `200 OK`

Returns updated `GoalResponseDto` with new transaction.

**Possible Errors:**

- `400 Bad Request` - Validation errors (invalid amount)
- `401 Unauthorized` - Missing or invalid token
- `404 Not Found` - Goal doesn't exist

**NextJS Implementation:**

```typescript
// app/lib/api/goals.ts
export async function contributeToGoal(
  goalId: string,
  data: ContributeGoalRequest,
) {
  const session = await getSession();

  const response = await fetch(`${API_URL}/goals/${goalId}/contribute`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  return handleApiResponse<GoalResponseDto>(response);
}
```

### 5. Withdraw from Goal

Withdraws money from a financial goal.

**Endpoint:** `POST /goals/{id}/withdraw`

**Path Parameters:**

- `id` - Goal UUID (required)

**Request Body:**

```typescript
{
  amount: number;          // Required, min: 0.01
  name?: string;           // Optional, transaction name
  description?: string;    // Optional, transaction description
  recurring?: number;      // Optional, default: 0 (0 = one-time, >0 = days)
}
```

**Response:** `200 OK`

Returns updated `GoalResponseDto` with new transaction.

**Possible Errors:**

- `400 Bad Request` - Validation errors or insufficient balance
- `401 Unauthorized` - Missing or invalid token
- `404 Not Found` - Goal doesn't exist

**NextJS Implementation:**

```typescript
// app/lib/api/goals.ts
export async function withdrawFromGoal(
  goalId: string,
  data: WithdrawGoalRequest,
) {
  const session = await getSession();

  const response = await fetch(`${API_URL}/goals/${goalId}/withdraw`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  return handleApiResponse<GoalResponseDto>(response);
}
```

## Key Implementation Notes

1. **Response Format**: All responses are wrapped. See [Response Format Documentation](./response-format.md)
2. **Authentication**: Bearer token required for all endpoints
3. **Date Format**: ISO 8601 strings for all dates and timestamps
4. **Amount Validation**: Minimum value 0.01 for all contributions/withdrawals
5. **Target Amount**: Optional but must be >= 0 when provided
6. **Due Date**: Optional ISO 8601 date string
7. **UUIDs**: All IDs are UUID v4 format
8. **Recurring**: 0 = one-time, positive integer = days between recurrences
9. **Computed Fields**: `remainingAmount` is automatically calculated
10. **Transactions**: All goals include full transaction history

## Additional Resources

- [Response Format Documentation](./response-format.md) - Detailed guide on handling wrapped responses
- [Budget API Documentation](./budget-api-documentation.md) - Budget management endpoints
- [Authentication Guide](./authentication.md) - Supabase Auth integration details
