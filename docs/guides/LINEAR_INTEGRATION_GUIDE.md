# Linear Integration Implementation Guide

## Overview
This guide explains how Linear.app integration was implemented in the CRM system. Linear is a project management tool, and we've integrated it to sync issues bidirectionally between the CRM and Linear.

## Architecture

### 1. **Core Service Layer** (`linear_service.py`)
The foundation of the integration - handles all direct API calls to Linear.

**Location:** `shared-backend/crmApp/services/linear_service.py`

**Key Features:**
- GraphQL API client for Linear
- Bearer token authentication
- Methods for creating, updating, and reading issues
- Team and workflow state management
- Priority mapping between CRM and Linear

**Key Methods:**
```python
- create_issue()      # Create new issue in Linear
- update_issue()      # Update existing Linear issue
- get_issue()         # Fetch issue from Linear
- get_teams()         # Get available teams
- get_team_states()   # Get workflow states for a team
- find_state_by_name() # Find state ID by name
```

### 2. **Issue-Specific Service** (`issue_linear_service.py`)
Higher-level service that handles business logic for issue synchronization.

**Location:** `shared-backend/crmApp/services/issue_linear_service.py`

**Key Features:**
- Syncs issues to Linear (create/update)
- Syncs status changes to Linear states
- Pulls changes from Linear to CRM
- Bulk synchronization
- Automatic state mapping

**Key Methods:**
```python
- sync_issue_to_linear()        # Create/update issue in Linear
- sync_issue_status_to_linear()  # Update issue status/state
- sync_issue_from_linear()       # Pull changes from Linear
- bulk_sync_issues_to_linear()   # Sync multiple issues
```

### 3. **ViewSet Mixin** (`linear_sync_mixin.py`)
Reusable mixin that provides Linear sync functionality to any ViewSet.

**Location:** `shared-backend/crmApp/viewsets/mixins/linear_sync_mixin.py`

**Purpose:**
- Provides helper methods for getting team IDs
- Maps CRM statuses to Linear states
- Handles sync operations

### 4. **Webhook Handler** (`linear_webhook.py`)
Receives webhook events from Linear for bidirectional sync.

**Location:** `shared-backend/crmApp/views/linear_webhook.py`

**Features:**
- Signature verification for security
- Handles issue create/update/remove events
- Syncs Linear changes back to CRM
- Maps Linear states to CRM statuses

**Endpoint:** `POST /api/webhooks/linear/`

### 5. **Issue ViewSet Integration** (`issue.py`)
The main ViewSet that uses all the above components.

**Location:** `shared-backend/crmApp/viewsets/issue.py`

**Key Actions:**
- `sync_to_linear` - Manually sync issue to Linear
- `sync_from_linear` - Pull latest from Linear
- `resolve` - Resolve issue (auto-syncs to Linear)
- `reopen` - Reopen issue (auto-syncs to Linear)
- `update` - Update issue (auto-syncs status changes)

## Data Model

### Issue Model Fields (Linear-related)
```python
- linear_issue_id      # Linear issue ID (UUID)
- linear_issue_url     # URL to view issue in Linear
- linear_team_id       # Linear team ID
- synced_to_linear     # Boolean flag
- last_synced_at       # Timestamp of last sync
```

### Organization Model Fields
```python
- linear_team_id       # Default Linear team for organization
```

## Implementation Flow

### 1. **Creating an Issue (CRM → Linear)**

```
User creates issue in CRM
    ↓
IssueViewSet.perform_create()
    ↓
IssueLinearService.sync_issue_to_linear()
    ↓
LinearService.create_issue() [GraphQL mutation]
    ↓
Linear API creates issue
    ↓
CRM issue updated with:
  - linear_issue_id
  - linear_issue_url
  - synced_to_linear = True
```

### 2. **Updating Issue Status (CRM → Linear)**

```
User changes issue status (e.g., "resolved")
    ↓
IssueViewSet.update() or resolve()
    ↓
IssueLinearService.sync_issue_status_to_linear()
    ↓
Maps CRM status to Linear state:
  - "resolved" → "Done" or "Completed"
  - "in_progress" → "In Progress"
  - "open" → "Todo" or "Backlog"
    ↓
LinearService.update_issue() [GraphQL mutation]
    ↓
Linear issue state updated
```

### 3. **Linear Webhook (Linear → CRM)**

