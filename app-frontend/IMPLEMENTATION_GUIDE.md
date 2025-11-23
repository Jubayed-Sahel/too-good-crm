# Android App - Complete Implementation Guide

## Overview
This document provides detailed implementation steps for Sales, Team, and Settings screens based on web frontend analysis.

---

## 🔧 CURRENT STATE SUMMARY

### ✅ What's Already Good:
1. **Design System** - All screens use DesignTokens consistently
2. **Compact Stats** - Activities, Customers, Sales, Issues, Team all have compact stat cards
3. **Navigation** - AppScaffold with drawer navigation works well
4. **UI Components** - Buttons, cards, lists are well-designed
5. **Borders & Elevation** - All cards have proper styling

### ⚠️ What Needs Work:
1. **API Integration** - Most screens use mock/sample data
2. **Real Actions** - Edit/Delete/Create features need implementation
3. **Detail Screens** - Missing for employees, deals, etc.
4. **Forms & Dialogs** - Need proper input validation
5. **Error Handling** - Need proper loading/error states

---

## 1. SETTINGS SCREEN IMPLEMENTATION

### Current Issues:
- ❌ Hardcoded profile data ("John Doe")
- ❌ No real password change functionality
- ❌ No actual profile editing
- ❌ Mock email/phone data

### Implementation Steps:

#### Step 1: Create User Repository
```kotlin
// app/src/main/java/too/good/crm/data/repository/UserRepository.kt
class UserRepository(private val context: Context) {
    private val apiClient = ApiClient.getInstance(context)
    
    suspend fun getCurrentUser(): User {
        return apiClient.get("/users/me/")
    }
    
    suspend fun updateProfile(data: UpdateProfileRequest): User {
        return apiClient.patch("/users/me/", data)
    }
    
    suspend fun changePassword(currentPassword: String, newPassword: String) {
        return apiClient.post("/users/change-password/", mapOf(
            "current_password" to currentPassword,
            "new_password" to newPassword
        ))
    }
}
```

#### Step 2: Create Settings ViewModel
```kotlin
// app/src/main/java/too/good/crm/features/settings/SettingsViewModel.kt
class SettingsViewModel(context: Context) : ViewModel() {
    private val userRepository = UserRepository(context)
    
    private val _uiState = MutableStateFlow<SettingsUiState>(SettingsUiState.Loading)
    val uiState: StateFlow<SettingsUiState> = _uiState.asStateFlow()
    
    init {
        loadUserProfile()
    }
    
    fun loadUserProfile() {
        viewModelScope.launch {
            try {
                _uiState.value = SettingsUiState.Loading
                val user = userRepository.getCurrentUser()
                _uiState.value = SettingsUiState.Success(user)
            } catch (e: Exception) {
                _uiState.value = SettingsUiState.Error(e.message ?: "Failed to load profile")
            }
        }
    }
    
    fun updateProfile(data: UpdateProfileRequest) { ... }
    fun changePassword(current: String, new: String) { ... }
}

sealed class SettingsUiState {
    object Loading : SettingsUiState()
    data class Success(val user: User) : SettingsUiState()
    data class Error(val message: String) : SettingsUiState()
}
```

#### Step 3: Update SettingsScreen.kt
```kotlin
// Replace hardcoded data with ViewModel
val viewModel: SettingsViewModel = viewModel()
val uiState by viewModel.uiState.collectAsState()

when (val state = uiState) {
    is SettingsUiState.Loading -> CircularProgressIndicator()
    is SettingsUiState.Success -> {
        // Show real user data
        Text(text = "${state.user.first_name} ${state.user.last_name}")
        Text(text = state.user.email)
    }
    is SettingsUiState.Error -> ErrorView(state.message)
}
```

