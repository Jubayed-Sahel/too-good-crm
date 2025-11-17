/**
 * Route Protection Examples
 * 
 * This file demonstrates how to use PermissionRoute for protecting routes
 * based on user permissions.
 * 
 * Copy these examples into your App.tsx or router configuration.
 */

import { Route } from 'react-router-dom';
import { PermissionRoute } from '@/components/guards/PermissionRoute';
import { CRM_RESOURCES } from '@/utils/permissions';

// Import your page components
// import { LeadsPage } from '@/pages/employee/LeadsPage';
// import { DealsPage } from '@/pages/employee/DealsPage';
// import { CustomersPage } from '@/pages/employee/CustomersPage';
// import { ActivitiesPage } from '@/pages/employee/ActivitiesPage';
// import { TasksPage } from '@/pages/employee/TasksPage';
// import { PipelinesPage } from '@/pages/employee/PipelinesPage';
// import { AnalyticsPage } from '@/pages/employee/AnalyticsPage';
// import { SalesPage } from '@/pages/employee/SalesPage';

/**
 * Example 1: Basic Route Protection
 * Protect a route with a single permission check
 */
export const BasicRouteExample = () => (
  <Route
    path="/employee/leads"
    element={
      <PermissionRoute resource={CRM_RESOURCES.LEADS} action="read">
        {/* <LeadsPage /> */}
      </PermissionRoute>
    }
  />
);

/**
 * Example 2: Route with Create Permission
 * Only allow access if user can create leads
 */
export const CreateRouteExample = () => (
  <Route
    path="/employee/leads/create"
    element={
      <PermissionRoute resource={CRM_RESOURCES.LEADS} action="create">
        {/* <CreateLeadPage /> */}
      </PermissionRoute>
    }
  />
);

/**
 * Example 3: Multiple Permission Checks (ANY)
 * Allow access if user has permission for ANY of the resources
 */
export const MultiplePermissionsAnyExample = () => (
  <Route
    path="/employee/sales"
    element={
      <PermissionRoute
        resources={[
          { resource: CRM_RESOURCES.LEADS, action: 'read' },
          { resource: CRM_RESOURCES.DEALS, action: 'read' },
        ]}
      >
        {/* <SalesPage /> */}
      </PermissionRoute>
    }
  />
);

/**
 * Example 4: Multiple Permission Checks (ALL)
 * Require ALL permissions to access the route
 */
export const MultiplePermissionsAllExample = () => (
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
        {/* <DealManagementPage /> */}
      </PermissionRoute>
    }
  />
);

/**
 * Example 5: Route with Custom Fallback
 * Show custom message when user lacks permission
 */
export const CustomFallbackExample = () => (
  <Route
    path="/employee/analytics"
    element={
      <PermissionRoute
        resource={CRM_RESOURCES.ANALYTICS}
        action="read"
        fallback={
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <h2>Analytics Access Required</h2>
            <p>Please contact your administrator to request analytics access.</p>
          </div>
        }
      >
        {/* <AnalyticsPage /> */}
      </PermissionRoute>
    }
  />
);

/**
 * Example 6: Complete Employee Routes Configuration
 * All employee routes with proper permission checks
 */
