# Smart Leadership System - Backend API

A well-organized, Laravel-like modular backend API for the Smart Leadership System.

## Directory Structure

```
backend/
├── config/
│   └── database.js          # Database configuration
├── database/
│   └── connection.js        # Database connection and query helpers
├── models/
│   ├── BaseModel.js         # Base model with common CRUD operations
│   ├── User.js             # User model
│   ├── Role.js             # Role model
│   ├── Client.js           # Client model
│   └── Office.js           # Office model
├── controllers/
│   ├── UserController.js    # User controller
│   ├── RoleController.js    # Role controller
│   ├── ClientController.js  # Client controller
│   └── OfficeController.js  # Office controller
├── routes/
│   └── api.js              # API routes
├── server.js               # Express server entry point
├── package.json            # Dependencies
└── README.md              # This file
```

## Installation

1. Install dependencies:
```bash
cd scripts/backend
npm install
```

2. Configure environment variables (optional):
Create a `.env` file in the backend directory:
```
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=smart
API_PORT=3001
NODE_ENV=development
```

3. Start the server:
```bash
# Production
npm start

# Development (with auto-reload)
npm run dev
```

The API will be available at `http://localhost:3001`

## API Endpoints

### Users

| Method | Endpoint | Description |
|---------|-----------|-------------|
| GET | `/api/users` | Get all active users with pagination |
| GET | `/api/users/inactive` | Get all inactive users with pagination |
| GET | `/api/users/:id` | Get user by ID |
| POST | `/api/users` | Create a new user |
| PUT | `/api/users/:id` | Update user |
| POST | `/api/users/:id/deactivate` | Deactivate a user |
| POST | `/api/users/:id/reactivate` | Reactivate a user |
| DELETE | `/api/users/:id` | Delete a user |
| GET | `/api/users/:id/roles` | Get user roles |

### Roles

| Method | Endpoint | Description |
|---------|-----------|-------------|
| GET | `/api/roles` | Get all roles with pagination |
| GET | `/api/roles/:id` | Get role by ID |
| POST | `/api/roles` | Create a new role |
| PUT | `/api/roles/:id` | Update role |
| DELETE | `/api/roles/:id` | Delete role |
| GET | `/api/roles/:id/permissions` | Get role permissions |
| PUT | `/api/roles/:id/permissions` | Update role permissions |
| POST | `/api/roles/assign` | Assign role to user |
| POST | `/api/roles/remove` | Remove role from user |

### Clients

| Method | Endpoint | Description |
|---------|-----------|-------------|
| GET | `/api/clients` | Get all clients with pagination |
| GET | `/api/clients/users` | Get client users (clients with user accounts) |
| GET | `/api/clients/:id` | Get client by ID |
| POST | `/api/clients/link-user` | Link user to client |
| POST | `/api/clients/unlink-user` | Unlink user from client |

### Offices

| Method | Endpoint | Description |
|---------|-----------|-------------|
| GET | `/api/offices` | Get all active offices |
| GET | `/api/offices/:id` | Get office by ID |

## Query Parameters

### Pagination
- `page` (default: 1) - Page number
- `limit` (default: 10) - Items per page

### Filtering
- `search` - Search term for filtering
- `officeId` - Filter by office ID
- `clientType` - Filter by client type (individual, business, ngo, other)
- `status` - Filter by status

## Response Format

### Success Response
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error message"
}
```

## Database Schema

The API uses the following database tables:
- `users` - User accounts
- `roles` - User roles
- `role_users` - User-role relationships
- `clients` - Client information
- `client_users` - Client-user relationships
- `offices` - Office/branch information

See `database-structure.md` for complete schema details.

## Models

### BaseModel
Provides common CRUD operations:
- `findAll(options)` - Get all records with filtering
- `findById(id)` - Find by ID
- `findBy(field, value)` - Find by field
- `create(data)` - Create new record
- `update(id, data)` - Update record
- `delete(id)` - Delete record
- `count(where)` - Count records
- `exists(where)` - Check if record exists

### User Model
Extends BaseModel with user-specific methods:
- `getActiveUsers(options)` - Get active users with office info
- `getInactiveUsers(options)` - Get inactive users
- `findByEmail(email)` - Find user by email
- `findByIdWithRoles(userId)` - Get user with roles
- `deactivate(userId, reason, deactivatedBy)` - Deactivate user
- `reactivate(userId, reactivatedBy)` - Reactivate user
- `assignRole(userId, roleId)` - Assign role to user
- `getUserRoles(userId)` - Get user roles

### Role Model
Extends BaseModel with role-specific methods:
- `getAllWithUserCount(options)` - Get roles with user count
- `findBySlug(slug)` - Find role by slug
- `findByIdWithUsers(roleId)` - Get role with users
- `assignToUser(userId, roleId)` - Assign role to user
- `updatePermissions(roleId, permissions)` - Update role permissions
- `getPermissions(roleId)` - Get role permissions

### Client Model
Extends BaseModel with client-specific methods:
- `getClientsWithUsers(options)` - Get clients with user accounts
- `findByAccountNo(accountNo)` - Find client by account number
- `findByIdWithUser(clientId)` - Get client with user
- `linkUser(clientId, userId, createdBy)` - Link user to client
- `unlinkUser(clientId, userId)` - Unlink user from client
- `getClientUsers(options)` - Get client users

### Office Model
Extends BaseModel with office-specific methods:
- `getActiveOffices()` - Get all active offices
- `findById(officeId)` - Find office by ID

## Security Considerations

1. **Password Hashing**: All passwords are hashed using bcrypt before storage
2. **SQL Injection Prevention**: All queries use parameterized statements
3. **CORS**: CORS is enabled for cross-origin requests
4. **Input Validation**: Controllers validate required fields before processing

## Development

### Adding New Endpoints

1. Create a method in the appropriate Model
2. Create a controller method to handle the request
3. Add the route in `routes/api.js`
4. Test the endpoint

### Example: Adding a new endpoint

**Model (User.js):**
```javascript
async getRecentUsers(options = {}) {
  const query = `SELECT * FROM ${this.tableName} ORDER BY created_at DESC LIMIT ?`;
  const db = require('../database/connection');
  return await db.query(query, [options.limit || 10]);
}
```

**Controller (UserController.js):**
```javascript
async getRecentUsers(req, res) {
  try {
    const users = await this.userModel.getRecentUsers({ limit: 10 });
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
```

**Routes (api.js):**
```javascript
router.get('/users/recent', (req, res) => userController.getRecentUsers(req, res));
```

## Health Check

Check API status:
```bash
curl http://localhost:3001/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "service": "Smart Leadership System API"
}
```

## License

ISC
