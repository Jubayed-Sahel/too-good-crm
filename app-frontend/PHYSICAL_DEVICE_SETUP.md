# Physical Device Connection Guide

## Problem
You're getting an error when using the app on a physical device because the backend URL is configured for Android Emulator only.

## Current Configuration (Emulator Only)
```
BACKEND_URL=http://10.0.2.2:8000/api/
```

This IP address (`10.0.2.2`) only works for Android Emulators. Physical devices cannot connect to it.

## Solution: Update Backend URL for Physical Device

### Step 1: Find Your Computer's IP Address

**Option A: Use the helper script (Recommended)**
1. Double-click `get-ip-address.bat` or `get-ip-address.ps1`
2. Note the IP address shown (e.g., `192.168.1.100`)

**Option B: Find it manually**

**Windows:**
1. Open Command Prompt or PowerShell
2. Type: `ipconfig`
3. Look for "IPv4 Address" under your WiFi or Ethernet adapter
4. It should look like `192.168.x.x` or `10.0.x.x`

**Example output:**
```
Wireless LAN adapter Wi-Fi:
   IPv4 Address. . . . . . . . . . . : 192.168.1.100
```

### Step 2: Update gradle.properties

1. Open `gradle.properties` (in the root project folder)
2. Find this line:
   ```
   BACKEND_URL=http://10.0.2.2:8000/api/
   ```
3. Replace it with your computer's IP:
   ```
   BACKEND_URL=http://192.168.1.100:8000/api/
   ```
   (Use YOUR actual IP address from Step 1)

### Step 3: Rebuild the App

1. In Android Studio, press `Ctrl+F9` or go to `Build > Make Project`
2. Wait for the build to complete

### Step 4: Run on Physical Device

1. Make sure your phone is on the **SAME WiFi network** as your computer
2. Run the app on your physical device

## Important Requirements

✅ **Same WiFi Network**: Your phone and computer MUST be on the same WiFi network
✅ **Backend Running**: Make sure your backend server is running on port 8000
✅ **Firewall**: Windows Firewall might block the connection. If it does:
   - Go to Windows Defender Firewall
   - Allow Python (or your backend) through the firewall
   - Or temporarily disable the firewall for testing

## Testing the Connection

### Test 1: Can your phone reach your computer?
1. On your phone's browser, go to: `http://YOUR_IP:8000`
   (Replace YOUR_IP with your computer's IP)
2. You should see your backend's response or admin page

### Test 2: Is your backend running?
1. On your computer's browser, go to: `http://localhost:8000`
2. You should see your backend working

## Switching Between Emulator and Physical Device

**For Emulator:**
```properties
BACKEND_URL=http://10.0.2.2:8000/api/
```

**For Physical Device:**
```properties
BACKEND_URL=http://192.168.1.100:8000/api/
```
(Use your actual IP address)

**Remember to rebuild** (`Ctrl+F9`) after changing the URL!

## Common Issues

### Issue 1: "Connection Refused" or "Unable to connect"
**Solutions:**
- Check if backend is running
- Verify both devices are on the same WiFi
- Check Windows Firewall settings
- Use `get-ip-address.bat` to confirm your IP hasn't changed

### Issue 2: App works on emulator but not on phone
**Solution:** You forgot to change the BACKEND_URL! Follow Step 2 above.

### Issue 3: IP address changed
**Solution:** 
- Your IP might change when you reconnect to WiFi
- Run `get-ip-address.bat` again to get the new IP
- Update gradle.properties with the new IP
- Rebuild the app

### Issue 4: Still getting errors
**Check:**
1. Backend logs - Is it receiving requests?
2. Android Studio Logcat - What's the actual error message?
3. Try accessing `http://YOUR_IP:8000` from your phone's browser

## Quick Commands

**Find your IP:**
```bash
# Windows Command Prompt
ipconfig

# Windows PowerShell
Get-NetIPAddress -AddressFamily IPv4
```

**Start backend (if using Python/Django):**
```bash
python manage.py runserver 0.0.0.0:8000
```

**Start backend (if using Node.js):**
```bash
npm start
```

## Need Help?

1. Check the error message in Android Studio's Logcat
2. Verify backend is accessible from phone's browser
3. Confirm both devices are on the same network
4. Check firewall settings

---

**Quick Fix Checklist:**
- [ ] Found computer's IP address
- [ ] Updated BACKEND_URL in gradle.properties
- [ ] Backend is running on port 8000
- [ ] Phone and computer on same WiFi
- [ ] Rebuilt the app (Ctrl+F9)
- [ ] Tested connection from phone's browser

