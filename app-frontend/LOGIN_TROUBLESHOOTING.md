# Login & Profile Switching Troubleshooting Guide

## Issues Fixed (December 2, 2025)

### ✅ 1. Custom UserProfile Deserializer Not Registered
**Problem:** The `UserProfileDeserializer` was defined but never registered with Gson, potentially causing JSON parsing errors when backend returns profiles with varying organization field formats.

**Solution:** Updated `ApiClient.kt` to create a custom Gson instance with the deserializer properly registered:
```kotlin
private val gson = GsonBuilder()
    .registerTypeAdapter(UserProfile::class.java, UserProfile.Companion.UserProfileDeserializer())
    .create()
```

---

## Profile Switching Feature - How to Access

The profile switching functionality **IS ALREADY IMPLEMENTED** and available in the app:

### Location:
1. **Open the App** → Login successfully
2. **Open the Navigation Drawer** (swipe from left or tap hamburger menu)
3. **Profile Selector** appears at the top of the drawer
4. **Tap on a different profile** to switch

### Also Available In:
- **Settings Screen** → Uses the same drawer navigation
- **All main screens** with drawer navigation

### Implementation Files:
- `ProfileViewModel.kt` - Business logic for profile switching
- `AppScaffoldWithDrawer` - UI component with profile selector
- `SettingsScreenNew.kt` - Settings screen with profile management
- `ProfileRepository.kt` - API calls for profile operations

---

## Login Issues - Troubleshooting Steps

### Issue: "Login is taking too long"

**Possible Causes:**
1. Backend server not running or slow
2. Network connectivity issues
3. Wrong backend URL configuration
4. Firewall blocking connection
5. Permission initialization taking time

### Solution Steps:

#### 1. Check Backend Server
```bash
# Make sure Django backend is running:
python manage.py runserver 0.0.0.0:8000

# You should see:
# Starting development server at http://0.0.0.0:8000/
```

#### 2. Verify Backend URL Configuration

**File:** `gradle.properties` (root of app-frontend folder)

**For Android Emulator:**
```properties
BACKEND_URL=http://10.0.2.2:8000/api/
```
- `10.0.2.2` is a special IP that emulator uses to access host machine's localhost

**For Physical Device:**
```properties
BACKEND_URL=http://192.168.X.X:8000/api/
```
- Replace `192.168.X.X` with your computer's actual IP address
- Find your IP:
  - Windows: `ipconfig` → Look for "IPv4 Address"
  - Mac/Linux: `ifconfig` → Look for "inet"

**Important:** Phone and computer MUST be on the same WiFi network!

#### 3. Test Backend Connection

**Using a web browser on your phone:**
1. Open browser
2. Navigate to: `http://YOUR_IP:8000/api/auth/login/`
3. You should see Django REST Framework API page
4. If this fails, your device cannot reach the backend

#### 4. Check Firewall Settings

**Windows Firewall:**
```powershell
# Allow port 8000 through firewall
New-NetFirewallRule -DisplayName "Django Dev Server" -Direction Inbound -LocalPort 8000 -Protocol TCP -Action Allow
```

**Or manually:**
1. Windows Security → Firewall & network protection
2. Advanced settings → Inbound Rules → New Rule
3. Port → TCP → 8000 → Allow the connection

#### 5. Enable Network Logging

The app already has detailed logging. To view logs:

**Android Studio:**
1. Open Logcat (bottom toolbar)
2. Filter by "LoginViewModel" or "ApiClient"
3. Look for network requests and responses

**Key Log Tags:**
- `LoginViewModel` - Login flow
- `ApiClient` - Network requests
- `AuthRepository` - API calls
- `ProfileViewModel` - Profile switching

---

## Login Failure - Cannot Login

### Error: "Invalid username or password"
- **Cause:** Wrong credentials
- **Solution:** 
  1. Check username/password in Django admin
  2. Create a test user if needed:
     ```bash
     python manage.py createsuperuser
     ```

### Error: "Cannot connect to server"
- **Cause:** Backend not reachable
- **Solutions:**
  1. Start backend: `python manage.py runserver 0.0.0.0:8000`
  2. Check IP address in `gradle.properties`
  3. Verify same WiFi network (physical device)
  4. Check firewall settings

### Error: "Connection timeout after 15 seconds"
- **Cause:** Network/server too slow or unreachable
- **Solutions:**
  1. Check backend is running
  2. Verify network connection
  3. Test backend URL in browser
  4. Check server logs for errors

### Error: "Server endpoint not found" (404)
- **Cause:** Wrong API endpoint or URL
- **Solutions:**
  1. Verify `BACKEND_URL` ends with `/api/`
  2. Check Django URLs are configured correctly
  3. Test endpoint: `http://YOUR_IP:8000/api/auth/login/`

