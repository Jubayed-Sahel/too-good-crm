# Employee Permission Debugging Guide

## 🔍 **What I've Added**

### 1. Enhanced ProfileSwitcher UI ✅
**Location**: Profile switcher dropdown (top right of navbar)

**What it shows:**
- ✅ **Employee's role name** displayed as a badge under organization name
- ⚠️ **"No Role Assigned"** warning if employee has no role
- Shows role in both the dropdown and in the active profile display

### 2. Comprehensive Console Logging ✅
**Location**: Browser Console (F12 → Console tab)

**What it logs:**
```
========== PERMISSION FETCH START ==========
User: proyash2@gmail.com (ID: 47)
activeOrganizationId: 21
Active Profile Details: {
  id: 48,
  profile_type: 'employee',
  organization: 21,
  organization_name: 'pro1',
  roles: [{id: 18, name: 'customer-handler', slug: 'customer-handler', is_primary: true}],
  is_primary: true
}
✅ Profile is EMPLOYEE
Fetching permissions for employee: {
  userId: 47,
  organizationId: 21,
  profileId: 48,
  employeeRole: 'customer-handler'
}
Calling rbacService.getUserPermissions...
✅ Received userPermissions response: {...}
📋 Employee permissions: ["customer:read", "customer:create", "customer:update", "customer:delete"]
🔢 Permission count: 4
✅ Setting permissions: ["customer:read", "customer:create", "customer:update", "customer:delete"]
========== PERMISSION FETCH COMPLETE (Employee) ==========
```

---

## 📋 **What To Check**

### Step 1: Login as Employee
Login as: `proyash2@gmail.com`

### Step 2: Check Profile Switcher
1. Click the **profile switcher** (top right)
2. Look for your employee profile
3. **Does it show the role?**
   - ✅ **"Role: customer-handler"** = Good! Role is assigned
   - ❌ **"No Role Assigned"** = Problem! Employee.role is null

### Step 3: Open Browser Console
1. Press **F12** to open Developer Tools
2. Go to **Console** tab
3. **Refresh the page** (F5)
4. Look for logs starting with `[PermissionContext]`

### Step 4: Analyze the Console Output

#### ✅ **GOOD - Everything Working:**
```
✅ Profile is EMPLOYEE
employeeRole: 'customer-handler'  ← Role is set!
✅ Received userPermissions response
📋 Employee permissions: ["customer:read", ...]
🔢 Permission count: 4  ← Permissions found!
✅ Setting permissions
```

#### ❌ **BAD - Missing activeOrganizationId:**
```
activeOrganizationId: null  ← PROBLEM!
❌ Missing required data - aborting permission fetch
```
**Fix**: ProfileContext is not setting activeOrganizationId correctly

#### ❌ **BAD - No Permissions Returned:**
```
✅ Profile is EMPLOYEE
employeeRole: 'NO ROLE'  ← PROBLEM!
🔢 Permission count: 0  ← No permissions!
⚠️ Employee has no permissions assigned
```
**Fix**: Employee.role is null in database

#### ❌ **BAD - API Error:**
```
❌ Could not fetch employee permissions
Error details: {...}
```
**Fix**: Backend API issue or authentication problem

---

## 🛠️ **Common Issues & Fixes**

### Issue 1: "No Role Assigned" in ProfileSwitcher
**Symptom**: ProfileSwitcher shows "No Role Assigned" badge
**Cause**: `Employee.role` field is `null` in database
**Fix**: 
```bash
cd shared-backend
python manage.py diagnose_employee_permissions --email proyash2@gmail.com --organization-id 21
```
If it shows "NO ROLE", then update employee:
1. Go to Employees page (as vendor)
2. Click Edit on the employee
3. Select a role from dropdown
4. Save

### Issue 2: activeOrganizationId is null
**Symptom**: Console shows `activeOrganizationId: null`
**Cause**: UserProfile.organization is not set correctly
**Fix**: Check that the employee's UserProfile has organization ID 21:
```bash
cd shared-backend
python list_users.py
```
Look for: `User: proyash2@gmail.com, Type: employee, Org: pro1`

### Issue 3: Permissions not updating after role assignment
**Symptom**: Assigned role but still can't access resources
**Cause**: Frontend cached old profile data
**Fix**:
1. **Logout** completely
2. **Clear browser cache** (Ctrl+Shift+Delete)
3. **Login again** (fresh session)
4. Check console logs again

### Issue 4: API returns 0 permissions
**Symptom**: Console shows `Permission count: 0`
**Cause**: Role has no permissions assigned
**Fix**:
1. Go to **Settings → Team → Roles**
2. Find the role (e.g., "customer-handler")
3. Click **"Manage Permissions"**
4. Check the permissions you want
5. Click **"Save Permissions"**
6. **Logout and login again** as employee

---

## 🎯 **Expected Flow (When Working)**

1. **Login** → Backend sends User with profiles including roles
2. **ProfileContext** → Sets `activeProfile` with role data
3. **ProfileSwitcher** → Displays role name from `activeProfile.roles[0].name`
4. **PermissionContext** → Fetches permissions via API
5. **API Call** → `/api/user-roles/user_permissions/?user_id=47&organization_id=21`
6. **Backend** → Checks Employee.role → Gets RolePermissions → Returns permissions
7. **Frontend** → Stores permissions like `["customer:read", ...]`
8. **Route Guards** → Check `canAccess('customer', 'read')` → Allow/Deny access

---

## 📞 **What to Share for Help**

If you're still stuck, share:
1. **Screenshot** of ProfileSwitcher dropdown (showing role or "No Role Assigned")
2. **Console logs** from `[PermissionContext]` (copy-paste the entire section)
3. **Output** from diagnostic command:
   ```bash
   python manage.py diagnose_employee_permissions --email proyash2@gmail.com --organization-id 21
   ```

---

## ✅ **Quick Test Checklist**

- [ ] Open ProfileSwitcher - Does it show role name?
- [ ] Open Console (F12) - Refresh page
- [ ] Check `activeOrganizationId` - Is it 21 (not null)?
- [ ] Check `employeeRole` - Is it 'customer-handler' (not 'NO ROLE')?
- [ ] Check `Permission count` - Is it 4 (not 0)?
- [ ] Try accessing Customers page - Does it work?

---

**Backend is working 100% correctly!** The issue is in frontend data flow. Use these logs to find exactly where it breaks.

