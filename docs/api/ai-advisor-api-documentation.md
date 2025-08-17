# AI Advisor API Documentation

## Overview

This document provides comprehensive API documentation for the AI Advisor feature. The AI Advisor provides intelligent financial guidance through conversational interactions, supporting text messages and image uploads for document analysis.

## Architecture Overview

The AI Advisor system follows Clean Architecture principles with the following components:

- **Controllers**: HTTP endpoints with comprehensive Swagger documentation
- **Use Cases**: Business logic for conversation and message management
- **Domain Services**: Core AI processing and streaming capabilities
- **Infrastructure**: Persistence layer and external service integrations

## Base Configuration

### Base URL
```
http://localhost:3000/api/v1
```

### Authentication
All endpoints require Supabase Auth JWT token:

```typescript
headers: {
  'Authorization': `Bearer ${accessToken}`,
  'Content-Type': 'application/json'
}
```

## Data Models

### Enums

#### MessageSender
```typescript
enum MessageSender {
  AI = 'ai',      // AI assistant responses
  USER = 'user',  // User messages
  SYSTEM = 'system' // System notifications
}
```

#### MessageType
```typescript
enum MessageType {
  TEXT = 'text',         // Text message
  IMAGE = 'image',       // Image attachment
  PHOTO = 'photo',       // Photo attachment
  COMPONENT = 'component', // UI component
  TOOL = 'tool'          // Tool/function call
}
```

### Response Models

#### ConversationDto
```typescript
interface ConversationDto {
  id: string;        // UUID
  name: string;      // Conversation title
  userId: string;    // Owner's UUID
  createdAt: Date;   // ISO 8601 timestamp
  updatedAt: Date;   // ISO 8601 timestamp
}
```

#### MessageDto
```typescript
interface MessageDto {
  id: string;                    // UUID
  conversationId: string;        // Parent conversation UUID
  sender: MessageSender;         // Message sender type
  type: MessageType;            // Message content type
  content: string | null;       // Message text content
  metadata: Record<string, any>; // Additional metadata
  createdAt: Date;              // ISO 8601 timestamp
  updatedAt: Date;              // ISO 8601 timestamp
}
```

## Endpoints

### 1. Create Conversation

Creates a new AI conversation for the authenticated user.

**Endpoint:** `POST /ai-advisor/conversations`

**Request Body:**
```typescript
interface CreateConversationDto {
  name: string; // Conversation title (required, non-empty)
}
```

**Example Request:**
```json
{
  "name": "Budget Planning Discussion"
}
```

**Response:** `201 Created`
```typescript
ConversationDto
```

**Example Response:**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Budget Planning Discussion",
  "userId": "987e6543-e89b-12d3-a456-426614174000",
  "createdAt": "2025-01-01T00:00:00Z",
  "updatedAt": "2025-01-01T00:00:00Z"
}
```

**Error Responses:**
- `400 Bad Request` - Invalid input (empty name)
- `401 Unauthorized` - Missing or invalid token

### 2. Get Conversation

Retrieves details of a specific conversation.

**Endpoint:** `GET /ai-advisor/conversations/{id}`

**Path Parameters:**
- `id` - Conversation UUID (required)

**Response:** `200 OK`
```typescript
ConversationDto
```

**Error Responses:**
- `400 Bad Request` - Invalid UUID format
- `401 Unauthorized` - User not authenticated
- `403 Forbidden` - Access denied (not owner)
- `404 Not Found` - Conversation not found

### 3. Stream Message (Real-time AI Response)

Sends a message to the AI and receives a streaming response via Server-Sent Events (SSE).

**Endpoint:** `POST /ai-advisor/conversations/{id}/stream`

**Path Parameters:**
- `id` - Conversation UUID (required)

**Request Body:**
```typescript
interface StreamMessageDto {
  content: string;        // Message content (required, non-empty)
  sender: MessageSender;  // Sender type (required)
  imageUrls?: string[];   // Optional image URLs for context
}
```

**Example Request:**
```json
{
  "content": "How can I create a budget for this month?",
  "sender": "user",
  "imageUrls": ["https://storage.example.com/receipts/receipt1.jpg"]
}
```

**Response:** `200 OK` (Server-Sent Events Stream)

**Stream Format:**
```
Content-Type: text/event-stream

