# Run Android App - Simple Instructions

## Option 1: Using Android Studio (Recommended)

1. **Open Android Studio**
2. **File → Open** → Navigate to:
   ```
   C:\Users\User\Desktop\p\too-good-crm\app-frontend
   ```
3. **Wait for Gradle sync** to complete (bottom status bar)
4. **Click the Run button** (Green ▶ icon) in the toolbar
5. **Select target device:**
   - Emulator (if configured)
   - Connected physical device
6. App will build and install automatically

## Option 2: Command Line (Advanced)

Open Command Prompt:

```cmd
cd C:\Users\User\Desktop\p\too-good-crm\app-frontend
gradlew.bat assembleDebug
adb install app\build\outputs\apk\debug\app-debug.apk
```

## Option 3: Direct Install APK

If APK already built:

```cmd
adb install C:\Users\User\Desktop\p\too-good-crm\app-frontend\app\build\outputs\apk\debug\app-debug.apk
```

## Before Running: Start Backend

```cmd
cd C:\Users\User\Desktop\p\too-good-crm\shared-backend
python manage.py runserver 0.0.0.0:8000
```

## Test Credentials

### Customer Account
- Username: `testcustomer`
- Password: `password123`
- Mode: CLIENT (can raise issues)

### Vendor Account
- Username: `testvendor`
- Password: `password123`
- Mode: VENDOR (can track/update issues)

### Dual Role Account
- Username: `testboth`
- Password: `password123`
- Mode: BOTH (can switch between modes)

## What to Expect

1. **Login Screen** appears first
2. Enter credentials and click "Login"
3. Navigate to **Dashboard** (Vendor) or **Client Dashboard** (Customer)
4. Open menu (☰) and select "**Issues**"
5. **Customer sees:** Create button (+), list of their issues
6. **Vendor sees:** Filter options, list of all client issues

## Features to Test

### As Customer:
- [x] Create new issue (+ button)
- [x] View your issues
- [x] Open issue details
- [x] Add comments

### As Vendor:
- [x] View all client issues
- [x] Filter by status/priority
- [x] Update issue status
- [x] Update priority
- [x] Resolve issues

### As Both:
- [x] Switch modes (toggle in drawer)
- [x] Access both customer and vendor features

---

**That's it! Your app is ready to run!** 🎉

For detailed troubleshooting, see `QUICK_START_GUIDE.md`

