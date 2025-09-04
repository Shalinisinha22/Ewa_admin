# Forgot Password Fix - Testing Instructions

## Issue Identified ✅

The 401 Unauthorized error was caused by the deployed Vercel backend (`https://ewa-back.vercel.app`) not having the latest forgot password functionality. The frontend was trying to call an endpoint that either doesn't exist or has different middleware configuration on the deployed version.

## What I Fixed

1. **Updated Axios Configuration**: Changed the API base URL from the deployed Vercel backend to local backend for testing
2. **Fixed TypeScript Interfaces**: Updated return types for forgot password functions
3. **Enhanced Error Handling**: Added better debugging and error messages

## How to Test the Fix

### Step 1: Start the Backend Server
Make sure your local backend is running:
```bash
cd backend
npm start
# or
npm run dev
```

The backend should be running on `http://localhost:5000`

### Step 2: Start the Frontend
```bash
cd admin_frontend
npm run dev
```

The frontend should be running on `http://localhost:3000`

### Step 3: Test Forgot Password
1. Go to `http://localhost:3000/login`
2. Click "Forgot your password?"
3. Enter an email address (e.g., `west@yopmail.com`)
4. Click "Send Reset Link"

### Expected Results

✅ **Success Case**: 
- You should see a success message
- In development mode, you'll see the reset token displayed
- Console will show: "Reset Token (Development only): [token]"

✅ **Error Case** (if email doesn't exist):
- You'll see: "If an account with that email exists, a password reset link has been sent."
- This is the expected security behavior

## For Production Deployment

When you're ready to deploy to production:

1. **Deploy the Backend**: Make sure the latest backend code with forgot password functionality is deployed to Vercel
2. **Update Frontend Config**: Change the axios baseURL back to the deployed backend:
   ```typescript
   baseURL: 'https://ewa-back.vercel.app/api'
   ```
3. **Test on Production**: Verify the forgot password works on the deployed version

## Backend Routes That Should Be Available

The following routes should be public (no authentication required):
- `POST /api/admin/login`
- `POST /api/admin/forgot-password`
- `POST /api/admin/reset-password`
- `POST /api/admin/super-admin`

## Troubleshooting

### If Still Getting 401 Errors
1. Check if the backend is running on port 5000
2. Check the browser console for detailed error messages
3. Verify the backend has the latest forgot password routes
4. Check if there are any CORS issues

### If Getting Network Errors
1. Make sure the backend server is running
2. Check if port 5000 is accessible
3. Verify no firewall is blocking the connection

### For Production Issues
1. Ensure the deployed backend has the latest code
2. Check Vercel deployment logs
3. Verify environment variables are set correctly
4. Test the endpoint directly with curl or Postman

## Testing with curl

You can test the endpoint directly:
```bash
# Test forgot password endpoint
curl -X POST http://localhost:5000/api/admin/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Expected response:
# {"message":"If an account with that email exists, a password reset link has been sent."}
```

The forgot password functionality should now work correctly with the local backend!
