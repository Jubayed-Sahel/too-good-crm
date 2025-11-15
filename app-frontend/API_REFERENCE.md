# Issue Tracking API Quick Reference

## Base URL
```
https://your-backend-url.com/api/
```

---

## Customer Endpoints

### 1. Create Issue (Customer Only)
```http
POST /client/issues/raise/
Authorization: Token {user_token}
Content-Type: application/json

Request Body:
{
  "organization": 1,
  "title": "Payment processing issue",
  "description": "Unable to process payment for order #123",
  "priority": "high",
  "category": "billing",
  "vendor": 5,      // optional
  "order": 123      // optional
}

Response: 201 Created
{
  "message": "Issue raised successfully and synced to Linear",
  "issue": {
    "id": 42,
    "issue_number": "ISS-2024-0042",
    "title": "Payment processing issue",
    "description": "Unable to process payment for order #123",
    "priority": "high",
    "category": "billing",
    "status": "open",
    "organization_id": 1,
    "raised_by_customer_id": 10,
    "raised_by_customer_name": "John Doe",
    "synced_to_linear": true,
    "linear_issue_id": "abc123",
    "linear_issue_url": "https://linear.app/team/ISS-123",
    "created_at": "2024-11-09T10:30:00Z",
    "updated_at": "2024-11-09T10:30:00Z"
  },
  "linear_data": {
    "id": "abc123",
    "identifier": "TEAM-123",
    "url": "https://linear.app/team/ISS-123",
    "title": "Payment processing issue",
    "state": "Backlog"
  }
}
```

### 2. Get Customer's Issues
```http
GET /client/issues/
Authorization: Token {user_token}

Response: 200 OK
{
  "count": 5,
  "results": [
    {
      "id": 42,
      "issue_number": "ISS-2024-0042",
      "title": "Payment processing issue",
      "status": "in_progress",
      "priority": "high",
      "synced_to_linear": true,
      "created_at": "2024-11-09T10:30:00Z"
    }
  ]
}
```

### 3. Get Issue Details (Customer)
```http
GET /client/issues/{issue_id}/
Authorization: Token {user_token}

Response: 200 OK
{
  "id": 42,
  "issue_number": "ISS-2024-0042",
  "title": "Payment processing issue",
  "description": "Full description here...",
  "status": "in_progress",
  "priority": "high",
  "category": "billing",
  "assigned_to_name": "Jane Smith",
  "resolved_at": null,
  "resolution_notes": null,
  "synced_to_linear": true,
  "linear_issue_url": "https://linear.app/team/ISS-123",
  "created_at": "2024-11-09T10:30:00Z",
  "updated_at": "2024-11-09T11:15:00Z"
}
```

### 4. Add Comment (Customer)
```http
POST /client/issues/{issue_id}/comment/
Authorization: Token {user_token}
Content-Type: application/json

Request Body:
{
  "comment": "I'm still experiencing this issue. Can you help?"
}

Response: 200 OK
{
  "message": "Comment added successfully",
  "issue": { /* updated issue object */ }
}
```

---

## Vendor/Employee Endpoints

### 5. Get All Issues (Vendor/Employee Only)
```http
GET /issues/
Authorization: Token {user_token}

Query Parameters (optional):
- status: open | in_progress | resolved | closed
- priority: urgent | high | medium | low
- is_client_issue: true | false

Examples:
GET /issues/?status=open
GET /issues/?priority=urgent
GET /issues/?status=in_progress&priority=high
GET /issues/?is_client_issue=true

Response: 200 OK
{
  "count": 12,
  "results": [
    {
      "id": 42,
      "issue_number": "ISS-2024-0042",
      "title": "Payment processing issue",
      "status": "open",
      "priority": "high",
      "raised_by_customer_name": "John Doe",
      "assigned_to_name": null,
      "synced_to_linear": true,
      "created_at": "2024-11-09T10:30:00Z"
    }
  ]
}
```

### 6. Get Issue Details (Vendor/Employee)
```http
GET /issues/{issue_id}/
Authorization: Token {user_token}

Response: 200 OK
{
  "id": 42,
  "issue_number": "ISS-2024-0042",
  "title": "Payment processing issue",
  "description": "Full description here...",
  "status": "open",
  "priority": "high",
  "raised_by_customer_id": 10,
  "raised_by_customer_name": "John Doe",
  "assigned_to_name": null,
  "created_at": "2024-11-09T10:30:00Z"
}
```

