# Quick Implementation Guide - Use New Components Now!

This guide shows you how to **immediately** start using the improved components without any configuration.

---

## 🚀 Quick Start - 5 Minute Setup

### 1. Use the New Theme (2 minutes)

**Update MainActivity.kt:**

```kotlin
// Replace this:
MaterialTheme(
    colorScheme = lightColorScheme(...)
) {
    // content
}

// With this:
import too.good.crm.ui.theme.TooGoodCrmTheme

TooGoodCrmTheme {
    // content  
}
```

**Boom!** ✨ You now have:
- Automatic dark mode
- Material 3 colors
- Dynamic colors on Android 12+

---

### 2. Replace Old Error Handling (1 minute)

**In any ViewModel or Screen:**

```kotlin
import too.good.crm.ui.components.ErrorScreen
import too.good.crm.ui.components.ErrorType

// Old way:
if (error != null) {
    Text("Error: $error", color = Color.Red)
}

// New way:
if (error != null) {
    ErrorScreen(
        errorType = ErrorType.NETWORK,
        message = error,
        onRetry = { viewModel.retry() }
    )
}
```

---

### 3. Better Loading States (1 minute)

```kotlin
import too.good.crm.ui.components.LoadingScreen
import too.good.crm.ui.components.SkeletonList

// Old way:
if (isLoading) {
    CircularProgressIndicator()
}

// New way (Option 1 - Simple):
if (isLoading) {
    LoadingScreen(message = "Loading customers...")
}

// New way (Option 2 - Skeleton):
if (isLoading) {
    SkeletonList(count = 5)
} else {
    LazyColumn { items(customers) { ... } }
}
```

---

### 4. Type-Safe Navigation (1 minute)

```kotlin
import too.good.crm.ui.navigation.*

// Old way (error-prone):
navController.navigate("employee-detail/$employeeId")

// New way (type-safe):
navController.navigateToEmployeeDetail(employeeId)

// Navigate to dashboard based on user mode:
navController.navigateToDashboard()
```

---

## 💡 Common Use Cases

### Show Confirmation Dialog

```kotlin
import too.good.crm.ui.components.ConfirmationDialog
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Delete

var showDeleteDialog by remember { mutableStateOf(false) }

if (showDeleteDialog) {
    ConfirmationDialog(
        title = "Delete Customer",
        message = "This action cannot be undone. Continue?",
        confirmText = "Delete",
        cancelText = "Cancel",
        destructive = true,
        icon = Icons.Default.Delete,
        onConfirm = { 
            viewModel.deleteCustomer(customerId)
        },
        onDismiss = { 
            showDeleteDialog = false 
        }
    )
}

Button(onClick = { showDeleteDialog = true }) {
    Text("Delete")
}
```

### Show Success Message

```kotlin
import too.good.crm.ui.components.SuccessDialog

var showSuccess by remember { mutableStateOf(false) }

if (showSuccess) {
    SuccessDialog(
        title = "Customer Created",
        message = "The customer has been successfully added to the system.",
        onDismiss = { 
            showSuccess = false
            navController.popBackStack()
        }
    )
}
```

### Show Loading Dialog

```kotlin
import too.good.crm.ui.components.LoadingDialog

if (uiState.isSaving) {
    LoadingDialog(message = "Saving changes...")
}
```

### Show Progress Upload

```kotlin
import too.good.crm.ui.components.ProgressIndicator

if (uploadProgress > 0f && uploadProgress < 1f) {
    ProgressIndicator(
        progress = uploadProgress,
        message = "Uploading file..."
    )
}
```

### Handle Network Errors

```kotlin
import too.good.crm.ui.components.ErrorCard

if (networkError != null) {
    ErrorCard(
        message = networkError,
        onDismiss = { 
            viewModel.clearError() 
        }
    )
}
```

---

## 📝 Real Examples from Your App

### Example 1: CustomersScreen.kt

```kotlin
@Composable
fun CustomersScreen(
    viewModel: CustomersViewModel = hiltViewModel()  // If Hilt enabled
) {
    val uiState by viewModel.uiState.collectAsState()
    var showDeleteDialog by remember { mutableStateOf<Customer?>(null) }
    
    AppScaffoldWithDrawer(
        title = "Customers"
    ) {
        when {
            uiState.isLoading && uiState.customers.isEmpty() -> {
                // Show skeleton while loading first time
                SkeletonList(count = 8)
            }
            
            uiState.error != null -> {
                // Show error with retry
                ErrorScreen(
                    errorType = ErrorType.NETWORK,
                    message = uiState.error!!,
                    onRetry = { viewModel.loadCustomers() }
                )
            }
            
            uiState.customers.isEmpty() -> {
                // Show empty state
                EmptyState(
                    message = "No customers yet",
                    icon = Icons.Default.People
                )
            }
            
            else -> {
                // Show customers
                LazyColumn {
                    items(uiState.customers) { customer ->
                        CustomerCard(
                            customer = customer,
                            onDelete = { showDeleteDialog = customer }
                        )
                    }
                }
            }
        }
    }
    
    // Delete confirmation
    showDeleteDialog?.let { customer ->
        ConfirmationDialog(
            title = "Delete Customer",
            message = "Delete ${customer.name}?",
            destructive = true,
            icon = Icons.Default.Delete,
            onConfirm = { viewModel.deleteCustomer(customer.id) },
            onDismiss = { showDeleteDialog = null }
        )
    }
}
```

### Example 2: LoginScreen.kt

