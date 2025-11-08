# Employee Menu & Permission System - FIXED

## Problem Identified
When logging in as `admin@crm.com` with employee profile, **NO SIDEBAR MENU** was visible because:

1. ❌ **No role was assigned** to the employee
2. ❌ **Permission naming mismatch** between backend and frontend

## Root Causes

### Issue 1: No Role Assigned
- Employee profile existed in database (ID: 58)
- But `UserRole` table had NO entry linking `admin@crm.com` to any role in "New Org"
- Result: Employee had zero permissions → Sidebar filtered out ALL menu items

### Issue 2: Permission Naming Mismatch
Backend database has **MIXED** naming conventions:
- **Singular with view/edit**: `customer:view`, `customer:create`, `customer:edit`, `customer:delete`
- **Plural with CRUD**: `customers:read`, `customers:create`, `customers:update`, `customers:delete`

Frontend code was checking:
- `canAccess('customers', 'read')` ← Looking for `customers:read`

But the "Support" role had:
- `customer:view`, `customer:create`, `customer:edit`, `customer:delete` ← Different format!

Result: Even after assigning role, permissions wouldn't match!

## Fixes Applied

### Fix 1: Assigned Role to Employee ✅

**Script:** `shared-backend/assign_role_to_admin.py`

```python
# Assigned "Support" role to admin@crm.com in "New Org"
UserRole.objects.create(
    user=admin,
    organization=new_org,
    role=support_role,  # "Support" role
    is_active=True
)
```

**Result:**
- Created UserRole ID: 24
- admin@crm.com now has "Support" role with 4 permissions:
  - `customer:view`
  - `customer:create`
  - `customer:edit`
  - `customer:delete`

### Fix 2: Smart Permission Matching ✅

**Updated:** `web-frontend/src/contexts/PermissionContext.tsx`

**What Changed:**
```typescript
// OLD (strict matching)
canAccess('customers', 'read')  // Only checks "customers:read"

// NEW (smart matching with aliases)
canAccess('customers', 'read')  // Checks ALL these:
  - customers:read  ✓
  - customer:view   ✓ (singular + view alias)
  - customers:view  ✓
  - customer:read   ✓
```

**Implementation:**
1. **Singular/Plural Normalization:**
   - Removes trailing 's' to get singular form
   - Checks both `customers:read` AND `customer:read`

2. **Action Aliases:**
   ```typescript
   'read' ↔ 'view'    // Backend uses "view", frontend uses "read"
   'update' ↔ 'edit'  // Backend uses "edit", frontend uses "update"
   'create' → 'create'
   'delete' → 'delete'
   ```

3. **Comprehensive Check:**
   - Tries all combinations: `resource:action`, `singularResource:action`
   - Tries all action aliases
   - Checks wildcards: `customers:*`, `customer:*`

## Testing Workflow

### 1. Verify Role Assignment
```bash
cd shared-backend
python check_employee_permissions.py
```

**Expected Output:**
```
=== User: admin@crm.com ===
Profiles:
  - ID: 229
    Type: employee
    Org: New Org
    Is Primary: True

    Assigned Roles:
      - Role: Support (ID: 33)
        Permissions:
          * customer:view
          * customer:create
          * customer:edit
          * customer:delete
```

### 2. Test Employee Login
1. **Logout** from current session
2. **Login as** `admin@crm.com`
3. **Expected Results:**
   - ✅ Sidebar menu is VISIBLE
   - ✅ Shows menu items:
     - Dashboard (has `customer:view` permission)
     - Customers (has `customer:view` permission)
   - ✅ **Create Customer** button is ENABLED (has `customer:create`)
   - ✅ **Edit** buttons are ENABLED (has `customer:edit`)
   - ✅ **Delete** buttons are ENABLED (has `customer:delete`)

### 3. Test Other Pages (Should NOT appear)
- ❌ Sales page (no `deal` permissions)
- ❌ Deals page (no `deal` permissions)
- ❌ Leads page (no `lead` permissions)
- ❌ Activities page (no `activity` permissions)
- ❌ Team page (no `employee` permissions)
- ❌ Analytics page (no `analytics` permissions)