### 7. Update Issue Status (Vendor/Employee)
```http
PATCH /issues/{issue_id}/
Authorization: Token {user_token}
Content-Type: application/json

Request Body:
{
  "status": "in_progress"
}

Valid Status Values:
- "open"
- "in_progress"
- "resolved"
- "closed"

Response: 200 OK
{
  "id": 42,
  "status": "in_progress",
  "updated_at": "2024-11-09T12:00:00Z"
}
```

### 8. Update Issue Priority (Vendor/Employee)
```http
PATCH /issues/{issue_id}/
Authorization: Token {user_token}
Content-Type: application/json

Request Body:
{
  "priority": "urgent"
}

Valid Priority Values:
- "urgent"
- "high"
- "medium"
- "low"

Response: 200 OK
{
  "id": 42,
  "priority": "urgent",
  "updated_at": "2024-11-09T12:05:00Z"
}
```

### 9. Assign Issue (Vendor/Employee)
```http
PATCH /issues/{issue_id}/
Authorization: Token {user_token}
Content-Type: application/json

Request Body:
{
  "assigned_to": 25
}

Response: 200 OK
{
  "id": 42,
  "assigned_to": 25,
  "assigned_to_name": "Jane Smith",
  "updated_at": "2024-11-09T12:10:00Z"
}
```

### 10. Resolve Issue (Vendor/Employee)
```http
POST /issues/resolve/{issue_id}/
Authorization: Token {user_token}
Content-Type: application/json

Request Body:
{
  "resolution_notes": "Fixed payment gateway configuration. Issue resolved."
}

Response: 200 OK
{
  "id": 42,
  "status": "resolved",
  "resolved_at": "2024-11-09T12:30:00Z",
  "resolved_by": 25,
  "resolved_by_name": "Jane Smith",
  "resolution_notes": "Fixed payment gateway configuration. Issue resolved."
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Bad Request",
  "details": "title is required"
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "details": "Authentication credentials were not provided"
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden",
  "details": "Only customers can create issues"
}
```

### 404 Not Found
```json
{
  "error": "Not Found",
  "details": "Issue with ID 999 not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal Server Error",
  "details": "Failed to sync with Linear: Connection timeout"
}
```

---

## Testing with cURL

### Create Issue (Customer)
```bash
curl -X POST http://localhost:8000/api/client/issues/raise/ \
  -H "Authorization: Token YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "organization": 1,
    "title": "Test Issue",
    "description": "Testing issue creation",
    "priority": "medium",
    "category": "general"
  }'
```

### Get All Issues (Vendor)
```bash
curl -X GET http://localhost:8000/api/issues/?status=open \
  -H "Authorization: Token YOUR_TOKEN_HERE"
```

### Update Status (Vendor)
```bash
curl -X PATCH http://localhost:8000/api/issues/42/ \
  -H "Authorization: Token YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"status": "in_progress"}'
```

### Resolve Issue (Vendor)
```bash
curl -X POST http://localhost:8000/api/issues/resolve/42/ \
  -H "Authorization: Token YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"resolution_notes": "Issue fixed successfully"}'
```

---

## Rate Limiting

All endpoints are rate limited to:
- **60 requests per minute** per user
- **1000 requests per hour** per user

Rate limit headers in response:
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1699520400
```

---

## Common Use Cases

### Customer Reports Bug
```kotlin
val result = repository.createIssue(
    organizationId = 1,
    title = "App crashes on payment",
    description = "The app crashes when I try to make a payment...",
    priority = "high",
    category = "technical"
)
```

### Vendor Filters Urgent Issues
```kotlin
repository.getAllIssues(
    status = "open",
    priority = "urgent",
    isClientIssue = true
).collect { issues ->
    // Handle urgent open issues
}
```

### Vendor Resolves Issue
```kotlin
viewModel.resolveIssue(
    issueId = 42,
    resolutionNotes = "Fixed the payment gateway timeout issue"
)
```

---

## Linear Integration Notes

When an issue is created:
1. Backend creates issue in database
2. Backend calls Linear API to create issue
3. Linear issue ID and URL stored in database
4. Response includes both CRM and Linear data

When vendor updates:
- Status changes sync to Linear
- Priority updates sync to Linear
- Comments can be synced (optional)

Linear webhooks (optional):
- Listen for Linear updates
- Sync changes back to CRM
- Keep statuses in sync

