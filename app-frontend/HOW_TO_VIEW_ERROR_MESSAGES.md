# 📱 How to View Error Messages in Your Android App

## 🎯 **Quick Answer**

There are **3 main ways** to see error messages:

1. **In the App UI** - Error messages display directly on screen
2. **Android Studio Logcat** - Real-time logs (best for development)
3. **ADB Command Line** - View logs from terminal

---

## 1️⃣ **In the App UI** (User-Friendly) ✅

Your app **already displays errors** to users in several ways:

### A. **Red Error Banner** (Main Screens)
When something goes wrong, a red error banner appears at the top of the screen:

```kotlin
// Example from CustomersScreen.kt
uiState.error?.let { errorMessage ->
    Surface(
        color = DesignTokens.Colors.ErrorLight,  // Light red background
        shape = RoundedCornerShape(DesignTokens.Radius.Medium)
    ) {
        Row(
            modifier = Modifier.padding(DesignTokens.Spacing.Space3),
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Text(
                text = errorMessage,  // ← Error message displays here
                color = DesignTokens.Colors.ErrorDark,
                style = MaterialTheme.typography.bodyMedium
            )
            IconButton(onClick = { viewModel.clearError() }) {
                Icon(Icons.Default.Close, "Dismiss error")
            }
        }
    }
}
```

**How to See It**:
1. Open the app
2. Try to fetch customers (or perform any action)
3. If error occurs → **Red banner appears at top**
4. Click **X** button to dismiss

**Example Messages**:
- "Connection timeout. Please check your network."
- "Cannot connect to server. Please ensure backend is running."
- "Failed to fetch customers: Unauthorized"

---

### B. **Error Messages in Dialogs**
When creating/editing items, errors show inside the dialog:

```kotlin
// Example from CreateCustomerDialog.kt
error?.let {
    Surface(
        color = DesignTokens.Colors.ErrorLight,
        shape = RoundedCornerShape(DesignTokens.Radius.Medium)
    ) {
        Text(
            text = it,  // ← Error message here
            color = DesignTokens.Colors.ErrorDark,
            modifier = Modifier.padding(DesignTokens.Spacing.Space3)
        )
    }
}
```

**How to See It**:
1. Click **+ Add Customer** button
2. Try to create a customer
3. If error occurs → **Red error box appears in dialog**

---

### C. **Snackbar Messages** (Bottom Toasts)
Success/error messages appear as snackbars at the bottom:

```kotlin
// Example from CustomersScreen.kt
val snackbarHostState = remember { SnackbarHostState() }

LaunchedEffect(uiState.successMessage) {
    uiState.successMessage?.let { message ->
        snackbarHostState.showSnackbar(
            message = message,  // ← Message displays here
            duration = SnackbarDuration.Short
        )
    }
}

Scaffold(
    snackbarHost = { SnackbarHost(snackbarHostState) }
) {
    // Screen content
}
```

**How to See It**:
1. Perform an action (create customer, etc.)
2. **Black/gray bar slides up from bottom** with message
3. Auto-dismisses after 2-4 seconds

---

## 2️⃣ **Android Studio Logcat** (Developer Method) 🔧

**Best for development and debugging!**

### Step 1: Open Logcat
1. Open **Android Studio**
2. Click **Logcat** tab at bottom of window
3. Or: `View` → `Tool Windows` → `Logcat`

### Step 2: Filter Logs
In the Logcat filter box, enter:
```
package:too.good.crm
```

This shows **only your app's logs**.

### Step 3: Search for Errors
In the search box, type:
```
error
```
or
```
exception
```
or
```
failed
```

### Step 4: Read the Error
Logcat shows:
```
2024-01-15 10:30:45.123 12345-12345/too.good.crm E/CustomerRepository: Failed to fetch customers
    java.net.SocketTimeoutException: Connection timeout
        at too.good.crm.data.repository.CustomerRepository.getCustomers(CustomerRepository.kt:32)
        ...
```

