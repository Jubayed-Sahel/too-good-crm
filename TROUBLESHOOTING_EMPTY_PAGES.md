# Troubleshooting: Customers and Deals Not Loading

## Summary

The database has data, and the user (`me@me.com`) is properly associated with an organization that has:
- ✅ **5 Customers**
- ✅ **5 Deals**

The backend API correctly returns this data when called directly. However, the frontend pages show empty results.

## Root Cause Analysis

### Verified ✅
1. ✅ Data exists in database (10 customers, 13 deals total)
2. ✅ User `me@me.com` is associated with organization "Demo Company"
3. ✅ Backend ViewSets correctly filter by user's organizations
4. ✅ Backend returns 5 customers and 5 deals for this user
5. ✅ Frontend hooks (`useCustomers`, `useDeals`) are properly implemented
6. ✅ API client has proper error handling and logging

### Likely Issues ❌
1. **Backend server not running** - Check if Django server is active
2. **Wrong API URL** - Frontend might be calling wrong endpoint
3. **Authentication** - Token might be missing or invalid
4. **CORS** - Cross-origin requests might be blocked

## Step-by-Step Fix

### Step 1: Start Backend Server

```powershell
cd shared-backend
python manage.py runserver
```

**Expected output:**
```
Starting development server at http://127.0.0.1:8000/
```

Keep this terminal open!

### Step 2: Verify Backend is Accessible

Open a new terminal and test:

```powershell
# Test if server responds
curl http://127.0.0.1:8000/api/customers/
```

**Expected:** Should return 401 Unauthorized (needs auth token)

### Step 3: Check Frontend Configuration

File: `web-frontend/.env` or `web-frontend/.env.local`

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

### Step 4: Start Frontend

```powershell
cd web-frontend
npm run dev
```

**Expected output:**
```
  ➜  Local:   http://localhost:5173/
```

### Step 5: Login and Check Browser Console

1. Open http://localhost:5173
2. Login with: `me@me.com` / your password
3. Open Browser DevTools (F12)
4. Go to Console tab
5. Navigate to Customers or Deals page
6. Look for API logs:

**Expected logs:**
```
🚀 API Request: GET /customers/
✅ API Response: GET /customers/ {status: 200, data: {results: [...], count: 5}}
```

**If you see errors:**

#### Error: `❌ Network Error`
- Backend server is not running
- Wrong URL in frontend config
- CORS not configured

**Fix:**
1. Make sure backend is running on port 8000
2. Check `VITE_API_BASE_URL` in frontend

#### Error: `❌ 401 Unauthorized`
- Not logged in
- Token expired/invalid

**Fix:**
1. Logout and login again
2. Check localStorage has `authToken`

#### Error: `❌ 403 Forbidden`
- User has no organization
- Permission issue

**Fix:**
Already fixed by running `associate_users.py`

#### Error: `❌ CORS Error`
- Backend not allowing frontend origin

**Fix:**
Check `shared-backend/crmAdmin/settings.py`:

```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
```

### Step 6: Manual API Test (Optional)

Test with curl using your auth token:

```powershell
# Get your token (from browser localStorage or login response)
$token = "your-token-here"

# Test customers endpoint
curl -H "Authorization: Token $token" http://127.0.0.1:8000/api/customers/

# Test deals endpoint
curl -H "Authorization: Token $token" http://127.0.0.1:8000/api/deals/
```

## Quick Diagnostic Commands

### Check if backend is running
```powershell
# Windows
netstat -ano | findstr :8000

# If nothing shows, backend is NOT running
```

### Check if data exists
```powershell
cd shared-backend
python -c "import os; os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings'); import django; django.setup(); from crmApp.models import Customer, Deal; print(f'Customers: {Customer.objects.count()}'); print(f'Deals: {Deal.objects.count()}')"
```

### Check user's organization
```powershell
cd shared-backend
python -c "import os; os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings'); import django; django.setup(); from django.contrib.auth import get_user_model; User = get_user_model(); user = User.objects.get(email='me@me.com'); print(f'Organizations: {user.user_organizations.count()}')"
```

## Common Issues Checklist

- [ ] Backend server is running (`python manage.py runserver`)
- [ ] Frontend dev server is running (`npm run dev`)
- [ ] Logged in with correct user (`me@me.com`)
- [ ] Browser console shows no errors
- [ ] localStorage has `authToken`
- [ ] API base URL is correct (`http://127.0.0.1:8000/api`)
- [ ] CORS is configured in Django settings
- [ ] No firewall blocking port 8000 or 5173

## Success Indicators

When everything works:

1. **Console logs** show successful API requests:
   ```
   🚀 API Request: GET /customers/
   ✅ API Response: GET /customers/ {status: 200, data: {results: [...]}}
   ```

2. **Network tab** shows 200 responses for `/api/customers/` and `/api/deals/`

3. **Customers page** displays 5 customers from "Demo Company"

4. **Deals page** displays 5 deals

## Need More Help?

If still not working, provide:

1. Browser console output (any errors?)
2. Network tab screenshot (what HTTP status codes?)
3. Is backend server running? (check terminal)
4. What user are you logged in as?

---

**Most likely issue:** Backend server is not running. Make sure to run `python manage.py runserver` in the `shared-backend` directory!
