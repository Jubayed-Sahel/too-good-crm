# Too Good CRM - Site Map

## Application Structure

### Authentication Routes
```
/
├── /login (LoginPage)
├── /signup (SignupPage)
└── / → redirects to /login
```

---

## Vendor Mode (B2B) Routes

### Main Navigation
```
/dashboard (DashboardPage)
├── Overview & Statistics
├── Quick Actions
├── Recent Activities
└── Pipeline Summary

/customers (CustomersPage)
├── Customer List (Table/Cards)
├── Search & Filters
├── Stats Cards
└── Actions: View, Edit, Activate/Deactivate, Delete

/customers/:id (CustomerDetailPage)
├── Customer Information
├── Contact Details
├── Status & Activity
└── Actions: Edit, Delete, Back

/customers/:id/edit (EditCustomerPage)
├── Edit Customer Form
└── Actions: Save, Cancel

/leads (LeadsPage)
├── Leads List (Table/Cards)
├── Search & Filters
├── Stats Cards
└── Actions: View, Edit, Qualify, Convert, Delete

/leads/:id (LeadDetailPage)
├── Lead Information
├── Contact Details
├── Lead Source & Priority
├── Expected Value
├── Status & Timeline
└── Actions: Convert to Customer, Edit, Delete, Back

/leads/:id/edit (EditLeadPage)
├── Edit Lead Form
└── Actions: Save, Cancel

/deals (DealsPage)
├── Deals List (Table/Cards)
├── Search & Stage Filters
├── Stats Cards (Total, Active, Won, Total Value)
├── Create Deal Dialog
├── Edit Deal Dialog
└── Actions: View, Edit, Delete

/deals/:id (DealDetailPage)
├── Deal Information
├── Customer Details
├── Deal Value & Probability
├── Expected Close Date
├── Stage & Status
└── Actions: Edit, Delete, Move Stage, Back

/deals/:id/edit (EditDealPage)
├── Edit Deal Form
└── Actions: Save, Cancel

/sales (SalesPage)
├── Sales Overview
└── Sales Metrics

/activities (ActivitiesPage)
├── Activities List (Table/Cards)
├── Search & Type/Status Filters
├── Stats Cards (Total, Completed, Pending, Scheduled)
└── Actions: View, Mark Complete, Delete

/activities/:id (ActivityDetailPage)
├── Activity Information
├── Type & Status
├── Customer Details
├── Created By & Dates
├── Notes/Description
└── Actions: Edit, Delete, Mark Complete, Back

/analytics (AnalyticsPage)
├── Analytics Dashboard
└── Business Metrics

/settings (SettingsPage)
├── User Settings
├── Profile Information
└── Preferences
```

---

## Client Mode (B2C) Routes

### Main Navigation
```
/client/dashboard (ClientDashboardPage)
├── Dashboard Stats
├── Recent Vendors
└── Recent Orders

/client/vendors (ClientVendorsPage)
├── Vendors List (Table/Cards)
├── Search & Filters
└── Vendor Information

/client/orders (ClientOrdersPage)
├── Orders List (Table/Cards)
├── Search & Status Filters
├── Stats Cards (Total, Pending, Delivered, Cancelled)
└── Actions: View

/client/orders/:id (ClientOrderDetailPage)
├── Order Information
├── Order Items
├── Status & Timeline
├── Payment Details
├── Delivery Information
└── Actions: Track, Back

/client/payments (ClientPaymentsPage)
├── Payments List (Table/Cards)
├── Search & Status Filters
├── Stats Cards (Total Paid, Pending, Overdue)
└── Payment History

/client/activities (ActivitiesPage - Shared)
├── Activities List
├── Client-specific Activities
└── Actions: View, Mark Complete, Delete

/client/issues (ClientIssuesPage)
├── Issues List (Table/Cards)
├── Search & Status/Priority Filters
├── Stats Cards (Total, Open, In Progress, Resolved)
├── Create Issue Form
└── Actions: View, Complete, Delete

/client/issues/:id (ClientIssueDetailPage)
├── Issue Information
├── Issue Number & Title
├── Description
├── Vendor & Order Details
├── Priority & Status
├── Category & Timeline
├── Comments & Updates Section
├── Add Comment Form
└── Actions: Mark Complete, Delete, Back

/client/settings (ClientSettingsPage)
├── User Settings
├── Profile Information
└── Preferences
```

---

## Component Architecture

