# Permission to Menu Mapping - Quick Reference

## Current Permissions for admin@crm.com (Support Role)

After running `add_more_permissions.py`, the Support role now has **19 permissions**:

### ✅ Permissions Granted:

| Permission | Menu Item Visible | Notes |
|------------|------------------|-------|
| `dashboard:read` | ✅ **Dashboard** | Home page |
| `customer:view/create/edit/delete` | ✅ **Customers** | Full CRUD access |
| `deal:view/create/edit/delete` | ✅ **Sales** + **Deals** | Both menu items use 'deals' resource |
| `lead:view/create/edit/delete` | ✅ **Leads** | Full CRUD access |
| `activity:view/create/edit/delete` | ✅ **Activities** | Full CRUD access |
| `analytics:view` | ✅ **Analytics** | View only |
| `settings:view` | ✅ **Settings** | View only |

### ❌ Permissions NOT Granted:

| Resource | Menu Item Hidden | Why Not Visible |
|----------|-----------------|----------------|
| `employee:*` | ❌ **Team** | No employee permissions |

## What You'll See After Logout/Login

### Sidebar Menu (admin@crm.com employee):
```
📊 Dashboard        ← VISIBLE (has dashboard:read)
👥 Customers        ← VISIBLE (has customer:view)
📈 Sales            ← VISIBLE (has deal:view)
📄 Deals            ← VISIBLE (has deal:view)
🎯 Leads            ← VISIBLE (has lead:view)
⚡ Activities       ← VISIBLE (has activity:view)
📊 Analytics        ← VISIBLE (has analytics:view)
⚙️ Settings         ← VISIBLE (has settings:view)
```

### What's Hidden:
```
👥 Team             ← HIDDEN (no employee:view permission)
```

## Button States Per Page

### 📊 Dashboard
- ✅ All visible (read-only page)

### 👥 Customers Page
- ✅ **Add Customer** button - ENABLED (has `customer:create`)
- ✅ **Edit** buttons - ENABLED (has `customer:edit`)
- ✅ **Delete** buttons - ENABLED (has `customer:delete`)
- ✅ **Bulk Delete** - ENABLED (has `customer:delete`)

### 📄 Deals Page
- ✅ **Add Deal** button - ENABLED (has `deal:create`)
- ✅ **Edit** buttons - ENABLED (has `deal:edit`)
- ✅ **Delete** buttons - ENABLED (has `deal:delete`)

### 🎯 Leads Page
- ✅ **Add Lead** button - ENABLED (has `lead:create`)
- ✅ **Edit** buttons - ENABLED (has `lead:edit`)
- ✅ **Delete** buttons - ENABLED (has `lead:delete`)
- ✅ **Convert to Customer** - ENABLED (has `lead:edit`)

### ⚡ Activities Page
- ✅ **Create Activity** button - ENABLED (has `activity:create`)
- ✅ **Edit** buttons - ENABLED (has `activity:edit`)
- ✅ **Delete** buttons - ENABLED (has `activity:delete`)

### 📊 Analytics Page
- ✅ All charts visible (has `analytics:view`)
- ❌ Export buttons - DISABLED (no `analytics:export` permission)

### ⚙️ Settings Page
- ✅ View settings (has `settings:view`)
- ❌ Change settings - DISABLED (no `settings:update` permission)

## Adding Team Management Access

If you want `admin@crm.com` to see the **Team** menu and manage employees:

```bash
cd shared-backend
python -c "
import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from crmApp.models import Organization, Role, Permission, RolePermission

new_org = Organization.objects.get(name='New Org')
support_role = Role.objects.get(slug='support', organization=new_org)

# Add employee permissions
for action in ['view', 'create', 'edit', 'delete']:
    perm = Permission.objects.filter(resource='employee', action=action).first()
    if perm:
        RolePermission.objects.get_or_create(role=support_role, permission=perm)
        print(f'Added: employee:{action}')

print('✅ Team menu will now be visible!')
"
```

## Testing Checklist

### Before Login:
- [ ] Run `python add_more_permissions.py` (already done ✅)
- [ ] Check permissions: `python check_employee_permissions.py`

### After Login as admin@crm.com:
- [ ] See 8 menu items (Dashboard, Customers, Sales, Deals, Leads, Activities, Analytics, Settings)
- [ ] Team menu is hidden
- [ ] All CRUD buttons are enabled on Customers page
- [ ] All CRUD buttons are enabled on Deals page
- [ ] All CRUD buttons are enabled on Leads page
- [ ] Can create/edit/delete activities

### Permission Check Pattern:

The permission system checks in this order:
1. **Is Vendor/Owner?** → Full access, bypass all checks
2. **Has wildcard `*:*`?** → Full access
3. **Has resource wildcard `customers:*`?** → All actions for that resource
4. **Has specific permission?** → Check both:
   - Plural + CRUD: `customers:read`, `customers:create`, `customers:update`, `customers:delete`
   - Singular + View/Edit: `customer:view`, `customer:create`, `customer:edit`, `customer:delete`

## Permission Naming Patterns

The system handles **BOTH** naming conventions automatically:

| Frontend Checks | Backend Matches |
|----------------|-----------------|
| `canAccess('customers', 'read')` | `customers:read` OR `customer:view` |
| `canAccess('customers', 'create')` | `customers:create` OR `customer:create` |
| `canAccess('customers', 'update')` | `customers:update` OR `customer:edit` |
| `canAccess('customers', 'delete')` | `customers:delete` OR `customer:delete` |

Same pattern for: `deals/deal`, `leads/lead`, `activities/activity`, etc.

---

**Summary:** Yes! With the permissions now added, `admin@crm.com` will see almost all menu items (except Team). Logout and login to test!
