# Bloom Backend API

Backend API for Bloom - 3D Habit Forest application.

## Features

- **Authentication**: JWT-based user authentication with signup/signin
- **Tree Management**: Create, update, and complete trees for users
- **Habit Tracking**: Record daily habit answers and track progress
- **User Statistics**: Track user progress and analytics
- **Demo Mode**: Built-in demo user for testing

## Tech Stack

- **Node.js** with Express.js
- **MySQL** database with connection pooling
- **JWT** for authentication
- **bcryptjs** for password hashing
- **express-validator** for input validation
- **Helmet** for security headers
- **CORS** for cross-origin requests

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Database Setup

#### Option A: Using MySQL directly
1. Install MySQL on your system
2. Create a database named `bloom_forest`
3. Run the setup script:
```bash
mysql -u root -p < scripts/setup-database.sql
```

#### Option B: Using Docker
```bash
# Start MySQL container
docker run --name bloom-mysql -e MYSQL_ROOT_PASSWORD=yourpassword -e MYSQL_DATABASE=bloom_forest -p 3306:3306 -d mysql:8.0

# Run setup script
docker exec -i bloom-mysql mysql -u root -pyourpassword bloom_forest < scripts/setup-database.sql
```

### 3. Environment Configuration

1. Copy the example environment file:
```bash
cp env.example .env
```

2. Update `.env` with your configuration:
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=bloom_forest
DB_USER=root
DB_PASSWORD=your_mysql_password

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=5000
NODE_ENV=development

# CORS Configuration
FRONTEND_URL=http://localhost:5173
```

### 4. Start the Server

#### Development Mode
```bash
npm run dev
```

#### Production Mode
```bash
npm start
```

The server will start on `http://localhost:5000` (or the port specified in your `.env` file).

## API Endpoints

### Authentication (`/api/auth`)

- `POST /signup` - Create new user account
- `POST /signin` - Sign in existing user
- `POST /demo` - Authenticate as demo user
- `GET /me` - Get current user info

### Trees (`/api/trees`)

- `GET /current` - Get current active tree
- `GET /` - Get all user trees
- `POST /` - Create new tree
- `PATCH /:treeId` - Update tree
- `POST /:treeId/complete` - Complete tree and start new one

### Habits (`/api/habits`)

- `POST /answer` - Submit habit answer
- `GET /today/:treeId` - Get today's habits for tree
- `GET /history/:treeId` - Get habit history for tree
- `GET /stats` - Get user statistics

## Database Schema

### Users Table
- `id` - Unique user identifier
- `email` - User email (unique)
- `password_hash` - Hashed password
- `created_at` - Account creation timestamp
- `last_login` - Last login timestamp
- `is_active` - Account status

### User Trees Table
- `id` - Unique tree identifier
- `user_id` - Owner user ID
- `tree_number` - Sequential tree number
- `stage` - Growth stage (seed, sapling, bloom, decay)
- `health` - Tree health (0-100)
- `day` - Current day (1-7)
- `planted_at` - Planting timestamp
- `completed_at` - Completion timestamp
- `is_current` - Whether this is the active tree
- `position_x`, `position_z` - 3D position coordinates

### Daily Habits Table
- `id` - Unique habit record identifier
- `user_id` - User ID
- `tree_id` - Associated tree ID
- `date` - Date of habits
- `mood`, `food`, `hydration`, `sleep` - Habit answers
- `total_positive` - Count of positive answers

### User Stats Table
- `id` - Unique stats identifier
- `user_id` - User ID
- `total_trees_completed` - Number of completed trees
- `total_positive_answers` - Total positive habit answers
- `total_negative_answers` - Total negative habit answers
- `current_streak` - Current daily streak
- `longest_streak` - Longest daily streak

## Demo User

The system includes a demo user for testing:
- **Email**: `demo@bloom.com`
- **Password**: `demo123`

## Security Features

- Password hashing with bcryptjs
- JWT token authentication
- Rate limiting (100 requests per 15 minutes)
- CORS protection
- Helmet security headers
- Input validation with express-validator
- SQL injection protection with parameterized queries

## Error Handling

All API endpoints return consistent error responses:
```json
{
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

Common error codes:
- `VALIDATION_ERROR` - Input validation failed
- `USER_EXISTS` - User already exists
- `INVALID_CREDENTIALS` - Wrong email/password
- `TREE_NOT_FOUND` - Tree doesn't exist
- `DAILY_LIMIT_REACHED` - Daily questions limit reached
- `RATE_LIMIT_EXCEEDED` - Too many requests

## Development

### Running Tests
```bash
npm test
```

### Code Structure
```
backend/
├── config/
│   └── database.js          # Database configuration
├── middleware/
│   ├── auth.js             # Authentication middleware
│   └── validation.js       # Input validation middleware
├── routes/
│   ├── auth.js             # Authentication routes
│   ├── trees.js            # Tree management routes
│   └── habits.js           # Habit tracking routes
├── scripts/
│   └── setup-database.sql  # Database setup script
├── server.js               # Main server file
└── package.json
```

## Production Deployment

1. Set `NODE_ENV=production` in your environment
2. Use a production database (not localhost)
3. Set strong JWT secrets
4. Configure proper CORS origins
5. Use a reverse proxy (nginx) for SSL termination
6. Set up monitoring and logging
7. Use PM2 or similar for process management

## License

MIT License - see LICENSE file for details.
