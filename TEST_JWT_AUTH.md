# JWT Authentication Implementation - Testing Guide

## ✅ **Implementation Complete**

Your CRM application now uses **JWT (JSON Web Token) authentication** with automatic token refresh!

---

## 🔄 **What Changed**

### **Backend Changes:**
1. **LoginViewSet** - Now returns JWT tokens (`access` and `refresh`) instead of DRF Token
2. **RefreshTokenViewSet** - New endpoint `/api/auth/refresh/` for token refresh
3. **settings.py** - Changed from `TokenAuthentication` to `JWTAuthentication`
4. **Registration** - Now returns JWT tokens for new users

### **Frontend Changes:**
1. **auth.service.ts** - Stores both `accessToken` and `refreshToken`, implements refresh logic
2. **apiClient.ts** - Uses `Bearer` tokens, automatically refreshes expired tokens on 401 errors
3. **Storage Keys** - Changed from `authToken` to `accessToken` and `refreshToken`

---

## 🧪 **Testing Instructions**

### **1. Backend Testing**

```powershell
# Navigate to backend directory
cd shared-backend

# Run Django migrations (if needed)
python manage.py makemigrations
python manage.py migrate

# Start the backend server
python manage.py runserver
```

### **2. Test Login API (PowerShell)**

```powershell
# Test login endpoint
$response = Invoke-RestMethod -Uri "http://localhost:8000/api/auth/login/" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"username":"admin@example.com","password":"admin123"}'

# View response
$response | ConvertTo-Json -Depth 5

# Extract tokens
$accessToken = $response.access
$refreshToken = $response.refresh

Write-Host "Access Token: $accessToken"
Write-Host "Refresh Token: $refreshToken"
```

### **3. Test Authenticated Request**

```powershell
# Use access token to get current user
$headers = @{
    "Authorization" = "Bearer $accessToken"
}

$user = Invoke-RestMethod -Uri "http://localhost:8000/api/users/me/" `
  -Method GET `
  -Headers $headers

$user | ConvertTo-Json -Depth 5
```

### **4. Test Token Refresh**

```powershell
# Wait for access token to expire (or force it)
# Then test refresh endpoint
$refreshResponse = Invoke-RestMethod -Uri "http://localhost:8000/api/auth/refresh/" `
  -Method POST `
  -ContentType "application/json" `
  -Body "{`"refresh`":`"$refreshToken`"}"

# View new tokens
$refreshResponse | ConvertTo-Json

# Update access token
$accessToken = $refreshResponse.access
```

### **5. Frontend Testing**

```powershell
# Navigate to frontend directory
cd ../web-frontend

# Install dependencies (if needed)
npm install

# Start frontend dev server
npm run dev
```

**Then test in browser:**
1. Open `http://localhost:5173/login`
2. Login with your credentials
3. Open DevTools > Application > Local Storage
4. Verify you see: `accessToken`, `refreshToken`, and `user`
5. Open DevTools > Console
6. Watch for automatic token refresh on 401 errors

---

## 🔍 **How It Works**

### **Token Lifecycle:**

```
1. User logs in
   ↓
2. Backend returns access + refresh tokens
   ↓
3. Frontend stores both tokens in localStorage
   ↓
4. Frontend adds "Bearer {accessToken}" to all API requests
   ↓
5. Access token expires (after 1 day)
   ↓
6. API returns 401 Unauthorized
   ↓
7. Frontend automatically calls /api/auth/refresh/
   ↓
8. Backend validates refresh token and returns new tokens
   ↓
9. Frontend retries original request with new access token
```

### **Token Expiration:**
- **Access Token**: 1 day (configured in `SIMPLE_JWT.ACCESS_TOKEN_LIFETIME`)
- **Refresh Token**: 7 days (configured in `SIMPLE_JWT.REFRESH_TOKEN_LIFETIME`)

### **Security Features:**
- ✅ Tokens expire automatically
- ✅ Refresh token rotation (new refresh token on each refresh)
- ✅ Old refresh tokens are blacklisted after rotation
- ✅ Automatic token refresh on 401 errors
- ✅ Bearer token format (industry standard)

---

## 🎯 **API Endpoints**

| Endpoint | Method | Body | Returns |
|----------|--------|------|---------|
| `/api/auth/login/` | POST | `{"username": "...", "password": "..."}` | `{"access": "...", "refresh": "...", "user": {...}}` |
| `/api/auth/refresh/` | POST | `{"refresh": "..."}` | `{"access": "...", "refresh": "..."}` |
| `/api/auth/logout/` | POST | - | `{"message": "..."}` |
| `/api/users/me/` | GET | - (requires Bearer token) | `{user data}` |

---

## 🐛 **Troubleshooting**

### **Error: "Token is invalid or expired"**
- The access token has expired
- Frontend should automatically refresh it
- Check browser console for refresh attempts

### **Error: "Invalid or expired refresh token"**
- The refresh token has expired (after 7 days)
- User needs to login again
- Frontend will redirect to login page

### **Error: "Authentication credentials were not provided"**
- No token in request headers
- Check if user is logged in
- Check localStorage for `accessToken`

### **Old token format still being sent**
- Clear browser localStorage
- Hard refresh the page (Ctrl+Shift+R)

---

## 📝 **Configuration**

Edit token lifetimes in `shared-backend/crmAdmin/settings.py`:

```python
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=1),  # Change to minutes(15) for testing
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
}
```

---

## ✨ **Next Steps**

1. ✅ Test login with existing users
2. ✅ Test registration (should auto-login with JWT)
3. ✅ Test token refresh by waiting for expiration
4. ✅ Test automatic refresh on 401 errors
5. ✅ Verify all protected routes still work
6. ✅ Test logout (tokens should be cleared)

---

## 🚀 **Benefits**

- ✅ **More Secure**: Tokens expire automatically
- ✅ **Better UX**: Automatic token refresh (no interruptions)
- ✅ **Stateless**: Backend doesn't store session data
- ✅ **Scalable**: Works across multiple servers
- ✅ **Industry Standard**: JWT is widely used and supported

---

**Implementation Status:** ✅ **COMPLETE**

All backend and frontend code has been updated to use JWT authentication with automatic token refresh!
