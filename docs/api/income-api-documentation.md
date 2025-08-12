# Income API Documentation

## Overview

This document provides API documentation for income management endpoints. All endpoints require authentication via Supabase Auth JWT tokens.

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

## Income-Specific Error Codes

```typescript
enum IncomeErrorCode {
  INCOME_NOT_FOUND = 'INCOME_NOT_FOUND', // Income transaction doesn't exist
}
```

## Data Types

### TransactionResponseDto (Income)

```typescript
interface TransactionResponseDto {
  id: string; // Transaction UUID
  name: string; // Income name (e.g., "Salary")
  description: string; // Transaction description
  amount: number; // Income amount
  type: 'income'; // Transaction type (always 'income')
  recurring: number; // 0 = one-time, >0 = frequency in days
  createdAt: string; // ISO 8601 timestamp
  updatedAt: string; // ISO 8601 timestamp
}
```

## API Endpoints

### 1. Get Monthly Income

Retrieves all income transactions for a specific month and year.

**Endpoint:** `GET /budgets/income?month={month}&year={year}`

**Query Parameters:**

```typescript
{
  month: number; // Required, 1-12
  year: number; // Required, 1900-3000
}
```

**Response:** `200 OK`

Returns an array of `TransactionResponseDto[]`.

**Possible Errors:**

- `400 Bad Request` - Invalid query parameters
- `401 Unauthorized` - Missing or invalid token

**NextJS Implementation:**

```typescript
// app/lib/api/income.ts
export async function getMonthlyIncome(month: number, year: number) {
  const session = await getSession();

  const params = new URLSearchParams({
    month: month.toString(),
    year: year.toString(),
  });

  const response = await fetch(`${API_URL}/budgets/income?${params}`, {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  return handleApiResponse<TransactionResponseDto[]>(response);
}
```

### 2. Add Income

Creates a new income transaction.

**Endpoint:** `POST /budgets/income`

**Request Body:**

```typescript
{
  name: string; // Required, non-empty (e.g., "Salary", "Freelance")
  amount: number; // Required, min: 0.01
  recurring: number; // Required, 0 = one-time, >0 = frequency in days
}
```

**Response:** `201 Created`

Returns a `TransactionResponseDto` object.

**Possible Errors:**

- `400 Bad Request` - Validation errors (invalid amount, empty name)
- `401 Unauthorized` - Missing or invalid token

**NextJS Implementation:**

```typescript
// app/lib/api/income.ts
export async function addIncome(data: CreateIncomeRequest) {
  const session = await getSession();

  const response = await fetch(`${API_URL}/budgets/income`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  return handleApiResponse<TransactionResponseDto>(response);
}
```

### 3. Update Income

Updates an existing income transaction.

**Endpoint:** `PATCH /budgets/income/{id}`

**Path Parameters:**

- `id` - Income transaction UUID (required)

**Request Body:**

```typescript
{
  name: string; // Required, non-empty
  amount: number; // Required, min: 0.01
  recurring: number; // Required, 0 = one-time, >0 = frequency in days
}
```

**Response:** `200 OK`

Returns updated `TransactionResponseDto`.

**Possible Errors:**

- `400 Bad Request` - Validation errors
- `401 Unauthorized` - Missing or invalid token
- `404 Not Found` - Income transaction doesn't exist

**NextJS Implementation:**

```typescript
// app/lib/api/income.ts
export async function updateIncome(
  incomeId: string,
  data: UpdateIncomeRequest,
) {
  const session = await getSession();

  const response = await fetch(`${API_URL}/budgets/income/${incomeId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  return handleApiResponse<TransactionResponseDto>(response);
}
```

### 4. Delete Income

Deletes an income transaction.

**Endpoint:** `DELETE /budgets/income/{id}`

**Path Parameters:**

- `id` - Income transaction UUID (required)

**Response:** `200 OK`

No response body.

**Possible Errors:**

- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Access denied to income
- `404 Not Found` - Income transaction doesn't exist

**NextJS Implementation:**

```typescript
// app/lib/api/income.ts
export async function deleteIncome(incomeId: string) {
  const session = await getSession();

  const response = await fetch(`${API_URL}/budgets/income/${incomeId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  return handleApiResponse<void>(response);
}
```

## Common Income Patterns

### Recurring Income Types

```typescript
const RECURRING_PATTERNS = {
  ONE_TIME: 0,
  WEEKLY: 7,
  BI_WEEKLY: 14,
  MONTHLY: 30,
  QUARTERLY: 90,
  SEMI_ANNUAL: 180,
  ANNUAL: 365,
};

// Example: Set monthly salary
const monthlySalary = {
  name: 'Monthly Salary',
  amount: 5000,
  recurring: RECURRING_PATTERNS.MONTHLY,
};
```

### Income Categories (for UI organization)

```typescript
// These are not enforced by the API but useful for UI
const INCOME_CATEGORIES = [
  'Salary',
  'Freelance',
  'Investment',
  'Rental',
  'Business',
  'Side Hustle',
  'Dividends',
  'Royalties',
  'Other',
];
```

## Key Implementation Notes

1. **Response Format**: All responses are wrapped. See [Response Format Documentation](./response-format.md)
2. **Authentication**: Bearer token required for all endpoints
3. **Amount Validation**: Minimum value 0.01 for all income amounts
4. **Name Field**: Required and must be non-empty
5. **Recurring**: 0 = one-time, positive integer = days between recurrences
6. **Month Values**: 1-based (January = 1, December = 12)
7. **Year Range**: 1900-3000 for queries
8. **UUIDs**: All IDs are UUID v4 format
9. **Timestamps**: ISO 8601 format for all dates
10. **Transaction Type**: Always 'income' for these endpoints

## Additional Resources

- [Response Format Documentation](./response-format.md) - Detailed guide on handling wrapped responses
- [Budget API Documentation](./budget-api-documentation.md) - Budget and spending management
- [Goal API Documentation](./goal-api-documentation.md) - Financial goal management
- [Authentication Guide](./authentication.md) - Supabase Auth integration details
