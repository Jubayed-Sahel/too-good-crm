# Sales Permissions Mapping

## 📋 Overview

In CRM systems, **Sales** functionality typically encompasses:
- **Leads** → Potential customers (removed from this system)
- **Deals** → Sales opportunities (removed from this system)  
- **Orders** → Completed sales transactions ✅ **ACTIVE**

Since leads and deals have been removed, we've mapped **Sales permissions to Order permissions**.

---

## 🎯 Permission Mapping

| Frontend Display | Backend Resource | Permissions Available |
|-----------------|------------------|----------------------|
| **Sales** | `order` | `order:read`, `order:create`, `order:update`, `order:delete` |

---

## ✅ Configuration Applied

### Frontend (`web-frontend/src/utils/permissions.ts`)
```typescript
export const CRM_RESOURCES = {
  // ... other resources
  ORDER: 'order',
  
  // Aliases for common use cases
  SALES: 'order',  // Sales = Orders in CRM context
}
```

### Sales Page Route (`web-frontend/src/App.tsx`)
```typescript
<Route path="/sales" element={
  <ProtectedRoute allowedProfiles={['vendor', 'employee']}>
    <PermissionRoute resource="order" action="read">
      <SalesPage />
    </PermissionRoute>
  </ProtectedRoute>
} />
```

### Sidebar Menu (`web-frontend/src/components/dashboard/Sidebar.tsx`)
```typescript
{ 
  icon: FiTrendingUp, 
  label: 'Sales', 
  path: '/sales', 
  resource: CRM_RESOURCES.ORDER,  // ✅ Uses order permission
  action: 'read' 
}
```

---

## 🔧 How to Grant Sales Access to Employees

### Option 1: Via UI (Recommended)
1. **Login as Vendor** (organization owner)
2. Go to **Settings → Team → Roles**
3. Find the employee's role (e.g., "customer-handler")
4. Click **"Manage Permissions"**
5. **Check all "order" permissions**:
   - ✅ order:read (View sales/orders)
   - ✅ order:create (Create new orders)
   - ✅ order:update (Edit orders)
   - ✅ order:delete (Delete orders)
6. Click **"Save Permissions"**
7. **Employee must logout and login again** to see changes

### Option 2: Via Backend Command
```bash
cd shared-backend
python manage.py shell
```

```python
from crmApp.models import Role, Permission, RolePermission, Organization

# Get the role
org = Organization.objects.get(id=21)  # Replace with your org ID
role = Role.objects.get(organization=org, name='customer-handler')  # Replace with role name

# Get or create order permissions
actions = ['read', 'create', 'update', 'delete']
for action in actions:
    perm, created = Permission.objects.get_or_create(
        organization=org,
        resource='order',
        action=action,
        defaults={'description': f'{action.title()} orders/sales'}
    )
    # Assign to role
    RolePermission.objects.get_or_create(
        role=role,
        permission=perm
    )
    print(f"✅ Assigned order:{action} to {role.name}")

print(f"\n✅ Sales permissions added to '{role.name}' role!")
```

---

## 📊 Available Permissions in System

For organization ID 21, these permissions exist:

### Customer Management
- customer:read, customer:create, customer:update, customer:delete

### Sales/Orders (✅ **What you need for Sales page**)
- order:read, order:create, order:update, order:delete

### Activities
- activity:read, activity:create, activity:update, activity:delete

### Issues/Support
- issue:read, issue:create, issue:update, issue:delete

### Employees (Admin)
- employee:read, employee:create, employee:update, employee:delete

### Vendors
- vendor:read, vendor:create, vendor:update, vendor:delete

### Payments
- payment:read, payment:create, payment:update, payment:delete

### System
- role:read, role:create, role:update, role:delete
- settings:read, settings:update
- analytics:read

---

## 🎯 Example: Sales Representative Role

A typical **Sales Representative** would have:

```
✅ customer:read, customer:create, customer:update
✅ order:read, order:create, order:update  ← Sales permissions!
✅ activity:read, activity:create, activity:update
✅ analytics:read
❌ employee:* (no employee management)
❌ role:* (no role management)
❌ settings:* (no settings access)
❌ payment:delete, order:delete (no deletions)
```

---

## 🧪 Testing Sales Permissions

### Step 1: Verify Current Permissions
```bash
cd shared-backend
python manage.py diagnose_employee_permissions --email proyash2@gmail.com --organization-id 21
```

Look for order permissions:
```
✅ order:read = True
✅ order:create = True
✅ order:update = True
✅ order:delete = True
```

### Step 2: Test in UI
1. **Login as employee** (`proyash2@gmail.com`)
2. Check **Sidebar** - "Sales" menu item should be visible
3. Click **"Sales"** - should access the page
4. If blocked, employee needs `order:read` permission

---

## 📝 Summary

- ✅ **Sales = Orders** in this CRM system
- ✅ Sales page now requires `order:read` permission
- ✅ To grant sales access: Give employees `order` permissions
- ✅ Backend has all order permissions available
- ✅ Frontend properly checks permissions for Sales menu and page

**Sales functionality is now properly integrated with RBAC!** 🎉

