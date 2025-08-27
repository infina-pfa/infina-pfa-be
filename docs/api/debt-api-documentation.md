# Debt API Documentation

## Overview

This document provides API documentation for debt management endpoints. All endpoints require authentication via Supabase Auth JWT tokens.

## Database Structure

The debt management system uses the following PostgreSQL tables (managed by Prisma ORM):

### Core Tables

#### 1. `debts` table

- **Purpose**: Stores debt records for each user
- **Schema**: `public`
- **Key columns**:
  - `id` (UUID): Primary key
  - `user_id` (UUID): Foreign key to auth.users
  - `lender` (String): Name of the lender
  - `purpose` (String): Purpose of the debt
  - `amount` (Decimal): Total debt amount
  - `rate` (Decimal): Interest rate as percentage
  - `due_date` (DateTime): Debt due date
  - `type` (Enum): Debt type ('bad_debt' or 'good_debt')
  - `created_at`, `updated_at`, `deleted_at` (Timestamps)
- **Indexes**: Optimized for queries by user_id

#### 2. `transactions` table

- **Purpose**: Stores all financial transactions including debt payments
- **Schema**: `public`
- **Key columns**:
  - `id` (UUID): Primary key
  - `user_id` (UUID): Foreign key to auth.users
  - `name` (String): Transaction description
  - `description` (String): Optional detailed description
  - `amount` (Decimal): Transaction amount
  - `type` (Enum): Transaction type ('income', 'budget_spending', 'goal_contribution', 'goal_withdrawal', 'debt_payment')
  - `recurring` (Integer): Recurrence frequency in days (0 for one-time)
  - `created_at`, `updated_at`, `deleted_at` (Timestamps)
- **Indexes**: Optimized for queries by user_id, amount, and name

#### 3. `debt_transactions` table (Junction table)

- **Purpose**: Links debts to their payment transactions (many-to-many relationship)
- **Schema**: `public`
- **Key columns**:
  - `id` (UUID): Primary key
  - `debt_id` (UUID): Foreign key to debts table
  - `transaction_id` (UUID): Foreign key to transactions table
  - `user_id` (UUID): Foreign key to auth.users (for security/filtering)
  - `created_at`, `updated_at`, `deleted_at` (Timestamps)
- **Indexes**: Optimized for queries by debt_id, transaction_id, and user_id

## Current Paid Amount Calculation Logic

The `currentPaidAmount` field in the API responses is **dynamically calculated** and not stored in the database. Here's how it works:

### Calculation Process

1. **Data Retrieval**: When fetching debts, the system performs a JOIN operation:

   - Retrieves debt record from `debts` table
   - Joins with `debt_transactions` to get linked transaction IDs
   - Joins with `transactions` table to get payment details
   - Filters out soft-deleted transactions (`deleted_at IS NULL`)

2. **Aggregation**: The `DebtAggregate` domain model calculates paid amount:

   ```typescript
   // In DebtAggregate entity
   public get currentPaidAmount(): CurrencyVO {
     return this.props.payments.items.reduce(
       (acc, payment) => acc.add(payment.amount),
       new CurrencyVO(0),
     );
   }
   ```

3. **Response Mapping**: The calculated value is included in the API response:
   ```typescript
   // In DebtResponseDto.fromAggregate()
   currentPaidAmount: aggregate.currentPaidAmount.value; // Converted from CurrencyVO to number
   ```

### Key Points About Current Paid Amount Calculation

- **Real-time Calculation**: The paid amount is calculated at runtime for each API request
- **Transaction Types**: Only transactions with `type = 'debt_payment'` linked via `debt_transactions` are counted
- **Soft Deletes**: Deleted transactions (`deleted_at IS NOT NULL`) are excluded from calculations
- **Performance**: Database indexes on `debt_id` and `transaction_id` ensure efficient JOINs
- **Currency Handling**: Internal calculations use `CurrencyVO` value object for precision, converted to number for API responses

## Base Configuration

### Base URL

```
http://localhost:3000/
```

### Authentication

```typescript
headers: {
  'Authorization': `Bearer ${accessToken}`,
  'Content-Type': 'application/json'
}
```

## Debt Types

```typescript
enum DebtType {
  BAD_DEBT = 'bad_debt', // Debt that doesn't generate income (e.g., credit cards, personal loans)
  GOOD_DEBT = 'good_debt', // Debt that can generate income or appreciate in value (e.g., mortgages, student loans)
}
```

## Debt-Specific Error Codes

