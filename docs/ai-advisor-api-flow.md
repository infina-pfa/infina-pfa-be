# AI Advisor API Documentation

## Overview
This document describes the AI Advisor API endpoints for managing conversations and messages with the AI financial advisor. The AI Advisor provides personalized financial guidance through a chat interface.

**Recent Updates:**
- Message content is now nullable/optional to support component-only messages
- Introduced dedicated `StreamMessageDto` for streaming endpoints
- Added `CreateMessageDto` for non-streaming message creation
- Enhanced message entity with multiple sender and type enums

## API Endpoints

### 1. Create Conversation
**Endpoint:** `POST /ai-advisor/conversations`

**Purpose:** Creates a new conversation thread with the AI advisor

**Request Body:**
```json
{
  "name": "string"    // Conversation title (required)
}
```

**Example:**
```json
{
  "name": "Budget Planning Discussion"
}
```

**Database Tables Affected:**
- `conversations` - Creates new conversation record

**External Services:** None

---

### 2. Get Conversation
**Endpoint:** `GET /ai-advisor/conversations/:id`

**Purpose:** Retrieves a specific conversation by ID

**URL Parameters:**
- `id` (UUID) - Conversation ID

**Response Includes:**
- Conversation ID
- Name/Title
- User ID
- Created/Updated timestamps

**Database Tables Accessed:**
- `conversations` - Reads conversation data

**External Services:** None

**Notes:**
- Returns 403 if user doesn't own the conversation
- Returns 404 if conversation not found

---

### 3. Stream Message
**Endpoint:** `POST /ai-advisor/conversations/:id/stream`

**Purpose:** Sends a message to the AI advisor and receives a streaming response

**URL Parameters:**
- `id` (UUID) - Conversation ID

**Request Body (StreamMessageDto):**
```json
{
  "content": "string"          // Message content (required, non-empty)
}
```

**Example:**
```json
{
  "content": "How can I create a budget for this month?"
}
```

**Response Type:** Server-Sent Events (SSE) stream

**Processing:**
1. User message saved to database
2. AI generates response via streaming
3. Response chunks sent in real-time
4. AI response saved to database after completion

**Database Tables Affected:**
- `messages` - Creates user message record
- `messages` - Creates AI response record

**External Services:**
- **AI Service** - Generates personalized financial advice based on:
  - User's financial profile
  - Conversation history
  - Current budgets, goals, and transactions

**Notes:**
- Response sent as text/event-stream
- Real-time streaming for better UX
- Both user and AI messages are persisted

---

### 4. Get Messages
**Endpoint:** `GET /ai-advisor/conversations/:id/messages`

**Purpose:** Retrieves all messages in a conversation

**URL Parameters:**
- `id` (UUID) - Conversation ID

**Response Includes:**
- Array of messages with:
  - Message ID
  - Content
  - Sender (user/ai)
  - Metadata
  - Created/Updated timestamps

**Database Tables Accessed:**
- `messages` - Reads all messages for conversation

**External Services:** None

**Notes:**
- Messages returned in chronological order
- Returns 403 if user doesn't own the conversation

---

### 5. Create Message (Non-Streaming)
**Endpoint:** `POST /ai-advisor/conversations/:id/messages`

**Purpose:** Creates a non-streaming message in a conversation

**URL Parameters:**
- `id` (UUID) - Conversation ID

**Request Body (CreateMessageDto):**
```json
{
  "content": "string",           // Message content (optional, nullable)
  "type": "string",              // Message type: "text", "image", "photo", "component", "tool"
  "sender": "string",            // Sender: "user", "ai", "system"
  "metadata": {}                 // Optional metadata
}
```

**Example:**
```json
{
  "content": "Here's my budget analysis",
  "type": "text",
  "sender": "user",
  "metadata": {
    "timestamp": "2025-01-01T00:00:00Z"
  }
}
```

**Database Tables Affected:**
- `messages` - Creates message record

**External Services:** None

**Notes:**
- Content is optional/nullable to support component-only messages
- Supports multiple message types and sender types
- Used for saving messages without AI streaming response

---

## Internal API Endpoints

### 6. Create Conversation (Internal)
**Endpoint:** `POST /internal/ai-advisor/conversations`

**Authentication:** X-API-Key header

Same as public endpoint but for internal services.

---

