# 🔐 Login Troubleshooting Guide

## ✅ Backend Status: WORKING!

Your backend is running correctly and the login endpoint is functional.

---

## 🧪 Test Credentials

Use these credentials to login:

```
Username: testuser
Password: test123
```

**OR you can use any of these existing users:**
- `user2` / `user2@user.com`
- `newuser` / `newuser@user.com`
- `user3` / `user3@user.com`

*(If you don't know their passwords, use the `testuser` account above)*

---

## 🔍 Debugging Steps

### 1. Verify Backend is Running

Open browser and visit: http://localhost:8000/api/

**Expected:** You should see a browsable API page or JSON response

### 2. Test Login Endpoint Directly

```powershell
$body = @{ username = "testuser"; password = "test123" } | ConvertTo-Json
Invoke-WebRequest -Uri "http://localhost:8000/api/auth/login/" `
  -Method POST `
  -Body $body `
  -ContentType "application/json" `
  -UseBasicParsing
```

**Expected:** Status 200 with token in response

### 3. Check Android App Configuration

**Base URL** (in `ApiClient.kt`):
```kotlin
private const val BASE_URL = "http://10.0.2.2:8000/api/"
```

**For Emulator:** ✅ Use `10.0.2.2:8000` (already configured)  
**For Physical Device:** Use your PC's IP address (e.g., `192.168.1.100:8000`)

### 4. Check Network Permissions

**AndroidManifest.xml** should have:
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```
✅ **Already configured**

**network_security_config.xml** should allow cleartext:
```xml
<domain includeSubdomains="true">10.0.2.2</domain>
```
✅ **Already configured**

---

## 🐛 Common Issues & Solutions

### Issue 1: "Cannot connect to server"

**Causes:**
- Backend not running
- Wrong IP address
- Firewall blocking port 8000

**Solution:**
1. Verify backend is running: `cd shared-backend && python manage.py runserver 0.0.0.0:8000`
2. Check firewall allows port 8000
3. For physical device, use correct IP: `ipconfig` (Windows) to find your PC's IP

### Issue 2: "Invalid username or password"

**Causes:**
- Wrong credentials
- User doesn't exist
- User account is inactive

**Solution:**
1. Use test credentials: `testuser` / `test123`
2. Create new user via backend:
```bash
cd shared-backend
python manage.py createsuperuser
```

### Issue 3: Login succeeds but app doesn't navigate

**Causes:**
- User has no profiles (Customer/Employee/Vendor)
- Primary profile not set

**Solution:**
User needs at least one profile. Check backend:
```python
from crmApp.models import User, UserProfile
user = User.objects.get(username='testuser')
print(f"Profiles: {user.profiles.count()}")
```

If no profiles, create one:
```python
from crmApp.models import Organization, UserProfile
org = Organization.objects.first()  # or create one
UserProfile.objects.create(
    user=user,
    organization=org,
    profile_type='employee',
    is_primary=True
)
```

### Issue 4: "Network error" or "Timeout"

**Causes:**
- Emulator network issues
- DNS resolution problems
- Backend taking too long to respond

**Solution:**
1. **Cold Boot Emulator:** Close and restart emulator completely
2. **Check Emulator Network:**
   - In emulator, open browser and visit: http://10.0.2.2:8000/api/
   - Should see the API page
3. **Restart Backend:** Stop and restart the Django server
4. **Check Backend Logs:** Look for errors in terminal where backend is running

### Issue 5: App shows blank error or crashes

**Causes:**
- Unhandled exception in app
- Missing data in API response

**Solution:**
1. **Check Logcat:** 
   - In Android Studio: View → Tool Windows → Logcat
   - Filter by "too.good.crm"
   - Look for red error messages
2. **Enable Verbose Logging:**
   - API calls are already logged with HttpLoggingInterceptor
   - Check logs for API request/response details

---

## 📱 Testing Steps

### On Android Emulator:

1. **Build and Install App:**
   ```powershell
   cd app-frontend
   ./gradlew installDebug
   ```

2. **Launch App** in emulator

3. **Try Login:**
   - Username: `testuser`
   - Password: `test123`

4. **Check Backend Logs:**
   - Should see: `Login request received: {'username': 'testuser', ...}`
   - Then: `Login successful for user: test@test.com`

5. **If Login Fails:**
   - Open Android Studio Logcat
   - Filter: `too.good.crm`
   - Look for error messages
   - Check API response in logs

### On Physical Device:

1. **Find Your PC's IP:**
   ```powershell
   ipconfig
   # Look for "IPv4 Address" under WiFi/Ethernet (e.g., 192.168.1.100)
   ```

2. **Update ApiClient.kt:**
   ```kotlin
   private const val BASE_URL = "http://YOUR_PC_IP:8000/api/"
   // Example: "http://192.168.1.100:8000/api/"
   ```

3. **Update network_security_config.xml:**
   ```xml
   <domain includeSubdomains="true">YOUR_PC_IP</domain>
   <!-- Example: 192.168.1.100 -->
   ```

4. **Rebuild and Install:**
   ```powershell
   ./gradlew installDebug
   ```

5. **Test Login** with `testuser` / `test123`

---

## 🔧 Quick Fixes

### Reset Everything:

```powershell
# 1. Stop backend (Ctrl+C)

# 2. Restart backend
cd shared-backend
python manage.py runserver 0.0.0.0:8000

# 3. Uninstall app from emulator/device
adb uninstall too.good.crm

# 4. Rebuild and install
cd app-frontend
./gradlew clean
./gradlew installDebug
```

### Create Admin User with Profile:

```powershell
cd shared-backend
python manage.py shell
```

```python
from crmApp.models import User, Organization, UserProfile

# Create organization
org = Organization.objects.create(
    name="Test Company",
    email="info@testcompany.com"
)

# Create user
user = User.objects.create_user(
    username='admin',
    email='admin@test.com',
    password='admin123',
    first_name='Admin',
    last_name='User'
)

# Create employee profile
UserProfile.objects.create(
    user=user,
    organization=org,
    profile_type='employee',
    is_primary=True
)

print(f"✅ Created admin user with profile")
print(f"   Username: admin")
print(f"   Password: admin123")
```

---

## 📞 Still Having Issues?

If login still doesn't work, please provide:

1. **Backend logs** (terminal output when you try to login)
2. **Android Logcat logs** (filtered for "too.good.crm")
3. **Exact error message** shown in the app
4. **Device type** (emulator or physical device)
5. **Screenshot** of the error (if any)

---

## ✅ Success Indicators

You'll know login works when:

1. ✅ Backend logs show: `Login successful for user: [email]`
2. ✅ App shows: `Login successful` or navigates to Dashboard
3. ✅ No error messages in Android Logcat
4. ✅ Dashboard loads with your data

---

## 🎯 Summary

**Your setup is correct:**
- ✅ Backend running on 0.0.0.0:8000
- ✅ Login endpoint working
- ✅ Test user created (testuser/test123)
- ✅ Android app configured for emulator
- ✅ Network permissions granted
- ✅ Cleartext traffic allowed

**Next steps:**
1. Use test credentials: `testuser` / `test123`
2. Check Android Logcat if login fails
3. Verify user has a profile in backend
4. Share error logs if issue persists

Good luck! 🚀

