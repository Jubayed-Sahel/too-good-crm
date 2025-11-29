# Complete Authorization Flow - Frontend & Backend

## Overview

Your CRM uses a **hybrid authentication system** with JWT tokens (primary) and legacy Token auth (fallback), combined with a comprehensive RBAC (Role-Based Access Control) system.

---

## 🔐 Authentication Flow

### 1. **Frontend - Login Process**

**File**: `web-frontend/src/services/auth.service.ts`

```typescript
async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // POST to /api/auth/login/
    const response = await api.post<LoginResponse>(
        API_CONFIG.ENDPOINTS.AUTH.LOGIN,
        credentials
    );
    
    // Store JWT tokens (new) or legacy token
    if (response.access && response.refresh) {
        // JWT tokens (primary)
        localStorage.setItem('accessToken', response.access);
        localStorage.setItem('refreshToken', response.refresh);
        
        // Legacy token (backward compatibility)
        if (response.legacy_token) {
            localStorage.setItem('authToken', response.legacy_token);
        }
    }
    
    // Store user data with profiles
    const processedUser = this.processUserData(response.user);
    localStorage.setItem('user', JSON.stringify(processedUser));
}
```

**What's Stored in LocalStorage:**
- `accessToken`: JWT access token (valid 1 day)
- `refreshToken`: JWT refresh token (valid 7 days)
- `authToken`: Legacy DRF Token (for backward compatibility)
- `user`: User object with profiles and organization info

---

### 2. **Backend - Login Endpoint**

**File**: `shared-backend/crmApp/viewsets/auth.py`

```python
class LoginViewSet(viewsets.ViewSet):
    permission_classes = [AllowAny]  # Public endpoint
    
    def create(self, request):
        # Validate credentials
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        
        # Generate JWT tokens with RBAC claims
        from crmApp.services.jwt_service import JWTService
        tokens = JWTService.generate_tokens_for_user(user)
        
        # Keep legacy token for backward compatibility
        legacy_token, _ = Token.objects.get_or_create(user=user)
        
        return Response({
            'user': UserSerializer(user).data,
            'access': tokens['access'],          # JWT access token
            'refresh': tokens['refresh'],        # JWT refresh token
            'token_type': 'Bearer',
            'legacy_token': legacy_token.key,    # DRF Token
            'message': 'Login successful'
        })
```

**Response Structure:**
```json
{
  "user": {
    "id": 27,
    "email": "user@example.com",
    "profiles": [
      {
        "id": 43,
        "profile_type": "vendor",
        "organization": 12,
        "is_primary": true
      }
    ]
  },
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "Bearer",
  "legacy_token": "a1b2c3d4e5f6...",
  "message": "Login successful"
}
```

---

## 🔑 JWT Token Claims (RBAC Context)

**File**: `shared-backend/crmApp/services/jwt_service.py`

### JWT Access Token Contains:

```python
{
  # Basic user info
  "user_id": 27,
  "email": "user@example.com",
  "username": "user",
  
  # Admin flags (CRITICAL for authorization)
  "is_superuser": false,
  "is_staff": false,
  
  # Profile context
  "profile_type": "vendor",      # vendor, employee, or customer
  "profile_id": 43,
  "organization_id": 12,
  "organization_name": "Acme Corp",
  "is_owner": true,              # true for vendors
  
  # Roles and permissions (for employees)
  "roles": ["Sales Manager"],
  "role_ids": [5],
  "permissions": [
    "customer:read",
    "customer:create",
    "deal:read",
    "deal:update"
  ],
  
  # Or for vendors (full access)
  "permissions": ["*:*"]
}
```

### Authorization Hierarchy:

1. **`is_superuser=true`** → ALL permissions everywhere
2. **`is_staff=true`** → ALL permissions everywhere  
3. **`is_owner=true`** (vendor) → ALL permissions in their organization
4. **Employee** → permissions based on assigned roles
5. **Customer** → limited to own data only

---

## 📡 Request Authentication

### Frontend - API Client

**File**: `web-frontend/src/lib/apiClient.ts`

```typescript
// Request interceptor - automatically adds token
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('authToken');
    
    if (token) {
        config.headers.Authorization = `Token ${token}`;
    }
    
    return config;
});

// Response interceptor - handles 401 Unauthorized
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            // Token is invalid - clear auth and redirect
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);
```

**Every API Request:**
```http
GET /api/customers/
Authorization: Token a1b2c3d4e5f6...
```

