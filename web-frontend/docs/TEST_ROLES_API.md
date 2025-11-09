# Roles & Permissions API Testing

## Manual Testing Steps

### 1. Check if Backend is Running
```bash
# In terminal, navigate to shared-backend directory
cd D:\LearnAppDev\too-good-crm\shared-backend
python manage.py runserver
```

### 2. Test API Endpoints (use Postman or curl)

**Get Auth Token:**
```bash
curl -X POST http://127.0.0.1:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username": "your_username", "password": "your_password"}'
```

**Get Roles:**
```bash
curl -X GET http://127.0.0.1:8000/api/roles/ \
  -H "Authorization: Token YOUR_TOKEN_HERE"
```

**Get Permissions:**
```bash
curl -X GET http://127.0.0.1:8000/api/permissions/ \
  -H "Authorization: Token YOUR_TOKEN_HERE"
```

**Get Role Permissions:**
```bash
curl -X GET http://127.0.0.1:8000/api/roles/1/permissions/ \
  -H "Authorization: Token YOUR_TOKEN_HERE"
```

### 3. Check Browser Console

Open Settings page → Roles & Permissions tab and check:
1. Open DevTools (F12)
2. Go to Console tab
3. Look for:
   - Network errors (401, 403, 404, 500)
   - CORS errors
   - JavaScript errors
4. Go to Network tab
5. Check API calls to `/api/roles/` and `/api/permissions/`

### 4. Common Issues & Solutions

| Issue | Symptom | Solution |
|-------|---------|----------|
| 401 Unauthorized | Empty roles list | User not logged in - check auth token |
| 403 Forbidden | Permission denied error | User doesn't have permission to view roles |
| 404 Not Found | Endpoint not found | Check backend URL configuration |
| Empty roles/permissions | No data showing | Database needs to be seeded with initial data |
| CORS error | Browser blocks request | Check CORS settings in Django settings.py |

### 5. Seed Database with Test Data (if needed)

```python
# In Django shell (python manage.py shell)
from crmApp.models import Organization, Role, Permission, Employee
from django.contrib.auth.models import User

# Create test organization
org = Organization.objects.first()

# Create test roles
admin_role = Role.objects.create(
    organization=org,
    name="Administrator",
    slug="administrator",
    description="Full system access",
    is_system_role=False
)

# Create test permissions
perms = [
    Permission.objects.create(
        organization=org,
        resource="customer",
        action="view",
        description="View customers"
    ),
    Permission.objects.create(
        organization=org,
        resource="customer",
        action="create",
        description="Create customers"
    ),
    # ... add more as needed
]
```

### 6. Verify Frontend Configuration

Check `web-frontend/src/lib/apiClient.ts`:
```typescript
const API_BASE_URL = 'http://127.0.0.1:8000/api';
```

Check auth token is stored:
```javascript
// In browser console
localStorage.getItem('authToken')
```

### 7. Debug RolesSettings Component

Add console logs to track data flow:

```typescript
// In fetchRoles()
console.log('Fetching roles...');
const fetchedRoles = await roleService.getRoles();
console.log('Roles fetched:', fetchedRoles);

// In fetchPermissions()
console.log('Fetching permissions...');
const fetchedPermissions = await roleService.getPermissions();
console.log('Permissions fetched:', fetchedPermissions);
```

## Expected Behavior

1. **On page load:**
   - Component calls `roleService.getRoles()`
   - Component calls `roleService.getPermissions()`
   - For each role, calls `roleService.getRolePermissions(roleId)`

2. **Create new role:**
   - Opens dialog with form
   - Shows available permissions grouped by resource
   - On submit, creates role and updates permissions

3. **Edit existing role:**
   - Pre-fills form with role data
   - Pre-selects current permissions
   - On submit, updates role and permissions

4. **Delete role:**
   - Shows confirmation dialog
   - Cannot delete system roles
   - On confirm, deletes role

## Quick Fix Checklist

- [ ] Backend server is running
- [ ] User is logged in (check authToken in localStorage)
- [ ] User belongs to an organization
- [ ] Database has roles and permissions (check with Django shell)
- [ ] API endpoints return data (test with curl/Postman)
- [ ] No CORS errors in browser console
- [ ] No 401/403 errors in Network tab
- [ ] roleService is properly imported in component
- [ ] Component is mounted and useEffect is running
