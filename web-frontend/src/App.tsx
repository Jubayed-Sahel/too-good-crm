import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AccountModeProvider } from './contexts/AccountModeContext'
import { PermissionProvider } from './contexts/PermissionContext'
import { ProfileProvider } from './contexts/ProfileContext'
import { ProtectedRoute } from './components/auth'
// import { JitsiCallManager } from './components/jitsi/JitsiCallManager'
import { useAuth } from './hooks'

// Shared Pages
import { LoginPage, SignupPage } from './pages/shared'

// Vendor Pages
import {
  DashboardPage,
  CustomersPage,
  CustomerDetailPage,
  EditCustomerPage,
  SalesPage,
  DealsPage,
  DealDetailPage,
  EditDealPage,
  LeadsPage,
  LeadDetailPage,
  EditLeadPage,
  ActivitiesPage,
  ActivityDetailPage,
  AnalyticsPage,
  EmployeesPage,
  EmployeeDetailPage,
  EditEmployeePage,
  IssuesPage,
  SettingsPage,
  PermissionDebugPage,
} from './pages/vendor'

// Employee Pages
import {
  EmployeeDashboardPage,
  EmployeeTasksPage,
  EmployeeSettingsPage,
  EmployeeCustomersPage,
  EmployeeCustomerDetailPage,
  EmployeeEditCustomerPage,
  EmployeeLeadsPage,
  EmployeeLeadDetailPage,
  EmployeeEditLeadPage,
  EmployeeDealsPage,
  EmployeeDealDetailPage,
  EmployeeEditDealPage,
  EmployeeSalesPage,
  EmployeeEmployeesPage,
  EmployeeEmployeeDetailPage,
  EmployeeEditEmployeePage,
  EmployeeActivitiesPage,
  EmployeeActivityDetailPage,
  EmployeeIssuesPage,
  EmployeeAnalyticsPage,
  EmployeePermissionDebugPage,
} from './pages/employee'

// Customer Pages
import {
  ClientDashboardPage,
  ClientVendorsPage,
  ClientOrdersPage,
  ClientOrderDetailPage,
  ClientPaymentsPage,
  ClientSettingsPage,
  ClientIssuesPage,
  ClientIssueDetailPage,
} from './pages/customer'

import './App.css'

/**
 * Component to manage Jitsi calls for authenticated users
 * COMMENTED OUT - Jitsi implementation disabled
 */
// function JitsiCallWrapper() {
//   const { user, isAuthenticated } = useAuth();
//   
//   if (!isAuthenticated || !user) {
//     return null;
//   }
//   
//   return <JitsiCallManager userId={user.id} />;
// }