### Shared Components
```
/components
├── /common
│   ├── Card.tsx
│   ├── ResponsiveTable.tsx
│   ├── GradientBox.tsx
│   ├── IconBox.tsx
│   └── PageContainer.tsx
│
├── /ui (Chakra UI Extensions)
│   ├── checkbox.tsx
│   ├── color-mode.tsx
│   ├── field.tsx
│   ├── provider.tsx
│   ├── toaster.tsx
│   ├── tooltip.tsx
│   └── native-select.tsx
│
├── /auth
│   ├── AuthLayout.tsx
│   ├── LoginForm.tsx
│   └── SignupForm.tsx
│
├── /dashboard
│   ├── DashboardLayout.tsx
│   ├── DashboardHeader.tsx
│   ├── Sidebar.tsx
│   ├── TopBar.tsx
│   ├── WelcomeBanner.tsx
│   ├── StatCard.tsx
│   ├── StatsGrid.tsx
│   ├── InfoCard.tsx
│   └── InfoCardsGrid.tsx
│
├── /activities
│   ├── ActivitiesTable.tsx
│   ├── ActivitiesFilters.tsx
│   └── ActivitiesStats.tsx
│
├── /deals
│   ├── DealsTable.tsx
│   ├── DealsFilters.tsx
│   ├── DealsStats.tsx
│   ├── CreateDealDialog.tsx
│   └── EditDealDialog.tsx
│
├── /client-dashboard
│   ├── DashboardStats.tsx
│   ├── RecentVendors.tsx
│   └── RecentOrders.tsx
│
├── /client-orders
│   ├── OrdersTable.tsx
│   ├── OrdersFilters.tsx
│   └── OrdersStats.tsx
│
├── /client-payments
│   ├── PaymentsTable.tsx
│   ├── PaymentsFilters.tsx
│   └── PaymentsStats.tsx
│
└── /client-issues
    ├── IssuesTable.tsx
    ├── IssuesFilters.tsx
    └── IssueStats.tsx
```

---

## User Flows

### Vendor Flow - Lead to Customer Conversion
```
1. /leads → View all leads
2. /leads/:id → View lead details
3. Click "Convert to Customer" → Lead becomes customer
4. /customers/:id → View new customer
```

### Vendor Flow - Deal Management
```
1. /deals → View all deals
2. Click "Add Deal" → Open create dialog
3. Fill form → Submit → Deal created
4. /deals → Updated list with new deal
5. Click "Edit" → Open edit dialog
6. Update fields → Save → Deal updated
```

### Client Flow - Issue Reporting
```
1. /client/issues → View all issues
2. Click "Lodge Issue" → Open create form
3. Fill issue details → Submit → Issue created
4. /client/issues → Updated list with new issue
5. Click "View" → /client/issues/:id
6. View full details & comments
7. Add comment → Submit → Comment added
8. Click "Mark as Complete" → Issue resolved
```

### Client Flow - Order Tracking
```
1. /client/orders → View all orders
2. Search/Filter orders
3. Click "View" → /client/orders/:id
4. View order details, status, items
5. Track delivery timeline
6. View payment information
```

---

## Navigation Structure

### Vendor Mode Sidebar
```
├── Dashboard
├── Customers
├── Leads
├── Deals
├── Sales
├── Activities
├── Analytics
└── Settings
```

### Client Mode Sidebar
```
├── Dashboard
├── Vendors
├── Orders
├── Payments
├── Activities
├── Issues
└── Settings
```

---

## Page Patterns

### List Pages (Table/Cards)
- Stats cards at top (4 metrics)
- Search & filter section
- Responsive table (desktop) / cards (mobile)
- Action buttons per row/card
- Empty states with helpful messages
- Loading states with spinners

### Detail Pages
- Back button + action buttons at top
- Gradient header with key information
- Info cards in 2-column grid (responsive)
- Additional sections (comments, history, etc.)
- Consistent layout across all detail pages

### Forms (Dialogs/Pages)
- Clear heading
- Grouped fields with labels
- Validation feedback
- Submit + Cancel actions
- Success/error toasts on completion

---

## Data Flow

### Mock Data (Current Implementation)
- Deals: Uses `deals.service.ts` with in-memory storage
- Other entities: Prepared for API integration

### API Integration (Future)
- Backend endpoints configured in `api.config.ts`
- Hooks available: `useDeals`, `useCustomers`, `useLeads`, etc.
- Service layer: `deal.service.ts`, `customer.service.ts`, etc.

---

## Route Protection

### Public Routes
- `/login`
- `/signup`

### Protected Routes (Require Authentication)
- All `/dashboard/*` routes (Vendor Mode)
- All `/client/*` routes (Client Mode)
- Redirects to `/login` if not authenticated

---

## Mobile Responsiveness

### Breakpoint Behavior
- **Mobile (base)**: Stacked layouts, card views, full-width buttons
- **Tablet (md)**: 2-column grids, compact cards
- **Desktop (lg+)**: Multi-column layouts, table views, icon buttons

### Navigation
- **Mobile**: Hamburger menu (collapsed sidebar)
- **Desktop**: Full sidebar navigation
