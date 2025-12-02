# Installation Requirements Summary

Quick reference for all dependencies needed to run Too Good CRM on a new device.

## 📦 System Software Requirements

### Core Requirements (Must Have)

| Software | Version | Download | Purpose |
|----------|---------|----------|---------|
| **Python** | 3.8+ (3.10-3.11 recommended) | https://python.org/downloads | Backend API |
| **Node.js** | 18+ LTS | https://nodejs.org | Web Frontend |
| **Git** | Latest | https://git-scm.com | Version Control |
| **Android Studio** | Latest Stable | https://developer.android.com/studio | Mobile App (optional) |

### Optional Software

| Software | Purpose |
|----------|---------|
| PostgreSQL | Production database (default: SQLite) |
| VS Code | Code editor |
| Postman | API testing |

---

## 📚 Python Dependencies (112 packages)

**Install via:** `pip install -r requirements.txt`

### Core Framework
- Django==5.2.7
- djangorestframework==3.16.1
- djangorestframework_simplejwt==5.4.0
- channels==4.3.2
- daphne==4.2.1
- django-cors-headers==4.6.0
- django-filter==24.3

### Real-time & WebSocket
- pusher==3.3.3
- autobahn==25.10.2
- constantly==23.10.4

### Authentication & Security
- PyJWT==2.10.1
- cryptography==46.0.3
- Authlib==1.6.5
- pyOpenSSL==25.3.0
- PyNaCl==1.6.1

### AI Integration
- google-genai==1.52.0
- google-auth==2.43.0
- fastmcp==2.13.1
- django-mcp==0.3.1
- beartype==0.22.6

### HTTP & API
- requests==2.32.5
- httpx==0.28.1
- httpcore==1.0.9
- httpx-sse==0.4.3
- aiohttp==3.13.2
- aiohttp-retry==2.9.1
- certifi==2025.10.5

### Data Validation & Schemas
- pydantic==2.12.4
- pydantic-settings==2.11.0
- pydantic_core==2.41.5
- email-validator==2.3.0
- jsonschema==4.25.1
- jsonschema-path==0.3.4
- jsonschema-specifications==2025.9.1

### CLI & Documentation
- click==8.3.0
- cyclopts==4.2.4
- rich==14.2.0
- rich-rst==1.3.2
- docstring_parser==0.17.0
- docutils==0.22.3

### Utilities
- python-dotenv==1.2.1
- Pillow==12.0.0
- PyYAML==6.0.3
- pyperclip==1.11.0
- diskcache==5.6.3
- cachetools==6.2.2

### Storage & State
- py-key-value-aio==0.2.8
- py-key-value-shared==0.2.8
- keyring==25.7.0
- platformdirs==4.5.0

### Async & Networking
- asyncio libraries (aiohappyeyeballs, aiosignal, etc.)
- dnspython==2.8.0
- idna==3.11
- charset-normalizer==3.4.4

### Windows Support
- pywin32==311
- pywin32-ctypes==0.2.3
- colorama==0.4.6

**Total:** 112 packages automatically installed

---

## 🌐 Node.js Dependencies (375+ packages)

**Install via:** `npm install`

### Core Framework (Production)
```json
{
  "react": "19.1.1",
  "react-dom": "19.1.1",
  "react-router-dom": "7.9.5"
}
```

### UI Libraries
```json
{
  "@chakra-ui/react": "3.28.0",
  "@emotion/react": "11.14.0",
  "next-themes": "0.4.6",
  "react-icons": "5.5.0"
}
```

### Drag & Drop
```json
{
  "@dnd-kit/core": "6.3.1",
  "@dnd-kit/sortable": "10.0.0",
  "@dnd-kit/utilities": "3.2.2"
}
```

### State Management & Data Fetching
```json
{
  "@tanstack/react-query": "5.90.6",
  "@tanstack/react-query-persist-client": "5.90.12",
  "@tanstack/query-sync-storage-persister": "5.90.12",
  "axios": "1.13.1"
}
```

### Real-time & Video
```json
{
  "pusher-js": "8.4.0",
  "@jitsi/react-sdk": "1.4.4"
}
```

### Styling
```json
{
  "tailwindcss": "4.1.16",
  "@tailwindcss/vite": "4.1.16",
  "@tailwindcss/postcss": "4.1.16",
  "autoprefixer": "10.4.21",
  "postcss": "8.5.6"
}
```

### Build Tools
```json
{
  "vite": "7.1.7",
  "@vitejs/plugin-react": "5.0.4",
  "vite-tsconfig-paths": "5.1.4"
}
```

### TypeScript
```json
{
  "typescript": "5.9.3",
  "@types/react": "19.1.16",
  "@types/react-dom": "19.1.9",
  "@types/node": "24.6.0",
  "typescript-eslint": "8.45.0"
}
```

