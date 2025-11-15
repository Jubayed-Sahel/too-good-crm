# Issue Tracking System Integration

## Overview
The issue tracking system has been fully integrated into the Too Good CRM application. This system allows organizations to manage and track issues related to vendors, orders, and general organizational operations.

## Features

### 1. Issue Management
- **Create Issues**: Log new issues with title, description, priority, category, and status
- **View Issues**: Browse all issues with filtering and search capabilities
- **Update Issues**: Edit issue details, change status, assign to team members
- **Resolve Issues**: Mark issues as resolved with resolution notes
- **Delete Issues**: Remove issues when necessary
- **Reopen Issues**: Reopen resolved/closed issues if needed

### 2. Issue Categories
- **General**: General organizational issues
- **Quality**: Product or service quality problems
- **Delivery**: Delivery delays or problems
- **Billing**: Payment and invoicing issues
- **Communication**: Communication breakdowns
- **Technical**: Technical problems
- **Other**: Miscellaneous issues

### 3. Priority Levels
- **Low**: Minor issues that can be addressed later
- **Medium**: Standard priority issues
- **High**: Important issues requiring prompt attention
- **Urgent**: Critical issues requiring immediate action
- **Critical**: System-critical issues

### 4. Issue Status
- **Open**: New issue, not yet being worked on
- **In Progress**: Issue is actively being resolved
- **Resolved**: Issue has been fixed/addressed
- **Closed**: Issue is completed and archived

### 5. Client Issue Tracking
- Customers can raise issues about vendors/organizations
- Separate client portal for issue management
- Automatic notifications to vendors when issues are raised
- Track resolution progress

### 6. Linear Integration
- **Auto-sync to Linear**: Issues can be automatically synced to Linear for project management
- **Bidirectional sync**: Status updates sync between CRM and Linear
- **Webhook support**: Linear updates can be received via webhooks
- **Team mapping**: Map CRM organizations to Linear teams

## Backend Architecture

### Models
**Location**: `shared-backend/crmApp/models/issue.py`

```python
class Issue:
    - issue_number (auto-generated: ISS-YYYY-NNNN)
    - title
    - description
    - priority (low/medium/high/urgent/critical)
    - category (general/quality/delivery/billing/communication/technical/other)
    - status (open/in_progress/resolved/closed)
    - vendor (optional FK)
    - order (optional FK)
    - organization (required FK)
    - assigned_to (optional FK to Employee)
    - created_by (FK to User)
    - resolved_by (optional FK to Employee)
    - resolved_at (timestamp)
    - resolution_notes (text)
    - is_client_issue (boolean)
    - raised_by_customer (optional FK to Customer)
    - linear_issue_id (optional)
    - linear_issue_url (optional)
    - synced_to_linear (boolean)
```

### API Endpoints

#### Standard CRUD
- `GET /api/issues/` - List all issues (with filters)
- `GET /api/issues/{id}/` - Get issue details
- `POST /api/issues/` - Create new issue
- `PUT /api/issues/{id}/` - Update issue
- `PATCH /api/issues/{id}/` - Partial update
- `DELETE /api/issues/{id}/` - Delete issue

#### Custom Actions
- `POST /api/issues/raise/` - Raise a new issue (with Linear auto-sync)
- `POST /api/issues/resolve/{id}/` - Resolve an issue
- `POST /api/issues/{id}/resolve/` - Resolve via viewset action
- `POST /api/issues/{id}/reopen/` - Reopen resolved issue
- `GET /api/issues/stats/` - Get issue statistics

#### Client Endpoints
- `POST /api/client/issues/raise/` - Client raises issue about vendor
- `GET /api/client/issues/{id}/` - Client views their issue
- `POST /api/client/issues/{id}/comment/` - Client adds comment to issue

#### Webhooks
- `POST /api/webhooks/linear/` - Receive Linear webhook updates

### ViewSets & Views
**Location**: `shared-backend/crmApp/viewsets/issue.py`

- `IssueViewSet`: Main CRUD operations with permission checks
- `RaiseIssueView`: Dedicated endpoint for raising issues
- `ResolveIssueView`: Dedicated endpoint for resolving issues
- `ClientRaiseIssueView`: Client issue creation
- `ClientIssueDetailView`: Client issue viewing
- `LinearWebhookView`: Linear webhook handler

### Services
**Location**: `shared-backend/crmApp/services/`

