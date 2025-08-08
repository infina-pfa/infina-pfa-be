# Onboarding API Documentation

## Overview
This document describes the Onboarding API endpoints for managing user onboarding profiles and messages (chat with AI advisor).

## API Endpoints

### Onboarding Profile Endpoints

### 1. Create Onboarding Profile
**Endpoint:** `POST /onboarding/profile`

**Purpose:** Creates an onboarding profile for the authenticated user to track financial information

**Request Body:**
```json
{
  "expense": "number",           // Monthly expense amount (optional, min: 0)
  "income": "number",            // Monthly income amount (optional, min: 0)
  "pyfAmount": "number",         // Pay Yourself First amount (optional, min: 0)
  "metadata": {                  // Additional metadata (optional)
    "financialGoals": ["retirement", "emergency_fund"],
    "riskTolerance": "moderate"
  }
}
```

**Database Tables Affected:**
- `onboarding_profiles` - Creates new onboarding profile record

**External Services:** None

**Notes:**
- Returns 409 if profile already exists
- All amounts must be >= 0

---

### 2. Get Onboarding Profile
**Endpoint:** `GET /onboarding/profile`

**Purpose:** Retrieves the authenticated user's onboarding profile

**Response Includes:**
- User ID
- Income, Expense, PYF Amount
- **budgetingStyle** - User's preferred budgeting approach ("detail_tracker" or "goal_focused")
- Metadata (financial goals, risk tolerance, etc.)
- Completed status and timestamp
- Created/Updated timestamps

**Database Tables Accessed:**
- `onboarding_profiles` - Reads profile data

**External Services:** None

---

### 3. Update Onboarding Profile
**Endpoint:** `PATCH /onboarding/profile`

**Purpose:** Updates the authenticated user's onboarding profile

**Request Body (all optional):**
```json
{
  "expense": "number",           // Monthly expense amount (min: 0)
  "income": "number",            // Monthly income amount (min: 0)
  "pyfAmount": "number",         // Pay Yourself First amount (min: 0)
  "metadata": {},                // Additional metadata
  "markAsCompleted": "boolean",  // Mark onboarding as completed
  "budgetingStyle": "string"     // "detail_tracker" or "goal_focused"
}
```

**Database Tables Affected:**
- `onboarding_profiles` - Updates profile record including budgeting_style column
- Sets `completed_at` timestamp if `markAsCompleted` is true

**External Services:** None

**Notes:**
- **budgetingStyle** options:
  - `detail_tracker` - User prefers detailed budget tracking
  - `goal_focused` - User focuses on financial goals

---

### Onboarding Message Endpoints (AI Chat)

### 4. Create Onboarding Message (Stream)
**Endpoint:** `POST /onboarding/messages/stream`

**Purpose:** Sends a message to the AI advisor and receives a streaming response

**Request Body:**
```json
{
  "content": "string"    // User's message content (required)
}
```

**Response Type:** Server-Sent Events (SSE) stream

**Processing:**
- User message saved to database
- AI generates response via streaming
- AI response saved to database after completion

**Database Tables Affected:**
- `onboarding_messages` - Creates user message record
- `onboarding_messages` - Creates AI response record

**External Services:** 
- **AI Advisor Service** - Generates personalized financial advice

**Notes:**
- Response sent as text/event-stream
- Real-time streaming of AI response
- Both user and AI messages are persisted

---

### 5. Get Onboarding Messages
**Endpoint:** `GET /onboarding/messages`

**Purpose:** Retrieves conversation history between user and AI advisor

**Query Parameters (all optional):**
- `sender` - Filter by sender ("user" or "ai")
- `limit` - Limit number of messages (used with latest=true)
- `latest` - Get latest messages in descending order

**Database Tables Accessed:**
- `onboarding_messages` - Reads message history

**External Services:** None

**Response Includes:**
- Message ID
- Sender (user/ai)
- Content
- Component ID (for UI components)
- Metadata
- Created/Updated timestamps

---

## Internal API Endpoints

### 6. Get Onboarding Profile (Internal)
**Endpoint:** `GET /internal/onboarding/profile`

**Purpose:** Retrieves any user's onboarding profile with additional financial calculations (for internal services)

**Query Parameters:**
- `userId` (UUID) - Target user's ID

**Authentication:** X-API-Key header

**Response Includes:**
- All standard profile fields (income, expense, pyfAmount, metadata)
- **remainingFreeToSpendThisWeek** - Calculated weekly allowance based on flexible budgets

**Calculation Logic:**
- Fetches all "flexible" category budgets for current month
- Calculates total flexible budget amount
- Divides by 4 weeks and multiplies by current week number
- Subtracts actual spending from flexible budgets
- Returns remaining allowance for the week

**Database Tables Accessed:**
- `onboarding_profiles` - Reads profile data
- `budgets` - Reads flexible budgets for current month
- `budget_transactions` - Reads spending transactions
- `transactions` - Reads transaction amounts

**External Services:** None

---

### 7. Update Onboarding Profile (Internal)
**Endpoint:** `PATCH /internal/onboarding/profile`

**Purpose:** Updates any user's onboarding profile (for internal services)

**Query Parameters:**
- `userId` (UUID) - Target user's ID

**Request Body:** Same as public update endpoint

**Authentication:** X-API-Key header

**Database Tables Affected:**
- `onboarding_profiles` - Updates profile record

---

### 8. Create Onboarding Message Stream (Internal)
**Endpoint:** `POST /internal/onboarding/messages/stream/:userId`

**Purpose:** Creates AI chat message for a specific user (for internal services)

**URL Parameters:**
- `userId` (UUID) - Target user's ID

**Request Body:**
```json
{
  "content": "string"    // Message content
}
```

**Authentication:** X-API-Key header

**Database Tables Affected:**
- `onboarding_messages` - Creates message records

**External Services:**
- **AI Advisor Service** - Generates responses

---

## Authentication Types

1. **Public Endpoints** (`/onboarding/*`): JWT Bearer token via Supabase Auth
2. **Internal Endpoints** (`/internal/onboarding/*`): X-API-Key header

## Database Schema

### Tables:

**onboarding_profiles**
- `id` - Unique identifier
- `user_id` - Links to auth user (unique)
- `income` - Monthly income amount
- `expense` - Monthly expense amount
- `pyf_amount` - Pay Yourself First amount
- `budgeting_style` - User's preferred budgeting approach (enum: "detail_tracker" or "goal_focused")
- `metadata` - JSON for additional data
- `completed_at` - Onboarding completion timestamp
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp
- `deleted_at` - Soft delete timestamp

**onboarding_messages**
- `id` - Unique identifier
- `user_id` - Links to auth user
- `sender` - "user" or "ai"
- `content` - Message text
- `component_id` - UI component identifier
- `metadata` - Additional message data
- `created_at` - Message timestamp
- `updated_at` - Last update timestamp
- `deleted_at` - Soft delete timestamp

## Notes
- Onboarding profile tracks user's financial baseline
- PYF (Pay Yourself First) is a savings strategy amount
- AI advisor provides personalized financial guidance
- Messages are streamed for real-time interaction
- All financial amounts stored as Decimal type
- Metadata field allows flexible data storage