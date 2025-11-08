# Issues Management Page - Implementation Complete

## Overview
A comprehensive Issues Management page has been created for the web frontend, accessible to both **Vendors** and **Employees** with proper permission controls. The page includes full CRUD operations, status management, Linear integration display, and dedicated "Raise Issue" and "Resolve Issue" workflows.

## 🎯 Features Implemented

### 1. **Issues Page** (`/issues`)
- **Location**: `src/pages/IssuesPage.tsx`
- **Access**: Vendors (full access) and Employees (based on permissions)
- **Features**:
  - Real-time issue statistics dashboard
  - Advanced filtering (status, priority, category, search)
  - Create Issue (standard workflow)
  - Raise Issue (critical issues with auto-Linear sync)
  - Resolve Issue (with resolution notes)
  - Update status inline
  - Delete issues
  - View Linear sync status
  - Direct links to Linear issues

### 2. **Components Created**

#### `IssueStatsGrid.tsx`
- Displays 5 key metrics:
  - Total Issues
  - Open Issues (orange)
  - In Progress (blue)
  - Resolved (green)
  - Closed (purple)
- Color-coded cards with hover effects
- Responsive grid layout

#### `IssueFiltersPanel.tsx`
- **Search**: Full-text search across issues
- **Status Filter**: All / Open / In Progress / Resolved / Closed
- **Priority Filter**: All / Low / Medium / High / Critical
- **Category Filter**: All / Quality / Delivery / Payment / Communication / Other
- **Clear Filters** button (appears when filters active)

#### `IssuesDataTable.tsx`
- Displays all issues in a sortable table
- **Columns**:
  - Issue # (with issue_number)
  - Title
  - Status (badge)
  - Priority (badge)
  - Category
  - Vendor name
  - Created date
  - Linear sync status (with link if synced)
  - Actions (View, Edit, Resolve, Delete)
- **Linear Integration**:
  - Shows "View" button with external link icon if synced
  - Opens Linear issue in new tab
  - Shows "Not synced" for unsynced issues

#### `CreateIssueModal.tsx`
- Standard issue creation
- **Fields**:
  - Title (required)
  - Description
  - Priority (Low/Medium/High/Critical)
  - Category (Quality/Delivery/Payment/Communication/Other)
  - Status (auto-set to "open")

#### `RaiseIssueModal.tsx`
- **Special workflow for critical issues**
- Includes all Create Issue fields PLUS:
  - **Auto-sync to Linear** checkbox (checked by default)
  - Linear team ID (pre-configured)
  - Default priority set to "High"
- Creates issue and immediately syncs to Linear if enabled
- Shows success toast with Linear sync confirmation

#### `ResolveIssueModal.tsx`
- Displays issue details (number, status, title, description)
- **Resolution Notes** field (multi-line)
- Auto-syncs resolution to Linear if issue is synced
- Shows info banner when Linear sync will occur
- Updates issue status to "resolved"

### 3. **API Integration**

#### Updated `issue.service.ts`
```typescript
// New methods added:
raise: async (data: any) => Promise<any>  // POST /api/issues/raise/
resolve: async (id: number, resolutionNotes?: string) => Promise<Issue>  // POST /api/issues/resolve/{id}/
```

#### Updated `useIssues.ts` Hook
```typescript
// New mutations:
raiseIssue: useMutation  // Raise issue with Linear sync
resolveIssue: useMutation  // Resolve issue with notes
```

### 4. **Routing & Navigation**

#### Sidebar (`Sidebar.tsx`)
- Added **"Issues"** menu item for vendor menu
- Icon: `FiAlertCircle`
- Path: `/issues`
- Resource: `issues` (for permission checking)
- Position: After Activities, before Analytics

#### App Routes (`App.tsx`)
```typescript
<Route
  path="/issues"
  element={
    <ProtectedRoute allowedProfiles={['vendor', 'employee']}>
      <IssuesPage />
    </ProtectedRoute>
  }
/>
```

## 🔐 Access Control

### Vendors
- ✅ Full access to all issues
- ✅ Can raise, create, resolve, and delete issues
- ✅ Can view all statistics
- ✅ Can sync to Linear

### Employees
- ✅ Access based on organization permissions
- ✅ Permissions checked via `canAccess('issues')` from PermissionContext
- ✅ Can perform actions based on granted permissions
- ⚠️ May have restricted access based on role configuration

## 🔗 Linear Integration

### Display Features
1. **Linear Sync Status Column**: Shows whether issue is synced
2. **External Link Button**: Direct link to Linear issue (opens in new tab)
3. **Linear Badge**: "Linear Integration Enabled" badge on page
4. **Auto-Sync Options**:
   - Create Issue: Manual sync (not automatic)
   - Raise Issue: Auto-sync checkbox (default: ON)
   - Resolve Issue: Auto-updates Linear if already synced

### Backend Endpoints Used
- `POST /api/issues/raise/` - Raise issue with Linear sync
- `POST /api/issues/resolve/{id}/` - Resolve with resolution notes
- `GET /api/issues/` - List all issues
- `GET /api/issues/stats/` - Get statistics
- `DELETE /api/issues/{id}/` - Delete issue
- `PATCH /api/issues/{id}/` - Update issue status

## 📊 Issue Lifecycle

### 1. **Create/Raise Issue**
```
Open → In Progress → Resolved → Closed
```

### 2. **Workflows**

