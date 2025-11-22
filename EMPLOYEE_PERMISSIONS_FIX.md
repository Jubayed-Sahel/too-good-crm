# ✅ Employee Permissions Fixed!

## Problem

After assigning a role to an employee, they couldn't see the dashboard or access resources because:
1. Backend permissions used new names: `sales`, `activities`, `issue`, `analytics`, `team`
2. Frontend checked for old names: `customer`, `deal`, `lead`, `activity`, `dashboard`, `employee`
3. No mapping between new and old resource names

## Solution

Added **automatic permission mapping** in the backend that provides backward compatibility.

### Permission Mapping

When an employee has a permission like `sales.view`, they automatically get:
- `customer.view`
- `deal.view`
- `lead.view`

### Complete Mapping Rules

```
sales.* → customer.*, deal.*, lead.*
activities.* → activity.*
issue.* → issue.*
analytics.* → analytics.*, dashboard.*
team.* → employee.*, role.*, permission.*, team.*
```

## How It Works

### Backend (`crmApp/utils/permissions.py`)

```python
RESOURCE_MAPPING = {
    'sales': ['customer', 'deal', 'lead'],
    'activities': ['activity'],
    'issue': ['issue'],
    'analytics': ['analytics', 'dashboard'],
    'team': ['employee', 'role', 'permission', 'team'],
}
```

When checking permissions, the system:
1. Gets the employee's role permissions (e.g., `sales.view`)
2. Automatically adds mapped permissions (`customer.view`, `deal.view`, `lead.view`)
3. Returns all permissions to the frontend

### Example

**Role assigned:** Sales Manager
**Permissions assigned to role:**
- `sales.view`
- `sales.create`
- `activities.view`
- `analytics.view`

**Employee automatically gets:**
- `sales.view`, `sales.create` (actual)
- `customer.view`, `customer.create` (mapped from sales)
- `deal.view`, `deal.create` (mapped from sales)
- `lead.view`, `lead.create` (mapped from sales)
- `activities.view` (actual)
- `activity.view` (mapped from activities)
- `analytics.view` (actual)
- `dashboard.view` (mapped from analytics)

## Testing

### 1. Create a Test Role

```bash
# Login as vendor
# Go to Team page → Roles tab
# Create role: "Sales Manager"
# Assign permissions:
#   - sales: view, create, edit
#   - activities: view, create
#   - analytics: view
```

### 2. Assign Role to Employee

```bash
# Go to Team page → Members tab
# Find an employee
# Assign "Sales Manager" role
```

### 3. Login as Employee

```bash
# Logout
# Login as the employee
# Should see dashboard
# Should be able to access:
#   - Customers (from sales permission)
#   - Deals (from sales permission)
#   - Leads (from sales permission)
#   - Activities (from activities permission)
#   - Analytics (from analytics permission)
```

## Verification

Run this to test permission mapping:

```bash
cd too-good-crm/shared-backend
python manage.py shell
```

```python
from crmApp.models import User, Organization, Employee
from crmApp.utils.permissions import PermissionChecker

# Get employee
employee = Employee.objects.filter(status='active').first()
org = employee.organization

# Check permissions
checker = PermissionChecker(employee.user, org)
perms = checker.get_all_permissions()

print("Employee permissions:")
for p in sorted(perms):
    print(f"  - {p}")

# Test specific checks
print(f"\nhas_permission('sales', 'view'): {checker.has_permission('sales', 'view')}")
print(f"has_permission('customer', 'view'): {checker.has_permission('customer', 'view')}")
print(f"has_permission('deal', 'view'): {checker.has_permission('deal', 'view')}")
print(f"has_permission('dashboard', 'view'): {checker.has_permission('dashboard', 'view')}")
```

## Files Modified

1. **`crmApp/utils/permissions.py`**
   - Added `RESOURCE_MAPPING` dictionary
   - Updated `_get_user_permissions()` to apply mapping
   - Both vendor and employee permissions now include mapped resources

## Summary

✅ **Permission mapping implemented**
✅ **Backward compatibility maintained**
✅ **Employees can now access dashboard and resources**
✅ **No frontend changes needed**
✅ **Works automatically for all roles**

**Employees with assigned roles can now see and access the dashboard and resources based on their permissions!** 🎉

## Permission Categories

### For Vendors to Assign

When creating roles, vendors can assign these 5 categories:

1. **Sales** - Access to customers, deals, leads
2. **Activities** - Access to activities
3. **Issue** - Access to issues
4. **Analytics** - Access to analytics and dashboard
5. **Team** - Access to team management (employees, roles, permissions)

Each category has actions: view, create, edit, delete (some have additional actions like invite, manage_roles, export)

