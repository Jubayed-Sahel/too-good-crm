# Permissions Guide

## Overview

This guide explains how to use the permission system in the CRM application. The system is built on role-based access control (RBAC) where employees have permissions based on their assigned roles.

## Table of Contents

1. [Permission Utilities](#permission-utilities)
2. [Using hasPermission() Helper](#using-haspermission-helper)
3. [Conditional Rendering Examples](#conditional-rendering-examples)
4. [Route Protection Examples](#route-protection-examples)
5. [Best Practices](#best-practices)
6. [CRM Resources](#crm-resources)

## Permission Utilities

### Import the utilities

```typescript
import { hasPermission, CRM_RESOURCES, PERMISSION_ACTIONS } from '@/utils/permissions';
import { usePermissions } from '@/contexts/PermissionContext';
```

### Available Resources

```typescript
CRM_RESOURCES = {
  LEADS: 'leads',
  DEALS: 'deals',
  CUSTOMERS: 'customers',
  CONTACTS: 'contacts',
  COMPANIES: 'companies',
  ACTIVITIES: 'activities',
  TASKS: 'tasks',
  NOTES: 'notes',
  PIPELINES: 'pipelines',
  STAGES: 'stages',
  ANALYTICS: 'analytics',
  EMPLOYEES: 'employees',
  VENDORS: 'vendors',
  ISSUES: 'issues',
  ORDERS: 'orders',
  PAYMENTS: 'payments',
}
```

### Available Actions

```typescript
PERMISSION_ACTIONS = {
  READ: 'read',
  VIEW: 'view',
  CREATE: 'create',
  UPDATE: 'update',
  EDIT: 'edit',
  DELETE: 'delete',
  EXPORT: 'export',
  IMPORT: 'import',
  MANAGE: 'manage',
}
```

## Using hasPermission() Helper

### Basic Usage

```typescript
import { usePermissions } from '@/contexts/PermissionContext';
import { CRM_RESOURCES } from '@/utils/permissions';

function MyComponent() {
  const { hasPermission } = usePermissions();
  
  // Check single permission
  const canReadLeads = hasPermission(CRM_RESOURCES.LEADS, 'read');
  
  if (canReadLeads.hasPermission) {
    return <LeadsList />;
  }
  
  return <AccessDenied />;
}
```

### Check Multiple Permissions

```typescript
function MyComponent() {
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
  
  return (
    <>
      {canAccessSales.hasPermission && <SalesDashboard />}
      {canManageDeals.hasPermission && <DealManagement />}
    </>
  );
}
```

### Get All Permissions for a Resource

```typescript
function MyComponent() {
  const { getResourcePermissions } = usePermissions();
  
  // Get all permissions for deals resource
  const dealPermissions = getResourcePermissions(CRM_RESOURCES.DEALS);
  // Returns: ['deals:read', 'deals:create', 'deals:update']
  
  return (
    <div>
      <p>You have {dealPermissions.length} permissions for deals</p>
    </div>
  );
}
```

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

### Example 2: Using Can Component

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

### Example 3: Conditional Widget Rendering

```typescript
import { SimpleGrid } from '@chakra-ui/react';
import { usePermissions } from '@/contexts/PermissionContext';
import { CRM_RESOURCES } from '@/utils/permissions';
import { LeadsWidget, DealsWidget, CustomersWidget } from '@/components/dashboard';

function Dashboard() {
  const { hasPermission } = usePermissions();
  
  const widgets = [];
  
  if (hasPermission(CRM_RESOURCES.LEADS, 'read').hasPermission) {
    widgets.push(<LeadsWidget key="leads" />);
  }
  
  if (hasPermission(CRM_RESOURCES.DEALS, 'read').hasPermission) {
    widgets.push(<DealsWidget key="deals" />);
  }
  
  if (hasPermission(CRM_RESOURCES.CUSTOMERS, 'read').hasPermission) {
    widgets.push(<CustomersWidget key="customers" />);
  }
  
  if (widgets.length === 0) {
    return (
      <Box p={6} textAlign="center">
        <Text>No widgets available based on your permissions.</Text>
      </Box>
    );
  }
  
  return <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={5}>{widgets}</SimpleGrid>;
}
```

### Example 4: Permission-Aware Table Actions

```typescript
import { IconButton, Menu, MenuButton, MenuList, MenuItem } from '@chakra-ui/react';
import { FiMoreVertical, FiEdit, FiTrash2, FiEye } from 'react-icons/fi';
import { usePermissions } from '@/contexts/PermissionContext';
import { CRM_RESOURCES } from '@/utils/permissions';

function CustomerTableRow({ customer }) {
  const { hasPermission } = usePermissions();
  
  const canView = hasPermission(CRM_RESOURCES.CUSTOMERS, 'read');
  const canEdit = hasPermission(CRM_RESOURCES.CUSTOMERS, 'update');
  const canDelete = hasPermission(CRM_RESOURCES.CUSTOMERS, 'delete');
  
  return (
    <tr>
      <td>{customer.name}</td>
      <td>
        <Menu>
          <MenuButton as={IconButton} icon={<FiMoreVertical />} variant="ghost" />
          <MenuList>
            {canView.hasPermission && (
              <MenuItem icon={<FiEye />} onClick={() => handleView(customer)}>
                View
              </MenuItem>
            )}
            {canEdit.hasPermission && (
              <MenuItem icon={<FiEdit />} onClick={() => handleEdit(customer)}>
                Edit
              </MenuItem>
            )}
            {canDelete.hasPermission && (
              <MenuItem icon={<FiTrash2 />} onClick={() => handleDelete(customer)}>
                Delete
              </MenuItem>
            )}
          </MenuList>
        </Menu>
      </td>
    </tr>
  );
}
```

## Route Protection Examples

### Example 1: Basic Route Protection

```typescript
import { Route } from 'react-router-dom';
import { PermissionRoute } from '@/components/guards/PermissionRoute';
import { CRM_RESOURCES } from '@/utils/permissions';
import { DealsPage } from '@/pages/employee/DealsPage';

<Route
  path="/employee/deals"
  element={
    <PermissionRoute resource={CRM_RESOURCES.DEALS} action="read">
      <DealsPage />
    </PermissionRoute>
  }
/>
```

### Example 2: Route with Multiple Permission Checks

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

### Example 3: Route Requiring All Permissions

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

### Example 4: Route with Custom Fallback

```typescript
<Route
  path="/employee/analytics"
  element={
    <PermissionRoute
      resource={CRM_RESOURCES.ANALYTICS}
      action="read"
      fallback={
        <Box p={6} textAlign="center">
          <Heading>Analytics Access Required</Heading>
          <Text>Please contact your administrator to request analytics access.</Text>
        </Box>
      }
    >
      <AnalyticsPage />
    </PermissionRoute>
  }
/>
```

## Best Practices

### 1. Always Check Permissions Before Rendering

✅ **Good:**
```typescript
const { hasPermission } = usePermissions();
const canCreate = hasPermission(CRM_RESOURCES.CUSTOMERS, 'create');

if (!canCreate.hasPermission) {
  return null; // Don't render the component
}

return <CreateCustomerButton />;
```

❌ **Bad:**
```typescript
// Don't rely on CSS to hide elements
<Button style={{ display: hasPermission ? 'block' : 'none' }}>
  Create
</Button>
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

### 5. Secure API Calls

```typescript
// Always validate permissions on the backend
// Frontend checks are for UX only, not security

async function createCustomer(data) {
  // Frontend check (UX)
  const { hasPermission } = usePermissions();
  if (!hasPermission(CRM_RESOURCES.CUSTOMERS, 'create').hasPermission) {
    throw new Error('Permission denied');
  }
  
  // Backend will also validate (Security)
  return await customerService.create(data);
}
```

### 6. Store Permissions Securely

- ✅ Permissions are fetched from backend on login
- ✅ Permissions are stored in React Context (in-memory)
- ✅ Permissions are NOT stored in localStorage
- ✅ Permissions are refreshed when organization changes
- ✅ Permissions are validated on every API call (backend)

### 7. Handle Loading States

```typescript
function MyComponent() {
  const { hasPermission, isLoading } = usePermissions();
  
  if (isLoading) {
    return <Spinner />;
  }
  
  const canRead = hasPermission(CRM_RESOURCES.DEALS, 'read');
  
  if (!canRead.hasPermission) {
    return <AccessDenied />;
  }
  
  return <DealsList />;
}
```

## CRM Resources

### Resource Naming Convention

- Use plural form: `leads`, `deals`, `customers`
- Backend accepts both plural and singular
- Frontend utilities handle normalization automatically

### Permission Format

Permissions are stored as strings: `"resource:action"`

Examples:
- `"leads:read"`
- `"deals:create"`
- `"customers:update"`
- `"customers:delete"`
- `"*:*"` (wildcard - all permissions)

### Action Aliases

The system automatically handles action aliases:
- `read` ↔ `view`
- `update` ↔ `edit`

So `"customers:read"` and `"customers:view"` are treated the same.

## Troubleshooting

### Permissions Not Working

1. Check browser console for permission fetch errors
2. Verify employee has a role assigned
3. Verify role has permissions assigned
4. Check network tab for API responses
5. Verify organization context is correct

### Debug Permission Checks

```typescript
const { hasPermission, permissions } = usePermissions();

console.log('All permissions:', permissions);
console.log('Can read deals:', hasPermission('deals', 'read'));
console.log('Can create deals:', hasPermission('deals', 'create'));
```

## Additional Resources

- See `src/components/dashboard/DashboardWidgets.tsx` for widget examples
- See `src/components/guards/PermissionRoute.tsx` for route protection
- See `src/utils/permissions.ts` for utility functions
- See `src/contexts/PermissionContext.tsx` for context implementation