**Key Parts**:
- `E/` = Error level
- `CustomerRepository` = Where error occurred
- `Failed to fetch customers` = Error message
- Stack trace = Line-by-line error details

---

## 3️⃣ **ADB Command Line** (Terminal Method) 💻

**Use this if you don't have Android Studio open.**

### Step 1: Open Terminal
- **Windows**: PowerShell or Command Prompt
- **Mac/Linux**: Terminal

### Step 2: Connect Device
```bash
adb devices
```

Should show:
```
List of devices attached
ABC123XYZ    device
```

### Step 3: View Live Logs
```bash
adb logcat | Select-String -Pattern "too.good.crm"
```

Or filter for errors only:
```bash
adb logcat | Select-String -Pattern "too.good.crm.*E/"
```

### Step 4: Clear Old Logs First (Optional)
```bash
adb logcat -c
```

Then start fresh logging:
```bash
adb logcat | Select-String -Pattern "too.good.crm"
```

---

## 🛠️ **Adding Better Error Logging**

### Add Log Statements in Code

#### Example 1: In Repository
```kotlin
// In CustomerRepository.kt
suspend fun getCustomers(): Result<List<Customer>> {
    return try {
        Log.d("CustomerRepository", "Fetching customers...")  // ← Add this
        val response = apiService.getCustomers()
        
        if (response.isSuccessful) {
            val customers = response.body() ?: emptyList()
            Log.d("CustomerRepository", "Fetched ${customers.size} customers")  // ← Add this
            Result.success(customers)
        } else {
            val errorMessage = "Failed: ${response.code()} ${response.message()}"
            Log.e("CustomerRepository", errorMessage)  // ← Add this
            Result.failure(Exception(errorMessage))
        }
    } catch (e: Exception) {
        Log.e("CustomerRepository", "Exception: ${e.message}", e)  // ← Add this
        Result.failure(e)
    }
}
```

#### Example 2: In ViewModel
```kotlin
// In CustomersViewModel.kt
fun loadCustomers() {
    viewModelScope.launch {
        Log.d("CustomersViewModel", "Loading customers...")  // ← Add this
        
        repository.getCustomers()
            .onSuccess { customers ->
                Log.d("CustomersViewModel", "Loaded ${customers.size} customers")  // ← Add this
            }
            .onFailure { error ->
                Log.e("CustomersViewModel", "Failed to load: ${error.message}")  // ← Add this
            }
    }
}
```

#### Log Levels:
- `Log.v()` - Verbose (detailed)
- `Log.d()` - Debug (info)
- `Log.i()` - Info (general)
- `Log.w()` - Warning (caution)
- `Log.e()` - Error (problems)

---

## 🔍 **Debugging Specific Errors**

### Network Errors

#### 1. Connection Timeout
```
Failed to fetch customers: Connection timeout
```

**How to Debug**:
```bash
# Check if backend is running
curl http://192.168.0.106:8000/api/customers/

# Check if device can reach backend
adb shell ping 192.168.0.106
```

#### 2. Cannot Connect
```
Cannot connect to server
```

**Check**:
- Backend is running (`python manage.py runserver 0.0.0.0:8000`)
- Device on same network as PC
- Firewall allows connection
- Correct IP in `ApiClient.kt`

#### 3. Unauthorized (401)
```
Failed to fetch customers: Unauthorized
```

**Check**:
- User is logged in
- Auth token is valid
- Token is being sent in request headers

---

### JSON Parsing Errors

#### Unexpected JSON Structure
```
com.google.gson.JsonSyntaxException: Expected BEGIN_ARRAY but was BEGIN_OBJECT
```

**How to Debug**:
1. **Log the raw JSON response**:
```kotlin
// In ApiClient.kt, add logging interceptor
private val loggingInterceptor = HttpLoggingInterceptor().apply {
    level = HttpLoggingInterceptor.Level.BODY  // Logs full request/response
}
```

