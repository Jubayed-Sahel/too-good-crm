# Fix: Django ALLOWED_HOSTS Error

## 🚨 Error Message

```
django.core.exceptions.DisallowedHost: Invalid HTTP_HOST header: '192.168.0.218:8000'. 
You may need to add '192.168.0.218' to ALLOWED_HOSTS.
```

---

## ✅ Solution

You need to add `192.168.0.218` to the `ALLOWED_HOSTS` list in your Django backend settings.

---

## 🔧 How to Fix

### **Step 1: Locate Django Settings File**

Your Django backend settings file is typically at:
```
too-good-crm/backend/settings.py
# or
too-good-crm/config/settings.py
# or
too-good-crm/your_project_name/settings.py
```

### **Step 2: Update ALLOWED_HOSTS**

Open the `settings.py` file and find the `ALLOWED_HOSTS` line.

**Current (causing error):**
```python
ALLOWED_HOSTS = []
# or
ALLOWED_HOSTS = ['localhost', '127.0.0.1']
```

**Fix - Add your IP:**
```python
ALLOWED_HOSTS = [
    'localhost',
    '127.0.0.1',
    '192.168.0.218',  # Your computer's IP for Android device access
    '10.0.2.2',       # For Android emulator
]
```

### **Step 3: Restart Django Server**

After saving the file, restart your Django development server:

```bash
# Stop the current server (Ctrl+C)

# Start it again
python manage.py runserver 0.0.0.0:8000
```

**Important:** Use `0.0.0.0:8000`, NOT `127.0.0.1:8000` or `localhost:8000`

---

## 📝 Complete Configuration Examples

### **For Development (Recommended)**

```python
# settings.py

DEBUG = True

ALLOWED_HOSTS = [
    'localhost',
    '127.0.0.1',
    '192.168.0.218',      # Your current IP
    '10.0.2.2',           # Android emulator
    '0.0.0.0',            # Allow all local network
    '192.168.*',          # Allow any 192.168.x.x (if IP changes frequently)
]
```

### **For Production**

```python
# settings.py or settings/production.py

DEBUG = False

ALLOWED_HOSTS = [
    'yourdomain.com',
    'www.yourdomain.com',
    'api.yourdomain.com',
]
```

### **Using Environment Variables (Best Practice)**

```python
# settings.py

import os

DEBUG = os.getenv('DEBUG', 'False') == 'True'

ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',')
```

Then create a `.env` file:
```env
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1,192.168.0.218,10.0.2.2
```

---

## 🎯 Quick Fix (Copy-Paste Ready)

**For immediate testing, add this to your `settings.py`:**

```python
# ALLOWED_HOSTS Configuration for Mobile App Development
ALLOWED_HOSTS = [
    'localhost',
    '127.0.0.1',
    '192.168.0.218',  # Your computer's IP - UPDATE if it changes
    '10.0.2.2',       # Android emulator
    '0.0.0.0',
]
```

---

## 🔄 If Your IP Changes

If your IP changes (e.g., you connect to different WiFi):

1. **Find your new IP:**
   ```cmd
   ipconfig
   ```
   Look for "IPv4 Address"

2. **Update settings.py:**
   ```python
   ALLOWED_HOSTS = [
       'localhost',
       '127.0.0.1',
       '192.168.0.XXX',  # <-- Update this with new IP
       '10.0.2.2',
   ]
   ```

3. **Restart Django server**

4. **Update Android app** (if needed):
   - Update `ApiClient.kt` with new IP
   - Update `network_security_config.xml` with new IP
   - Rebuild and reinstall app

---

## 🧪 Testing

### **Test 1: Check Django Server**
After updating ALLOWED_HOSTS and restarting, test with curl:

```bash
curl http://192.168.0.218:8000/api/
```

Should return Django/API response, not an error.

### **Test 2: Browser Test**
Open browser on your phone:
```
http://192.168.0.218:8000/api/
```

Should see API response or Django admin page.

### **Test 3: Android App**
- Open the Android app
- Try to login or load customers
- Check Logcat - should see successful API calls

---

## 🛡️ CORS Configuration (If Needed)

If you also get CORS errors after fixing ALLOWED_HOSTS, you may need to configure CORS:

### **Install django-cors-headers:**
```bash
pip install django-cors-headers
```

### **Update settings.py:**
```python
INSTALLED_APPS = [
    # ...existing apps...
    'corsheaders',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # Add at the top
    'django.middleware.common.CommonMiddleware',
    # ...other middleware...
]

# For development
CORS_ALLOW_ALL_ORIGINS = True

# Or for specific origins (production)
CORS_ALLOWED_ORIGINS = [
    "http://localhost:8000",
    "http://192.168.0.218:8000",
]
```

