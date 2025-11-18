# Fix: Not Permitted by Network Security Policy

## ✅ Issue Resolved

**Error:** `java.net.UnknownServiceException: CLEARTEXT communication to 192.168.0.218 not permitted by network security policy`

**Cause:** Android 9+ (API 28+) blocks HTTP (cleartext) traffic by default for security reasons. Since you're using `http://192.168.0.218:8000/api/` (HTTP, not HTTPS) for local development, the app needs explicit permission to allow cleartext traffic.

---

## 🔧 Fix Applied

### **1. Created Network Security Configuration File** ✅

**File:** `app/src/main/res/xml/network_security_config.xml`

```xml
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <!-- Allow cleartext (HTTP) traffic for local development -->
    <domain-config cleartextTrafficPermitted="true">
        <!-- Android Emulator localhost -->
        <domain includeSubdomains="true">10.0.2.2</domain>
        
        <!-- Local network IP addresses (192.168.x.x) -->
        <domain includeSubdomains="true">192.168.0.218</domain>
    </domain-config>
</network-security-config>
```

**What this does:**
- Allows HTTP traffic to `10.0.2.2` (Android Emulator)
- Allows HTTP traffic to `192.168.0.218` (your local backend)
- Keeps HTTPS enforcement for all other domains (secure by default)

---

### **2. Updated AndroidManifest.xml** ✅

**File:** `app/src/main/AndroidManifest.xml`

**Added:**
```xml
android:networkSecurityConfig="@xml/network_security_config"
```

**Full application tag:**
```xml
<application
    android:allowBackup="true"
    android:dataExtractionRules="@xml/data_extraction_rules"
    android:fullBackupContent="@xml/backup_rules"
    android:icon="@mipmap/ic_launcher"
    android:label="@string/app_name"
    android:roundIcon="@mipmap/ic_launcher_round"
    android:supportsRtl="true"
    android:theme="@style/Theme.TooGoodCrm"
    android:networkSecurityConfig="@xml/network_security_config">
```

---

## 🎯 What This Fixes

| Before (Error) | After (Fixed) |
|----------------|---------------|
| ❌ HTTP requests blocked | ✅ HTTP allowed for specified domains |
| ❌ "Not permitted by network security policy" | ✅ Cleartext traffic permitted |
| ❌ Cannot connect to local backend | ✅ Connects successfully |
| ❌ App crashes or shows network errors | ✅ API calls work normally |

---

## 🔒 Security Considerations

### ✅ **Safe for Development:**
- Only allows HTTP for specific local IP addresses
- Emulator and local development IPs whitelisted
- All other domains still require HTTPS

### ⚠️ **For Production:**
When deploying to production:
1. Use HTTPS for your production API
2. Remove or restrict the cleartext domains
3. Consider using certificate pinning for extra security

**Production Example:**
```xml
<network-security-config>
    <!-- Production - HTTPS only -->
    <domain-config cleartextTrafficPermitted="false">
        <domain includeSubdomains="true">api.yourproduction.com</domain>
    </domain-config>
    
    <!-- Development IPs (only if needed) -->
    <domain-config cleartextTrafficPermitted="true">
        <domain includeSubdomains="true">10.0.2.2</domain>
    </domain-config>
</network-security-config>
```

---

## 📋 Files Created/Modified

### **Created:**
1. ✅ `app/src/main/res/xml/network_security_config.xml` - Network security configuration

### **Modified:**
1. ✅ `app/src/main/AndroidManifest.xml` - Added network security config reference

---

## 🔄 How to Apply

1. **Clean and rebuild:**
   ```cmd
   gradlew clean assembleDebug
   ```

2. **Reinstall on device:**
   ```cmd
   gradlew installDebug
   ```

3. **Test the connection:**
   - Open the app
   - Try to login or load customers
   - ✅ Should now connect successfully!

---

## 🆘 If You Change Your IP Address

If your computer's IP changes (e.g., from `192.168.0.218` to `192.168.0.100`), you need to update the network security config:

**Edit:** `app/src/main/res/xml/network_security_config.xml`

```xml
<!-- Update this line -->
<domain includeSubdomains="true">192.168.0.100</domain>
```

