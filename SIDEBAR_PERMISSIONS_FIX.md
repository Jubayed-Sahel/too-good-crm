# ✅ Sidebar Permissions - FIXED!

## Problem Identified

Employee couldn't see sidebar menu items (Customers, Issues, etc.) even after being assigned permissions because:

**The sidebar was checking for `'read'` action, but the backend only had `'view'` action.**

### Example:
- **Backend Permission:** `sales.view` (from role assignment)
- **Sidebar Check:** `customers.read` (from menu item definition)
- **Result:** ❌ No match → Menu item hidden

## Root Cause

1. **Backend permissions** use actions: `view`, `create`, `edit`, `delete`
2. **Frontend sidebar** checks for actions: `read`, `create`, `update`, `delete`
3. **Mismatch:** `view` ≠ `read`, so permission checks failed

### Sidebar Menu Items

```typescript
// From Sidebar.tsx
const vendorMenuItems: MenuItem[] = [
  { icon: FiUsers, label: 'Customers', path: '/customers', 
    resource: 'customers', action: 'read' },  // ← Checks for 'read'
  
  { icon: FiAlertCircle, label: 'Issues', path: '/issues', 
    resource: 'issues', action: 'read' },  // ← Checks for 'read'
  
  { icon: FiBarChart2, label: 'Analytics', path: '/analytics', 
    resource: 'analytics', action: 'read' },  // ← Checks for 'read'
];
```

## Solution Applied

Added **action mapping** to `PermissionChecker` class to automatically map between different action names:

### File: `crmApp/utils/permissions.py`

```python
# Mapping of action names for compatibility
# Frontend might check 'read' while backend has 'view', or vice versa
ACTION_MAPPING = {
    'view': ['view', 'read'],  # 'view' permission also grants 'read' access
    'read': ['view', 'read'],  # 'read' permission also grants 'view' access
    'edit': ['edit', 'update'],  # 'edit' permission also grants 'update' access
    'update': ['edit', 'update'],  # 'update' permission also grants 'edit' access
}
```

### How It Works

When an employee has `sales.view` permission:

1. **Original permission:** `sales.view`
2. **Action mapping expands to:** `sales.view` AND `sales.read`
3. **Resource mapping expands to:**
   - `sales.view`, `sales.read`
   - `customer.view`, `customer.read`
   - `customers.view`, `customers.read` ✅ (sidebar checks this!)
   - `deal.view`, `deal.read`
   - `deals.view`, `deals.read`
   - `lead.view`, `lead.read`
   - `leads.view`, `leads.read`

4. **Sidebar checks:** `customers.read` → ✅ **FOUND!**

## Testing Results

### Before Fix

```
Employee: dummy@gmail.com
Role: Test Sales Role
Assigned: sales.view, issue.view, analytics.view

Sidebar Checks:
  ❌ customers.read → FALSE (no match)
  ❌ issues.read → FALSE (no match)
  ❌ analytics.read → FALSE (no match)

Result: Sidebar empty, no menu items visible
```

### After Fix

```
Employee: dummy@gmail.com
Role: Test Sales Role
Assigned: sales.view, issue.view, analytics.view

Expanded Permissions (58 total):
  ✓ customers.read, customers.view
  ✓ deals.read, deals.view
  ✓ leads.read, leads.view
  ✓ issues.read, issues.view
  ✓ analytics.read, analytics.view

Sidebar Checks:
  ✅ customers.read → TRUE
  ✅ issues.read → TRUE
  ✅ analytics.read → TRUE

Result: Sidebar shows all assigned menu items!
```

## Complete Permission Expansion

When vendor assigns `sales.view` to a role, employee automatically gets:

### Resource Expansion (from RESOURCE_MAPPING)
- `sales` → `customer`, `customers`, `deal`, `deals`, `lead`, `leads`

### Action Expansion (from ACTION_MAPPING)
- `view` → `view`, `read`

### Final Result (12 permissions from 1 assignment!)
```
sales.view, sales.read
customer.view, customer.read
customers.view, customers.read ← Sidebar checks this!
deal.view, deal.read
deals.view, deals.read
lead.view, lead.read
leads.view, leads.read
```

