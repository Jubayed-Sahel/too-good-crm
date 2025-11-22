# 🔄 Profile Switching Implementation Template

## Overview

This template documents the **complete profile switching flow** from the web frontend, which will be replicated in the Android app.

---

## 🏗️ Architecture

### Components

```
┌─────────────────────────────────────────────────────────────┐
│                    User Interface Layer                      │
├─────────────────────────────────────────────────────────────┤
│  ProfileSwitcher Component                                   │
│  - Displays current profile                                  │
│  - Shows dropdown with available profiles                    │
│  - Groups profiles by type                                   │
│  - Handles click events                                      │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────┐
│                   ViewModel/Hook Layer                       │
├─────────────────────────────────────────────────────────────┤
│  ProfileViewModel / useAuth Hook                             │
│  - Manages profile state                                     │
│  - Handles optimistic updates                                │
│  - Calls API service                                         │
│  - Triggers navigation                                       │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────┐
│                     API Service Layer                        │
├─────────────────────────────────────────────────────────────┤
│  RoleSelectionService / RoleSelectionApiService              │
│  - Makes HTTP POST request                                   │
│  - Sends profile_id                                          │
│  - Returns updated user data                                 │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────┐
│                        Backend API                           │
├─────────────────────────────────────────────────────────────┤
│  /api/auth/role-selection/select_role/                      │
│  - Validates profile_id                                      │
│  - Marks all profiles as non-primary                         │
│  - Marks selected profile as primary                         │
│  - Returns updated user with profiles                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 📡 API Contract

### Endpoint

```
POST /api/auth/role-selection/select_role/
```

### Request

```json
{
  "profile_id": 123
}
```

### Response (Success - 200)

```json
{
  "message": "Switched to Employee role",
  "user": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com",
    "first_name": "Test",
    "last_name": "User",
    "profiles": [
      {
        "id": 123,
        "user": 1,
        "organization": 5,
        "organization_name": "Test Company",
        "profile_type": "employee",
        "profile_type_display": "Employee",
        "is_primary": true,
        "status": "active",
        "roles": [...]
      },
      {
        "id": 124,
        "user": 1,
        "organization": null,
        "profile_type": "customer",
        "profile_type_display": "Customer",
        "is_primary": false,
        "status": "active",
        "roles": []
      }
    ],
    "primaryProfile": {
      "id": 123,
      "profile_type": "employee",
      "is_primary": true,
      ...
    }
  },
  "active_profile": {
    "id": 123,
    "profile_type": "employee",
    ...
  }
}
```

### Response (Error - 400)

```json
{
  "error": "profile_id is required"
}
```

### Response (Error - 404)

```json
{
  "error": "Profile not found or not active"
}
```

---

## 🔄 Complete Flow (Web Frontend)

### Phase 1: User Initiates Switch

```typescript
// User clicks on profile in dropdown
onClick={() => {
  if (isSwitching || profile.id === activeProfile.id) return;
  setIsSwitching(true);
  
  // Show immediate feedback
  toaster.create({
    title: 'Switching Profile',
    description: `Switching to ${profile.organization_name}...`,
    type: 'info',
    duration: 1500,
  });
  
  // Call switch function
  switchRole(profile.id);
}}
```

### Phase 2: Optimistic Update (Instant UI Feedback)

```typescript
const switchRole = async (profileId: number) => {
  try {
    // STEP 1: Optimistic update for instant UI
    const currentUser = user || JSON.parse(localStorage.getItem('user') || '{}');
    
    if (currentUser && currentUser.profiles) {
      const selectedProfile = currentUser.profiles.find(p => p.id === profileId);
      
      if (selectedProfile) {
        // Create optimistic user object
        const optimisticUser = {
          ...currentUser,
          primaryProfile: selectedProfile,
          profiles: currentUser.profiles.map(p => ({
            ...p,
            is_primary: p.id === profileId
          }))
        };
        
        // Update local storage immediately
        localStorage.setItem('user', JSON.stringify(optimisticUser));
        
        // Update state immediately
        setUser(optimisticUser);
      }
    }
    
    // STEP 2: Make API call in background
    const response = await roleSelectionService.selectRole(profileId);
    
    // ... continue to Phase 3
  } catch (error) {
    // ... handle error
  }
};
```

### Phase 3: API Call & Validation

```typescript
// API Service
class RoleSelectionService {
  async selectRole(profileId: number): Promise<SelectRoleResponse> {
    return api.post<SelectRoleResponse>(
      '/api/auth/role-selection/select_role/',
      { profile_id: profileId }
    );
  }
}

