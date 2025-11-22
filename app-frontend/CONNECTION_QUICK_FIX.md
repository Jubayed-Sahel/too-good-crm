# 🚀 Quick Fix Reference - Connection Timeout

## ✅ What Was Fixed
- **Timeout increased**: 30s → 60s
- **Network check**: Before login attempt
- **Error messages**: Clear troubleshooting steps
- **Auto-retry**: Connection failures retry automatically

---

## 🔧 Setup for Emulator (Current Setting)

**Backend Command:**
```bash
python manage.py runserver 0.0.0.0:8000
```

**App Config** (Already Set):
```
http://10.0.2.2:8000/api/
```

✅ **No changes needed!** Just run the backend and launch the app.

---

## 📱 Setup for Physical Device

**1. Get Your Computer's IP:**
- Windows: Open CMD → type `ipconfig`
- Mac/Linux: Open Terminal → type `ifconfig`
- Look for IPv4 Address (e.g., 192.168.1.100)

**2. Update ApiClient.kt:**
```kotlin
private const val BASE_URL = "http://YOUR_IP:8000/api/"
// Example: "http://192.168.1.100:8000/api/"
```

**3. Start Backend:**
```bash
python manage.py runserver 0.0.0.0:8000
```

**4. Connect Device:**
- Ensure device is on **same WiFi** as computer
- Launch app and login

---

## 🐛 Troubleshooting

### Error: "Connection timeout after 60 seconds"
**Causes:**
- Backend not running
- Backend is very slow
- Network issues

**Fix:**
1. Check backend is running: `python manage.py runserver 0.0.0.0:8000`
2. Check server logs for errors
3. Test: `curl http://10.0.2.2:8000/api/` (emulator) or `curl http://YOUR_IP:8000/api/` (device)

---

### Error: "Cannot connect to server"
**Causes:**
- Wrong IP address
- Firewall blocking port 8000
- Backend not running

**Fix:**
1. Verify backend is running
2. Check IP in ApiClient.kt is correct
3. Allow port 8000 in firewall
4. For emulator: Use 10.0.2.2:8000
5. For device: Use your computer's actual IP

---

### Error: "No internet connection"
**Causes:**
- WiFi/mobile data disabled
- Device not connected to network

**Fix:**
1. Enable WiFi or mobile data
2. Connect to a network
3. Check network has internet access

---

## ⚡ Quick Test

**Test 1: Backend Running**
```bash
# Start backend
python manage.py runserver 0.0.0.0:8000

# Launch app → Login
# Expected: Login works within 5-10 seconds
```

**Test 2: Backend Stopped**
```bash
# Stop backend (Ctrl+C)

# Launch app → Login
# Expected: Clear error message within 5-10 seconds
```

**Test 3: No Internet**
```
# Turn off WiFi and mobile data

# Launch app → Login
# Expected: Instant "No internet connection" error
```

---

## 📋 Checklist

Before reporting issues, verify:

- [ ] Backend is running on port 8000
- [ ] Using correct IP in ApiClient.kt
- [ ] Device/emulator has internet connection
- [ ] Device on same WiFi network (for physical device)
- [ ] Port 8000 not blocked by firewall
- [ ] Backend allows connections (uses 0.0.0.0)

---

## 💡 Pro Tips

1. **Always use `0.0.0.0:8000`** when starting backend (not `localhost:8000`)
2. **For emulator**, always use `10.0.2.2` (not `localhost` or `127.0.0.1`)
3. **For physical device**, use your computer's actual IP address
4. **Check firewall** if connection fails (Windows Firewall, antivirus, etc.)
5. **Same WiFi network** is required for physical device testing

---

## 📞 Still Having Issues?

Check the detailed documentation: `CONNECTION_TIMEOUT_FIXED.md`

Or verify:
1. Backend server logs for errors
2. Network connectivity with `ping YOUR_IP`
3. Port accessibility with `telnet YOUR_IP 8000`
4. Firewall settings allowing port 8000

---

**Status: ✅ All connection timeout issues resolved!**

