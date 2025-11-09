# Linear Integration - Complete Documentation

## Overview
This CRM now has **bidirectional integration with Linear.app** for issue tracking. Issues can be created in the CRM and automatically synced to Linear, or updated in Linear and synced back to the CRM.

## Features Implemented

### ✅ 1. Database Schema
Added Linear-specific fields to Issue model:
- `linear_issue_id`: Linear's unique issue ID
- `linear_issue_url`: Direct URL to view issue in Linear
- `linear_team_id`: Linear team this issue belongs to
- `synced_to_linear`: Boolean flag indicating sync status
- `last_synced_at`: Timestamp of last sync

### ✅ 2. Linear API Service (`crmApp/services/linear_service.py`)
Complete GraphQL API wrapper with methods:
- `create_issue()`: Create new issue in Linear
- `update_issue()`: Update existing Linear issue
- `get_issue()`: Fetch issue details from Linear
- `get_team_states()`: Get workflow states for a team
- `map_priority_to_linear()`: Convert CRM → Linear priorities
- `map_linear_priority_to_crm()`: Convert Linear → CRM priorities
- `get_viewer()`: Get current user and team information

### ✅ 3. API Endpoints

#### Issue CRUD with Linear Sync
**Base endpoint:** `/api/issues/`

New actions on IssueViewSet:
- `POST /api/issues/{id}/sync_to_linear/` - Sync single issue to Linear
- `POST /api/issues/{id}/sync_from_linear/` - Pull updates from Linear
- `POST /api/issues/bulk_sync_to_linear/` - Bulk sync multiple issues
- `GET /api/issues/stats/` - Now includes Linear sync statistics

#### Dedicated Issue Actions
- `POST /api/issues/raise/` - Create issue with optional auto-sync
- `POST /api/issues/resolve/{id}/` - Resolve issue with auto-sync

#### Webhook
- `POST /api/webhooks/linear/` - Receive updates from Linear

---

## Setup Instructions

### 1. Get Linear API Key

1. Go to https://linear.app/settings/api
2. Click "Create new API key"
3. Give it a name (e.g., "Too Good CRM Integration")
4. Copy the API key (starts with `lin_api_...`)

### 2. Configure Environment Variables

Create `.env` file in `shared-backend/`:

```env
# Linear Integration
LINEAR_API_KEY=lin_api_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
LINEAR_WEBHOOK_SECRET=your_webhook_secret_here
```

### 3. Get Your Linear Team ID

Run this Python script to find your team ID:

```python
from crmApp.services.linear_service import LinearService

linear = LinearService()
viewer = linear.get_viewer()

print("Your Linear Teams:")
for team in viewer['teams']['nodes']:
    print(f"  Name: {team['name']}")
    print(f"  ID: {team['id']}")
    print(f"  Key: {team['key']}")
    print()
```

Or use this cURL command:
```bash
curl https://api.linear.app/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: YOUR_LINEAR_API_KEY" \
  -d '{"query": "{ viewer { teams { nodes { id name key } } } }"}'
```

### 4. Set Up Linear Webhook (Optional for Bidirectional Sync)

1. Go to Linear Settings → Webhooks
2. Click "New webhook"
3. **URL:** `https://your-domain.com/api/webhooks/linear/`
4. **Label:** "Too Good CRM Sync"
5. **Resource types:** Select "Issue"
6. **Secret:** Generate a random secret and add to `.env` as `LINEAR_WEBHOOK_SECRET`
7. Click "Create webhook"

---

## Usage Examples

### Example 1: Raise Issue with Auto-Sync to Linear

```bash
curl -X POST http://localhost:8000/api/issues/raise/ \
  -H "Authorization: Token YOUR_AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Product quality issue with vendor ABC",
    "description": "Customer complained about defective products in order #1234",
    "priority": "high",
    "category": "quality",
    "vendor": 1,
    "order": 5,
    "auto_sync_linear": true,
    "linear_team_id": "YOUR_LINEAR_TEAM_ID"
  }'
```

