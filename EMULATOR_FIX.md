# Mobile App Emulator Configuration - FIXED

## ✅ ISSUE RESOLVED

### Problem
- Mobile app configured for physical device IP (`192.168.0.131`)
- Running on **Android Emulator** which requires special IP
- Connection timeout because wrong IP address

### Solution Applied
Updated `app-frontend/gradle.properties`:
```properties
# OLD (for physical device)
BACKEND_URL=http://192.168.0.131:8000/api/

# NEW (for emulator)
BACKEND_URL=http://10.0.2.2:8000/api/
```

## 🔑 Login Credentials

### User: sahel
**Username**: `sahel`
**Password**: `Sahel009@`

### User: admin  
**Username**: `admin`
**Password**: `admin123`

## 📱 How Android Emulator Networking Works

The Android emulator uses a special network setup:

```
Emulator View          Real Network
─────────────          ────────────
10.0.2.2        →      localhost (127.0.0.1) on host PC
10.0.2.3        →      Default gateway
10.0.2.4        →      DNS server
10.0.2.15       →      Emulator's own IP
```

**Key Point**: `10.0.2.2` in the emulator = `localhost` on your PC

## 🎯 Next Steps

### 1. Rebuild the Mobile App (REQUIRED)

The IP address is baked into the APK at build time, so you **MUST** rebuild:

**In Android Studio**:
```
1. Build → Clean Project
2. Build → Rebuild Project  
3. Run → Run 'app'
```

**Via Gradle**:
```bash
cd app-frontend
./gradlew clean
./gradlew assembleDebug
```

### 2. Test Login on Emulator

Launch the app and try:
- Username: `sahel`
- Password: `Sahel009@`

Or:
- Username: `admin`
- Password: `admin123`

Expected: Login in 1-2 seconds, navigate to dashboard

## 🔄 Switching Between Emulator and Physical Device

### For Emulator (Default Now)
```properties
BACKEND_URL=http://10.0.2.2:8000/api/
```

### For Physical Device on WiFi
```properties
# Use your PC's actual IP
BACKEND_URL=http://192.168.0.131:8000/api/
```

**After changing**: Always rebuild the app!

## ✅ Verification

Backend is properly configured:
- ✅ Running on `0.0.0.0:8000` (accessible from emulator)
- ✅ Login endpoint returns `token` field
- ✅ User "sahel" exists with password `Sahel009@`
- ✅ gradle.properties updated to `10.0.2.2`

## 🧪 Quick Test

Test from PC that backend is accessible:
```powershell
# Test with sahel
$body = @{username="sahel"; password="Sahel009@"} | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:8000/api/auth/login/" -Method Post -Body $body -ContentType "application/json"

# Should return token
```

## 📝 Summary

**Problem**: Emulator can't reach `192.168.0.131` (physical network IP)
**Solution**: Changed to `10.0.2.2` (emulator's host localhost)
**Action**: Rebuild app in Android Studio
**Login**: username=`sahel`, password=`Sahel009@`

After rebuild, login should work immediately! 🚀
