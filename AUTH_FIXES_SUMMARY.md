# Authentication Fix Summary

## Overview
Fixed login and signup functionality to align frontend and backend authentication systems after migrating from JWT to Token authentication.

## Changes Made

### Backend Changes

#### 1. Login Serializer (`shared-backend/crmApp/serializers/auth.py`)
**Problem:** Backend expected `email` field, but frontend sends `username`

**Solution:** Modified `LoginSerializer` to accept `username` with intelligent email fallback
```python
class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(required=True)  # Changed from email
    password = serializers.CharField(required=True, write_only=True)
    
    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')
        
        # Try username authentication first
        user = authenticate(request=self.context.get('request'),
                          username=username, password=password)
        
        # If username login fails and input looks like email, try email
        if not user and '@' in username:
            try:
                email_user = User.objects.get(email=username)
                user = authenticate(request=self.context.get('request'),
                                  username=email_user.username, password=password)
            except User.DoesNotExist:
                pass
        
        if not user:
            raise serializers.ValidationError('Invalid credentials')
        
        attrs['user'] = user
        return attrs
```

#### 2. User Registration (`shared-backend/crmApp/viewsets/auth.py`)
**Problem:** Registration didn't return a token for automatic login

**Solution:** Override `create()` method to return token on registration
```python
def create(self, request, *args, **kwargs):
    """Register a new user and return token"""
    serializer = self.get_serializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = serializer.save()
    
    # Create token for new user
    token, created = Token.objects.get_or_create(user=user)
    
    return Response({
        'user': UserSerializer(user).data,
        'token': token.key,
        'message': 'Registration successful'
    }, status=status.HTTP_201_CREATED)
```

### Frontend Changes

#### 3. Auth Service (`web-frontend/src/services/auth.service.ts`)
**Problem:** Expected JWT format with `access` and `refresh` tokens

**Solution:** Updated to handle simple Token authentication
```typescript
// BEFORE - JWT Format
interface LoginResponse {
  access: string;
  refresh: string;
  user: User;
}

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user',
}

// AFTER - Token Format
interface LoginResponse {
  token: string;
  user: User;
  message?: string;
}

const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  USER: 'user',
}
```

**Key Changes:**
- Removed refresh token logic (not needed for simple Token auth)
- Updated `login()` to store single token
- Updated `register()` to store single token
- Updated `logout()` to clear single token
- Changed `getAccessToken()` to `getAuthToken()`
- Simplified storage key structure

#### 4. API Client (`web-frontend/src/lib/apiClient.ts`)
**Problem:** Used `Bearer ${token}` authorization header (JWT format)

**Solution:** Changed to `Token ${token}` for DRF TokenAuthentication
```typescript
// BEFORE
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// AFTER
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});
```

**Simplified 401 Handling:**
```typescript
// BEFORE - Complex refresh token logic
if (error.response?.status === 401) {
  try {
    const refreshToken = localStorage.getItem('refresh_token');
    // ... attempt token refresh
    // ... retry original request
  } catch (refreshError) {
    // ... clear and redirect
  }
}

// AFTER - Simple logout on 401
if (error.response?.status === 401 && !originalRequest._retry) {
  originalRequest._retry = true;
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  window.location.href = '/login';
  return Promise.reject(error);
}
```

## Authentication Flow

### Login Flow
1. User enters `username` and `password` in LoginForm
2. Frontend sends POST to `/api/auth/login` with `{username, password}`
3. Backend validates credentials (supports both username and email)
4. Backend returns `{user, token, message}`
5. Frontend stores `token` in localStorage as `authToken`
6. Frontend stores `user` object in localStorage
7. Frontend redirects to dashboard

### Signup Flow
1. User fills registration form with all required fields
2. Frontend sends POST to `/api/users` with user data
3. Backend creates user account
4. Backend creates and returns token automatically
5. Frontend stores token and user (same as login)
6. Frontend redirects to dashboard (auto-login after signup)

### API Request Flow
1. API client intercepts all requests
2. Retrieves token from `localStorage.getItem('authToken')`
3. Adds header: `Authorization: Token ${token}`
4. Backend validates token using `TokenAuthentication`
5. Request processed with authenticated user

### Logout Flow
1. User clicks logout
2. Frontend sends POST to `/api/auth/logout`
3. Backend deletes the token from database
4. Frontend clears `authToken` and `user` from localStorage
5. Frontend redirects to login page

## API Response Formats

### Login Response
```json
{
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Doe"
  },
  "token": "9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b",
  "message": "Login successful"
}
```

### Register Response
```json
{
  "user": {
    "id": 2,
    "username": "jane_doe",
    "email": "jane@example.com",
    "first_name": "Jane",
    "last_name": "Doe"
  },
  "token": "7755a08188b51abc8317bc745cc0d3aaceb5dd3a",
  "message": "Registration successful"
}
```

### Logout Response
```json
{
  "message": "Successfully logged out."
}
```

## Testing Checklist

