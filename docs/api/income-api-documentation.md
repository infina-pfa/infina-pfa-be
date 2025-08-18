# Income API Documentation

## Overview

This document provides API documentation for income management endpoints. All endpoints require authentication via Supabase Auth JWT tokens.

## Database Structure

The income management system uses the following PostgreSQL tables (managed by Prisma ORM):

### Core Tables

#### 1. `transactions` table

- **Purpose**: Stores all financial transactions including income records
- **Schema**: `public`
- **Key columns**:
  - `id` (UUID): Primary key
  - `user_id` (UUID): Foreign key to auth.users
  - `name` (String): Transaction description
  - `description` (String): Optional detailed description
  - `amount` (Decimal): Transaction amount
  - `type` (Enum): Transaction type ('income', 'budget_spending', 'goal_contribution', 'goal_withdrawal')
  - `recurring` (Integer): Recurrence frequency in days (0 for one-time)
  - `created_at`, `updated_at`, `deleted_at` (Timestamps)
- **Indexes**: Optimized for queries by user_id, type, amount, and name
- **Income Records**: Identified by `type = 'income'`

### Income Data Model

Income transactions are stored in the `transactions` table with the following characteristics:

1. **Type Identification**: `type = 'income'` distinguishes income from other transaction types
2. **Recurring Support**: The `recurring` field supports various income patterns:
   - `0`: One-time income (bonuses, gifts)
   - `7`: Weekly income
   - `14`: Bi-weekly income
   - `30`: Monthly income
   - Custom intervals for irregular patterns
3. **Soft Deletes**: Deleted income records have `deleted_at` timestamp set (not physically removed)
4. **No Budget Association**: Unlike spending transactions, income records are not linked to budgets

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
  INCOME_INVALID_AMOUNT = 'INCOME_INVALID_AMOUNT', // Amount validation failed
  INCOME_ACCESS_DENIED = 'INCOME_ACCESS_DENIED', // User doesn't own the income
}
```

## Endpoints

### 1. Get Monthly Income

Retrieves all income transactions for the authenticated user for a specific month and year.

**Endpoint:** `GET /incomes?month={month}&year={year}`

**Query Parameters:**

```typescript
interface MonthlyIncomeQuery {
  month: number; // 1-12 (required)
  year: number; // 1900-3000 (required)
}
```

**Response:** `200 OK`

```typescript
interface TransactionResponse {
  id: string; // Transaction UUID
  name: string; // Income source name
  description: string; // Optional description
  amount: number; // Income amount
  type: 'income'; // Always 'income' for this endpoint
  recurring: number; // 0 = one-time, >0 = recurring frequency in days
  createdAt: string; // ISO 8601 datetime
  updatedAt: string; // ISO 8601 datetime
  budget: {}; // Empty object for income transactions
}

type GetMonthlyIncomeResponse = TransactionResponse[];
```

**Possible Errors:**

- `400 Bad Request` - Invalid query parameters (month not 1-12, invalid year)
- `401 Unauthorized` - Missing or invalid token

**Example Request:**

```bash
curl -X GET "http://localhost:3000/api/v1/incomes?month=3&year=2025" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Example Response:**

```json
[
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Monthly Salary",
    "description": "",
    "amount": 5000,
    "type": "income",
    "recurring": 30,
    "createdAt": "2025-03-01T00:00:00.000Z",
    "updatedAt": "2025-03-01T00:00:00.000Z",
    "budget": {}
  },
  {
    "id": "223e4567-e89b-12d3-a456-426614174001",
    "name": "Freelance Project",
    "description": "",
    "amount": 1500,
    "type": "income",
    "recurring": 0,
    "createdAt": "2025-03-15T00:00:00.000Z",
    "updatedAt": "2025-03-15T00:00:00.000Z",
    "budget": {}
  }
]
```

### 2. Add Income

Creates a new income transaction for the authenticated user.

**Endpoint:** `POST /incomes`

**Request Body:**

```typescript
interface CreateIncomeRequest {
  name: string; // Income source name (required, non-empty)
  amount: number; // Income amount (required, min: 0.01)
  recurring: number; // Recurring frequency in days (required, min: 0)
  // 0 = one-time income
  // 30 = monthly income
  // 14 = bi-weekly income
  // 7 = weekly income
}
```

**Response:** `201 Created`

Returns a `TransactionResponse` object:

