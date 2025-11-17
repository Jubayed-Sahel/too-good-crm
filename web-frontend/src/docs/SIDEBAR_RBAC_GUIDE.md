# Sidebar RBAC Implementation Guide

## Overview

The sidebar now implements full RBAC (Role-Based Access Control) with the following features:

- ✅ **Permission-based menu rendering** - Only shows menu items employees have permission for
- ✅ **Nested menu support** - Parent menus show only if at least one child is allowed
- ✅ **hasPermission() helper** - Easy permission checking throughout the app
- ✅ **Route protection** - Links are protected by permissions
- ✅ **Production-ready** - Proper TypeScript types, error handling, and loading states

## hasPermission() Helper Function

### Basic Usage

```typescript
import { usePermissions } from '@/contexts/PermissionContext';
import { CRM_RESOURCES } from '@/utils/permissions';

function MyComponent() {
  const { hasPermission } = usePermissions();
  
  // Check if user can read leads
  const result = hasPermission(CRM_RESOURCES.LEADS, 'read');
  
  if (result.hasPermission) {
    console.log('User can access leads:', result.reason);
    return <LeadsPage />;
  }
  
  return <AccessDenied />;
}
```

### Check Multiple Permissions

```typescript
const { hasAnyPermission, hasAllPermissions } = usePermissions();

// Check if user has ANY of these permissions
const canAccessSales = hasAnyPermission([
  { resource: CRM_RESOURCES.LEADS, action: 'read' },
  { resource: CRM_RESOURCES.DEALS, action: 'read' },
]);

// Check if user has ALL of these permissions
const canManageDeals = hasAllPermissions([
  { resource: CRM_RESOURCES.DEALS, action: 'read' },
  { resource: CRM_RESOURCES.DEALS, action: 'create' },
  { resource: CRM_RESOURCES.DEALS, action: 'update' },
]);
```

## Sidebar Menu Structure

The sidebar automatically filters menu items based on permissions. Here's the structure:

```typescript
interface MenuItem {
  icon: React.ComponentType;
  label: string;
  path: string;
  resource?: string;        // CRM resource (e.g., 'leads', 'deals')
  action?: string;         // Permission action (default: 'read')
  children?: MenuItem[];   // Nested menu items
  alwaysShow?: boolean;    // Always show (e.g., Dashboard, Settings)
}
```

### Menu Items for Employees

1. **Dashboard** - Always shown (`alwaysShow: true`)
2. **Leads** - Requires `leads:read` permission
3. **Deals** - Requires `deals:read` permission
4. **Contacts** - Requires `contacts:read` permission
5. **Companies** - Requires `companies:read` permission
6. **Activities** - Requires `activities:read` permission
7. **Tasks** - Requires `tasks:read` permission
8. **Notes** - Requires `notes:read` permission
9. **Pipelines** (Nested)
   - All Pipelines - Requires `pipelines:read` permission
   - Stages - Requires `stages:read` permission
10. **Settings** - Always shown (`alwaysShow: true`)

### Nested Menu Logic

The sidebar implements smart nested menu logic:

- **Parent shows if at least one child is allowed**
- If user has `pipelines:read` but not `stages:read`, they see:
  - Pipelines (expandable)
    - All Pipelines ✓
    - Stages ✗ (hidden)

- If user has `stages:read` but not `pipelines:read`, they see:
  - Pipelines (expandable)
    - All Pipelines ✗ (hidden)
    - Stages ✓

- If user has neither permission, the entire "Pipelines" menu is hidden.

## Conditional Rendering Examples

### Example 1: Show/Hide Button Based on Permission

```typescript
import { Button } from '@chakra-ui/react';
import { usePermissions } from '@/contexts/PermissionContext';
import { CRM_RESOURCES } from '@/utils/permissions';

function CustomerActions() {
  const { hasPermission } = usePermissions();
  
  const canCreate = hasPermission(CRM_RESOURCES.CUSTOMERS, 'create');
  const canDelete = hasPermission(CRM_RESOURCES.CUSTOMERS, 'delete');
  
  return (
    <HStack gap={2}>
      {canCreate.hasPermission && (
        <Button colorPalette="green" onClick={handleCreate}>
          New Customer
        </Button>
      )}
      {canDelete.hasPermission && (
        <Button colorPalette="red" onClick={handleDelete}>
          Delete
        </Button>
      )}
    </HStack>
  );
}
```

