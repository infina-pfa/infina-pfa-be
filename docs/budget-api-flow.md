# Budget API Documentation

## Overview
This document describes the Budget API endpoints, their usage, parameters, and database interactions.

## API Endpoints

### 1. Create Budget
**Endpoint:** `POST /budgets`

**Purpose:** Creates a new budget for the authenticated user

**Request Body:**
```json
{
  "name": "string",           // Budget name (required)
  "amount": "number",         // Budget amount (required)
  "month": "number",          // Month (1-12) (required)
  "year": "number",           // Year (required)
  "category": "string",       // "fixed" or "flexible" (optional, default: "fixed")
  "color": "string",          // Hex color code (optional, default: "#000000")
  "icon": "string"            // Icon identifier (optional, default: "other")
}
```

**Database Tables Affected:**
- `budgets` - Creates new budget record

**External Services:** None

---

### 2. Get User's Budgets
**Endpoint:** `GET /budgets`

**Purpose:** Retrieves all budgets for a specific month and year

**Query Parameters:**
- `month` (number) - Month to filter (1-12)
- `year` (number) - Year to filter

**Database Tables Accessed:**
- `budgets` - Reads budget records
- `budget_transactions` - Reads budget-transaction links
- `transactions` - Reads associated spending transactions

**External Services:** None

---

### 3. Get Budget Details
**Endpoint:** `GET /budgets/:id`

**Purpose:** Retrieves detailed information about a specific budget including all spending

**URL Parameters:**
- `id` (UUID) - Budget ID

**Response Includes:**
- Budget information
- All spending transactions
- Calculated fields: `spent`, `remainingBudget`

**Database Tables Accessed:**
- `budgets` - Reads budget record
- `budget_transactions` - Reads transaction links
- `transactions` - Reads all spending for this budget

**External Services:** None

---

### 4. Update Budget
**Endpoint:** `PATCH /budgets/:id`

**Purpose:** Updates budget properties (name, amount, category, color, icon)

**URL Parameters:**
- `id` (UUID) - Budget ID

**Request Body (all optional):**
```json
{
  "name": "string",
  "amount": "number",
  "category": "string",
  "color": "string",
  "icon": "string"
}
```

**Database Tables Affected:**
- `budgets` - Updates budget record

**External Services:** None

---

### 5. Record Spending
**Endpoint:** `POST /budgets/:id/spend`

**Purpose:** Records a spending transaction against a budget

**URL Parameters:**
- `id` (UUID) - Budget ID

**Request Body:**
```json
{
  "amount": "number",         // Spending amount (required)
  "name": "string",           // Transaction name (optional)
  "description": "string",    // Transaction description (optional)
  "recurring": "number"       // Recurring flag (optional, default: 0)
}
```

**Database Tables Affected:**
- `transactions` - Creates new transaction record
- `budget_transactions` - Creates link between budget and transaction
- `budgets` - Updates the `updated_at` timestamp

**External Services:** None

---

### 6. Get Monthly Spending
**Endpoint:** `GET /budgets/spending`

**Purpose:** Retrieves all spending transactions across all budgets for a specific month

**Query Parameters:**
- `month` (number) - Month to filter (1-12)
- `year` (number) - Year to filter

**Database Tables Accessed:**
- `budgets` - Reads user's budgets for the month
- `budget_transactions` - Reads transaction links
- `transactions` - Reads all spending transactions

**External Services:** None

---

### 7. Delete Budget
**Endpoint:** `DELETE /budgets/:id`

**Purpose:** Deletes a budget and all associated spending transactions

**URL Parameters:**
- `id` (UUID) - Budget ID

**Database Tables Affected:**
- `budgets` - Deletes budget record
- `budget_transactions` - Deletes all transaction links for this budget
- `transactions` - Deletes all transactions linked only to this budget

**External Services:** None

---

### 8. Delete Spending
**Endpoint:** `DELETE /budgets/:id/spending/:spendingId`

**Purpose:** Deletes a specific spending transaction from a budget

**URL Parameters:**
- `id` (UUID) - Budget ID
- `spendingId` (UUID) - Transaction ID to delete

**Database Tables Affected:**
- `budget_transactions` - Removes link between budget and transaction
- `transactions` - Deletes the transaction record

**External Services:** None

---

## Authentication
All endpoints require authentication via Bearer token (JWT). The authenticated user ID is automatically extracted and used for all operations.

## Database Schema

### Main Tables Used:

**budgets**
- Stores budget definitions (name, amount, month, year, category, color, icon)
- Linked to user via `user_id`

**transactions**
- Stores all financial transactions
- Types: budget_spending, income, goal_contribution

**budget_transactions**
- Junction table linking budgets to transactions
- Enables many-to-many relationship

## Notes
- All endpoints validate user ownership before allowing operations
- No external services are called - all operations are database-only
- Amounts are stored as Decimal type to prevent floating-point errors
- All delete operations are soft deletes (set `deleted_at` timestamp)