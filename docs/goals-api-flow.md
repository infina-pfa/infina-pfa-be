# Goals API Documentation

## Overview
This document describes the Goals API endpoints for managing financial goals and tracking contributions/withdrawals.

## API Endpoints

### 1. Create Goal
**Endpoint:** `POST /goals`

**Purpose:** Creates a new financial goal for the authenticated user

**Request Body:**
```json
{
  "title": "string",              // Goal title (required)
  "description": "string",        // Goal description (optional)
  "targetAmount": "number",       // Target amount to achieve (optional, min: 0)
  "dueDate": "string"            // Due date in ISO format (optional)
}
```

**Example:**
```json
{
  "title": "Buy a house",
  "description": "Save for a down payment on a house in the suburbs",
  "targetAmount": 50000,
  "dueDate": "2025-12-31T23:59:59Z"
}
```

**Database Tables Affected:**
- `goals` - Creates new goal record
- `goal_transactions` - Ready to track future contributions

**External Services:** None

**Notes:**
- Returns 409 if goal with same title already exists for user
- Target amount is in default currency (VND)

---

### 2. Get All Goals
**Endpoint:** `GET /goals`

**Purpose:** Retrieves all financial goals for the authenticated user

**Response Includes:**
- Goal ID, title, description
- Current amount saved
- Target amount
- Due date
- Progress percentage
- Transaction history (contributions/withdrawals)
- Created/Updated timestamps

**Database Tables Accessed:**
- `goals` - Reads user's goals
- `goal_transactions` - Reads contribution/withdrawal history
- `transactions` - Reads transaction details

**External Services:** None

---

### 3. Update Goal
**Endpoint:** `PATCH /goals/:id`

**Purpose:** Updates an existing financial goal

**URL Parameters:**
- `id` (UUID) - Goal ID

**Request Body (all optional):**
```json
{
  "title": "string",
  "description": "string",
  "targetAmount": "number",
  "dueDate": "string"
}
```

**Database Tables Affected:**
- `goals` - Updates goal record

**External Services:** None

**Notes:**
- Returns 404 if goal not found
- Returns 409 if new title conflicts with existing goal

---

### 4. Contribute to Goal
**Endpoint:** `POST /goals/:id/contribute`

**Purpose:** Adds a contribution transaction to a financial goal

**URL Parameters:**
- `id` (UUID) - Goal ID

**Request Body:**
```json
{
  "amount": "number",           // Contribution amount (required, min: 0.01)
  "name": "string",             // Transaction name (optional)
  "description": "string",      // Transaction description (optional)
  "recurring": "number"         // Recurring interval in days (optional, default: 0)
}
```

**Example:**
```json
{
  "amount": 1000,
  "name": "Monthly savings",
  "description": "Monthly contribution to house down payment goal",
  "recurring": 30
}
```

**Database Tables Affected:**
- `transactions` - Creates contribution transaction (type: goal_contribution)
- `goal_transactions` - Links transaction to goal
- `goals` - Updates current_amount field

**External Services:** None

**Notes:**
- Increases goal's current amount
- Recurring = 0 means one-time contribution
- Recurring > 0 sets interval in days for repeated contributions

---

### 5. Withdraw from Goal
**Endpoint:** `POST /goals/:id/withdraw`

**Purpose:** Withdraws funds from a financial goal

**URL Parameters:**
- `id` (UUID) - Goal ID

**Request Body:**
```json
{
  "amount": "number",           // Withdrawal amount (required, min: 0.01)
  "name": "string",             // Transaction name (optional)
  "description": "string",      // Transaction description (optional)
  "recurring": "number"         // Recurring interval in days (optional, default: 0)
}
```

**Example:**
```json
{
  "amount": 500,
  "name": "Emergency expense",
  "description": "Emergency medical expense from house fund",
  "recurring": 0
}
```

**Database Tables Affected:**
- `transactions` - Creates withdrawal transaction (negative amount)
- `goal_transactions` - Links transaction to goal
- `goals` - Updates current_amount field (decreases)

**External Services:** None

**Notes:**
- Decreases goal's current amount
- Returns 400 if withdrawal exceeds current balance
- Transaction stored with negative amount

---

## Internal API Endpoints

Internal endpoints follow the same pattern as public endpoints but with API key authentication:

### 6. Create Goal (Internal)
**Endpoint:** `POST /internal/goals`

**Query Parameters:**
- `userId` (UUID) - Target user's ID

**Authentication:** X-API-Key header

---

### 7. Get Goals (Internal)
**Endpoint:** `GET /internal/goals`

**Query Parameters:**
- `userId` (UUID) - Target user's ID

**Authentication:** X-API-Key header

---

### 8. Update Goal (Internal)
**Endpoint:** `PATCH /internal/goals/:id`

**URL Parameters:**
- `id` (UUID) - Goal ID

**Query Parameters:**
- `userId` (UUID) - Target user's ID

**Authentication:** X-API-Key header

---

### 9. Contribute to Goal (Internal)
**Endpoint:** `POST /internal/goals/:id/contribute`

**URL Parameters:**
- `id` (UUID) - Goal ID

**Query Parameters:**
- `userId` (UUID) - Target user's ID

**Authentication:** X-API-Key header

---

### 10. Withdraw from Goal (Internal)
**Endpoint:** `POST /internal/goals/:id/withdraw`

**URL Parameters:**
- `id` (UUID) - Goal ID

**Query Parameters:**
- `userId` (UUID) - Target user's ID

**Authentication:** X-API-Key header

---

## Authentication Types

1. **Public Endpoints** (`/goals/*`): JWT Bearer token via Supabase Auth
2. **Internal Endpoints** (`/internal/goals/*`): X-API-Key header

## Database Schema

### Tables:

**goals**
- `id` - Unique identifier
- `user_id` - Links to auth user
- `title` - Goal title (unique per user)
- `description` - Goal description
- `current_amount` - Current saved amount
- `target_amount` - Target amount to achieve
- `due_date` - Target completion date
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp
- `deleted_at` - Soft delete timestamp

**goal_transactions**
- `id` - Unique identifier
- `goal_id` - Links to goals table
- `transaction_id` - Links to transactions table
- `user_id` - Links to auth user
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp
- `deleted_at` - Soft delete timestamp

**transactions** (shared with budgets)
- `id` - Unique identifier
- `amount` - Transaction amount (positive for contributions, negative for withdrawals)
- `type` - Transaction type (goal_contribution for goals)
- `name` - Transaction name
- `description` - Transaction description
- `recurring` - Recurring interval in days
- `user_id` - Links to auth user
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

## Notes
- Goals use aggregate pattern similar to budgets
- Each goal tracks its transactions through goal_transactions junction table
- Current amount is calculated from all linked transactions
- Progress percentage = (current_amount / target_amount) * 100
- All amounts stored as Decimal type to prevent floating-point errors
- Soft delete supported for goals and transactions