data: {"type":"start","message":"Processing your request..."}\n\n
data: {"type":"token","content":"Based"}\n\n
data: {"type":"token","content":" on"}\n\n
data: {"type":"token","content":" your"}\n\n
data: {"type":"end","message":"Response complete"}\n\n
```

**Error Responses:**
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Missing or invalid token
- `404 Not Found` - Conversation not found
- `500 Internal Server Error` - AI service error

### 4. Get Messages

Retrieves all messages in a conversation.

**Endpoint:** `GET /ai-advisor/conversations/{id}/messages`

**Path Parameters:**
- `id` - Conversation UUID (required)

**Response:** `200 OK`
```typescript
MessageDto[]
```

**Example Response:**
```json
[
  {
    "id": "msg_001",
    "conversationId": "conv_123",
    "sender": "user",
    "type": "text",
    "content": "How can I save money?",
    "metadata": {},
    "createdAt": "2025-01-01T10:00:00Z",
    "updatedAt": "2025-01-01T10:00:00Z"
  },
  {
    "id": "msg_002",
    "conversationId": "conv_123",
    "sender": "ai",
    "type": "text",
    "content": "Here are some effective ways to save money...",
    "metadata": {"model": "claude-3"},
    "createdAt": "2025-01-01T10:00:05Z",
    "updatedAt": "2025-01-01T10:00:05Z"
  }
]
```

**Error Responses:**
- `400 Bad Request` - Invalid UUID format
- `401 Unauthorized` - User not authenticated
- `403 Forbidden` - Access denied
- `404 Not Found` - Conversation not found

### 5. Create Message

Creates a new message in a conversation (non-streaming).

**Endpoint:** `POST /ai-advisor/conversations/{id}/messages`

**Path Parameters:**
- `id` - Conversation UUID (required)

**Request Body:**
```typescript
interface CreateMessageDto {
  content?: string | null;        // Message content (optional)
  type: MessageType;              // Message type (required)
  sender: MessageSender;          // Sender type (required)
  metadata?: Record<string, any>; // Optional metadata
}
```

**Example Request:**
```json
{
  "content": "What's my current budget status?",
  "type": "text",
  "sender": "user",
  "metadata": {
    "timestamp": "2025-01-01T00:00:00Z"
  }
}
```

**Response:** `201 Created`
```typescript
MessageDto
```

**Error Responses:**
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Missing or invalid token
- `404 Not Found` - Conversation not found

### 6. Get Start Message

Retrieves a personalized welcome message for the user based on their profile and current financial status.

**Endpoint:** `GET /ai-advisor/start-message`

**Response:** `200 OK`
```typescript
string // Plain text welcome message
```

**Example Response:**
```
"Welcome back! I see you've been tracking your expenses well. Your budget utilization is at 65% this month. How can I help you today?"
```

**Error Responses:**
- `401 Unauthorized` - User not authenticated

### 7. Upload Image

Uploads an image for document analysis (receipts, statements, etc.).

**Endpoint:** `POST /ai-advisor/conversations/{id}/upload-image`

**Path Parameters:**
- `id` - Conversation UUID (required)

**Request:**
- **Content-Type:** `multipart/form-data`
- **Form Field:** `image` - Binary image file

**File Requirements:**
- **Formats:** JPEG, PNG, GIF, WebP
- **Max Size:** 10MB
- **Field Name:** `image`

**Example cURL Request:**
```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@/path/to/receipt.jpg" \
  http://localhost:3000/api/v1/ai-advisor/conversations/{id}/upload-image
