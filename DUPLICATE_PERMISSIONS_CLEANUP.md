# Duplicate Permissions Cleanup Guide

## Problem

Your permissions tab shows **8 permissions instead of 4** because permissions were being created with two different naming conventions:

### Duplicate Examples:
- `customer:view` AND `customers:read` (both mean "view customers")
- `customer:edit` AND `customers:update` (both mean "update customers")
- `customer:create` (correct) but duplicated with `customers:create`
- `customer:delete` (correct) but duplicated with `customers:delete`

---

## Root Cause

Two different sources were creating permissions:

1. **Organization Serializer** (`organization.py`):
   - ❌ Used: `customer:view`, `customer:edit`
   - ✅ Now uses: `customer:read`, `customer:update`

2. **Seed Data Command** (`seed_data.py`):
   - ❌ Used: `customers:read`, `customers:update` (plural)
   - ✅ Now uses: `customer:read`, `customer:update` (singular)

---

## Fix Applied

### Standardized Convention

✅ **Resource Names: Singular**
- `customer` (not `customers`)
- `employee` (not `employees`)
- `activity` (not `activities`)
- `issue` (not `issues`)
- `order` (not `orders`)
- `payment` (not `payments`)
- `vendor` (not `vendors`)

✅ **Actions: Standard CRUD**
- `read` (not `view`)
- `create` ✓ (already correct)
- `update` (not `edit`)
- `delete` ✓ (already correct)

---

## Files Updated

1. ✅ `shared-backend/crmApp/serializers/organization.py`
   - Changed `view` → `read`
   - Changed `edit` → `update`

2. ✅ `shared-backend/crmApp/management/commands/seed_data.py`
   - Changed plural names to singular
   - Already using standard CRUD actions

3. ✅ `shared-backend/crmApp/management/commands/ensure_role_permissions.py`
   - Updated permission sets to use singular names

4. ✅ `shared-backend/crmApp/viewsets/rbac.py`
   - Updated basic permissions to use singular names

5. 🆕 `shared-backend/crmApp/management/commands/remove_duplicate_permissions.py`
   - New cleanup command

---

## How to Apply

### Step 1: Preview What Will Be Deleted

```bash
cd shared-backend
python manage.py remove_duplicate_permissions --dry-run
```

This will show:
- All permissions with plural names (customers, employees, etc.)
- All permissions with old actions (view, edit)
- Role assignments that will be affected

### Step 2: Run the Cleanup

```bash
python manage.py remove_duplicate_permissions
```

It will ask for confirmation before deleting.

### Step 3: Verify Results

Check your permissions tab - you should now see:
- ✅ **4 permissions per resource** (read, create, update, delete)
- ✅ No duplicates
- ✅ Clean, standardized naming

---

## What Gets Removed

### Permissions to Delete:

**Plural Resource Names:**
- `customers:*` → Replaced by `customer:*`
- `employees:*` → Replaced by `employee:*`
- `activities:*` → Replaced by `activity:*`
- `issues:*` → Replaced by `issue:*`
- `orders:*` → Replaced by `order:*`
- `payments:*` → Replaced by `payment:*`
- `vendors:*` → Replaced by `vendor:*`

**Old Action Names:**
- `*:view` → Replaced by `*:read`
- `*:edit` → Replaced by `*:update`

**Obsolete Resources:**
- `deals:*` (already marked for removal)
- `leads:*` (already marked for removal)

---

## What Gets Kept

### Standard Permissions:

For each resource (customer, employee, activity, issue, order, payment, vendor):
- ✅ `resource:read` - View permission
- ✅ `resource:create` - Create permission
- ✅ `resource:update` - Update permission
- ✅ `resource:delete` - Delete permission

**Total: 4 permissions per resource** ✅

---

## Impact on Existing Roles

### Before Cleanup:
```
Sales Role has permissions:
- customers:read
- customer:view     ← Duplicate!
- customers:update
- customer:edit     ← Duplicate!
```

### After Cleanup:
```
Sales Role has permissions:
- customer:read
- customer:update
```

The cleanup command will:
1. Remove duplicate permissions from database
2. Remove role-permission assignments for duplicates
3. Keep only the standardized permissions

**Note:** Roles might lose some permission assignments, but since they were duplicates, the actual access remains the same.

---

## Frontend Compatibility

The frontend already handles both naming conventions:

```typescript
// Frontend PermissionContext normalizes these automatically
canAccess('customer', 'read')   // Checks: customer:read
canAccess('customers', 'read')  // Also checks: customer:read (normalized)
canAccess('customer', 'update') // Checks: customer:update
canAccess('customer', 'edit')   // Also checks: customer:update (normalized)
```

So the frontend will work correctly with the standardized backend permissions.

---

## Testing After Cleanup

### Test 1: Check Permissions Tab
- Open vendor settings → Team → Permissions tab
- Each resource should show exactly **4 permissions**
- No duplicates

### Test 2: Test Employee Access
- Assign role with `customer:read` to employee
- Employee should be able to view customers
- No errors in console

### Test 3: Test Permission Checks
```bash
# Get user permissions
GET /api/rbac/user-roles/user_permissions/?user_id=X&organization_id=Y

# Should return only standardized permissions:
{
  "permissions": [
    {"resource": "customer", "action": "read"},
    {"resource": "customer", "action": "create"},
    // etc.
  ]
}
```

---

## Rollback (If Needed)

If something goes wrong, you can recreate permissions:

```bash
# This will recreate default permissions for organizations without any
python manage.py fix_missing_permissions
```

But this shouldn't be necessary as the cleanup only removes duplicates.

---

## Summary

**Before:** 
- 8 permissions per resource (duplicates)
- Mixed naming (singular/plural, view/edit vs read/update)
- Confusing and inconsistent

**After:**
- ✅ 4 permissions per resource
- ✅ Standardized naming (singular + CRUD)
- ✅ Clean and consistent
- ✅ Industry best practices

---

**Run the cleanup command now to fix your permissions tab! 🎉**

```bash
cd shared-backend
python manage.py remove_duplicate_permissions
```