**Response:**
```json
{
  "message": "Issue raised successfully and synced to Linear",
  "issue": {
    "id": 10,
    "issue_number": "ISS-2025-0010",
    "title": "Product quality issue with vendor ABC",
    "status": "open",
    "linear_issue_id": "abc123-def456",
    "linear_issue_url": "https://linear.app/your-team/issue/ABC-123",
    "synced_to_linear": true
  },
  "linear_data": {
    "id": "abc123-def456",
    "identifier": "ABC-123",
    "url": "https://linear.app/your-team/issue/ABC-123"
  }
}
```

### Example 2: Manually Sync Existing Issue to Linear

```bash
curl -X POST http://localhost:8000/api/issues/10/sync_to_linear/ \
  -H "Authorization: Token YOUR_AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "team_id": "YOUR_LINEAR_TEAM_ID"
  }'
```

### Example 3: Bulk Sync Multiple Issues

```bash
curl -X POST http://localhost:8000/api/issues/bulk_sync_to_linear/ \
  -H "Authorization: Token YOUR_AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "issue_ids": [10, 11, 12, 13],
    "team_id": "YOUR_LINEAR_TEAM_ID"
  }'
```

### Example 4: Resolve Issue (Auto-syncs if already in Linear)

```bash
curl -X POST http://localhost:8000/api/issues/resolve/10/ \
  -H "Authorization: Token YOUR_AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "resolution_notes": "Issue resolved. Vendor sent replacement products."
  }'
```

### Example 5: Pull Updates from Linear

```bash
curl -X POST http://localhost:8000/api/issues/10/sync_from_linear/ \
  -H "Authorization: Token YOUR_AUTH_TOKEN"
```

### Example 6: Get Statistics (Including Linear Sync Status)

```bash
curl -X GET http://localhost:8000/api/issues/stats/ \
  -H "Authorization: Token YOUR_AUTH_TOKEN"
```

**Response:**
```json
{
  "total": 25,
  "by_status": {
    "open": 10,
    "in_progress": 8,
    "resolved": 5,
    "closed": 2
  },
  "by_priority": {
    "low": 5,
    "medium": 10,
    "high": 8,
    "urgent": 2
  },
  "linear_sync": {
    "synced": 15,
    "not_synced": 10
  }
}
```

---

## Python Examples

### Raise Issue with Auto-Sync

```python
import requests

url = "http://localhost:8000/api/issues/raise/"
headers = {
    "Authorization": "Token YOUR_AUTH_TOKEN",
    "Content-Type": "application/json"
}

data = {
    "title": "Delayed delivery from vendor",
    "description": "Order #5678 was supposed to arrive on Nov 5",
    "priority": "high",
    "category": "delivery",
    "vendor": 2,
    "order": 10,
    "auto_sync_linear": True,
    "linear_team_id": "YOUR_LINEAR_TEAM_ID"
}

response = requests.post(url, json=data, headers=headers)
result = response.json()

print(f"Issue created: {result['issue']['issue_number']}")
if 'linear_data' in result:
    print(f"Linear URL: {result['linear_data']['url']}")
```

### Bulk Sync to Linear

```python
import requests

url = "http://localhost:8000/api/issues/bulk_sync_to_linear/"
headers = {
    "Authorization": "Token YOUR_AUTH_TOKEN",
    "Content-Type": "application/json"
}

data = {
    "issue_ids": [1, 2, 3, 4, 5],
    "team_id": "YOUR_LINEAR_TEAM_ID"
}

response = requests.post(url, json=data, headers=headers)
result = response.json()

print(f"Synced: {result['synced_count']}, Failed: {result['failed_count']}")
for item in result['results']:
    print(f"  {item['issue_number']}: {item['status']}")
```

---

## Priority Mapping

| CRM Priority | Linear Priority |
|--------------|-----------------|
| `urgent`     | 1 (Urgent)      |
| `high`       | 2 (High)        |
| `medium`     | 3 (Normal)      |
| `low`        | 4 (Low)         |

## Status Mapping

| CRM Status     | Linear State                    |
|----------------|----------------------------------|
| `open`         | Backlog, Todo, Triage           |
| `in_progress`  | In Progress, In Review          |
| `resolved`     | Done, Completed                 |
| `closed`       | Canceled, Duplicate             |

---

## Webhook Events

When configured, the webhook at `/api/webhooks/linear/` handles these events:

