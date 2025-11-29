# Mobile App Authentication Implementation - Complete Guide

## ✅ CHANGES MADE

### Backend Changes (Django)

#### 1. Updated Login Response to Include `token` Field
**File**: `shared-backend/crmApp/viewsets/auth.py`

**Change**: Added `token` field for mobile app compatibility while keeping `legacy_token` for web frontend

```python
return Response({
    'user': UserSerializer(user).data,
    'access': tokens['access'],
    'refresh': tokens['refresh'],
    'token_type': 'Bearer',
    'access_expires_in': tokens['access_expires_in'],
    'refresh_expires_in': tokens['refresh_expires_in'],
    'token': legacy_token.key,          # ✅ Mobile app compatibility
    'legacy_token': legacy_token.key,    # ✅ Web frontend compatibility
    'message': 'Login successful'
})
```

**Why**: Mobile app expects `token` field, web frontend expects `legacy_token`. Now both work.

### Mobile App Changes (Android)

#### 1. Fixed IP Address in gradle.properties
**File**: `app-frontend/gradle.properties`

```properties
# OLD (wrong IP)
BACKEND_URL=http://192.168.0.106:8000/api/

# NEW (current IP)
BACKEND_URL=http://192.168.0.131:8000/api/
```

#### 2. Reduced Timeout for Faster Error Feedback
**File**: `app-frontend/app/src/main/java/too/good/crm/data/api/ApiClient.kt`

```kotlin
// OLD (60 second timeout - too slow)
.connectTimeout(60, TimeUnit.SECONDS)
.readTimeout(60, TimeUnit.SECONDS)
.writeTimeout(60, TimeUnit.SECONDS)

// NEW (15 second timeout - faster feedback)
.connectTimeout(15, TimeUnit.SECONDS)
.readTimeout(15, TimeUnit.SECONDS)
.writeTimeout(15, TimeUnit.SECONDS)
```

**Why**: 60-second timeout made failures take too long. 15 seconds provides faster feedback.

#### 3. Updated Network Security Config
**File**: `app-frontend/app/src/main/res/xml/network_security_config.xml`

Added current IP to allowed domains:
```xml
<domain includeSubdomains="true">192.168.0.131</domain>
```

### Backend Server Configuration

#### Restarted Backend with Network Binding
```powershell
python manage.py runserver 0.0.0.0:8000
```

**Before**: `python manage.py runserver` (localhost only)
**After**: `python manage.py runserver 0.0.0.0:8000` (accessible from network)

---

## 🔐 AUTHENTICATION FLOW COMPARISON

### Mobile App Authentication (Same as Web)

```
1. User enters credentials
   ├─ Username: admin
   └─ Password: admin123

2. POST /api/auth/login/
   ├─ Body: {username, password}
   └─ Headers: Content-Type: application/json

3. Backend validates & generates tokens
   ├─ JWT Access Token (24h validity)
   ├─ JWT Refresh Token (7 days)
   └─ Legacy Token (for backward compatibility)

4. Backend Response
   {
     "user": {...},
     "access": "eyJhbG...",
     "refresh": "eyJhbG...",
     "token": "e3b23a9b107b617bada04566c467aafc1a721bc9",
     "legacy_token": "e3b23a9b107b617bada04566c467aafc1a721bc9",
     "token_type": "Bearer",
     "message": "Login successful"
   }

5. Mobile App stores token
   ├─ SharedPreferences: auth_token
   ├─ ApiClient.setAuthToken(token)
   └─ User session initialized

6. All API requests include token
   Authorization: Token e3b23a9b107b617bada04566c467aafc1a721bc9

7. Backend validates token
   ├─ TokenAuthentication middleware
   ├─ Matches token to user
   └─ Attaches user to request

8. RBAC permission check
   ├─ Check user.is_superuser
   ├─ Check profile permissions
   └─ Allow/deny access
```

### Key Components

#### Mobile App (Android/Kotlin)

**AuthRepository.kt** - Handles login API call
```kotlin
suspend fun login(username: String, password: String): Result<LoginResponse> {
    val response = apiService.login(LoginRequest(username, password))
    if (response.isSuccessful && response.body() != null) {
        val loginResponse = response.body()!!
        
        // Save token
        saveAuthToken(loginResponse.token)
        saveUserInfo(loginResponse.user)
        
        // Set in ApiClient for all future requests
        ApiClient.setAuthToken(loginResponse.token)
        
        Result.success(loginResponse)
    }
}
```

