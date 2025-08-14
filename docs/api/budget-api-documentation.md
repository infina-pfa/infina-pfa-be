# Budget API Documentation

## Overview

This document provides API documentation for budget management endpoints. All endpoints require authentication via Supabase Auth JWT tokens.

## Database Structure

The budget management system uses the following PostgreSQL tables (managed by Prisma ORM):

### Core Tables

#### 1. `budgets` table

- **Purpose**: Stores budget definitions for each user
- **Schema**: `public`
- **Key columns**:
  - `id` (UUID): Primary key
  - `user_id` (UUID): Foreign key to auth.users
  - `name` (String): Budget name
  - `amount` (Decimal): Budget limit amount
  - `category` (String): Either 'fixed' or 'flexible'
  - `color` (String): Hex color code for UI visualization
  - `icon` (String): Icon identifier for UI
  - `month` (Integer): Month (1-12)
  - `year` (Integer): Year
  - `created_at`, `updated_at`, `deleted_at` (Timestamps)
- **Indexes**: Optimized for queries by user_id, month/year, and category

#### 2. `transactions` table

- **Purpose**: Stores all financial transactions (spending, income, etc.)
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
- **Indexes**: Optimized for queries by user_id, amount, and name

#### 3. `budget_transactions` table (Junction table)

- **Purpose**: Links budgets to their spending transactions (many-to-many relationship)
- **Schema**: `public`
- **Key columns**:
  - `id` (UUID): Primary key
  - `budget_id` (UUID): Foreign key to budgets table
  - `transaction_id` (UUID): Foreign key to transactions table
  - `user_id` (UUID): Foreign key to auth.users (for security/filtering)
  - `created_at`, `updated_at`, `deleted_at` (Timestamps)
- **Indexes**: Optimized for queries by budget_id, transaction_id, and user_id

## Spent Field Calculation Logic

The `spent` field in the API responses is **dynamically calculated** and not stored in the database. Here's how it works:

### Calculation Process

1. **Data Retrieval**: When fetching budgets, the system performs a JOIN operation:

   - Retrieves budget record from `budgets` table
   - Joins with `budget_transactions` to get linked transaction IDs
   - Joins with `transactions` table to get transaction details
   - Filters out soft-deleted transactions (`deleted_at IS NULL`)

2. **Aggregation**: The `BudgetAggregate` domain model calculates spent amount:

   ```typescript
   // In BudgetAggregate entity
   public get spent(): CurrencyVO {
     return this.props.spending.items.reduce(
       (acc, spending) => acc.add(spending.amount),
       new CurrencyVO(0),
     );
   }
   ```

3. **Response Mapping**: The calculated value is included in the API response:
   ```typescript
   // In BudgetResponseDto.fromAggregate()
   spent: entity.spent.value; // Converted from CurrencyVO to number
   ```

### Key Points About Spent Calculation

- **Real-time Calculation**: The spent amount is calculated at runtime for each API request
- **Transaction Types**: Only transactions with `type = 'budget_spending'` linked via `budget_transactions` are counted
- **Soft Deletes**: Deleted transactions (`deleted_at IS NOT NULL`) are excluded from calculations
- **Performance**: Database indexes on `budget_id` and `transaction_id` ensure efficient JOINs
- **Currency Handling**: Internal calculations use `CurrencyVO` value object for precision, converted to number for API responses

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

## Budget-Specific Error Codes

```typescript
enum BudgetErrorCode {
  BUDGET_NOT_FOUND = 'BUDGET_NOT_FOUND', // Budget doesn't exist
  BUDGET_INVALID_AMOUNT = 'BUDGET_INVALID_AMOUNT', // Amount validation failed
  SPENDING_NOT_FOUND = 'SPENDING_NOT_FOUND', // Spending transaction not found
  INCOME_NOT_FOUND = 'INCOME_NOT_FOUND', // Income record not found
}
```

## Endpoints

### 1. Create Budget

Creates a new budget for the authenticated user.

**Endpoint:** `POST /budgets`

**Request Body:**

```typescript
interface CreateBudgetRequest {
  name: string; // Budget name (required, non-empty)
  amount: number; // Budget amount (required, min: 0.01)
  category: 'fixed' | 'flexible'; // Budget category (required)
  color: string; // Hex color code (required, e.g., "#FF5733")
  icon: string; // Icon identifier (required)
  month: number; // Month 1-12 (required)
  year: number; // Year >= 2025 (required)
}
```

**Response:** `201 Created`

Returns a `BudgetResponse` object:

```typescript
interface BudgetResponse {
  id: string; // UUID
  name: string;
  amount: number;
  userId: string; // Owner's UUID
  category: 'fixed' | 'flexible';
  color: string;
  icon: string;
  month: number;
  year: number;
  spent: number; // Amount already spent
  createdAt: string; // ISO 8601 datetime
  updatedAt: string; // ISO 8601 datetime
}
```

**Possible Errors:**

- `400 Bad Request` - Validation errors (invalid amount, missing fields)
- `401 Unauthorized` - Missing or invalid token
- `409 Conflict` - Budget with same name already exists for this month

### 2. Get All Budgets

Retrieves all budgets for the authenticated user for a specific month and year.

