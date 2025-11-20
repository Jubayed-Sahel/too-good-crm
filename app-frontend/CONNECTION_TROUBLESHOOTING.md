# Connection Troubleshooting Guide

## Error: "Failed to connect to server on port 8000"

This error occurs when the mobile app cannot reach the backend server. Follow these steps to fix it:

## Step 1: Verify Backend Server is Running

Open a terminal and run:

```bash
cd C:\Users\User\Desktop\p\too-good-crm\shared-backend
python manage.py runserver 0.0.0.0:8000
```

You should see:
```
Starting development server at http://0.0.0.0:8000/
```

**If the server is not running, start it first!**

## Step 2: Check Your Setup Type

### Are you using an Android Emulator?

If YES, use this URL in `ApiClient.kt`:
```kotlin
private const val BASE_URL = "http://10.0.2.2:8000/api/"
```

The IP `10.0.2.2` is a special address that Android emulator uses to access your computer's localhost.

### Are you using a Physical Device?

If YES, you need to:

1. **Find your computer's IP address:**
   - Windows: Open CMD and type: `ipconfig`
   - Look for "IPv4 Address" under your active network adapter
   - Example: `192.168.1.100`

2. **Update ApiClient.kt:**
   ```kotlin
   private const val BASE_URL = "http://YOUR_IP:8000/api/"
   // Example: "http://192.168.1.100:8000/api/"
   ```

3. **Ensure both devices are on the same Wi-Fi network**

4. **Check Windows Firewall:**
   - Allow Python through Windows Firewall
   - Or temporarily disable firewall to test

## Step 3: Update ApiClient.kt

File location: `app/src/main/java/too/good/crm/data/api/ApiClient.kt`

**For Emulator:**
```kotlin
private const val BASE_URL = "http://10.0.2.2:8000/api/"
```

**For Physical Device:**
```kotlin
private const val BASE_URL = "http://192.168.0.218:8000/api/"  // Replace with your IP
```

## Step 4: Test the Connection

### Test from your computer:
```bash
curl http://localhost:8000/api/auth/login/
```

### Test from your device's network:
```bash
curl http://YOUR_IP:8000/api/auth/login/
```

If these work, the backend is accessible.

## Step 5: Rebuild the App

After changing `ApiClient.kt`:
1. In Android Studio: **Build → Rebuild Project**
2. Or run: `gradlew.bat clean build`
3. Reinstall the app on your device/emulator

## Common Issues

### Issue: "Connection timeout"
- **Solution:** Check if backend server is actually running
- Check if port 8000 is already in use
- Try restarting the backend server

### Issue: "Cannot resolve server address"
- **Solution:** Check the IP address in `ApiClient.kt` is correct
- For physical device, ensure both devices are on same network
- Try pinging the IP from your device

### Issue: Works on emulator but not physical device
- **Solution:** Use your computer's IP address (not localhost or 10.0.2.2)
- Check Windows Firewall settings
- Ensure both devices are on the same Wi-Fi network

### Issue: IP address keeps changing
- **Solution:** Set a static IP on your computer, or use ngrok for a stable URL

## Alternative: Use ngrok (Recommended for Testing)

If you have trouble with local IP addresses, use ngrok:

1. **Install ngrok** (if not installed)
2. **Start backend:**
   ```bash
   python manage.py runserver 0.0.0.0:8000
   ```
3. **Start ngrok in another terminal:**
   ```bash
   ngrok http 8000
   ```
4. **Copy the HTTPS URL** (e.g., `https://abc123.ngrok-free.app`)
5. **Update ApiClient.kt:**
   ```kotlin
   private const val BASE_URL = "https://abc123.ngrok-free.app/api/"
   ```

## Quick Checklist

- [ ] Backend server is running on port 8000
- [ ] Correct BASE_URL in ApiClient.kt
- [ ] For emulator: Using `10.0.2.2:8000`
- [ ] For physical device: Using your computer's IP address
- [ ] Both devices on same network (for physical device)
- [ ] Windows Firewall allows Python/port 8000
- [ ] App rebuilt after changing ApiClient.kt
- [ ] App reinstalled on device

## Still Having Issues?

1. Check Android Studio Logcat for detailed error messages
2. Verify backend is accessible: Open `http://localhost:8000/api/` in browser
3. Try using ngrok for a stable connection
4. Check network security config if using HTTPS