### Example 2: Conditional Menu Item Rendering

```typescript
import { VStack } from '@chakra-ui/react';
import { usePermissions } from '@/contexts/PermissionContext';
import { CRM_RESOURCES } from '@/utils/permissions';

function CustomMenu() {
  const { hasPermission } = usePermissions();
  
  const menuItems = [];
  
  if (hasPermission(CRM_RESOURCES.LEADS, 'read').hasPermission) {
    menuItems.push({
      label: 'Leads',
      path: '/employee/leads',
      icon: FiUserPlus,
    });
  }
  
  if (hasPermission(CRM_RESOURCES.DEALS, 'read').hasPermission) {
    menuItems.push({
      label: 'Deals',
      path: '/employee/deals',
      icon: FiFileText,
    });
  }
  
  return (
    <VStack>
      {menuItems.map(item => (
        <NavLink key={item.path} to={item.path}>
          {item.label}
        </NavLink>
      ))}
    </VStack>
  );
}
```

### Example 3: Using Can Component

```typescript
import { Can } from '@/contexts/PermissionContext';
import { CRM_RESOURCES } from '@/utils/permissions';

function Dashboard() {
  return (
    <VStack gap={4}>
      <Can access={`${CRM_RESOURCES.LEADS}:read`}>
        <LeadsWidget />
      </Can>
      
      <Can 
        access={`${CRM_RESOURCES.DEALS}:read`}
        fallback={<Text>You don't have access to deals</Text>}
      >
        <DealsWidget />
      </Can>
    </VStack>
  );
}
```

## Route Protection Examples

### Example 1: Basic Route Protection

```typescript
import { Route } from 'react-router-dom';
import { PermissionRoute } from '@/components/guards/PermissionRoute';
import { CRM_RESOURCES } from '@/utils/permissions';

<Route
  path="/employee/leads"
  element={
    <PermissionRoute resource={CRM_RESOURCES.LEADS} action="read">
      <LeadsPage />
    </PermissionRoute>
  }
/>
```

### Example 2: Route with Create Permission

```typescript
<Route
  path="/employee/leads/create"
  element={
    <PermissionRoute resource={CRM_RESOURCES.LEADS} action="create">
      <CreateLeadPage />
    </PermissionRoute>
  }
/>
```

### Example 3: Multiple Permission Checks (ANY)

```typescript
<Route
  path="/employee/sales"
  element={
    <PermissionRoute
      resources={[
        { resource: CRM_RESOURCES.LEADS, action: 'read' },
        { resource: CRM_RESOURCES.DEALS, action: 'read' },
      ]}
    >
      <SalesPage />
    </PermissionRoute>
  }
/>
```

### Example 4: Multiple Permission Checks (ALL)

```typescript
<Route
  path="/employee/deals/manage"
  element={
    <PermissionRoute
      resources={[
        { resource: CRM_RESOURCES.DEALS, action: 'read' },
        { resource: CRM_RESOURCES.DEALS, action: 'create' },
        { resource: CRM_RESOURCES.DEALS, action: 'update' },
      ]}
      requireAll={true}
    >
      <DealManagementPage />
    </PermissionRoute>
  }
/>
```

## Complete Route Configuration Example

