# Budget API Documentation

## Overview

This document provides API documentation for budget management endpoints. All endpoints require authentication via Supabase Auth JWT tokens.

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

## Budget-Specific Error Codes

```typescript
enum BudgetErrorCode {
  BUDGET_NOT_FOUND = 'BUDGET_NOT_FOUND',           // Budget doesn't exist
  BUDGET_INVALID_AMOUNT = 'BUDGET_INVALID_AMOUNT', // Amount validation failed
  SPENDING_NOT_FOUND = 'SPENDING_NOT_FOUND',       // Spending transaction not found
  INCOME_NOT_FOUND = 'INCOME_NOT_FOUND'            // Income record not found
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
  id: string;             // UUID
  name: string;
  amount: number;
  userId: string;         // Owner's UUID
  category: 'fixed' | 'flexible';
  color: string;
  icon: string;
  month: number;
  year: number;
  spent: number;          // Amount already spent
  createdAt: string;      // ISO 8601 datetime
  updatedAt: string;      // ISO 8601 datetime
}
```

**Possible Errors:**
- `400 Bad Request` - Validation errors (invalid amount, missing fields)
- `401 Unauthorized` - Missing or invalid token
- `409 Conflict` - Budget with same name already exists for this month

**NextJS Implementation:**

```typescript
// app/lib/api/budgets.ts
export async function createBudget(data: CreateBudgetRequest) {
  const session = await getSession();

  const response = await fetch(`${API_URL}/budgets`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || `Failed to create budget`);
  }

  const result = await response.json();
  return result.data; // Extract data from wrapped response
}
```

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

**NextJS Implementation:**

