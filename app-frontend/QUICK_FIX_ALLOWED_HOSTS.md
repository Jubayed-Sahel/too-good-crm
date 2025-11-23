# ⚡ Quick Fix: Django ALLOWED_HOSTS Error

## 🚨 Error
```
DisallowedHost: Invalid HTTP_HOST header: '192.168.0.218:8000'
```

---

## ✅ Solution (3 Steps)

### **Step 1: Edit Django settings.py**

Find and update `ALLOWED_HOSTS`:

```python
ALLOWED_HOSTS = [
    'localhost',
    '127.0.0.1',
    '192.168.0.218',  # ← Add your IP here
    '10.0.2.2',
]
```

### **Step 2: Restart Django Server**

```bash
# Stop server (Ctrl+C)
# Then restart:
python manage.py runserver 0.0.0.0:8000
```

⚠️ **Important:** Use `0.0.0.0:8000` not `127.0.0.1:8000`!

### **Step 3: Test**

```bash
curl http://192.168.0.218:8000/api/
```

Should return Django response without error.

---

## 📁 Where is settings.py?

Common locations:
```
backend/settings.py
config/settings.py
your_project_name/settings.py
```

Search for it:
```bash
# Windows
dir /s settings.py

# Linux/Mac
find . -name settings.py
```

---

## ⚙️ Common Mistakes

❌ **Including port in ALLOWED_HOSTS:**
```python
ALLOWED_HOSTS = ['192.168.0.218:8000']  # WRONG!
```

✅ **Correct - just IP/domain:**
```python
ALLOWED_HOSTS = ['192.168.0.218']  # CORRECT
```

❌ **Running on localhost:**
```bash
python manage.py runserver  # WRONG
```

✅ **Run on all interfaces:**
```bash
python manage.py runserver 0.0.0.0:8000  # CORRECT
```

---

## 🔄 If Your IP Changes

1. Find new IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
2. Update `settings.py` with new IP
3. Restart Django server
4. Update Android app files:
   - `ApiClient.kt` (line 17)
   - `network_security_config.xml` (line 10)
5. Rebuild and reinstall app

---

## 📋 Quick Checklist

- [ ] Found `settings.py` file
- [ ] Added `192.168.0.218` to `ALLOWED_HOSTS`
- [ ] Saved the file
- [ ] Restarted server with `0.0.0.0:8000`
- [ ] Tested with curl or browser
- [ ] Error is gone ✅

---

## 🆘 Still Getting Errors?

### **Also Add CORS (if needed):**

```bash
pip install django-cors-headers
```

```python
# settings.py
INSTALLED_APPS = [
    # ...
    'corsheaders',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # Add at top
    # ...
]

CORS_ALLOW_ALL_ORIGINS = True  # For development
```

Restart server again.

---

**For detailed guide, see:** `FIX_DJANGO_ALLOWED_HOSTS.md`

**Status: ✅ Ready to fix!**

