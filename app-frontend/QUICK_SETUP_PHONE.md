# 🚀 Quick Start: Backend IP Setup for Phone

## ⚡ Super Quick (2 Steps)

### 1️⃣ Find Your Computer's IP Address

**Windows:** Open CMD and type:
```bash
ipconfig
```
Look for "IPv4 Address" (e.g., `192.168.1.100`)

**Mac/Linux:** Open Terminal and type:
```bash
ifconfig | grep "inet "
```

### 2️⃣ Update Backend URL

**File to Edit:**
```
D:\Projects\too-good-crm\app-frontend\gradle.properties
```

**Find this line (at the bottom):**
```properties
BACKEND_URL=http://192.168.0.106:8000/api/
```

**Change to your IP:**
```properties
BACKEND_URL=http://YOUR_IP_ADDRESS:8000/api/
```

**Example:**
```properties
BACKEND_URL=http://192.168.1.100:8000/api/
```

### That's it! ✅

Now sync Gradle and run the app on your phone.

---

## 📝 Important Notes

1. **Same WiFi Network**
   - Your phone and computer MUST be on the same WiFi network

2. **Start Backend Server**
   ```bash
   cd D:\Projects\too-good-crm\backend
   python manage.py runserver 0.0.0.0:8000
   ```
   ⚠️ Use `0.0.0.0:8000` not `localhost:8000`

3. **Test Connection**
   - Open browser on your phone
   - Go to: `http://YOUR_IP:8000/admin`
   - You should see Django admin page

4. **Connect Phone**
   - Enable USB Debugging on phone
   - Connect via USB cable
   - Run app from Android Studio

---

## 🔧 Different Scenarios

### For Android Emulator
```properties
BACKEND_URL=http://10.0.2.2:8000/api/
```

### For Physical Phone (Same WiFi)
```properties
BACKEND_URL=http://192.168.x.x:8000/api/
```
Replace with your computer's IP

### For Production Server
```properties
BACKEND_URL=https://api.yourdomain.com/api/
```

---

## ❓ Troubleshooting

**Can't connect?**
1. Check if both devices are on same WiFi
2. Check if backend is running on `0.0.0.0:8000`
3. Try accessing `http://YOUR_IP:8000` in phone's browser
4. Check Windows Firewall (allow Python on port 8000)

**Network Security Error?**
- Already configured! The app allows HTTP connections.

**Need more help?**
- See detailed guide: `PHONE_SETUP_GUIDE.md`

---

*Last Updated: November 23, 2025*

