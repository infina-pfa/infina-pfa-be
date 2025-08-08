# Income API Documentation

## Overview
This document describes the Income API endpoints for managing income transactions. Income APIs are only available as internal endpoints for service-to-service communication.

## Internal API Endpoints

All income endpoints require X-API-Key authentication and are accessed through the `/internal/budgets/income` path.

### 1. Add Income
**Endpoint:** `POST /internal/budgets/income`

**Purpose:** Creates a new income transaction for a user

**Authentication:** X-API-Key header

**Request Body:**
```json
{
  "userId": "string",           // User ID (required, UUID)
  "name": "string",             // Income name (required)
  "amount": "number",           // Income amount (required, min: 0.01)
  "recurring": "number"         // Recurring interval in days (required, 0 for one-time)
}
```

**Example:**
```json
{
  "userId": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Salary",
  "amount": 5000,
  "recurring": 30
}
```

**Database Tables Affected:**
- `transactions` - Creates new income transaction (type: income)

**External Services:** None

**Notes:**
- Recurring = 0 means one-time income
- Recurring > 0 sets interval in days for repeated income (e.g., 30 for monthly salary)

---

### 2. Get Monthly Income
**Endpoint:** `GET /internal/budgets/income/:userId`

**Purpose:** Retrieves all income transactions for a user in a specific month

**Authentication:** X-API-Key header

**URL Parameters:**
- `userId` (UUID) - Target user's ID

**Query Parameters:**
- `month` (number) - Month to filter (1-12, required)
- `year` (number) - Year to filter (required)

**Example Request:**
```
GET /internal/budgets/income/123e4567-e89b-12d3-a456-426614174000?month=12&year=2024
```

**Response:**
- Array of income transactions for the specified month
- Each transaction includes: ID, name, amount, recurring interval, created/updated timestamps

**Database Tables Accessed:**
- `transactions` - Reads income transactions filtered by type, user, and date

**External Services:** None

---

### 3. Update Income
**Endpoint:** `PATCH /internal/budgets/income/:id`

**Purpose:** Updates an existing income transaction

**Authentication:** X-API-Key header

**URL Parameters:**
- `id` (UUID) - Income transaction ID

**Request Body:**
```json
{
  "name": "string",             // New income name (optional)
  "amount": "number",           // New amount (optional, min: 0.01)
  "recurring": "number"         // New recurring interval (optional, min: 0)
}
```

**Example:**
```json
{
  "name": "Updated Salary",
  "amount": 5500,
  "recurring": 30
}
```

**Database Tables Affected:**
- `transactions` - Updates income transaction record

**External Services:** None

**Notes:**
- Returns 404 if income transaction not found
- Only updates provided fields

---

### 4. Delete Income
**Endpoint:** `DELETE /internal/budgets/income/:id`

**Purpose:** Deletes an income transaction

**Authentication:** X-API-Key header

**URL Parameters:**
- `id` (UUID) - Income transaction ID

**Query Parameters:**
- `userId` (UUID) - User ID for ownership verification

**Example Request:**
```
DELETE /internal/budgets/income/456e7890?userId=123e4567
```

**Database Tables Affected:**
- `transactions` - Soft deletes income transaction (sets deleted_at)

**External Services:** None

**Notes:**
- Returns 403 if user doesn't own the income transaction
- Returns 404 if income transaction not found
- Performs soft delete by setting deleted_at timestamp

---

## Data Structure

### Income Aggregate Pattern
Income follows an aggregate pattern similar to budgets and goals:
- `IncomeAggregate` manages a collection of income transactions
- Grouped by user and month/year
- Calculates total income from all transactions

### Transaction Types
Income transactions are stored in the shared `transactions` table with:
- `type` = "income" to distinguish from budget spending and goal contributions
- Positive `amount` values
- Optional `recurring` field for repeated income

## Database Schema

### Tables:

**transactions** (shared with budgets and goals)
- `id` - Unique identifier
- `user_id` - Links to auth user
- `type` - Transaction type ("income" for income transactions)
- `name` - Income source name (e.g., "Salary", "Freelance")
- `amount` - Income amount (always positive)
- `recurring` - Recurring interval in days (0 for one-time)
- `description` - Optional description
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp
- `deleted_at` - Soft delete timestamp

## Notes
- Income is managed within the budgeting domain but as separate entities
- No public endpoints - all income management done through internal APIs
- Income transactions can be recurring (salary) or one-time (bonus)
- All amounts stored as Decimal type to prevent floating-point errors
- Income aggregate calculates total monthly income from all transactions
- Soft delete supported for all income transactions