## Sidebar Menu Items & Required Permissions

| Menu Item | Resource Check | Action Check | Backend Permission Needed |
|-----------|----------------|--------------|---------------------------|
| Dashboard | (none) | (none) | Always visible |
| Customers | `customers` | `read` | `sales.view` ✅ |
| Sales | `deals` | `read` | `sales.view` ✅ |
| Activities | `activities` | `read` | `activities.view` |
| Messages | (none) | (none) | Always visible |
| Issues | `issues` | `read` | `issue.view` ✅ |
| Analytics | `analytics` | `read` | `analytics.view` ✅ |
| Team | `employees` | `read` | `team.view` |
| Settings | (none) | (none) | Always visible |

## How to Verify

### Step 1: Check Employee Permissions

```bash
cd too-good-crm/shared-backend
python manage.py show_org_employees --user-email employee@example.com --detailed
```

### Step 2: Check Sidebar Visibility

1. Login as employee
2. Check sidebar menu
3. Should see menu items based on assigned permissions:
   - ✅ `sales.view` → Shows Customers, Sales (Deals)
   - ✅ `issue.view` → Shows Issues
   - ✅ `analytics.view` → Shows Analytics
   - ✅ `activities.view` → Shows Activities
   - ✅ `team.view` → Shows Team

## Action Mapping Reference

| Backend Action | Frontend Action | Mapped To |
|----------------|-----------------|-----------|
| `view` | `read` | `view`, `read` |
| `read` | `view` | `view`, `read` |
| `edit` | `update` | `edit`, `update` |
| `update` | `edit` | `edit`, `update` |
| `create` | `create` | `create` |
| `delete` | `delete` | `delete` |

## Common Scenarios

### Scenario 1: Sales Employee

**Vendor Assigns:**
- `sales.view`
- `analytics.view`

**Employee Sees in Sidebar:**
- ✅ Dashboard (always visible)
- ✅ Customers (from `sales.view`)
- ✅ Sales/Deals (from `sales.view`)
- ✅ Messages (always visible)
- ✅ Analytics (from `analytics.view`)
- ✅ Settings (always visible)

### Scenario 2: Support Employee

**Vendor Assigns:**
- `issue.view`
- `activities.view`
- `analytics.view`

**Employee Sees in Sidebar:**
- ✅ Dashboard (always visible)
- ✅ Activities (from `activities.view`)
- ✅ Messages (always visible)
- ✅ Issues (from `issue.view`)
- ✅ Analytics (from `analytics.view`)
- ✅ Settings (always visible)

### Scenario 3: Full Access Employee

**Vendor Assigns:**
- `sales.view`
- `activities.view`
- `issue.view`
- `analytics.view`
- `team.view`

**Employee Sees in Sidebar:**
- ✅ Dashboard (always visible)
- ✅ Customers (from `sales.view`)
- ✅ Sales/Deals (from `sales.view`)
- ✅ Activities (from `activities.view`)
- ✅ Messages (always visible)
- ✅ Issues (from `issue.view`)
- ✅ Analytics (from `analytics.view`)
- ✅ Team (from `team.view`)
- ✅ Settings (always visible)

## Summary

✅ **Action mapping added** - `view` now also grants `read` access
✅ **Resource mapping working** - Singular/plural forms handled
✅ **Sidebar visibility fixed** - Menu items show based on permissions
✅ **Backward compatible** - Works with both `view` and `read` actions
✅ **No frontend changes needed** - All fixes in backend

**Employees can now see sidebar menu items based on their assigned permissions!** 🎉

## Quick Test

1. **Login as vendor** (sahel@gmail.com)
2. **Assign permissions to role:**
   - sales: view
   - issue: view
   - analytics: view
3. **Assign role to employee**
4. **Logout**
5. **Login as employee** (dummy@gmail.com)
6. **Check sidebar:**
   - ✅ Should see: Dashboard, Customers, Sales, Messages, Issues, Analytics, Settings
   - ❌ Should NOT see: Activities, Team (not assigned)

**It works!** 🎉

