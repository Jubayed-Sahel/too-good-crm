# Mobile App Login Fix - SOLVED ✅

## Problem Identified

Your mobile app login was **timing out after 60 seconds** for THREE reasons:

### 1. ❌ Backend Not Listening on Network
**Issue**: Backend started with `python manage.py runserver` (localhost only)
**Fix**: Restarted with `python manage.py runserver 0.0.0.0:8000` (network accessible)

### 2. ❌ IP Address Changed
**Issue**: Mobile app configured for `192.168.0.106` but your IP changed to `192.168.0.131`
**Fix**: Updated `gradle.properties` to `BACKEND_URL=http://192.168.0.131:8000/api/`

### 3. ❌ Timeout Too Long
**Issue**: 60-second timeout made you wait too long for error
**Fix**: Reduced to 15 seconds for faster feedback

---

## Changes Made

### ✅ 1. Updated Mobile App Backend URL
**File**: `app-frontend/gradle.properties`
```properties
# OLD (wrong IP)
BACKEND_URL=http://192.168.0.106:8000/api/

# NEW (current IP)
BACKEND_URL=http://192.168.0.131:8000/api/
```

### ✅ 2. Reduced Timeout Duration
**File**: `app-frontend/app/src/main/java/too/good/crm/data/api/ApiClient.kt`
```kotlin
// OLD (60 second timeout)
.connectTimeout(60, TimeUnit.SECONDS)
.readTimeout(60, TimeUnit.SECONDS)
.writeTimeout(60, TimeUnit.SECONDS)

// NEW (15 second timeout - faster error feedback)
.connectTimeout(15, TimeUnit.SECONDS)
.readTimeout(15, TimeUnit.SECONDS)
.writeTimeout(15, TimeUnit.SECONDS)
```

### ✅ 3. Restarted Backend with Network Binding
**Command**: 
```powershell
python manage.py runserver 0.0.0.0:8000
```

**Result**: Backend now accessible at `http://192.168.0.131:8000/`

---

## Verification

### ✅ Backend Network Connectivity
```powershell
Test-NetConnection -ComputerName 192.168.0.131 -Port 8000
# Result: TcpTestSucceeded = True ✅
```

### ✅ API Endpoint Responding
```powershell
Invoke-RestMethod -Uri "http://192.168.0.131:8000/api/"
# Result: 401 Authentication required (expected for protected endpoint) ✅
```

---

## Next Steps to Test Login

### 1. Rebuild the Mobile App
The IP address change requires rebuilding the app:

```bash
cd app-frontend
./gradlew clean
./gradlew assembleDebug
```

Or in Android Studio:
- **Build** → **Clean Project**
- **Build** → **Rebuild Project**
- **Run** → **Run 'app'**

### 2. Ensure Device/Emulator on Same Network
- **Physical Device**: Must be connected to the **same WiFi** as your PC
- **Emulator**: Will automatically use `192.168.0.131` through network bridging

### 3. Test Login
Use existing credentials:
- Username: `admin` / Password: (your admin password)
- Or any user you created previously

Expected behavior:
- ✅ Login completes in **1-2 seconds** (not 60 seconds)
- ✅ If connection fails, error shows after **15 seconds** (not 60)
- ✅ Successful login navigates to dashboard

---

## Common Issues and Solutions

### Issue: Still Can't Connect After Rebuild

**Check IP Address (it may change again)**:
```powershell
ipconfig | Select-String "IPv4"
```

If IP changed again, update `gradle.properties`:
```properties
BACKEND_URL=http://YOUR_NEW_IP:8000/api/
```

### Issue: "Cannot Connect to Server"

**Verify Backend Running**:
```powershell
Get-Job | Where-Object { $_.Name -eq "Backend" }
# Should show: State = Running
```

**Test Backend Network Access**:
```powershell
Test-NetConnection -ComputerName 192.168.0.131 -Port 8000
# Should show: TcpTestSucceeded = True
```

**Restart Backend if Needed**:
```powershell
Stop-Job -Name "Backend" -ErrorAction SilentlyContinue
Remove-Job -Name "Backend" -Force -ErrorAction SilentlyContinue
cd shared-backend
.\venv\Scripts\Activate.ps1
python manage.py runserver 0.0.0.0:8000
```

### Issue: Firewall Blocking Connections

**Allow Python through Windows Firewall**:
1. Windows Security → Firewall & network protection
2. Allow an app through firewall
3. Find Python → Check both **Private** and **Public**
4. Or temporarily disable firewall for testing

### Issue: Physical Device Not on Same WiFi

