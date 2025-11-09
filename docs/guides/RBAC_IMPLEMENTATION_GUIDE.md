# Fine-Grained Role-Based Access Control (RBAC) Implementation Guide

## Overview

This system implements a comprehensive, fine-grained RBAC system that allows precise control over user permissions throughout the application.

## System Architecture

### Backend (Django)

#### Models
- **Permission**: Resource + Action combinations (e.g., `customers:create`, `deals:read`)
- **Role**: Named collection of permissions (e.g., "Sales Manager", "Support Agent")
- **UserRole**: Many-to-many assignment of roles to users
- **Employee**: Has a primary role field

#### Services
- **RBACService**: Central service for permission checking and role management
  - `check_permission(user, org, resource, action)`: Check if user has specific permission
  - `get_user_permissions(user, org)`: Get all permissions for a user
  - `get_user_roles(user, org)`: Get all roles for a user

#### Endpoints
- `/api/permissions/`: CRUD for permissions
- `/api/roles/`: CRUD for roles
- `/api/user-roles/`: Assign/remove roles from users
- `/api/user-context/permissions/?organization={id}`: Get current user's permissions

### Frontend (React + TypeScript)

#### Contexts

**PermissionContext** (`/contexts/PermissionContext.tsx`)
- Fetches and caches user permissions on login
- Provides `canAccess(resource, action)` function
- Handles permission aliases (read/view, update/edit)
- Auto-grants full access to vendors and owners

**ProfileContext** (`/contexts/ProfileContext.tsx`)
- Manages active profile and organization
- Provides organization context for permission checks

#### Components

**Can Component** (`/components/common/Can.tsx`)
```tsx
// Basic usage
<Can do="create" on="customers">
  <Button>Create Customer</Button>
</Can>

// With fallback
<Can do="read" on="analytics" fallback={<Text>No access</Text>}>
  <AnalyticsDashboard />
</Can>

// Multiple permissions (ANY)
<CanAny permissions={[
  { do: 'read', on: 'customers' },
  { do: 'read', on: 'leads' }
]}>
  <SalesReport />
</CanAny>

// Multiple permissions (ALL)
<CanAll permissions={[
  { do: 'read', on: 'customers' },
  { do: 'update', on: 'customers' }
]}>
  <CustomerEditForm />
</CanAll>
```

#### Hook Usage

**usePermissions Hook**
```tsx
import { usePermissions } from '@/contexts/PermissionContext';

function MyComponent() {
  const { canAccess, permissions, isLoading } = usePermissions();
  
  if (!canAccess('customers', 'create')) {
    return <NoAccessMessage />;
  }
  
  return <CreateCustomerButton />;
}
```

## Permission Naming Convention

Format: `resource:action`

### Standard Resources
- `customers` - Customer management
- `deals` - Deal/opportunity management
- `leads` - Lead management
- `employees` - Team member management
- `orders` - Order processing
- `payments` - Payment handling
- `issues` - Issue/ticket tracking
- `activities` - Activity logging
- `analytics` - Analytics and reporting
- `settings` - System settings

### Standard Actions
- `create` - Create new records
- `read` / `view` - View/list records
- `update` / `edit` - Modify existing records
- `delete` - Remove records

### Examples
- `customers:create` - Create new customers
- `deals:read` - View deals
- `employees:update` - Edit employee information
- `analytics:read` - View analytics dashboard
- `settings:update` - Modify system settings

## Implementation Checklist

### ✅ Completed

1. **Backend Setup**
   - ✅ RBAC models created
   - ✅ RBACService implemented
   - ✅ Permission endpoints functional
   - ✅ Role endpoints functional
   - ✅ User-context endpoint for permission fetching

2. **Frontend Setup**
   - ✅ PermissionContext with caching
   - ✅ ProfileContext for organization context
   - ✅ Can/CanAny/CanAll components
   - ✅ usePermissions hook
   - ✅ Fixed login spinner issue (proper loading state management)

3. **UI Integration**
   - ✅ CustomerFilters - Create button permission check
   - ✅ CustomerTable - Edit/Delete action buttons
   - ✅ ProtectedRoute - Combined loading states

### 🔄 Next Steps

4. **Apply to Other Pages**
   - [ ] Deals page (filters, table actions)
   - [ ] Leads page (filters, table actions)
   - [ ] Employees page (filters, table actions)
   - [ ] Issues page (create, assign, resolve)
   - [ ] Orders page (create, update status)
   - [ ] Payments page (process, refund)
   - [ ] Analytics page (view different reports)
   - [ ] Settings page (manage organization settings)