**Endpoint:** `GET /budgets?month={month}&year={year}`

**Query Parameters:**

```typescript
interface GetBudgetsQuery {
  month: number; // 1-12 (required)
  year: number; // e.g., 2025 (required)
}
```

**Response:** `200 OK`

```typescript
type GetBudgetsResponse = BudgetResponse[];
```

**Error Responses:**

- `401 Unauthorized` - Missing or invalid token

### 3. Get Budget Details

Retrieves detailed information about a specific budget including transactions.

**Endpoint:** `GET /budgets/{id}`

**Path Parameters:**

- `id` - Budget UUID (required)

**Response:** `200 OK`

```typescript
interface BudgetDetailResponse extends BudgetResponse {
  transactions: TransactionResponse[]; // Always included in detail view
}
```

**Error Responses:**

- `400 Bad Request` - Invalid budget ID format
- `401 Unauthorized` - User not authenticated
- `403 Forbidden` - Access denied to budget
- `404 Not Found` - Budget not found

### 4. Update Budget

Updates an existing budget. All fields are optional.

**Endpoint:** `PATCH /budgets/{id}`

**Path Parameters:**

- `id` - Budget UUID (required)

**Request Body:**

```typescript
interface UpdateBudgetRequest {
  name?: string; // New name (optional)
  amount?: number; // New amount (optional, min: 0.01)
  category?: 'fixed' | 'flexible'; // New category (optional)
  color?: string; // New color (optional)
  icon?: string; // New icon (optional)
}
```

**Response:** `200 OK`

```typescript
type UpdateBudgetResponse = BudgetResponse;
```

**Error Responses:**

- `400 Bad Request` - Invalid input data
- `401 Unauthorized` - Missing or invalid token
- `404 Not Found` - Budget not found

### 5. Record Spending

Records a spending transaction against a budget.

**Endpoint:** `POST /budgets/{id}/spend`

**Path Parameters:**

- `id` - Budget UUID (required)

**Request Body:**

```typescript
interface SpendRequest {
  amount: number; // Spending amount (required, min: 0.01)
  name?: string; // Transaction name (optional)
  description?: string; // Transaction description (optional)
  recurring?: number; // Recurring frequency in days (optional, default: 0)
  // 0 = one-time, >0 = recurring
}
```

**Response:** `201 Created`

```typescript
type SpendResponse = BudgetDetailResponse; // Returns updated budget with transactions
```

**Error Responses:**

- `400 Bad Request` - Invalid input data
- `401 Unauthorized` - Missing or invalid token
- `404 Not Found` - Budget not found

### 6. Get Monthly Spending

Retrieves all spending transactions for a specific month and year.

**Endpoint:** `GET /budgets/spending?month={month}&year={year}`

**Query Parameters:**

```typescript
interface MonthlySpendingQuery {
  month: number; // 1-12 (required)
  year: number; // 1900-3000 (required)
}
```

**Response:** `200 OK`

```typescript
interface TransactionResponse {
  id: string; // Transaction UUID
  name: string;
  description: string;
  amount: number;
  type: 'income' | 'budget_spending' | 'goal_contribution' | 'goal_withdrawal';
  recurring: number; // 0 = one-time, >0 = recurring frequency in days
  createdAt: string; // ISO 8601 datetime
  updatedAt: string; // ISO 8601 datetime
  budget: {
    // Associated budget info
    id: string;
    name: string;
    amount: number;
    userId: string;
    category: 'fixed' | 'flexible';
    color: string;
    icon: string;
    month: number;
    year: number;
    createdAt: string;
    updatedAt: string;
  };
}

type MonthlySpendingResponse = TransactionResponse[];
```

**Error Responses:**

- `400 Bad Request` - Invalid query parameters
- `401 Unauthorized` - Missing or invalid token

### 7. Delete Budget

Deletes a budget and all associated transactions.

**Endpoint:** `DELETE /budgets/{id}`

**Path Parameters:**

- `id` - Budget UUID (required)

**Response:** `200 OK`

```typescript
// No response body
```

**Error Responses:**

- `401 Unauthorized` - Missing or invalid token
- `404 Not Found` - Budget not found

### 8. Delete Spending

Deletes a specific spending transaction from a budget.

**Endpoint:** `DELETE /budgets/{id}/spending/{spendingId}`

**Path Parameters:**

- `id` - Budget UUID (required)
- `spendingId` - Spending transaction UUID (required)

**Response:** `200 OK`

```typescript
// No response body
```

**Error Responses:**

- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Access denied to spending
- `404 Not Found` - Spending not found

## Key Implementation Notes

1. **Response Format**: All responses are wrapped.
2. **Authentication**: Bearer token required for all endpoints
3. **Date Format**: ISO 8601 strings for all timestamps
4. **Amount Validation**: Minimum value 0.01 for all monetary amounts
5. **Month Values**: 1-based (January = 1, December = 12)
6. **Year Validation**: Minimum 2025 for budget creation
7. **UUIDs**: All IDs are UUID v4 format
8. **Recurring**: 0 = one-time, positive integer = days between recurrences
9. **Categories**: Only `'fixed'` or `'flexible'` are valid
10. **Colors**: Hex color codes (e.g., "#FF5733")