---

## Performance Optimization

### Login Speed Issues

**Current Timeout Settings:**
- Connect timeout: 15 seconds
- Read timeout: 15 seconds
- Write timeout: 15 seconds

**If login is consistently slow:**

1. **Check backend performance:**
   ```bash
   # Monitor Django logs while logging in
   python manage.py runserver 0.0.0.0:8000
   ```

2. **Profile the network:**
   - Check Logcat for request/response times
   - Look for API calls taking >2 seconds

3. **Disable debug logging in production:**
   - Edit `ApiClient.kt`
   - Change logging level from `BODY` to `BASIC` or `NONE`

---

## Profile Switching Issues

### Issue: "Profile switch not working"

**Check:**
1. User has multiple profiles in backend
2. Profiles are properly configured with organizations
3. Network connection is active
4. Check Logcat for errors

**Verify in Django Admin:**
```python
# Check user profiles
from django.contrib.auth.models import User
user = User.objects.get(username='your_username')
profiles = user.userprofile_set.all()
print(f"User has {profiles.count()} profiles")
```

### Issue: "Profile switch is slow"

**Causes:**
1. Permission API call taking time
2. Network latency
3. Backend processing

**Solution:**
- The app uses optimistic UI updates (instant feedback)
- API call happens in background
- If slow, check backend logs

---

## Testing Checklist

### Before Testing Login:
- [ ] Backend server is running on port 8000
- [ ] `gradle.properties` has correct IP address
- [ ] For physical device: Same WiFi network
- [ ] Firewall allows port 8000
- [ ] Test user exists in Django admin
- [ ] User has at least one profile

### Testing Steps:
1. [ ] Open app
2. [ ] Enter valid username and password
3. [ ] Tap Login
4. [ ] Should see loading indicator
5. [ ] Should navigate to dashboard on success
6. [ ] Check Logcat for any errors

### Testing Profile Switching:
1. [ ] Login successfully
2. [ ] Open navigation drawer
3. [ ] See profile selector at top
4. [ ] Tap different profile
5. [ ] Should see optimistic update (instant)
6. [ ] Should confirm switch with API call
7. [ ] Dashboard should reload with new profile

---

## Debug Mode

### Enable Detailed Logging

Already enabled in `ApiClient.kt`:
```kotlin
private val loggingInterceptor = HttpLoggingInterceptor().apply {
    level = HttpLoggingInterceptor.Level.BODY
}
```

This logs:
- All HTTP requests (URL, method, headers, body)
- All HTTP responses (status, headers, body)
- Authentication tokens (redacted)

### View Logs in Android Studio:
1. Open Logcat
2. Filter by tag:
   - `ApiClient` - Network layer
   - `LoginViewModel` - Login logic
   - `ProfileViewModel` - Profile switching
   - `AuthRepository` - Auth operations

---

## Common Error Messages Explained

| Error | Meaning | Solution |
|-------|---------|----------|
| "Cannot connect to server" | Backend unreachable | Check IP, start server |
| "Connection timeout" | Request took >15s | Check network/server |
| "Invalid username or password" | Wrong credentials | Verify in Django admin |
| "Server endpoint not found" | Wrong URL | Check `BACKEND_URL` |
| "Failed to switch profile" | Profile API error | Check backend logs |
| "No internet connection" | Network unavailable | Check WiFi/mobile data |

---

## Quick Fixes

### Reset Everything:
1. Clear app data: Settings → Apps → Too Good CRM → Clear Data
2. Rebuild app: `./gradlew clean build`
3. Restart backend: Stop and restart Django server
4. Re-login

### Verify Backend API:
```bash
# Test login endpoint
curl -X POST http://YOUR_IP:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"testpass"}'

# Should return: {"token":"...", "user":{...}}
```

---

## Need More Help?

1. Check Android Studio Logcat for detailed error messages
2. Check Django backend console for API errors
3. Verify network connectivity between device and server
4. Review `ApiClient.kt` for network configuration
5. Check `LoginViewModel.kt` for login flow logic

## Files Modified (December 2, 2025)
- ✅ `ApiClient.kt` - Added custom Gson with UserProfile deserializer
- ✅ `Auth.kt` - Custom deserializer already defined (now being used)

## Files with Profile Switching Implementation
- `ProfileViewModel.kt` - Profile switching logic
- `AppScaffoldWithDrawer.kt` - UI with profile selector
- `SettingsScreenNew.kt` - Settings screen
- `ProfileRepository.kt` - API calls
- `RoleSelectionApiService.kt` - Backend API interface