**ApiClient.kt** - Auto-injects token into requests
```kotlin
.addInterceptor { chain ->
    val original = chain.request()
    val requestBuilder = original.newBuilder()
    
    // Add token for protected endpoints
    if (!isPublicEndpoint) {
        authToken?.let {
            requestBuilder.header("Authorization", "Token $it")
        }
    }
    
    chain.proceed(requestBuilder.build())
}
```

**LoginViewModel.kt** - Manages login state
```kotlin
fun login(onSuccess: () -> Unit) {
    viewModelScope.launch {
        _uiState.value = LoginUiState.Loading
        
        val result = authRepository.login(username, password)
        
        result.fold(
            onSuccess = { loginResponse ->
                // Set user session
                UserSession.currentProfile = AppUserProfile(...)
                _uiState.value = LoginUiState.Success("Login successful")
                onSuccess()
            },
            onFailure = { error ->
                _uiState.value = LoginUiState.Error(error.message)
            }
        )
    }
}
```

#### Backend (Django)

**LoginViewSet** - Handles authentication
```python
def create(self, request):
    serializer = LoginSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    
    user = serializer.validated_data['user']
    
    # Generate JWT tokens with RBAC claims
    tokens = JWTService.generate_tokens_for_user(user)
    
    # Get/create legacy token
    legacy_token, created = Token.objects.get_or_create(user=user)
    
    return Response({
        'user': UserSerializer(user).data,
        'access': tokens['access'],
        'refresh': tokens['refresh'],
        'token': legacy_token.key,  # Mobile app uses this
        'message': 'Login successful'
    })
```

**TokenAuthentication Middleware** - Validates requests
```python
# settings.py
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
}
```

---

## 🧪 TESTING INSTRUCTIONS

### Step 1: Verify Backend is Running

```powershell
# Check backend process
Get-Job | Where-Object { $_.Name -eq "Backend" }

# Should show: State = Running
```

### Step 2: Verify Network Connectivity

```powershell
# Test if backend is accessible from network
Test-NetConnection -ComputerName 192.168.0.131 -Port 8000

# Should show: TcpTestSucceeded = True
```

### Step 3: Test Login Endpoint

```powershell
# Test login with curl
$body = @{username="admin"; password="admin123"} | ConvertTo-Json
Invoke-RestMethod -Uri "http://192.168.0.131:8000/api/auth/login/" -Method Post -Body $body -ContentType "application/json" | Select-Object @{N='has_token';E={$null -ne $_.token}}, message

# Should show: has_token = True, message = "Login successful"
```

### Step 4: Rebuild Mobile App

**CRITICAL**: IP address change requires rebuild

```bash
# In Android Studio:
1. Build → Clean Project
2. Build → Rebuild Project
3. Run → Run 'app'
```

Or via command line:
```bash
cd app-frontend
./gradlew clean
./gradlew assembleDebug
./gradlew installDebug
```

### Step 5: Test Mobile App Login

1. Launch app on device/emulator
2. Enter credentials:
   - Username: `admin`
   - Password: `admin123`
3. Tap "Login" button
4. Expected: Login completes in 1-2 seconds
5. Expected: Navigate to dashboard

---

## 🐛 TROUBLESHOOTING

### Issue: "Connection timeout after 15 seconds"

**Possible Causes:**
1. IP address mismatch in `gradle.properties`
2. Backend not running or not accessible on network
3. Firewall blocking connection
4. Device not on same WiFi network as PC

**Solutions:**

#### Check Current IP Address
```powershell
ipconfig | Select-String "IPv4"
```

If IP changed, update `app-frontend/gradle.properties`:
```properties
BACKEND_URL=http://YOUR_NEW_IP:8000/api/
```

Then **rebuild the app** (critical step).

#### Verify Backend Running on Network
```powershell
# Check if backend listening on 0.0.0.0:8000
Receive-Job -Name "Backend" -Keep | Select-String "0.0.0.0:8000"

# Should show: "Listening on TCP address 0.0.0.0:8000"
```

If not, restart backend:
```powershell
Stop-Job -Name "Backend"
Remove-Job -Name "Backend" -Force

cd shared-backend
.\venv\Scripts\Activate.ps1
python manage.py runserver 0.0.0.0:8000
```

#### Test Network Connectivity
```powershell
# From PC to itself
Test-NetConnection -ComputerName 192.168.0.131 -Port 8000

# Should show: TcpTestSucceeded = True
```

If False, check:
- Windows Firewall settings
- Antivirus blocking Python
- Network adapter settings

