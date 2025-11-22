# API Integration - Quick Reference

## 🚀 Quick Start (5 Minutes)

### 1. Start Backend
```bash
cd shared-backend
python manage.py runserver 0.0.0.0:8000
```

### 2. Run App
```bash
cd app-frontend
./gradlew installDebug
```

### 3. App automatically connects to `http://10.0.2.2:8000/api/`

---

## 📱 Using ViewModels in Screens

### Replace Sample Data with Real API

**Before:**
```kotlin
val leads = remember { LeadSampleData.getLeads() }
```

**After:**
```kotlin
val viewModel = remember { LeadsViewModel() }
val uiState by viewModel.uiState.collectAsState()

when {
    uiState.isLoading -> LoadingScreen()
    uiState.error != null -> ErrorScreen(message = uiState.error!!)
    else -> LazyColumn { items(uiState.leads) { LeadCard(it) } }
}
```

---

## 🎯 Common Patterns

### Pattern 1: List Screen
```kotlin
@Composable
fun ListScreen() {
    val viewModel = remember { LeadsViewModel() }
    val uiState by viewModel.uiState.collectAsState()
    
    SwipeRefresh(
        state = rememberSwipeRefreshState(uiState.isRefreshing),
        onRefresh = { viewModel.refresh() }
    ) {
        when {
            uiState.isLoading && uiState.leads.isEmpty() -> 
                SkeletonList(count = 5)
            uiState.error != null -> 
                ErrorCard(message = uiState.error!!)
            uiState.leads.isEmpty() -> 
                EmptyState(message = "No leads yet")
            else -> 
                LazyColumn {
                    items(uiState.leads) { lead ->
                        LeadCard(lead)
                    }
                }
        }
    }
}
```

### Pattern 2: Create/Edit
```kotlin
@Composable
fun CreateScreen() {
    val viewModel = remember { LeadsViewModel() }
    val uiState by viewModel.uiState.collectAsState()
    var showSuccess by remember { mutableStateOf(false) }
    
    Column {
        // Form fields
        OutlinedTextField(value = name, onValueChange = { name = it })
        
        // Submit button
        Button(
            onClick = {
                viewModel.createLead(
                    lead = CreateLeadRequest(name = name, ...),
                    onSuccess = { showSuccess = true }
                )
            },
            enabled = !uiState.isCreating
        ) {
            if (uiState.isCreating) {
                CircularProgressIndicator(modifier = Modifier.size(20.dp))
            } else {
                Text("Create Lead")
            }
        }
    }
    
    // Show dialog
    if (showSuccess) {
        SuccessDialog(
            title = "Lead Created",
            message = "Lead has been created successfully",
            onDismiss = { navController.popBackStack() }
        )
    }
    
    // Show error
    if (uiState.error != null) {
        ErrorDialog(
            title = "Error",
            message = uiState.error!!,
            onDismiss = { viewModel.clearError() }
        )
    }
}
```

### Pattern 3: Detail Screen with Actions
```kotlin
@Composable
fun DetailScreen(id: Int) {
    val viewModel = remember { LeadsViewModel() }
    var showDeleteDialog by remember { mutableStateOf(false) }
    
    // Load detail
    LaunchedEffect(id) {
        viewModel.loadLead(id)
    }
    
    Column {
        // Display details
        Text(lead.name)
        Text(lead.email)
        
        // Action buttons
        Row {
            Button(onClick = { showDeleteDialog = true }) {
                Text("Delete")
            }
            Button(onClick = { 
                viewModel.convertLead(id) {
                    // Navigate back
                }
            }) {
                Text("Convert to Customer")
            }
        }
    }
    
    // Confirmation dialog
    if (showDeleteDialog) {
        ConfirmationDialog(
            title = "Delete Lead",
            message = "Are you sure?",
            destructive = true,
            onConfirm = {
                viewModel.deleteLead(id) {
                    navController.popBackStack()
                }
            },
            onDismiss = { showDeleteDialog = false }
        )
    }
}
```

---

## 🔍 Available ViewModels

| Screen | ViewModel | Main Functions |
|--------|-----------|----------------|
| Leads | `LeadsViewModel` | `loadLeads()`, `createLead()`, `searchLeads()`, `filterByStatus()`, `convertLead()` |
| Deals | `DealsViewModel` | `loadDeals()`, `createDeal()`, `filterByStage()`, `winDeal()`, `loseDeal()`, `moveDealStage()` |
| Messages | `MessagesViewModel` | `loadConversations()`, `loadMessages()`, `sendMessage()`, `createConversation()` |
| Activities | `ActivitiesViewModel` | `loadActivities()`, `createActivity()`, `filterByType()`, `completeActivity()` |
| Sales | `SalesViewModel` | `loadDashboardStats()`, `loadSalesReport()`, `changePeriod()` |

---

## 📊 UI State Properties

### Common to All ViewModels

```kotlin
data class UiState(
    val data: List<T>,           // The data list
    val isLoading: Boolean,      // Initial load
    val isRefreshing: Boolean,   // Pull-to-refresh
    val isCreating: Boolean,     // Creating new item
    val error: String?,          // Error message
    val searchQuery: String,     // Current search
    val selectedFilter: String?, // Current filter
    val totalCount: Int          // Total items
)
```

### Usage in UI