```typescript
enum DebtErrorCode {
  DEBT_NOT_FOUND = 'DEBT_NOT_FOUND', // Debt doesn't exist
  DEBT_INVALID_AMOUNT = 'DEBT_INVALID_AMOUNT', // Amount validation failed
  DEBT_PAYMENT_NOT_FOUND = 'DEBT_PAYMENT_NOT_FOUND', // Payment transaction not found
  DEBT_ACCESS_DENIED = 'DEBT_ACCESS_DENIED', // User doesn't own the debt
}
```

## Internal API Endpoints

The debt module also provides internal API endpoints for service-to-service communication. These endpoints use the same business logic but authenticate via API key instead of user JWT.

### Base URL for Internal APIs

```
http://localhost:3000/api-internal
```

### Authentication

```typescript
headers: {
  'x-api-key': `${internalApiKey}`,
  'Content-Type': 'application/json'
}
```

### Internal Endpoints

All internal endpoints mirror the public endpoints but:

- Use `/internal/debts` prefix instead of `/debts`
- Authenticate via `x-api-key` header instead of Bearer token
- Accept `userId` as a query parameter instead of extracting from JWT token
- Same request/response bodies as public endpoints

Example:

- Public: `GET /debts/{id}` with Bearer token
- Internal: `GET /internal/debts/{id}?userId={userId}` with x-api-key

## Endpoints

### 1. Create Debt

Creates a new debt for the authenticated user.

**Endpoint:** `POST /debts`

**Request Body:**

```typescript
interface CreateDebtRequest {
  lender: string; // Lender name (required, non-empty)
  purpose: string; // Debt purpose (required, non-empty)
  rate: number; // Interest rate as percentage (required, min: 0)
  dueDate: Date; // Due date (required, ISO 8601 format)
  amount: number; // Total debt amount (required, min: 0.01)
  currentPaidAmount?: number; // Initial paid amount (optional, min: 0, default: 0)
  type?: DebtType; // Debt type (optional, defaults to 'bad_debt')
}
```

**Response:** `201 Created`

Returns a `DebtResponse` object:

```typescript
interface DebtResponse {
  id: string; // UUID
  userId: string; // Owner's UUID
  lender: string;
  purpose: string;
  rate: number; // Interest rate percentage
  dueDate: string; // ISO 8601 datetime
  type: DebtType; // Debt type ('bad_debt' or 'good_debt')
  amount: number; // Total debt amount
  currentPaidAmount: number; // Amount already paid
  createdAt: string; // ISO 8601 datetime
  updatedAt: string; // ISO 8601 datetime
  payments?: PaymentResponse[]; // Only included when specified
}
```

**Possible Errors:**

- `400 Bad Request` - Validation errors (invalid amount, missing fields)
- `401 Unauthorized` - Missing or invalid token

### 2. Get All Debts

Retrieves all debts for the authenticated user.

**Endpoint:** `GET /debts`

**Response:** `200 OK`

```typescript
type GetDebtsResponse = DebtResponse[];
```

**Error Responses:**

- `401 Unauthorized` - Missing or invalid token

### 3. Get Debt Details

Retrieves detailed information about a specific debt including payments.

**Endpoint:** `GET /debts/{id}`

**Path Parameters:**

- `id` - Debt UUID (required)

**Response:** `200 OK`

```typescript
interface DebtDetailResponse extends DebtResponse {
  payments: PaymentResponse[]; // Always included in detail view
}

interface PaymentResponse {
  id: string; // Transaction UUID
  name: string;
  description: string;
  amount: number;
  type: 'debt_payment'; // Transaction type
  recurring: number; // 0 = one-time, >0 = recurring frequency in days
  createdAt: string; // ISO 8601 datetime
  updatedAt: string; // ISO 8601 datetime
  debt?: DebtSimple; // Associated debt info (when included)
}

interface DebtSimple {
  id: string;
  userId: string;
  amount: number;
  rate: number;
  dueDate: string;
  type: DebtType;
  lender: string;
  purpose: string;
  createdAt: string;
  updatedAt: string;
}
```

**Error Responses:**

- `400 Bad Request` - Invalid debt ID format
- `401 Unauthorized` - User not authenticated
- `403 Forbidden` - Access denied to debt
- `404 Not Found` - Debt not found

### 4. Update Debt

Updates an existing debt. All fields are optional.

**Endpoint:** `PATCH /debts/{id}`

**Path Parameters:**

- `id` - Debt UUID (required)

**Request Body:**

