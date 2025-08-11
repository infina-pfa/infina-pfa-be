# Infina PFA Backend API Documentation

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Overview](#overview)
3. [Authentication](#authentication)
4. [API Endpoints](#api-endpoints)
   - [Onboarding APIs](#onboarding-apis)
     - [Onboarding Profile Metadata Structure](#onboarding-profile-metadata-structure)
   - [AI Advisor APIs](#ai-advisor-apis)
   - [Internal Service APIs](#internal-service-apis)
5. [Database Schema](#database-schema)
6. [Testing with Postman](#testing-with-postman)
7. [Error Handling](#error-handling)

---

## Executive Summary

This document provides complete API specifications including:

- **Database operations** for each endpoint (reads, writes, updates)
- **External service dependencies** (AI services, budget services)
- **Test scenarios** and expected responses
- **Error conditions** to validate
- **Postman setup** for API testing

### External Dependencies

- **Supabase Auth**: User authentication and token management
- **AI Internal Service**: Generates personalized financial advice

---

## Overview

The Infina Personal Finance Advisor (PFA) Backend provides RESTful APIs for managing user financial data, onboarding profiles, and AI-powered financial advice. Built with NestJS 11 following Clean Architecture and Domain-Driven Design principles.

**Tech Stack:**

- NestJS 11 with TypeScript 5.7
- PostgreSQL (Supabase) with Prisma ORM
- Supabase Auth for authentication
- Server-Sent Events (SSE) for real-time streaming
- Swagger/OpenAPI for API documentation

**Base URLs:**

- Development: `http://localhost:3000`
- Production: `https://api.infina.app`

---

## Authentication

### Overview

The API uses JWT Bearer token authentication via Supabase Auth. All endpoints are protected by default unless explicitly marked as public.

### Authentication Flow

```mermaid
sequenceDiagram
    participant Client
    participant Backend
    participant Supabase

    Client->>Supabase: Login (email/password)
    Supabase-->>Client: Access Token + Refresh Token
    Client->>Backend: API Request + Bearer Token
    Backend->>Supabase: Verify Token
    Supabase-->>Backend: User Data
    Backend-->>Client: API Response
```

### Request Format

```http
GET /api/endpoint
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

### Authentication Types

- **Public Endpoints**: JWT Bearer token via Supabase Auth
- **Internal Endpoints** (`/internal/*`): X-API-Key header for service-to-service

---

## API Endpoints

### Recent Updates

- Message content is now nullable/optional to support component-only messages
- Introduced dedicated streaming DTOs (`StreamMessageDto`, `StreamOnboardingMessageDto`)
- Enhanced message entities with multiple sender and type enums
- Added non-streaming message creation endpoints

---

## Onboarding APIs

### 1. Create Onboarding Profile

**Endpoint:** `POST /onboarding/profile`  
**Auth:** Bearer Token Required  
**Purpose:** Creates an initial onboarding profile for tracking financial information

**Database Operations:**

- **Reads:** `onboarding_profiles` table to check if profile exists
- **Creates:** New record in `onboarding_profiles` table with user financial data

**External Services:** None

**Request Body:**

```json
{
  "expense": 1500, // Monthly expense (optional, min: 0)
  "income": 3000, // Monthly income (optional, min: 0)
  "pyfAmount": 500, // Pay Yourself First amount (optional, min: 0)
  "metadata": {
    // Additional metadata (optional) - see Metadata Structure section
    "goalDetails": {
      "type": "emergency_fund",
      "amount": 90000000,
      "timeframe": 12,
      "monthlyTarget": 7500000
    },
    "stageConfirmed": true,
    "expenseBreakdown": {
      "food": 2000000,
      "rent": 6000000,
      "transport": 1000000,
      "utilities": 8000000
    },
    "emergencyFundGoal": 7500000
  }
}
```

**Response:** `201 Created`

```json
{
  "id": "uuid",
  "userId": "uuid",
  "income": 3000,
  "expense": 1500,
  "pyfAmount": 500,
  "metadata": {...},
  "completedAt": null,
  "createdAt": "2025-01-01T00:00:00Z",
  "updatedAt": "2025-01-01T00:00:00Z"
}
```

**Errors:**

- `409 Conflict` - Profile already exists
- `422 Unprocessable Entity` - Invalid amounts (must be >= 0)

---

### 2. Get Onboarding Profile

**Endpoint:** `GET /onboarding/profile`  
**Auth:** Bearer Token Required  
**Purpose:** Retrieves the authenticated user's onboarding profile

**Database Operations:**

- **Reads:** `onboarding_profiles` table for user's profile data

**External Services:** None

**Response:** `200 OK`

```json
{
  "id": "uuid",
  "userId": "uuid",
  "income": 3000,
  "expense": 1500,
  "pyfAmount": 500,
  "budgetingStyle": "detail_tracker",  // or "goal_focused"
  "metadata": {...},
  "completedAt": "2025-01-01T00:00:00Z",
  "createdAt": "2025-01-01T00:00:00Z",
  "updatedAt": "2025-01-01T00:00:00Z"
}
```

**Errors:**

- `404 Not Found` - Profile doesn't exist

---

### 3. Update Onboarding Profile

**Endpoint:** `PATCH /onboarding/profile`  
**Auth:** Bearer Token Required  
**Purpose:** Updates the user's onboarding profile

**Database Operations:**

- **Reads:** `onboarding_profiles` table to find existing profile
- **Updates:** `onboarding_profiles` record with new data
- **Sets:** `completed_at` timestamp if `markAsCompleted` is true

**External Services:** None

**Request Body (all optional):**

```json
{
  "expense": 2000,
  "income": 3500,
  "pyfAmount": 600,
  "budgetingStyle": "detail_tracker",  // or "goal_focused"
  "metadata": {...},                    // See Metadata Structure section for schema
  "markAsCompleted": true
}
```

**Response:** `200 OK` - Returns updated profile

**Errors:**

- `404 Not Found` - Profile doesn't exist
- `422 Unprocessable Entity` - Invalid amounts

---

### Onboarding Profile Metadata Structure

The `metadata` field in onboarding profiles stores structured financial planning data. This field is flexible and can contain various financial planning attributes.

**Complete Metadata Schema:**

```json
{
  "goalDetails": {
    "type": "emergency_fund", // Goal type: "emergency_fund", "retirement", "investment", "debt_payoff"
    "amount": 90000000, // Target amount in smallest currency unit (e.g., VND)
    "timeframe": 12, // Goal timeframe in months
    "monthlyTarget": 7500000 // Monthly savings target
  },
  "stageConfirmed": true, // Whether user confirmed their financial stage
  "expenseBreakdown": {
    // Detailed expense categories in smallest currency unit
    "food": 2000000, // Food & dining expenses
    "rent": 6000000, // Housing/rent expenses
    "transport": 1000000, // Transportation costs
    "utilities": 8000000 // Utilities & bills
  },
  "emergencyFundGoal": 7500000 // Emergency fund target amount
}
```

**Field Descriptions:**

- **goalDetails**: Primary financial goal configuration
  - `type`: The main financial goal category
  - `amount`: Target amount to achieve
  - `timeframe`: Duration in months to achieve the goal
  - `monthlyTarget`: Calculated monthly savings needed
- **stageConfirmed**: Boolean flag indicating user has confirmed their financial planning stage
- **expenseBreakdown**: Detailed monthly expense allocation across categories
- **emergencyFundGoal**: Specific emergency fund target (typically 3-6 months of expenses)

**Usage in Complete Onboarding:**
When the onboarding is completed (`POST /onboarding/profile/complete`), the system uses the metadata to:

1. Calculate total monthly expenses from `expenseBreakdown`
2. Create budget categories based on expense categories
3. Set up emergency fund targets from `emergencyFundGoal`
4. Configure financial advice based on `goalDetails` and `riskTolerance`
5. Initialize savings plans based on `savingsPreference`

---

### 4. Complete Onboarding

**Endpoint:** `POST /onboarding/profile/complete`  
**Auth:** Bearer Token Required  
**Purpose:** Completes onboarding and creates initial budget setup

**Database Operations:**

- **Reads:** `onboarding_profiles` table for user profile and metadata
- **Updates:** `onboarding_profiles` - sets `completed_at` timestamp
- **Creates:** Multiple records in `budgets` table based on expense breakdown in metadata

**Business Logic:**

1. Calculates income from emergency fund goal (goal amount / 3)
2. Creates fixed budgets from expense breakdown
3. Creates flexible budget with remaining amount
4. Sets profile as completed

**Response:** `200 OK`

**Errors:**

- `404 Not Found` - Profile or required metadata missing

---

### 5. Stream Onboarding Message

**Endpoint:** `POST /onboarding/messages/stream`  
**Auth:** Bearer Token Required  
**Purpose:** Sends a message to AI advisor and receives streaming response

**Database Operations:**

- **Reads:** All `onboarding_messages` for conversation history
- **Creates:** User message in `onboarding_messages`
- **Creates:** AI response in `onboarding_messages` after streaming completes

**External Services:**

- **AI Internal Service** - Generates personalized financial advice
  - Analyzes user's financial profile
  - Considers conversation history
  - Provides contextual responses

**Request Body (StreamOnboardingMessageDto):**

```json
{
  "content": "I need help setting up my budget" // Required, non-empty
}
```

**Response:** Server-Sent Events (SSE) stream

```
data: {"content": "I'll help you set up..."}
data: {"content": "First, let's understand..."}
data: [DONE]
```

**Processing Flow:**

1. Save user message to database
2. Fetch conversation history
3. Stream AI response in real-time
4. Save complete AI response to database

---

### 6. Create Onboarding Message (Non-Streaming)

**Endpoint:** `POST /onboarding/messages`  
**Auth:** Bearer Token Required  
**Purpose:** Creates a non-streaming message (for UI components or manual messages)

**Database Operations:**

- **Creates:** New record in `onboarding_messages` table

**External Services:** None

**Request Body (CreateOnboardingMessageDto):**

```json
{
  "content": "Message text", // Optional, nullable
  "sender": "user", // Required: "user" or "ai"
  "component_id": "budget-widget", // Optional
  "metadata": {} // Optional
}
```

**Response:** `201 Created` - Returns created message

**Use Cases:**

- Saving component-only messages (content can be null)
- Recording UI interactions
- Manual message creation without AI response

---

### 7. Get Onboarding Messages

**Endpoint:** `GET /onboarding/messages`  
**Auth:** Bearer Token Required  
**Purpose:** Retrieves conversation history for onboarding

**Database Operations:**

- **Reads:** `onboarding_messages` table with optional filters

**External Services:** None

**Query Parameters:**

- `sender` - Filter by sender ("user" or "ai")
- `limit` - Limit number of messages
- `latest` - Get latest messages in descending order

**Response:** `200 OK`

```json
[
  {
    "id": "uuid",
    "userId": "uuid",
    "sender": "user",
    "content": "Message text",
    "componentId": null,
    "metadata": {},
    "createdAt": "2025-01-01T00:00:00Z"
  }
]
```

---

## AI Advisor APIs

### 1. Create Conversation

**Endpoint:** `POST /ai-advisor/conversations`  
**Auth:** Bearer Token Required  
**Purpose:** Creates a new AI advisor conversation thread

**Database Operations:**

- **Creates:** New record in `conversations` table

**External Services:** None

**Request Body:**

```json
{
  "name": "Budget Planning Discussion" // Required
}
```

**Response:** `201 Created`

```json
{
  "id": "uuid",
  "userId": "uuid",
  "name": "Budget Planning Discussion",
  "createdAt": "2025-01-01T00:00:00Z",
  "updatedAt": "2025-01-01T00:00:00Z"
}
```

---

### 2. Get Conversation

**Endpoint:** `GET /ai-advisor/conversations/:id`  
**Auth:** Bearer Token Required  
**Purpose:** Retrieves a specific conversation by ID

**Database Operations:**

- **Reads:** `conversations` table to find conversation
- **Validates:** User ownership of conversation

**External Services:** None

**Response:** `200 OK` - Returns conversation details

**Errors:**

- `403 Forbidden` - User doesn't own the conversation
- `404 Not Found` - Conversation doesn't exist

---

### 3. Stream Message in Conversation

**Endpoint:** `POST /ai-advisor/conversations/:id/stream`  
**Auth:** Bearer Token Required  
**Purpose:** Sends a message and receives streaming AI response

**Database Operations:**

- **Reads:** `conversations` table to validate conversation exists
- **Reads:** All `messages` for conversation history
- **Creates:** User message in `messages` table
- **Creates:** AI response in `messages` table after streaming

**External Services:**

- **AI Internal Service** - Generates contextual financial advice
  - Analyzes full conversation context
  - Considers user's financial profile from `onboarding_profiles`
  - Accesses current budgets, goals, and transactions
  - Provides personalized recommendations

**Request Body (StreamMessageDto):**

```json
{
  "content": "How can I improve my savings?" // Required, non-empty
}
```

**Response:** Server-Sent Events (SSE) stream

**Processing Flow:**

1. Validate conversation ownership
2. Save user message to database
3. Fetch full conversation history
4. Stream AI response in real-time to front end

---

### 4. Create Message (Non-Streaming)

**Endpoint:** `POST /ai-advisor/conversations/:id/messages`  
**Auth:** Bearer Token Required  
**Purpose:** Creates a non-streaming message in conversation

**Database Operations:**

- **Reads:** `conversations` table to validate ownership
- **Creates:** New record in `messages` table

**External Services:** None

**Request Body (CreateMessageDto):**

```json
{
  "content": "Message text", // Optional, nullable
  "type": "text", // Required: "text", "image", "photo", "component", "tool"
  "sender": "user", // Required: "user", "ai", "system"
  "metadata": {} // Optional
}
```

**Response:** `201 Created` - Returns created message

**Use Cases:**

- UI component messages
- System notifications
- Manual message recording

---

### 5. Get Conversation Messages

**Endpoint:** `GET /ai-advisor/conversations/:id/messages`  
**Auth:** Bearer Token Required  
**Purpose:** Retrieves all messages in a conversation

**Database Operations:**

- **Reads:** `conversations` table to validate ownership
- **Reads:** All `messages` for the conversation, ordered chronologically

**External Services:** None

**Response:** `200 OK`

```json
[
  {
    "id": "uuid",
    "conversationId": "uuid",
    "sender": "user",
    "type": "text",
    "content": "Message text",
    "metadata": {},
    "createdAt": "2025-01-01T00:00:00Z"
  }
]
```

**Errors:**

- `403 Forbidden` - User doesn't own the conversation
- `404 Not Found` - Conversation doesn't exist

---

## Internal Service APIs

Internal APIs use X-API-Key authentication for service-to-service communication.

### Onboarding Internal APIs

#### Get Profile with Financial Calculations

**Endpoint:** `GET /internal/onboarding/profile?userId={uuid}`  
**Auth:** X-API-Key  
**Purpose:** Retrieves user profile with additional financial calculations

**Database Operations:**

- **Reads:** `onboarding_profiles` for user profile
- **Reads:** `budgets` table for flexible category budgets (current month)
- **Reads:** `budget_transactions` join with `transactions` for spending data
- **Calculates:** Weekly allowance based on flexible budgets and spending

**External Services:** None

**Response Includes:**

- All standard profile fields
- `remainingFreeToSpendThisWeek` - Calculated weekly spending allowance

**Calculation Logic:**

1. Fetches all "flexible" budgets for current month
2. Sums total flexible budget amount
3. Divides by 4 weeks × current week number
4. Subtracts actual spending from flexible categories
5. Returns remaining weekly allowance

#### Update Profile

**Endpoint:** `PATCH /internal/onboarding/profile?userId={uuid}`  
**Auth:** X-API-Key  
**Purpose:** Updates any user's onboarding profile

**Database Operations:**

- **Reads:** `onboarding_profiles` to find profile
- **Updates:** `onboarding_profiles` with new data

**External Services:** None

#### Stream Message for User

**Endpoint:** `POST /internal/onboarding/messages/stream/:userId`  
**Auth:** X-API-Key  
**Purpose:** Creates AI chat message for specific user

**Database Operations:**

- **Reads:** `onboarding_messages` for conversation history
- **Creates:** User and AI messages in `onboarding_messages`

**External Services:**

- **AI Internal Service** - Generates responses

### AI Advisor Internal APIs

#### Create Conversation

**Endpoint:** `POST /internal/ai-advisor/conversations`  
**Auth:** X-API-Key  
**Purpose:** Creates conversation for any user

**Database Operations:**

- **Creates:** New record in `conversations` table

**External Services:** None

#### Stream Message for User

**Endpoint:** `POST /internal/ai-advisor/conversations/:id/stream/:userId`  
**Auth:** X-API-Key  
**Purpose:** Creates messages on behalf of users

**Database Operations:**

- **Reads:** `conversations` and `messages` for history
- **Creates:** User and AI messages in `messages` table

**External Services:**

- **AI Internal Service** - Generates responses

**Use Cases:**

- Automated financial advice
- System-generated conversations
- Scheduled financial insights

---

## Database Schema

### Core Tables

#### onboarding_profiles

```sql
CREATE TABLE onboarding_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id),
  income DECIMAL,
  expense DECIMAL,
  pyf_amount DECIMAL,
  budgeting_style TEXT, -- 'detail_tracker' or 'goal_focused'
  metadata JSONB,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);
```

#### onboarding_messages

```sql
CREATE TABLE onboarding_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  sender TEXT NOT NULL, -- 'user' or 'ai'
  content TEXT,         -- Nullable for component messages
  component_id TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);
```

#### conversations

```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);
```

#### messages

```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  sender TEXT NOT NULL,  -- 'user', 'ai', 'system'
  type TEXT NOT NULL,    -- 'text', 'image', 'photo', 'component', 'tool'
  content TEXT,          -- Nullable for component messages
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);
```

---

## Testing with Postman

### Getting Access Token

#### Method 1: Using Supabase API

```bash
# Sign in to get access token
curl -X POST 'https://[PROJECT_REF].supabase.co/auth/v1/token?grant_type=password' \
  -H "apikey: [ANON_KEY]" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

Response:

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 3600,
  "refresh_token": "..."
}
```

#### Method 2: Postman Environment Setup

1. **Create Environment Variables:**

   - `supabase_url`: Your Supabase URL
   - `supabase_anon_key`: Your anonymous key
   - `access_token`: Will store token after login
   - `backend_url`: http://localhost:3000

2. **Login Request:**

   ```
   POST {{supabase_url}}/auth/v1/token?grant_type=password
   Headers:
     apikey: {{supabase_anon_key}}
     Content-Type: application/json
   Body:
   {
     "email": "test@example.com",
     "password": "password123"
   }
   ```

3. **Auto-Save Token Script (Tests tab):**

   ```javascript
   if (pm.response.code === 200) {
     const response = pm.response.json();
     pm.environment.set('access_token', response.access_token);
   }
   ```

4. **Use Token in Requests:**
   ```
   GET {{backend_url}}/onboarding/profile
   Authorization: Bearer {{access_token}}
   ```

### Postman Collection Setup

1. **Collection Authorization:**

   - Type: Bearer Token
   - Token: `{{access_token}}`
   - All requests inherit this

2. **Testing Scenarios:**

   ```bash
   # Public endpoint (no auth)
   GET {{backend_url}}/health

   # Protected endpoint
   GET {{backend_url}}/onboarding/profile
   Authorization: Bearer {{access_token}}

   # Invalid token test
   GET {{backend_url}}/onboarding/profile
   Authorization: Bearer invalid_token

   # Internal API
   GET {{backend_url}}/internal/onboarding/profile?userId=uuid
   X-API-Key: {{api_key}}
   ```

---

## Error Handling

### Standard Error Response

```json
{
  "statusCode": 400,
  "message": "Error message",
  "error": "Bad Request"
}
```

### Common HTTP Status Codes

| Code | Meaning               | Common Scenarios        |
| ---- | --------------------- | ----------------------- |
| 200  | OK                    | Successful GET/PATCH    |
| 201  | Created               | Successful POST         |
| 400  | Bad Request           | Invalid request body    |
| 401  | Unauthorized          | Missing/invalid token   |
| 403  | Forbidden             | No access to resource   |
| 404  | Not Found             | Resource doesn't exist  |
| 409  | Conflict              | Resource already exists |
| 422  | Unprocessable Entity  | Validation failed       |
| 500  | Internal Server Error | Server error            |

### Authentication Errors

- **No Token:** `401 - "Authorization header missing"`
- **Invalid Token:** `401 - "Invalid or expired token"`
- **Expired Token:** `401 - "Token has expired"`

### Business Logic Errors

- **Profile Not Found:** `404 - "Onboarding profile not found"`
- **Profile Already Exists:** `409 - "User already has an onboarding profile"`
- **Invalid Amount:** `422 - "Financial amounts must be greater than or equal to 0"`
- **Access Denied:** `403 - "You don't have access to this resource"`

---

## API Documentation Access

### Swagger UI

- Development: http://localhost:3000/api
- Production: https://api.infina.app/api

### OpenAPI Specification

- JSON: http://localhost:3000/api-json
- YAML: http://localhost:3000/api-yaml

---

## Notes

- All financial amounts stored as Decimal type
- Timestamps in UTC (ISO 8601 format)
- UUIDs for all identifiers
- Soft delete supported (deleted_at field)
- Message content nullable for component-only messages
- Streaming responses use Server-Sent Events (SSE)
- Metadata fields allow flexible data storage
- PYF = Pay Yourself First (savings strategy)
