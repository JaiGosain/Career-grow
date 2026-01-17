# Starting the CareerGrow Application

## Prerequisites

1. **MongoDB must be running** - The application requires MongoDB to be running on `localhost:27017`

### To start MongoDB:
- **Windows**: If you installed MongoDB as a service, it should start automatically. Otherwise, run:
  ```
  mongod
  ```
- **Or use MongoDB Atlas**: Update the `MONGODB_URI` in `backend/.env` to your Atlas connection string

## Starting the Application

### Option 1: Manual Start (Two Terminals)

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

### Option 2: Using npm scripts (if you have concurrently installed)

You can install `concurrently` to run both servers:
```bash
npm install -g concurrently
```

Then create a root `package.json` with:
```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev --prefix backend\" \"npm start --prefix frontend\""
  }
}
```

## Troubleshooting

### "Failed to fetch jobs" Error

1. **Check if backend is running**: Open http://localhost:5000/api/jobs in your browser
   - Should return `[]` (empty array) if working
   - If you get an error, check backend console for MongoDB connection errors

2. **Check MongoDB connection**:
   - Make sure MongoDB is running on port 27017
   - Check backend console for "MongoDB Connected" message
   - If you see "MongoDB connection error", MongoDB is not running

3. **Check CORS**: The backend should allow requests from http://localhost:3000

4. **Check .env file**: Make sure `backend/.env` exists with:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/careergrow
   JWT_SECRET=careergrow_jwt_secret_key_2024
   FRONTEND_URL=http://localhost:3000
   ```

### Common Issues

- **MongoDB not running**: Start MongoDB service or use MongoDB Atlas
- **Port 5000 already in use**: Change PORT in backend/.env
- **Port 3000 already in use**: React will prompt to use a different port
- **CORS errors**: Check FRONTEND_URL in backend/.env matches your frontend URL
