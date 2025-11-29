# Mobile App API Authorization Analysis

## Executive Summary

**All pages in the mobile app use the SAME authorization mechanism as the website.**

Both the web frontend and Android mobile app use:
- **Token-based authentication**: `Authorization: Token <auth_token>`
- **Same backend APIs**: Both connect to Django REST Framework endpoints
- **Centralized token injection**: Tokens are automatically added to every API request
- **SharedPreferences storage** (Android) vs **localStorage** (Web)

---

## Authorization Architecture Comparison

### Web Frontend (React)
```typescript
// web-frontend/src/lib/apiClient.ts
const token = authService.getAuthToken();
config.headers.Authorization = `Token ${token}`;
```

**Storage**: `localStorage.getItem('accessToken')` or `localStorage.getItem('authToken')`

### Mobile App (Android Kotlin)
```kotlin
// app-frontend/app/src/main/java/too/good/crm/data/api/ApiClient.kt
private var authToken: String? = null

// OkHttp Interceptor
if (!isPublicEndpoint) {
    authToken?.let {
        requestBuilder.header("Authorization", "Token $it")
    }
}
```

**Storage**: `SharedPreferences` with key `"auth_token"`

---

## Mobile App Pages Using Same API Authorization

All the following Android app pages use the same `Authorization: Token` header as the website:

### ✅ 1. Dashboard
**File**: `features/dashboard/DashboardViewModel.kt`
**API Service**: `AnalyticsApiService` → `/api/analytics/dashboard-stats/`
**Authorization**: ✅ Token header via `ApiClient` interceptor
**Usage**: Fetches dashboard statistics, sales data, recent activities

### ✅ 2. Customers
**File**: `features/customers/CustomerViewModel.kt`
**API Service**: `CustomerApiService` → `/api/customers/`
**Authorization**: ✅ Token header via `ApiClient` interceptor
**Endpoints**:
- `GET /api/customers/` - List customers
- `POST /api/customers/` - Create customer
- `GET /api/customers/{id}/` - View customer detail
- `PATCH /api/customers/{id}/` - Update customer
- `DELETE /api/customers/{id}/` - Delete customer
- `GET /api/customers/stats/` - Customer statistics

### ✅ 3. Leads
**File**: `features/leads/LeadsViewModel.kt`
**API Service**: `LeadApiService` → `/api/leads/`
**Authorization**: ✅ Token header via `ApiClient` interceptor
**Endpoints**:
- `GET /api/leads/` - List leads
- `POST /api/leads/` - Create lead
- `PATCH /api/leads/{id}/` - Update lead
- `DELETE /api/leads/{id}/` - Delete lead
- `POST /api/leads/{id}/convert/` - Convert to customer
- `POST /api/leads/{id}/convert_to_deal/` - Convert to deal
- `POST /api/leads/{id}/qualify/` - Qualify lead
- `GET /api/leads/stats/` - Lead statistics

### ✅ 4. Deals/Sales
**File**: `features/deals/DealsViewModel.kt`, `features/sales/SalesViewModel.kt`
**API Service**: `DealApiService` → `/api/deals/`
**Authorization**: ✅ Token header via `ApiClient` interceptor
**Endpoints**:
- `GET /api/deals/` - List deals
- `POST /api/deals/` - Create deal
- `PATCH /api/deals/{id}/` - Update deal
- `DELETE /api/deals/{id}/` - Delete deal
- `POST /api/deals/{id}/mark_won/` - Mark as won
- `POST /api/deals/{id}/mark_lost/` - Mark as lost
- `POST /api/deals/{id}/move_stage/` - Move to stage
- `GET /api/deals/stats/` - Deal statistics

### ✅ 5. Team/Employees
**File**: `features/team/TeamViewModel.kt`, `features/employees/EmployeeViewModel.kt`
**API Service**: `EmployeeApiService` → `/api/employees/`
**Authorization**: ✅ Token header via `ApiClient` interceptor
**Endpoints**:
- `GET /api/employees/` - List employees
- `POST /api/employees/` - Create employee
- `PATCH /api/employees/{id}/` - Update employee
- `DELETE /api/employees/{id}/` - Delete employee
- `POST /api/employees/invite/` - Invite employee
- `POST /api/employees/{id}/terminate/` - Terminate employee

### ✅ 6. Messages/Conversations
**File**: `features/messages/MessagesViewModel.kt`
**API Service**: `MessageApiService` → `/api/messages/`, `/api/conversations/`
**Authorization**: ✅ Token header via `ApiClient` interceptor
**Endpoints**:
- `GET /api/conversations/` - List conversations
- `GET /api/conversations/{id}/` - Get conversation details
- `POST /api/conversations/` - Create conversation
- `GET /api/messages/?conversation={id}` - Get messages
- `POST /api/messages/` - Send message
- `POST /api/messages/{id}/mark_read/` - Mark as read