5. **Advanced Features**
   - [ ] Field-level permissions (hide sensitive fields)
   - [ ] Row-level permissions (access only assigned records)
   - [ ] Bulk action permissions
   - [ ] Export permissions
   - [ ] Import permissions

## Testing Guide

### Test User Setup

1. **Create Test Roles**
```python
# In Django shell
from crmApp.models import Role, Permission, Organization
org = Organization.objects.first()

# Sales Rep - Limited permissions
sales_rep = Role.objects.create(
    organization=org,
    name="Sales Representative",
    slug="sales-rep",
    description="Can manage customers and deals"
)

# Grant permissions
perms = Permission.objects.filter(
    organization=org,
    resource__in=['customers', 'deals', 'leads']
)
for perm in perms:
    sales_rep.role_permissions.create(permission=perm)

# Support Agent - Different permissions
support = Role.objects.create(
    organization=org,
    name="Support Agent",
    slug="support-agent",
    description="Can manage customers and issues"
)

perms = Permission.objects.filter(
    organization=org,
    resource__in=['customers', 'issues']
)
for perm in perms:
    support.role_permissions.create(permission=perm)
```

2. **Assign Roles to Users**
```python
from crmApp.models import Employee, UserRole
employee = Employee.objects.get(code='EMP001')
employee.role = sales_rep
employee.save()
```

3. **Test Scenarios**
   - Login as Sales Rep → Should see Customers, Deals, Leads
   - Login as Support → Should see Customers, Issues (no Deals)
   - Login as Vendor/Owner → Should see everything

## Troubleshooting

### Login Spinner Doesn't Stop

**Fixed!** The issue was:
- ProfileContext and PermissionContext both setting `isLoading: true` initially
- ProtectedRoute wasn't checking all loading states
- Solution: Improved loading state management and combined checks

### Permissions Not Loading

Check:
1. User has active profile: `user.profiles?.[0]`
2. Organization ID is set: `activeOrganizationId`
3. Backend endpoint works: `/api/user-context/permissions/?organization={id}`
4. Browser console for errors

### Button Still Showing When No Permission

Check:
1. Using `<Can>` component wrapper
2. Correct resource name (plural: 'customers', not 'customer')
3. Correct action name ('create', not 'add')
4. Permission exists in backend

## Performance Optimization

### Caching Strategy
- Permissions fetched once on login
- Cached in PermissionContext
- Re-fetched on role switch
- No per-component API calls

### Loading States
- Combined loading states in ProtectedRoute
- Early returns when no user data
- Prevents unnecessary re-renders

## Security Notes

1. **Client-side checks are UX only** - Always validate on backend
2. **Backend validation** - Use PermissionChecker middleware
3. **Token-based auth** - All API calls require valid token
4. **Organization isolation** - Permissions scoped to organization

## Migration Guide

### From Old Permission System

If migrating from a simple `isAdmin` check:

**Before:**
```tsx
{isAdmin && <Button>Delete</Button>}
```

**After:**
```tsx
<Can do="delete" on="customers">
  <Button>Delete</Button>
</Can>
```

### Adding New Permissions

1. Create permission in Django admin or via API
2. Assign to appropriate roles
3. Use in frontend with Can component
4. Test with different user roles

## Best Practices

1. **Always wrap action buttons with `<Can>`**
2. **Use consistent resource names** (plural form)
3. **Test with multiple user roles**
4. **Log permission checks in development**
5. **Handle loading states properly**
6. **Provide fallback UI when no permission**

## API Reference

### Frontend

```typescript
// Get permissions
const { canAccess, permissions, isLoading, isVendor, isEmployee, isOwner } = usePermissions();

// Check permission
const canCreate = canAccess('customers', 'create');

// Multiple checks
const hasAnyAccess = canAccess('deals', 'read') || canAccess('leads', 'read');
```

### Backend

```python
from crmApp.services import RBACService

# Check permission
has_perm = RBACService.check_permission(user, org, 'customers', 'create')

# Get all permissions
perms = RBACService.get_user_permissions(user, org)

# Get user roles
roles = RBACService.get_user_roles(user, org)
```

## Support

For issues or questions:
1. Check this guide
2. Review browser console for errors
3. Check Django logs for backend errors
4. Test with Vendor account (full access)
5. Verify permissions exist in database
