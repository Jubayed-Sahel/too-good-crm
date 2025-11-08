# Client-Raised Issues System Implementation

## Overview
Implemented a complete client-raised issues system where customers can raise issues about organizations, and vendors/employees of those organizations can view and resolve them.

## Architecture

### User Flow
```
Client (Customer) → Raises Issue → About Organization
                                          ↓
                              Vendor/Employee sees issue
                                          ↓
                              Resolves the issue
                                          ↓
                              Client sees status update
```

## Backend Changes

### 1. Database Schema (Migration 0005)
**File:** `crmApp/models/issue.py`

Added two new fields to the `Issue` model:
- `raised_by_customer`: ForeignKey to Customer (nullable)
- `is_client_issue`: BooleanField (default=False)

```python
raised_by_customer = models.ForeignKey(
    'Customer',
    on_delete=models.SET_NULL,
    null=True,
    blank=True,
    related_name='raised_issues',
    help_text='Customer who raised this issue'
)

is_client_issue = models.BooleanField(
    default=False,
    help_text='True if this issue was raised by a client/customer'
)
```

**Migration Status:** ✅ Applied successfully (0005_issue_is_client_issue_issue_raised_by_customer_and_more.py)

### 2. Serializers
**File:** `crmApp/serializers/issue.py`

#### Updated Serializers:
1. **IssueListSerializer**: Added `raised_by_customer_name`, `organization_name`, `is_client_issue`
2. **IssueSerializer**: Added same fields plus Linear sync fields
3. **IssueCreateSerializer**: Added support for `organization`, `raised_by_customer`, `is_client_issue`

**New Methods:**
- `get_raised_by_customer_name()`: Returns customer's full name

### 3. ViewSets
**File:** `crmApp/viewsets/issue.py`

#### Updated `get_queryset()`:
Role-based filtering:
- **Customers**: See only issues they raised (`raised_by_customer=customer`)
- **Vendors/Employees**: See all issues for their organization

#### Updated `stats()`:
Added `by_source` breakdown:
- `client_raised`: Count of client issues
- `internal`: Count of internal issues

### 4. New API Endpoints
**File:** `crmApp/views/client_issues.py` (NEW - 230 lines)

Created three dedicated endpoints for client operations:

#### a) **POST /api/client/issues/raise/**
- **View:** `ClientRaiseIssueView`
- **Purpose:** Clients raise issues about organizations
- **Requires:** organization, title, description, priority, category
- **Optional:** vendor, order
- **Auto-sets:** is_client_issue=True, raised_by_customer=customer

#### b) **GET /api/client/issues/{id}/**
- **View:** `ClientIssueDetailView`
- **Purpose:** Clients view their issue details
- **Validates:** Ownership (only see their own issues)

#### c) **POST /api/client/issues/{id}/comment/**
- **View:** `ClientIssueCommentView`
- **Purpose:** Clients add comments to their issues
- **Appends:** Timestamped comment to description

### 5. URL Configuration
**File:** `crmApp/urls.py`

Added routes before the router.urls:
```python
path('api/client/issues/raise/', ClientRaiseIssueView.as_view()),
path('api/client/issues/<int:issue_id>/', ClientIssueDetailView.as_view()),
path('api/client/issues/<int:issue_id>/comment/', ClientIssueCommentView.as_view()),
```

## Frontend Changes

### 1. Type Definitions
**File:** `src/types/issue.types.ts`

#### Updated `Issue` Interface:
```typescript
is_client_issue: boolean;
raised_by_customer?: number | null;
raised_by_customer_name?: string;
organization_name?: string;
linear_issue_id?: string;
linear_issue_url?: string;
synced_to_linear?: boolean;
```

#### New Interface:
```typescript
interface ClientRaiseIssueData {
  organization: number;
  title: string;
  description: string;
  priority: IssuePriority;
  category: IssueCategory;
  vendor?: number | null;
  order?: number | null;
}
```

### 2. Issue Service
**File:** `src/services/issue.service.ts`

Added three new methods:
```typescript
clientRaise: async (data: ClientRaiseIssueData): Promise<any>
clientGetIssue: async (id: number): Promise<Issue>
clientAddComment: async (id: number, comment: string): Promise<Issue>
```

### 3. New Component: ClientRaiseIssueModal
**File:** `src/components/client-issues/ClientRaiseIssueModal.tsx` (NEW - 260 lines)