### Issue Created
- Logs the creation (typically won't match any CRM issue)

### Issue Updated
- Syncs changes from Linear back to CRM:
  - Title updates
  - Description updates
  - Priority changes
  - Status changes (based on workflow state)

### Issue Removed
- Marks CRM issue as no longer synced
- Clears `linear_issue_id` and `linear_issue_url`

---

## Admin Interface

Issues can be viewed and managed in Django Admin:
- Go to `http://localhost:8000/admin/`
- Navigate to "Issues"
- Linear fields are visible and editable
- Filter by `synced_to_linear` status

---

## Testing the Integration

### Test 1: Create Issue and Sync

```python
# Using Django shell
python manage.py shell

from crmApp.models import Issue, Organization
from crmApp.services.linear_service import LinearService

# Get your organization
org = Organization.objects.first()

# Create an issue
issue = Issue.objects.create(
    organization=org,
    title="Test Linear Integration",
    description="Testing the Linear sync functionality",
    priority="high",
    category="technical",
    status="open"
)

# Sync to Linear
linear = LinearService()
result = linear.create_issue(
    team_id="YOUR_LINEAR_TEAM_ID",
    title=issue.title,
    description=issue.description,
    priority=linear.map_priority_to_linear(issue.priority)
)

# Update issue with Linear data
issue.linear_issue_id = result['id']
issue.linear_issue_url = result['url']
issue.synced_to_linear = True
issue.save()

print(f"Issue synced! View it at: {result['url']}")
```

### Test 2: Verify Webhook

1. Create/update an issue in Linear
2. Check Django logs for webhook events:
   ```bash
   tail -f logs/django.log
   ```
3. Verify the CRM issue was updated

---

## Troubleshooting

### Error: "Invalid Linear API key"
- Verify your API key in `.env` starts with `lin_api_`
- Make sure `.env` file is in the `shared-backend/` directory
- Restart Django server after changing `.env`

### Error: "Team ID required"
- You must provide `team_id` when syncing issues
- Get your team ID using the script in Setup section
- Or configure it per organization in the database

### Webhook Not Receiving Events
- Check that your webhook URL is publicly accessible
- Verify webhook secret matches in Linear and `.env`
- Check firewall/network settings
- Look for webhook logs in Linear Settings → Webhooks

### Issue Not Syncing
- Check `synced_to_linear` field on the issue
- Verify `linear_issue_id` is set
- Check Django logs for error messages
- Try manual sync using `/sync_to_linear/` endpoint

---

## File Structure

```
shared-backend/
├── crmApp/
│   ├── models/
│   │   └── issue.py (+ Linear fields)
│   ├── services/
│   │   └── linear_service.py (NEW)
│   ├── views/
│   │   ├── issue_actions.py (+ Linear auto-sync)
│   │   └── linear_webhook.py (NEW)
│   └── viewsets/
│       └── issue.py (+ Linear sync endpoints)
├── crmAdmin/
│   └── settings.py (+ LINEAR_API_KEY, LINEAR_WEBHOOK_SECRET)
├── migrations/
│   └── 0003_issue_linear_fields.py
└── .env (YOUR CONFIG)
```

---

## Next Steps

1. **Configure Organization Team IDs**: Add `linear_team_id` field to Organization model
2. **Auto-Sync on Create**: Make all new issues auto-sync by default
3. **Comment Sync**: Sync issue comments between CRM and Linear
4. **Attachment Sync**: Sync file attachments
5. **Assignee Mapping**: Map CRM employees to Linear users
6. **Custom Field Mapping**: Sync custom fields between systems

---

## Security Notes

- **Never commit `.env` file** to version control
- Keep `LINEAR_API_KEY` secret
- Use `LINEAR_WEBHOOK_SECRET` to verify webhook authenticity
- Consider rate limiting webhook endpoint
- Use HTTPS for webhook URL in production

---

## Support

For issues or questions:
1. Check Django logs for error messages
2. Verify Linear API status at https://linear.app/status
3. Review Linear API docs at https://developers.linear.app/docs
4. Check webhook delivery logs in Linear Settings

---

## Summary

✅ **Linear integration is complete and ready to use!**

You can now:
- Create issues in CRM and auto-sync to Linear
- Manually sync existing issues
- Bulk sync multiple issues
- Receive webhook updates from Linear
- View sync status in API and Admin

Just add your `LINEAR_API_KEY` and `LINEAR_TEAM_ID` to get started!
