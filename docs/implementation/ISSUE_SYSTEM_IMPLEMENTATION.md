# Issue System Implementation

## Overview
This document describes the implementation of the issue management system where:
- **Customers** can raise issues
- **Vendors** and **Employees** can view and update issues raised by customers
- All updates sync to Linear automatically
- Customers can see updates made by vendors/employees

## Implementation Details

### 1. Backend Changes

#### Issue Creation (Raising Issues)
- **Location**: `shared-backend/crmApp/viewsets/issue.py`
- **Method**: `perform_create`
- **Behavior**:
  - Only customers can create/raise issues
  - Vendors and employees are blocked with `PermissionDenied` error
  - Customer-raised issues are automatically marked with `is_client_issue=True`
  - Issues are automatically synced to Linear if organization has `linear_team_id` configured

#### Issue Viewing
- **Location**: `shared-backend/crmApp/viewsets/issue.py`
- **Method**: `get_queryset`
- **Behavior**:
  - **Customers**: Can only see issues they raised
  - **Vendors**: Can see all customer-raised issues in their organization (`is_client_issue=True`)
  - **Employees**: Can see all customer-raised issues in their organization (`is_client_issue=True`)

#### Issue Updating
- **Location**: `shared-backend/crmApp/viewsets/issue.py`
- **Method**: `update`
- **Behavior**:
  - **Customers**: Can only update issues they raised
  - **Vendors**: Can update any issue in their organization (vendors have all permissions)
  - **Employees**: Can update issues if they have `issue:update` permission in their role
  - All status changes are automatically synced to Linear
  - Linear sync updates the issue state and description

#### Issue Resolving
- **Location**: `shared-backend/crmApp/viewsets/issue.py`
- **Method**: `resolve` action
- **Behavior**:
  - Only vendors and employees can resolve issues (requires `issue:update` permission)
  - Resolution notes are added to the issue description
  - Issue status is changed to `resolved`
  - Changes are automatically synced to Linear
  - Linear state is updated to "Done" or "Completed"

#### Issue Reopening
- **Location**: `shared-backend/crmApp/viewsets/issue.py`
- **Method**: `reopen` action
- **Behavior**:
  - Only vendors and employees can reopen issues (requires `issue:update` permission)
  - Issue status is changed back to `open`
  - Changes are automatically synced to Linear
  - Linear state is updated to "Todo" or "Backlog"

### 2. Frontend Changes

#### Issues Page
- **Location**: `web-frontend/src/pages/IssuesPage.tsx`
- **Changes**:
  - "Raise Issue" button is only shown for customers (`canRaiseIssue = activeProfileType === 'customer'`)
  - Vendors and employees see a different description: "Track and manage issues raised by customers"
  - Empty state message differs based on profile type
  - Status updates show Linear sync status in notifications

#### Issue Service
- **Location**: `web-frontend/src/services/issue.service.ts`
- **Endpoints**:
  - `POST /api/issues/` - Create issue (blocked for vendors/employees)
  - `GET /api/issues/` - List issues (filtered by profile type)
  - `PUT /api/issues/{id}/` - Update issue (permission-based)
  - `POST /api/issues/{id}/resolve/` - Resolve issue
  - `POST /api/issues/{id}/reopen/` - Reopen issue

### 3. Linear Integration

#### Auto-Sync on Create
- When a customer raises an issue, it's automatically synced to Linear if:
  - Organization has `linear_team_id` configured
  - Linear API key is set in environment variables
- Linear issue ID and URL are stored in the CRM issue

#### Auto-Sync on Update
- When a vendor/employee updates an issue status, it's automatically synced to Linear
- Status mapping:
  - `open` → Linear state: "Todo", "Backlog", "Triage"
  - `in_progress` → Linear state: "In Progress", "Started"
  - `resolved` → Linear state: "Done", "Completed"
  - `closed` → Linear state: "Canceled", "Closed"

#### Auto-Sync on Resolve
- When an issue is resolved, Linear state is updated to "Done" or "Completed"
- Resolution notes are added to Linear issue description

#### Auto-Sync on Reopen
- When an issue is reopened, Linear state is updated to "Todo" or "Backlog"

### 4. Permission System

#### Customer Permissions
- Can create issues (raise them)
- Can view only issues they raised
- Can update only issues they raised
- Can delete only issues they raised

#### Vendor Permissions
- **Cannot** create/raise issues
- Can view all customer-raised issues in their organization
- Can update any issue in their organization (all permissions)
- Can resolve any issue in their organization
- Can reopen any issue in their organization

#### Employee Permissions
- **Cannot** create/raise issues
- Can view all customer-raised issues in their organization
- Can update issues if they have `issue:update` permission in their role
- Can resolve issues if they have `issue:update` permission in their role
- Can reopen issues if they have `issue:update` permission in their role

