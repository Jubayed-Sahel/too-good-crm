# Too Good CRM - Project Transfer Guide

This document provides complete instructions for setting up the Too Good CRM project on a new device.

## 📋 Table of Contents

1. [System Requirements](#system-requirements)
2. [Installation Steps](#installation-steps)
3. [Manual Configuration Files](#manual-configuration-files)
4. [Environment Variables](#environment-variables)
5. [Project Setup](#project-setup)
6. [Verification](#verification)

---

## 🖥️ System Requirements

### Required Software

#### Core Requirements
- **Python 3.8+** (Python 3.10 or 3.11 recommended)
  - Download: https://www.python.org/downloads/
  - Make sure to add Python to PATH during installation
  
- **Node.js 18+** (Latest LTS recommended)
  - Download: https://nodejs.org/
  - Includes npm package manager
  
- **Git**
  - Download: https://git-scm.com/downloads
  
#### For Android Development
- **Android Studio** (Latest stable version)
  - Download: https://developer.android.com/studio
  - Includes Android SDK, Gradle, and Android Emulator
  - Minimum SDK: API 24 (Android 7.0)
  - Target SDK: API 36

#### Optional Tools
- **PostgreSQL** (if using production database instead of SQLite)
- **VS Code** or your preferred IDE

### Operating System
- **Windows**: Windows 10/11 (PowerShell 5.1+)
- **macOS**: macOS 10.15+
- **Linux**: Ubuntu 20.04+ or equivalent

---

## 📦 Installation Steps

### 1. Clone Repository

```bash
git clone https://github.com/cyanide10/too-good-crm.git
cd too-good-crm
```

### 2. Backend Setup (Django)

#### Install Python Dependencies

```bash
cd shared-backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows PowerShell:
.\venv\Scripts\Activate.ps1
# Windows CMD:
.\venv\Scripts\activate.bat
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

#### Backend Python Packages (from requirements.txt)

The following packages will be installed automatically:

**Core Framework:**
- Django 5.2.7
- djangorestframework 3.16.1
- djangorestframework_simplejwt 5.4.0
- django-cors-headers 4.6.0
- django-filter 24.3
- channels 4.3.2
- daphne 4.2.1

**Real-time & WebSocket:**
- pusher 3.3.3
- autobahn 25.10.2

**Authentication & Security:**
- PyJWT 2.10.1
- cryptography 46.0.3
- Authlib 1.6.5

**AI Integration:**
- google-genai 1.52.0
- fastmcp 2.13.1
- django-mcp 0.3.1

**HTTP & API:**
- requests 2.32.5
- httpx 0.28.1
- aiohttp 3.13.2

**Data Validation:**
- pydantic 2.12.4
- pydantic-settings 2.11.0
- email-validator 2.3.0

**Utilities:**
- python-dotenv 1.2.1
- Pillow 12.0.0 (Image processing)
- PyYAML 6.0.3

**Windows-specific:**
- pywin32 311 (Windows only)

### 3. Web Frontend Setup (React + TypeScript)

```bash
cd web-frontend

# Install dependencies
npm install
```

#### Frontend npm Packages (from package.json)

**Core Framework:**
- react 19.1.1
- react-dom 19.1.1
- react-router-dom 7.9.5

**UI Libraries:**
- @chakra-ui/react 3.28.0
- @emotion/react 11.14.0
- next-themes 0.4.6
- react-icons 5.5.0

**Drag & Drop:**
- @dnd-kit/core 6.3.1
- @dnd-kit/sortable 10.0.0
- @dnd-kit/utilities 3.2.2

**State Management & API:**
- @tanstack/react-query 5.90.6
- @tanstack/react-query-persist-client 5.90.12
- @tanstack/query-sync-storage-persister 5.90.12
- axios 1.13.1

**Real-time Communication:**
- pusher-js 8.4.0
- @jitsi/react-sdk 1.4.4 (Video calling)

**Styling:**
- tailwindcss 4.1.16
- @tailwindcss/vite 4.1.16
- @tailwindcss/postcss 4.1.16
- autoprefixer 10.4.21
- postcss 8.5.6

**Build Tools:**
- vite 7.1.7
- @vitejs/plugin-react 5.0.4
- vite-tsconfig-paths 5.1.4

**TypeScript:**
- typescript ~5.9.3
- @types/react 19.1.16
- @types/react-dom 19.1.9
- @types/node 24.6.0
- typescript-eslint 8.45.0

**Code Quality:**
- eslint 9.36.0
- @eslint/js 9.36.0
- eslint-plugin-react-hooks 5.2.0
- eslint-plugin-react-refresh 0.4.22
- globals 16.4.0

### 4. Android App Setup (Kotlin)

#### Prerequisites
1. Install Android Studio
2. Install Android SDK (via Android Studio SDK Manager)
3. Install Java Development Kit (JDK) 11+ (included with Android Studio)

#### Setup Steps

```bash
cd app-frontend

# For Windows - make gradlew executable (not needed, already has .bat)
# For macOS/Linux - make gradlew executable:
chmod +x gradlew
```

#### Open in Android Studio
1. Open Android Studio
2. Select "Open Existing Project"
3. Navigate to `too-good-crm/app-frontend`
4. Wait for Gradle sync to complete
5. Click "Sync Project with Gradle Files" if needed

#### Android Dependencies (auto-managed by Gradle)

**Gradle Versions:**
- Gradle: 8.13.0
- Kotlin: 2.0.21
- Android Gradle Plugin: 8.13.0

**Core Libraries:**
- androidx.core:core-ktx: 1.17.0
- androidx.lifecycle:lifecycle-runtime-ktx: 2.9.4
- androidx.activity:activity-compose: 1.11.0

**Compose UI:**
- androidx.compose.bom: 2024.09.00
- androidx.compose.ui (all modules)
- androidx.compose.material3
- androidx.compose.material:material-icons-extended
- androidx.navigation:navigation-compose: 2.7.7

**Networking:**
- com.squareup.retrofit2:retrofit: 3.0.0
- com.squareup.retrofit2:converter-gson: 3.0.0
- com.squareup.okhttp3:logging-interceptor: 4.12.0

**Coroutines:**
- org.jetbrains.kotlinx:kotlinx-coroutines-core: 1.10.1
- org.jetbrains.kotlinx:kotlinx-coroutines-android: 1.10.1

**Real-time & Video:**
- com.pusher:pusher-java-client: 2.4.4
- org.jitsi.react:jitsi-meet-sdk: 9.2.2

**UI Utilities:**
- com.google.accompanist:accompanist-swiperefresh: 0.32.0
- com.google.android.material:material: 1.11.0

**Testing:**
- junit:junit: 4.13.2
- androidx.test.ext:junit: 1.3.0
- androidx.test.espresso:espresso-core: 3.7.0

---

## 📄 Manual Configuration Files

These files must be created manually or transferred from your existing setup:

### 1. Backend Environment File

**File:** `shared-backend/.env`

**Source:** Copy from `shared-backend/.env.example` and fill in your values

**Required if using:**
- 8x8/Jitsi video calling
- Pusher real-time features
- Linear project management integration
- Gemini AI features
- Telegram bot
- Production deployment

### 2. Web Frontend Environment File

**File:** `web-frontend/.env`

**Source:** Copy from `web-frontend/.env.example` and fill in your values

**Required for:**
- API connection configuration
- Pusher real-time features

### 3. Android Local Properties

**File:** `app-frontend/local.properties`

**Content Example:**
```properties
sdk.dir=C\:\\Users\\YourUsername\\AppData\\Local\\Android\\Sdk
```

**Note:** This file is auto-generated by Android Studio. Path should point to your Android SDK location.

### 4. Android Backend Configuration

**File:** `app-frontend/app/build.gradle.kts`

**What to update:** Backend URL (line ~27)
```kotlin
val backendUrl = "http://192.168.0.106:8000/api/"  // Update with your IP
```

**Also in:** `app-frontend/gradle.properties`
```properties
BACKEND_URL=http://10.0.2.2:8000/api/  # For emulator
# OR
BACKEND_URL=http://YOUR_IP:8000/api/    # For physical device
```

### 5. Database File (Optional)

**File:** `shared-backend/db.sqlite3`

**Options:**
- Transfer existing database (includes all data)
- OR start fresh and run migrations + seeding

### 6. MCP Configuration (Optional)

**File:** `mcp-config.json` (if you use AI assistants with MCP)

**Note:** This is specific to your development environment setup.

### 7. IDE Configuration (Optional)

**Directories:**
- `.vscode/` - VS Code settings
- `.idea/` - IntelliJ/Android Studio settings
- `app-frontend/.idea/` - Android Studio project settings

**Note:** These are development environment specific. Safe to regenerate.

---

## 🔐 Environment Variables

### Backend Environment Variables (`shared-backend/.env`)

```env
# ============================================
# 8x8 Video (Jitsi) Configuration
# ============================================
# Get credentials from: https://8x8.vc/dashboard
JITSI_8X8_APP_ID=your_8x8_app_id_here
JITSI_8X8_API_KEY=your_8x8_private_key_here
JITSI_8X8_KID=your_8x8_key_id_here
JITSI_SERVER=8x8.vc

# ============================================
# Pusher Real-time Configuration
# ============================================
# Get credentials from: https://pusher.com
PUSHER_APP_ID=your_pusher_app_id
PUSHER_KEY=your_pusher_key
PUSHER_SECRET=your_pusher_secret
PUSHER_CLUSTER=ap2

# ============================================
# Linear Project Management (Optional)
# ============================================
# Get API key from: https://linear.app/settings/api
LINEAR_API_KEY=your_linear_api_key
LINEAR_WEBHOOK_SECRET=your_webhook_secret
LINEAR_TEAM_ID=your_default_team_id

# ============================================
# Gemini AI Integration (Optional)
# ============================================
# Get API key from: https://makersuite.google.com/app/apikey
GEMINI_API_KEY=your_gemini_api_key

# ============================================
# Telegram Bot (Optional)
# ============================================
# Get bot token from: @BotFather on Telegram
TG_BOT_TOKEN=your_telegram_bot_token
TG_WEBHOOK_SECRET=your_webhook_secret

# ============================================
# Django Settings
# ============================================
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# ============================================
# Database (Optional - defaults to SQLite)
# ============================================
# Uncomment and configure for PostgreSQL:
# DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# ============================================
# CORS Settings (Optional)
# ============================================
CORS_EXTRA_ORIGINS=http://localhost:3000,http://localhost:5173

# ============================================
# MCP Server (Optional)
# ============================================
MCP_SERVER_TITLE=Too Good CRM MCP Server
MCP_SERVER_INSTRUCTIONS=A Django-based CRM MCP server
MCP_SERVER_VERSION=1.0.0
```

### Frontend Environment Variables (`web-frontend/.env`)

```env
# ============================================
# API Configuration
# ============================================
# Backend API base URL
VITE_API_BASE_URL=http://127.0.0.1:8000

# ============================================
# Pusher Configuration
# ============================================
# Must match backend Pusher settings
VITE_PUSHER_KEY=your_pusher_key_here
VITE_PUSHER_CLUSTER=ap2

# ============================================
# Development Settings
# ============================================
# Set to 'development' for verbose logging
VITE_APP_ENV=development
```

### Android Configuration

#### Option 1: Build Config (Recommended for dynamic IP)
**File:** `app-frontend/app/build.gradle.kts`

```kotlin
defaultConfig {
    // For Android Emulator:
    val backendUrl = "http://10.0.2.2:8000/api/"
    
    // For Physical Device (replace YOUR_IP):
    // val backendUrl = "http://192.168.1.100:8000/api/"
    
    // For Production:
    // val backendUrl = "https://api.yourdomain.com/api/"
    
    buildConfigField("String", "BACKEND_URL", "\"$backendUrl\"")
}
```

#### Option 2: Gradle Properties
**File:** `app-frontend/gradle.properties`

```properties
# For Android Emulator
BACKEND_URL=http://10.0.2.2:8000/api/

# For Physical Device (find your IP with: ipconfig or ifconfig)
# BACKEND_URL=http://YOUR_COMPUTER_IP:8000/api/

# For Production
# BACKEND_URL=https://api.yourdomain.com/api/
```

---

## 🚀 Project Setup

### 1. Database Setup

```bash
cd shared-backend

# Activate virtual environment first
.\venv\Scripts\Activate.ps1  # Windows PowerShell
# source venv/bin/activate     # macOS/Linux

# Run migrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser

# Seed database with sample data (optional)
python seed_database.py
```

### 2. Start Backend Server

```bash
cd shared-backend

# Activate virtual environment
.\venv\Scripts\Activate.ps1  # Windows PowerShell

# Start Django server
python manage.py runserver

# Or use the batch file (Windows)
start-server.bat
```

Backend will run at: `http://localhost:8000`

**API Documentation:** `http://localhost:8000/api/`

### 3. Start Web Frontend

```bash
cd web-frontend

# Start Vite dev server
npm run dev
```

Frontend will run at: `http://localhost:5173`

### 4. Run Android App

#### Using Android Emulator:
1. Open Android Studio
2. Open `app-frontend` folder
3. Wait for Gradle sync
4. Click "Run" or press Shift+F10
5. Select an emulator device

#### Using Physical Device:
1. Enable Developer Options on your Android device
2. Enable USB Debugging
3. Connect device via USB
4. Click "Run" in Android Studio
5. Select your physical device

**Important:** Update the backend URL in `app/build.gradle.kts` with your computer's IP address.

**Find Your IP:**
- Windows: `ipconfig` in PowerShell
- macOS/Linux: `ifconfig` in Terminal
- Or use the provided batch file: `find-my-ip.bat`

---

## ✅ Verification

### Backend Verification

```bash
# Check server is running
curl http://localhost:8000/api/

# Or visit in browser:
http://localhost:8000/api/
http://localhost:8000/admin/
```

### Frontend Verification

1. Open browser: `http://localhost:5173`
2. You should see the login page
3. Try logging in with test credentials

### Android Verification

1. App launches without crashes
2. Login screen appears
3. Can make API requests to backend

### Test Connectivity

**From Android Emulator:**
```bash
# Backend should be accessible at:
http://10.0.2.2:8000/api/
```

**From Physical Device:**
```bash
# Backend should be accessible at:
http://YOUR_COMPUTER_IP:8000/api/

# Both devices must be on the same Wi-Fi network
# Make sure Windows Firewall allows port 8000
```

**Check Mobile Connection:**
```bash
# Use provided script
check-mobile-connection.bat
```

---

## 🔧 Common Issues & Solutions

### Python Issues

**Issue:** `python` command not found
```bash
# Use python3 instead
python3 --version
python3 manage.py runserver
```

**Issue:** Virtual environment activation fails
```bash
# Windows PowerShell - may need to set execution policy
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Node/npm Issues

**Issue:** `npm install` fails
```bash
# Clear cache and retry
npm cache clean --force
npm install
```

**Issue:** Port 5173 already in use
```bash
# Kill process on port or use different port
npm run dev -- --port 3000
```

### Android Issues

**Issue:** Gradle sync fails
- Check internet connection
- Invalidate Caches: File → Invalidate Caches → Invalidate and Restart
- Update Gradle wrapper: `./gradlew wrapper --gradle-version 8.13`

**Issue:** Cannot connect to backend from Android
- Verify backend URL in `build.gradle.kts`
- Use `10.0.2.2` for emulator (not `localhost`)
- Use computer's IP for physical device
- Check firewall settings
- Ensure both devices on same network (physical device)

**Issue:** SDK not found
- Update `local.properties` with correct SDK path
- Or let Android Studio auto-detect: Tools → SDK Manager

---

## 📚 Additional Resources

### Documentation Files
- `README.md` - Main project overview
- `QUICK_START.md` - Quick setup guide
- `shared-backend/README.md` - Backend documentation
- `shared-backend/ENV_SETUP.md` - Environment setup details
- `TESTING_GUIDE.md` - Testing instructions
- Various feature guides (see root directory)

### External Documentation
- **Django:** https://docs.djangoproject.com/
- **Django REST Framework:** https://www.django-rest-framework.org/
- **React:** https://react.dev/
- **Vite:** https://vitejs.dev/
- **Android Development:** https://developer.android.com/
- **Jetpack Compose:** https://developer.android.com/jetpack/compose

---

## 📝 Checklist for New Device Setup

- [ ] Install Python 3.8+
- [ ] Install Node.js 18+
- [ ] Install Git
- [ ] Install Android Studio (if needed)
- [ ] Clone repository
- [ ] Create backend `.env` file
- [ ] Install Python dependencies
- [ ] Run Django migrations
- [ ] Create web frontend `.env` file
- [ ] Install npm dependencies
- [ ] Update Android backend URL (if needed)
- [ ] Sync Gradle dependencies (if needed)
- [ ] Test backend server
- [ ] Test web frontend
- [ ] Test Android app (if needed)
- [ ] Verify API connectivity

---

## 🎯 Minimal Setup (Backend + Web Only)

If you only need the web application without Android:

1. Install Python and Node.js
2. Clone repository
3. Setup backend (steps 1-2 in Installation)
4. Setup web frontend (step 3 in Installation)
5. Create minimal `.env` files (only API URLs needed)
6. Start servers and test

**You can skip:**
- Android Studio installation
- Android SDK setup
- Android app configuration
- Pusher (unless using real-time features)
- 8x8/Jitsi (unless using video calls)
- Optional integrations (Linear, Gemini, Telegram)

---

*Last Updated: November 30, 2025*