### ✅ 7. Activities
**File**: `features/activities/ActivitiesViewModel.kt`
**API Service**: `ActivityApiService` → `/api/activities/`
**Authorization**: ✅ Token header via `ApiClient` interceptor
**Endpoints**:
- `GET /api/activities/` - List activities
- `POST /api/activities/` - Create activity
- `PATCH /api/activities/{id}/` - Update activity
- `DELETE /api/activities/{id}/` - Delete activity
- `POST /api/activities/{id}/complete/` - Mark complete
- `GET /api/activities/upcoming/` - Upcoming activities

### ✅ 8. Profile/Settings
**File**: `features/profile/ProfileViewModel.kt`, `features/settings/SettingsViewModel.kt`
**API Service**: `RoleSelectionApiService`, `AuthApiService`
**Authorization**: ✅ Token header via `ApiClient` interceptor
**Endpoints**:
- `GET /api/auth/user/` - Get current user
- `POST /api/auth/role-selection/select_role/` - Switch profile
- `GET /api/auth/role-selection/available_roles/` - Get available roles
- `POST /api/auth/change-password/` - Change password

### ✅ 9. Issues (if implemented)
**File**: `features/issues/viewmodel/IssueViewModel.kt`
**API Service**: `IssueApiService` → `/api/issues/`
**Authorization**: ✅ Token header via `ApiClient` interceptor

### ✅ 10. Video Calls
**File**: `data/api/VideoApiService.kt`, `ui/video/VideoCallWindow.kt`
**API Service**: `VideoApiService` → `/api/video/`
**Authorization**: ✅ Token header via `ApiClient` interceptor
**Note**: Uses JWT token from backend for Jitsi authentication

---

## Authentication Flow Comparison

### Web Frontend Flow
```
1. User logs in → POST /api/auth/login/
2. Backend returns: { token, access, refresh, user }
3. Store in localStorage: accessToken, refreshToken, authToken
4. Axios interceptor adds: Authorization: Token <token>
5. All API requests authenticated
6. 401 response → clear tokens → redirect to /login
```

### Mobile App Flow
```
1. User logs in → POST /api/auth/login/
2. Backend returns: { token, user }
3. Store in SharedPreferences: auth_token, user_id, username
4. OkHttp interceptor adds: Authorization: Token <token>
5. All API requests authenticated
6. 401 response → clear prefs → navigate to LoginScreen
```

---

## Public Endpoints (No Authorization Required)

Both web and mobile apps skip authorization for these endpoints:

### Web Frontend (apiClient.ts)
```typescript
const publicRoutes = ['/login', '/register'];
```

### Mobile App (ApiClient.kt)
```kotlin
val publicEndpoints = listOf(
    "/api/auth/login/",
    "/api/users/",  // Registration
)
```

---

## Token Storage Comparison

| Aspect | Web Frontend | Mobile App |
|--------|-------------|------------|
| **Storage Type** | localStorage | SharedPreferences |
| **Token Key** | `accessToken` / `authToken` | `auth_token` |
| **User Data** | `user` (JSON object) | `user_id`, `username`, `email`, `first_name`, `last_name` |
| **Persistence** | Browser localStorage | Android app private storage |
| **Security** | XSS vulnerable | OS-level sandboxed |

---

## Authorization Implementation Details

### Mobile App: ApiClient.kt
```kotlin
object ApiClient {
    private var authToken: String? = null

    fun setAuthToken(token: String) {
        authToken = token
    }

    fun getAuthToken(): String? {
        return authToken
    }

    // OkHttp Interceptor
    private val okHttpClient = OkHttpClient.Builder()
        .addInterceptor { chain ->
            val original = chain.request()
            val requestBuilder = original.newBuilder()
                .header("Content-Type", "application/json")

            val publicEndpoints = listOf(
                "/api/auth/login/",
                "/api/users/",
            )

            val isPublicEndpoint = publicEndpoints.any { endpoint ->
                original.url.encodedPath.endsWith(endpoint) || 
                original.url.encodedPath.contains(endpoint)
            }

            // Add token for protected endpoints
            if (!isPublicEndpoint) {
                authToken?.let {
                    requestBuilder.header("Authorization", "Token $it")
                }
            }

            val request = requestBuilder
                .method(original.method, original.body)
                .build()

            chain.proceed(request)
        }
        .build()
}
```

