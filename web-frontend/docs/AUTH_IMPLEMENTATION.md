# Authentication Implementation

Complete guide to the authentication system in the web frontend.

## Overview

The application uses JWT-based authentication with role-based access control (RBAC) and profile management.

## Components

### Auth Components (`src/components/auth/`)

- **AuthLayout.tsx** - Wrapper with gradient background
- **LoginForm.tsx** - Login form with role selector
- **SignupForm.tsx** - Signup form with validation
- **ProtectedRoute.tsx** - Route guard for authenticated pages
- **RoleSelectionDialog.tsx** - Dialog for selecting user profile

### Auth Pages (`src/pages/`)

- **LoginPage.tsx** - Login page
- **SignupPage.tsx** - Signup page

### Services

- **auth.service.ts** - Authentication API service
- **role-selection.service.ts** - Profile selection service

## Authentication Flow

1. User submits credentials
2. Backend validates and returns JWT tokens
3. Tokens stored in localStorage
4. User profile and permissions fetched
5. Redirect to dashboard based on role

## Features

✅ Role/Profile Selection  
✅ JWT Authentication  
✅ Token Auto-Refresh  
✅ Protected Routes  
✅ Permission Guards  
✅ Profile Switching  
✅ Organization Management  

## Routes

```
/ → /login (redirect if not authenticated)
/login → Login page
/signup → Signup page
/dashboard → Dashboard (protected)
/customers → Customers (protected + permissions)
```

## API Endpoints

### Login
```typescript
POST /api/auth/login/
Body: { username, password }
Response: { access, refresh, user }
```

### Signup
```typescript
POST /api/auth/register/
Body: { username, email, password, password2, role }
Response: { access, refresh, user }
```

### Profile Selection
```typescript
POST /api/auth/select-profile/
Body: { profile_id }
Response: { access, profile, permissions }
```

## Token Management

Tokens stored in localStorage:
- `access_token` - JWT access token (1 hour)
- `refresh_token` - JWT refresh token (7 days)

Auto-refresh on 401 responses.

## Permission System

### Context Providers

- **ProfileContext** - User profile management
- **PermissionContext** - Permission checking

### Permission Guard

```typescript
<PermissionGuard permission="view_customer">
  <CustomerList />
</PermissionGuard>
```

### Hook Usage

```typescript
const { hasPermission } = usePermissions();

if (hasPermission('create_customer')) {
  // Show create button
}
```

## Security

- Passwords never stored in state
- JWT auto-refresh
- CORS configured
- XSS protection (React)
- CSRF protection (backend)

## Testing

1. Start backend: `cd shared-backend && python manage.py runserver`
2. Start frontend: `npm run dev`
3. Test login/signup flows
4. Test role switching
5. Test permission-based UI

## Troubleshooting

**Login fails:**
- Check backend is running
- Verify credentials
- Check browser console

**Token expired:**
- Auto-refresh should handle this
- Clear localStorage if stuck

**Permissions not working:**
- Verify backend role/permissions setup
- Check PermissionContext is loaded
- Review browser console logs

## Next Steps

- Implement 2FA
- Add password reset
- Session management
- Audit logging