```typescript
import { Routes, Route } from 'react-router-dom';
import { PermissionRoute } from '@/components/guards/PermissionRoute';
import { CRM_RESOURCES } from '@/utils/permissions';

// Import your pages
import { LeadsPage } from '@/pages/employee/LeadsPage';
import { DealsPage } from '@/pages/employee/DealsPage';
import { CustomersPage } from '@/pages/employee/CustomersPage';
import { ContactsPage } from '@/pages/employee/ContactsPage';
import { CompaniesPage } from '@/pages/employee/CompaniesPage';
import { ActivitiesPage } from '@/pages/employee/ActivitiesPage';
import { TasksPage } from '@/pages/employee/TasksPage';
import { NotesPage } from '@/pages/employee/NotesPage';
import { PipelinesPage } from '@/pages/employee/PipelinesPage';
import { StagesPage } from '@/pages/employee/StagesPage';

function EmployeeRoutes() {
  return (
    <Routes>
      {/* Leads Routes */}
      <Route
        path="/employee/leads"
        element={
          <PermissionRoute resource={CRM_RESOURCES.LEADS} action="read">
            <LeadsPage />
          </PermissionRoute>
        }
      />
      <Route
        path="/employee/leads/create"
        element={
          <PermissionRoute resource={CRM_RESOURCES.LEADS} action="create">
            <CreateLeadPage />
          </PermissionRoute>
        }
      />
      <Route
        path="/employee/leads/:id"
        element={
          <PermissionRoute resource={CRM_RESOURCES.LEADS} action="read">
            <LeadDetailPage />
          </PermissionRoute>
        }
      />
      <Route
        path="/employee/leads/:id/edit"
        element={
          <PermissionRoute resource={CRM_RESOURCES.LEADS} action="update">
            <EditLeadPage />
          </PermissionRoute>
        }
      />

      {/* Deals Routes */}
      <Route
        path="/employee/deals"
        element={
          <PermissionRoute resource={CRM_RESOURCES.DEALS} action="read">
            <DealsPage />
          </PermissionRoute>
        }
      />
      <Route
        path="/employee/deals/create"
        element={
          <PermissionRoute resource={CRM_RESOURCES.DEALS} action="create">
            <CreateDealPage />
          </PermissionRoute>
        }
      />

      {/* Contacts Routes */}
      <Route
        path="/employee/contacts"
        element={
          <PermissionRoute resource={CRM_RESOURCES.CONTACTS} action="read">
            <ContactsPage />
          </PermissionRoute>
        }
      />

      {/* Companies Routes */}
      <Route
        path="/employee/companies"
        element={
          <PermissionRoute resource={CRM_RESOURCES.COMPANIES} action="read">
            <CompaniesPage />
          </PermissionRoute>
        }
      />

      {/* Activities Routes */}
      <Route
        path="/employee/activities"
        element={
          <PermissionRoute resource={CRM_RESOURCES.ACTIVITIES} action="read">
            <ActivitiesPage />
          </PermissionRoute>
        }
      />

      {/* Tasks Routes */}
      <Route
        path="/employee/tasks"
        element={
          <PermissionRoute resource={CRM_RESOURCES.TASKS} action="read">
            <TasksPage />
          </PermissionRoute>
        }
      />

      {/* Notes Routes */}
      <Route
        path="/employee/notes"
        element={
          <PermissionRoute resource={CRM_RESOURCES.NOTES} action="read">
            <NotesPage />
          </PermissionRoute>
        }
      />

      {/* Pipelines Routes */}
      <Route
        path="/employee/pipelines"
        element={
          <PermissionRoute resource={CRM_RESOURCES.PIPELINES} action="read">
            <PipelinesPage />
          </PermissionRoute>
        }
      />

      {/* Stages Routes */}
      <Route
        path="/employee/pipelines/stages"
        element={
          <PermissionRoute resource={CRM_RESOURCES.STAGES} action="read">
            <StagesPage />
          </PermissionRoute>
        }
      />
    </Routes>
  );
}
```

## Sidebar Component Usage

The sidebar is already integrated and works automatically. It:

1. **Fetches permissions** from the backend when an employee logs in
2. **Filters menu items** based on permissions
3. **Shows nested menus** only if at least one child is allowed
4. **Handles loading states** while permissions are being fetched
5. **Updates automatically** when permissions change

### How It Works

```typescript
// The sidebar automatically:
// 1. Gets permissions from PermissionContext
const { hasPermission, isEmployee, isLoading } = usePermissions();

// 2. Filters menu items
const visibleItems = allMenuItems.filter(item => {
  if (item.alwaysShow) return true;
  if (isVendor || isOwner) return true;
  return hasPermission(item.resource, item.action || 'read').hasPermission;
});

// 3. Handles nested menus
// Parent shows if at least one child is allowed
const shouldShowParent = item.children?.some(child => 
  hasPermission(child.resource, child.action || 'read').hasPermission
);
```

