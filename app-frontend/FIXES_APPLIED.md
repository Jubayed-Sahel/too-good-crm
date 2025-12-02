# Fixes Applied - December 2, 2025

## ✅ CRITICAL FIX: UserProfile Deserializer Registration

### Problem
The custom `UserProfileDeserializer` was defined in `Auth.kt` but was **never registered** with Gson in `ApiClient.kt`. This would cause JSON parsing errors when the backend returns user profiles where the `organization` field varies between:
- A number (organization ID)
- An object (full Organization details)
- null

### Impact
- Login failures when parsing user profiles
- Profile switching failures
- Potential app crashes on user authentication

### Solution Applied
Updated `ApiClient.kt` to create a custom Gson instance with the deserializer registered:

**File:** `app/src/main/java/too/good/crm/data/api/ApiClient.kt`

**Changes:**
```kotlin
// Added imports
import too.good.crm.data.model.UserProfile
import com.google.gson.GsonBuilder

// Created custom Gson instance (before retrofit builder)
private val gson = GsonBuilder()
    .registerTypeAdapter(UserProfile::class.java, UserProfile.Companion.UserProfileDeserializer())
    .create()

// Updated Retrofit builder to use custom Gson
private val retrofit = Retrofit.Builder()
    .baseUrl(BASE_URL)
    .client(okHttpClient)
    .addConverterFactory(GsonConverterFactory.create(gson))  // ← Now uses custom gson
    .build()
```

### Testing Recommendations
1. **Test Login Flow:**
   - Login with different user types (customer, vendor, employee)
   - Verify profiles are parsed correctly
   - Check Logcat for any JSON parsing errors

2. **Test Profile Switching:**
   - Switch between different profiles
   - Verify organization data is correctly parsed
   - Ensure no crashes occur

---

## ℹ️ PROFILE SWITCHING FEATURE - ALREADY IMPLEMENTED

### Location
The profile switching feature **already exists** in the app and is accessible via:

1. **Navigation Drawer** → Profile selector at top
2. **Settings Screen** → Same drawer navigation
3. **All main screens** → Drawer menu

### How to Use
1. Login to the app
2. Open navigation drawer (swipe from left or tap menu icon)
3. If you have multiple profiles, you'll see a profile selector at the top
4. Tap a different profile to switch
5. App will update instantly (optimistic update) then confirm with backend

### Implementation Files
- `ProfileViewModel.kt` - Business logic
- `AppScaffold.kt` - UI with ProfileSwitcher component
- `ProfileRepository.kt` - API integration
- `SettingsScreenNew.kt` - Settings screen
- `RoleSelectionApiService.kt` - Backend API

### Notes
- Only shows if user has multiple profiles
- Employee profiles only show if they have an organization (same as web app)
- Uses optimistic UI updates for instant feedback

---

## 🐛 LOGIN PERFORMANCE ISSUES

### Possible Causes
1. **Backend Server Response Time**
   - Check if Django backend is slow to respond
   - Monitor Django console for request processing time

2. **Network Latency**
   - Connection timeout: 15 seconds
   - Read timeout: 15 seconds
   - May be too long if server is unresponsive

3. **Permission Initialization**
   - After login, app fetches user permissions
   - This adds extra API calls and processing time

4. **Backend URL Configuration**
   - Emulator: Must use `10.0.2.2:8000`
   - Physical device: Must use your PC's actual IP
   - Wrong IP = connection timeout (15 seconds wasted)

### Troubleshooting Steps

#### 1. Verify Backend is Running
```bash
python manage.py runserver 0.0.0.0:8000
```

#### 2. Check Backend URL in gradle.properties
```properties
# For Emulator
BACKEND_URL=http://10.0.2.2:8000/api/

# For Physical Device (replace with your IP)
BACKEND_URL=http://192.168.X.X:8000/api/
```

#### 3. Test Connection
Open browser on your device and navigate to:
```
http://YOUR_IP:8000/api/auth/login/
```
You should see Django REST Framework API page.