```typescript
// app/lib/api/budgets.ts
export async function getBudgets(month: number, year: number) {
  const session = await getSession();

  const params = new URLSearchParams({
    month: month.toString(),
    year: year.toString(),
  });

  const response = await fetch(`${API_URL}/budgets?${params}`, {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch budgets: ${response.statusText}`);
  }

  return response.json();
}
```

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

**NextJS Implementation:**

```typescript
// app/lib/api/budgets.ts
export async function getBudgetDetail(budgetId: string) {
  const session = await getSession();

  const response = await fetch(`${API_URL}/budgets/${budgetId}`, {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch budget detail: ${response.statusText}`);
  }

  return response.json();
}
```

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

**NextJS Implementation:**

```typescript
// app/lib/api/budgets.ts
export async function updateBudget(
  budgetId: string,
  data: UpdateBudgetRequest,
) {
  const session = await getSession();

  const response = await fetch(`${API_URL}/budgets/${budgetId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Failed to update budget: ${response.statusText}`);
  }

  return response.json();
}
```

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

**NextJS Implementation:**

```typescript
// app/lib/api/budgets.ts
export async function recordSpending(budgetId: string, data: SpendRequest) {
  const session = await getSession();

  const response = await fetch(`${API_URL}/budgets/${budgetId}/spend`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Failed to record spending: ${response.statusText}`);
  }

  return response.json();
}
```

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

**NextJS Implementation:**

```typescript
// app/lib/api/budgets.ts
export async function getMonthlySpending(month: number, year: number) {
  const session = await getSession();

  const params = new URLSearchParams({
    month: month.toString(),
    year: year.toString(),
  });

  const response = await fetch(`${API_URL}/budgets/spending?${params}`, {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch monthly spending: ${response.statusText}`);
  }

  return response.json();
}
```

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

**NextJS Implementation:**

```typescript
// app/lib/api/budgets.ts
export async function deleteBudget(budgetId: string) {
  const session = await getSession();

  const response = await fetch(`${API_URL}/budgets/${budgetId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to delete budget: ${response.statusText}`);
  }
}
```

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

**NextJS Implementation:**

```typescript
// app/lib/api/budgets.ts
export async function deleteSpending(budgetId: string, spendingId: string) {
  const session = await getSession();

  const response = await fetch(
    `${API_URL}/budgets/${budgetId}/spending/${spendingId}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to delete spending: ${response.statusText}`);
  }
}
```

## Complete NextJS API Client

Here's a complete API client for NextJS with TypeScript. For response handling details, see [Response Format Documentation](./response-format.md).

```typescript
// app/lib/api/budgets-client.ts
import { createClient } from '@/utils/supabase/client';
import { handleApiResponse } from '@/lib/api/response-handler'; // See response-format.md

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

// Types
export interface CreateBudgetRequest {
  name: string;
  amount: number;
  category: 'fixed' | 'flexible';
  color: string;
  icon: string;
  month: number;
  year: number;
}

export interface UpdateBudgetRequest {
  name?: string;
  amount?: number;
  category?: 'fixed' | 'flexible';
  color?: string;
  icon?: string;
}

export interface SpendRequest {
  amount: number;
  name?: string;
  description?: string;
  recurring?: number;
}

export interface BudgetResponse {
  id: string;
  name: string;
  amount: number;
  userId: string;
  category: 'fixed' | 'flexible';
  color: string;
  icon: string;
  month: number;
  year: number;
  spent: number;
  createdAt: string;
  updatedAt: string;
  transactions?: TransactionResponse[];
}

export interface TransactionResponse {
  id: string;
  name: string;
  description: string;
  amount: number;
  type: 'income' | 'budget_spending' | 'goal_contribution' | 'goal_withdrawal';
  recurring: number;
  createdAt: string;
  updatedAt: string;
  budget: Omit<BudgetResponse, 'spent' | 'transactions'>;
}

// API Client Class
export class BudgetApiClient {
  private async getHeaders() {
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      throw new Error('No active session');
    }

    return {
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    };
  }

  async createBudget(data: CreateBudgetRequest): Promise<BudgetResponse> {
    const response = await fetch(`${API_URL}/budgets`, {
      method: 'POST',
      headers: await this.getHeaders(),
      body: JSON.stringify(data),
    });
    
    return handleApiResponse<BudgetResponse>(response);
  }

  async getBudgets(month: number, year: number): Promise<BudgetResponse[]> {
    const params = new URLSearchParams({
      month: month.toString(),
      year: year.toString(),
    });

    const response = await fetch(`${API_URL}/budgets?${params}`, {
      headers: await this.getHeaders(),
    });
    
    return handleApiResponse<BudgetResponse[]>(response);
  }

  async getBudgetDetail(budgetId: string): Promise<BudgetResponse> {
    const response = await fetch(`${API_URL}/budgets/${budgetId}`, {
      headers: await this.getHeaders(),
    });
    
    return handleApiResponse<BudgetResponse>(response);
  }

  async updateBudget(
    budgetId: string,
    data: UpdateBudgetRequest,
  ): Promise<BudgetResponse> {
    const response = await fetch(`${API_URL}/budgets/${budgetId}`, {
      method: 'PATCH',
      headers: await this.getHeaders(),
      body: JSON.stringify(data),
    });
    
    return handleApiResponse<BudgetResponse>(response);
  }

  async recordSpending(
    budgetId: string,
    data: SpendRequest,
  ): Promise<BudgetResponse> {
    const response = await fetch(`${API_URL}/budgets/${budgetId}/spend`, {
      method: 'POST',
      headers: await this.getHeaders(),
      body: JSON.stringify(data),
    });
    
    return handleApiResponse<BudgetResponse>(response);
  }

  async getMonthlySpending(
    month: number,
    year: number,
  ): Promise<TransactionResponse[]> {
    const params = new URLSearchParams({
      month: month.toString(),
      year: year.toString(),
    });

    const response = await fetch(`${API_URL}/budgets/spending?${params}`, {
      headers: await this.getHeaders(),
    });
    
    return handleApiResponse<TransactionResponse[]>(response);
  }

  async deleteBudget(budgetId: string): Promise<void> {
    const response = await fetch(`${API_URL}/budgets/${budgetId}`, {
      method: 'DELETE',
      headers: await this.getHeaders(),
    });
    
    return handleApiResponse<void>(response);
  }

  async deleteSpending(budgetId: string, spendingId: string): Promise<void> {
    const response = await fetch(
      `${API_URL}/budgets/${budgetId}/spending/${spendingId}`,
      {
        method: 'DELETE',
        headers: await this.getHeaders(),
      },
    );
    
    return handleApiResponse<void>(response);
  }
}

// Export singleton instance
export const budgetApi = new BudgetApiClient();
```

## Usage Examples in NextJS Components

### Example: Budget List Component

```typescript
// app/components/BudgetList.tsx
'use client'

import { useEffect, useState } from 'react'
import { budgetApi, BudgetResponse } from '@/lib/api/budgets-client'

export function BudgetList({ month, year }: { month: number; year: number }) {
  const [budgets, setBudgets] = useState<BudgetResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchBudgets() {
      try {
        setLoading(true)
        const data = await budgetApi.getBudgets(month, year)
        setBudgets(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load budgets')
      } finally {
        setLoading(false)
      }
    }

    fetchBudgets()
  }, [month, year])

  if (loading) return <div>Loading budgets...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div className="grid gap-4">
      {budgets.map((budget) => (
        <div key={budget.id} className="p-4 border rounded">
          <h3>{budget.name}</h3>
          <p>Budget: ${budget.amount}</p>
          <p>Spent: ${budget.spent}</p>
          <p>Remaining: ${budget.amount - budget.spent}</p>
        </div>
      ))}
    </div>
  )
}
```

### Example: Create Budget Form

```typescript
// app/components/CreateBudgetForm.tsx
'use client'

import { useState } from 'react'
import { budgetApi, CreateBudgetRequest } from '@/lib/api/budgets-client'
import { useRouter } from 'next/navigation'

export function CreateBudgetForm() {
  const router = useRouter()
  const [formData, setFormData] = useState<CreateBudgetRequest>({
    name: '',
    amount: 0,
    category: 'flexible',
    color: '#000000',
    icon: 'wallet',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await budgetApi.createBudget(formData)
      router.push('/budgets')
    } catch (error) {
      console.error('Failed to create budget:', error)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        placeholder="Budget Name"
        required
      />

      <input
        type="number"
        value={formData.amount}
        onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
        min="0.01"
        step="0.01"
        required
      />

      <select
        value={formData.category}
        onChange={(e) => setFormData({ ...formData, category: e.target.value as 'fixed' | 'flexible' })}
      >
        <option value="fixed">Fixed</option>
        <option value="flexible">Flexible</option>
      </select>

      <button type="submit">Create Budget</button>
    </form>
  )
}
```

## Error Handling

For comprehensive error handling, see [Response Format Documentation](./response-format.md#error-handling-in-components).

### Handling Budget-Specific Errors

```typescript
import { ApiError } from '@/lib/api/response-handler';
import { BudgetErrorCode } from '@/types/budget';

try {
  const budget = await budgetApi.createBudget(formData);
  // Handle success
} catch (error) {
  if (error instanceof ApiError) {
    switch (error.code) {
      case BudgetErrorCode.BUDGET_NOT_FOUND:
        console.error('Budget not found');
        break;
      case BudgetErrorCode.BUDGET_INVALID_AMOUNT:
        console.error('Invalid budget amount');
        break;
      case BudgetErrorCode.SPENDING_NOT_FOUND:
        console.error('Spending transaction not found');
        break;
      default:
        console.error('Unexpected error:', error.message);
    }
  }
}
```

## Rate Limiting

The API implements rate limiting. Default limits:

- 100 requests per minute per user
- 1000 requests per hour per user

## Key Implementation Notes

1. **Response Format**: All responses are wrapped. See [Response Format Documentation](./response-format.md)
2. **Authentication**: Bearer token required for all endpoints
3. **Date Format**: ISO 8601 strings for all timestamps
4. **Amount Validation**: Minimum value 0.01 for all monetary amounts
5. **Month Values**: 1-based (January = 1, December = 12)
6. **Year Validation**: Minimum 2025 for budget creation
7. **UUIDs**: All IDs are UUID v4 format
8. **Recurring**: 0 = one-time, positive integer = days between recurrences
9. **Categories**: Only `'fixed'` or `'flexible'` are valid
10. **Colors**: Hex color codes (e.g., "#FF5733")

## Additional Resources

- [Response Format Documentation](./response-format.md) - Detailed guide on handling wrapped responses
- [API Testing Guide](./testing.md) - How to test the API endpoints
- [Authentication Guide](./authentication.md) - Supabase Auth integration details
