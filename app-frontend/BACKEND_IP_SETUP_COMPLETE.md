# ✅ Backend IP Configuration - Complete Setup

## 🎯 What Was Done

I've set up an **easy configuration system** so you can change the backend IP address without touching any code files!

---

## 📍 Where to Set Your IP Address

**ONE FILE TO EDIT:**
```
D:\Projects\too-good-crm\app-frontend\gradle.properties
```

**ONE LINE TO CHANGE (at the bottom):**
```properties
BACKEND_URL=http://192.168.0.106:8000/api/
```

Change `192.168.0.106` to YOUR computer's IP address.

---

## 🚀 Quick Start (3 Steps)

### Step 1: Find Your IP
**Run this file (double-click):**
```
D:\Projects\too-good-crm\app-frontend\find-my-ip.bat
```
OR manually in CMD:
```bash
ipconfig
```
Look for "IPv4 Address" (e.g., `192.168.1.100`)

### Step 2: Edit gradle.properties
**File location:**
```
D:\Projects\too-good-crm\app-frontend\gradle.properties
```

**Change this line:**
```properties
BACKEND_URL=http://YOUR_IP_HERE:8000/api/
```

**Example:**
```properties
BACKEND_URL=http://192.168.1.100:8000/api/
```

### Step 3: Sync & Run
1. Click "Sync Now" in Android Studio
2. Connect your phone via USB
3. Click Run (▶️)

---

## 📚 Documentation Files Created

### Quick References
- **`QUICK_SETUP_PHONE.md`** - 2-minute setup guide ⚡
- **`PHONE_SETUP_VISUAL.md`** - Visual diagrams and flowcharts 📊
- **`PHONE_SETUP_GUIDE.md`** - Complete detailed guide 📖

### Tools
- **`find-my-ip.bat`** - Automatically finds your IP address 🔍

---

## 🔧 What Changed in Your Code

### 1. gradle.properties (NEW)
Added backend URL configuration:
```properties
BACKEND_URL=http://192.168.0.106:8000/api/
```

### 2. app/build.gradle.kts (UPDATED)
Added BuildConfig field to read from gradle.properties:
```kotlin
buildConfigField("String", "BACKEND_URL", "\"$backendUrl\"")
```

### 3. ApiClient.kt (UPDATED)
Changed from hardcoded URL to dynamic:
```kotlin
// BEFORE:
private const val BASE_URL = "http://192.168.0.106:8000/api/"

// AFTER:
private val BASE_URL = BuildConfig.BACKEND_URL
```

---

## 🎨 Benefits

✅ **No Code Changes** - Just edit gradle.properties
✅ **Easy to Update** - Change IP without touching Kotlin files
✅ **Clear Documentation** - Comments explain each option
✅ **Quick Reference** - Multiple guides for different needs
✅ **Automated Tool** - Batch file to find IP automatically

---

## 📱 Different Scenarios

### For Android Emulator
```properties
BACKEND_URL=http://10.0.2.2:8000/api/
```

### For Physical Phone (Same WiFi) ⭐ Most Common
```properties
BACKEND_URL=http://192.168.x.x:8000/api/
```
Replace `192.168.x.x` with your computer's IP

### For Production/Deployed Server
```properties
BACKEND_URL=https://api.yourdomain.com/api/
```

---

## ⚙️ Backend Server Setup

**IMPORTANT:** Start Django with `0.0.0.0:8000` (not `localhost:8000`)

```bash
cd D:\Projects\too-good-crm\backend
python manage.py runserver 0.0.0.0:8000
```

**Why 0.0.0.0?**
- Makes server accessible from other devices on network
- `localhost` or `127.0.0.1` only works on the same machine

---

## ✅ Pre-Flight Checklist

Before running on your phone:

- [ ] Found your computer's IP address (`ipconfig`)
- [ ] Updated `BACKEND_URL` in `gradle.properties`
- [ ] Backend running on `0.0.0.0:8000`
- [ ] Phone and PC on the **SAME WiFi network**
- [ ] USB Debugging enabled on phone
- [ ] Phone connected via USB
- [ ] Synced Gradle in Android Studio

---

## 🔍 Test Connection

**Before building the app**, test backend access:

1. Open browser on your phone
2. Go to: `http://YOUR_IP:8000/admin`
3. You should see Django admin login page

If this doesn't work, fix network/backend first before running the app.

---

## 🆘 Troubleshooting

### Connection Issues
1. Both devices on same WiFi? Check network name on both
2. Backend running? Check terminal/console
3. Using `0.0.0.0:8000`? Not `localhost:8000`
4. Firewall blocking? Allow Python on port 8000
5. Correct IP? Run `ipconfig` again to verify

### Build Issues
1. Sync Gradle after changing `gradle.properties`
2. Clean and rebuild if needed (Build → Clean Project)
3. Check for any compile errors in Android Studio

### Phone Detection Issues
1. USB Debugging enabled? Settings → Developer Options
2. USB cable working? Try different cable/port
3. Drivers installed? Android Studio should auto-install
4. Try wireless debugging (Android 11+)

---

## 📞 Need More Help?

**Quick Setup:**
→ See `QUICK_SETUP_PHONE.md`

**Visual Guide:**
→ See `PHONE_SETUP_VISUAL.md`

**Detailed Instructions:**
→ See `PHONE_SETUP_GUIDE.md`

**Find Your IP:**
→ Run `find-my-ip.bat`

---

## 🎉 You're All Set!

The configuration system is now in place. Just:
1. Edit `gradle.properties` whenever your IP changes
2. Sync Gradle
3. Run the app

No need to touch any Kotlin code files! 🚀

---

*Setup completed: November 23, 2025*