#### 4. Check Logcat for Timing
Filter by "LoginViewModel" or "ApiClient" to see:
- Request start time
- Response time
- Any errors or timeouts

#### 5. Verify Firewall Settings
Windows Firewall must allow port 8000:
```powershell
New-NetFirewallRule -DisplayName "Django Dev Server" -Direction Inbound -LocalPort 8000 -Protocol TCP -Action Allow
```

---

## 📋 REMAINING WARNINGS (Non-Critical)

The following warnings are present but **DO NOT affect functionality**:

### 1. Unused Import Warning
- **File:** ApiClient.kt, line 5
- **Warning:** `import okio.Buffer` is unused
- **Impact:** None - just a style warning
- **Fix:** Can be removed if desired

### 2. Using 'Log' instead of 'Timber'
- **Files:** ApiClient.kt (multiple locations)
- **Warning:** Should use Timber logging library
- **Impact:** None - android.util.Log works fine
- **Fix:** Optional - can migrate to Timber later

### 3. Unused Exception Parameter
- **File:** ApiClient.kt, line 119
- **Warning:** `catch (e: Exception)` parameter never used
- **Impact:** None
- **Fix:** Change to `catch (_: Exception)` to suppress warning

---

## 🔍 VERIFICATION CHECKLIST

After applying fixes, verify:

### Backend
- [ ] Django server is running: `python manage.py runserver 0.0.0.0:8000`
- [ ] Backend console shows no errors
- [ ] Test user exists with valid credentials
- [ ] User has at least one profile in database

### App Configuration
- [ ] `gradle.properties` has correct `BACKEND_URL`
- [ ] IP address matches your setup (emulator vs physical device)
- [ ] Rebuild app after changing gradle.properties: `./gradlew clean build`

### Network
- [ ] Physical device on same WiFi as PC
- [ ] Firewall allows port 8000
- [ ] Can access backend from device browser

### App Testing
- [ ] Login works without crashing
- [ ] No JSON parsing errors in Logcat
- [ ] Profile switching works (if multiple profiles)
- [ ] Login completes in reasonable time (<5 seconds)

---

## 📝 SUMMARY OF CHANGES

| File | Change | Impact |
|------|--------|--------|
| ApiClient.kt | Added custom Gson with UserProfile deserializer | **Critical** - Fixes JSON parsing |
| LOGIN_TROUBLESHOOTING.md | Created comprehensive guide | Documentation |
| FIXES_APPLIED.md | This file | Documentation |

---

## 🚀 NEXT STEPS

1. **Test the fixes:**
   - Clean and rebuild the app
   - Test login with different users
   - Test profile switching
   - Monitor Logcat for errors

2. **If login still fails:**
   - Check `LOGIN_TROUBLESHOOTING.md` for detailed steps
   - Verify backend URL configuration
   - Test backend connection from device
   - Check Django logs for errors

3. **If login is still slow:**
   - Monitor Django console for slow queries
   - Check network connection quality
   - Consider reducing timeout values if needed
   - Profile the permission initialization process

---

## 📞 DEBUGGING TIPS

### View Detailed Logs
**Android Studio Logcat filters:**
```
tag:LoginViewModel
tag:ApiClient
tag:AuthRepository
tag:ProfileViewModel
```

### Test Backend Directly
```bash
# Test login endpoint
curl -X POST http://YOUR_IP:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"testpass"}'
```

### Common Error Messages
| Error | Cause | Solution |
|-------|-------|----------|
| Cannot connect to server | Backend not reachable | Check IP, start server |
| Connection timeout | Request took >15s | Check network/server |
| Invalid username or password | Wrong credentials | Verify in Django admin |
| JSON parsing error | **FIXED** by this update | Should not occur now |

---

## ✅ CONCLUSION

The **critical issue** (UserProfile deserializer not registered) has been **FIXED**.

The **profile switching feature** is **ALREADY IMPLEMENTED** and accessible via the navigation drawer.

If you're still experiencing login issues, they are likely **configuration or network related**, not code issues. Follow the troubleshooting guide in `LOGIN_TROUBLESHOOTING.md`.

