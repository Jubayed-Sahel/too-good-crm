# Permissions Not Showing - Debug Guide

## Issue
Permissions are not displaying in the role creation popup UI after creating a new organization.

## What Should Happen
1. User creates organization → Backend creates 92 default permissions
2. Frontend opens role creation dialog → Fetches permissions from `/api/permissions/`
3. Backend filters permissions by user's organization → Returns permissions
4. Dialog displays permissions grouped by resource with checkboxes

## Debugging Steps

### Step 1: Verify Organization & UserOrganization Were Created

Open Django shell:
```bash
cd shared-backend
python manage.py shell
```

Check if organization and UserOrganization exist:
```python
from crmApp.models import User, Organization, UserOrganization, Permission

# Replace with your email
user = User.objects.get(email='your-email@example.com')
print(f"User: {user.email}")

# Check user's organizations
user_orgs = UserOrganization.objects.filter(user=user, is_active=True)
print(f"User organizations count: {user_orgs.count()}")

for uo in user_orgs:
    print(f"  - {uo.organization.name} (ID: {uo.organization.id}), Owner: {uo.is_owner}, Active: {uo.is_active}")

# Check permissions for each organization
for uo in user_orgs:
    org = uo.organization
    perms = Permission.objects.filter(organization=org)
    print(f"\nOrganization: {org.name}")
    print(f"  Permissions count: {perms.count()}")
    if perms.count() > 0:
        print(f"  Sample permissions:")
        for p in perms[:5]:
            print(f"    - {p.resource}.{p.action}: {p.description}")
```

**Expected Result:**
- UserOrganization should exist with `is_active=True`
- Organization should have 92 permissions

**If permissions are missing:**
The issue is in backend - permissions weren't created. Run this to create them manually:
```python
from crmApp.serializers.organization import OrganizationCreateSerializer

# Get your organization
org = Organization.objects.get(name='YourOrgName')

# Create default permissions
serializer = OrganizationCreateSerializer()
serializer._create_default_permissions(org)

# Verify
print(f"Permissions created: {Permission.objects.filter(organization=org).count()}")
```

### Step 2: Test API Endpoint Directly

Open browser console on your web app, and run:
```javascript
// Check authentication
const token = localStorage.getItem('access_token');
console.log('Token:', token ? 'Present' : 'Missing');

// Test permissions endpoint
fetch('http://localhost:8000/api/permissions/', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
.then(r => r.json())
.then(data => {
  console.log('API Response:', data);
  console.log('Type:', typeof data);
  console.log('Is array?', Array.isArray(data));
  console.log('Has results?', 'results' in data);
  console.log('Count:', data.results?.length || data.length || 0);
})
.catch(err => console.error('API Error:', err));
```

**Expected Result:**
- Should return object with `results` array containing 92 permissions
- Format: `{ count: 92, next: null, previous: null, results: [...] }`

**If empty:**
Check backend console for debug logs - it will show:
```
[DEBUG] User: your-email@example.com
[DEBUG] User organizations: [1]
[DEBUG] Found 92 permissions
```

If it shows 0 permissions, the database query is failing.

### Step 3: Check Frontend Logs

Open browser DevTools → Console tab

When you open the role creation dialog, you should see:
```
[RoleService] Fetching permissions from: /permissions/
[RoleService] Raw API response: {...}
[RoleService] Response type: object
[RoleService] Is array? false
[RoleService] Has results? true
[RoleService] Returning results array, count: 92
Raw permissions response: {...}
Parsed permissions: [...92 items...]
Total permissions count: 92
```

**If count is 0:**
- Check Network tab → `/api/permissions/` request
- Check response body
- Check request headers (Authorization token)

### Step 4: Check Network Tab

1. Open DevTools → Network tab
2. Open role creation dialog
3. Look for `/api/permissions/` request
4. Click on it and check:
   - **Status:** Should be 200 OK
   - **Headers → Request Headers:** Should have `Authorization: Bearer <token>`
   - **Response:** Should have `results` array with 92 items

**If 401 Unauthorized:**
Token is invalid or missing - check authentication.

**If 200 but empty results:**
Backend filtering is removing all permissions - check organization context.

### Step 5: UI State Check

Add temporary debugging in RolesSettings component:

Open browser console and check:
```javascript
// After dialog opens, check React state
// (You'll need to use React DevTools for this)
```

Or add this temporarily to RolesSettings.tsx inside the dialog:
```tsx
<Text fontSize="xs" color="gray.500">
  Debug: permissions.length = {permissions.length}, 
  isLoadingPermissions = {isLoadingPermissions.toString()}
</Text>
```

## Common Issues & Fixes

### Issue 1: Permissions Created But Not Returned
**Symptom:** Database has 92 permissions, but API returns empty array.

**Cause:** Organization context mismatch or inactive UserOrganization.

**Fix:**
```python
# In Django shell
user_org = UserOrganization.objects.get(user=user, organization=org)
user_org.is_active = True
user_org.save()
```

### Issue 2: UserOrganization Not Created
**Symptom:** No UserOrganization record exists after organization creation.

**Cause:** OrganizationCreateSerializer.create() didn't run properly.

**Fix:**
```python
# In Django shell
UserOrganization.objects.create(
    user=user,
    organization=org,
    is_owner=True,
    is_active=True
)
```

### Issue 3: Frontend Not Fetching Permissions
**Symptom:** No network request to `/api/permissions/` when dialog opens.

**Cause:** fetchPermissions() not called or blocked.

**Fix:** Check browser console for errors. Verify RolesSettings useEffect is running.

### Issue 4: API Response Format Mismatch
**Symptom:** API returns data but frontend shows 0 permissions.

**Cause:** Frontend parsing logic doesn't match backend format.

**Fix:** Check the detailed logs from RoleService and compare with actual API response.

## Files Modified for Debugging

1. **Backend - shared-backend/crmApp/viewsets/rbac.py**
   - Added debug logging to `PermissionViewSet.get_queryset()`
   - Prints user email, organization IDs, and permission count

2. **Frontend - web-frontend/src/services/role.service.ts**
   - Added detailed logging to `getPermissions()`
   - Shows API endpoint, response type, and count

3. **Frontend - web-frontend/src/components/settings/RolesSettings.tsx**
   - Added loading state indicator
   - Added reload button in empty state
   - Shows permission count in header
   - Refetches permissions if empty when dialog opens

## Next Steps After Debugging

Once you identify the issue:

1. **If backend problem:** Fix organization/permission creation
2. **If API problem:** Check authentication and organization context
3. **If frontend problem:** Fix state management or API parsing
4. **If none:** Try clearing browser cache and localStorage, then re-login

## Quick Test

Run this complete flow:
1. Create new user account
2. Create organization
3. Check browser console - should see 92 permissions logged
4. Open role creation dialog
5. Should see "Loading permissions..."
6. Should then see permissions grouped by resource

If it fails at any step, use the debugging steps above for that specific step.
