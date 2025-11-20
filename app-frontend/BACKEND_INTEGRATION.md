# Backend Integration Summary

## ✅ All Components Connected to Backend

### 1. **Authentication Flow**
- ✅ **Login**: `AuthRepository.login()` → `/api/auth/login/`
- ✅ **Register**: `AuthRepository.register()` → `/api/users/`
- ✅ **Logout**: `AuthRepository.logout()` → `/api/auth/logout/`
- ✅ **Get Current User**: `AuthRepository.getCurrentUser()` → `/api/users/me/`
- ✅ **Refresh User**: `AuthRepository.refreshUser()` → `/api/users/me/` (gets latest profiles)

### 2. **Profile Management**
- ✅ **Get Available Profiles**: `ProfileRepository.getAvailableProfiles()` → `/api/auth/role-selection/available_roles/`
  - Filters employee profiles to only show those with an organization (same logic as web app)
- ✅ **Switch Profile**: `ProfileRepository.switchProfile()` → `/api/auth/role-selection/select_role/`
  - Updates primary profile on backend
  - Returns updated user with new primaryProfile
- ✅ **Get Current Profile**: `ProfileRepository.getCurrentProfile()` → `/api/auth/role-selection/current_role/`
- ✅ **Fallback**: `ProfileRepository.getProfilesFromUser()` → Uses `/api/users/me/` if role selection API fails

### 3. **Dashboard Statistics**
- ✅ **Get Dashboard Stats**: `DashboardStatsRepository.getDashboardStats()` → `/api/analytics/dashboard/`
  - Accepts optional `organization` query parameter
  - Returns: total_customers, total_deals, total_revenue, active_leads, growth percentages

### 4. **Data Flow**

#### Login Flow:
1. User logs in → `AuthRepository.login()`
2. Token saved → `ApiClient.setAuthToken()`
3. User data refreshed → `AuthRepository.refreshUser()` (gets latest profiles)
4. UserSession updated with primary profile
5. Navigate to appropriate dashboard

#### Profile Switching Flow:
1. User selects profile → `ProfileViewModel.switchProfile()`
2. Backend API called → `/api/auth/role-selection/select_role/`
3. Backend returns updated user with new `primaryProfile`
4. ProfileViewModel updates state with new profiles and active profile
5. UserSession updated with new profile data
6. Dashboard stats refreshed with new organization ID
7. Navigation updated based on profile type

#### Dashboard Loading Flow:
1. DashboardScreen loads → Creates ProfileViewModel and DashboardViewModel
2. ProfileViewModel loads profiles → `/api/auth/role-selection/available_roles/`
3. Active profile determined → Uses `primaryProfile` or `isPrimary` flag
4. Organization ID extracted → From `activeProfile.organizationId` or `activeProfile.organization.id`
5. Dashboard stats loaded → `/api/analytics/dashboard/?organization={id}`
6. Stats displayed in UI

### 5. **Employee Profile Filtering**
- ✅ Employee profiles are **only shown** if they have an organization (assigned by vendor)
- ✅ Filtering logic matches web app exactly:
  ```kotlin
  if (profile.profileType == "employee") {
      profile.organization != null || profile.organizationId != null
  }
  ```

### 6. **API Endpoints Used**

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/auth/login/` | POST | User login |
| `/api/users/` | POST | User registration |
| `/api/auth/logout/` | POST | User logout |
| `/api/users/me/` | GET | Get current user with profiles |
| `/api/auth/role-selection/available_roles/` | GET | Get all available profiles |
| `/api/auth/role-selection/select_role/` | POST | Switch to a profile |
| `/api/auth/role-selection/current_role/` | GET | Get current active profile |
| `/api/analytics/dashboard/` | GET | Get dashboard statistics |

### 7. **State Management**

#### ProfileViewModel State:
- `profiles`: List of all available profiles (filtered)
- `activeProfile`: Currently active profile (from `primaryProfile` or `isPrimary`)
- `isLoading`: Loading state
- `error`: Error message if any
- `isSwitching`: Profile switching in progress

#### DashboardViewModel State:
- `stats`: Dashboard statistics from backend
- `isLoading`: Loading state
- `error`: Error message if any

### 8. **Key Features**

✅ **Profile Switching**: Fully connected to backend API  
✅ **Employee Profile Filtering**: Only shows employee profiles with organization  
✅ **Dashboard Stats**: Fetches real data from analytics API  
✅ **User Session Management**: Updates after login and profile switch  
✅ **Organization ID Handling**: Properly extracted for vendor/employee profiles  
✅ **Error Handling**: Proper error states and fallbacks  
✅ **Loading States**: UI shows loading indicators during API calls  

### 9. **Initialization**

- ✅ **MainActivity**: Initializes API client session on app start
- ✅ **MainScreen**: Checks if user is logged in and navigates to dashboard
- ✅ **DashboardScreen**: Loads profiles and stats on screen load
- ✅ **ProfileViewModel**: Loads profiles when requested (not auto-load on init)

### 10. **Data Models**

All models match web app structure:
- ✅ `User` with `profiles` and `primaryProfile`
- ✅ `UserProfile` with `organization`, `isPrimary`, `roles`
- ✅ `Organization` for employee profiles
- ✅ `ProfileRole` for role information

## 🎯 Everything is Connected!

All components are now fully integrated with the backend API, matching the web app's behavior and data flow.