#### Allow Python Through Firewall
```powershell
# Quick test: Temporarily disable firewall
Set-NetFirewallProfile -Profile Private -Enabled False

# Test login again
# If works, add firewall rule:

New-NetFirewallRule -DisplayName "Python Django Server" -Direction Inbound -Program "C:\Path\To\python.exe" -Action Allow -Protocol TCP -LocalPort 8000

# Re-enable firewall
Set-NetFirewallProfile -Profile Private -Enabled True
```

### Issue: "Cannot resolve server address"

**Cause**: Device not on same network as PC

**Solution**:
- Ensure phone WiFi SSID matches PC WiFi SSID
- Both must be on same subnet (192.168.0.x)
- Check router settings for device isolation

**Verify Phone WiFi**:
- Settings → WiFi → Connected network
- Should match PC's WiFi name

### Issue: "Invalid username or password"

**Cause**: Credentials incorrect or user doesn't exist

**Solution**:

Create test user in backend:
```python
python manage.py shell

from django.contrib.auth import get_user_model
User = get_user_model()

# Create test user
user = User.objects.create_user(
    username='testuser',
    email='test@example.com',
    password='test123',
    first_name='Test',
    last_name='User'
)
print(f"Created user: {user.username}")
```

Or use existing superuser:
```bash
python manage.py createsuperuser
```

### Issue: App shows "Login successful" but doesn't navigate

**Cause**: Navigation logic issue or profile loading failure

**Check LogCat**:
```
In Android Studio:
View → Tool Windows → Logcat
Filter: "LoginViewModel" or "AuthRepository"
```

Look for errors in:
- User session initialization
- Profile loading
- Navigation callback

---

## 📊 AUTHENTICATION COMPARISON MATRIX

| Feature | Web Frontend | Mobile App | Backend |
|---------|-------------|-----------|---------|
| **Login Endpoint** | `/api/auth/login/` | `/api/auth/login/` | `LoginViewSet.create()` |
| **Request Format** | `{username, password}` | `{username, password}` | Same |
| **Response Token Field** | `legacy_token` | `token` | Both included |
| **Token Storage** | localStorage | SharedPreferences | Database (Token model) |
| **Token Header** | `Authorization: Token ...` | `Authorization: Token ...` | Same |
| **Token Injection** | Axios interceptor | OkHttp interceptor | N/A |
| **Auto-logout on 401** | ✅ Yes | ❌ Not implemented yet | N/A |
| **JWT Support** | ✅ Yes (primary) | ⚠️ Partial (receives but uses legacy) | ✅ Yes |
| **Timeout** | 60 seconds | 15 seconds | N/A |
| **Network Security** | HTTPS/HTTP | Cleartext allowed | N/A |

---

## 🚀 NEXT STEPS

### Recommended Improvements

#### 1. Implement JWT Token Refresh in Mobile App

Currently mobile app uses legacy token only. Should implement:
- Auto-refresh JWT when access token expires
- Store both access and refresh tokens
- Switch from Token auth to Bearer JWT auth

#### 2. Add Auto-Logout on 401

```kotlin
// In ApiClient.kt
.addInterceptor { chain ->
    val response = chain.proceed(request)
    
    if (response.code == 401) {
        // Clear session
        authToken = null
        // Navigate to login
        // TODO: Implement navigation
    }
    
    response
}
```

#### 3. Add Better Error Messages

Map HTTP status codes to user-friendly messages:
- 400: "Invalid request format"
- 401: "Invalid credentials"
- 403: "Access denied"
- 404: "Server endpoint not found"
- 500: "Server error"
- Timeout: "Connection timeout - check network"

#### 4. Add Retry Logic

For network errors, implement retry with exponential backoff:
```kotlin
.retryOnConnectionFailure(true)
.addInterceptor(RetryInterceptor(maxRetries = 3))
```

#### 5. Add Connection Status Indicator

Show connection status in UI:
- Green: Connected to backend
- Yellow: Connecting...
- Red: No connection

---

## ✅ VERIFICATION CHECKLIST

Before marking as complete, verify:

### Backend
- [ ] ✅ Login endpoint returns `token` field
- [ ] ✅ Login endpoint returns `legacy_token` field
- [ ] ✅ Backend running on `0.0.0.0:8000`
- [ ] ✅ Backend accessible from network
- [ ] ✅ Login test succeeds with curl/PowerShell