#### Step 4: Create Change Password Dialog
```kotlin
// app/src/main/java/too/good/crm/features/settings/ChangePasswordDialog.kt
@Composable
fun ChangePasswordDialog(
    isOpen: Boolean,
    onDismiss: () -> Unit,
    onConfirm: (current: String, new: String, confirm: String) -> Unit
) {
    var currentPassword by remember { mutableStateOf("") }
    var newPassword by remember { mutableStateOf("") }
    var confirmPassword by remember { mutableStateOf("") }
    var showError by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf("") }
    
    if (isOpen) {
        AlertDialog(
            onDismissRequest = onDismiss,
            title = { Text("Change Password") },
            text = {
                Column {
                    OutlinedTextField(
                        value = currentPassword,
                        onValueChange = { currentPassword = it },
                        label = { Text("Current Password") },
                        visualTransformation = PasswordVisualTransformation()
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                    OutlinedTextField(
                        value = newPassword,
                        onValueChange = { newPassword = it },
                        label = { Text("New Password") },
                        visualTransformation = PasswordVisualTransformation()
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                    OutlinedTextField(
                        value = confirmPassword,
                        onValueChange = { confirmPassword = it },
                        label = { Text("Confirm Password") },
                        visualTransformation = PasswordVisualTransformation()
                    )
                    
                    // Password requirements
                    if (showError) {
                        Text(
                            text = errorMessage,
                            color = DesignTokens.Colors.Error,
                            fontSize = 12.sp
                        )
                    }
                }
            },
            confirmButton = {
                Button(onClick = {
                    when {
                        newPassword != confirmPassword -> {
                            showError = true
                            errorMessage = "Passwords don't match"
                        }
                        newPassword.length < 6 -> {
                            showError = true
                            errorMessage = "Password must be at least 6 characters"
                        }
                        else -> onConfirm(currentPassword, newPassword, confirmPassword)
                    }
                }) {
                    Text("Change Password")
                }
            },
            dismissButton = {
                TextButton(onClick = onDismiss) {
                    Text("Cancel")
                }
            }
        )
    }
}
```

---

## 2. TEAM SCREEN IMPLEMENTATION

### Current Issues:
- ❌ Uses mock `TeamSampleData.getTeamMembers()`
- ❌ No real employee data from API
- ❌ No invite employee functionality
- ❌ No edit/delete actions

### Implementation Steps:

#### Step 1: Create Employee Repository
```kotlin
// app/src/main/java/too/good/crm/data/repository/EmployeeRepository.kt
class EmployeeRepository(private val context: Context) {
    private val apiClient = ApiClient.getInstance(context)
    
    suspend fun getEmployees(): List<Employee> {
        val response: PaginatedResponse<Employee> = apiClient.get("/employees/")
        return response.results
    }
    
    suspend fun getEmployee(id: Int): Employee {
        return apiClient.get("/employees/$id/")
    }
    
    suspend fun inviteEmployee(email: String, roleId: Int): Employee {
        return apiClient.post("/employees/invite/", mapOf(
            "email" to email,
            "role" to roleId
        ))
    }
    
    suspend fun updateEmployee(id: Int, data: UpdateEmployeeRequest): Employee {
        return apiClient.patch("/employees/$id/", data)
    }
    
    suspend fun deleteEmployee(id: Int) {
        apiClient.delete("/employees/$id/")
    }
}
```

#### Step 2: Create Team ViewModel
```kotlin
// app/src/main/java/too/good/crm/features/team/TeamViewModel.kt
class TeamViewModel(context: Context) : ViewModel() {
    private val employeeRepository = EmployeeRepository(context)
    
    private val _uiState = MutableStateFlow<TeamUiState>(TeamUiState.Loading)
    val uiState: StateFlow<TeamUiState> = _uiState.asStateFlow()
    
    init {
        loadEmployees()
    }
    
    fun loadEmployees() {
        viewModelScope.launch {
            try {
                _uiState.value = TeamUiState.Loading
                val employees = employeeRepository.getEmployees()
                _uiState.value = TeamUiState.Success(employees)
            } catch (e: Exception) {
                _uiState.value = TeamUiState.Error(e.message ?: "Failed to load employees")
            }
        }
    }
    
    fun inviteEmployee(email: String, roleId: Int) { ... }
    fun deleteEmployee(id: Int) { ... }
}
```

#### Step 3: Update TeamScreen.kt
```kotlin
// Replace mock data
// OLD:
val teamMembers = remember { TeamSampleData.getTeamMembers() }

// NEW:
val viewModel: TeamViewModel = viewModel()
val uiState by viewModel.uiState.collectAsState()

when (val state = uiState) {
    is TeamUiState.Loading -> CircularProgressIndicator()
    is TeamUiState.Success -> {
        val teamMembers = state.employees
        // Update stats
        Text("${teamMembers.size}")  // Total
        Text("${teamMembers.count { it.is_active }}")  // Active
    }
    is TeamUiState.Error -> ErrorView(state.message)
}
```

