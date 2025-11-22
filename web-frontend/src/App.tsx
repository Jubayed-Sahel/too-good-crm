import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AccountModeProvider } from './contexts/AccountModeContext'
import { PermissionProvider } from './contexts/PermissionContext'
import { ProfileProvider } from './contexts/ProfileContext'
import { ProtectedRoute } from './components/auth'
import { PermissionRoute } from './components/guards/PermissionRoute'
import { Toaster } from './components/ui/toaster'
// import { JitsiCallManager } from './components/jitsi/JitsiCallManager'
// import { useAuth } from './hooks'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import DashboardPage from './pages/DashboardPage'
import CustomersPage from './pages/CustomersPage'
import CustomerDetailPage from './pages/CustomerDetailPage'
import SalesPage from './pages/SalesPage'
import DealDetailPage from './pages/DealDetailPage'
import EditDealPage from './pages/EditDealPage'
import EditLeadPage from './pages/EditLeadPage'
import LeadDetailPage from './pages/LeadDetailPage'
import EditCustomerPage from './pages/EditCustomerPage'
import ActivitiesPage from './pages/ActivitiesPage'
import ActivityDetailPage from './pages/ActivityDetailPage'
import EditActivityPage from './pages/EditActivityPage'
import AnalyticsPage from './pages/AnalyticsPage'
import EmployeesPage from './pages/vendor/EmployeesPage'
import TeamPage from './pages/vendor/TeamPage'
import EmployeeDetailPage from './pages/vendor/EmployeeDetailPage'
import EditEmployeePage from './pages/vendor/EditEmployeePage'
import IssuesPage from './pages/IssuesPage'
import IssueDetailPage from './pages/vendor/IssueDetailPage'
import SettingsPage from './pages/SettingsPage'
import ClientDashboardPage from './pages/ClientDashboardPage'
import ClientVendorsPage from './pages/ClientVendorsPage'
import ClientOrdersPage from './pages/ClientOrdersPage'
import ClientOrderDetailPage from './pages/ClientOrderDetailPage'
import ClientPaymentsPage from './pages/ClientPaymentsPage'
import ClientSettingsPage from './pages/ClientSettingsPage'
import ClientIssuesPage from './pages/ClientIssuesPage'
import ClientIssueDetailPage from './pages/customer/ClientIssueDetailPage'
import PermissionDebugPage from './pages/PermissionDebugPage'
import EmployeeDashboardPage from './pages/employee/EmployeeDashboardPage'
import EmployeeTasksPage from './pages/employee/EmployeeTasksPage'
import EmployeeSettingsPage from './pages/employee/EmployeeSettingsPage'
import MessagesPage from './pages/MessagesPage'
import './App.css'

/**
 * Component to manage Jitsi calls for authenticated users
 */
// function JitsiCallWrapper() {
//   const { user, isAuthenticated } = useAuth();
//   
//   if (!isAuthenticated || !user) {
//     return null;
//   }
//   
//   return <JitsiCallManager />;
// }

function App() {
  return (
    <Router>
      <AccountModeProvider>
        <ProfileProvider>
          <PermissionProvider>
            {/* Global Toaster for notifications */}
            <Toaster />
            
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
                <PermissionRoute resource="customers" action="read" redirectTo="/dashboard">
                  <CustomersPage />
                </PermissionRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/customers/:id"
            element={
              <ProtectedRoute allowedProfiles={['vendor', 'employee']}>
                <PermissionRoute resource="customers" action="read" redirectTo="/dashboard">
                  <CustomerDetailPage />
                </PermissionRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/customers/:id/edit"
            element={
              <ProtectedRoute allowedProfiles={['vendor', 'employee']}>
                <PermissionRoute resource="customers" action="update" redirectTo="/dashboard">
                  <EditCustomerPage />
                </PermissionRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/sales"
            element={
              <ProtectedRoute allowedProfiles={['vendor', 'employee']}>
                <PermissionRoute resource="deals" action="read" redirectTo="/dashboard">
                  <SalesPage />
                </PermissionRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/deals/:id"
            element={
              <ProtectedRoute allowedProfiles={['vendor', 'employee']}>
                <PermissionRoute resource="deals" action="read" redirectTo="/dashboard">
                  <DealDetailPage />
                </PermissionRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/deals/:id/edit"
            element={
              <ProtectedRoute allowedProfiles={['vendor', 'employee']}>
                <PermissionRoute resource="deals" action="update" redirectTo="/dashboard">
                  <EditDealPage />
                </PermissionRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/leads/:id"
            element={
              <ProtectedRoute allowedProfiles={['vendor', 'employee']}>
                <PermissionRoute resource="leads" action="read" redirectTo="/dashboard">
                  <LeadDetailPage />
                </PermissionRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/leads/:id/edit"
            element={
              <ProtectedRoute allowedProfiles={['vendor', 'employee']}>
                <PermissionRoute resource="leads" action="update" redirectTo="/dashboard">
                  <EditLeadPage />
                </PermissionRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/activities"
            element={
              <ProtectedRoute allowedProfiles={['vendor', 'employee']}>
                <PermissionRoute resource="activities" action="read" redirectTo="/dashboard">
                  <ActivitiesPage />
                </PermissionRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/activities/:id"
            element={
              <ProtectedRoute allowedProfiles={['vendor', 'employee']}>
                <PermissionRoute resource="activities" action="read" redirectTo="/dashboard">
                  <ActivityDetailPage />
                </PermissionRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/activities/:id/edit"
            element={
              <ProtectedRoute allowedProfiles={['vendor', 'employee']}>
                <PermissionRoute resource="activities" action="update" redirectTo="/dashboard">
                  <EditActivityPage />
                </PermissionRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/issues"
            element={
              <ProtectedRoute allowedProfiles={['vendor', 'employee']}>
                <PermissionRoute resource="issues" action="read" redirectTo="/dashboard">
                  <IssuesPage />
                </PermissionRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/issues/:id"
            element={
              <ProtectedRoute allowedProfiles={['vendor', 'employee']}>
                <PermissionRoute resource="issues" action="read" redirectTo="/dashboard">
                  <IssueDetailPage />
                </PermissionRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/issues/:id/edit"
            element={
              <ProtectedRoute allowedProfiles={['vendor', 'employee']}>
                <PermissionRoute resource="issues" action="update" redirectTo="/dashboard">
                  <IssueDetailPage />
                </PermissionRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute allowedProfiles={['vendor', 'employee']}>
                <PermissionRoute resource="analytics" action="read" redirectTo="/dashboard">
                  <AnalyticsPage />
                </PermissionRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/employees"
            element={
              <ProtectedRoute allowedProfiles={['vendor']}>
                <PermissionRoute resource="employees" action="read" redirectTo="/dashboard">
                  <EmployeesPage />
                </PermissionRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/team"
            element={
              <ProtectedRoute allowedProfiles={['vendor']}>
                <PermissionRoute resource="employees" action="read" redirectTo="/dashboard">
                  <TeamPage />
                </PermissionRoute>
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
            path="/messages"
            element={
              <ProtectedRoute allowedProfiles={['vendor', 'employee', 'customer']}>
                <MessagesPage />
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
                <ActivitiesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee/customers"
            element={
              <ProtectedRoute allowedProfiles={['employee']}>
                <CustomersPage />
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