## Best Practices

### 1. Always Check Permissions Before Rendering

✅ **Good:**
```typescript
const { hasPermission } = usePermissions();
const canRead = hasPermission(CRM_RESOURCES.LEADS, 'read');

if (!canRead.hasPermission) {
  return null; // Don't render
}

return <LeadsList />;
```

❌ **Bad:**
```typescript
// Don't use CSS to hide elements
<div style={{ display: hasPermission ? 'block' : 'none' }}>
  <LeadsList />
</div>
```

### 2. Use Permission Checks at Multiple Levels

```typescript
// Route level
<PermissionRoute resource={CRM_RESOURCES.DEALS}>
  <DealsPage />
</PermissionRoute>

// Component level
function DealsPage() {
  const { hasPermission } = usePermissions();
  const canCreate = hasPermission(CRM_RESOURCES.DEALS, 'create');
  
  return (
    <>
      {canCreate.hasPermission && <CreateDealButton />}
      <DealsList />
    </>
  );
}

// Action level
function DealRow({ deal }) {
  const { hasPermission } = usePermissions();
  const canDelete = hasPermission(CRM_RESOURCES.DEALS, 'delete');
  
  return (
    <tr>
      <td>{deal.name}</td>
      <td>
        {canDelete.hasPermission && (
          <Button onClick={() => handleDelete(deal)}>Delete</Button>
        )}
      </td>
    </tr>
  );
}
```

### 3. Cache Permission Checks

```typescript
// Use useMemo to avoid recalculating permissions
const permissions = useMemo(() => ({
  canRead: hasPermission(CRM_RESOURCES.DEALS, 'read').hasPermission,
  canCreate: hasPermission(CRM_RESOURCES.DEALS, 'create').hasPermission,
  canUpdate: hasPermission(CRM_RESOURCES.DEALS, 'update').hasPermission,
  canDelete: hasPermission(CRM_RESOURCES.DEALS, 'delete').hasPermission,
}), [hasPermission]);
```

### 4. Provide User Feedback

```typescript
function MyComponent() {
  const { hasPermission } = usePermissions();
  const canCreate = hasPermission(CRM_RESOURCES.CUSTOMERS, 'create');
  
  if (!canCreate.hasPermission) {
    return (
      <Alert status="info">
        <AlertIcon />
        <AlertTitle>Permission Required</AlertTitle>
        <AlertDescription>
          You need "customers:create" permission to create customers.
          Contact your administrator.
        </AlertDescription>
      </Alert>
    );
  }
  
  return <CreateCustomerForm />;
}
```

## Security Notes

1. **Frontend checks are for UX only** - Always validate on backend
2. **Don't store permissions in localStorage** - Keep in memory only
3. **Refresh permissions on organization change** - Context handles this
4. **Use PermissionRoute for routes** - Don't rely on UI hiding
5. **Check permissions at multiple levels** - Route, component, and action

## Troubleshooting

### Sidebar shows all items
- Check browser console for permission fetch errors
- Verify employee has a role assigned
- Verify role has permissions assigned
- Check network tab for API responses

### Menu items not showing
- Verify the resource name matches backend permissions
- Check if `alwaysShow` is set correctly
- Verify nested menu logic (parent shows if child is allowed)

### Permissions not updating
- Permissions refresh when organization changes
- Check `PermissionContext` logs in console
- Verify backend endpoint is working: `/api/user-roles/user_permissions/`

## Additional Resources

- **Full Permissions Guide**: `src/docs/PERMISSIONS_GUIDE.md`
- **Route Examples**: `src/examples/ROUTE_EXAMPLES.tsx`
- **Permission Utilities**: `src/utils/permissions.ts`
- **Permission Context**: `src/contexts/PermissionContext.tsx`
- **Sidebar Component**: `src/components/dashboard/Sidebar.tsx`

