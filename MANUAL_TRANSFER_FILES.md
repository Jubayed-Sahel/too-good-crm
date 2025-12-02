# Files to Transfer Manually

This document lists all files that need to be manually transferred or configured when moving the project to a new device.

## 🔐 Critical Configuration Files (MUST TRANSFER)

These files contain sensitive credentials and must be manually created or transferred:

### 1. Backend Environment File
```
📁 shared-backend/.env
```
**Contains:**
- API keys (8x8/Jitsi, Pusher, Linear, Gemini)
- Bot tokens (Telegram)
- Secret keys
- Database credentials (if using PostgreSQL)
- CORS settings

**Action:** Copy from old device or create from `.env.example`

---

### 2. Web Frontend Environment File
```
📁 web-frontend/.env
```
**Contains:**
- Backend API URL
- Pusher configuration
- Development settings

**Action:** Copy from old device or create from `.env.example`

---

### 3. Android Local Properties
```
📁 app-frontend/local.properties
```
**Contains:**
- Android SDK path
- Local build configuration

**Action:** Let Android Studio auto-generate OR copy and update SDK path

---

## 📊 Data Files (OPTIONAL - Transfer if you want existing data)

### 4. SQLite Database
```
📁 shared-backend/db.sqlite3
```
**Contains:**
- All user data
- Organizations
- Customers, Leads, Deals
- Messages and activity history

**Options:**
- **Transfer:** Copy file to keep all existing data
- **Fresh Start:** Delete and run migrations + seed scripts

**File Size:** Check size before transferring (can be large with logs)

---

### 5. Database Journal (if exists)
```
📁 shared-backend/db.sqlite3-journal
```
**Note:** Temporary file, usually not needed to transfer

---

### 6. Media/Upload Files (if any)
```
📁 shared-backend/media/
```
**Contains:**
- User uploaded files
- Profile pictures
- Attachments

**Action:** Transfer entire `media/` directory if it exists

---

## 🔧 Build Configuration Files (UPDATE, Don't Just Copy)

### 7. Android Backend URL Configuration
```
📁 app-frontend/app/build.gradle.kts
```
**Line ~27:** Update backend URL
```kotlin
val backendUrl = "http://YOUR_NEW_IP:8000/api/"
```

**Action:** Copy file but MUST update IP address for new device

---

### 8. Android Gradle Properties
```
📁 app-frontend/gradle.properties
```
**Contains:**
- Backend URL setting
- Gradle JVM args

**Action:** Copy but update `BACKEND_URL` if needed

---

## 🔑 Credential Reference Files (Nice to Have)

### 9. User Lists (if you exported)
```
📁 shared-backend/users_list.json
📁 shared-backend/users_list.txt
```
**Contains:**
- Test user credentials
- Admin accounts

**Action:** Transfer if you want to remember test credentials

---

## 🤖 MCP Configuration (Optional - AI Assistant Integration)

### 10. MCP Config
```
📁 mcp-config.json
```
**Contains:**
- Model Context Protocol settings
- AI assistant configurations

**Action:** Copy if you use AI assistants (Claude, etc.)

---

## 💻 IDE Configuration (Optional - Development Environment)

### 11. VS Code Settings
```
📁 .vscode/
   ├── settings.json
   ├── launch.json
   └── tasks.json
```
**Action:** Copy if you want same IDE settings

---

### 12. IntelliJ/PyCharm Settings
```
📁 .idea/
```
**Action:** Can copy, but usually safe to regenerate

---

### 13. Android Studio Settings
```
📁 app-frontend/.idea/
```
**Action:** Let Android Studio regenerate

---

## 📝 Custom Scripts (if you created any)

### 14. Custom Utility Scripts
```
📁 shared-backend/*.py (custom scripts)
📁 *.bat (Windows batch files)
📁 *.ps1 (PowerShell scripts)
```
**Action:** Copy any custom scripts you created

---

## 🚫 Files to NEVER Transfer

These are auto-generated and should NOT be transferred:

```
❌ .venv/                          # Python virtual environment
❌ venv/                           # Python virtual environment  
❌ node_modules/                   # npm packages
❌ shared-backend/__pycache__/     # Python cache
❌ app-frontend/.gradle/           # Gradle cache
❌ app-frontend/build/             # Android build output
❌ app-frontend/app/build/         # Android app build output
❌ web-frontend/dist/              # Frontend build output
❌ web-frontend/build/             # Frontend build output
❌ .git/                           # Git repository (use git clone)
❌ *.pyc                           # Python compiled files
❌ *.log                           # Log files
❌ logs/                           # Log directory
```