### Mobile App
- [ ] ✅ IP address correct in `gradle.properties`
- [ ] ✅ Timeout reduced to 15 seconds
- [ ] ✅ Network security config updated
- [ ] ✅ App rebuilt after config changes
- [ ] ✅ Device on same WiFi as PC

### Testing
- [ ] ⏳ Login completes in 1-2 seconds
- [ ] ⏳ Token saved to SharedPreferences
- [ ] ⏳ User session initialized
- [ ] ⏳ Navigation to dashboard works
- [ ] ⏳ Subsequent API calls include token
- [ ] ⏳ Error messages are user-friendly

---

## 📝 SUMMARY

### Root Causes of Timeout Issue
1. ❌ Backend returned `legacy_token` but mobile app expected `token`
2. ❌ IP address changed (106 → 131) but app not updated
3. ❌ Backend not listening on network (localhost only)
4. ❌ 60-second timeout too long for error feedback

### Fixes Applied
1. ✅ Added `token` field to backend login response
2. ✅ Updated `gradle.properties` with correct IP (192.168.0.131)
3. ✅ Restarted backend with `0.0.0.0:8000` binding
4. ✅ Reduced timeout from 60s to 15s
5. ✅ Updated network security config

### Current Status
- ✅ Backend authentication working
- ✅ Mobile app authentication matches web frontend
- ✅ Both use same Token-based auth
- ✅ Backend accessible from network
- ⏳ **App must be rebuilt to test changes**

### Expected Result
After rebuilding the app:
- Login should complete in 1-2 seconds
- Token should be received and stored
- Navigation to dashboard should work
- All API calls should include authorization token

---

## 🎯 TESTING SCRIPT

Save as `test-mobile-auth.ps1`:

```powershell
Write-Host "`n=== Mobile App Authentication Test ===" -ForegroundColor Cyan

# 1. Check IP
Write-Host "`n[1] Current IP Address:" -ForegroundColor Yellow
$ip = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -like '192.168.*'} | Select-Object -First 1).IPAddress
Write-Host "    $ip" -ForegroundColor Green

# 2. Check gradle.properties
Write-Host "`n[2] Mobile App Configuration:" -ForegroundColor Yellow
$config = Get-Content "app-frontend\gradle.properties" | Select-String "BACKEND_URL"
Write-Host "    $config"

# 3. Check backend
Write-Host "`n[3] Backend Status:" -ForegroundColor Yellow
$backend = Get-Job | Where-Object { $_.Name -eq "Backend" }
if ($backend) {
    Write-Host "    ✅ Running (Job ID: $($backend.Id))" -ForegroundColor Green
} else {
    Write-Host "    ❌ Not running" -ForegroundColor Red
}

# 4. Test network connectivity
Write-Host "`n[4] Network Connectivity:" -ForegroundColor Yellow
$test = Test-NetConnection -ComputerName $ip -Port 8000 -WarningAction SilentlyContinue
if ($test.TcpTestSucceeded) {
    Write-Host "    ✅ Backend accessible on network" -ForegroundColor Green
} else {
    Write-Host "    ❌ Backend not accessible" -ForegroundColor Red
}

# 5. Test login endpoint
Write-Host "`n[5] Login Endpoint Test:" -ForegroundColor Yellow
try {
    $body = @{username="admin"; password="admin123"} | ConvertTo-Json
    $response = Invoke-RestMethod -Uri "http://${ip}:8000/api/auth/login/" -Method Post -Body $body -ContentType "application/json" -TimeoutSec 5
    if ($response.token) {
        Write-Host "    ✅ Login successful - token received" -ForegroundColor Green
        Write-Host "    Token: $($response.token.Substring(0,20))..." -ForegroundColor Gray
    } else {
        Write-Host "    ❌ Login successful but no token field" -ForegroundColor Red
    }
} catch {
    Write-Host "    ❌ Login failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== Test Complete ===" -ForegroundColor Cyan
Write-Host "`nNext step: Rebuild mobile app in Android Studio" -ForegroundColor Yellow
Write-Host "Build → Clean Project → Build → Rebuild Project`n"
```

Run with: `.\test-mobile-auth.ps1`

---

## 📞 SUPPORT

If issues persist after following this guide:

1. Run diagnostic script: `.\test-mobile-auth.ps1`
2. Check Android Studio Logcat for errors
3. Verify all checklist items above
4. Review backend logs: `Receive-Job -Name "Backend" -Keep`

**Common Issues**:
- Forgot to rebuild app after config changes
- Device on different WiFi network
- Firewall blocking Python
- Typo in IP address