// In switchRole function (continued)
const response = await roleSelectionService.selectRole(profileId);

if (!response || !response.user) {
  throw new Error('Invalid response from server');
}

// Process user data
const processedUser = processUserData(response.user);

// Update storage with server response
localStorage.setItem('user', JSON.stringify(processedUser));

// Update state with server response
setUser(processedUser);
```

### Phase 4: Navigation & Reload

```typescript
// Determine target route based on profile type
const targetRoute = getTargetRoute(processedUser);

// Helper function
function getTargetRoute(user: User): string {
  const primaryProfile = user.primaryProfile;
  
  switch (primaryProfile?.profile_type) {
    case 'customer':
      return '/client/dashboard';
    case 'vendor':
    case 'employee':
    default:
      return '/dashboard';
  }
}

// Force page reload to ensure clean state
requestAnimationFrame(() => {
  window.location.href = targetRoute;
});
```

### Phase 5: Error Handling

```typescript
try {
  // ... switching logic
} catch (error: any) {
  console.error('❌ Role switch failed:', error);
  
  // Reset switching state
  setIsSwitching(false);
  
  // Show error toast
  toaster.create({
    title: 'Switch Failed',
    description: error?.message || 'Failed to switch profile. Please try again.',
    type: 'error',
    duration: 3000,
  });
  
  // Optionally: Revert optimistic update
  // (In web, we rely on page reload on success, so no need)
}
```

---

## 🎯 Android Implementation Steps

### Step 1: Create API Service

```kotlin
// File: data/api/RoleSelectionApiService.kt

interface RoleSelectionApiService {
    @POST("auth/role-selection/select_role/")
    suspend fun selectRole(
        @Body request: SelectRoleRequest
    ): Response<SelectRoleResponse>
    
    @GET("auth/role-selection/available_roles/")
    suspend fun getAvailableRoles(): Response<AvailableRolesResponse>
    
    @GET("auth/role-selection/current_role/")
    suspend fun getCurrentRole(): Response<CurrentRoleResponse>
}

data class SelectRoleRequest(
    @SerializedName("profile_id") val profileId: Int
)

data class SelectRoleResponse(
    val message: String,
    val user: User,
    @SerializedName("active_profile") val activeProfile: UserProfile
)
```

### Step 2: Create Repository

```kotlin
// File: data/repository/ProfileRepository.kt (extend existing)

suspend fun switchProfile(profileId: Int): Result<User> {
    return try {
        val response = roleSelectionApiService.selectRole(
            SelectRoleRequest(profileId)
        )
        
        if (response.isSuccessful && response.body() != null) {
            val data = response.body()!!
            
            // Save updated user data
            saveUserData(data.user)
            
            // Update active profile
            setActiveProfile(data.activeProfile)
            
            Result.success(data.user)
        } else {
            Result.failure(Exception(
                when (response.code()) {
                    400 -> "Invalid profile selection"
                    404 -> "Profile not found or inactive"
                    else -> "Failed to switch profile"
                }
            ))
        }
    } catch (e: Exception) {
        Result.failure(e)
    }
}
```

### Step 3: Update ViewModel

```kotlin
// File: features/profile/ProfileViewModel.kt