### 7. Get Conversation (Internal)
**Endpoint:** `GET /internal/ai-advisor/conversations/:id`

**Authentication:** X-API-Key header

Same as public endpoint but for internal services.

---

### 8. Stream Message (Internal)
**Endpoint:** `POST /internal/ai-advisor/conversations/:id/stream/:user_id`

**Authentication:** X-API-Key header

**URL Parameters:**
- `id` (UUID) - Conversation ID
- `user_id` (UUID) - Target user ID

**Request Body (StreamMessageDto):** Same as public endpoint

**Notes:**
- Allows services to create messages on behalf of users
- Used for automated advice or system-generated conversations

---

### 9. Get Messages (Internal)
**Endpoint:** `GET /internal/ai-advisor/conversations/:id/messages`

**Authentication:** X-API-Key header

Same as public endpoint but for internal services.

---

## Authentication Types

1. **Public Endpoints** (`/ai-advisor/*`): JWT Bearer token via Supabase Auth
2. **Internal Endpoints** (`/internal/ai-advisor/*`): X-API-Key header

## Database Schema

### Tables:

**conversations**
- `id` - Unique identifier (UUID)
- `user_id` - Links to auth.users (UUID)
- `name` - Conversation title (required)
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp
- `deleted_at` - Soft delete timestamp (nullable)

**messages**
- `id` - Unique identifier (UUID)
- `conversation_id` - Links to conversations table (UUID)
- `user_id` - Links to auth.users (UUID)
- `content` - Message text (nullable - supports component-only messages)
- `type` - Message type enum:
  - `text` - Regular text message
  - `image` - Image content
  - `photo` - Photo content
  - `component` - UI component message
  - `tool` - Tool-generated message
- `sender` - Sender type enum:
  - `user` - User-generated message
  - `ai` - AI-generated response
  - `system` - System-generated message
- `metadata` - Additional message data (JSON, nullable)
- `created_at` - Message timestamp
- `updated_at` - Last update timestamp
- `deleted_at` - Soft delete timestamp (nullable)

## AI Service Integration

The AI Advisor service:
1. **Analyzes User Context:**
   - Financial profile (income, expenses, PYF amount)
   - Active budgets and spending patterns
   - Financial goals and progress
   - Transaction history

2. **Provides Personalized Advice:**
   - Budget recommendations
   - Spending insights
   - Goal setting guidance
   - Financial planning strategies

3. **Maintains Conversation Context:**
   - Remembers previous messages in conversation
   - Provides contextual responses
   - Learns from user preferences

## Domain Architecture

### Domain Structure
The AI Advisor module follows Clean Architecture principles:

**Domain Layer (`/domain`):**
- **Entities:**
  - `ConversationEntity` - Represents a chat conversation
  - `MessageEntity` - Represents individual messages
- **Repositories (Abstract):**
  - `ConversationRepository` - Interface for conversation persistence
  - `MessageRepository` - Interface for message persistence
- **Services (Abstract):**
  - `AiAdvisorService` - Interface for AI integration

**Infrastructure Layer (`/infrastructure`):**
- **Repository Implementations:**
  - `ConversationRepositoryImpl` - Prisma-based implementation
  - `MessageRepositoryImpl` - Prisma-based implementation
- **Service Implementations:**
  - `AiAdvisorServiceImpl` - Handles streaming and AI communication

**Use Cases (`/use-cases`):**
- `CreateConversationUseCase` - Creates new conversations
- `GetConversationUseCase` - Retrieves conversations with ownership validation
- `CreateMessageUseCase` - Creates non-streaming messages
- `GetMessagesUseCase` - Retrieves conversation messages

**Controllers (`/controllers`):**
- `AiAdvisorController` - Public API endpoints
- `AiInternalAdvisorController` - Internal service endpoints

### Key Design Patterns
- **Repository Pattern** - Abstracts data persistence
- **Use Case Pattern** - Encapsulates business logic
- **Entity Pattern** - Domain models with business rules
- **DTO Pattern** - Data transfer objects for API contracts

## Notes
- Conversations provide isolated contexts for different financial topics
- AI responses are tailored to user's financial situation
- Streaming provides real-time interaction experience
- All messages are persisted for conversation history
- Soft delete supported for conversations and messages
- Message content is nullable to support UI component messages
- Multiple message types and sender types for flexibility