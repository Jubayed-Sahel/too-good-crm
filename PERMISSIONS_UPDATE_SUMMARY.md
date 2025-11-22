# ✅ Permissions System Updated

## What Was Done

### 1. Updated Permission Structure

**Old structure** (43 permissions):
- customer, deal, lead, activity, employee, order, payment, vendor, issue, analytics, settings, role

**New structure** (19 permissions):
- **sales** - View, create, edit, delete sales (deals, leads, customers)
- **activities** - View, create, edit, delete activities
- **issue** - View, create, edit, delete issues
- **analytics** - View, export analytics and reports
- **team** - View, invite, edit, remove team members, manage roles

### 2. Updated Organizations

```
✓ ahmed ltd: 43 → 19 permissions
✓ dummy ltd: 43 → 19 permissions
```

### 3. Backend Changes

**File: `crmApp/serializers/organization.py`**
- Updated `_create_default_permissions()` to create new simplified permissions
- All new organizations will automatically get these 5 resource categories

**File: `crmApp/management/commands/update_permissions.py`**
- Created management command to update existing organizations
- Removes old permissions and creates new ones

## Current Permission Structure

### Sales (4 actions)
```
✓ view - View sales (deals, leads, customers)
✓ create - Create sales records
✓ edit - Edit sales records
✓ delete - Delete sales records
```

### Activities (4 actions)
```
✓ view - View activities
✓ create - Create activities
✓ edit - Edit activities
✓ delete - Delete activities
```

### Issue (4 actions)
```
✓ view - View issues
✓ create - Create issues
✓ edit - Edit issues
✓ delete - Delete issues
```

### Analytics (2 actions)
```
✓ view - View analytics and reports
✓ export - Export analytics data
```

### Team (5 actions)
```
✓ view - View team members
✓ invite - Invite team members
✓ edit - Edit team members
✓ remove - Remove team members
✓ manage_roles - Manage roles and permissions
```

## Role Assignment Backend

### ✅ Working Endpoints

**1. Update Role Permissions**
```
POST /api/roles/{role_id}/update_permissions/
Body: { "permission_ids": [1, 2, 3, ...] }
```

**2. Get Role Permissions**
```
GET /api/roles/{role_id}/permissions/
```

**3. Assign Role to User**
```
POST /api/user-roles/bulk_assign/
Body: { "role_id": 1, "user_ids": [1, 2, 3] }
```

**4. Get User Roles**
```
GET /api/user-roles/by_user/?user_id=1
```

### How It Works

1. **Create a Role**
   - Go to Team page → Roles tab
   - Click "Create Role"
   - Enter name and description

2. **Assign Permissions**
   - Click "Manage Permissions" on a role
   - Select from 5 resource categories (sales, activities, issue, analytics, team)
   - Each category has multiple actions (view, create, edit, delete, etc.)
   - Click "Save Permissions"

3. **Assign Role to Users**
   - Go to Team page → Members tab
   - Click on a team member
   - Assign role from dropdown

## Frontend Display

The frontend will now show these 5 categories in the "Manage Permissions" dialog:

```
📊 Sales
  ☐ view - View sales (deals, leads, customers)
  ☐ create - Create sales records
  ☐ edit - Edit sales records
  ☐ delete - Delete sales records

📅 Activities
  ☐ view - View activities
  ☐ create - Create activities
  ☐ edit - Edit activities
  ☐ delete - Delete activities

🐛 Issue
  ☐ view - View issues
  ☐ create - Create issues
  ☐ edit - Edit issues
  ☐ delete - Delete issues

📈 Analytics
  ☐ view - View analytics and reports
  ☐ export - Export analytics data

👥 Team
  ☐ view - View team members
  ☐ invite - Invite team members
  ☐ edit - Edit team members
  ☐ remove - Remove team members
  ☐ manage_roles - Manage roles and permissions
```

## Testing

### 1. Create a Test Role

```bash
# Login to the app
# Go to Team page → Roles tab
# Click "Create Role"
# Name: "Sales Manager"
# Description: "Manages sales and activities"
# Click "Create"
```

### 2. Assign Permissions

```bash
# Click "Manage Permissions" on "Sales Manager" role
# Select:
#   - Sales: view, create, edit
#   - Activities: view, create, edit
#   - Analytics: view
# Click "Save Permissions"
```

### 3. Assign to User

```bash
# Go to Team page → Members tab
# Click on a team member
# Select "Sales Manager" from role dropdown
# User now has those permissions
```

## Verification

Run this to verify permissions:

```bash
cd too-good-crm/shared-backend
python manage.py shell -c "from crmApp.models import Permission, Organization; org = Organization.objects.first(); perms = Permission.objects.filter(organization=org); print(f'Organization: {org.name}'); print(f'\nPermissions by resource:'); from collections import defaultdict; grouped = defaultdict(list); [grouped[p.resource].append(p.action) for p in perms]; [print(f'  {resource}: {', '.join(actions)}') for resource, actions in sorted(grouped.items())]"
```

Expected output:
```
Organization: ahmed ltd

Permissions by resource:
  activities: view, create, edit, delete
  analytics: view, export
  issue: view, create, edit, delete
  sales: view, create, edit, delete
  team: view, invite, edit, remove, manage_roles
```

## Summary

✅ **Permissions updated** - Only 5 resource categories now
✅ **Backend working** - Role assignment endpoints tested
✅ **Frontend ready** - Will display new permissions automatically
✅ **All organizations updated** - ahmed ltd and dummy ltd both have new structure
✅ **Future-proof** - New organizations will get these permissions automatically

**The team page role management is now ready to use with the simplified permission structure!** 🎉