### Backend Tests
- [ ] Login with username works
- [ ] Login with email works (when username contains @)
- [ ] Login with invalid credentials fails appropriately
- [ ] Registration creates user and returns token
- [ ] Logout deletes token from database
- [ ] Protected endpoints require valid token
- [ ] Invalid token returns 401

### Frontend Tests
- [ ] Login form submits correctly
- [ ] Login success redirects to dashboard
- [ ] Login failure shows error message
- [ ] Signup form validates all fields
- [ ] Signup success auto-logs in user
- [ ] Signup failure shows validation errors
- [ ] Token stored in localStorage correctly
- [ ] API requests include correct Authorization header
- [ ] 401 errors clear auth and redirect to login
- [ ] Logout clears localStorage and redirects

### Integration Tests
- [ ] Complete login flow end-to-end
- [ ] Complete signup flow end-to-end
- [ ] Protected route access after login
- [ ] Logout and attempt to access protected route
- [ ] Token persistence across page refreshes
- [ ] Multiple tabs maintain same auth state

## Configuration

### Backend Settings (`crmAdmin/settings.py`)
```python
INSTALLED_APPS = [
    'rest_framework.authtoken',  # Required for Token authentication
    # ... other apps
]

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
}
```

### Frontend API Config (`web-frontend/src/config/api.config.ts`)
```typescript
export const API_CONFIG = {
  BASE_URL: 'http://localhost:8000/api',
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      LOGOUT: '/auth/logout',
      REGISTER: '/users',
      ME: '/users/me',
    },
  },
}
```

## Migration Notes

### What Changed
- **Authentication Type:** JWT → Token
- **Authorization Header:** `Bearer` → `Token`
- **Token Storage:** `access_token` + `refresh_token` → `authToken`
- **Login Field:** `email` → `username` (with email fallback)
- **Token Lifecycle:** Refresh logic removed (tokens don't expire by default)

### What Stayed the Same
- User model structure
- API endpoints
- Frontend components (LoginForm, SignupForm)
- React hooks (useAuth)
- Form validation logic

## Benefits of This Approach

1. **Simplicity:** Single token vs. access/refresh token pairs
2. **Compatibility:** Standard DRF TokenAuthentication
3. **Flexibility:** Supports both username and email login
4. **User Experience:** Auto-login after signup
5. **Security:** Token stored client-side, validated server-side
6. **Maintainability:** Less complex than JWT implementation

## Security Considerations

1. **Token Storage:** Tokens stored in localStorage (consider httpOnly cookies for production)
2. **Token Expiration:** Default tokens don't expire (consider implementing expiration)
3. **HTTPS:** Always use HTTPS in production
4. **CORS:** Configure CORS properly for production
5. **Rate Limiting:** Implement rate limiting on auth endpoints
6. **Password Policy:** Enforce strong password requirements
7. **Account Lockout:** Consider implementing account lockout after failed attempts

## Next Steps

1. Test complete authentication flow
2. Verify token persistence across page refreshes
3. Test error handling for various scenarios
4. Consider implementing token expiration
5. Add remember me functionality (optional)
6. Implement password reset flow
7. Add email verification (optional)
8. Setup social authentication (optional)

## Files Modified

### Backend
- `shared-backend/crmApp/serializers/auth.py` - LoginSerializer updated
- `shared-backend/crmApp/viewsets/auth.py` - UserViewSet.create() added
- `shared-backend/crmAdmin/settings.py` - Token authentication configured (previous session)

### Frontend
- `web-frontend/src/services/auth.service.ts` - Complete rewrite for Token auth
- `web-frontend/src/lib/apiClient.ts` - Authorization header and error handling updated

### No Changes Required
- `web-frontend/src/components/auth/LoginForm.tsx` - Already correct
- `web-frontend/src/components/auth/SignupForm.tsx` - Already correct
- `web-frontend/src/hooks/useAuth.ts` - Works with updated authService
- `web-frontend/src/pages/LoginPage.tsx` - Simple wrapper, no changes needed
- `web-frontend/src/pages/SignupPage.tsx` - Simple wrapper, no changes needed

## Troubleshooting

### Issue: Login returns 401
**Check:**
- Username/email exists in database
- Password is correct
- Token authentication is enabled in settings
- CORS is configured properly

### Issue: Token not being sent
**Check:**
- Token exists in localStorage as `authToken`
- API client is using correct header format: `Token ${token}`
- Request interceptor is adding Authorization header

### Issue: Signup doesn't create token
**Check:**
- UserViewSet.create() method is overridden
- Token import is present in viewsets/auth.py
- Token is being returned in response

### Issue: 401 on protected endpoints
**Check:**
- User is logged in (token in localStorage)
- Token format is correct (no `Bearer` prefix)
- Token hasn't been deleted from database
- User account is active

## Summary

All authentication functionality has been successfully updated to work with Django Rest Framework's Token authentication. The frontend and backend are now fully aligned in terms of:
- Request/response formats
- Token storage and retrieval
- Authorization headers
- Login/signup flows
- Error handling

The system is ready for testing and deployment.