- `IssueLinearService`: Handles Linear integration
  - Create issues in Linear
  - Sync status changes
  - Map priorities between systems
  - Handle webhooks

### Permissions
Issues respect the RBAC system:
- `issue:create` - Create new issues
- `issue:view` - View issues
- `issue:update` - Update issues
- `issue:delete` - Delete issues

**Customer Access**: Customers can view and manage issues they've raised without explicit permissions.

## Frontend Architecture

### Pages
**Location**: `web-frontend/src/pages/`

1. **IssuesPage.tsx**
   - Main issues list page
   - Filtering by status, priority, category
   - Search functionality
   - Statistics grid
   - Create/Edit/Delete actions

2. **IssueDetailPage.tsx**
   - View complete issue details
   - Resolve/Close/Reopen actions
   - View Linear integration status
   - Resolution notes display

3. **EditIssuePage.tsx**
   - Edit issue form
   - Update all issue fields
   - Validation

4. **ClientIssuesPage.tsx**
   - Client view of their raised issues
   - Simplified interface for customers

5. **ClientIssueDetailPage.tsx**
   - Client view of issue details
   - Add comments
   - Track resolution progress

### Components
**Location**: `web-frontend/src/components/issues/`

1. **IssueStatsGrid.tsx**
   - Display issue statistics
   - Count by status, priority, category

2. **IssueFiltersPanel.tsx**
   - Filter controls
   - Search input
   - Status/Priority/Category filters

3. **IssuesDataTable.tsx**
   - Data table with all issues
   - Action buttons (View/Edit/Resolve/Delete)
   - Status badges
   - Priority indicators

4. **CreateIssueModal.tsx**
   - Modal form for creating issues
   - Field validation

5. **RaiseIssueModal.tsx**
   - Modal for raising issues (with Linear sync)
   - Optional auto-sync toggle

6. **ResolveIssueModal.tsx**
   - Modal for resolving issues
   - Resolution notes input

### Services
**Location**: `web-frontend/src/services/issue.service.ts`

API client for all issue operations:
- CRUD operations
- Raise/Resolve actions
- Client operations
- Statistics

### Hooks
**Location**: `web-frontend/src/hooks/useIssues.ts`

React Query hooks:
- `useIssues(filters)` - Fetch issues list
- `useIssue(id)` - Fetch single issue
- `useIssueStats(filters)` - Fetch statistics
- `useIssueMutations()` - Create/Update/Delete/Resolve mutations

### Types
**Location**: `web-frontend/src/types/issue.types.ts`

TypeScript interfaces for type safety:
- `Issue`
- `CreateIssueData`
- `UpdateIssueData`
- `IssueStats`
- `IssueFilters`

### Routes
Issues are accessible at:
- `/issues` - List all issues (Employee/Vendor)
- `/issues/:id` - Issue details
- `/issues/:id/edit` - Edit issue
- `/client/issues` - Client issues list (Customer)
- `/client/issues/:id` - Client issue details

### Navigation
Issues are accessible from the sidebar:
- **Employee/Vendor Mode**: "Issues" menu item with FiAlertCircle icon
- **Customer Mode**: "Issues" menu item in client sidebar

## Usage Examples

### Creating an Issue (Employee/Vendor)

1. Navigate to `/issues`
2. Click "Create Issue" button
3. Fill in the form:
   - Title: Brief description
   - Description: Detailed explanation
   - Priority: Select priority level
   - Category: Select issue category
   - Vendor: (Optional) Related vendor
   - Order: (Optional) Related order
4. Click "Create"
5. Issue is created and optionally synced to Linear

### Raising an Issue (Customer)

1. Navigate to `/client/issues`
2. Click "Raise Issue" button
3. Select organization/vendor
4. Fill in issue details
5. Submit
6. Vendor is notified automatically

### Resolving an Issue

1. Open issue detail page
2. Click "Resolve" button
3. Enter resolution notes
4. Confirm
5. Status updates to "Resolved"
6. Syncs to Linear if connected

### Filtering Issues

On the issues page, you can filter by:
- **Search**: Search in title, description, issue number
- **Status**: Open, In Progress, Resolved, Closed
- **Priority**: Low, Medium, High, Urgent, Critical
- **Category**: All available categories
- **Vendor**: Filter by specific vendor
- **Order**: Filter by specific order

## Linear Integration Setup

### Prerequisites
1. Linear account
2. Linear API key
3. Linear team ID