```typescript
interface TransactionResponse {
  id: string; // UUID
  name: string;
  description: string;
  amount: number;
  type: 'income';
  recurring: number;
  createdAt: string; // ISO 8601 datetime
  updatedAt: string; // ISO 8601 datetime
  budget: {}; // Empty object for income
}
```

**Possible Errors:**

- `400 Bad Request` - Validation errors (invalid amount, missing fields)
- `401 Unauthorized` - Missing or invalid token

**Example Request:**

```bash
curl -X POST "http://localhost:3000/api/v1/incomes" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Monthly Salary",
    "amount": 5000,
    "recurring": 30
  }'
```

**Example Response:**

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Monthly Salary",
  "description": "",
  "amount": 5000,
  "type": "income",
  "recurring": 30,
  "createdAt": "2025-01-15T10:00:00.000Z",
  "updatedAt": "2025-01-15T10:00:00.000Z",
  "budget": {}
}
```

### 3. Update Income

Updates an existing income transaction. All fields are required.

**Endpoint:** `PATCH /incomes/{id}`

**Path Parameters:**

- `id` - Income transaction UUID (required)

**Request Body:**

```typescript
interface UpdateIncomeRequest {
  name: string; // New income source name (required)
  amount: number; // New amount (required, min: 0.01)
  recurring: number; // New recurring frequency (required, min: 0)
}
```

**Response:** `200 OK`

```typescript
type UpdateIncomeResponse = TransactionResponse;
```

**Possible Errors:**

- `400 Bad Request` - Invalid input data
- `401 Unauthorized` - Missing or invalid token
- `404 Not Found` - Income transaction not found

**Example Request:**

```bash
curl -X PATCH "http://localhost:3000/api/v1/incomes/123e4567-e89b-12d3-a456-426614174000" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Salary",
    "amount": 5500,
    "recurring": 30
  }'
```

### 4. Delete Income

Deletes an income transaction (soft delete).

**Endpoint:** `DELETE /incomes/{id}`

**Path Parameters:**

- `id` - Income transaction UUID (required)

**Response:** `200 OK`

```typescript
// No response body
```

**Possible Errors:**

- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Access denied to income (user doesn't own it)
- `404 Not Found` - Income transaction not found

**Example Request:**

```bash
curl -X DELETE "http://localhost:3000/api/v1/incomes/123e4567-e89b-12d3-a456-426614174000" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Income Calculation and Management

### Recurring Income Logic

The system supports various recurring income patterns:

1. **One-time Income** (`recurring: 0`)

   - Single income entry (e.g., bonus, gift)
   - Appears only once in the month it was created

2. **Weekly Income** (`recurring: 7`)

   - Income repeats every 7 days
   - Common for hourly workers or weekly payments

3. **Bi-weekly Income** (`recurring: 14`)

   - Income repeats every 14 days
   - Common for bi-weekly salary payments

4. **Monthly Income** (`recurring: 30`)

   - Income repeats every 30 days
   - Standard for monthly salaries

5. **Custom Intervals** (`recurring: n`)
   - Any positive integer for custom recurring patterns
   - Useful for irregular but predictable income

### Income Aggregation

When retrieving monthly income:

1. **Query Process**:

   - Filters transactions by `type = 'income'`
   - Filters by user_id for security
   - Groups by month and year
   - Excludes soft-deleted records (`deleted_at IS NULL`)

2. **Response Structure**:

   - Returns array of income transactions
   - Each transaction includes full details
   - Budget field is empty object (income not linked to budgets)

3. **Use Cases**:
   - Calculate total monthly income
   - Track income sources
   - Analyze income patterns
   - Budget planning based on expected income

## Key Implementation Notes

1. **Response Format**: All responses follow standard format
2. **Authentication**: Bearer token required for all endpoints
3. **Date Format**: ISO 8601 strings for all timestamps
4. **Amount Validation**: Minimum value 0.01 for all monetary amounts
5. **Month Values**: 1-based (January = 1, December = 12)
6. **Year Validation**: Range 1900-3000 for reasonable dates
7. **UUIDs**: All IDs are UUID v4 format
8. **Recurring**: 0 = one-time, positive integer = days between recurrences
9. **Transaction Type**: Always 'income' for income transactions
10. **Soft Deletes**: Deleted income records have `deleted_at` timestamp set
11. **Budget Field**: Always empty object for income (no budget association)
12. **Security**: Users can only access/modify their own income records