class ProfileViewModel @Inject constructor(
    private val profileRepository: ProfileRepository
) : ViewModel() {
    
    private val _uiState = MutableStateFlow(ProfileUiState())
    val uiState: StateFlow<ProfileUiState> = _uiState.asStateFlow()
    
    fun switchProfile(
        profileId: Int,
        onSuccess: (User) -> Unit,
        onError: (String) -> Unit
    ) {
        viewModelScope.launch {
            // Set switching state
            _uiState.value = _uiState.value.copy(isSwitching = true)
            
            // Optimistic update (optional)
            val selectedProfile = _uiState.value.profiles.find { it.id == profileId }
            if (selectedProfile != null) {
                _uiState.value = _uiState.value.copy(
                    activeProfile = selectedProfile
                )
            }
            
            // Make API call
            val result = profileRepository.switchProfile(profileId)
            
            result.fold(
                onSuccess = { user ->
                    _uiState.value = _uiState.value.copy(
                        isSwitching = false,
                        error = null
                    )
                    onSuccess(user)
                },
                onFailure = { error ->
                    _uiState.value = _uiState.value.copy(
                        isSwitching = false,
                        error = error.message
                    )
                    onError(error.message ?: "Unknown error")
                }
            )
        }
    }
}

data class ProfileUiState(
    val profiles: List<UserProfile> = emptyList(),
    val activeProfile: UserProfile? = null,
    val isLoading: Boolean = false,
    val isSwitching: Boolean = false,
    val error: String? = null
)
```

### Step 4: Update ProfileSwitcher

```kotlin
// File: ui/components/ProfileSwitcher.kt

@Composable
fun ProfileSwitcher(
    profiles: List<UserProfile>,
    activeProfile: UserProfile?,
    isSwitching: Boolean,
    onProfileSelected: (UserProfile) -> Unit,
    modifier: Modifier = Modifier
) {
    var showMenu by remember { mutableStateOf(false) }
    val snackbarHostState = remember { SnackbarHostState() }
    val scope = rememberCoroutineScope()
    
    // ... existing UI code
    
    // Profile Selection
    ProfileMenuItem(
        profile = profile,
        isActive = activeProfile?.id == profile.id,
        isSwitching = isSwitching,
        onClick = {
            if (!isSwitching && activeProfile?.id != profile.id) {
                // Show loading toast
                scope.launch {
                    snackbarHostState.showSnackbar(
                        message = "Switching to ${getProfileDisplayName(profile)}...",
                        duration = SnackbarDuration.Short
                    )
                }
                
                // Trigger switch
                onProfileSelected(profile)
                showMenu = false
            }
        }
    )
}
```

### Step 5: Update DashboardScreen Integration

```kotlin
// File: features/dashboard/DashboardScreen.kt

@Composable
fun DashboardScreen(
    onNavigate: (String) -> Unit,
    profileViewModel: ProfileViewModel = hiltViewModel()
) {
    val profileState by profileViewModel.uiState.collectAsStateWithLifecycle()
    val context = LocalContext.current
    
    AppScaffoldWithDrawer(
        profiles = profileState.profiles,
        activeProfile = profileState.activeProfile,
        isSwitchingProfile = profileState.isSwitching,
        onProfileSelected = { profile ->
            profileViewModel.switchProfile(
                profileId = profile.id,
                onSuccess = { user ->
                    // Show success message
                    Toast.makeText(
                        context,
                        "Switched to ${profile.profileType} profile",
                        Toast.LENGTH_SHORT
                    ).show()
                    
                    // Navigate to appropriate dashboard
                    val targetRoute = when (profile.profileType) {
                        "customer" -> "client-dashboard"
                        "vendor", "employee" -> "dashboard"
                        else -> "dashboard"
                    }
                    
                    onNavigate(targetRoute)
                    
                    // Reload profiles to ensure consistency
                    profileViewModel.loadProfiles()
                },
                onError = { error ->
                    Toast.makeText(
                        context,
                        "Failed to switch: $error",
                        Toast.LENGTH_LONG
                    ).show()
                }
            )
        },
        // ... other params
    )
}
```

---

## 🎨 UI States

### 1. Normal State
```
┌─────────────────────────────────────┐
│  🟣 Employee at Acme Corp   ▼       │
│     Sales Manager                    │
└─────────────────────────────────────┘
```

### 2. Switching State
```
┌─────────────────────────────────────┐
│  ⏳ Switching...                    │
│     Please wait                      │
└─────────────────────────────────────┘
```

### 3. Error State
```
Toast/Snackbar:
❌ Failed to switch profile
   Please try again