Or with JWT:
```http
GET /api/customers/
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...
```

---

### Backend - Authentication Classes

**File**: `shared-backend/crmAdmin/settings.py`

```python
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',  # Legacy
        'rest_framework.authentication.SessionAuthentication', # For browsable API
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',  # ✅ Global requirement
    ],
}
```

**Token Authentication Flow:**

1. **Extract token** from `Authorization: Token ...` header
2. **Lookup token** in database: `Token.objects.get(key=token)`
3. **Get user** from token: `token.user`
4. **Attach user** to request: `request.user = user`
5. **Check permissions** based on user's profile and roles

---

## 🛡️ Permission Checking

### Frontend - Route Protection

**Component**: Uses `useAuth` hook

```typescript
const { user, isAuthenticated, isLoading } = useAuth();

if (isLoading) {
  return <LoadingSpinner />;
}

if (!isAuthenticated) {
  return <Navigate to="/login" />;
}

// User is authenticated - render protected content
```

### Backend - ViewSet Level

**File**: `shared-backend/crmApp/viewsets/customer.py`

```python
class CustomerViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]  # ✅ Requires authentication
    
    def get_queryset(self):
        # Automatically filter by user's organization
        queryset = Customer.objects.all()
        queryset = self.filter_by_organization(queryset, self.request)
        return queryset
```

### RBAC Permission Check

**File**: `shared-backend/crmApp/viewsets/mixins/permission_mixins.py`

```python
class PermissionCheckMixin:
    def check_permission(self, request, resource, action, organization):
        # Get user's active profile
        active_profile = getattr(request.user, 'active_profile', None)
        
        # VENDOR = Full access in their organization
        if active_profile.profile_type == 'vendor':
            if active_profile.organization_id == organization.id:
                return True  # ✅ All permissions
        
        # EMPLOYEE = Check RBAC
        if not RBACService.check_permission(
            user=request.user,
            organization=organization,
            resource=resource,
            action=action
        ):
            raise PermissionDenied(f'Required: {resource}:{action}')
        
        return True
```

---

## 🔄 Profile Switching

### Frontend - Switch Role

**File**: `web-frontend/src/hooks/useAuth.ts`

```typescript
const switchRole = async (profileId: number) => {
    // 1. Optimistic update - instant UI feedback
    const selectedProfile = user.profiles.find(p => p.id === profileId);
    const optimisticUser = {
        ...user,
        primaryProfile: selectedProfile,
        profiles: user.profiles.map(p => ({
            ...p,
            is_primary: p.id === profileId
        }))
    };
    localStorage.setItem('user', JSON.stringify(optimisticUser));
    setUser(optimisticUser);
    
    // 2. Call backend to update primary profile
    const response = await roleSelectionService.selectRole(profileId);
    
    // 3. Force page reload with new profile context
    window.location.href = targetRoute;
};
```

### Backend - Select Role

**File**: `shared-backend/crmApp/viewsets/role_selection.py`

```python
@action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
def select_role(self, request):
    profile_id = request.data.get('profile_id')
    
    # Get the profile
    profile = UserProfile.objects.get(
        id=profile_id,
        user=request.user,
        status='active'
    )
    
    # Update all profiles - mark selected as primary
    UserProfile.objects.filter(user=request.user).update(is_primary=False)
    profile.is_primary = True
    profile.save()
    
    # Return updated user with new primary profile
    return Response({
        'message': 'Role switched successfully',
        'user': UserSerializer(request.user).data,
        'active_profile': UserProfileSerializer(profile).data
    })
```

---

## 🔐 Authorization Matrix

### Public Endpoints (AllowAny)

| Endpoint | Permission | Purpose |
|----------|------------|---------|
| `/api/auth/register/` | AllowAny | User registration |
| `/api/auth/login/` | AllowAny | User login |
| `/api/auth/password-reset/` | AllowAny | Password reset |

### Protected Endpoints (IsAuthenticated)

| Endpoint | Permission | RBAC Check |
|----------|------------|------------|
| `/api/customers/` | IsAuthenticated | `customer:read` |
| `/api/customers/` (POST) | IsAuthenticated | `customer:create` |
| `/api/leads/` | IsAuthenticated | `lead:read` |
| `/api/deals/` | IsAuthenticated | `deal:read` |
| `/api/issues/` | IsAuthenticated | `issue:read` |
| `/api/orders/` | IsAuthenticated | `order:read` |