export const EmployeeRoutesExample = () => (
  <>
    {/* Leads Routes */}
    <Route
      path="/employee/leads"
      element={
        <PermissionRoute resource={CRM_RESOURCES.LEADS} action="read">
          {/* <LeadsPage /> */}
        </PermissionRoute>
      }
    />
    <Route
      path="/employee/leads/create"
      element={
        <PermissionRoute resource={CRM_RESOURCES.LEADS} action="create">
          {/* <CreateLeadPage /> */}
        </PermissionRoute>
      }
    />
    <Route
      path="/employee/leads/:id"
      element={
        <PermissionRoute resource={CRM_RESOURCES.LEADS} action="read">
          {/* <LeadDetailPage /> */}
        </PermissionRoute>
      }
    />
    <Route
      path="/employee/leads/:id/edit"
      element={
        <PermissionRoute resource={CRM_RESOURCES.LEADS} action="update">
          {/* <EditLeadPage /> */}
        </PermissionRoute>
      }
    />

    {/* Deals Routes */}
    <Route
      path="/employee/deals"
      element={
        <PermissionRoute resource={CRM_RESOURCES.DEALS} action="read">
          {/* <DealsPage /> */}
        </PermissionRoute>
      }
    />
    <Route
      path="/employee/deals/create"
      element={
        <PermissionRoute resource={CRM_RESOURCES.DEALS} action="create">
          {/* <CreateDealPage /> */}
        </PermissionRoute>
      }
    />
    <Route
      path="/employee/deals/:id"
      element={
        <PermissionRoute resource={CRM_RESOURCES.DEALS} action="read">
          {/* <DealDetailPage /> */}
        </PermissionRoute>
      }
    />
    <Route
      path="/employee/deals/:id/edit"
      element={
        <PermissionRoute resource={CRM_RESOURCES.DEALS} action="update">
          {/* <EditDealPage /> */}
        </PermissionRoute>
      }
    />

    {/* Customers Routes */}
    <Route
      path="/employee/customers"
      element={
        <PermissionRoute resource={CRM_RESOURCES.CUSTOMERS} action="read">
          {/* <CustomersPage /> */}
        </PermissionRoute>
      }
    />
    <Route
      path="/employee/customers/create"
      element={
        <PermissionRoute resource={CRM_RESOURCES.CUSTOMERS} action="create">
          {/* <CreateCustomerPage /> */}
        </PermissionRoute>
      }
    />
    <Route
      path="/employee/customers/:id"
      element={
        <PermissionRoute resource={CRM_RESOURCES.CUSTOMERS} action="read">
          {/* <CustomerDetailPage /> */}
        </PermissionRoute>
      }
    />
    <Route
      path="/employee/customers/:id/edit"
      element={
        <PermissionRoute resource={CRM_RESOURCES.CUSTOMERS} action="update">
          {/* <EditCustomerPage /> */}
        </PermissionRoute>
      }
    />

    {/* Activities Routes */}
    <Route
      path="/employee/activities"
      element={
        <PermissionRoute resource={CRM_RESOURCES.ACTIVITIES} action="read">
          {/* <ActivitiesPage /> */}
        </PermissionRoute>
      }
    />
    <Route
      path="/employee/activities/create"
      element={
        <PermissionRoute resource={CRM_RESOURCES.ACTIVITIES} action="create">
          {/* <CreateActivityPage /> */}
        </PermissionRoute>
      }
    />

    {/* Tasks Routes */}
    <Route
      path="/employee/tasks"
      element={
        <PermissionRoute resource={CRM_RESOURCES.TASKS} action="read">
          {/* <TasksPage /> */}
        </PermissionRoute>
      }
    />
    <Route
      path="/employee/tasks/create"
      element={
        <PermissionRoute resource={CRM_RESOURCES.TASKS} action="create">
          {/* <CreateTaskPage /> */}
        </PermissionRoute>
      }
    />

    {/* Pipelines Routes */}
    <Route
      path="/employee/pipelines"
      element={
        <PermissionRoute resource={CRM_RESOURCES.PIPELINES} action="read">
          {/* <PipelinesPage /> */}
        </PermissionRoute>
      }
    />
    <Route
      path="/employee/pipelines/:id"
      element={
        <PermissionRoute resource={CRM_RESOURCES.PIPELINES} action="read">
          {/* <PipelineDetailPage /> */}
        </PermissionRoute>
      }
    />

    {/* Analytics Routes */}
    <Route
      path="/employee/analytics"
      element={
        <PermissionRoute resource={CRM_RESOURCES.ANALYTICS} action="read">
          {/* <AnalyticsPage /> */}
        </PermissionRoute>
      }
    />

    {/* Sales Dashboard - Requires access to either leads or deals */}
    <Route
      path="/employee/sales"
      element={
        <PermissionRoute
          resources={[
            { resource: CRM_RESOURCES.LEADS, action: 'read' },
            { resource: CRM_RESOURCES.DEALS, action: 'read' },
          ]}
        >
          {/* <SalesPage /> */}
        </PermissionRoute>
      }
    />
  </>
);

