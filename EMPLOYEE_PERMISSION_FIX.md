# Employee Permission Fix - RBAC Implementation

## 🔍 **Problem Identified**

When employees were assigned roles with specific permissions, they couldn't access resources despite having the correct permissions assigned. The root cause was **two conflicting PermissionContext implementations**:

### ❌ **Bad Implementation** (Removed)
- **Location**: `web-frontend/src/shared/contexts/PermissionContext.tsx`
- **Issue**: Had HARDCODED permissions that didn't fetch from backend
- **Code**:
```typescript
// Employees - check based on typical sales role permissions
if (isEmployee) {
  const employeePermissions: Record<string, string[]> = {
    'customers': ['read', 'create', 'update'],
    'leads': ['read', 'create', 'update'],
    'deals': ['read', 'create', 'update'],
    'activities': ['read', 'create', 'update'],
    'analytics': ['read'],
    'dashboard': ['read'],
    // Resources employees CANNOT access
    'employees': [],
    'vendors': [],
    'settings': [],
    'roles': [],
    'permissions': [],
  };
  const allowedActions = employeePermissions[resource] || [];
  return allowedActions.includes(action);
}
```
This completely ignored the employee's assigned role and permissions from the database!

### ✅ **Good Implementation** (Kept)
- **Location**: `web-frontend/src/contexts/PermissionContext.tsx`
- **Features**: 
  - Fetches real permissions from backend via `rbacService.getUserPermissions()`
  - Uses `/api/user-roles/user_permissions/` endpoint
  - Properly checks employee roles and permissions from database

---

## 🔧 **Fix Applied**

### 1. Removed Bad PermissionContext
```bash
# Deleted file
web-frontend/src/shared/contexts/PermissionContext.tsx
```

### 2. Updated Export Index
```typescript
// web-frontend/src/shared/contexts/index.ts
// Note: PermissionContext has been moved to src/contexts/PermissionContext.tsx
// This version fetches real permissions from the backend for employees
```

### 3. Ensured Correct Import
```typescript
// web-frontend/src/App.tsx
import { PermissionProvider } from './contexts/PermissionContext' // ✅ Correct one!
```

---

## 🎯 **How Employee RBAC Works Now**

### Backend Flow:
1. **Employee Record** → Has a `role` field (ForeignKey to Role)
2. **Role** → Has many **Permissions** via `RolePermission` junction table
3. **RBACService.get_user_permissions()** → Fetches all permissions for employee's role(s)
4. **RBACService.check_permission()** → Validates if employee has specific permission

### Frontend Flow:
1. **PermissionContext** → Fetches permissions via `rbacService.getUserPermissions(userId, orgId)`
2. **API Call** → `/api/user-roles/user_permissions/?user_id=X&organization_id=Y`
3. **Permissions Stored** → Converted to strings like `"customer:read"`, `"customer:create"`
4. **Permission Check** → `canAccess(resource, action)` checks against fetched permissions

---

## 📋 **Testing Employee Permissions**

### Diagnostic Command
Use the provided diagnostic tool to verify employee permissions:

```bash
cd shared-backend
python manage.py diagnose_employee_permissions --email employee@example.com --organization-id 1
```

This will show:
- ✅ User profiles (vendor, employee, customer)
- ✅ Employee records and their assigned roles
- ✅ Permissions for each role
- ✅ RBACService permission checks
- ✅ Actual permission test results

### Manual Testing Steps:
1. **Create a Role** with specific permissions (e.g., "Support" with `customer:read`, `issue:create`)
2. **Assign Role** to employee via:
   - Employee invite (sets `Employee.role` field)
   - Or manually update employee record
3. **Login as Employee**
4. **Check Browser Console** for permission logs:
   ```
   [PermissionContext] Fetching permissions for employee
   [PermissionContext] Employee permissions: ["customer:read", "issue:create"]
   ```
5. **Try accessing resources** - should only allow what's in their role

---

## 🚀 **Expected Behavior**

### ✅ **What Should Work:**
- Employee with `customer:read` → Can view customers list
- Employee with `customer:create` → Can create new customers
- Employee with `issue:update` → Can edit issues
- Employee without `employee:read` → Cannot access Employees page