### Role-Based Access

**Vendor (Organization Owner)**:
- ✅ Full access to ALL resources in their organization
- ✅ Create/Read/Update/Delete customers, leads, deals, issues
- ✅ Manage employees and assign roles
- ✅ View analytics and reports

**Employee (Role-Based)**:
- ✅ Access based on assigned roles (Sales, Support, etc.)
- ✅ Can view all data in organization
- ✅ Can create records
- ⚠️ Can only update/delete records assigned to them
- ❌ Cannot delete records (usually)

**Customer (Self-Service)**:
- ✅ View own customer profile
- ✅ View own orders and payments
- ✅ Create and view own issues/tickets
- ❌ Cannot access other customers' data
- ❌ Cannot access vendor's internal data

---

## 📊 Complete Request Flow Example

### Scenario: Employee views customers

**1. Frontend Request:**
```typescript
// User clicks "Customers" page
const { data } = await customerService.getCustomers();
```

**2. API Client Adds Token:**
```http
GET /api/customers/
Authorization: Token a1b2c3d4e5f6789abcdef...
Host: localhost:8000
```

**3. Backend Authentication:**
```python
# Django REST Framework middleware
1. Extract token from header: "a1b2c3d4e5f6789abcdef..."
2. Lookup: Token.objects.get(key="a1b2c3d4e5f6789abcdef...")
3. Get user: token.user (User object)
4. Attach to request: request.user = user
```

**4. ViewSet Permission Check:**
```python
class CustomerViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]  # ✅ Pass
    
    def get_queryset(self):
        # Check RBAC: customer:read permission
        self.check_permission(
            request=self.request,
            resource='customer',
            action='read',
            organization=user.active_profile.organization
        )
        
        # Filter by organization
        queryset = Customer.objects.filter(
            organization=user.active_profile.organization
        )
        return queryset
```

**5. RBAC Service Check:**
```python
class RBACService:
    @staticmethod
    def check_permission(user, organization, resource, action):
        # Check if vendor (full access)
        if user.active_profile.profile_type == 'vendor':
            return True  # ✅ All permissions
        
        # Check employee roles
        user_roles = UserRole.objects.filter(
            user=user,
            organization=organization,
            is_active=True
        )
        
        # Check if any role has customer:read permission
        for user_role in user_roles:
            permissions = Permission.objects.filter(
                role_permissions__role=user_role.role,
                resource='customer',
                action='read'
            )
            if permissions.exists():
                return True  # ✅ Permission found
        
        return False  # ❌ No permission
```

**6. Response to Frontend:**
```json
{
  "count": 25,
  "results": [
    {
      "id": 101,
      "name": "John Doe",
      "email": "john@example.com",
      "organization": 12,
      "status": "active"
    },
    // ... more customers
  ]
}
```

---

## 🔒 Security Features

### 1. **Automatic Token Injection**
Every request automatically includes authentication token via axios interceptor.

### 2. **Auto-Logout on 401**
If token is invalid/expired, user is automatically redirected to login.

### 3. **Organization Isolation**
All queries automatically filtered by user's organization - prevents cross-org data access.

### 4. **RBAC Enforcement**
Every action checked against user's roles and permissions.

### 5. **Profile Context**
User's active profile determines which organization's data they see.

---

## 🎯 Key Takeaways

✅ **Hybrid Auth System**: JWT (primary) + Legacy Token (fallback)

✅ **Global Auth Requirement**: All endpoints require authentication by default

✅ **RBAC in JWT**: Permissions embedded in JWT token claims

✅ **Organization Isolation**: Automatic filtering by organization

✅ **Profile-Based Context**: User can switch between vendor/employee/customer profiles

✅ **Automatic Token Management**: Frontend handles token storage and injection

✅ **Auto-Logout**: Invalid tokens automatically trigger logout

---

## 📝 Summary

**Frontend Authorization:**
1. Login → Store tokens in localStorage
2. Every request → Add `Authorization: Token ...` header
3. 401 response → Auto-logout and redirect to login
4. Profile switching → Update context and reload

**Backend Authorization:**
1. Extract token from header
2. Validate token and get user
3. Check `IsAuthenticated` permission
4. Check RBAC permissions (resource:action)
5. Filter queryset by organization
6. Return data

**Result**: Secure, role-based, organization-isolated access control system! 🔐
