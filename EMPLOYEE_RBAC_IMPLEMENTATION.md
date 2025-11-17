# Employee RBAC Implementation Summary

## Requirements Implemented

### 1. ✅ Page Restrictions Based on Employee Role
- All employee-accessible routes are now protected with `PermissionRoute` component
- Routes check for specific resource and action permissions before allowing access
- Employees without required permissions are redirected to dashboard with access denied message

### 2. ✅ Database Structure for Employee-Organization-Permissions
The following tables handle employee permissions:

**Employee Table** (`employees`)
- `organization` (FK) - Links employee to organization/vendor
- `user` (FK, nullable) - Links to User account
- `user_profile` (FK, nullable) - Links to UserProfile (only created when assigned)
- `role` (FK, nullable) - Links to Role which contains permissions
- **Constraint**: `unique_active_employee_per_user` - Prevents user from being active employee of multiple organizations

**UserRole Table** (`user_roles`)
- Links users to roles within an organization
- `user` + `role` + `organization` = unique combination
- Tracks which roles are assigned to which users in which organizations

**RolePermission Table** (`role_permissions`)
- Links roles to permissions
- Defines what permissions each role has

**Permission Table** (`permissions`)
- Defines available permissions (resource:action pairs)
- Scoped to organizations

### 3. ✅ One Employee Per Organization Constraint
- **Database Constraint**: `UniqueConstraint` on `user` field with condition `status='active'`
- **Model Validation**: `Employee.save()` validates no other active employee exists for the user
- **Serializer Validation**: `EmployeeCreateSerializer` and `EmployeeSerializer` validate this constraint
- **Result**: A user can only be an active employee of ONE organization at a time

### 4. ✅ Employee Profile Empty Until Vendor Assignment
- **Removed**: Auto-creation of `UserProfile` in `Employee.save()` method
- **Updated**: `EmployeeCreateSerializer.create()` no longer auto-creates UserProfile
- **Result**: UserProfile for employee is only created when vendor explicitly assigns employee through proper workflow
- **Initial State**: When user logs in, they have no employee profile until assigned by a vendor

## Implementation Details

### Backend Changes

#### 1. Employee Model (`crmApp/models/employee.py`)
```python
class Meta:
    constraints = [
        models.UniqueConstraint(
            fields=['user'],
            condition=models.Q(status='active'),
            name='unique_active_employee_per_user'
        ),
    ]
```

- Added database constraint to prevent multiple active employees per user
- Removed auto-creation of UserProfile in `save()` method
- Added validation in `save()` to check for existing active employees

#### 2. Employee Serializer (`crmApp/serializers/employee.py`)
- `EmployeeCreateSerializer.validate()`: Validates user not already active employee elsewhere
- `EmployeeCreateSerializer.create()`: Does NOT auto-create UserProfile
- `EmployeeSerializer.update()`: Validates organization change doesn't violate constraint

### Frontend Changes

#### 1. Route Protection (`App.tsx`)
All employee-accessible routes are now wrapped with `PermissionRoute`:

```tsx
<Route
  path="/customers"
  element={
    <ProtectedRoute allowedProfiles={['vendor', 'employee']}>
      <PermissionRoute resource="customers" action="read" redirectTo="/dashboard">
        <CustomersPage />
      </PermissionRoute>
    </ProtectedRoute>
  }
/>
```

**Protected Routes:**
- `/dashboard` - `dashboard:read`
- `/customers` - `customers:read`
- `/customers/:id` - `customers:read`
- `/customers/:id/edit` - `customers:update`
- `/sales` - `deals:read`
- `/deals` - `deals:read`
- `/deals/:id` - `deals:read`
- `/deals/:id/edit` - `deals:update`
- `/leads` - `leads:read`
- `/leads/:id` - `leads:read`
- `/leads/:id/edit` - `leads:update`
- `/activities` - `activities:read`
- `/activities/:id` - `activities:read`
- `/activities/:id/edit` - `activities:update`
- `/issues` - `issues:read`
- `/issues/:id` - `issues:read`
- `/issues/:id/edit` - `issues:update`
- `/analytics` - `analytics:read`
- `/employees` - `employees:read` (vendor only)
- `/team` - `employees:read` (vendor only)

## Database Migration Required

A migration needs to be created to add the `unique_active_employee_per_user` constraint:

```python
# Run: python manage.py makemigrations
# Then: python manage.py migrate
```

The migration will add:
1. Unique constraint on `user` field where `status='active'`
2. Index on `('user', 'status')` for performance

## Permission Flow

1. **Vendor assigns employee** → Creates Employee record with user
2. **Vendor assigns role** → Links Employee to Role via `employee.role`
3. **Role has permissions** → RolePermission links Role to Permissions
4. **User accesses route** → PermissionRoute checks if user has required permission
5. **Permission check** → RBACService aggregates permissions from all user roles
6. **Access granted/denied** → Based on permission check result

## Key Constraints

1. **One Active Employee Per User**: Database constraint ensures user can only be active employee of one organization
2. **No Auto-Profile Creation**: UserProfile is only created when vendor explicitly assigns employee
3. **Permission-Based Access**: All routes check permissions before allowing access
4. **Role-Based Permissions**: Permissions are assigned via roles, not directly to users

## Testing Checklist

- [ ] User cannot be active employee of multiple organizations
- [ ] Employee profile is empty until vendor assigns them
- [ ] Routes are protected and redirect if no permission
- [ ] Vendors can access all routes (bypass permission checks)
- [ ] Employees only see routes they have permissions for
- [ ] Sidebar shows only accessible menu items
- [ ] Database constraint prevents duplicate active employees

## Next Steps

1. Create and run database migration
2. Test employee assignment workflow
3. Test permission-based route access
4. Verify UserProfile creation only on explicit assignment
5. Test constraint violations are properly handled