---

## 🔍 Common Mistakes

### ❌ **Mistake 1: Running server on localhost**
```bash
# WRONG
python manage.py runserver
python manage.py runserver 127.0.0.1:8000
```

```bash
# CORRECT
python manage.py runserver 0.0.0.0:8000
```

### ❌ **Mistake 2: Forgetting port in ALLOWED_HOSTS**
```python
# WRONG
ALLOWED_HOSTS = ['192.168.0.218:8000']  # Don't include port!

# CORRECT
ALLOWED_HOSTS = ['192.168.0.218']  # Just the IP/domain
```

### ❌ **Mistake 3: Not restarting Django after changes**
Always restart Django server after modifying `settings.py`!

---

## 📋 Complete Checklist

- [ ] Located `settings.py` in Django backend
- [ ] Added `192.168.0.218` to `ALLOWED_HOSTS`
- [ ] Saved the file
- [ ] Restarted Django server with `python manage.py runserver 0.0.0.0:8000`
- [ ] Tested with curl or browser
- [ ] Tested with Android app
- [ ] No more ALLOWED_HOSTS errors

---

## 🔧 Different Django Project Structures

### **Standard Django Project:**
```
too-good-crm/
├── backend/
│   ├── manage.py
│   ├── your_project/
│   │   ├── settings.py  ← Edit this file
│   │   ├── urls.py
│   │   └── wsgi.py
│   └── apps/
```

### **Django with Config Folder:**
```
too-good-crm/
├── backend/
│   ├── manage.py
│   ├── config/
│   │   ├── settings.py  ← Edit this file
│   │   └── urls.py
│   └── apps/
```

### **Django with Multiple Settings:**
```
too-good-crm/
├── backend/
│   ├── manage.py
│   ├── config/
│   │   └── settings/
│   │       ├── base.py
│   │       ├── development.py  ← Edit this file for dev
│   │       └── production.py
│   └── apps/
```

---

## 🚀 Alternative: Use Wildcard for Development

If your IP changes frequently, use a wildcard pattern:

```python
import socket

# Get current IP automatically
hostname = socket.gethostname()
local_ip = socket.gethostbyname(hostname)

ALLOWED_HOSTS = [
    'localhost',
    '127.0.0.1',
    local_ip,  # Automatically use current IP
    '10.0.2.2',
    '*',  # WARNING: Only use in development!
]
```

⚠️ **Warning:** Never use `'*'` in production!

---

## 📊 Summary

| Issue | Solution | Action |
|-------|----------|--------|
| Invalid HTTP_HOST error | Add IP to ALLOWED_HOSTS | Edit settings.py |
| Server not accessible | Use 0.0.0.0:8000 | Restart with correct host |
| IP changed | Update ALLOWED_HOSTS | Add new IP to list |
| Still getting errors | Check CORS | Install django-cors-headers |

---

## 🆘 If Still Not Working

### **Check 1: Firewall**
Make sure Windows Firewall allows port 8000:
```
Control Panel → Windows Defender Firewall → Advanced Settings → Inbound Rules
```

### **Check 2: Django Version**
Ensure you're using a compatible Django version:
```bash
pip show django
```

### **Check 3: Virtual Environment**
Make sure you're in the correct virtual environment:
```bash
# Activate virtual environment first
venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac

# Then run server
python manage.py runserver 0.0.0.0:8000
```

### **Check 4: Django Logs**
Check Django console output for other errors.

### **Check 5: Settings File Being Used**
Print ALLOWED_HOSTS to verify changes are loaded:
```python
# Add to settings.py temporarily
print("ALLOWED_HOSTS:", ALLOWED_HOSTS)
```

---

## 📝 Example Complete settings.py Snippet

```python
# settings.py

import os
from pathlib import Path

# Build paths inside the project
BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'your-secret-key-here'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

# ALLOWED_HOSTS Configuration
ALLOWED_HOSTS = [
    'localhost',
    '127.0.0.1',
    '192.168.0.218',  # Your computer's IP for Android device
    '10.0.2.2',       # Android emulator
    '0.0.0.0',        # Listen on all network interfaces
]

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',  # If using DRF
    'corsheaders',     # If using CORS
    # Your apps...
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # CORS (if needed)
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# CORS Configuration (if needed)
CORS_ALLOW_ALL_ORIGINS = True  # For development only

# Rest of your settings...
```

---

**Status: ✅ SOLUTION PROVIDED**

Update your Django backend's `settings.py` file with the `ALLOWED_HOSTS` configuration above, restart the server, and the error will be resolved!

**Last Updated:** November 10, 2025

