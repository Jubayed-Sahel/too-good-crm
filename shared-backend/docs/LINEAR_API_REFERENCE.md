# Linear Integration - API Endpoints Quick Reference

## 🔥 Quick Start

### 1. Raise Issue with Auto-Sync to Linear
```bash
POST /api/issues/raise/

{
  "title": "Issue title",
  "description": "Description",
  "priority": "high",
  "category": "quality",
  "auto_sync_linear": true,
  "linear_team_id": "YOUR_TEAM_ID"
}
```

### 2. Resolve Issue (Auto-syncs if already in Linear)
```bash
POST /api/issues/resolve/{issue_id}/

{
  "resolution_notes": "Notes about resolution"
}
```

---

## 📋 All Linear Endpoints

### Issue Creation & Resolution
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/issues/raise/` | Create issue with optional auto-sync |
| POST | `/api/issues/resolve/{id}/` | Resolve issue, auto-sync to Linear |

### Standard CRUD
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/issues/` | List all issues |
| POST | `/api/issues/` | Create issue (manual) |
| GET | `/api/issues/{id}/` | Get issue details |
| PUT/PATCH | `/api/issues/{id}/` | Update issue |
| DELETE | `/api/issues/{id}/` | Delete issue |

### Linear Sync Actions
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/issues/{id}/sync_to_linear/` | Sync single issue to Linear |
| POST | `/api/issues/{id}/sync_from_linear/` | Pull updates from Linear |
| POST | `/api/issues/bulk_sync_to_linear/` | Bulk sync multiple issues |

### Statistics & Info
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/issues/stats/` | Get statistics (includes Linear sync stats) |

### Webhooks
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/webhooks/linear/` | Receive webhook events from Linear |

---

## 📝 Request/Response Examples

### Raise Issue with Auto-Sync

**Request:**
```json
POST /api/issues/raise/
{
  "title": "Product defect in order #1234",
  "description": "Customer reported broken items",
  "priority": "high",
  "category": "quality",
  "vendor": 1,
  "order": 5,
  "auto_sync_linear": true,
  "linear_team_id": "abc-123-def-456"
}
```

**Response:**
```json
{
  "message": "Issue raised successfully and synced to Linear",
  "issue": {
    "id": 10,
    "issue_number": "ISS-2025-0010",
    "title": "Product defect in order #1234",
    "description": "Customer reported broken items",
    "priority": "high",
    "category": "quality",
    "status": "open",
    "linear_issue_id": "abc-linear-id",
    "linear_issue_url": "https://linear.app/team/issue/ABC-123",
    "synced_to_linear": true,
    "last_synced_at": "2025-11-08T10:30:00Z"
  },
  "linear_data": {
    "id": "abc-linear-id",
    "identifier": "ABC-123",
    "url": "https://linear.app/team/issue/ABC-123",
    "title": "Product defect in order #1234",
    "state": "Backlog"
  }
}
```

### Sync Existing Issue to Linear

**Request:**
```json
POST /api/issues/10/sync_to_linear/
{
  "team_id": "abc-123-def-456"
}
```

**Response:**
```json
{
  "message": "Issue synced to Linear successfully",
  "issue": {
    "id": 10,
    "issue_number": "ISS-2025-0010",
    "linear_issue_id": "new-linear-id",
    "linear_issue_url": "https://linear.app/team/issue/ABC-124",
    "synced_to_linear": true
  },
  "linear_data": {
    "id": "new-linear-id",
    "identifier": "ABC-124",
    "url": "https://linear.app/team/issue/ABC-124"
  }
}
```

### Bulk Sync to Linear

**Request:**
```json
POST /api/issues/bulk_sync_to_linear/
{
  "issue_ids": [10, 11, 12, 13, 14],
  "team_id": "abc-123-def-456"
}
```

**Response:**
```json
{
  "message": "Bulk sync completed: 5 succeeded, 0 failed",
  "synced_count": 5,
  "failed_count": 0,
  "results": [
    {
      "issue_id": 10,
      "issue_number": "ISS-2025-0010",
      "status": "success",
      "linear_url": "https://linear.app/team/issue/ABC-123"
    },
    {
      "issue_id": 11,
      "issue_number": "ISS-2025-0011",
      "status": "success",
      "linear_url": "https://linear.app/team/issue/ABC-124"
    }
  ]
}
```

### Get Statistics

**Request:**
```bash
GET /api/issues/stats/
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
  "by_category": {
    "quality": 8,
    "delivery": 7,
    "payment": 3,
    "communication": 4,
    "other": 3
  },
  "linear_sync": {
    "synced": 15,
    "not_synced": 10
  }
}
```

---

## 🔐 Authentication

All endpoints require Token authentication:

```bash
Authorization: Token YOUR_AUTH_TOKEN
```

Get your token by logging in:
```bash
POST /api/auth/login/
{
  "email": "admin@crm.com",
  "password": "admin123"
}
```

---

## 🎯 Field Reference

### Issue Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | ✅ | Issue title |
| `description` | text | ✅ | Detailed description |
| `priority` | enum | ✅ | `low`, `medium`, `high`, `urgent` |
| `category` | enum | ✅ | `general`, `delivery`, `quality`, `billing`, `communication`, `technical`, `other` |
| `vendor` | integer | ❌ | Vendor ID |
| `order` | integer | ❌ | Order ID |
| `assigned_to` | integer | ❌ | Employee ID |
| `auto_sync_linear` | boolean | ❌ | Auto-sync to Linear on create |
| `linear_team_id` | string | ❌ | Linear team ID for sync |

### Linear-Specific Fields (Read-only)

| Field | Type | Description |
|-------|------|-------------|
| `linear_issue_id` | string | Linear's unique issue ID |
| `linear_issue_url` | URL | Direct link to Linear issue |
| `synced_to_linear` | boolean | Whether synced to Linear |
| `last_synced_at` | datetime | Last sync timestamp |

---

## 🔄 Webhook Event Handling

Linear will send webhook events to `/api/webhooks/linear/` when:

- Issue is created in Linear
- Issue is updated in Linear (title, description, priority, status)
- Issue is deleted in Linear

The webhook automatically:
- Updates corresponding CRM issue
- Maps Linear states to CRM statuses
- Syncs priority changes
- Logs all events

---

## 💡 Tips

1. **Auto-sync on create**: Add `"auto_sync_linear": true` when raising issues
2. **Bulk operations**: Use bulk sync for syncing multiple existing issues at once
3. **Webhooks**: Set up webhooks for automatic bidirectional sync
4. **Statistics**: Check `/stats/` endpoint to see how many issues are synced
5. **Error handling**: Sync failures don't block issue creation/resolution

---

## 🚀 Getting Started Checklist

- [ ] Add `LINEAR_API_KEY` to `.env`
- [ ] Get your Linear team ID
- [ ] Test creating an issue with auto-sync
- [ ] Configure webhook in Linear (optional)
- [ ] Bulk sync existing issues (optional)

---

See `LINEAR_INTEGRATION_GUIDE.md` for complete documentation!
