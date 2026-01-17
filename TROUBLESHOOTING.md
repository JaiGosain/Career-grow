# Troubleshooting "Failed to Fetch Jobs" Error

## Quick Fix Steps

### 1. Ensure MongoDB is Running
MongoDB must be running on `localhost:27017`. Check with:
```powershell
netstat -ano | findstr :27017
```

If not running, start MongoDB service or use MongoDB Atlas.

### 2. Restart Backend Server

**Stop any running Node processes:**
```powershell
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
```

**Start the backend:**
```powershell
cd backend
npm start
```

You should see:
- `MongoDB Connected`
- `Server running on port 5000`

### 3. Verify Backend is Working

Open in browser or test with PowerShell:
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/jobs" -Method GET
```

Should return `[]` (empty array) if working.

### 4. Check Frontend Proxy

The frontend `package.json` has:
```json
"proxy": "http://localhost:5000"
```

Make sure:
- Frontend is running on port 3000
- Backend is running on port 5000
- Both are running simultaneously

### 5. Common Issues

**Issue: "Cannot GET /api/jobs"**
- Server routes not loading properly
- Restart the backend server
- Check console for import errors

**Issue: CORS errors**
- Backend CORS is configured for `http://localhost:3000`
- Check `FRONTEND_URL` in backend `.env`

**Issue: MongoDB connection error**
- MongoDB not running
- Wrong connection string in `.env`
- Use MongoDB Atlas if local MongoDB unavailable

**Issue: Empty response**
- This is normal if no jobs exist yet
- Create a job as an employer to test

### 6. Test the Full Flow

1. **Register as Employer:**
   - Go to http://localhost:3000/register
   - Select "Employer" role
   - Register account

2. **Post a Job:**
   - Login as employer
   - Go to "Post Job"
   - Fill in job details
   - Submit

3. **View Jobs:**
   - Go to "Jobs" page
   - Should see the posted job

### 7. Check Browser Console

Open browser DevTools (F12) and check:
- Network tab for failed requests
- Console tab for JavaScript errors
- Look for CORS errors or 404 errors

### 8. Verify Environment Variables

Create `backend/.env` with:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/careergrow
JWT_SECRET=careergrow_jwt_secret_key_2024
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

## Still Having Issues?

1. Check backend console for error messages
2. Check browser console for frontend errors
3. Verify both servers are running:
   - Backend: http://localhost:5000
   - Frontend: http://localhost:3000
4. Try accessing API directly: http://localhost:5000/api/jobs