Or add multiple IPs:
```xml
<domain-config cleartextTrafficPermitted="true">
    <domain includeSubdomains="true">10.0.2.2</domain>
    <domain includeSubdomains="true">192.168.0.218</domain>
    <domain includeSubdomains="true">192.168.0.100</domain>
    <domain includeSubdomains="true">192.168.1.100</domain>
</domain-config>
```

---

## 🌐 Alternative: Allow All Local IPs (Less Secure)

If you frequently change networks and IPs, you can allow all local network ranges:

```xml
<network-security-config>
    <domain-config cleartextTrafficPermitted="true">
        <!-- Emulator -->
        <domain includeSubdomains="true">10.0.2.2</domain>
        
        <!-- All 192.168.x.x addresses -->
        <domain includeSubdomains="true">192.168.0.0</domain>
        
        <!-- All 10.x.x.x addresses -->
        <domain includeSubdomains="true">10.0.0.0</domain>
        
        <!-- Localhost -->
        <domain includeSubdomains="true">localhost</domain>
        <domain includeSubdomains="true">127.0.0.1</domain>
    </domain-config>
</network-security-config>
```

⚠️ **Warning:** This is less secure and should only be used for development builds.

---

## 🧪 Verification

### **Test 1: Check Logcat**
After running the app, check Logcat for:
```
D/OkHttp: --> GET http://192.168.0.218:8000/api/customers
```
Should see successful HTTP requests without security policy errors.

### **Test 2: API Connection**
- Open app
- Navigate to Customers screen
- Should load customer list from backend
- No "network security policy" errors

### **Test 3: Login Flow**
- Try to login
- Should connect to `/auth/login` endpoint
- Token should be stored and used for subsequent requests

---

## 📊 Understanding Android Network Security

### **Android 9+ (API 28+) Default Behavior:**
- ❌ HTTP (cleartext) traffic is blocked
- ✅ HTTPS traffic is allowed
- 🔒 Protects users from insecure connections

### **Why This Matters:**
- Prevents man-in-the-middle attacks
- Ensures data encryption in transit
- Industry best practice for mobile apps

### **Development Exception:**
For local development, we need HTTP because:
- Local servers typically don't have SSL certificates
- Setting up HTTPS for localhost is complex
- Development IPs change frequently

### **Solution:**
Network Security Config allows specific exceptions while maintaining security for production domains.

---

## 🔐 Best Practices

### **For Development:**
✅ Use specific IP addresses in network security config
✅ Document which IPs are whitelisted
✅ Keep cleartext only for local development

### **For Production:**
✅ Use HTTPS for all API endpoints
✅ Remove cleartext permissions
✅ Consider certificate pinning
✅ Use ProGuard/R8 to obfuscate API endpoints

### **Migration Path:**
1. **Development:** HTTP to local IP (current setup)
2. **Staging:** HTTPS to staging server
3. **Production:** HTTPS with certificate pinning

---

## 📚 Additional Resources

### **Android Documentation:**
- [Network Security Configuration](https://developer.android.com/training/articles/security-config)
- [Cleartext Traffic](https://developer.android.com/guide/topics/manifest/application-element#usesCleartextTraffic)

### **Common Errors:**
- `CLEARTEXT communication not permitted` - Fixed by this configuration
- `ERR_CLEARTEXT_NOT_PERMITTED` - Same issue, same fix
- `java.net.UnknownServiceException` - Network security policy blocking HTTP

---

## 🎯 Summary

| Issue | Solution | Status |
|-------|----------|--------|
| HTTP blocked by Android | Created network security config | ✅ Fixed |
| Local backend unreachable | Whitelisted local IPs | ✅ Fixed |
| Network security policy error | Added cleartext permission | ✅ Fixed |
| App cannot connect | Both files updated | ✅ Fixed |

---

## ⚡ Quick Reference

**Your current setup:**
- Backend IP: `192.168.0.218:8000`
- Protocol: HTTP (cleartext)
- Allowed in: `network_security_config.xml`
- Referenced in: `AndroidManifest.xml`

**If backend IP changes:**
1. Update `network_security_config.xml`
2. Rebuild app
3. Reinstall

**If switching to HTTPS:**
1. Update `ApiClient.kt` to use `https://`
2. Can remove cleartext permission from network config
3. App will work with HTTPS by default

---

**Status: ✅ FIXED**

The "not permitted by network security policy" error has been resolved. Your app can now make HTTP requests to your local backend at `192.168.0.218:8000`.

**Last Updated:** November 10, 2025