#### Step 4: Create Invite Employee Dialog
```kotlin
// app/src/main/java/too/good/crm/features/team/InviteEmployeeDialog.kt
@Composable
fun InviteEmployeeDialog(
    isOpen: Boolean,
    onDismiss: () -> Unit,
    onInvite: (email: String, roleId: Int) -> Unit
) {
    var email by remember { mutableStateOf("") }
    var selectedRole by remember { mutableStateOf(1) }  // Default role
    
    if (isOpen) {
        AlertDialog(
            onDismissRequest = onDismiss,
            title = { Text("Invite Team Member") },
            text = {
                Column {
                    OutlinedTextField(
                        value = email,
                        onValueChange = { email = it },
                        label = { Text("Email Address") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email)
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                    // Role dropdown
                    Text("Role")
                    // Add role selection UI
                }
            },
            confirmButton = {
                Button(onClick = { onInvite(email, selectedRole) }) {
                    Text("Send Invite")
                }
            },
            dismissButton = {
                TextButton(onClick = onDismiss) {
                    Text("Cancel")
                }
            }
        )
    }
}
```

---

## 3. SALES SCREEN IMPLEMENTATION

### Current Issues:
- ❌ Uses mock data
- ❌ No real deals from API
- ❌ No deal details screen
- ❌ No filters working

### Implementation Steps:

#### Step 1: Create Deal Repository
```kotlin
// app/src/main/java/too/good/crm/data/repository/DealRepository.kt
class DealRepository(private val context: Context) {
    private val apiClient = ApiClient.getInstance(context)
    
    suspend fun getDeals(stage: String? = null): List<Deal> {
        val params = mutableMapOf<String, String>()
        if (stage != null) params["stage"] = stage
        
        val response: PaginatedResponse<Deal> = apiClient.get("/deals/", params)
        return response.results
    }
    
    suspend fun getDeal(id: Int): Deal {
        return apiClient.get("/deals/$id/")
    }
    
    suspend fun createDeal(data: CreateDealRequest): Deal {
        return apiClient.post("/deals/", data)
    }
    
    suspend fun updateDeal(id: Int, data: UpdateDealRequest): Deal {
        return apiClient.patch("/deals/$id/", data)
    }
    
    suspend fun getDealStats(): DealStats {
        return apiClient.get("/deals/stats/")
    }
}
```

#### Step 2: Create Sales ViewModel
```kotlin
// app/src/main/java/too/good/crm/features/sales/SalesViewModel.kt
class SalesViewModel(context: Context) : ViewModel() {
    private val dealRepository = DealRepository(context)
    
    private val _uiState = MutableStateFlow<SalesUiState>(SalesUiState.Loading)
    val uiState: StateFlow<SalesUiState> = _uiState.asStateFlow()
    
    private val _stats = MutableStateFlow<DealStats?>(null)
    val stats: StateFlow<DealStats?> = _stats.asStateFlow()
    
    init {
        loadDeals()
        loadStats()
    }
    
    fun loadDeals(stage: String? = null) {
        viewModelScope.launch {
            try {
                _uiState.value = SalesUiState.Loading
                val deals = dealRepository.getDeals(stage)
                _uiState.value = SalesUiState.Success(deals)
            } catch (e: Exception) {
                _uiState.value = SalesUiState.Error(e.message ?: "Failed to load deals")
            }
        }
    }
    
    fun loadStats() {
        viewModelScope.launch {
            try {
                _stats.value = dealRepository.getDealStats()
            } catch (e: Exception) {
                // Log error but don't fail the whole screen
            }
        }
    }
}
```

#### Step 3: Update SalesScreen.kt
```kotlin
// Replace mock metric cards
// OLD:
SalesMetricCard(title = "Revenue", value = "$485K", ...)

// NEW:
val viewModel: SalesViewModel = viewModel()
val stats by viewModel.stats.collectAsState()

stats?.let {
    SalesMetricCard(
        title = "Revenue",
        value = formatCurrency(it.total_value),
        change = "+${it.revenue_change}%",
        ...
    )
}
```

---

## 4. API MODELS NEEDED

### User Model
```kotlin
data class User(
    val id: Int,
    val email: String,
    val first_name: String,
    val last_name: String,
    val phone: String?,
    val title: String?,
    val department: String?,
    val is_active: Boolean
)

data class UpdateProfileRequest(
    val first_name: String?,
    val last_name: String?,
    val phone: String?,
    val title: String?,
    val department: String?
)
```