2. **Check Logcat** for response:
```
D/OkHttp: {"organization": "Acme Corp", "name": "John", ...}
```

3. **Compare with data model** in `Customer.kt`

4. **Add missing fields** to data class

---

## 📊 **Common Error Messages & Solutions**

| Error Message | Cause | Solution |
|---------------|-------|----------|
| "Connection timeout" | Backend not reachable | Check network, backend running |
| "Cannot connect to server" | Wrong IP or backend down | Verify IP in ApiClient.kt |
| "Unauthorized" | Not logged in or token expired | Re-login to get new token |
| "Unexpected JSON structure" | Model doesn't match backend | Add missing fields to model |
| "Failed to fetch: 404" | Endpoint not found | Check URL in API service |
| "Failed to fetch: 500" | Backend error | Check backend logs |

---

## 🎯 **Quick Troubleshooting Checklist**

### When You Get an Error:

- [ ] **Read the error message in app UI** (red banner/dialog)
- [ ] **Open Logcat** in Android Studio
- [ ] **Filter for your package**: `package:too.good.crm`
- [ ] **Search for "error"** or "exception"
- [ ] **Read the stack trace** to find where error occurred
- [ ] **Check network connection** (if network error)
- [ ] **Verify backend is running** (curl test)
- [ ] **Compare JSON response with model** (if parsing error)
- [ ] **Check backend logs** for server-side errors

---

## 💡 **Pro Tips**

### 1. **Use Different Log Tags**
```kotlin
companion object {
    private const val TAG = "CustomersViewModel"
}

Log.d(TAG, "Loading customers...")
```

Then filter in Logcat: `tag:CustomersViewModel`

### 2. **Log HTTP Responses**
Already enabled in `ApiClient.kt`:
```kotlin
private val loggingInterceptor = HttpLoggingInterceptor().apply {
    level = HttpLoggingInterceptor.Level.BODY
}
```

### 3. **Save Logs to File** (Advanced)
```bash
adb logcat -f /sdcard/app_logs.txt
adb pull /sdcard/app_logs.txt
```

### 4. **Color-Coded Logcat**
In Android Studio Logcat:
- **Red** = Errors (E/)
- **Orange** = Warnings (W/)
- **Blue** = Info (I/)
- **Gray** = Debug (D/)
- **White** = Verbose (V/)

---

## 🔗 **Useful ADB Commands**

```bash
# View all logs
adb logcat

# Clear logs
adb logcat -c

# Filter by tag
adb logcat -s CustomerRepository

# Filter by priority (Error and above)
adb logcat *:E

# Save to file
adb logcat > logs.txt

# View only app crashes
adb logcat | Select-String -Pattern "FATAL"

# View network requests
adb logcat | Select-String -Pattern "OkHttp"
```

---

## 📚 **Example: Full Error Investigation**

### Scenario: Customers Not Loading

#### Step 1: Check App UI
```
Red banner shows: "Failed to fetch customers"
```

#### Step 2: Check Logcat
```
E/CustomerRepository: Failed to fetch customers: 500 Internal Server Error
```

#### Step 3: Check Network Request
```
D/OkHttp: --> GET http://192.168.0.106:8000/api/customers/
D/OkHttp: <-- 500 Internal Server Error
D/OkHttp: {"error": "organization field required"}
```

#### Step 4: Identify Issue
Backend expects `organization` field in model.

#### Step 5: Fix
Add `organization` field to `Customer.kt`.

#### Step 6: Test
```
D/CustomerRepository: Fetched 5 customers
```
✅ **Fixed!**

---

## 🎉 **Summary**

### **3 Ways to See Errors**:
1. **App UI** - Red banners, error dialogs, snackbars
2. **Logcat** - Real-time logs in Android Studio
3. **ADB** - Command-line logs

### **Best Practice**:
- Use **App UI** for user-facing errors
- Use **Logcat** for development/debugging
- Add **Log statements** in your code
- Check **both app and backend logs**

---

**Now you can easily see and debug any error in your app!** 🚀