function App() {
  return (
    <Router>
      <AccountModeProvider>
        <ProfileProvider>
          <PermissionProvider>
            {/* Global Jitsi Call Manager for all authenticated users */}
            {/* <JitsiCallWrapper /> */}
            
            <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          
          {/* CRM Routes - Accessible by Vendor and Employee profiles */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedProfiles={['vendor', 'employee']}>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customers"
            element={
              <ProtectedRoute allowedProfiles={['vendor', 'employee']}>
                <CustomersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customers/:id"
            element={
              <ProtectedRoute allowedProfiles={['vendor', 'employee']}>
                <CustomerDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customers/:id/edit"
            element={
              <ProtectedRoute allowedProfiles={['vendor', 'employee']}>
                <EditCustomerPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sales"
            element={
              <ProtectedRoute allowedProfiles={['vendor', 'employee']}>
                <SalesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/deals"
            element={
              <ProtectedRoute allowedProfiles={['vendor', 'employee']}>
                <DealsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/deals/:id"
            element={
              <ProtectedRoute allowedProfiles={['vendor', 'employee']}>
                <DealDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/deals/:id/edit"
            element={
              <ProtectedRoute allowedProfiles={['vendor', 'employee']}>
                <EditDealPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/leads"
            element={
              <ProtectedRoute allowedProfiles={['vendor', 'employee']}>
                <LeadsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/leads/:id"
            element={
              <ProtectedRoute allowedProfiles={['vendor', 'employee']}>
                <LeadDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/leads/:id/edit"
            element={
              <ProtectedRoute allowedProfiles={['vendor', 'employee']}>
                <EditLeadPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/activities"
            element={
              <ProtectedRoute allowedProfiles={['vendor', 'employee']}>
                <ActivitiesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/activities/:id"
            element={
              <ProtectedRoute allowedProfiles={['vendor', 'employee']}>
                <ActivityDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/issues"
            element={
              <ProtectedRoute allowedProfiles={['vendor', 'employee']}>
                <IssuesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute allowedProfiles={['vendor', 'employee']}>
                <AnalyticsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employees"
            element={
              <ProtectedRoute allowedProfiles={['vendor', 'employee']}>
                <EmployeesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employees/:id"
            element={
              <ProtectedRoute allowedProfiles={['vendor', 'employee']}>
                <EmployeeDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employees/:id/edit"
            element={
              <ProtectedRoute allowedProfiles={['vendor', 'employee']}>
                <EditEmployeePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute allowedProfiles={['vendor', 'employee']}>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/debug/permissions"
            element={
              <ProtectedRoute allowedProfiles={['vendor', 'employee']}>
                <PermissionDebugPage />
              </ProtectedRoute>
            }
          />

          {/* Employee Routes - Only for Employee profile */}
          <Route
            path="/employee/dashboard"
            element={
              <ProtectedRoute allowedProfiles={['employee']}>
                <EmployeeDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee/tasks"
            element={
              <ProtectedRoute allowedProfiles={['employee']}>
                <EmployeeTasksPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee/activities"
            element={
              <ProtectedRoute allowedProfiles={['employee']}>
                <EmployeeActivitiesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee/activities/:id"
            element={
              <ProtectedRoute allowedProfiles={['employee']}>
                <EmployeeActivityDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee/customers"
            element={
              <ProtectedRoute allowedProfiles={['employee']}>
                <EmployeeCustomersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee/customers/:id"
            element={
              <ProtectedRoute allowedProfiles={['employee']}>
                <EmployeeCustomerDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee/customers/:id/edit"
            element={
              <ProtectedRoute allowedProfiles={['employee']}>
                <EmployeeEditCustomerPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee/leads"
            element={
              <ProtectedRoute allowedProfiles={['employee']}>
                <EmployeeLeadsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee/leads/:id"
            element={
              <ProtectedRoute allowedProfiles={['employee']}>
                <EmployeeLeadDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee/leads/:id/edit"
            element={
              <ProtectedRoute allowedProfiles={['employee']}>
                <EmployeeEditLeadPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee/deals"
            element={
              <ProtectedRoute allowedProfiles={['employee']}>
                <EmployeeDealsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee/deals/:id"
            element={
              <ProtectedRoute allowedProfiles={['employee']}>
                <EmployeeDealDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee/deals/:id/edit"
            element={
              <ProtectedRoute allowedProfiles={['employee']}>
                <EmployeeEditDealPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee/sales"
            element={
              <ProtectedRoute allowedProfiles={['employee']}>
                <EmployeeSalesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee/employees"
            element={
              <ProtectedRoute allowedProfiles={['employee']}>
                <EmployeeEmployeesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee/employees/:id"
            element={
              <ProtectedRoute allowedProfiles={['employee']}>
                <EmployeeEmployeeDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee/employees/:id/edit"
            element={
              <ProtectedRoute allowedProfiles={['employee']}>
                <EmployeeEditEmployeePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee/issues"
            element={
              <ProtectedRoute allowedProfiles={['employee']}>
                <EmployeeIssuesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee/analytics"
            element={
              <ProtectedRoute allowedProfiles={['employee']}>
                <EmployeeAnalyticsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee/settings"
            element={
              <ProtectedRoute allowedProfiles={['employee']}>
                <EmployeeSettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee/debug/permissions"
            element={
              <ProtectedRoute allowedProfiles={['employee']}>
                <EmployeePermissionDebugPage />
              </ProtectedRoute>
            }
          />

          {/* Client/Customer Routes - Only for Customer profile */}
          <Route
            path="/client/dashboard"
            element={
              <ProtectedRoute allowedProfiles={['customer']}>
                <ClientDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/client/vendors"
            element={
              <ProtectedRoute allowedProfiles={['customer']}>
                <ClientVendorsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/client/orders"
            element={
              <ProtectedRoute allowedProfiles={['customer']}>
                <ClientOrdersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/client/orders/:id"
            element={
              <ProtectedRoute allowedProfiles={['customer']}>
                <ClientOrderDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/client/payments"
            element={
              <ProtectedRoute allowedProfiles={['customer']}>
                <ClientPaymentsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/client/activities"
            element={
              <ProtectedRoute allowedProfiles={['customer']}>
                <ActivitiesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/client/issues"
            element={
              <ProtectedRoute allowedProfiles={['customer']}>
                <ClientIssuesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/client/issues/:id"
            element={
              <ProtectedRoute allowedProfiles={['customer']}>
                <ClientIssueDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/client/settings"
            element={
              <ProtectedRoute allowedProfiles={['customer']}>
                <ClientSettingsPage />
              </ProtectedRoute>
            }
          />
          </Routes>
          </PermissionProvider>
        </ProfileProvider>
      </AccountModeProvider>
    </Router>
  )
}

export default App