### ❌ **What Should Be Blocked:**
- Employee without `activity:read` → Access Denied to Activities
- Employee without `employee:create` → Cannot invite new employees
- Employee without `role:read` → Cannot see Roles tab in settings

---

## 🔐 **Backend RBAC Implementation**

### RBACService (shared-backend/crmApp/services/rbac_service.py)
- `check_permission(user, organization, resource, action)` → Returns `True/False`
- `get_user_permissions(user, organization)` → Returns list of permissions
- Checks both `Employee.role` and `UserRole` assignments

### Permission Decorators (shared-backend/crmApp/decorators/rbac.py)
- `@require_permission(resource, action)` → Enforces permission on viewset actions
- `PermissionMixin` → Auto-checks permissions for CRUD operations

### Middleware (shared-backend/crmApp/middleware/organization_context.py)
- Sets `request.user.current_organization`
- Sets `request.user.active_profile` (vendor, employee, or customer)
- Used by RBAC to determine user context

---

## 📝 **Important Notes**

1. **Vendors/Owners** → Always have ALL permissions in their organization
2. **Employees** → Only have permissions based on their assigned role(s)
3. **Permission Format** → Backend uses singular resources (`customer`, `employee`) with standard actions (`read`, `create`, `update`, `delete`)
4. **Frontend Normalization** → Automatically converts plural to singular and old actions to new ones

---

## 🐛 **Common Issues & Solutions**

### Issue 1: Employee can't access anything
**Diagnosis:**
```bash
python manage.py diagnose_employee_permissions --email employee@example.com
```
**Likely Cause:** No role assigned to employee
**Solution:** 
1. Go to Employees page
2. Edit employee
3. Select a role from dropdown
4. Save

### Issue 2: Employee can see resources but can't perform actions
**Diagnosis:** Check role permissions
**Likely Cause:** Role has `read` but not `create`/`update`/`delete`
**Solution:**
1. Go to Settings → Team → Roles
2. Click "Manage Permissions" on the role
3. Check/uncheck desired permissions
4. Save

### Issue 3: Permissions not updating in frontend
**Diagnosis:** Check browser console logs
**Likely Cause:** Frontend cache or stale data
**Solution:**
1. Refresh the page (F5)
2. Or re-login to force permission refresh

---

## ✅ **Testing Checklist**

- [ ] Create a new role with limited permissions (e.g., only `customer:read`)
- [ ] Assign role to an employee
- [ ] Login as that employee
- [ ] Verify they can access Customers (read)
- [ ] Verify they CANNOT create new customers
- [ ] Verify they CANNOT access Employees page
- [ ] Update role to add `customer:create`
- [ ] Refresh page as employee
- [ ] Verify they CAN now create customers
- [ ] Run diagnostic command to verify backend permissions match frontend

---

## 📚 **Related Files**

### Frontend:
- `web-frontend/src/contexts/PermissionContext.tsx` - Main permission context
- `web-frontend/src/services/rbac.service.ts` - API calls for RBAC
- `web-frontend/src/components/guards/PermissionRoute.tsx` - Route-level protection
- `web-frontend/src/components/guards/RequirePermission.tsx` - Component-level protection

### Backend:
- `shared-backend/crmApp/services/rbac_service.py` - RBAC business logic
- `shared-backend/crmApp/decorators/rbac.py` - Permission enforcement
- `shared-backend/crmApp/viewsets/rbac.py` - RBAC API endpoints
- `shared-backend/crmApp/middleware/organization_context.py` - Sets user context
- `shared-backend/crmApp/management/commands/diagnose_employee_permissions.py` - Diagnostic tool

---

## 🎉 **Summary**

The employee permission system now properly:
1. ✅ Fetches real permissions from database based on assigned roles
2. ✅ Checks permissions on both frontend routes and backend API calls
3. ✅ Supports multiple roles per employee (Employee.role + UserRole)
4. ✅ Provides clear access denied messages when permission is missing
5. ✅ Includes diagnostic tools for troubleshooting permission issues