### Configuration

1. **Backend Configuration**
   - Set environment variables:
     ```bash
     LINEAR_API_KEY=lin_api_xxxxxxxxxxxx
     LINEAR_WEBHOOK_SECRET=your_webhook_secret
     ```

2. **Organization Setup**
   - Store Linear team ID in organization settings
   - Configure in organization model or settings

3. **Webhook Setup**
   - Create webhook in Linear
   - Point to: `https://your-domain.com/api/webhooks/linear/`
   - Add webhook secret

### Auto-sync Behavior

When creating/updating issues:
- Issue data is sent to Linear
- Linear issue ID and URL are stored
- Status changes sync bidirectionally
- Priority mappings applied automatically

## Database Migrations

The following migrations exist:
1. `0002_activity_issue_notificationpreferences_order_and_more.py` - Initial issue model
2. `0003_issue_last_synced_at_issue_linear_issue_id_and_more.py` - Linear integration fields
3. `0005_issue_is_client_issue_issue_raised_by_customer_and_more.py` - Client issue tracking

To apply migrations:
```bash
cd shared-backend
python manage.py migrate
```

## Testing

### Backend Tests
**Location**: `shared-backend/tests/`

Run tests:
```bash
python manage.py test crmApp.tests.test_api
python manage.py test crmApp.tests.test_models
```

### Frontend Testing
Test issue components and pages in development:
```bash
cd web-frontend
npm run dev
```

## Permissions & Security

### RBAC Integration
- Issues follow organization-based access control
- Employees need appropriate permissions
- Vendors can manage their own issues
- Customers can only see issues they raised

### Data Isolation
- Issues are scoped to organizations
- Cross-organization access prevented
- Customer-raised issues visible to vendor

### API Security
- Authentication required for all endpoints
- Token-based auth
- Permission checks on every operation
- Organization validation

## Mobile App Support

The Android app also includes issue tracking:
**Location**: `app-frontend/app/src/main/java/too/good/crm/features/client/issues/`

- `IssuesScreen.kt` - Mobile issues list
- `Issue.kt` - Data model

## Common Scenarios

### Scenario 1: Quality Issue with Order
1. Customer places order
2. Receives defective product
3. Raises issue via client portal
4. Selects "Quality" category
5. Links to order number
6. Vendor receives notification
7. Vendor assigns to team member
8. Team member investigates
9. Issue resolved with replacement
10. Issue closed with resolution notes

### Scenario 2: Delivery Delay
1. Employee notices shipment delay
2. Creates issue in CRM
3. Category: "Delivery"
4. Priority: "High"
5. Links to vendor and order
6. Auto-syncs to Linear for tracking
7. Team collaborates on resolution
8. Updates status to "In Progress"
9. Problem resolved, status → "Resolved"
10. Customer notified

### Scenario 3: Internal Technical Issue
1. Employee encounters system problem
2. Raises issue without vendor/order
3. Category: "Technical"
4. Assigns to IT team member
5. Tracks in Linear project board
6. Resolution documented
7. Issue closed

## Troubleshooting

### Issues not syncing to Linear
- Check Linear API key
- Verify team ID is correct
- Check webhook configuration
- Review logs in `logs/django.log`

### Permission Denied Errors
- Verify user has correct role
- Check RBAC permissions
- Ensure organization membership
- Review permission assignments

### Issues not appearing
- Check organization filter
- Verify active profile
- Review queryset filters
- Check database records

## Future Enhancements

Potential improvements:
1. **Email Notifications**: Notify users on issue updates
2. **Issue Templates**: Pre-defined issue templates
3. **Attachments**: File uploads for issues
4. **Comments System**: Threaded comments on issues
5. **SLA Tracking**: Track resolution times
6. **Advanced Analytics**: Issue trends and patterns
7. **Bulk Operations**: Update multiple issues
8. **Issue Export**: Export to CSV/PDF
9. **Custom Fields**: Organization-specific fields
10. **Integration with other tools**: Slack, Jira, etc.

## Support

For questions or issues:
1. Check this documentation
2. Review API documentation
3. Check logs for errors
4. Contact development team

## Changelog

### Version 1.0 (Current)
- Initial issue tracking implementation
- CRUD operations
- Linear integration
- Client issue portal
- Permission-based access
- Status workflows
- Statistics dashboard

---

**Last Updated**: November 9, 2025
**Version**: 1.0.0

