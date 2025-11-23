# Fix: Unable to Resolve Host 192.168.x.x Error

## ✅ Issue Resolved

**Error:** `Unable to resolve host "192.168.x.x": No address associated with hostname`

**Cause:** The BASE_URL was set to a placeholder IP address (`192.168.x.x`) instead of an actual IP address.

---

## 🔧 Fix Applied

Changed `ApiClient.kt` to use the emulator-compatible IP by default:

```kotlin
private const val BASE_URL = "http://10.0.2.2:8000/api/"
```

**This works for:** Android Emulator connecting to your local backend

---

## 📱 If You're Using a Physical Device

You need to use your computer's actual IP address. Here's how:

### **Step 1: Find Your Computer's IP Address**

#### **On Windows:**
1. Open **Command Prompt** (CMD)
2. Type: `ipconfig`
3. Look for **"IPv4 Address"** under your active network adapter
4. Example: `192.168.1.100`

```cmd
C:\> ipconfig

Wireless LAN adapter Wi-Fi:
   IPv4 Address. . . . . . . . . . . : 192.168.1.100
   Subnet Mask . . . . . . . . . . . : 255.255.255.0
```

#### **On Mac:**
1. Open **Terminal**
2. Type: `ifconfig`
3. Look for **"inet"** under your active network (usually en0)
4. Example: `inet 192.168.1.100`

```bash
$ ifconfig en0

en0: flags=8863<UP,BROADCAST,SMART,RUNNING>
	inet 192.168.1.100 netmask 0xffffff00 broadcast 192.168.1.255
```

#### **On Linux:**
1. Open **Terminal**
2. Type: `ip addr` or `ifconfig`
3. Look for **"inet"** under your active network interface
4. Example: `inet 192.168.1.100/24`

```bash
$ ip addr

2: wlan0: <BROADCAST,MULTICAST,UP,LOWER_UP>
    inet 192.168.1.100/24 brd 192.168.1.255 scope global dynamic wlan0
```

---

### **Step 2: Update ApiClient.kt**

Open `ApiClient.kt` and update line 20:

```kotlin
// BEFORE (won't work)
private const val BASE_URL = "http://192.168.x.x:8000/api/"

// AFTER (replace with YOUR actual IP)
private const val BASE_URL = "http://192.168.1.100:8000/api/"
```

**Important Notes:**
- Replace `192.168.1.100` with YOUR actual IP address from Step 1
- Keep the `http://` prefix
- Keep the `:8000/api/` suffix
- Make sure there's a trailing slash `/`

---

## 🎯 Quick Decision Guide

### **Are you using Android Emulator?**
✅ **Use:** `http://10.0.2.2:8000/api/`
- This is already set as default
- No changes needed
- Works immediately

### **Are you using a Physical Device?**
📱 **Use:** `http://[YOUR_IP]:8000/api/`
- Find your IP using steps above
- Replace in ApiClient.kt
- Example: `http://192.168.1.100:8000/api/`

### **Are you using Ngrok or Cloud Server?**
🌐 **Use:** `https://your-url.com/api/`
- Use the full URL provided by ngrok/cloud
- Example: `https://abc123.ngrok-free.dev/api/`

---

## ✅ Verification Checklist

Before running the app, verify:

- [ ] Backend server is running on your computer
  ```bash
  # Check if Django/FastAPI is running
  python manage.py runserver 0.0.0.0:8000
  # or
  uvicorn main:app --host 0.0.0.0 --port 8000
  ```

- [ ] Computer and phone are on the **same WiFi network**

- [ ] Firewall isn't blocking port 8000
  - Windows: Check Windows Defender Firewall
  - Mac: Check System Preferences → Security & Privacy → Firewall
  - Linux: Check `ufw status` or `iptables`

- [ ] Backend URL is correct in `ApiClient.kt`

- [ ] App has internet permission (already configured)

---

## 🧪 Test the Connection

### **Method 1: Using Browser on Phone**
1. Open browser on your phone
2. Navigate to: `http://YOUR_IP:8000/api/`
3. Should see API response or Django/FastAPI page

### **Method 2: Using curl (on computer)**
```bash
curl http://YOUR_IP:8000/api/customers
```

### **Method 3: Check Android Logcat**
1. Run the app
2. Open Logcat in Android Studio
3. Filter by "OkHttp" or "Retrofit"
4. Look for connection attempts and errors

---

## 🔥 Common Issues & Solutions

### **Issue 1: "Connection refused"**
**Solution:** Backend server isn't running or not listening on 0.0.0.0
```bash
# Make sure to use 0.0.0.0, not 127.0.0.1
python manage.py runserver 0.0.0.0:8000
```

### **Issue 2: "Network unreachable"**
**Solution:** Phone and computer on different networks
- Connect both to same WiFi
- Disable mobile data on phone

### **Issue 3: "Timeout"**
**Solution:** Firewall blocking connection
- Temporarily disable firewall to test
- Add exception for port 8000

### **Issue 4: "Unknown host"**
**Solution:** Wrong IP address
- Re-check IP using `ipconfig`/`ifconfig`
- IP might change if using DHCP

### **Issue 5: Still showing 192.168.x.x**
**Solution:** Old build cached
```cmd
gradlew clean
gradlew assembleDebug
```

---

## 📝 Example Configurations

### **Configuration 1: Android Emulator + Local Backend**
```kotlin
private const val BASE_URL = "http://10.0.2.2:8000/api/"
```
Backend command:
```bash
python manage.py runserver 0.0.0.0:8000
```

### **Configuration 2: Physical Device + Local Backend**
```kotlin
private const val BASE_URL = "http://192.168.1.100:8000/api/"
```
Backend command:
```bash
python manage.py runserver 0.0.0.0:8000
```
Requirements:
- Same WiFi network
- Firewall allows port 8000
- IP address is current

### **Configuration 3: Ngrok Tunnel**
```kotlin
private const val BASE_URL = "https://abc123.ngrok-free.dev/api/"
```
Ngrok command:
```bash
ngrok http 8000
```
Benefits:
- Works from anywhere
- No network configuration needed
- HTTPS support

---

## 🔄 After Making Changes

1. **Clean the project:**
   ```cmd
   gradlew clean
   ```

2. **Rebuild:**
   ```cmd
   gradlew assembleDebug
   ```

3. **Reinstall on device:**
   ```cmd
   gradlew installDebug
   ```

4. **Test:**
   - Open app
   - Try to login or load customers
   - Check Logcat for network activity

---

## 📊 Current Configuration

**File:** `app/src/main/java/too/good/crm/data/api/ApiClient.kt`

**Current Setting:**
```kotlin
private const val BASE_URL = "http://10.0.2.2:8000/api/"
```

**This works for:** Android Emulator

**To use with physical device:** Uncomment and update the physical device line with your actual IP.

---

## 🆘 Still Having Issues?

### Check Backend Server:
```bash
# Django
python manage.py runserver 0.0.0.0:8000

# FastAPI
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Check Network:
```bash
# On computer - test if backend is accessible
curl http://localhost:8000/api/

# On phone's browser
http://YOUR_IP:8000/api/
```

### Enable Detailed Logging:
The app already has `HttpLoggingInterceptor` at `BODY` level. Check Logcat for:
- Request URL
- Response code
- Error messages

---

**Status: ✅ FIXED**

The BASE_URL has been corrected. If using emulator, it should work immediately. If using physical device, follow Step 1-2 above to set your actual IP address.

**Last Updated:** November 10, 2025

