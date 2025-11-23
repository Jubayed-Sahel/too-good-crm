# 🚨 URGENT: Employee Access Issue Investigation

## Issue Report
Employee with **NO ROLE assigned** can access:
- ✅ Customers
- ✅ Leads
- ✅ Activities

This should NOT be possible - employees without roles should have **NO ACCESS** to these resources.

---

## 🔍 Step 1: Check Browser Console

1. **Login as the employee** (proyash2@gmail.com)
2. **Open browser DevTools** (F12)
3. **Go to Console tab**
4. **Look for these log messages:**

```
[PermissionContext] ========== PERMISSION FETCH START ==========
[PermissionContext] Profile is EMPLOYEE
[PermissionContext] Calling rbacService.getUserPermissions...
[PermissionContext] 📋 Employee permissions: [...]
[PermissionContext] 🔢 Permission count: X
```

**What to check:**
- Is permission count 0 or >0?
- What permissions are listed?
- Is there a `*:*` wildcard permission?

---

## 🔍 Step 2: Check Network Tab

1. Stay in **DevTools**
2. Go to **Network tab**
3. **Filter:** XHR
4. Look for request to: `/api/user-roles/user_permissions/`

**Check the response:**
```json
{
  "permissions": [...],  // Should be empty [] if no role assigned
  "roles": [...]         // Should be empty [] if no role assigned
}
```

**Screenshot the response and share it!**

---

## 🔍 Step 3: Backend Diagnostic

Run this command to check backend RBAC:

```bash
cd shared-backend
python manage.py diagnose_employee_permissions --email proyash2@gmail.com --organization-id 21
```

**Look for:**
- Employee record status
- Assigned role (should be None or empty)
- RBACService permission check results

---

## 🔍 Step 4: Check Database Directly

```bash
cd shared-backend
python manage.py shell
```

```python
from crmApp.models import User, Employee, Organization, UserRole, Role, RolePermission

# Get the employee user
user = User.objects.get(email='proyash2@gmail.com')
org = Organization.objects.get(id=21)

# Check Employee record
employee = Employee.objects.filter(user=user, organization=org, status='active').first()
print(f"\n=== Employee Record ===")
print(f"User: {user.email}")
print(f"Organization: {org.name}")
if employee:
    print(f"Employee ID: {employee.id}")
    print(f"Employee Role: {employee.role}")  # ⚠️ Should be None if no role
    print(f"Status: {employee.status}")
else:
    print("❌ No active employee record found!")

# Check UserRole assignments
user_roles = UserRole.objects.filter(user=user, organization=org, is_active=True)
print(f"\n=== UserRole Assignments ===")
if user_roles.exists():
    for ur in user_roles:
        print(f"Role: {ur.role.name}")
        # Get permissions for this role
        role_perms = RolePermission.objects.filter(role=ur.role).select_related('permission')
        print(f"  Permissions: {[f'{rp.permission.resource}:{rp.permission.action}' for rp in role_perms]}")
else:
    print("✅ No UserRole assignments (correct if no role assigned)")

# Check if there are any orphaned role assignments
if employee and employee.role:
    print(f"\n⚠️ WARNING: Employee has role '{employee.role.name}' assigned!")
    role_perms = RolePermission.objects.filter(role=employee.role).select_related('permission')
    print(f"Role permissions: {[f'{rp.permission.resource}:{rp.permission.action}' for rp in role_perms]}")
```

---

## 🔧 Possible Causes

### **Cause 1: Frontend Caching**
- Browser cached old permissions when role was assigned
- **Fix:** Hard refresh (Ctrl+Shift+R) or clear browser cache

### **Cause 2: Employee Still Has Role in Database**
- UI says "no role" but database still has role assigned
- **Fix:** Check database directly (Step 4 above)

### **Cause 3: Backend Returning Wrong Permissions**
- Backend API returning permissions despite no role
- **Fix:** Check backend diagnostic (Step 3 above)

### **Cause 4: Frontend Not Checking Permissions**
- Routes/components bypassing permission checks
- **Fix:** Check ProtectedRoute and PermissionRoute implementations

### **Cause 5: Wildcard Permission Granted**
- Employee somehow got `*:*` permission
- **Fix:** Check browser console and API response (Steps 1 & 2)

---

## ✅ What Should Happen

### **Employee with NO ROLE:**
1. Backend API returns: `{ "permissions": [], "roles": [] }`
2. Frontend sets: `permissions = []`
3. `canAccess()` returns: `false` for all resources
4. Sidebar shows: Only Dashboard, Messages, Settings
5. Accessing `/customers` redirects to `/dashboard` with "Unauthorized"

### **Employee with ROLE but NO PERMISSIONS:**
- Same as above

### **Employee with ROLE and PERMISSIONS:**
1. Backend API returns: `{ "permissions": [{"resource": "customer", "action": "read"}, ...], "roles": [...] }`
2. Frontend sets: `permissions = ["customer:read", ...]`
3. `canAccess('customer', 'read')` returns: `true`
4. Sidebar shows: Dashboard, Customers (and other permitted items)
5. Accessing `/customers` works

---

## 🎯 Action Items

Please provide:
1. **Browser console logs** (from Step 1)
2. **Network tab response** (from Step 2)
3. **Backend diagnostic output** (from Step 3)
4. **Database check output** (from Step 4)

This will help identify where the issue is!

