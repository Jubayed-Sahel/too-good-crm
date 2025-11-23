# 📱 Running the App on Your Physical Phone - Backend Setup Guide

## Quick Setup (3 Steps)

### Step 1: Find Your Computer's IP Address

**On Windows:**
1. Open Command Prompt (Win + R, type `cmd`, press Enter)
2. Type: `ipconfig`
3. Look for "IPv4 Address" under your active network adapter (usually WiFi or Ethernet)
4. Example: `192.168.1.100` or `192.168.0.106`

**On Mac:**
1. Open Terminal
2. Type: `ifconfig | grep "inet " | grep -v 127.0.0.1`
3. Use the IP address shown (usually starts with 192.168)

**On Linux:**
1. Open Terminal
2. Type: `ip addr show | grep "inet " | grep -v 127.0.0.1`
3. Use the IP address shown

### Step 2: Update the Backend URL in Your App

**File to Edit:**
```
D:\Projects\too-good-crm\app-frontend\app\src\main\java\too\good\crm\data\api\ApiClient.kt
```

**Line to Change:** Line 33

**Replace this:**
```kotlin
private const val BASE_URL = "http://192.168.0.106:8000/api/"
```

**With your computer's IP:**
```kotlin
private const val BASE_URL = "http://YOUR_IP_ADDRESS:8000/api/"
```

**Example:**
```kotlin
private const val BASE_URL = "http://192.168.1.100:8000/api/"
```

### Step 3: Ensure Your Phone and Computer Are Connected

**IMPORTANT:** Both devices must be on the **SAME WiFi network**!

- Phone: Connected to WiFi (e.g., "Home_WiFi")
- Computer: Connected to the SAME WiFi (e.g., "Home_WiFi")

---

## 🔥 Backend Server Requirements

### Make Sure Your Django Backend Is Running

1. **Start your Django backend:**
   ```bash
   cd D:\Projects\too-good-crm\backend
   python manage.py runserver 0.0.0.0:8000
   ```

2. **Important:** Use `0.0.0.0:8000` NOT `localhost:8000` or `127.0.0.1:8000`
   - `0.0.0.0` makes the server accessible from other devices on the network
   - `localhost` only works on the same machine

3. **Verify it's working:**
   - Open browser on your phone
   - Go to: `http://YOUR_IP_ADDRESS:8000/admin`
   - You should see the Django admin login page

### Configure Django ALLOWED_HOSTS

**File to Edit:**
```
D:\Projects\too-good-crm\backend\crm_project\settings.py
```

**Update ALLOWED_HOSTS:**
```python
ALLOWED_HOSTS = [
    'localhost',
    '127.0.0.1',
    '0.0.0.0',
    'YOUR_IP_ADDRESS',  # e.g., '192.168.1.100'
    '*',  # Allow all (for development only)
]
```

---

## 🚀 Build and Run on Phone

### Option A: USB Connection (Recommended)

1. **Enable Developer Options on your phone:**
   - Settings → About Phone → Tap "Build Number" 7 times
   
2. **Enable USB Debugging:**
   - Settings → Developer Options → USB Debugging (ON)

3. **Connect phone to computer via USB**

4. **Run in Android Studio:**
   ```
   Click the "Run" button (▶️) or press Shift+F10
   Select your physical device from the list
   ```

### Option B: Wireless Debugging (Android 11+)

1. **Enable Wireless Debugging:**
   - Settings → Developer Options → Wireless Debugging (ON)

2. **In Android Studio:**
   - View → Tool Windows → Device Manager
   - Click "Pair Devices Using Wi-Fi"
   - Follow the pairing instructions

3. **Run the app** once paired

---

## 🔍 Troubleshooting

### Issue: "Unable to resolve host" or "Connection refused"

**Solution 1: Check IP Address**
```bash
# On computer, run:
ipconfig    # Windows
ifconfig    # Mac/Linux

# Update ApiClient.kt with the correct IP
```

**Solution 2: Check Firewall**
- Windows: Allow Python/Django through Windows Firewall
- Settings → Windows Security → Firewall → Allow an app
- Add Python (python.exe) if not listed

**Solution 3: Verify Same Network**
- Phone and computer must be on the SAME WiFi
- Check WiFi name on both devices

**Solution 4: Test Backend Access**
- On your phone's browser, open: `http://YOUR_IP:8000/api/`
- If this doesn't work, the issue is with network/backend, not the app

### Issue: "Network Security Configuration" error

If you get a network security error, it's because Android blocks cleartext (HTTP) traffic by default.

**Already Fixed!** Your app should already have this configuration, but verify:

**File:** `app/src/main/res/xml/network_security_config.xml`
```xml
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <base-config cleartextTrafficPermitted="true">
        <trust-anchors>
            <certificates src="system" />
        </trust-anchors>
    </base-config>
</network-security-config>
```

### Issue: Django CORS errors

**File:** `backend/crm_project/settings.py`
```python
CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'http://192.168.0.106:8000',  # Your IP
]

# OR for development:
CORS_ALLOW_ALL_ORIGINS = True
```

---

## 📋 Quick Checklist

Before running on your phone, verify:

- [ ] Backend is running on `0.0.0.0:8000`
- [ ] You know your computer's IP address
- [ ] Updated `BASE_URL` in `ApiClient.kt` with your IP
- [ ] Phone and computer are on the same WiFi
- [ ] Django `ALLOWED_HOSTS` includes your IP
- [ ] Firewall allows connections on port 8000
- [ ] USB Debugging is enabled on phone (if using USB)
- [ ] Phone is connected and recognized by Android Studio

---

## 🎯 Summary

**The ONE file you need to edit:**
```
📁 D:\Projects\too-good-crm\app-frontend\app\src\main\java\too\good\crm\data\api\ApiClient.kt
📍 Line 33
🔧 Change: private const val BASE_URL = "http://YOUR_IP:8000/api/"
```

**Current value:** `http://192.168.0.106:8000/api/`

**What you need to do:**
1. Find your computer's IP address (ipconfig on Windows)
2. Replace `192.168.0.106` with your actual IP
3. Make sure your phone is on the same WiFi
4. Run Django with `python manage.py runserver 0.0.0.0:8000`
5. Build and run the app in Android Studio

That's it! 🎉

---

*Updated: November 23, 2025*