#### Standard Creation
1. Click "Create Issue" button
2. Fill form (title, description, priority, category)
3. Issue created with status "open"
4. Manual Linear sync if needed

#### Raise Issue (Critical)
1. Click "Raise Issue" button (red button)
2. Fill form with auto-sync enabled
3. Issue created AND synced to Linear automatically
4. Linear issue ID and URL saved
5. Toast shows success + Linear confirmation

#### Resolve Issue
1. Click resolve button (checkmark icon)
2. Enter resolution notes
3. Issue status changed to "resolved"
4. Resolution notes added to description
5. Linear issue updated (if synced)

## 🎨 UI/UX Features

### Color Coding
- **Status**:
  - Open: Orange
  - In Progress: Blue
  - Resolved: Green
  - Closed: Gray
- **Priority**:
  - Critical: Red
  - High: Orange
  - Medium: Yellow
  - Low: Green

### Responsive Design
- Stats grid: 1-5 columns (mobile to desktop)
- Filters: Stack vertically on mobile
- Table: Horizontal scroll on small screens
- Modals: Full-screen on mobile, centered on desktop

### User Feedback
- Loading states on all mutations
- Success/error toasts for all actions
- Confirmation dialog for deletions
- Disabled states while processing
- Real-time data refresh after mutations

## 🚀 Usage Examples

### For Vendors
```typescript
// Access the page
Navigate to: /issues

// Raise urgent issue with Linear sync
1. Click "Raise Issue"
2. Title: "Production server down"
3. Priority: Critical
4. Auto-sync to Linear: ✓ (checked)
5. Click "Raise Issue"
→ Issue created in CRM + Linear TOO-X created

// Resolve issue
1. Find issue in table
2. Click resolve icon
3. Add notes: "Server restarted, monitoring"
4. Click "Resolve Issue"
→ Status changed to resolved + Linear updated
```

### For Employees
```typescript
// Same workflow IF permissions granted
// Check permissions via:
// Settings → Roles & Permissions → [Employee Role] → Issues permission

// If no permission:
→ "Issues" menu item won't appear in sidebar
→ Direct URL access will be blocked
```

## 📝 Type Definitions

### Issue Type (Extended)
```typescript
interface Issue {
  id: number;
  issue_number: string;  // ISS-2025-XXXX
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: 'quality' | 'delivery' | 'payment' | 'communication' | 'other';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  vendor: number;
  vendor_name?: string;
  order?: number | null;
  order_number?: string;
  organization: number;
  assigned_to?: number | null;
  created_by: number;
  resolved_by?: number | null;
  created_at: string;
  updated_at: string;
  
  // Linear Integration (if synced)
  linear_issue_id?: string;
  linear_issue_url?: string;
  linear_team_id?: string;
  synced_to_linear?: boolean;
  last_synced_at?: string;
}
```

## ✅ Testing Checklist

### Functional Tests
- [ ] Create standard issue
- [ ] Raise urgent issue with Linear sync
- [ ] Resolve issue with notes
- [ ] Update issue status inline
- [ ] Delete issue
- [ ] Filter by status
- [ ] Filter by priority
- [ ] Filter by category
- [ ] Search issues
- [ ] Clear all filters
- [ ] View Linear issue (external link)
- [ ] Refresh data manually

### Permission Tests
- [ ] Vendor can access /issues
- [ ] Employee with permissions can access
- [ ] Employee without permissions blocked
- [ ] Linear sync works for authorized users

### UI/UX Tests
- [ ] Responsive on mobile
- [ ] Responsive on tablet
- [ ] Responsive on desktop
- [ ] Loading states work
- [ ] Toasts appear correctly
- [ ] Modals open/close smoothly
- [ ] Table scrolls horizontally on small screens

## 🔧 Configuration

### Linear Team ID
Currently hardcoded in `RaiseIssueModal.tsx`:
```typescript
linear_team_id: 'b95250db-8430-4dbc-88f8-9fc109369df0'
```

### To Change:
1. Get your Linear team ID from backend logs
2. Update `RaiseIssueModal.tsx` line 29
3. Or make it dynamic via organization settings

## 📚 Related Files

### Pages
- `src/pages/IssuesPage.tsx` - Main issues management page
- `src/pages/ClientIssuesPage.tsx` - Client portal version (existing)

### Components
- `src/components/issues/IssueStatsGrid.tsx`
- `src/components/issues/IssueFiltersPanel.tsx`
- `src/components/issues/IssuesDataTable.tsx`
- `src/components/issues/CreateIssueModal.tsx`
- `src/components/issues/RaiseIssueModal.tsx`
- `src/components/issues/ResolveIssueModal.tsx`
- `src/components/issues/index.ts`

### Services & Hooks
- `src/services/issue.service.ts` - API service
- `src/hooks/useIssues.ts` - React Query hooks

### Routing
- `src/App.tsx` - Route definition
- `src/components/dashboard/Sidebar.tsx` - Navigation menu

## 🎉 Summary

A fully functional Issues Management system has been implemented with:
- ✅ Complete CRUD operations
- ✅ Linear integration with sync status display
- ✅ Dedicated workflows for raising and resolving issues
- ✅ Advanced filtering and search
- ✅ Real-time statistics
- ✅ Permission-based access control
- ✅ Responsive design
- ✅ Comprehensive error handling and user feedback

Both **Vendors** and **Employees** (with appropriate permissions) can now manage issues effectively through the web interface with full visibility into Linear synchronization status!
