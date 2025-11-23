# ✅ Simple Answer: Yes, Just Edit build.gradle.kts!

## 🎯 Quick Answer

**YES!** You can set the IP address directly in the `build.gradle.kts` file and it will work perfectly.

---

## 📍 Where to Change It

**File:** `d:\Projects\too-good-crm\app-frontend\app\build.gradle.kts`

**Line to edit:** Around line 33 (look for this)

```kotlin
// ⬇️ EDIT THIS LINE WITH YOUR IP ADDRESS ⬇️
val backendUrl = "http://192.168.0.106:8000/api/"
                  ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ 
                  CHANGE THIS TO YOUR IP
```

---

## 🚀 How to Use It

### Step 1: Find Your IP Address
```bash
# Windows
ipconfig

# Mac/Linux  
ifconfig
```

### Step 2: Edit the Line in build.gradle.kts

**For Android Emulator:**
```kotlin
val backendUrl = "http://10.0.2.2:8000/api/"
```

**For Physical Phone (YOUR SCENARIO):**
```kotlin
val backendUrl = "http://192.168.1.100:8000/api/"
                  ^^^^^^^^^^^^^^^^ Use your actual IP
```

**For Production:**
```kotlin
val backendUrl = "https://api.yourdomain.com/api/"
```

### Step 3: Sync Gradle
- Click "Sync Now" banner in Android Studio
- Or: File → Sync Project with Gradle Files

### Step 4: Run the App
- Connect phone via USB
- Click Run (▶️)
- Done!

---

## 💡 Two Ways to Configure (You Choose)

### Option A: Direct in build.gradle.kts ⭐ (SIMPLER)
**Pros:**
- ✅ Everything in one place
- ✅ Clear comments showing what to change
- ✅ No need to look at multiple files

**Cons:**
- ⚠️ Need to sync Gradle after changes

**How:**
Just edit line 33 in `app/build.gradle.kts` and sync.

---

### Option B: Using gradle.properties (OPTIONAL)
**Pros:**
- ✅ Cleaner separation of config from build logic
- ✅ Can be different per machine (git-ignored)

**Cons:**
- ⚠️ Need to edit two files to understand setup

**How:**
1. Edit `gradle.properties`: Add `BACKEND_URL=http://YOUR_IP:8000/api/`
2. The build.gradle.kts will read from there automatically

---

## ✅ I've Simplified It For You

I've already updated your `build.gradle.kts` to make it **super clear** where to change the IP:

```kotlin
// ⚠️ Backend URL Configuration - CHANGE YOUR IP HERE ⚠️
// Option 1: For Android Emulator - use: "http://10.0.2.2:8000/api/"
// Option 2: For Physical Phone - use: "http://YOUR_IP:8000/api/"
// Option 3: For Production - use: "https://api.yourdomain.com/api/"
//
// To find your computer's IP:
//   Windows: Open CMD and type: ipconfig (look for IPv4 Address)
//   Mac/Linux: Open Terminal and type: ifconfig
//
// ⬇️ EDIT THIS LINE WITH YOUR IP ADDRESS ⬇️
val backendUrl = "http://192.168.0.106:8000/api/"
buildConfigField("String", "BACKEND_URL", "\"$backendUrl\"")
```

---

## 🎯 Bottom Line

**YES!** Just change this one line in `build.gradle.kts`:

```kotlin
val backendUrl = "http://YOUR_IP:8000/api/"
```

Then **Sync Gradle** and **Run**. That's it! 🚀

---

**Current IP:** `192.168.0.106`
**Your file:** `app/build.gradle.kts` (line ~33)
**Action:** Change IP → Sync Gradle → Run App

---

*Updated: November 23, 2025*

