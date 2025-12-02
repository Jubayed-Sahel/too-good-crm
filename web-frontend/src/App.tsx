import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AccountModeProvider } from './contexts/AccountModeContext'
import { PermissionProvider } from './contexts/PermissionContext'
import { ProfileProvider } from './contexts/ProfileContext'
import { ProtectedRoute } from './components/auth'
import { PermissionRoute } from './components/guards/PermissionRoute'
import VideoCallManager from './components/video/VideoCallManager'
import { useAuth } from './hooks'
import { Toaster } from './components/ui/toaster'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import DashboardPage from './pages/DashboardPage'
// Feature-based imports
import { CustomersPage } from './features/customers'
import { CustomerDetailPage } from './features/customers'
import { EditCustomerPage } from './features/customers'
import { SalesPage } from './features/deals'
import { DealDetailPage } from './features/deals'
import { EditDealPage } from './features/deals'
import { LeadDetailPage } from './features/leads'
import { EditLeadPage } from './features/leads'
import { ActivitiesPage } from './features/activities'
import { ActivityDetailPage } from './features/activities'
import { EditActivityPage } from './features/activities'
import { IssuesPage } from './features/issues'
import { IssueDetailPage } from './features/issues'
// Vendor/Employee pages (still in pages/ - may be organized later)
import EmployeesPage from './pages/vendor/EmployeesPage'
import TeamPage from './pages/vendor/TeamPage'
import EmployeeDetailPage from './pages/vendor/EmployeeDetailPage'
import EditEmployeePage from './pages/vendor/EditEmployeePage'
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
import { MessagesPage } from './features/messages/pages'
import { ClientMessagesPage } from './features/messages/pages'
import NotFoundPage from './pages/NotFoundPage'
import './App.css'

function App() {
  return (
    <Router>
      <AccountModeProvider>
        <ProfileProvider>
          <PermissionProvider>
            <VideoCallManager />
            
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
                <PermissionRoute resource="customer" action="read" redirectTo="/dashboard">
                  <CustomersPage />
                </PermissionRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/customers/:id"
            element={
              <ProtectedRoute allowedProfiles={['vendor', 'employee']}>
                <PermissionRoute resource="customer" action="read" redirectTo="/dashboard">
                  <CustomerDetailPage />
                </PermissionRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/customers/:id/edit"
            element={
              <ProtectedRoute allowedProfiles={['vendor', 'employee']}>
                <PermissionRoute resource="customer" action="update" redirectTo="/dashboard">
                  <EditCustomerPage />
                </PermissionRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/sales"
            element={
              <ProtectedRoute allowedProfiles={['vendor', 'employee']}>
                <PermissionRoute resource="order" action="read" redirectTo="/dashboard">
                  <SalesPage />
                </PermissionRoute>
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
                <PermissionRoute resource="activity" action="read" redirectTo="/dashboard">
                  <ActivitiesPage />
                </PermissionRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/activities/:id"
            element={
              <ProtectedRoute allowedProfiles={['vendor', 'employee']}>
                <PermissionRoute resource="activity" action="read" redirectTo="/dashboard">
                  <ActivityDetailPage />
                </PermissionRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/activities/:id/edit"
            element={
              <ProtectedRoute allowedProfiles={['vendor', 'employee']}>
                <PermissionRoute resource="activity" action="update" redirectTo="/dashboard">
                  <EditActivityPage />
                </PermissionRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/issues"
            element={
              <ProtectedRoute allowedProfiles={['vendor', 'employee']}>
                <PermissionRoute resource="issue" action="read" redirectTo="/dashboard">
                  <IssuesPage />
                </PermissionRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/issues/:id"
            element={
              <ProtectedRoute allowedProfiles={['vendor', 'employee']}>
                <PermissionRoute resource="issue" action="read" redirectTo="/dashboard">
                  <IssueDetailPage />
                </PermissionRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/issues/:id/edit"
            element={
              <ProtectedRoute allowedProfiles={['vendor', 'employee']}>
                <PermissionRoute resource="issue" action="update" redirectTo="/dashboard">
                  <IssueDetailPage />
                </PermissionRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/employees"
            element={
              <ProtectedRoute allowedProfiles={['vendor']}>
                <PermissionRoute resource="employee" action="read" redirectTo="/dashboard">
                  <EmployeesPage />
                </PermissionRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/team"
            element={
              <ProtectedRoute allowedProfiles={['vendor']}>
                <PermissionRoute resource="employee" action="read" redirectTo="/dashboard">
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
            path="/client/messages"
            element={
              <ProtectedRoute allowedProfiles={['customer']}>
                <ClientMessagesPage />
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
          
          {/* 404 - Catch all unmatched routes */}
          <Route path="*" element={<NotFoundPage />} />
          </Routes>
          </PermissionProvider>
        </ProfileProvider>
      </AccountModeProvider>
    </Router>
  )
}

export default App



