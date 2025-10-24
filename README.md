# Blogging API

A RESTful blogging API built with Node.js, Express, MongoDB, and JWT authentication.

## Features

- **User Authentication**: Sign up and sign in with JWT tokens (1-hour expiry)
- **Blog Management**: Create, update, publish, and delete blogs
- **Access Control**: Owner-only actions for updating/deleting blogs
- **Public Access**: Anyone can read published blogs
- **Advanced Querying**: Pagination, filtering by state, search by author/title/tags, ordering by read_count/reading_time/timestamp
- **Reading Analytics**: Automatic read count tracking and reading time calculation
- **Logging**: Comprehensive Winston logging for all actions
- **Testing**: Full test coverage with Jest and Supertest

## Requirements

- Node.js (v14+)
- MongoDB (local or cloud instance)
- npm or yarn

## Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd backend-prj

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your configuration
```

## Environment Variables

Create a `.env` file in the root directory:

```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/blogging-api
JWT_SECRET=your_super_secret_jwt_key_here
```

## Running the Application

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

The server will start on `http://localhost:3000`

## Running Tests

```bash
# Run all tests
npm test

# Run with MongoDB URI (if you have MongoDB running)
MONGO_URI=mongodb://localhost:27017/blogging-api-test npm test
```

## API Endpoints

### Authentication

#### Sign Up

```http
POST /api/auth/signup
Content-Type: application/json

{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "password": "securepassword"
}
```

#### Sign In

```http
POST /api/auth/signin
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword"
}
```

Returns: `{ "token": "jwt_token_here" }`

### Blogs

#### Create Blog (Auth Required)

```http
POST /api/blogs
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "My First Blog",
  "description": "A short description",
  "tags": ["nodejs", "api"],
  "body": "The full blog content goes here..."
}
```

#### Publish Blog (Owner Only)

```http
POST /api/blogs/:id/publish
Authorization: Bearer <token>
```

#### Update Blog (Owner Only)

```http
PUT /api/blogs/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Title",
  "state": "published"
}
```

#### Delete Blog (Owner Only)

```http
DELETE /api/blogs/:id
Authorization: Bearer <token>
```

#### Get Single Blog (Public for published)

```http
GET /api/blogs/:id
```

Returns the blog with author information and increments read_count.

#### List All Blogs (Public)

```http
GET /api/blogs?page=1&limit=20&state=published&search=nodejs&sortBy=read_count&order=desc&author=John
```

Query Parameters:

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `state`: Filter by state (`draft` or `published`)
- `search`: Search in title and tags
- `author`: Filter by author name
- `sortBy`: Sort by `read_count`, `reading_time`, or `timestamp`
- `order`: `asc` or `desc` (default: desc)

#### Get My Blogs (Auth Required)

```http
GET /api/blogs/me/list?page=1&limit=20&state=draft
Authorization: Bearer <token>
```

## Data Models

### User

- `first_name` (required)
- `last_name` (required)
- `email` (required, unique)
- `password` (required, hashed)
- `createdAt`, `updatedAt` (auto-generated)

### Blog

- `title` (required, unique)
- `description`
- `author` (ObjectId reference to User)
- `state` (`draft` or `published`, default: `draft`)
- `read_count` (default: 0)
- `reading_time` (calculated automatically)
- `tags` (array of strings)
- `body` (required)
- `createdAt`, `updatedAt` (auto-generated)

## ERD

See `ERD.md` for the entity relationship diagram.

## Deployment to Render

1. **Push to GitHub**:

   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Deploy on Render**:

   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Name**: blogging-api
     - **Environment**: Node
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`
   - Add Environment Variables:
     - `MONGO_URI`: Your MongoDB connection string (e.g., MongoDB Atlas)
     - `JWT_SECRET`: A secure random string
     - `PORT`: 3000 (or leave blank, Render sets this)
   - Click "Create Web Service"

3. **MongoDB Atlas** (for production database):
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create a free cluster
   - Create a database user
   - Whitelist Render's IP or use `0.0.0.0/0` (allow all)
   - Copy the connection string and add it as `MONGO_URI` in Render

## Project Structure

```
backend-prj/
├── src/
│   ├── app.js              # Express app setup
│   ├── index.js            # Server entry point
│   ├── controllers/        # Request handlers
│   │   ├── auth.js
│   │   └── blogs.js
│   ├── middleware/         # Custom middleware
│   │   ├── auth.js
│   │   └── error.js
│   ├── models/             # Mongoose models
│   │   ├── user.js
│   │   └── blog.js
│   ├── routes/             # Route definitions
│   │   ├── auth.js
│   │   └── blogs.js
│   └── utils/              # Utilities
│       └── logger.js
├── tests/                  # Test files
│   ├── setup.js
│   ├── auth.test.js
│   └── blogs.test.js
├── .env.example            # Environment template
├── ERD.md                  # Entity relationship diagram
├── package.json
└── README.md
```

## License

MIT