```typescript
interface UpdateDebtRequest {
  lender?: string; // New lender name (optional)
  purpose?: string; // New purpose (optional)
  rate?: number; // New interest rate (optional, min: 0)
  dueDate?: Date; // New due date (optional, ISO 8601 format)
  type?: DebtType; // New debt type (optional)
}
```

**Response:** `200 OK`

```typescript
type UpdateDebtResponse = DebtSimple;
```

**Error Responses:**

- `400 Bad Request` - Invalid input data
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Access denied to debt
- `404 Not Found` - Debt not found

### 5. Record Payment

Records a payment transaction against a debt.

**Endpoint:** `POST /debts/{id}/payments`

**Path Parameters:**

- `id` - Debt UUID (required)

**Request Body:**

```typescript
interface PayDebtRequest {
  amount: number; // Payment amount (required, min: 0.01)
  name?: string; // Payment name (optional)
  description?: string; // Payment description (optional)
}
```

**Response:** `201 Created`

```typescript
type PayDebtResponse = DebtDetailResponse; // Returns updated debt with all payments
```

**Error Responses:**

- `400 Bad Request` - Invalid input data
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Access denied to debt
- `404 Not Found` - Debt not found

### 6. Get Monthly Payment

Calculates and retrieves the total monthly debt payment amount for the authenticated user.

**Endpoint:** `GET /debts/monthly-payment`

**Response:** `200 OK`

```typescript
interface MonthlyPaymentResponse {
  monthlyPayment: number; // Total monthly payment across all debts
}
```

**Calculation Logic:**

The monthly payment is calculated differently based on the user's onboarding status:

1. **For Onboarded Users** (completed onboarding):

   - Retrieves all active debts from the database
   - Calculates monthly payment for each debt
   - Returns the sum of all monthly payments

2. **For Non-Onboarded Users**:

   - Retrieves debt information from onboarding profile metadata
   - Calculates monthly payment based on metadata
   - Returns the calculated amount

3. **Monthly Payment Formula**:

   For each debt, the monthly payment is calculated as:

   - **If interest rate = 0** (no interest):
     ```
     Monthly Payment = (Amount - Current Paid Amount) / Months Until Due
     ```
     Special case: If due date has passed (0 months), returns full remaining amount
   - **If interest rate > 0** (with interest):
     ```
     Monthly Payment = (Principal * (Rate/100)) / (1 - (1 + Rate/100)^(-Months))
     ```
     Where Principal = Amount - Current Paid Amount

   Note: Months are calculated as: `ceil(Days Until Due Date / 30)`

**Error Responses:**

- `401 Unauthorized` - Missing or invalid token
- `404 Not Found` - Onboarding profile not found (for non-onboarded users)

**Internal API Variant:**

- Endpoint: `GET /internal/debts/monthly-payment?userId={userId}`
- Authentication: x-api-key header instead of Bearer token
- Same response format and calculation logic

### 7. Delete Debt

Deletes a debt and all associated payment transactions.

**Endpoint:** `DELETE /debts/{id}`

**Path Parameters:**

- `id` - Debt UUID (required)

**Response:** `200 OK`

```typescript
// No response body
```

**Error Responses:**

- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Access denied to debt
- `404 Not Found` - Debt not found

### 8. Delete Payment

Deletes a specific payment transaction from a debt.

**Endpoint:** `DELETE /debts/{id}/payments/{paymentId}`

**Path Parameters:**

- `id` - Debt UUID (required)
- `paymentId` - Payment transaction UUID (required)

**Response:** `200 OK`

```typescript
// No response body
```

**Error Responses:**

- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Access denied to debt
- `404 Not Found` - Debt or payment not found

## Key Implementation Notes

1. **Response Format**: All responses are wrapped.
2. **Authentication**: Bearer token required for all endpoints
3. **Date Format**: ISO 8601 strings for all timestamps
4. **Amount Validation**: Minimum value 0.01 for all monetary amounts
5. **Rate Values**: Interest rates are stored as percentages (e.g., 5.5 for 5.5%)
6. **UUIDs**: All IDs are UUID v4 format
7. **Recurring**: 0 = one-time payment, positive integer = days between recurrences
8. **Transaction Types**: Debt payments use `type = 'debt_payment'`
9. **Soft Deletes**: Deleted records have `deleted_at` timestamp set
10. **Current Paid Amount**: Dynamically calculated from payment transactions
11. **Debt Type**: Categorizes debt as 'bad_debt' (consumer debt) or 'good_debt' (investment debt)