**Reason:** These are recreated during setup and can cause conflicts

---

## ✅ Transfer Checklist

Use this checklist when moving to a new device:

### Critical (Required)
- [ ] **shared-backend/.env** - Backend environment variables
- [ ] **web-frontend/.env** - Frontend environment variables
- [ ] **Update Android backend URL** in build.gradle.kts

### Data (Optional - if you want existing data)
- [ ] **shared-backend/db.sqlite3** - Database file
- [ ] **shared-backend/media/** - Uploaded files (if exists)
- [ ] **shared-backend/users_list.json** - Test credentials reference

### Configuration (Optional - for convenience)
- [ ] **app-frontend/gradle.properties** - Android Gradle config (update URL)
- [ ] **mcp-config.json** - MCP settings (if using AI assistants)
- [ ] **.vscode/** - VS Code settings (if desired)

### Do NOT Transfer
- [ ] ❌ Virtual environments (.venv, venv, env)
- [ ] ❌ node_modules
- [ ] ❌ Python cache (__pycache__, *.pyc)
- [ ] ❌ Build outputs (build/, dist/, .gradle/)

---

## 📋 Quick Transfer Commands

### Minimal Transfer (Just Configs)
```bash
# On OLD device - Create a transfer folder
mkdir transfer
copy shared-backend\.env transfer\backend.env
copy web-frontend\.env transfer\frontend.env

# Transfer the 'transfer' folder to new device

# On NEW device - Copy configs back
copy transfer\backend.env shared-backend\.env
copy transfer\frontend.env web-frontend\.env
```

### Full Transfer (Configs + Data)
```bash
# On OLD device
mkdir transfer
copy shared-backend\.env transfer\backend.env
copy web-frontend\.env transfer\frontend.env
copy shared-backend\db.sqlite3 transfer\
xcopy shared-backend\media transfer\media\ /E /I

# Transfer the 'transfer' folder to new device

# On NEW device
copy transfer\backend.env shared-backend\.env
copy transfer\frontend.env web-frontend\.env
copy transfer\db.sqlite3 shared-backend\
xcopy transfer\media shared-backend\media\ /E /I
```

### Using Git (Recommended)
```bash
# On OLD device
# Commit any important work
git add .
git commit -m "Save work before transfer"
git push origin main

# On NEW device
git clone https://github.com/cyanide10/too-good-crm.git
cd too-good-crm

# Then manually copy .env files from transfer folder
# (Never commit .env files to git!)
```

---

## 🔍 How to Find Your Files

### Backend .env file location:
```
Windows: D:\Projects\too-good-crm\shared-backend\.env
macOS/Linux: ~/Projects/too-good-crm/shared-backend/.env
```

### Frontend .env file location:
```
Windows: D:\Projects\too-good-crm\web-frontend\.env
macOS/Linux: ~/Projects/too-good-crm/web-frontend/.env
```

### Database file location:
```
Windows: D:\Projects\too-good-crm\shared-backend\db.sqlite3
macOS/Linux: ~/Projects/too-good-crm/shared-backend/db.sqlite3
```

---

## 💡 Tips

1. **Use a password manager** or secure notes to store API keys/tokens
2. **Don't email .env files** - use secure file transfer or USB
3. **Update IP addresses** in Android configs for new network
4. **Test each component** after transfer to ensure everything works
5. **Keep a backup** of your .env files in a secure location
6. **Document custom changes** you made to any config files

---

## 🆘 Troubleshooting

### "Can't find .env file"
- .env files are hidden by default
- Windows: Enable "Show hidden files" in File Explorer
- macOS: Press Cmd+Shift+. in Finder
- Or use command line: `ls -la` (macOS/Linux) or `dir /a` (Windows)

### "Backend won't start - missing SECRET_KEY"
- You need to create the .env file
- Copy from .env.example
- Generate a new SECRET_KEY if needed

### "Android can't connect to backend"
- Update the IP address in build.gradle.kts
- Make sure backend is running
- Check firewall settings
- Verify both devices on same network (for physical device)

---

## 📞 Need Help?

Refer to:
- `PROJECT_TRANSFER_GUIDE.md` - Complete setup instructions
- `README.md` - Project overview
- `QUICK_START.md` - Quick setup guide
- `.env.example` files - Template for environment variables

---

*Last Updated: November 30, 2025*
