# 🔐 Permission Management Guide

## Overview
The CRM now includes a comprehensive permission management system that allows you to control exactly what each role can do in the system.

## How to Assign Permissions to Roles

### Step 1: Navigate to Roles & Permissions
1. Click **Settings** in the sidebar (⚙️)
2. Click **Roles & Permissions** tab
3. Click **Create Role** or **Edit** an existing role

### Step 2: Select Permissions
When creating or editing a role, you'll see a **Permissions** section with:

```
┌─────────────────────────────────────────┐
│  Permissions                            │
├─────────────────────────────────────────┤
│  Customer                               │
│    ☐ create                             │
│    ☐ read                               │
│    ☐ update                             │
│    ☐ delete                             │
│                                         │
│  Deal                                   │
│    ☐ create                             │
│    ☐ read                               │
│    ☐ update                             │
│    ☐ delete                             │
│                                         │
│  Lead                                   │
│    ☐ create                             │
│    ☐ read                               │
│    ☐ update                             │
│    ☐ delete                             │
└─────────────────────────────────────────┘
```

### Step 3: Check/Uncheck Permissions
- ✅ Check the permissions you want this role to have
- ⬜ Leave unchecked the permissions you don't want to grant
- Permissions are grouped by **Resource** (Customer, Deal, Lead, etc.)
- Each resource has **Actions** (create, read, update, delete)

### Step 4: Save the Role
- Click **Create Role** or **Update Role**
- The role is saved with the selected permissions
- You'll see a permission count badge on the role card

## Understanding Permissions

### Permission Structure
Each permission has two parts:
1. **Resource**: What the permission applies to (e.g., Customer, Deal, Lead)
2. **Action**: What can be done (e.g., create, read, update, delete)

### Common Permission Patterns

#### 🔓 Full Access
Check all permissions for all resources
- **Use case**: Admin, Manager roles

#### 📖 Read-Only Access
Check only "read" permissions
- **Use case**: Viewer, Analyst roles

#### ✏️ Edit Access
Check "read" and "update" permissions
- **Use case**: Support Agent, Editor roles

#### ➕ Create & Read Access
Check "create" and "read" permissions
- **Use case**: Sales Representative (can create but not delete)

## Example Role Configurations

### Sales Manager (Full Sales Access)
```yaml
Customer:
  ✅ create
  ✅ read
  ✅ update
  ✅ delete
  
Deal:
  ✅ create
  ✅ read
  ✅ update
  ✅ delete
  
Lead:
  ✅ create
  ✅ read
  ✅ update
  ✅ delete
```

### Sales Representative (Limited)
```yaml
Customer:
  ✅ create
  ✅ read
  ✅ update
  ⬜ delete  # Cannot delete customers
  
Deal:
  ✅ create
  ✅ read
  ✅ update
  ⬜ delete  # Cannot delete deals
  
Lead:
  ✅ create
  ✅ read
  ✅ update
  ⬜ delete  # Cannot delete leads
```

### Support Agent (Read & Update Only)
```yaml
Customer:
  ⬜ create  # Cannot create customers
  ✅ read
  ✅ update
  ⬜ delete  # Cannot delete customers
  
Deal:
  ⬜ create
  ✅ read    # Can view deals
  ⬜ update
  ⬜ delete
  
Lead:
  ⬜ create
  ✅ read    # Can view leads
  ⬜ update
  ⬜ delete
```

### Analyst (Read-Only)
```yaml
Customer:
  ⬜ create
  ✅ read    # View only
  ⬜ update
  ⬜ delete
  
Deal:
  ⬜ create
  ✅ read    # View only
  ⬜ update
  ⬜ delete
  
Lead:
  ⬜ create
  ✅ read    # View only
  ⬜ update
  ⬜ delete
```

## Features