### Mobile App: AuthRepository.kt
```kotlin
class AuthRepository(context: Context) {
    private val prefs: SharedPreferences =
        context.getSharedPreferences("crm_prefs", Context.MODE_PRIVATE)

    suspend fun login(username: String, password: String): Result<LoginResponse> {
        val response = apiService.login(LoginRequest(username, password))
        if (response.isSuccessful && response.body() != null) {
            val loginResponse = response.body()!!
            
            // Save token
            saveAuthToken(loginResponse.token)
            saveUserInfo(loginResponse.user)
            
            // Set in ApiClient for all future requests
            ApiClient.setAuthToken(loginResponse.token)
            
            Result.success(loginResponse)
        }
    }

    private fun saveAuthToken(token: String) {
        prefs.edit().putString("auth_token", token).apply()
    }

    fun getAuthToken(): String? {
        return prefs.getString("auth_token", null)
    }
}
```

---

## Repository Pattern in Mobile App

The mobile app uses a **Repository pattern** that wraps API calls:

```kotlin
// Example: LeadRepository wraps LeadApiService
class LeadRepository {
    private val apiService = ApiClient.leadApiService

    suspend fun getLeads(): Result<List<Lead>> {
        try {
            val response = apiService.getLeads()
            // ApiClient automatically adds Authorization header
            return Result.success(response.results)
        } catch (e: Exception) {
            return Result.failure(e)
        }
    }
}

// ViewModel uses Repository
class LeadsViewModel {
    private val repository = LeadRepository()

    fun loadLeads() {
        viewModelScope.launch {
            repository.getLeads() // Token automatically included
        }
    }
}
```

---

## Pusher Real-time Authorization

Both web and mobile use Pusher for real-time features with token authorization:

### Mobile App: PusherService.kt
```kotlin
class PusherService {
    private fun createPusherOptions(): PusherOptions {
        return PusherOptions().apply {
            setCluster(PUSHER_CLUSTER)
            
            val token = ApiClient.getAuthToken()
            val authOptions = HttpAuthorizer(PUSHER_AUTH_URL)
            if (token != null) {
                addHeader("Authorization", "Token $token")
            }
            
            setAuthorizer(authOptions)
        }
    }
}
```

**Authorization URL**: `http://YOUR_IP:8000/api/pusher/auth/`
**Same token**: Uses the same auth token as API calls

---

## Summary: Authorization Matrix

| Page/Feature | Web Frontend | Mobile App | Authorization Method |
|-------------|-------------|------------|---------------------|
| **Login** | ❌ Public | ❌ Public | None |
| **Registration** | ❌ Public | ❌ Public | None |
| **Dashboard** | ✅ Protected | ✅ Protected | Token header |
| **Customers** | ✅ Protected | ✅ Protected | Token header |
| **Leads** | ✅ Protected | ✅ Protected | Token header |
| **Deals** | ✅ Protected | ✅ Protected | Token header |
| **Team** | ✅ Protected | ✅ Protected | Token header |
| **Messages** | ✅ Protected | ✅ Protected | Token header |
| **Activities** | ✅ Protected | ✅ Protected | Token header |
| **Profile** | ✅ Protected | ✅ Protected | Token header |
| **Settings** | ✅ Protected | ✅ Protected | Token header |
| **Video Calls** | ✅ Protected | ✅ Protected | Token header |
| **Pusher (Real-time)** | ✅ Protected | ✅ Protected | Token header |

---

## Key Findings

### ✅ Complete Authorization Parity
1. **Same authentication mechanism**: Both use Django Token Authentication
2. **Same header format**: `Authorization: Token <token>`
3. **Same backend endpoints**: Both call identical REST API endpoints
4. **Same RBAC system**: Both respect organization isolation and permissions
5. **Same token lifecycle**: Login → Store → Auto-inject → Logout

### 🔐 Security Features
1. **Automatic token injection**: Centralized in ApiClient/apiClient
2. **Public endpoint exemption**: Login and registration skip auth
3. **401 auto-logout**: Both platforms clear tokens on unauthorized
4. **Organization isolation**: Backend filters queries by user's org
5. **RBAC enforcement**: Backend checks permissions before actions

### 📱 Mobile-Specific Considerations
1. **SharedPreferences**: More secure than web localStorage (OS-sandboxed)
2. **OkHttp interceptor**: Kotlin-native HTTP client vs Axios
3. **Retrofit**: Type-safe API interface generation
4. **Repository pattern**: Additional abstraction layer for cleaner architecture
5. **No JWT refresh**: Mobile app uses legacy token (simpler, but no auto-refresh)

---

## Conclusion

**Every page in the mobile app uses the same API authorization as the website.**

The mobile app perfectly mirrors the web frontend's authorization architecture:
- Same token-based authentication
- Same backend API endpoints
- Same authorization header format
- Same public/protected endpoint logic
- Same RBAC and organization isolation

The only differences are implementation details:
- **Storage**: SharedPreferences (Android) vs localStorage (Web)
- **HTTP Client**: OkHttp/Retrofit (Android) vs Axios (Web)
- **Language**: Kotlin (Android) vs TypeScript (Web)

**Result**: Complete authorization consistency across all platforms.