```

**Response:** `201 Created`
```typescript
interface UploadImageResponseDto {
  fileName: string;   // Stored file name
  filePath: string;   // Storage path
  publicUrl: string;  // Public access URL
  size: number;       // File size in bytes
  mimeType: string;   // MIME type
}
```

**Example Response:**
```json
{
  "fileName": "image_1234567890.jpg",
  "filePath": "conversations/conv_123/image_1234567890.jpg",
  "publicUrl": "https://storage.example.com/conversations/conv_123/image_1234567890.jpg",
  "size": 1024000,
  "mimeType": "image/jpeg"
}
```

**Error Responses:**
- `400 Bad Request` - Invalid file type or size exceeds limit
- `401 Unauthorized` - User not authenticated
- `404 Not Found` - Conversation not found

## Usage Examples

### Example 1: Complete Conversation Flow

```typescript
// 1. Create a new conversation
const conversation = await fetch('/api/v1/ai-advisor/conversations', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Financial Planning Session'
  })
});

const { id: conversationId } = await conversation.json();

// 2. Upload a receipt image
const formData = new FormData();
formData.append('image', receiptFile);

const uploadResponse = await fetch(
  `/api/v1/ai-advisor/conversations/${conversationId}/upload-image`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  }
);

const { publicUrl } = await uploadResponse.json();

// 3. Send message with image context (streaming)
const eventSource = new EventSource(
  `/api/v1/ai-advisor/conversations/${conversationId}/stream`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      content: 'Can you analyze this receipt and categorize the expenses?',
      sender: 'user',
      imageUrls: [publicUrl]
    })
  }
);

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('AI Response:', data);
};

// 4. Retrieve conversation history
const messages = await fetch(
  `/api/v1/ai-advisor/conversations/${conversationId}/messages`,
  {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }
);

const history = await messages.json();
```

### Example 2: Handling Streaming Responses

```javascript
function streamAIResponse(conversationId, message, token) {
  const eventSource = new EventSource(
    `/api/v1/ai-advisor/conversations/${conversationId}/stream`
  );
  
  let fullResponse = '';
  
  eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data);
    
    switch(data.type) {
      case 'start':
        console.log('AI is thinking...');
        break;
      case 'token':
        fullResponse += data.content;
        updateUIWithPartialResponse(fullResponse);
        break;
      case 'end':
        console.log('Response complete');
        eventSource.close();
        break;
      case 'error':
        console.error('Error:', data.message);
        eventSource.close();
        break;
    }
  };
  
  eventSource.onerror = (error) => {
    console.error('Stream error:', error);
    eventSource.close();
  };
  
  // Send the message
  fetch(`/api/v1/ai-advisor/conversations/${conversationId}/stream`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      content: message,
      sender: 'user'
    })
  });
}
```

## Key Implementation Notes

1. **Streaming Responses**: The `/stream` endpoint uses Server-Sent Events for real-time AI responses
2. **Image Processing**: Uploaded images are stored securely and can be referenced in AI conversations
3. **Conversation Context**: The AI maintains context within each conversation for coherent interactions
4. **Message Types**: Support for various content types enables rich interactions
5. **Metadata**: Flexible metadata structure allows for extensibility
6. **Authentication**: All endpoints require valid Supabase JWT tokens
7. **Rate Limiting**: Consider implementing rate limits for AI endpoints to manage costs
8. **File Validation**: Image uploads are validated for type and size on the server
9. **Soft Deletes**: Messages and conversations support soft deletion
10. **User Isolation**: Users can only access their own conversations and messages

## Error Handling

All endpoints follow a consistent error response format:

```typescript
interface ErrorResponse {
  statusCode: number;
  message: string;
  error?: string;
  timestamp: string;
  path: string;
}
```

Example error response:
```json
{
  "statusCode": 404,
  "message": "Conversation not found",
  "error": "Not Found",
  "timestamp": "2025-01-01T00:00:00Z",
  "path": "/api/v1/ai-advisor/conversations/invalid-id"
}
```

## Security Considerations

1. **Authentication**: Bearer token required for all endpoints
2. **Authorization**: Users can only access their own conversations
3. **Input Validation**: All inputs are validated using class-validator decorators
4. **File Upload Security**: 
   - File type validation (images only)
   - Size limits (10MB max)
   - Virus scanning recommended for production
5. **Rate Limiting**: Implement rate limits to prevent abuse
6. **Content Filtering**: Consider implementing content moderation for user messages
7. **Data Encryption**: Sensitive financial data should be encrypted at rest
8. **Audit Logging**: Log all AI interactions for compliance and debugging