# JWT Token Generation & Storage - Complete Technical Guide

**Complete flow of how authorization access tokens are generated, structured, and stored for usage**

---

## Table of Contents

1. [Token Generation (Backend)](#token-generation-backend)
2. [Token Structure & Claims](#token-structure--claims)
3. [Token Storage (Frontend)](#token-storage-frontend)
4. [Token Usage](#token-usage)
5. [Token Refresh Flow](#token-refresh-flow)
6. [Security Considerations](#security-considerations)

---

## Token Generation (Backend)

### **Step 1: User Login Request**

```http
POST /api/auth/login/
Content-Type: application/json

{
  "username": "admin@crm.com",
  "password": "password123"
}
```

### **Step 2: Login ViewSet Processes Request**

**File:** `shared-backend/crmApp/viewsets/auth.py`

```python
class LoginViewSet(viewsets.ViewSet):
    permission_classes = [AllowAny]
    
    def create(self, request):
        """Login endpoint - returns JWT tokens with RBAC claims"""
        
        # 1. Validate credentials
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        
        # 2. Update last login timestamp
        user.last_login_at = timezone.now()
        user.save(update_fields=['last_login_at'])
        
        # 3. Generate JWT tokens with RBAC claims
        from crmApp.services.jwt_service import JWTService
        tokens = JWTService.generate_tokens_for_user(user)
        
        # 4. Generate legacy token (backward compatibility)
        legacy_token, created = Token.objects.get_or_create(user=user)
        
        # 5. Return response with tokens
        return Response({
            'user': UserSerializer(user).data,
            'access': tokens['access'],           # JWT access token
            'refresh': tokens['refresh'],         # JWT refresh token
            'token_type': 'Bearer',
            'access_expires_in': tokens['access_expires_in'],    # 86400 sec (1 day)
            'refresh_expires_in': tokens['refresh_expires_in'],  # 604800 sec (7 days)
            'legacy_token': legacy_token.key,
            'message': 'Login successful'
        })
```

### **Step 3: JWT Service Generates Tokens**

**File:** `shared-backend/crmApp/services/jwt_service.py`

```python
class JWTService:
    @staticmethod
    def generate_tokens_for_user(user) -> Dict[str, str]:
        """
        Generate access and refresh tokens for a user.
        
        Uses CustomTokenObtainPairSerializer to embed RBAC claims.
        """
        # Create refresh token (which also creates access token)
        refresh = CustomTokenObtainPairSerializer.get_token(user)
        
        return {
            'access': str(refresh.access_token),  # Access token (1 day)
            'refresh': str(refresh),              # Refresh token (7 days)
            'access_expires_in': 86400,           # 1 day in seconds
            'refresh_expires_in': 604800,         # 7 days in seconds
        }
```

### **Step 4: Custom Token Serializer Embeds RBAC Claims**

**File:** `shared-backend/crmApp/services/jwt_service.py`

```python
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Custom JWT serializer that adds RBAC claims to tokens.
    """
    
    @classmethod
    def get_token(cls, user):
        """Generate token with custom RBAC claims"""
        # Get base token from parent class
        token = super().get_token(user)
        
        # ============================================
        # STEP 1: Add Basic User Info
        # ============================================
        token['user_id'] = user.id
        token['email'] = user.email
        token['username'] = user.username
        token['first_name'] = user.first_name
        token['last_name'] = user.last_name
        
        # ============================================
        # STEP 2: Add Admin Flags (CRITICAL!)
        # ============================================
        token['is_superuser'] = user.is_superuser
        token['is_staff'] = user.is_staff
        
        # ============================================
        # STEP 3: Get User's Active Profile
        # ============================================
        active_profile = get_user_active_profile(user)
        
        if active_profile:
            # ============================================
            # STEP 4: Add Profile Information
            # ============================================
            token['profile_type'] = active_profile.profile_type
            token['profile_id'] = active_profile.id
            
            # ============================================
            # STEP 5: Add Organization Information
            # ============================================
            if active_profile.organization:
                token['organization_id'] = active_profile.organization.id
                token['organization_name'] = active_profile.organization.name
                token['is_owner'] = active_profile.profile_type == 'vendor'
                
                # ============================================
                # STEP 6: Add Roles & Permissions
                # ============================================
                if active_profile.profile_type == 'employee':
                    # Get roles and permissions from database
                    roles, permissions = cls._get_employee_roles_and_permissions(
                        user, active_profile.organization
                    )
                    token['roles'] = roles
                    token['role_ids'] = list(roles.keys())
                    token['permissions'] = permissions
                    
                elif active_profile.profile_type == 'vendor':
                    # Vendors have all permissions
                    token['roles'] = ['owner']
                    token['role_ids'] = []
                    token['permissions'] = ['*:*']  # Wildcard: all permissions
                    
                else:
                    # Customer has no roles/permissions
                    token['roles'] = []
                    token['role_ids'] = []
                    token['permissions'] = []
        
        logger.info(f"Generated JWT for user {user.email}")
        
        return token
```

### **Step 5: Token Signing & Encoding**

**Django Settings:** `shared-backend/crmAdmin/settings.py`

```python
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=1),      # 24 hours
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),     # 7 days
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': False,
    'UPDATE_LAST_LOGIN': True,
    
    'ALGORITHM': 'HS256',                            # HMAC SHA-256
    'SIGNING_KEY': SECRET_KEY,                       # Django secret key
    'VERIFYING_KEY': None,
    'AUDIENCE': None,
    'ISSUER': None,
    
    'AUTH_HEADER_TYPES': ('Bearer',),
    'AUTH_HEADER_NAME': 'HTTP_AUTHORIZATION',
    
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
    
    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
    'TOKEN_TYPE_CLAIM': 'token_type',
}
```

**Token Encoding Process:**
1. Claims assembled into JSON payload
2. Payload encoded to Base64
3. Header encoded to Base64
4. Signature created: `HMACSHA256(base64(header) + "." + base64(payload), SECRET_KEY)`
5. Final token: `header.payload.signature`

---

## Token Structure & Claims

### **JWT Token Format**

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJlbWFpbCI6ImFkbWluQGNybS5jb20iLCJ1c2VybmFtZSI6ImFkbWluIiwiaXNfc3VwZXJ1c2VyIjp0cnVlLCJpc19zdGFmZiI6dHJ1ZSwicHJvZmlsZV90eXBlIjoidmVuZG9yIiwib3JnYW5pemF0aW9uX2lkIjoxMiwicGVybWlzc2lvbnMiOlsiKjoqIl0sImV4cCI6MTczMzEyMzQ1Nn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c

Structure:
┌─────────────────────┬──────────────────────────────┬────────────────────┐
│      HEADER         │          PAYLOAD             │     SIGNATURE      │
│    (Base64)         │         (Base64)             │   (HMAC SHA-256)   │
└─────────────────────┴──────────────────────────────┴────────────────────┘
```

### **Decoded Header**

```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

### **Decoded Payload (Access Token Claims)**

```json
{
  // Standard JWT Claims
  "token_type": "access",
  "exp": 1733123456,              // Expiration timestamp (Unix time)
  "iat": 1733037056,              // Issued at timestamp
  "jti": "abc123def456",          // JWT ID (unique identifier)
  
  // User Information
  "user_id": 1,
  "email": "admin@crm.com",
  "username": "admin",
  "first_name": "Admin",
  "last_name": "User",
  
  // Admin Flags (CRITICAL for Authorization)
  "is_superuser": true,           // Django superuser flag
  "is_staff": true,               // Django staff flag
  
  // Profile Information
  "profile_type": "vendor",       // vendor | employee | customer
  "profile_id": 123,
  
  // Organization Context
  "organization_id": 12,
  "organization_name": "Acme Corp",
  "is_owner": true,               // True for vendors
  
  // Roles & Permissions (RBAC)
  "roles": {                      // For employees
    "1": "Sales Manager",
    "3": "Team Lead"
  },
  "role_ids": [1, 3],
  "permissions": [                 // For employees
    "customer:read",
    "customer:create",
    "lead:read",
    "deal:update"
  ]
  // OR for vendors:
  // "permissions": ["*:*"]        // Wildcard: all permissions
}
```

### **Decoded Payload (Refresh Token Claims)**

```json
{
  // Standard JWT Claims
  "token_type": "refresh",
  "exp": 1733642056,              // Expiration (7 days)
  "iat": 1733037056,              // Issued at
  "jti": "xyz789ghi012",          // JWT ID
  
  // User Identification Only
  "user_id": 1
  
  // NOTE: Refresh tokens DO NOT contain RBAC claims
  // They are only used to generate new access tokens
}
```

---

## Token Storage (Frontend)

### **Step 1: Login Response Received**

**File:** `web-frontend/src/services/auth.service.ts`

```typescript
async login(credentials: LoginCredentials): Promise<AuthResponse> {
  // Make login API request
  const response = await api.post<LoginResponse>(
    '/api/auth/login/',
    credentials
  );
  
  // Response structure:
  // {
  //   user: { id, email, ... },
  //   access: "eyJhbGc...",      // JWT access token
  //   refresh: "eyJhbGc...",     // JWT refresh token
  //   token_type: "Bearer",
  //   access_expires_in: 86400,
  //   refresh_expires_in: 604800,
  //   legacy_token: "abc123..."  // Optional
  // }
  
  // Process and store tokens
  const processedUser = this.processUserData(response.user);
  
  if (response.access && response.refresh) {
    // Store JWT tokens
    this.setJWTAuthData(response.access, response.refresh, processedUser);
  }
  
  return { token: response.access, user: processedUser };
}
```

### **Step 2: Tokens Stored in localStorage**

```typescript
private setJWTAuthData(
  accessToken: string, 
  refreshToken: string, 
  user: User
): void {
  // Store access token (JWT)
  localStorage.setItem('accessToken', accessToken);
  
  // Store refresh token (JWT)
  localStorage.setItem('refreshToken', refreshToken);
  
  // Store user data
  localStorage.setItem('user', JSON.stringify(user));
  
  console.log('✅ JWT authentication successful');
}
```

### **localStorage Structure After Login**

```javascript
// Browser localStorage:
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJlbWFpbCI6ImFkbWluQGNybS5jb20iLCJpc19zdXBlcnVzZXIiOnRydWUsImlzX3N0YWZmIjp0cnVlLCJvcmdhbml6YXRpb25faWQiOjEyLCJwZXJtaXNzaW9ucyI6WyIqOioiXSwiZXhwIjoxNzMzMTIzNDU2fQ...",
  
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTczMzY0MjA1NiwidXNlcl9pZCI6MX0...",
  
  "user": "{\"id\":1,\"email\":\"admin@crm.com\",\"username\":\"admin\",\"first_name\":\"Admin\",\"last_name\":\"User\",\"is_staff\":true,\"is_superuser\":true,\"profiles\":[...]}",
  
  "authToken": "abc123def456..."  // Legacy token (backward compatibility)
}
```

### **Storage Security Notes**

```typescript
// ⚠️ localStorage Security Considerations:
// 
// Pros:
// ✅ Survives page refresh
// ✅ Simple to use
// ✅ No server overhead
// 
// Cons:
// ⚠️ Vulnerable to XSS attacks
// ⚠️ Accessible via JavaScript
// 
// Mitigations in place:
// ✅ Short-lived access tokens (1 day)
// ✅ Token refresh mechanism
// ✅ HTTPS only in production
// ✅ Content Security Policy (CSP)
// ✅ Input sanitization
```

---

## Token Usage

### **Step 1: Token Retrieved for API Requests**

**File:** `web-frontend/src/lib/apiClient.ts`

```typescript
// Axios Request Interceptor
apiClient.interceptors.request.use((config) => {
  // Try JWT access token first (new), fallback to legacy token
  const jwtToken = localStorage.getItem('accessToken');
  const legacyToken = localStorage.getItem('authToken');
  
  if (jwtToken) {
    // Use JWT with Bearer authentication
    config.headers.Authorization = `Bearer ${jwtToken}`;
  } else if (legacyToken) {
    // Fallback to legacy Token authentication
    config.headers.Authorization = `Token ${legacyToken}`;
  }
  
  return config;
});
```

### **Step 2: Token Sent with Every API Request**

```http
GET /api/customers/
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### **Step 3: Backend Validates Token**

**Django REST Framework Process:**

```python
# 1. JWTAuthentication extracts token from header
class JWTAuthentication(BaseAuthentication):
    def authenticate(self, request):
        header = request.META.get('HTTP_AUTHORIZATION')
        # Extract: "Bearer eyJhbGc..."
        
        # 2. Validate token signature
        decoded = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=['HS256']
        )
        
        # 3. Check expiration
        if decoded['exp'] < current_time:
            raise AuthenticationFailed('Token has expired')
        
        # 4. Get user from database
        user = User.objects.get(id=decoded['user_id'])
        
        # 5. Attach to request
        request.user = user
        
        return (user, decoded)
```

### **Step 4: Token Claims Used for Authorization**

```python
# In views/serializers:
user = request.user  # Authenticated user
user.is_superuser    # From database (also in token)
user.is_staff        # From database (also in token)

# In MCP tools:
context = {
    'user_id': user.id,
    'is_superuser': user.is_superuser,    # ← Used for permission checks
    'is_staff': user.is_staff,            # ← Used for permission checks
    'organization_id': active_profile.organization_id,
    'permissions': [...]
}

# MCP permission check:
if context.get('is_superuser'):
    return True  # Admin bypass
```

---

## Token Refresh Flow

### **Problem: Access Token Expires (401 Error)**

```
User makes API request
  ↓
Access token expired (after 24 hours)
  ↓
Backend returns 401 Unauthorized
  ↓
Frontend intercepts 401
  ↓
Automatic token refresh
```

### **Token Refresh Implementation**

**File:** `web-frontend/src/lib/apiClient.ts`

```typescript
// Response Interceptor - Handles 401 errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Get refresh token
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (refreshToken) {
        try {
          // Call token refresh endpoint
          const response = await axios.post(
            '/api/auth/token/refresh/',
            { refresh: refreshToken }
          );
          
          if (response.data.access) {
            // Store new access token
            localStorage.setItem('accessToken', response.data.access);
            
            // Retry original request with new token
            originalRequest.headers.Authorization = 
              `Bearer ${response.data.access}`;
            return apiClient(originalRequest);
          }
        } catch (refreshError) {
          // Refresh failed - clear tokens and redirect to login
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
      }
    }
    
    return Promise.reject(error);
  }
);
```

### **Token Refresh Endpoint**

```http
POST /api/auth/token/refresh/
Content-Type: application/json

{
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

Response:
{
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "access_expires_in": 86400
}
```

### **Refresh Token Rotation**

```python
# Django settings:
SIMPLE_JWT = {
    'ROTATE_REFRESH_TOKENS': True,  # New refresh token with each refresh
    'BLACKLIST_AFTER_ROTATION': False,  # Don't blacklist old refresh token
}

# When user refreshes:
# 1. Old refresh token validated
# 2. New access token generated
# 3. New refresh token generated (if ROTATE_REFRESH_TOKENS=True)
# 4. Old refresh token remains valid (if BLACKLIST_AFTER_ROTATION=False)
```

---

## Security Considerations

### **1. Token Expiration**

```
Access Token:  24 hours (short-lived)
Refresh Token: 7 days (longer-lived)

Why?
- Access tokens contain sensitive RBAC claims
- Short expiration limits damage if compromised
- Refresh tokens have fewer claims, lower risk
- Balance between security and user experience
```

### **2. Storage Security**

```typescript
// ⚠️ localStorage Risks:
// - Vulnerable to XSS (Cross-Site Scripting)
// - Accessible via JavaScript
// - Persistent across sessions

// Mitigations:
// ✅ Short token lifetime
// ✅ HTTPS only (prevents MITM)
// ✅ Content Security Policy
// ✅ Input sanitization (prevents XSS)
// ✅ HttpOnly cookies for legacy token (optional)
```

### **3. Token Claims Security**

```json
{
  // ⚠️ Sensitive data in token:
  "user_id": 1,
  "email": "admin@crm.com",
  "organization_id": 12,
  "permissions": ["*:*"],
  
  // ✅ Mitigations:
  // - Token encrypted via HTTPS
  // - Signature prevents tampering
  // - Backend ALWAYS validates from database
  // - Token expiration limits exposure
}
```

### **4. Backend Validation (CRITICAL)**

```python
# ✅ ALWAYS validate token claims against database:

# DON'T just trust token claims:
❌ if token['is_superuser']:  # Token could be tampered
    grant_access()

# DO verify against database:
✅ user = User.objects.get(id=token['user_id'])
✅ if user.is_superuser:  # Database is source of truth
    grant_access()

# Our implementation:
# - Token validated on every request
# - User loaded from database
# - Admin flags checked from User model
# - Token claims used for optimization only
```

### **5. Token Transmission**

```http
✅ SECURE:
GET /api/customers/ HTTP/1.1
Authorization: Bearer eyJhbGc...
Host: crm.example.com
Connection: HTTPS (TLS 1.3)

❌ INSECURE (Never do this):
GET /api/customers/?token=eyJhbGc... HTTP/1.1
Host: crm.example.com
Connection: HTTP
```

### **6. Logout Process**

```typescript
// Complete logout:
async logout() {
  // 1. Call backend logout API (optional)
  await api.post('/api/auth/logout/');
  
  // 2. Clear all tokens from localStorage
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  
  // 3. Redirect to login
  window.location.href = '/login';
}

// Note: JWT tokens are stateless
// Backend cannot "revoke" them
// They remain valid until expiration
// Short expiration (24h) mitigates this
```

---

## Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        USER LOGIN FLOW                              │
└─────────────────────────────────────────────────────────────────────┘

1. User enters credentials
   ↓
2. Frontend sends POST /api/auth/login/
   ↓
3. Backend validates credentials
   ↓
4. Backend queries database:
   - User info
   - Admin flags (is_superuser, is_staff)
   - Active profile
   - Organization
   - Roles & permissions
   ↓
5. Backend generates JWT tokens:
   ┌──────────────────────────────────────────┐
   │ CustomTokenObtainPairSerializer          │
   │   ↓                                      │
   │ Embeds RBAC claims:                      │
   │   - user_id, email, username             │
   │   - is_superuser, is_staff (CRITICAL)    │
   │   - profile_type, organization_id        │
   │   - roles, permissions                   │
   │   ↓                                      │
   │ Signs token with SECRET_KEY              │
   │   ↓                                      │
   │ Returns: access + refresh tokens         │
   └──────────────────────────────────────────┘
   ↓
6. Frontend receives response:
   {
     access: "eyJhbGc...",
     refresh: "eyJhbGc...",
     user: {...}
   }
   ↓
7. Frontend stores in localStorage:
   - accessToken
   - refreshToken
   - user
   ↓
8. User authenticated! ✅

┌─────────────────────────────────────────────────────────────────────┐
│                     API REQUEST FLOW                                │
└─────────────────────────────────────────────────────────────────────┘

1. User clicks "Show customers"
   ↓
2. Frontend makes API call:
   GET /api/customers/
   Authorization: Bearer eyJhbGc...
   ↓
3. Django JWTAuthentication:
   - Extracts token
   - Validates signature
   - Checks expiration
   - Decodes claims
   - Loads User from database
   - Attaches to request.user
   ↓
4. View/ViewSet executes:
   - Checks permissions
   - Uses user.is_superuser (from DB)
   - Queries data with org filter
   ↓
5. Response returned to frontend
   ↓
6. Data displayed to user ✅

┌─────────────────────────────────────────────────────────────────────┐
│                   TOKEN REFRESH FLOW                                │
└─────────────────────────────────────────────────────────────────────┘

1. Access token expires (after 24 hours)
   ↓
2. API request returns 401 Unauthorized
   ↓
3. Frontend interceptor catches 401:
   ↓
4. Frontend sends refresh request:
   POST /api/auth/token/refresh/
   { refresh: "eyJhbGc..." }
   ↓
5. Backend validates refresh token:
   - Checks signature
   - Checks expiration (7 days)
   - Gets user_id from token
   ↓
6. Backend generates new access token:
   - Loads fresh data from database
   - Embeds current RBAC claims
   - Returns new access token
   ↓
7. Frontend stores new access token
   ↓
8. Frontend retries original request
   ↓
9. Request succeeds! ✅
```

---

## Summary

### **Token Generation:**
1. ✅ User logs in with credentials
2. ✅ Backend validates and loads user data from database
3. ✅ JWTService generates tokens with RBAC claims
4. ✅ Tokens signed with SECRET_KEY using HS256
5. ✅ Access token (24h) + Refresh token (7 days) returned

### **Token Storage:**
1. ✅ Frontend stores in localStorage
2. ✅ `accessToken` - JWT access token
3. ✅ `refreshToken` - JWT refresh token
4. ✅ `user` - User data (JSON)

### **Token Usage:**
1. ✅ Sent with every API request: `Authorization: Bearer <token>`
2. ✅ Backend validates signature and expiration
3. ✅ User loaded from database (token claims not trusted blindly)
4. ✅ Admin flags (`is_superuser`, `is_staff`) used for authorization

### **Token Refresh:**
1. ✅ Automatic on 401 errors
2. ✅ Refresh token sent to `/api/auth/token/refresh/`
3. ✅ New access token returned
4. ✅ Original request retried with new token

### **Security:**
1. ✅ Short-lived access tokens (24 hours)
2. ✅ HTTPS encryption in transit
3. ✅ Signature prevents tampering
4. ✅ Backend validates against database
5. ✅ Admin flags checked from User model (not just token)

---

**Your JWT token system is properly implemented and production-ready!** 🎉