```

---

## 🔍 Key Differences: Web vs Android

| Aspect | Web Frontend | Android App |
|--------|-------------|-------------|
| **State Management** | useState + localStorage | ViewModel + SharedPreferences |
| **Optimistic Update** | Immediate localStorage + state | Immediate UI state update |
| **API Call** | Axios/Fetch | Retrofit |
| **Navigation** | window.location.href (reload) | NavController.navigate() |
| **Error Handling** | Toast/Toaster | Toast / Snackbar |
| **Loading State** | useState(isSwitching) | StateFlow<isSwitching> |

---

## ✅ Implementation Checklist

- [ ] Create `RoleSelectionApiService.kt`
- [ ] Add API service to `ApiClient.kt`
- [ ] Create request/response data classes
- [ ] Update `ProfileRepository.kt` with switchProfile()
- [ ] Update `ProfileViewModel.kt` with switch logic
- [ ] Update `ProfileSwitcher.kt` to call ViewModel
- [ ] Update `DashboardScreen.kt` integration
- [ ] Add loading states (Toast/Snackbar)
- [ ] Add error handling
- [ ] Test with multiple profiles
- [ ] Test navigation after switch
- [ ] Test error scenarios
- [ ] Verify optimistic updates
- [ ] Test profile filtering (employee with org)

---

## 🧪 Test Scenarios

### Test 1: Switch from Vendor to Customer
1. Login as user with vendor + customer profiles
2. Open profile switcher
3. Select customer profile
4. Verify: Loading indicator shows
5. Verify: Switch completes successfully
6. Verify: Navigate to client dashboard
7. Verify: Menu changes to client menu
8. Verify: Top bar color changes to blue

### Test 2: Switch from Customer to Employee
1. Start on client dashboard
2. Open profile switcher
3. Select employee profile (with organization)
4. Verify: Switch completes
5. Verify: Navigate to vendor dashboard
6. Verify: Menu changes to vendor menu
7. Verify: Top bar color changes to purple

### Test 3: Error Handling - Invalid Profile
1. Attempt to switch to inactive profile
2. Verify: Error message shows
3. Verify: UI reverts to previous state
4. Verify: User can retry

### Test 4: Network Error
1. Disable network
2. Attempt profile switch
3. Verify: Timeout error handled gracefully
4. Verify: Clear error message
5. Enable network and retry

---

## 📝 Notes

1. **Optimistic Updates**: Web does optimistic localStorage + state update for instant UI feedback. Android should do the same with StateFlow.

2. **Page Reload**: Web forces page reload after switch. Android uses navigation but should clear any stale data.

3. **Profile Filtering**: Employee profiles only show if they have an organization. This is handled in ProfileSwitcher.

4. **Error Recovery**: Web doesn't revert optimistic update on error (page would reload on success). Android should handle this gracefully.

5. **Token Management**: After profile switch, ensure auth token is still valid and attached to subsequent requests.

---

**Implementation Priority**: HIGH  
**Complexity**: MEDIUM  
**Dependencies**: ProfileRepository, ProfileViewModel, RoleSelectionApiService  
**Testing Required**: YES (multiple profiles, different types, error cases)