```kotlin
@Composable
fun LoginScreen(
    viewModel: LoginViewModel,
    onLoginSuccess: () -> Unit
) {
    val uiState by viewModel.uiState.collectAsState()
    
    LaunchedEffect(uiState.isSuccess) {
        if (uiState.isSuccess) {
            onLoginSuccess()
        }
    }
    
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        // Login form
        OutlinedTextField(
            value = username,
            onValueChange = { username = it },
            label = { Text("Username") }
        )
        
        OutlinedTextField(
            value = password,
            onValueChange = { password = it },
            label = { Text("Password") },
            visualTransformation = PasswordVisualTransformation()
        )
        
        Button(
            onClick = { viewModel.login(username, password) },
            enabled = !uiState.isLoading,
            modifier = Modifier.fillMaxWidth()
        ) {
            if (uiState.isLoading) {
                CircularProgressIndicator(
                    modifier = Modifier.size(20.dp),
                    color = Color.White
                )
            } else {
                Text("Login")
            }
        }
        
        // Error handling
        if (uiState.error != null) {
            Spacer(modifier = Modifier.height(16.dp))
            ErrorCard(
                message = uiState.error!!,
                onDismiss = { viewModel.clearError() }
            )
        }
    }
    
    // Loading overlay for login process
    if (uiState.isLoading) {
        LoadingDialog(message = "Logging in...")
    }
}
```

---

## 🎨 Customization

All components support customization:

```kotlin
// Custom colors
ErrorScreen(
    errorType = ErrorType.GENERIC,
    message = "Something went wrong",
    modifier = Modifier
        .fillMaxSize()
        .background(Color.Red.copy(alpha = 0.1f))
)

// Custom loading message
LoadingScreen(
    message = "Fetching latest data..."
)

// Custom dialog buttons
ConfirmationDialog(
    title = "Save Changes",
    message = "Do you want to save?",
    confirmText = "Yes, Save",
    cancelText = "No, Discard",
    onConfirm = { save() },
    onDismiss = { discard() }
)
```

---

## 🔥 Pro Tips

### Tip 1: Combine Loading States

```kotlin
Box(modifier = Modifier.fillMaxSize()) {
    LazyColumn {
        items(customers) { CustomerCard(it) }
    }
    
    // Show top loading bar while refreshing
    if (isRefreshing) {
        LinearLoadingIndicator()
    }
}
```

### Tip 2: Use Skeleton for Better UX

```kotlin
// First load: Show skeleton
// Subsequent loads: Show data + top loading bar
when {
    isLoading && data.isEmpty() -> SkeletonList(count = 5)
    else -> {
        if (isRefreshing) LinearLoadingIndicator()
        LazyColumn { items(data) { /* items */ } }
    }
}
```

### Tip 3: Error Recovery

```kotlin
ErrorScreen(
    errorType = ErrorType.NETWORK,
    message = "Unable to connect",
    onRetry = {
        viewModel.retry()
        // Optional: Track analytics
        analytics.logEvent("retry_network_error")
    }
)
```

---

## ✅ Implementation Checklist

Copy this checklist and complete it:

**Theme (5 minutes):**
- [ ] Update MainActivity to use `TooGoodCrmTheme`
- [ ] Test dark mode (swipe down → dark mode toggle)
- [ ] Test on Android 12+ for dynamic colors

**Error Handling (10 minutes):**
- [ ] Replace error Text with `ErrorScreen` in main screens
- [ ] Add `ErrorCard` for inline errors
- [ ] Add retry functionality to ViewModels

**Loading States (10 minutes):**
- [ ] Replace CircularProgressIndicator with `LoadingScreen`
- [ ] Add `SkeletonList` for list screens
- [ ] Add `LoadingDialog` for save operations

**Navigation (5 minutes):**
- [ ] Import navigation helpers
- [ ] Replace string routes with type-safe functions
- [ ] Test navigation works correctly

**Dialogs (10 minutes):**
- [ ] Add confirmation dialogs for delete actions
- [ ] Add success dialogs after save operations
- [ ] Test dialog dismissal works correctly

**Total Time: ~40 minutes** ⏱️

---

## 🚨 Common Mistakes to Avoid

### ❌ Don't Do This:
```kotlin
// Mixing old and new patterns
TooGoodCrmTheme {
    MaterialTheme {  // ❌ Nested themes
        Content()
    }
}
```

### ✅ Do This:
```kotlin
TooGoodCrmTheme {  // ✅ Single theme
    Content()
}
```

---

### ❌ Don't Do This:
```kotlin
// String-based navigation
navController.navigate("employee-detail/${emp.id}")  // ❌ Error-prone
```

### ✅ Do This:
```kotlin
// Type-safe navigation
navController.navigateToEmployeeDetail(emp.id)  // ✅ Safe
```

---

## 🎓 Next Steps

After implementing these basics:

1. **Enable Hilt** - See `HILT_SETUP_INSTRUCTIONS.md`
2. **Add Tests** - Test your ViewModels with mocked repositories
3. **Add Room** - Offline data caching
4. **Add FCM** - Push notifications
5. **Measure Performance** - Use Android Profiler

---

## 📞 Need Help?

Check these files:
- `ANDROID_IMPROVEMENTS_SUMMARY.md` - Full details of all improvements
- `HILT_SETUP_INSTRUCTIONS.md` - Dependency injection setup
- Individual component files - Detailed documentation in code

---

**Ready? Start with Theme.kt in MainActivity and you'll see improvements immediately!** 🚀

