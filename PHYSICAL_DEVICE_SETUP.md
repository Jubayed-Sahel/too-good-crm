# 📱 Physical Device Setup Guide

## ✅ Configuration Updated!

Your app is now configured to connect to your PC at **192.168.0.106:8000**

---

## 🔧 Setup Checklist

### 1. ✅ App Configuration (Already Done!)
- ✅ Base URL: `http://192.168.0.106:8000/api/`
- ✅ Network security config updated
- ✅ Cleartext HTTP traffic allowed for your PC's IP

### 2. 📶 Network Setup (CRITICAL!)

**Both your PC and phone MUST be on the SAME WiFi network!**

**On Your Phone:**
1. Open **Settings** → **WiFi**
2. Make sure you're connected to the **same WiFi** as your PC
3. Note: Mobile data should be **OFF** during testing

**Verify Network:**
- Your PC is on WiFi network: *[Check your WiFi name]*
- Your phone must be on: *[Same WiFi name]*

### 3. 🔥 Firewall Configuration

Your PC needs to allow incoming connections on port 8000.

**Windows Firewall:**

```powershell
# Option 1: Allow Python through firewall (Recommended)
netsh advfirewall firewall add rule name="Django Dev Server" dir=in action=allow protocol=TCP localport=8000

# Option 2: Temporarily disable firewall (NOT recommended for production)
# Control Panel → Windows Defender Firewall → Turn off
```

**Alternative - Check if port is accessible:**
```powershell
# On your PC, check if port is listening
netstat -an | findstr :8000
```

### 4. ✅ Backend Server

Make sure your Django backend is running on **0.0.0.0:8000** (not 127.0.0.1):

```powershell
cd shared-backend
python manage.py runserver 0.0.0.0:8000
```

**Important:** Must use `0.0.0.0` to accept connections from other devices!

### 5. 🧪 Test Connection

**From your phone's browser:**
1. Open Chrome/Firefox on your phone
2. Navigate to: `http://192.168.0.106:8000/api/`
3. You should see the Django REST API page

**If you see the API page:** ✅ Connection works!  
**If timeout/cannot connect:** ❌ Network or firewall issue

---

## 🔧 Troubleshooting

### Issue: "Cannot connect to server"

**Causes:**
- ❌ Phone and PC on different WiFi networks
- ❌ Firewall blocking port 8000
- ❌ Backend not running on 0.0.0.0
- ❌ Wrong IP address

**Solutions:**

1. **Verify Same Network:**
   ```
   PC WiFi: [Check in Windows WiFi settings]
   Phone WiFi: [Check in phone WiFi settings]
   → Must match!
   ```

2. **Test Backend from PC Browser:**
   - Open: `http://192.168.0.106:8000/api/`
   - Should show API page
   - If not, backend isn't accessible even locally

3. **Test from Phone Browser:**
   - Open: `http://192.168.0.106:8000/api/`
   - If timeout → Network/firewall issue
   - If works → App configuration issue

4. **Check Firewall:**
   ```powershell
   # Add firewall rule
   netsh advfirewall firewall add rule name="Django Dev Server" dir=in action=allow protocol=TCP localport=8000
   ```

5. **Verify Backend is listening on all interfaces:**
   ```powershell
   # Check if backend is running
   netstat -an | findstr :8000
   
   # Should show:
   # TCP    0.0.0.0:8000    0.0.0.0:0    LISTENING
   # NOT: TCP    127.0.0.1:8000    ...
   ```

### Issue: "IP Address Changed"

If your PC's IP changes (DHCP):

1. **Find new IP:**
   ```powershell
   ipconfig | findstr "IPv4"
   ```

2. **Update files:**
   - `ApiClient.kt` → Change BASE_URL
   - `network_security_config.xml` → Add new IP

3. **Rebuild app:**
   ```powershell
   cd app-frontend
   .\gradlew.bat installDebug
   ```

### Issue: "Still can't connect"

**Try these in order:**

1. **Restart backend with verbose logging:**
   ```powershell
   cd shared-backend
   python manage.py runserver 0.0.0.0:8000 --verbosity 3
   ```

2. **Check if backend receives requests:**
   - Try login from app
   - Watch terminal for incoming requests
   - Should see: `"GET /api/... HTTP/1.1" 200`

3. **Test with ngrok (alternative):**
   ```powershell
   # Install ngrok: https://ngrok.com/download
   ngrok http 8000
   
   # Copy the HTTPS URL (e.g., https://abc123.ngrok-free.app)
   # Update ApiClient.kt BASE_URL to: "https://abc123.ngrok-free.app/api/"
   ```

---

## 📱 Building and Installing

Now that configuration is updated:

```powershell
# Navigate to app-frontend
cd app-frontend

# Clean build
.\gradlew.bat clean

# Build and install on connected device
.\gradlew.bat installDebug

# Or just build APK
.\gradlew.bat assembleDebug
# APK location: app/build/outputs/apk/debug/app-debug.apk
```

---

## 🔐 Login Credentials

```
Username: testuser
Password: test123
```

---

## 📋 Pre-Flight Checklist

Before trying to login:

- [ ] Backend running: `python manage.py runserver 0.0.0.0:8000`
- [ ] Backend accessible from PC browser: `http://192.168.0.106:8000/api/`
- [ ] Phone on same WiFi as PC
- [ ] Firewall allows port 8000
- [ ] Phone browser can access: `http://192.168.0.106:8000/api/`
- [ ] App rebuilt with new configuration
- [ ] App installed on phone

If ALL boxes checked ✅ → Login should work!

---

## 🎯 Quick Test Sequence

1. **Start Backend:**
   ```powershell
   cd shared-backend
   python manage.py runserver 0.0.0.0:8000
   ```

2. **Test from PC Browser:**
   - Visit: `http://192.168.0.106:8000/api/`
   - Should see API page ✅

3. **Test from Phone Browser:**
   - Visit: `http://192.168.0.106:8000/api/`
   - Should see same API page ✅

4. **Build & Install App:**
   ```powershell
   cd app-frontend
   .\gradlew.bat installDebug
   ```

5. **Login:**
   - Open app on phone
   - Username: `testuser`
   - Password: `test123`
   - Should navigate to Dashboard! 🎉

---

## 💡 Pro Tips

1. **Set Static IP:** To avoid IP changes, set a static IP for your PC in router settings

2. **Keep WiFi Stable:** Don't switch WiFi networks during development

3. **USB Debugging:** Make sure USB debugging is enabled on your phone for `adb` commands

4. **Check Android Studio Logcat:** If login fails, check logcat for detailed error messages

5. **Backend Logs:** Watch the Django terminal for incoming requests

---

## 📞 Still Having Issues?

If you're still having trouble, share:
1. Phone browser test result (can you access `http://192.168.0.106:8000/api/`?)
2. Backend terminal logs when you try to login
3. Android Logcat output (filter: `too.good.crm`)
4. Exact error message in the app

Good luck! 🚀

