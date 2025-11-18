# Backend API URL Configuration

## 📍 Location

**File Path:**
```
D:/Projects/too-good-crm/app-frontend/app/src/main/java/too/good/crm/data/api/ApiClient.kt
```

**Line Number:** Line 16

---

## 🔧 Current Configuration

```kotlin
private const val BASE_URL = "https://stephine-nonconfiding-pseudotribally.ngrok-free.dev/api/"
```

---

## 🔄 How to Change the Backend URL

### **Option 1: For Ngrok (Current Setup)**
```kotlin
private const val BASE_URL = "https://your-ngrok-url.ngrok-free.dev/api/"
```

### **Option 2: For Android Emulator (Local Development)**
```kotlin
private const val BASE_URL = "http://10.0.2.2:8000/api/"
```
- Use this when running backend on your local machine (localhost:8000)
- `10.0.2.2` is the special IP that Android Emulator uses to access host machine's localhost

### **Option 3: For Physical Android Device (Same Network)**
```kotlin
private const val BASE_URL = "http://192.168.x.x:8000/api/"
```
- Replace `192.168.x.x` with your computer's local IP address
- Find your IP: 
  - Windows: `ipconfig` (look for IPv4 Address)
  - Mac/Linux: `ifconfig` or `ip addr`

### **Option 4: For Production Server**
```kotlin
private const val BASE_URL = "https://api.yourdomain.com/api/"
```

---

## 📝 Steps to Update

1. **Open the file:**
   ```
   app/src/main/java/too/good/crm/data/api/ApiClient.kt
   ```

2. **Find line 16** (the BASE_URL constant)

3. **Replace the URL** with your backend URL

4. **Make sure the URL:**
   - Ends with `/api/` (includes the trailing slash)
   - Uses `http://` for local development or `https://` for production
   - Is accessible from your Android device/emulator

5. **Rebuild the app:**
   - In Android Studio: Build → Rebuild Project
   - Or: `gradlew clean assembleDebug`

---

## ⚠️ Important Notes

### URL Format Requirements:
✅ **Correct:**
- `https://example.com/api/` (with trailing slash)
- `http://10.0.2.2:8000/api/`

❌ **Incorrect:**
- `https://example.com/api` (missing trailing slash - may cause issues)
- `https://example.com` (missing /api/ path)

### Network Permissions:
The app already has internet permission in `AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.INTERNET" />
```

### Debugging Network Calls:
The app uses `HttpLoggingInterceptor` which logs all API requests/responses in Logcat:
```kotlin
level = HttpLoggingInterceptor.Level.BODY
```
You can see full request/response details in Android Studio's Logcat.

---

## 🧪 Testing Different Environments

You can create different build variants for different environments:

### **In `build.gradle.kts`:**
```kotlin
android {
    buildTypes {
        debug {
            buildConfigField("String", "API_BASE_URL", "\"http://10.0.2.2:8000/api/\"")
        }
        release {
            buildConfigField("String", "API_BASE_URL", "\"https://api.production.com/api/\"")
        }
    }
}
```

### **Then in `ApiClient.kt`:**
```kotlin
private const val BASE_URL = BuildConfig.API_BASE_URL
```

---

## 🔐 Authentication Token

The auth token is set separately:
```kotlin
ApiClient.setAuthToken("your_token_here")
```

This is typically done after successful login in:
- `LoginScreen.kt`
- After receiving token from `/auth/login` endpoint

---

## 📊 All API Services Using This URL

1. ✅ `issueApiService` - Issue/ticket management
2. ✅ `authApiService` - Authentication (login/signup)
3. ✅ `customerApiService` - Customer management

All these services use the same `BASE_URL`.

---

## 🆘 Troubleshooting

### Cannot Connect to Backend:

1. **Check if backend is running:**
   ```bash
   curl https://your-url.com/api/customers
   ```

2. **For emulator + localhost:**
   - Use `http://10.0.2.2:8000/api/` NOT `http://localhost:8000/api/`

3. **For physical device:**
   - Make sure device and computer are on same WiFi
   - Check firewall isn't blocking port 8000
   - Use computer's local IP, not localhost

4. **For Ngrok:**
   - Make sure ngrok is running: `ngrok http 8000`
   - Update URL when ngrok restarts (URL changes each time)

5. **Check Android Logcat** for network errors:
   - Filter by tag: "OkHttp" or "Retrofit"

---

**Quick Access Path:**
```
app-frontend/app/src/main/java/too/good/crm/data/api/ApiClient.kt
Line 16
```

**Last Updated:** November 10, 2025