#### Features:
- Organization selector (loads client's vendors)
- Dynamic vendor/order loading based on selected organization
- Form validation
- Support for all issue priorities and categories
- Optional vendor and order selection
- Uses CustomSelect component for dropdowns

#### Form Fields:
1. **Required:**
   - Organization
   - Title
   - Description
   - Priority (low, medium, high, critical)
   - Category (quality, delivery, payment, communication, other)

2. **Optional:**
   - Vendor (filtered by organization)
   - Related Order (filtered by organization)

### 4. Updated ClientIssuesPage
**File:** `src/pages/ClientIssuesPage.tsx`

#### Changes:
- Replaced `CreateIssueDialog` with `ClientRaiseIssueModal`
- Added `clientRaise` mutation
- Updated button text to "Raise Issue"
- Shows empty state with instructions to raise issues
- Removed complete/resolve action (clients can't resolve their own issues)

#### New Behavior:
- Clients click "Raise Issue"
- Select organization and fill form
- Issue is submitted to organization
- Vendors/employees of that organization can view and resolve

### 5. Updated IssuesDataTable
**File:** `src/components/issues/IssuesDataTable.tsx`

#### New "Source" Column:
Shows issue origin:
- **Client Badge** (purple): Client-raised issues
  - Displays customer name below badge
- **Internal Badge** (gray, subtle): Internal issues

#### Column Order:
Issue # → Title → **Source** → Status → Priority → Category → Vendor → Created → Linear → Actions

## Key Features

### 1. Role-Based Access Control
- **Clients:** Only see issues they raised
- **Vendors/Employees:** See all issues for their organization (both client and internal)

### 2. Issue Source Tracking
- `is_client_issue` flag distinguishes client vs internal issues
- Stats API includes breakdown by source
- UI shows visual badges for issue source

### 3. Organization-Based Workflow
- Clients raise issues about specific organizations
- Issues are routed to the correct organization
- Vendors/employees of that organization handle resolution

### 4. Linear Integration Preserved
- Client-raised issues can still be synced to Linear
- Linear sync status displayed in data table
- External link to Linear issue when synced

## Testing Workflow

### Client Perspective:
1. Login as customer
2. Navigate to `/client/issues`
3. Click "Raise Issue"
4. Select organization
5. Fill in issue details
6. Submit
7. View issue in table
8. Add comments if needed

### Vendor/Employee Perspective:
1. Login as vendor/employee
2. Navigate to `/issues`
3. See all issues (client + internal)
4. Filter by source (Client/Internal badge)
5. View client-raised issues
6. See customer name who raised it
7. Resolve/update status
8. Delete if necessary

## API Endpoints Summary

### Client Endpoints:
- `POST /api/client/issues/raise/` - Raise new issue
- `GET /api/client/issues/{id}/` - View issue details
- `POST /api/client/issues/{id}/comment/` - Add comment

### General Endpoints (with updated filtering):
- `GET /api/issues/` - List issues (filtered by user role)
- `GET /api/issues/{id}/` - Get issue details
- `GET /api/issues/stats/` - Get statistics (includes by_source)
- `POST /api/issues/` - Create internal issue
- `PUT /api/issues/{id}/` - Update issue
- `DELETE /api/issues/{id}/` - Delete issue
- `POST /api/issues/{id}/resolve/` - Resolve issue
- `POST /api/issues/raise/` - Raise issue to Linear

## Database Migration

**Migration File:** `0005_issue_is_client_issue_issue_raised_by_customer_and_more.py`

**Status:** ✅ Applied

**Changes:**
- Added `is_client_issue` field (BooleanField)
- Added `raised_by_customer` field (ForeignKey to Customer)
- Altered `status` field definition

## Statistics Enhancement

The `stats()` API now returns:
```json
{
  "total": 10,
  "by_status": {
    "open": 3,
    "in_progress": 4,
    "resolved": 3
  },
  "by_priority": {
    "low": 2,
    "medium": 4,
    "high": 3,
    "critical": 1
  },
  "by_source": {
    "client_raised": 6,
    "internal": 4
  }
}
```

## Security Considerations

### 1. Ownership Validation
- Clients can only view/comment on issues they raised
- Checked in `ClientIssueDetailView` and `ClientIssueCommentView`

### 2. Organization Scoping
- Vendors/employees see only their organization's issues
- Enforced in `IssueViewSet.get_queryset()`

### 3. Profile Type Verification
- All client endpoints verify user has Customer profile
- Returns 403 if user is not a customer

## Future Enhancements

### Potential Additions:
1. **Email Notifications:**
   - Notify organization when client raises issue
   - Notify client when issue status changes

2. **Issue Attachments:**
   - Allow clients to upload screenshots/files
   - Store in media directory or cloud storage

3. **Real-time Updates:**
   - WebSocket support for live status updates
   - Push notifications to clients

4. **Advanced Filtering:**
   - Filter by date range
   - Filter by customer name
   - Filter by organization

5. **Issue Templates:**
   - Pre-defined issue templates for common problems
   - Auto-fill based on template selection

6. **SLA Tracking:**
   - Track response time for client issues
   - Set priority-based SLA goals
   - Alert when SLA is at risk

## Files Modified/Created

### Backend:
- ✅ `crmApp/models/issue.py` (MODIFIED)
- ✅ `crmApp/serializers/issue.py` (MODIFIED)
- ✅ `crmApp/viewsets/issue.py` (MODIFIED)
- ✅ `crmApp/views/client_issues.py` (NEW)
- ✅ `crmApp/urls.py` (MODIFIED)
- ✅ Migration 0005 (CREATED & APPLIED)

### Frontend:
- ✅ `src/types/issue.types.ts` (MODIFIED)
- ✅ `src/services/issue.service.ts` (MODIFIED)
- ✅ `src/components/client-issues/ClientRaiseIssueModal.tsx` (NEW)
- ✅ `src/components/client-issues/index.ts` (MODIFIED)
- ✅ `src/pages/ClientIssuesPage.tsx` (MODIFIED)
- ✅ `src/components/issues/IssuesDataTable.tsx` (MODIFIED)

## Conclusion

The client-raised issues system is now fully implemented and functional. Clients can raise issues about organizations, and vendors/employees can view and resolve them. The system includes proper role-based access control, issue source tracking, and seamless integration with the existing Linear sync functionality.

**Status:** ✅ Complete and Ready for Testing