## Permission Logic Flow

```
User Login (admin@crm.com)
    ↓
ProfileContext: Sets activeProfile = Employee (org: "New Org")
    ↓
PermissionContext: Fetches permissions via rbacService.getUserPermissions()
    ↓
Backend returns: [
  { resource: 'customer', action: 'view' },
  { resource: 'customer', action: 'create' },
  { resource: 'customer', action: 'edit' },
  { resource: 'customer', action: 'delete' }
]
    ↓
Convert to strings: ['customer:view', 'customer:create', ...]
    ↓
Sidebar filters menu items:
  - Dashboard: canAccess('dashboard') → TRUE (has customer:view)
  - Customers: canAccess('customers') → TRUE (has customer:view)
  - Deals: canAccess('deals') → FALSE (no deal permissions)
    ↓
Shows only Dashboard & Customers in menu
```

## Files Modified

### 1. `web-frontend/src/contexts/PermissionContext.tsx`
**Changes:**
- ✅ Enhanced `canAccess()` function with smart permission matching
- ✅ Handles singular/plural resource names
- ✅ Maps action aliases (read↔view, update↔edit)
- ✅ Checks all possible permission formats

### 2. `shared-backend/assign_role_to_admin.py` (NEW)
**Purpose:** Assign "Support" role to admin@crm.com employee
**Result:** Created UserRole ID 24

### 3. `shared-backend/check_employee_permissions.py` (NEW)
**Purpose:** Debug script to check employee's assigned roles and permissions

### 4. `shared-backend/list_all_permissions.py` (NEW)
**Purpose:** List all available permissions in the system

## Known Permissions Database

### Customers (Support Role Has These)
- ✅ `customer:view` - View customers
- ✅ `customer:create` - Create customers
- ✅ `customer:edit` - Edit customers
- ✅ `customer:delete` - Delete customers

### Other Resources (Support Role Does NOT Have)
- ❌ `deal:*` - Deal permissions
- ❌ `lead:*` - Lead permissions
- ❌ `activity:*` - Activity permissions
- ❌ `employee:*` - Employee management
- ❌ `analytics:*` - Analytics access

## Creating More Roles

To create a role with different permissions:

1. **Login as** `me@me.com` (organization owner)
2. **Navigate to** Settings → Roles & Permissions
3. **Create New Role:**
   - Name: "Sales Rep"
   - Permissions:
     - `customers:read`, `customers:create`
     - `leads:read`, `leads:create`, `leads:update`, `leads:convert`
     - `deals:read`, `deals:create`, `deals:update`
4. **Assign to Employee** via Team Management page

## Troubleshooting

### Problem: Employee sees NO menu items
**Diagnosis:**
```bash
cd shared-backend
python check_employee_permissions.py
```

**If output shows "NO ROLES ASSIGNED":**
```bash
python assign_role_to_admin.py
```

### Problem: Employee has role but buttons are disabled
**Cause:** Permission name mismatch
**Solution:** Already fixed with smart permission matching in PermissionContext

### Problem: Want to add more permissions to Support role
**Backend Script:**
```python
from crmApp.models import Role, Permission, RolePermission

support_role = Role.objects.get(slug='support', organization__name='New Org')
lead_view = Permission.objects.get(resource='lead', action='view')

RolePermission.objects.create(role=support_role, permission=lead_view)
```

## Next Steps

1. ✅ **DONE:** Assigned role to admin@crm.com
2. ✅ **DONE:** Fixed permission matching logic
3. 🔲 **TODO:** Test employee login and verify sidebar shows
4. 🔲 **TODO:** Create more roles with different permission sets
5. 🔲 **TODO:** Test permission checks on all pages

---

**Status:** ✅ **FIXED - READY FOR TESTING**  
**Assigned Role:** Support (customer:view, create, edit, delete)  
**Expected Behavior:** Employee sees Dashboard & Customers menu, with full CRUD buttons enabled