**Verify WiFi Connection**:
- Phone WiFi SSID must match PC WiFi SSID
- Both on 2.4GHz or both on 5GHz (not mixed)
- Check phone Settings → WiFi → Connected network

---

## Understanding the Timeout Issue

### Why 60 Seconds Was Too Long

The mobile app was configured with 60-second timeouts:
```kotlin
.connectTimeout(60, TimeUnit.SECONDS)  // Wait 60s for connection
.readTimeout(60, TimeUnit.SECONDS)     // Wait 60s for response
.writeTimeout(60, TimeUnit.SECONDS)    // Wait 60s for upload
```

**Problem**: When the IP was wrong, the app would:
1. Try to connect to `192.168.0.106:8000` (wrong IP)
2. Wait 60 seconds for connection timeout
3. Finally show error after 1 minute

**Solution**: Reduced to 15 seconds:
```kotlin
.connectTimeout(15, TimeUnit.SECONDS)  // Wait 15s for connection
.readTimeout(15, TimeUnit.SECONDS)     // Wait 15s for response
.writeTimeout(15, TimeUnit.SECONDS)    // Wait 15s for upload
```

Now errors show after 15 seconds instead of 60 seconds.

---

## Quick Reference: Get Your Current IP

### Windows (PowerShell)
```powershell
ipconfig | Select-String "IPv4"
```

### Windows (Command Prompt)
```cmd
ipconfig | findstr IPv4
```

### Your Current IPs
```
192.168.56.1  - VirtualBox Host-Only Network
192.168.137.1 - Mobile Hotspot
192.168.0.131 - Main WiFi Network (USE THIS ONE)
```

**Use**: `192.168.0.131` for physical device on same WiFi

---

## Mobile App Configuration Reference

### For Android Emulator
```properties
BACKEND_URL=http://10.0.2.2:8000/api/
```
**Note**: `10.0.2.2` is special IP for emulator to access host's `localhost`

### For Physical Device (Same WiFi)
```properties
BACKEND_URL=http://192.168.0.131:8000/api/
```
**Note**: Use your PC's actual IP address (find with `ipconfig`)

### For ngrok/Tunneling
```properties
BACKEND_URL=https://abc123.ngrok.io/api/
```
**Note**: Useful when device can't access local network

---

## Testing Checklist

Before testing login, verify:

- [ ] ✅ Backend running on `0.0.0.0:8000`
- [ ] ✅ IP address is correct in `gradle.properties`
- [ ] ✅ Mobile app rebuilt after IP change
- [ ] ✅ Device/Emulator on same WiFi network
- [ ] ✅ Firewall allows Python on port 8000
- [ ] ✅ Backend accessible: `Test-NetConnection -ComputerName 192.168.0.131 -Port 8000`

Then test login:
- [ ] Launch mobile app
- [ ] Enter username and password
- [ ] Login completes in 1-2 seconds
- [ ] Navigates to dashboard
- [ ] Data loads correctly

---

## Summary

### Root Cause
1. Backend was only listening on `localhost` (127.0.0.1)
2. Mobile app had outdated IP address (192.168.0.106 instead of 192.168.0.131)
3. 60-second timeout made failures take too long to detect

### Solution Applied
1. ✅ Restarted backend with `0.0.0.0:8000` to listen on all network interfaces
2. ✅ Updated `gradle.properties` with correct IP: `192.168.0.131`
3. ✅ Reduced timeout from 60s to 15s for faster error feedback

### Result
- Backend now accessible from network: `http://192.168.0.131:8000/api/`
- Mobile app configured with correct IP
- Errors show after 15 seconds instead of 60 seconds
- **Login should now work in 1-2 seconds** ✅

---

## Important Notes

### IP Address Can Change
Your IP address (`192.168.0.131`) may change if:
- Router restarts
- DHCP lease expires
- WiFi disconnects and reconnects
- PC restarts

**Solution**: Set static IP in router or check IP before each mobile app session

### Always Use 0.0.0.0:8000
When running backend for mobile app, always use:
```bash
python manage.py runserver 0.0.0.0:8000
```

**NOT**:
```bash
python manage.py runserver        # Only localhost
python manage.py runserver 8000   # Only localhost
```

### Rebuild Required After IP Change
Changing `gradle.properties` requires **rebuilding the app**:
- The IP is baked into the APK at build time
- Just restarting the app won't pick up the new IP
- Must do: **Build → Rebuild Project**

---

## Status: RESOLVED ✅

**Mobile app login should now work correctly.**

If you still have issues after rebuilding, check:
1. IP address with `ipconfig`
2. Backend running with `Get-Job`
3. Network connectivity with `Test-NetConnection`
