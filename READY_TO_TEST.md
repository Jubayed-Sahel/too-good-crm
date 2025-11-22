# 🎉 Ready to Test on Physical Device!

## ✅ Configuration Complete

Your app is now configured for your **physical Android device** at:

```
PC IP Address: 192.168.0.106
Backend URL: http://192.168.0.106:8000/api/
```

---

## 📱 Installation Steps

### 1. Connect Your Phone

**Via USB:**
```powershell
# Check device is connected
adb devices

# Should show your device
```

**Via WiFi (if already set up):**
```powershell
# Your phone should be on same WiFi as PC
```

### 2. Install the App

```powershell
cd app-frontend
.\gradlew.bat installDebug
```

The app will be installed on your connected device.

**Alternative - Manual Install:**
```powershell
# Build APK
.\gradlew.bat assembleDebug

# APK location:
# app-frontend\app\build\outputs\apk\debug\app-debug.apk

# Copy to phone and install manually
```

---

## 🔐 Test Credentials

```
Username: testuser
Password: test123
```

---

## ⚠️ IMPORTANT: Firewall Configuration

**You need to allow port 8000 through Windows Firewall:**

### Option 1: Add Firewall Rule (Requires Admin)

Open **PowerShell as Administrator** and run:
```powershell
netsh advfirewall firewall add rule name="Django Dev Server - CRM" dir=in action=allow protocol=TCP localport=8000
```

### Option 2: Manual Configuration

1. Open **Windows Defender Firewall**
2. Click **Advanced settings**
3. Click **Inbound Rules** → **New Rule**
4. Select **Port** → Next
5. Select **TCP**, enter **8000** → Next
6. Select **Allow the connection** → Next
7. Check all profiles → Next
8. Name: "Django CRM Dev Server" → Finish

### Option 3: Test Without Firewall (Temporary)

To test if firewall is the issue:
1. Windows Security → Firewall & network protection
2. Turn off for Private networks (TEMPORARILY!)
3. Test the app
4. Turn firewall back ON!

---

## 🧪 Pre-Installation Test

**Test from your phone FIRST:**

1. **Open Chrome/Firefox on your phone**
2. **Make sure phone is on same WiFi as PC**
3. **Navigate to:** `http://192.168.0.106:8000/api/`

**Expected Results:**
- ✅ **Success:** You see Django REST API page → Ready to install app!
- ❌ **Timeout/Cannot connect:** Fix network/firewall first

---

## 🚀 Quick Start Guide

### Step-by-Step:

1. **Ensure Backend is Running:**
   ```powershell
   cd shared-backend
   python manage.py runserver 0.0.0.0:8000
   ```
   Leave this terminal open!

2. **Fix Firewall (if needed):**
   - Run PowerShell as Admin
   - Add firewall rule (see above)

3. **Test from Phone Browser:**
   - Open Chrome on phone
   - Visit: `http://192.168.0.106:8000/api/`
   - Should see API page ✅

4. **Install App:**
   ```powershell
   # In a NEW terminal
   cd app-frontend
   .\gradlew.bat installDebug
   ```

5. **Open App on Phone**

6. **Login:**
   - Username: `testuser`
   - Password: `test123`

7. **Success!** 🎉
   - Should see Dashboard with metrics
   - Swipe from left for navigation drawer

---

## 🐛 Troubleshooting

### Can't connect from phone browser?

**Check:**
1. ✅ Backend running on `0.0.0.0:8000` (not 127.0.0.1)
2. ✅ Phone on **same WiFi** as PC
3. ✅ Firewall allows port 8000
4. ✅ Using correct IP: `192.168.0.106`

**Test from PC first:**
```powershell
# This should work
curl http://192.168.0.106:8000/api/
```

### App installed but won't login?

**Check:**
1. Backend terminal - do you see login requests?
2. Check Logcat for errors:
   ```powershell
   adb logcat | Select-String "too.good.crm"
   ```

### IP Address Changed?

If your PC's IP changes later:

1. Find new IP:
   ```powershell
   ipconfig | findstr "IPv4"
   ```

2. Update:
   - `app-frontend/app/src/main/java/too/good/crm/data/api/ApiClient.kt`
   - Change BASE_URL to new IP
   - `app-frontend/app/src/main/res/xml/network_security_config.xml`
   - Add new IP to allowed domains

3. Rebuild:
   ```powershell
   cd app-frontend
   .\gradlew.bat installDebug
   ```

---

## 📋 Current Configuration

**Files Updated:**
- ✅ `ApiClient.kt` → BASE_URL = `http://192.168.0.106:8000/api/`
- ✅ `network_security_config.xml` → Allows `192.168.0.106`
- ✅ App built successfully

**Network Status:**
- ✅ Backend accessible at `http://192.168.0.106:8000/api/` (returns 401 = working!)
- ⚠️ Firewall rule needs admin privileges (do this manually)

**Test User:**
- ✅ Username: `testuser`
- ✅ Password: `test123`
- ✅ Has employee profile

---

## 💡 Pro Tip

**Keep these terminals open:**

**Terminal 1 - Backend:**
```powershell
cd shared-backend
python manage.py runserver 0.0.0.0:8000
```

**Terminal 2 - ADB Logcat (optional but helpful):**
```powershell
adb logcat | Select-String "too.good.crm|AndroidRuntime"
```

Watch for errors here if login fails!

---

## 🎯 You're Ready!

Everything is configured. Just:
1. Add firewall rule (needs admin)
2. Test from phone browser
3. Install app
4. Login!

Good luck! 🚀

---

**Need Help?** Check `PHYSICAL_DEVICE_SETUP.md` for detailed troubleshooting.