### ✅ Current Features
- ✅ Assign multiple permissions to each role
- ✅ Permissions grouped by resource
- ✅ Visual checkboxes for easy selection
- ✅ Permission count displayed on role cards
- ✅ Edit permissions anytime
- ✅ Scrollable permission list
- ✅ Permission descriptions (when available)

### 🎯 Permission Display
Each role card now shows:
```
🛡️ Sales Manager                    [Edit][Delete]
   Manages sales team...
   Created Nov 7, 2025
   [12 Permissions] ← Shows how many permissions assigned
```

### 🔄 Permission Updates
- Edit a role to see its current permissions (pre-checked)
- Add/remove permissions as needed
- Changes apply immediately after saving

## How Permissions Work

### Backend Integration
1. **Permission Model**: Stores resource + action combinations
2. **Role-Permission Link**: Links roles to their permissions
3. **User-Role Link**: Links users (employees) to their roles
4. **Permission Check**: Backend validates permissions on API calls

### Frontend Flow
```
1. Create/Edit Role
   └─ Select Permissions
      └─ Save Role
         └─ Update Role-Permission Links
            └─ Permissions Active

2. Assign Role to Employee
   └─ Employee inherits all role permissions
      └─ Backend enforces permissions on API calls
```

## Best Practices

### 🎯 Permission Strategy

1. **Principle of Least Privilege**
   - Grant only the permissions needed
   - Start restrictive, add permissions as needed

2. **Role-Based Thinking**
   - Design roles around job functions
   - Group similar permissions together

3. **Regular Reviews**
   - Periodically review role permissions
   - Remove unused permissions
   - Update as job requirements change

### 📋 Permission Checklist

When creating a role, ask:
- ✅ What resources does this role need to access?
- ✅ What actions can they perform on each resource?
- ✅ Should they be able to delete items?
- ✅ Is read-only sufficient for some resources?
- ✅ Does this role need to create new items?

### ⚠️ Common Mistakes to Avoid

1. **Over-Permissioning**
   - Don't give delete permissions unless necessary
   - Not everyone needs full CRUD access

2. **Under-Permissioning**
   - Ensure users can do their job
   - Include "read" permission if they need to update

3. **Forgetting Dependencies**
   - To update, users usually need "read" too
   - To delete, users should be able to see what they're deleting

## Troubleshooting

### ❓ Permissions not saving?
- Check browser console for errors
- Verify backend is running
- Try refreshing the page

### ❓ Can't see certain permissions?
- Permissions are created in the backend
- Contact admin to add new permission types

### ❓ Permission count not showing?
- Wait a moment for the count to load
- Refresh the page if count doesn't appear

### ❓ Employee can't access something?
- Check their assigned role
- Verify role has the required permission
- Ensure role is active

## API Endpoints Used

```
GET  /api/rbac/permissions/              # Get all permissions
GET  /api/rbac/roles/{id}/permissions/   # Get role permissions
POST /api/rbac/roles/{id}/update_permissions/  # Update permissions
```

## Security Notes

### 🔒 Permission Enforcement
- Permissions are enforced at the **backend level**
- Frontend only controls visibility (UI)
- Backend validates every API request
- Users cannot bypass permissions via API

### 🛡️ System Permissions
- Some permissions are marked as "system permissions"
- System permissions cannot be deleted
- They're created by the system automatically

## Future Enhancements

### 🚀 Coming Soon
- Permission inheritance between roles
- Custom permission creation from UI
- Permission templates for common roles
- Permission audit logs
- Bulk permission assignment
- Permission testing mode

## Quick Reference

### Permission Actions
- **create**: Add new records
- **read**: View/list records
- **update**: Edit existing records
- **delete**: Remove records

### Permission Resources
- **customer**: Customer management
- **deal**: Deal/opportunity management
- **lead**: Lead management
- **employee**: Team member management
- **report**: Analytics and reports

## Need Help?

If you need assistance:
1. Check this guide first
2. Review the examples above
3. Test with a non-critical role first
4. Contact support if issues persist

Happy permission management! 🎯
