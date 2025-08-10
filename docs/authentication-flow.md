# Authentication Flow Documentation

## Overview
This document describes the authentication flow between the web application and the backend API using Supabase Auth. The system uses JWT Bearer tokens for authentication, with Supabase handling user management and token generation.

## Architecture Components

### Backend (NestJS API)
- Validates tokens using Supabase Auth
- Guards protect API endpoints
- Extracts user context from valid tokens
- Uses Bearer token authentication

## Authentication Flow

### 1. User Login Flow
```mermaid
sequenceDiagram
    participant User
    participant WebApp
    participant Supabase
    participant Backend

    User->>WebApp: Enter credentials
    WebApp->>Supabase: signInWithPassword()
    Supabase-->>WebApp: Session + Access Token
    WebApp->>WebApp: Store session
    WebApp->>Backend: API Request + Bearer Token
    Backend->>Supabase: Verify token
    Supabase-->>Backend: User data
    Backend-->>WebApp: API Response
```

### 2. API Request Format
```http
GET /api/endpoint
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

## Backend Implementation

### SupabaseAuthGuard
Located at: `src/common/guards/supabase-auth.guard.ts`

The guard performs the following steps:
1. **Check if endpoint is public** - Skip authentication for public endpoints
2. **Extract token** - Get Bearer token from Authorization header
3. **Verify token** - Call Supabase to validate token
4. **Attach user** - Add user data to request object
5. **Grant/Deny access** - Return true for valid tokens, throw error otherwise

```typescript
@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1. Check if endpoint is public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (isPublic) return true;

    // 2. Extract token from header
    const token = this.extractTokenFromHeader(request);
    
    // 3. Verify with Supabase
    const { data, error } = await this.supabase.auth.getUser(token);
    
    // 4. Attach user to request
    request.user = data.user;
    
    return true;
  }
}
```

### Global vs Endpoint Protection

#### Global Protection (Default)
All endpoints are protected by default through global guard configuration:
```typescript
// Applied globally in module configuration
@UseGuards(SupabaseAuthGuard)
```

#### Public Endpoints
Use `@Public()` decorator to bypass authentication:
```typescript
@Public()
@Get('health')
healthCheck() {
  return { status: 'ok' };
}
```

#### Accessing Current User
Use `@CurrentUser()` decorator in controllers:
```typescript
@Get('profile')
getProfile(@CurrentUser() user: AuthUser) {
  return { userId: user.id, email: user.email };
}
```

## Configuration

### Environment Variables
```env
# Required Supabase configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

### Supabase Client Initialization
```typescript
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);
```

## Error Handling

### Common Authentication Errors

| Error | HTTP Code | Description |
|-------|-----------|-------------|
| No Token | 401 | Authorization header missing |
| Invalid Token | 401 | Token verification failed |
| Expired Token | 401 | Token has expired |
| User Not Found | 401 | Token valid but user doesn't exist |

### Error Response Format
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Invalid or expired token"
}
```

## Testing with Postman

### Getting Access Token for Testing

#### Method 1: Using Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to Authentication → Users
3. Create a test user or use existing
4. Use the SQL Editor to get a token:
```sql
-- Get user details
SELECT id, email FROM auth.users WHERE email = 'test@example.com';
```

#### Method 2: Using Supabase API Directly
```bash
# Sign up a new user
curl -X POST 'https://[YOUR_PROJECT_REF].supabase.co/auth/v1/signup' \
  -H "apikey: [YOUR_ANON_KEY]" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpassword123"
  }'

# Sign in to get access token
curl -X POST 'https://[YOUR_PROJECT_REF].supabase.co/auth/v1/token?grant_type=password' \
  -H "apikey: [YOUR_ANON_KEY]" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpassword123"
  }'
```

Response will include:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 3600,
  "refresh_token": "..."
}
```

#### Method 3: Using Postman Collection

1. **Create Environment Variables:**
   - `supabase_url`: Your Supabase project URL
   - `supabase_anon_key`: Your anonymous key
   - `access_token`: Will store the token after login