```kotlin
val uiState by viewModel.uiState.collectAsState()

// Show loading
if (uiState.isLoading) { ... }

// Show error
if (uiState.error != null) { ... }

// Show data
LazyColumn {
    items(uiState.data) { item -> ... }
}

// Show creating indicator
if (uiState.isCreating) { ... }
```

---

## 🎨 Using New Components

### Error Handling

```kotlin
import too.good.crm.ui.components.ErrorScreen
import too.good.crm.ui.components.ErrorType

ErrorScreen(
    errorType = ErrorType.NETWORK,
    message = "Unable to connect to server",
    onRetry = { viewModel.refresh() }
)
```

### Loading States

```kotlin
import too.good.crm.ui.components.LoadingScreen
import too.good.crm.ui.components.SkeletonList

// Full screen
LoadingScreen(message = "Loading leads...")

// Skeleton (better UX)
SkeletonList(count = 5)

// Dialog
LoadingDialog(message = "Creating lead...")
```

### Dialogs

```kotlin
import too.good.crm.ui.components.*

// Confirmation
ConfirmationDialog(
    title = "Delete Lead",
    message = "Are you sure?",
    destructive = true,
    icon = Icons.Default.Delete,
    onConfirm = { delete() },
    onDismiss = { close() }
)

// Success
SuccessDialog(
    title = "Success!",
    message = "Lead created successfully",
    onDismiss = { navigate() }
)

// Error
ErrorDialog(
    title = "Error",
    message = error,
    onDismiss = { clearError() }
)
```

---

## 🔄 API Call Flow

```
User Action
    ↓
ViewModel Function
    ↓
Repository.method()
    ↓
safeApiCall { ApiService.endpoint() }
    ↓
NetworkResult<T>
    ├─ Success → Update UI State with data
    ├─ Error → Update UI State with message
    └─ Exception → Update UI State with error
    ↓
StateFlow emits new state
    ↓
UI recomposes automatically
```

---

## 🛠️ Customization

### Add Filter

```kotlin
// In ViewModel
fun filterByPriority(priority: String?) {
    viewModelScope.launch {
        _uiState.value = _uiState.value.copy(
            isLoading = true,
            selectedPriority = priority
        )
        when (val result = repository.getLeads(priority = priority)) {
            is NetworkResult.Success -> {
                _uiState.value = _uiState.value.copy(
                    leads = result.data.results,
                    isLoading = false
                )
            }
            // ... error handling
        }
    }
}

// In UI
FilterChip(
    selected = uiState.selectedPriority == "high",
    onClick = { viewModel.filterByPriority("high") },
    label = { Text("High Priority") }
)
```

### Add Sorting

```kotlin
// In Repository
suspend fun getLeadsSorted(ordering: String) = safeApiCall {
    apiService.getLeads(ordering = ordering)
}

// In ViewModel
fun sortBy(field: String, descending: Boolean = true) {
    val ordering = if (descending) "-$field" else field
    loadLeads(ordering = ordering)
}

// In UI
DropdownMenu {
    DropdownMenuItem(onClick = { viewModel.sortBy("created_at") }) {
        Text("Sort by Date")
    }
    DropdownMenuItem(onClick = { viewModel.sortBy("name") }) {
        Text("Sort by Name")
    }
}
```

---

## 🐛 Debugging

### Enable Logging

Retrofit already logs all requests/responses in `ApiClient.kt`:

```kotlin
private val loggingInterceptor = HttpLoggingInterceptor().apply {
    level = HttpLoggingInterceptor.Level.BODY
}
```

View logs in Android Studio Logcat filtered by "okhttp"

### Common Issues

**Issue: "Unable to resolve host"**
- ✅ Check backend is running on `0.0.0.0:8000`
- ✅ Check emulator is using `10.0.2.2` (not `localhost`)

**Issue: "401 Unauthorized"**
- ✅ Check token is set: `ApiClient.setAuthToken(token)`
- ✅ Check token is valid in backend

**Issue: "Empty response"**
- ✅ Check backend returns correct JSON format
- ✅ Check data models match backend fields

---

## 📝 Files to Update

### Priority Order

1. ✅ **LeadsScreen.kt** - Replace sample data
2. ✅ **DealsScreen.kt** - Replace sample data  
3. ✅ **MessagesScreen.kt** - Connect real API
4. ✅ **ActivitiesScreen.kt** - Use ActivitiesViewModel
5. ✅ **SalesScreen.kt** - Use SalesViewModel
6. ✅ **AnalyticsScreen.kt** - Use real analytics

---

## ⚡ Performance Tips

1. **Use pagination** - Already supported in repositories
2. **Cache data** - Consider adding Room database
3. **Debounce search** - Add delay before searching
4. **Show skeletons** - Better than spinners
5. **Optimistic updates** - Update UI before API confirms

---

## 🎯 Next Steps

1. Update screens to use ViewModels (**easiest**)
2. Remove sample data files
3. Test with backend
4. Add offline support (Room)
5. Add push notifications (FCM)
6. Add real-time updates (Pusher)

---

**Everything is ready to use!** Just replace sample data with ViewModels. 🚀

**See Also:**
- `API_INTEGRATION_COMPLETE.md` - Full documentation
- Individual ViewModel files - Usage examples
- `ErrorComponents.kt` - Error handling components
- `LoadingComponents.kt` - Loading state components