### Code Quality (Development)
```json
{
  "eslint": "9.36.0",
  "@eslint/js": "9.36.0",
  "eslint-plugin-react-hooks": "5.2.0",
  "eslint-plugin-react-refresh": "0.4.22",
  "globals": "16.4.0"
}
```

**Total:** 375+ packages (including dependencies)

---

## 📱 Android/Kotlin Dependencies

**Managed by:** Gradle (auto-downloads)

### Build Configuration
```kotlin
Gradle: 8.13.0
Kotlin: 2.0.21
Android Gradle Plugin: 8.13.0
Java: 11+
```

### Android SDK Requirements
```
Minimum SDK: 24 (Android 7.0)
Target SDK: 36 (Android 14)
Compile SDK: 36
```

### Core Libraries (build.gradle.kts)
```kotlin
// AndroidX Core
androidx.core:core-ktx:1.17.0
androidx.lifecycle:lifecycle-runtime-ktx:2.9.4
androidx.activity:activity-compose:1.11.0

// Compose UI
androidx.compose.bom:2024.09.00
androidx.compose.ui:ui
androidx.compose.ui:ui-graphics
androidx.compose.ui:ui-tooling-preview
androidx.compose.material3:material3
androidx.compose.material:material-icons-extended
androidx.navigation:navigation-compose:2.7.7

// Networking
com.squareup.retrofit2:retrofit:3.0.0
com.squareup.retrofit2:converter-gson:3.0.0
com.squareup.okhttp3:logging-interceptor:4.12.0

// Coroutines
org.jetbrains.kotlinx:kotlinx-coroutines-core:1.10.1
org.jetbrains.kotlinx:kotlinx-coroutines-android:1.10.1

// Real-time & Video
com.pusher:pusher-java-client:2.4.4
org.jitsi.react:jitsi-meet-sdk:9.2.2

// UI Utilities
com.google.accompanist:accompanist-swiperefresh:0.32.0
com.google.android.material:material:1.11.0

// Testing
junit:junit:4.13.2
androidx.test.ext:junit:1.3.0
androidx.test.espresso:espresso-core:3.7.0
```

**Total:** 40+ direct dependencies, 100+ transitive dependencies

---

## 🔧 Configuration Files Needed

### Must Create/Transfer

| File | Purpose | Create From |
|------|---------|-------------|
| `shared-backend/.env` | Backend config | `.env.example` |
| `web-frontend/.env` | Frontend config | `.env.example` |
| `app-frontend/local.properties` | Android SDK path | Auto-generated |

### Optional Transfer
- Database: `shared-backend/db.sqlite3`
- Media: `shared-backend/media/`
- IDE: `.vscode/`, `.idea/`

---

## ⏱️ Installation Time Estimates

| Component | Time | Notes |
|-----------|------|-------|
| Python dependencies | 5-10 min | Depends on internet speed |
| Node.js dependencies | 3-5 min | Can be faster with good cache |
| Android Gradle sync | 5-15 min | First time is slower |
| Database migrations | < 1 min | If starting fresh |
| Total setup time | 15-30 min | Plus download times |

---

## 💾 Disk Space Requirements

| Component | Space Required |
|-----------|----------------|
| Python venv | ~500 MB |
| node_modules | ~400 MB |
| Android Gradle cache | ~500 MB |
| Android SDK | ~3-5 GB |
| IDE (Android Studio) | ~1-2 GB |
| **Total** | ~6-8 GB (with Android) |
| **Web Only** | ~1 GB (without Android) |

---

## 🚀 Quick Start Command Reference

### Backend Setup
```bash
cd shared-backend
python -m venv venv
.\venv\Scripts\Activate.ps1  # Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend Setup
```bash
cd web-frontend
npm install
npm run dev
```

### Android Setup
```bash
cd app-frontend
# Open in Android Studio
# Gradle will auto-download dependencies
```

---

## 📋 Verification Commands

### Check Installed Versions
```bash
# Python
python --version

# Node.js
node --version
npm --version

# Git
git --version

# Android (in project)
cd app-frontend
gradlew --version
```

### Check Running Services
```bash
# Backend
curl http://localhost:8000/api/

# Frontend
curl http://localhost:5173/
```

---

## 🔗 Quick Links

| Resource | URL |
|----------|-----|
| Project Repo | https://github.com/cyanide10/too-good-crm |
| Python Downloads | https://python.org/downloads |
| Node.js Downloads | https://nodejs.org |
| Android Studio | https://developer.android.com/studio |
| Pusher Dashboard | https://pusher.com |
| 8x8 Video | https://8x8.vc |

---

## 📄 Related Documentation

- **PROJECT_TRANSFER_GUIDE.md** - Complete setup guide
- **MANUAL_TRANSFER_FILES.md** - Files to transfer manually
- **README.md** - Project overview
- **QUICK_START.md** - Quick start instructions

---

*Last Updated: November 30, 2025*
