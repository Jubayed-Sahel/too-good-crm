# Web to Android App - Feature Analysis

## Overview
Analysis of web frontend Sales, Team, and Settings pages to apply their UI and logic to Android app.

---

## 1. SALES PAGE ANALYSIS

### Web Features (SalesPage.tsx):

#### Stats Displayed:
1. **Pipeline Value** - Total value of all deals ($)
2. **Open Deals** - Count of active deals
3. **Won Deals** - Count of closed-won deals + revenue
4. **Win Rate** - Percentage of won deals

#### Core Features:
1. **Drag & Drop Pipeline** - Kanban board with stages:
   - Lead
   - Qualified
   - Proposal
   - Negotiation
   - Closed Won/Lost

2. **Deal Management**:
   - View deal details
   - Move deals between stages
   - Filter by owner, stage
   - Search deals
   - Create new deals

3. **Lead Management**:
   - Unconverted leads in pipeline
   - Convert lead to deal (drag & drop)
   - Create new leads
   - View/Edit/Delete leads

4. **Permissions**:
   - Vendors: Full access
   - Employees: Permission-based (order resource)

### Android Current State:
- ❌ Has basic stat cards (Revenue, Deals, Avg Deal, Conversion)
- ❌ No pipeline visualization
- ❌ No drag & drop
- ❌ No lead management
- ❌ Static/mock data

### Android Needs:
1. ✅ Keep compact stat cards (already good)
2. ⚠️ Add deal list view (simpler than Kanban for mobile)
3. ⚠️ Add deal details screen
4. ⚠️ Add filters (stage, owner)
5. ⚠️ Add search
6. ⚠️ Connect to real API data

---

## 2. TEAM PAGE ANALYSIS

### Web Features (TeamPage.tsx + EmployeesPage.tsx):

#### Has 3 Tabs:
1. **Team Members** - Employee management
2. **Roles** - Role configuration
3. **Permissions** - Permission management

#### Team Members Tab Features:

**Stats Displayed**:
1. Total Employees
2. Active Employees
3. Pending Invitations
4. Departments Count

**Core Features**:
1. **Employee List**:
   - Name, email, role, department
   - Status (Active/Pending/Inactive)
   - Join date
   - Last login

2. **Actions**:
   - Invite Employee (dialog with email + role)
   - View employee details
   - Edit employee
   - Delete employee
   - Bulk delete
   - Bulk export (CSV)

3. **Filters**:
   - Search (name, email, department)
   - Status filter (All/Active/Pending/Inactive)

4. **Permissions**:
   - Vendors: Full access
   - Employees: Permission-based (employee resource)

#### Roles Tab Features:
- List all roles
- Create/Edit/Delete roles
- Assign permissions to roles

#### Permissions Tab Features:
- View all permissions by resource
- Grant/Revoke permissions

### Android Current State:
- ✅ Has team member list
- ✅ Has compact stat cards (Total, Active, Departments)
- ✅ Has search
- ✅ Has role filter
- ❌ Uses mock/sample data
- ❌ No real actions (view/edit/delete)
- ❌ No invite employee
- ❌ No tabs for roles/permissions

### Android Needs:
1. ✅ Keep current compact design
2. ⚠️ Connect to real employee API
3. ⚠️ Add employee detail screen
4. ⚠️ Add invite employee dialog
5. ⚠️ Add edit/delete actions
6. ⚠️ Optional: Add tabs for roles/permissions (or separate screens)

---

## 3. SETTINGS PAGE ANALYSIS

### Web Features (SettingsPage.tsx):

#### Has 4 Tabs:
1. **Organization** - Company settings
2. **Team** - Team settings
3. **Roles** - Role management (duplicate of Team page?)
4. **Security** - Password & security

#### Organization Settings Features:
- Company name
- Industry
- Company size
- Website
- Description
- Logo upload
- Address (street, city, state, zip, country)
- Phone number

#### Security Settings Features:
1. **Change Password**:
   - Current password
   - New password
   - Confirm password
   - Password requirements displayed
   - Validation (min 6 chars, match)

2. **Password Requirements Box**:
   - Minimum 6 characters
   - Must match confirmation
   - Tip for strong password

### Android Current State:
- ⚠️ Has SettingsScreen (need to check implementation)
- ❌ Likely minimal or mock

### Android Needs:
1. ⚠️ Profile settings (name, email, phone)
2. ⚠️ Change password
3. ⚠️ Organization settings (if vendor)
4. ⚠️ Notifications settings (optional)
5. ⚠️ About/Help section
6. ⚠️ Logout

---

## IMPLEMENTATION PRIORITY

### Phase 1: High Priority (Core Functionality)
1. **Team Page** - Connect to real API
   - Fetch employees from API
   - Add employee detail screen
   - Add invite employee feature
   - Add edit/delete actions

2. **Settings Page** - User Profile
   - Profile view/edit (name, email, phone)
   - Change password
   - Basic preferences

### Phase 2: Medium Priority (Enhanced Features)
3. **Sales Page** - Real Data
   - Connect to deals API
   - Show deal list (not Kanban, simpler)
   - Add deal detail screen
   - Add filters & search
   - Show proper stats from API

### Phase 3: Low Priority (Advanced Features)
4. **Team Page** - Roles & Permissions
   - Add roles tab/screen
   - Add permissions management

5. **Sales Page** - Lead Management
   - Add leads to sales flow
   - Lead to deal conversion

6. **Settings Page** - Organization
   - Organization settings (for vendors)
   - Advanced preferences

---

## API ENDPOINTS NEEDED

### Sales:
- `GET /api/deals/` - List deals
- `GET /api/deals/{id}/` - Deal detail
- `POST /api/deals/` - Create deal
- `PATCH /api/deals/{id}/` - Update deal
- `GET /api/deals/stats/` - Pipeline stats

### Team:
- `GET /api/employees/` - List employees
- `GET /api/employees/{id}/` - Employee detail
- `POST /api/employees/invite/` - Invite employee
- `PATCH /api/employees/{id}/` - Update employee
- `DELETE /api/employees/{id}/` - Delete employee
- `GET /api/roles/` - List roles

### Settings:
- `GET /api/users/me/` - Current user profile
- `PATCH /api/users/me/` - Update profile
- `POST /api/users/change-password/` - Change password
- `GET /api/organizations/{id}/` - Organization details
- `PATCH /api/organizations/{id}/` - Update organization

---

## NEXT STEPS

1. ✅ Analyze web pages (DONE)
2. ⏳ Implement Team screen with real API
3. ⏳ Implement Settings screen with real API
4. ⏳ Implement Sales screen with real API

---

## NOTES

- **Mobile UI Considerations**:
  - No drag & drop Kanban (complex on mobile)
  - Use simple list views instead
  - Focus on most important actions
  - Keep compact design we established

- **Permission Handling**:
  - Check user role (vendor vs employee)
  - Implement permission-based UI hiding
  - Show/hide actions based on permissions

- **Data Management**:
  - Use React Query pattern (similar to web)
  - Implement proper loading states
  - Handle errors gracefully
  - Add pull-to-refresh