### 5. Data Flow

1. **Customer Raises Issue**:
   - Customer fills out issue form
   - Issue is created with `is_client_issue=True`
   - Issue is synced to Linear (if configured)
   - Customer sees the issue in their issues list

2. **Vendor/Employee Views Issue**:
   - Vendor/Employee navigates to Issues page
   - They see all customer-raised issues in their organization
   - They can view issue details, status, and Linear link

3. **Vendor/Employee Updates Issue**:
   - Vendor/Employee changes issue status (e.g., to "in_progress")
   - Issue is updated in CRM
   - Issue is synced to Linear (status change)
   - Customer sees the updated status when they refresh

4. **Vendor/Employee Resolves Issue**:
   - Vendor/Employee marks issue as resolved
   - Resolution notes are added
   - Issue is synced to Linear (status = "Done")
   - Customer sees the resolved status and notes

### 6. Testing

#### Test Scenarios
1. **Customer raises issue**:
   - Login as customer
   - Navigate to Issues page
   - Click "Raise Issue" button
   - Fill out form and submit
   - Verify issue appears in list
   - Verify issue is synced to Linear (if configured)

2. **Vendor views issues**:
   - Login as vendor
   - Navigate to Issues page
   - Verify "Raise Issue" button is NOT visible
   - Verify all customer-raised issues are visible
   - Verify issue details are shown

3. **Vendor updates issue**:
   - Login as vendor
   - Navigate to Issues page
   - Update issue status (e.g., to "in_progress")
   - Verify status is updated
   - Verify Linear sync status is shown
   - Login as customer and verify they see the update

4. **Employee resolves issue**:
   - Login as employee (with `issue:update` permission)
   - Navigate to Issues page
   - Resolve an issue with resolution notes
   - Verify issue is resolved
   - Verify Linear sync status is shown
   - Login as customer and verify they see the resolution

### 7. Environment Variables

Required environment variables for Linear integration:
```env
LINEAR_API_KEY=your_linear_api_key_here
LINEAR_WEBHOOK_SECRET=your_linear_webhook_secret_here
```

### 8. API Endpoints

#### Customer Endpoints
- `POST /api/client/issues/raise/` - Raise issue as customer
- `GET /api/client/issues/{id}/` - Get customer issue details
- `POST /api/client/issues/{id}/comment/` - Add comment to issue

#### General Endpoints
- `GET /api/issues/` - List issues (filtered by profile type)
- `GET /api/issues/{id}/` - Get issue details
- `PUT /api/issues/{id}/` - Update issue (permission-based)
- `DELETE /api/issues/{id}/` - Delete issue (permission-based)
- `POST /api/issues/{id}/resolve/` - Resolve issue
- `POST /api/issues/{id}/reopen/` - Reopen issue
- `GET /api/issues/stats/` - Get issue statistics

### 9. Files Modified

#### Backend
- `shared-backend/crmApp/viewsets/issue.py` - Issue ViewSet with permission checks
- `shared-backend/crmApp/views/issue_actions.py` - RaiseIssueView (blocked for vendors/employees)
- `shared-backend/crmApp/views/client_issues.py` - ClientRaiseIssueView (customer-only)
- `shared-backend/crmApp/services/issue_linear_service.py` - Linear sync service
- `shared-backend/crmApp/models/issue.py` - Issue model with `is_client_issue` field

#### Frontend
- `web-frontend/src/pages/IssuesPage.tsx` - Issues page with conditional "Raise Issue" button
- `web-frontend/src/services/issue.service.ts` - Issue service with API endpoints
- `web-frontend/src/hooks/useIssues.ts` - Issue hooks for data fetching
- `web-frontend/src/components/issues/IssuesDataTable.tsx` - Issues table component

### 10. Future Enhancements

1. **Issue Comments**: Add separate comment model for better comment tracking
2. **Issue Notifications**: Notify customers when their issues are updated
3. **Issue Assignments**: Allow vendors/employees to assign issues to team members
4. **Issue Priorities**: Allow vendors/employees to change issue priorities
5. **Issue Categories**: Allow vendors/employees to change issue categories
6. **Linear Webhooks**: Handle Linear webhook events for bidirectional sync
7. **Issue Templates**: Pre-defined issue templates for common problems
8. **Issue Attachments**: Allow customers to attach files to issues

## Conclusion

The issue management system is now fully implemented with:
- ✅ Customer can raise issues
- ✅ Vendors and employees cannot raise issues
- ✅ Vendors and employees can view customer-raised issues
- ✅ Vendors and employees can update issue status
- ✅ All updates sync to Linear automatically
- ✅ Customers can see updates made by vendors/employees
- ✅ Proper permission checks for all operations
- ✅ Linear integration for issue tracking