```
Issue updated in Linear
    ↓
Linear sends webhook to /api/webhooks/linear/
    ↓
LinearWebhookView.post()
    ↓
Verifies webhook signature
    ↓
Parses event (create/update/remove)
    ↓
Finds corresponding CRM issue by linear_issue_id
    ↓
Updates CRM issue:
  - Title, description, priority
  - Status (based on Linear state)
  - last_synced_at
```

## Status Mapping

### CRM Status → Linear State
```python
'open'         → ['Todo', 'Backlog', 'Triage', 'Open']
'in_progress'  → ['In Progress', 'Started', 'Working']
'resolved'     → ['Done', 'Completed', 'Resolved', 'Closed']
'closed'       → ['Canceled', 'Closed', 'Cancelled']
```

### Linear State Type → CRM Status
```python
'started'      → 'in_progress'
'completed'    → 'resolved'
'canceled'     → 'closed'
```

## Priority Mapping

### CRM Priority → Linear Priority
```python
'urgent'  → 1 (Urgent)
'high'    → 2 (High)
'medium'  → 3 (Normal)
'low'     → 4 (Low)
```

### Linear Priority → CRM Priority
```python
0 → 'medium'  # No priority
1 → 'urgent'
2 → 'high'
3 → 'medium'
4 → 'low'
```

## Configuration

### Environment Variables
```python
LINEAR_API_KEY        # Linear API key (Bearer token)
LINEAR_WEBHOOK_SECRET # Secret for webhook signature verification
```

### Organization Settings
- Each organization can have a `linear_team_id`
- This is used as the default team when creating issues
- Can be overridden per-issue via request data

## API Endpoints

### Issue Actions
- `POST /api/issues/{id}/sync_to_linear/` - Sync issue to Linear
- `POST /api/issues/{id}/sync_from_linear/` - Pull from Linear
- `POST /api/issues/{id}/resolve/` - Resolve (auto-syncs)
- `POST /api/issues/{id}/reopen/` - Reopen (auto-syncs)

### Webhook
- `POST /api/webhooks/linear/` - Linear webhook endpoint

## Error Handling

1. **API Failures**: Logged and returned as error responses
2. **Webhook Verification**: Invalid signatures return 401
3. **Missing Team ID**: Returns error if no team configured
4. **State Not Found**: Logs warning, continues without state update

## Security

1. **API Authentication**: Bearer token in Authorization header
2. **Webhook Verification**: HMAC SHA256 signature verification
3. **CSRF Exemption**: Webhook endpoint exempted (uses signature instead)

## Testing

Test scripts available:
- `shared-backend/scripts/test/test_linear_integration.py`
- `shared-backend/scripts/test/quick_test_linear.py`
- `shared-backend/scripts/utilities/get_linear_team_id.py`

## Key Design Decisions

1. **Bidirectional Sync**: Changes in either system sync to the other
2. **State Mapping**: Flexible mapping handles different workflow names
3. **Automatic Sync**: Status changes automatically sync to Linear
4. **Manual Sync**: Users can manually trigger syncs
5. **Webhook-Based**: Real-time updates from Linear via webhooks
6. **Service Layer**: Separation of concerns (API client vs business logic)

## Files Summary

### Backend Files
1. `crmApp/services/linear_service.py` - Core Linear API client
2. `crmApp/services/issue_linear_service.py` - Issue sync service
3. `crmApp/viewsets/mixins/linear_sync_mixin.py` - Reusable mixin
4. `crmApp/views/linear_webhook.py` - Webhook handler
5. `crmApp/viewsets/issue.py` - Issue ViewSet (uses mixin)
6. `crmApp/models/issue.py` - Issue model (Linear fields)
7. `crmApp/models/organization.py` - Organization model (team ID)
8. `crmApp/serializers/issue.py` - Issue serializers (Linear fields)
9. `crmApp/urls.py` - URL routing

### Frontend Files
- Issue-related pages and components display Linear sync status
- Issue service handles sync API calls
- UI shows Linear issue links when synced

## Usage Example

```python
# In a ViewSet or view
from crmApp.services import IssueLinearService

service = IssueLinearService()
team_id = organization.linear_team_id

# Sync issue to Linear
success, linear_data, error = service.sync_issue_to_linear(
    issue=issue,
    team_id=team_id
)

if success:
    print(f"Issue synced: {linear_data['url']}")
else:
    print(f"Error: {error}")
```

## Future Enhancements

1. Comment synchronization
2. Attachment handling
3. User/assignee mapping
4. Label synchronization
5. Custom field mapping
6. Bulk operations UI