### Employee Model
```kotlin
data class Employee(
    val id: Int,
    val user: User,
    val first_name: String,
    val last_name: String,
    val email: String,
    val role: Role,
    val department: String?,
    val job_title: String?,
    val is_active: Boolean,
    val hire_date: String?,
    val last_login: String?
)

data class Role(
    val id: Int,
    val name: String,
    val description: String?
)
```

### Deal Model
```kotlin
data class Deal(
    val id: Int,
    val title: String,
    val value: Double,
    val stage: String,
    val probability: Int,
    val close_date: String?,
    val customer: Customer?,
    val owner: User?,
    val created_at: String,
    val updated_at: String
)

data class DealStats(
    val total_value: Double,
    val open_deals: Int,
    val won_deals: Int,
    val win_rate: Double,
    val revenue_change: Double
)
```

---

## 5. PRIORITY IMPLEMENTATION ORDER

### Week 1: Settings Screen
1. ✅ Create UserRepository
2. ✅ Create SettingsViewModel
3. ✅ Update SettingsScreen to use real data
4. ✅ Implement Change Password dialog
5. ✅ Add error handling & loading states

### Week 2: Team Screen
1. ✅ Create EmployeeRepository
2. ✅ Create TeamViewModel
3. ✅ Update TeamScreen to use real data
4. ✅ Implement Invite Employee dialog
5. ✅ Add employee detail screen
6. ✅ Implement delete confirmation

### Week 3: Sales Screen
1. ✅ Create DealRepository
2. ✅ Create SalesViewModel
3. ✅ Update SalesScreen to use real data
4. ✅ Add deal detail screen
5. ✅ Implement filters
6. ✅ Add create deal dialog

---

## 6. TESTING CHECKLIST

### Settings:
- [ ] Load real user profile
- [ ] Update profile (name, phone, etc.)
- [ ] Change password (success & error cases)
- [ ] Show loading state
- [ ] Handle API errors
- [ ] Logout works

### Team:
- [ ] Load real employees
- [ ] Show correct stats
- [ ] Invite employee works
- [ ] View employee details
- [ ] Delete employee with confirmation
- [ ] Search & filter work
- [ ] Handle permissions (vendor vs employee)

### Sales:
- [ ] Load real deals
- [ ] Show correct stats from API
- [ ] View deal details
- [ ] Filter by stage
- [ ] Search deals
- [ ] Create new deal
- [ ] Update deal stage

---

## 7. COMMON PATTERNS TO FOLLOW

### Loading State:
```kotlin
when (val state = uiState) {
    is UiState.Loading -> {
        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            CircularProgressIndicator()
        }
    }
    is UiState.Success -> { /* Show content */ }
    is UiState.Error -> {
        ErrorView(
            message = state.message,
            onRetry = { viewModel.retry() }
        )
    }
}
```

### Pull to Refresh:
```kotlin
val swipeRefreshState = rememberSwipeRefreshState(isRefreshing)

SwipeRefresh(
    state = swipeRefreshState,
    onRefresh = { viewModel.refresh() }
) {
    // Content
}
```

### Confirmation Dialogs:
```kotlin
if (showDeleteDialog) {
    AlertDialog(
        onDismissRequest = { showDeleteDialog = false },
        title = { Text("Confirm Delete") },
        text = { Text("Are you sure you want to delete this item?") },
        confirmButton = {
            Button(
                onClick = {
                    viewModel.delete(itemId)
                    showDeleteDialog = false
                },
                colors = ButtonDefaults.buttonColors(
                    containerColor = DesignTokens.Colors.Error
                )
            ) {
                Text("Delete")
            }
        },
        dismissButton = {
            TextButton(onClick = { showDeleteDialog = false }) {
                Text("Cancel")
            }
        }
    )
}
```

---

## SUMMARY

This guide provides complete implementation details for:
1. **Settings Screen** - Profile editing & password change
2. **Team Screen** - Real employee management
3. **Sales Screen** - Real deals & stats

All three screens follow the same patterns:
- ✅ Repository for API calls
- ✅ ViewModel for state management
- ✅ Proper loading/error states
- ✅ Dialogs for actions
- ✅ Consistent DesignTokens usage

**Estimated Total Time**: 3-4 weeks for complete implementation with proper testing.


