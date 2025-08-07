# User API Documentation

## Overview
This document describes the User API endpoints, their usage, parameters, and database interactions.

## API Endpoints

### 1. Get User Profile
**Endpoint:** `GET /users/profile`

**Purpose:** Retrieves the authenticated user's profile information

**Response Includes:**
- User ID
- Name
- Financial stage (debt, start_saving, start_investing)
- Language preference (vi, en)
- Currency preference (vnd, usd, eur)
- Created/Updated timestamps

**Database Tables Accessed:**
- `users` (public schema) - Reads user profile data

**External Services:** None

---

### 2. Create User Profile
**Endpoint:** `POST /users/profile`

**Purpose:** Creates a new profile for the authenticated user

**Request Body:**
```json
{
  "name": "string",                    // Full name (required, 2-100 chars)
  "financialStage": "string",          // "debt", "start_saving", or "start_investing" (optional)
  "currency": "string",                // "vnd", "usd", or "eur" (optional, default: "vnd")
  "language": "string"                 // "vi" or "en" (optional, default: "vi")
}
```

**Database Tables Affected:**
- `users` (public schema) - Creates new user profile record

**External Services:** None

**Notes:**
- Returns 409 if profile already exists
- Name must not be only whitespace

---

### 3. Update User Profile
**Endpoint:** `PUT /users/profile`

**Purpose:** Updates the authenticated user's profile information

**Request Body (all optional):**
```json
{
  "name": "string",                    // Full name (2-100 chars)
  "financialStage": "string",          // "debt", "start_saving", or "start_investing"
  "currency": "string",                // "vnd", "usd", or "eur"
  "language": "string"                 // "vi" or "en"
}
```

**Database Tables Affected:**
- `users` (public schema) - Updates user profile record

**External Services:** None

**Notes:**
- Returns 404 if user profile not found
- Only updates provided fields

---

## Webhook Endpoints

### 4. User Signed Up Webhook
**Endpoint:** `POST /webhook/user-signed-up`

**Purpose:** Handles new user registration events from Supabase Auth

**Authentication:** Webhook authentication guard (not JWT)

**Request Body:**
```json
{
  "record": {
    "id": "string",      // User ID from Supabase Auth
    "email": "string"    // User's email address
  }
}
```

**Processing:**
- Extracts name from email address
- Creates initial user profile

**Database Tables Affected:**
- `users` (public schema) - Creates initial user record

**External Services:** None

**Notes:**
- Called automatically by Supabase on user registration
- Uses email prefix as default name if no name provided

---

## Internal API Endpoints

These endpoints are for internal service communication only and require API key authentication.

### 5. Get User Profile (Internal)
**Endpoint:** `GET /internal/users/profile/:userId`

**Purpose:** Retrieves any user's profile by ID (for internal services)

**URL Parameters:**
- `userId` (UUID) - Target user's ID

**Authentication:** X-API-Key header

**Database Tables Accessed:**
- `users` (public schema) - Reads user profile data

---

### 6. Create User Profile (Internal)
**Endpoint:** `POST /internal/users/profile/:userId`

**Purpose:** Creates a profile for a specific user (for internal services)

**URL Parameters:**
- `userId` (UUID) - Target user's ID

**Request Body:** Same as public create endpoint

**Authentication:** X-API-Key header

**Database Tables Affected:**
- `users` (public schema) - Creates new user profile record

---

### 7. Update User Profile (Internal)
**Endpoint:** `PUT /internal/users/profile/:userId`

**Purpose:** Updates a specific user's profile (for internal services)

**URL Parameters:**
- `userId` (UUID) - Target user's ID

**Request Body:** Same as public update endpoint

**Authentication:** X-API-Key header

**Database Tables Affected:**
- `users` (public schema) - Updates user profile record

---

## Authentication Types

1. **Public Endpoints** (`/users/*`): JWT Bearer token via Supabase Auth
2. **Webhook Endpoint** (`/webhook/*`): Webhook authentication guard
3. **Internal Endpoints** (`/internal/users/*`): X-API-Key header

## Database Schema

### Main Table:

**users** (mapped from `public_users` in schema)
- `id` - Unique identifier
- `user_id` - Links to Supabase Auth user
- `name` - User's full name
- `financial_stage` - Current financial stage
- `language` - Preferred language
- `currency` - Preferred currency
- `created_at` - Profile creation timestamp
- `updated_at` - Last update timestamp
- `deleted_at` - Soft delete timestamp

## Notes
- All public endpoints require JWT authentication
- User profiles are linked to Supabase Auth users via `user_id`
- Financial stages represent user's financial journey progression
- Language and currency preferences affect UI/UX presentation
- Webhook creates minimal profile; users complete it later