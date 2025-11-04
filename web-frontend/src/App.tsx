import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AccountModeProvider } from './contexts/AccountModeContext'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import DashboardPage from './pages/DashboardPage'
import CustomersPage from './pages/CustomersPage'
import CustomerDetailPage from './pages/CustomerDetailPage'
import SalesPage from './pages/SalesPage'
import DealsPage from './pages/DealsPage'
import DealDetailPage from './pages/DealDetailPage'
import EditDealPage from './pages/EditDealPage'
import { LeadsPage } from './pages/LeadsPage'
import EditLeadPage from './pages/EditLeadPage'
import LeadDetailPage from './pages/LeadDetailPage'
import EditCustomerPage from './pages/EditCustomerPage'
import ActivitiesPage from './pages/ActivitiesPage'
import ActivityDetailPage from './pages/ActivityDetailPage'
import AnalyticsPage from './pages/AnalyticsPage'
import SettingsPage from './pages/SettingsPage'
import ClientDashboardPage from './pages/ClientDashboardPage'
import ClientVendorsPage from './pages/ClientVendorsPage'
import ClientOrdersPage from './pages/ClientOrdersPage'
import ClientOrderDetailPage from './pages/ClientOrderDetailPage'
import ClientPaymentsPage from './pages/ClientPaymentsPage'
import ClientSettingsPage from './pages/ClientSettingsPage'
import ClientIssuesPage from './pages/ClientIssuesPage'
import './App.css'

function App() {
  return (
    <AccountModeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/customers" element={<CustomersPage />} />
          <Route path="/customers/:id" element={<CustomerDetailPage />} />
          <Route path="/customers/:id/edit" element={<EditCustomerPage />} />
          <Route path="/sales" element={<SalesPage />} />
          <Route path="/deals" element={<DealsPage />} />
          <Route path="/deals/:id" element={<DealDetailPage />} />
          <Route path="/deals/:id/edit" element={<EditDealPage />} />
          <Route path="/leads" element={<LeadsPage />} />
          <Route path="/leads/:id" element={<LeadDetailPage />} />
          <Route path="/leads/:id/edit" element={<EditLeadPage />} />
          <Route path="/activities" element={<ActivitiesPage />} />
          <Route path="/activities/:id" element={<ActivityDetailPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/settings" element={<SettingsPage />} />

          {/* Client Routes */}
          <Route path="/client/dashboard" element={<ClientDashboardPage />} />
          <Route path="/client/vendors" element={<ClientVendorsPage />} />
          <Route path="/client/orders" element={<ClientOrdersPage />} />
          <Route path="/client/orders/:id" element={<ClientOrderDetailPage />} />
          <Route path="/client/payments" element={<ClientPaymentsPage />} />
          <Route path="/client/activities" element={<ActivitiesPage />} />
          <Route path="/client/issues" element={<ClientIssuesPage />} />
          <Route path="/client/settings" element={<ClientSettingsPage />} />
        </Routes>
      </Router>
    </AccountModeProvider>
  )
}

export default App


