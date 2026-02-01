# Authentication System Setup

This document describes the session-based authentication system integrated with the MySQL database.

## Database Configuration

The system connects to the MySQL database using the following credentials (configured in `.env.local`):

```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=smart
DB_USERNAME=root
DB_PASSWORD=
```

## Database Tables

### Users Table
The authentication system uses the `users` table with the following structure:

- `id` (Primary Key) - User ID
- `email` - User email (unique)
- `password` - Hashed password
- `first_name` - User's first name
- `last_name` - User's last name
- `status` - Account status ('Active', 'Inactive')
- `phone` - Phone number
- `gender` - Gender ('male', 'female', 'other', 'unspecified')
- `office_id` - Office ID (foreign key)
- `permissions` - User permissions (JSON/text)
- `enable_google2fa` - Google 2FA enabled flag
- `blocked` - Account blocked flag
- `last_login` - Last login timestamp
- `created_at` - Account creation timestamp
- `updated_at` - Last update timestamp

## API Routes

### 1. Sign Up (`POST /api/auth/signup`)
Creates a new user account.

**Request Body:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Account created successfully",
  "user": {
    "id": 1,
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "status": "Active"
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "message": "Email already registered"
}
```

### 2. Sign In (`POST /api/auth/login`)
Authenticates a user and creates a session.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": 1,
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "status": "Active",
    "phone": "+1234567890",
    "gender": "male",
    "office_id": 1,
    "enable_google2fa": 0
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

### 3. Sign Out (`POST /api/auth/logout`)
Clears the user session.

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### 4. Get Session (`GET /api/auth/session`)
Retrieves the current user session.

**Response (Authenticated):**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "status": "Active",
    "phone": "+1234567890",
    "gender": "male",
    "office_id": 1,
    "enable_google2fa": 0,
    "permissions": "...",
    "last_login": "2026-02-01T08:00:00.000Z"
  }
}
```

**Response (Not Authenticated):**
```json
{
  "success": false,
  "message": "Not authenticated"
}
```

## Session Management

The system uses HTTP-only cookies for session management:

### Cookies Set on Login:
- `user_id` - User ID (httpOnly)
- `user_email` - User email (httpOnly)
- `user_name` - User full name (not httpOnly)
- `user_status` - User status (not httpOnly)

### Cookie Configuration:
- **httpOnly**: True for sensitive cookies (user_id, user_email)
- **secure**: True in production
- **sameSite**: 'lax'
- **maxAge**: 7 days (60 * 60 * 24 * 7 seconds)
- **path**: '/'

## Security Features

1. **Password Hashing**: Uses bcrypt with 10 salt rounds
2. **Session Cookies**: HTTP-only cookies for sensitive data
3. **Route Protection**: Middleware protects authenticated routes
4. **Account Status Checks**: Validates account status before login
5. **Blocked Account Check**: Prevents login for blocked accounts
6. **Input Validation**: Validates email format and password strength

## Middleware

The middleware (`src/middleware.ts`) handles route protection:

- **Protected Routes**: `/admin`, `/dashboard`, `/profile`, `/settings`
- **Public Routes**: `/signin`, `/signup`, `/forgot-password`, `/reset-password`

**Behavior:**
- Redirects unauthenticated users to `/signin` when accessing protected routes
- Redirects authenticated users to `/` when accessing auth routes

## Components

### SignInForm
Located at: `src/components/auth/SignInForm.tsx`

Features:
- Email and password input
- Password visibility toggle
- "Keep me logged in" checkbox
- Form validation
- Loading states
- Error and success messages
- Redirects to dashboard on successful login

### SignUpForm
Located at: `src/components/auth/SignUpForm.tsx`

Features:
- First name, last name, email, and password inputs
- Password visibility toggle
- Terms and conditions checkbox
- Form validation
- Loading states
- Error and success messages
- Redirects to signin page on successful registration

## Usage Examples

### Sign Up a New User
```typescript
const response = await fetch('/api/auth/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    first_name: 'John',
    last_name: 'Doe',
    email: 'john@example.com',
    password: 'password123'
  })
});

const data = await response.json();
```

### Sign In a User
```typescript
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'john@example.com',
    password: 'password123'
  })
});

const data = await response.json();
```

### Check Session
```typescript
const response = await fetch('/api/auth/session');
const data = await response.json();

if (data.success) {
  console.log('User is authenticated:', data.user);
} else {
  console.log('User is not authenticated');
}
```

### Sign Out
```typescript
const response = await fetch('/api/auth/logout', {
  method: 'POST'
});

const data = await response.json();
```

## Database Connection

The database connection is managed by `src/lib/db.ts`:

- Uses connection pooling for better performance
- Provides helper functions for queries
- Handles connection errors gracefully

### Helper Functions:
- `query(sql, params)` - Execute a query and return results
- `queryOne(sql, params)` - Execute a query and return a single record
- `testConnection()` - Test database connection
- `closePool()` - Close all connections

## Authentication Utilities

Located at: `src/lib/auth.ts`

### Functions:
- `hashPassword(password)` - Hash a password using bcrypt
- `comparePassword(password, hash)` - Compare password with hash
- `setSession(userId, userData)` - Set session cookies
- `clearSession()` - Clear session cookies
- `getSession()` - Get current session
- `isAuthenticated()` - Check if user is authenticated
- `getUserById(userId)` - Get user from database by ID
- `getUserByEmail(email)` - Get user from database by email
- `updateLastLogin(userId)` - Update last login timestamp

## Error Handling

All API routes include comprehensive error handling:

1. **Validation Errors** - Returns 400 status with error message
2. **Authentication Errors** - Returns 401 status
3. **Forbidden Errors** - Returns 403 status (blocked/inactive accounts)
4. **Conflict Errors** - Returns 409 status (duplicate email)
5. **Server Errors** - Returns 500 status with generic error message

## Testing

To test the authentication system:

1. Ensure MySQL is running and the `smart` database exists
2. Configure database credentials in `.env.local`
3. Start the development server: `npm run dev`
4. Navigate to `http://localhost:3000/signup`
5. Create a new account
6. Sign in with the created account
7. Verify session cookies are set
8. Test protected routes

## Notes

- Passwords are hashed using bcrypt before storage
- Sessions are managed using HTTP-only cookies
- The middleware automatically protects routes
- All database queries use parameterized statements to prevent SQL injection
- The system supports both individual and business accounts through the users table