2. **Login Request:**
   ```
   POST {{supabase_url}}/auth/v1/token?grant_type=password
   Headers:
     apikey: {{supabase_anon_key}}
     Content-Type: application/json
   Body:
   {
     "email": "test@example.com",
     "password": "testpassword123"
   }
   ```

3. **Add Test Script to Save Token:**
   In Postman's Tests tab for the login request:
   ```javascript
   if (pm.response.code === 200) {
     const response = pm.response.json();
     pm.environment.set("access_token", response.access_token);
   }
   ```

4. **Use Token in API Requests:**
   ```
   GET {{backend_url}}/api/user/profile
   Headers:
     Authorization: Bearer {{access_token}}
   ```

### Postman Configuration

#### Setting Up Authorization
1. In Postman, select your request
2. Go to Authorization tab
3. Select Type: Bearer Token
4. Token: `{{access_token}}` (or paste token directly)

#### Collection-Level Authorization
1. Edit collection settings
2. Go to Authorization tab
3. Set Type: Bearer Token
4. Token: `{{access_token}}`
5. All requests inherit this authorization

### Testing Different Scenarios

#### Test Authenticated Endpoint
```
GET http://localhost:3000/api/user/profile
Authorization: Bearer [YOUR_ACCESS_TOKEN]
```

#### Test Public Endpoint (No Token Needed)
```
GET http://localhost:3000/api/health
```

#### Test with Invalid Token
```
GET http://localhost:3000/api/user/profile
Authorization: Bearer invalid_token_here
```
Expected: 401 Unauthorized

#### Test with Expired Token
Use an old token to test expiration handling
Expected: 401 Unauthorized with "Token expired" message

## Security Best Practices

### Token Handling
- Always use HTTPS in production
- Send tokens only in Authorization header
- Never log or expose tokens
- Rotate tokens regularly

### Backend Validation
- Validate on every request
- Check token expiration
- Verify token signature
- Cache validation results briefly (optional)

## Implementation Examples

### Protected Controller
```typescript
@ApiTags('User')
@ApiBearerAuth()
@Controller('user')
@UseGuards(SupabaseAuthGuard)
export class UserController {
  @Get('profile')
  @ApiOperation({ summary: 'Get user profile' })
  async getProfile(@CurrentUser() user: AuthUser) {
    return {
      id: user.id,
      email: user.email,
      created_at: user.created_at
    };
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update user profile' })
  async updateProfile(
    @CurrentUser() user: AuthUser,
    @Body() updateDto: UpdateProfileDto
  ) {
    // Update logic here
  }
}
```

### Mixed Public/Private Endpoints
```typescript
@Controller('products')
export class ProductsController {
  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all products (public)' })
  async getProducts() {
    // No authentication required
  }

  @Post()
  @UseGuards(SupabaseAuthGuard)
  @ApiOperation({ summary: 'Create product (authenticated)' })
  async createProduct(@CurrentUser() user: AuthUser) {
    // Requires authentication
  }
}
```

## Automated Testing

### Integration Testing
```typescript
describe('Authentication', () => {
  it('should reject requests without token', async () => {
    const response = await request(app.getHttpServer())
      .get('/user/profile')
      .expect(401);
  });

  it('should accept requests with valid token', async () => {
    const response = await request(app.getHttpServer())
      .get('/user/profile')
      .set('Authorization', `Bearer ${validToken}`)
      .expect(200);
  });
});
```

## Troubleshooting

### Common Issues

1. **401 Unauthorized Errors**
   - Check token is included in Authorization header
   - Verify token format: `Bearer <token>`
   - Ensure token hasn't expired
   - Confirm Supabase environment variables are set

2. **Token Verification Fails**
   - Verify SUPABASE_URL and SUPABASE_ANON_KEY are correct
   - Check network connectivity to Supabase
   - Ensure token was issued by same Supabase project

3. **User Context Not Available**
   - Confirm @CurrentUser() decorator is used
   - Verify SupabaseAuthGuard is applied
   - Check request.user is being set in guard

## Related Documentation
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [NestJS Guards Documentation](https://docs.nestjs.com/guards)
- [JWT RFC 7519](https://tools.ietf.org/html/rfc7519)