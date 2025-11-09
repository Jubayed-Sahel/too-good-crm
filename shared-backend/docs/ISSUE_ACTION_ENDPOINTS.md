# Issue Action Endpoints Documentation

## Overview
Two dedicated endpoints have been created for issue raising and resolving operations, separate from the main Issue CRUD endpoints.

## Endpoints

### 1. Raise Issue
**Endpoint:** `POST /api/issues/raise/`

**Purpose:** Create and raise a new issue with automatic status set to 'open'

**Authentication:** Required (Token)

**Request Body:**
```json
{
  "title": "Product quality issue with order #1234",
  "description": "Detailed description of the issue",
  "priority": "high",
  "category": "quality",
  "vendor": 1,
  "order": 5,
  "assigned_to": 3
}
```

**Fields:**
- `title` (required): Brief title of the issue
- `description` (required): Detailed description
- `priority` (required): One of: `low`, `medium`, `high`, `urgent`
- `category` (required): One of: `general`, `delivery`, `quality`, `billing`, `communication`, `technical`, `other`
- `vendor` (optional): Vendor ID related to this issue
- `order` (optional): Order ID related to this issue
- `assigned_to` (optional): Employee ID to assign this issue to

**Success Response (201):**
```json
{
  "message": "Issue raised successfully",
  "issue": {
    "id": 10,
    "issue_number": "ISS-2025-0010",
    "title": "Product quality issue with order #1234",
    "description": "Detailed description of the issue",
    "priority": "high",
    "category": "quality",
    "status": "open",
    "vendor": 1,
    "order": 5,
    "assigned_to": 3,
    "created_by": 2,
    "resolved_by": null,
    "organization": 1,
    "created_at": "2025-11-08T10:30:00Z",
    "updated_at": "2025-11-08T10:30:00Z"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Validation error or missing organization
- `401 Unauthorized`: Authentication required
- `500 Internal Server Error`: Server error

---

### 2. Resolve Issue
**Endpoint:** `POST /api/issues/resolve/<issue_id>/`

**Purpose:** Mark an existing issue as resolved

**Authentication:** Required (Token)

**URL Parameter:**
- `issue_id`: The ID of the issue to resolve

**Request Body (Optional):**
```json
{
  "resolution_notes": "Issue resolved by replacing the defective product"
}
```

**Fields:**
- `resolution_notes` (optional): Notes about how the issue was resolved (will be appended to issue description)

**Success Response (200):**
```json
{
  "message": "Issue resolved successfully",
  "issue": {
    "id": 10,
    "issue_number": "ISS-2025-0010",
    "title": "Product quality issue with order #1234",
    "description": "Detailed description of the issue\n\n--- Resolution Notes ---\nIssue resolved by replacing the defective product",
    "priority": "high",
    "category": "quality",
    "status": "resolved",
    "vendor": 1,
    "order": 5,
    "assigned_to": 3,
    "created_by": 2,
    "resolved_by": 2,
    "organization": 1,
    "created_at": "2025-11-08T10:30:00Z",
    "updated_at": "2025-11-08T10:45:00Z"
  },
  "previous_status": "in_progress"
}
```

**Error Responses:**
- `400 Bad Request`: Issue already resolved/closed or missing organization
- `401 Unauthorized`: Authentication required
- `404 Not Found`: Issue not found in user's organization
- `500 Internal Server Error`: Server error

---

## Usage Examples

### Raise Issue Example (cURL)
```bash
curl -X POST http://localhost:8000/api/issues/raise/ \
  -H "Authorization: Token YOUR_AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Delivery delayed by 3 days",
    "description": "Order was supposed to arrive on Nov 5 but still not received",
    "priority": "high",
    "category": "delivery",
    "vendor": 1,
    "order": 10
  }'
```

### Resolve Issue Example (cURL)
```bash
curl -X POST http://localhost:8000/api/issues/resolve/10/ \
  -H "Authorization: Token YOUR_AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "resolution_notes": "Contacted vendor, shipment delivered successfully"
  }'
```

### Python Requests Example
```python
import requests

# Raise Issue
url = "http://localhost:8000/api/issues/raise/"
headers = {
    "Authorization": "Token YOUR_AUTH_TOKEN",
    "Content-Type": "application/json"
}
data = {
    "title": "Payment not received",
    "description": "Invoice #1234 payment pending for 10 days",
    "priority": "urgent",
    "category": "billing",
    "vendor": 2
}
response = requests.post(url, json=data, headers=headers)
print(response.json())

# Resolve Issue
issue_id = 10
url = f"http://localhost:8000/api/issues/resolve/{issue_id}/"
data = {
    "resolution_notes": "Payment received and confirmed"
}
response = requests.post(url, json=data, headers=headers)
print(response.json())
```

---

## Differences from Standard CRUD Endpoints

### Standard Issue Endpoints
- `GET /api/issues/` - List all issues
- `POST /api/issues/` - Create issue (manual status)
- `GET /api/issues/{id}/` - Get issue details
- `PUT/PATCH /api/issues/{id}/` - Update issue
- `DELETE /api/issues/{id}/` - Delete issue
- `POST /api/issues/{id}/resolve/` - Resolve action (old method)
- `POST /api/issues/{id}/reopen/` - Reopen action

### New Dedicated Endpoints
- `POST /api/issues/raise/` - **Raise new issue** (auto status='open', auto organization/creator)
- `POST /api/issues/resolve/{id}/` - **Resolve issue** (with validation, resolution notes, logging)

**Advantages:**
1. **Clearer Intent**: Endpoint names clearly indicate the action
2. **Automatic Fields**: Organization, creator, and status are set automatically
3. **Better Validation**: Checks for already resolved/closed issues
4. **Resolution Notes**: Can add notes directly when resolving
5. **Enhanced Logging**: Detailed logs of who raised/resolved issues
6. **Transaction Safety**: Uses database transactions for data integrity

---

## Notes
- Users must have an active organization to use these endpoints
- Issues always start with status='open' when raised
- Resolved issues can be reopened using the existing `/api/issues/{id}/reopen/` endpoint
- Resolution notes are appended to the issue description for audit trail
- The `resolved_by` field is automatically set to the user who resolves the issue
