# Postman Testing Guide for Blogging API

## 🚀 Quick Start

1. **Import the Collection**

   - Open Postman extension in VS Code
   - Import `Blogging-API-Test-Suite.postman_collection.json`

2. **Ensure Server is Running**

   ```bash
   npm run dev
   ```

   Server should be running on http://localhost:3000

3. **Ensure MongoDB is Running**
   ```bash
   sudo docker ps | grep mongodb
   ```
   If not running: `sudo docker start mongodb`

## 📋 Testing Sequence

Follow this order for complete testing:

### Phase 1: Authentication

1. **Sign Up** - Create a new user
   - Creates account and returns user ID
   - Change email for each test run
2. **Sign In** - Get JWT token
   - Returns token (automatically saved to collection variable)
   - Token expires after 1 hour

### Phase 2: Blog CRUD Operations

3. **Create Blog** - Creates blog in draft state
   - Returns blog ID (automatically saved)
   - Calculates reading time automatically
4. **Publish Blog** - Changes state to published
   - Only owner can publish
5. **Update Blog** - Modify blog content
   - Only owner can update
   - Can update any field except author
6. **Get Single Blog** - Read a blog
   - Returns author information
   - Increments read_count by 1
   - Public endpoint (no auth required)
7. **Delete Blog** - Remove blog
   - ⚠️ Run this LAST
   - Only owner can delete

### Phase 3: Public Blog Listing

8. **List All Published Blogs** - Paginated list
   - Default 20 per page
   - Public endpoint
9. **Search by Keyword** - Search in title/tags
   - Case-insensitive
10. **Filter by Author** - Filter by author name

11. **Sort by Read Count** - Most popular first

12. **Sort by Reading Time** - Shortest first

13. **Sort by Timestamp** - Newest first

### Phase 4: Owner's Blog Management

14. **Get My Blogs** - All my blogs (draft + published)
    - Requires authentication
15. **Get My Drafts** - Only draft blogs
    - Requires authentication
16. **Get My Published** - Only published blogs
    - Requires authentication

## ✅ Expected Results

### All Tests Should Pass

- Sign Up: `201 Created`
- Sign In: `200 OK` with token
- Create Blog: `201 Created` with draft state
- Publish: `200 OK` with published state
- Update: `200 OK`
- Get Single: `200 OK` with author info
- Delete: `204 No Content`
- List/Search/Filter: `200 OK` with pagination

## 🔑 Collection Variables

The collection automatically manages these variables:

- `authToken` - JWT token from sign in
- `blogId` - Blog ID from create blog

## 🎯 Testing Tips

1. **Run in Order**: Follow the sequence above for best results
2. **Check Tests**: Each request has automated tests that verify responses
3. **View Console**: Check Postman console for detailed logs
4. **Token Expiry**: If you get 401 errors, re-run Sign In to get a fresh token
5. **Unique Emails**: Change the email in Sign Up for each new test run

## 🐛 Troubleshooting

**Server not responding?**

```bash
# Check if server is running
ps aux | grep node

# Restart server
npm run dev
```

**MongoDB connection error?**

```bash
# Check if MongoDB is running
sudo docker ps | grep mongodb

# Start MongoDB if needed
sudo docker start mongodb
```

**401 Unauthorized?**

- Token might be expired (1 hour expiry)
- Re-run "Sign In" to get a new token

**Email already exists?**

- Change the email in Sign Up request
- Or use a different test user

## 📊 What Gets Tested

✅ User registration and authentication
✅ JWT token generation and validation
✅ Blog creation with automatic reading time calculation
✅ State management (draft → published)
✅ CRUD operations with ownership validation
✅ Read count increment tracking
✅ Pagination (20 items per page)
✅ Search functionality
✅ Filtering and sorting
✅ Author population in responses
✅ Winston logging (check server console)

## 🎉 Success Indicators

All requests should show:

- ✅ Green status codes
- ✅ All tests passing
- ✅ Variables automatically saved
- ✅ Console logs showing confirmations
