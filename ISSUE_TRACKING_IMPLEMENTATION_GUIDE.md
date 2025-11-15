# Issue Tracking System with Linear Integration - Complete Implementation Guide

## 🎯 System Overview

Your issue tracking system is **ALREADY FULLY IMPLEMENTED** with Linear integration! Here's how it works:

### Customer Flow:
1. Customer raises issue about an organization/vendor
2. Issue automatically synced to Linear
3. Customer can view their issue status
4. Customer receives updates when vendor updates status

### Vendor/Employee Flow:
1. Vendor sees all issues raised by customers for their organization
2. Vendor can update issue status, assign to employees, resolve issues
3. Status updates automatically sync to Linear
4. Vendors can also fetch issues from Linear

---

## 📋 API Endpoints Reference

### **For Customers** (Client Users)

#### 1. Raise an Issue
```http
POST /api/client/issues/raise/
Authorization: Token {your_token}
Content-Type: application/json

{
    "organization": 1,                    // Required: ID of the organization
    "title": "Product quality issue",     // Required
    "description": "Detailed description", // Required
    "priority": "high",                   // Optional: low|medium|high|urgent
    "category": "quality",                // Optional: general|delivery|quality|billing|communication|technical|other
    "vendor": 5,                          // Optional: specific vendor ID
    "order": 10                           // Optional: related order ID
}
```

**Response:**
```json
{
    "message": "Issue raised successfully and synced to Linear",
    "issue": {
        "id": 123,
        "issue_number": "ISS-2025-0001",
        "title": "Product quality issue",
        "description": "Detailed description",
        "status": "open",
        "priority": "high",
        "category": "quality",
        "organization_name": "Demo Company",
        "synced_to_linear": true,
        "linear_issue_url": "https://linear.app/too-good-crm/issue/TOO-123",
        "created_at": "2025-11-15T10:30:00Z"
    },
    "linear_data": {
        "id": "abc123",
        "identifier": "TOO-123",
        "url": "https://linear.app/too-good-crm/issue/TOO-123",
        "title": "Product quality issue",
        "state": "Todo"
    }
}
```

#### 2. View My Issues
```http
GET /api/issues/
Authorization: Token {your_token}
```

**Response:** List of all issues raised by this customer

#### 3. View Specific Issue Details
```http
GET /api/client/issues/{issue_id}/
Authorization: Token {your_token}
```

#### 4. Add Comment to Issue
```http
POST /api/client/issues/{issue_id}/comment/
Authorization: Token {your_token}
Content-Type: application/json

{
    "comment": "Any updates on this issue?"
}
```

---

### **For Vendors/Employees**

#### 1. View All Issues in Organization
```http
GET /api/issues/
Authorization: Token {your_token}
```

**Query Parameters:**
- `status=open` - Filter by status (open|in_progress|resolved|closed)
- `priority=high` - Filter by priority (low|medium|high|urgent)
- `is_client_issue=true` - Show only client-raised issues
- `category=quality` - Filter by category
- `assigned_to=5` - Filter by assigned employee

**Response:**
```json
{
    "count": 25,
    "next": "http://api.com/api/issues/?page=2",
    "previous": null,
    "results": [
        {
            "id": 123,
            "issue_number": "ISS-2025-0001",
            "title": "Product quality issue",
            "description": "...",
            "status": "open",
            "priority": "high",
            "category": "quality",
            "is_client_issue": true,
            "raised_by_customer_name": "John Doe",
            "raised_by_customer_email": "john@example.com",
            "organization_name": "Demo Company",
            "assigned_to_name": null,
            "synced_to_linear": true,
            "linear_issue_url": "https://linear.app/...",
            "created_at": "2025-11-15T10:30:00Z"
        }
    ]
}
```

#### 2. Update Issue Status
```http
PATCH /api/issues/{id}/
Authorization: Token {your_token}
Content-Type: application/json

{
    "status": "in_progress"  // open|in_progress|resolved|closed
}
```

**Automatically syncs to Linear!**

#### 3. Resolve Issue
```http
POST /api/issues/{id}/resolve/
Authorization: Token {your_token}
Content-Type: application/json

{
    "resolution_notes": "Issue fixed, customer satisfied"
}
```

**Response:**
```json
{
    "message": "Issue resolved successfully and synced to Linear",
    "issue": {...},
    "previous_status": "in_progress",
    "linear_synced": true
}
```

#### 4. Assign Issue to Employee
```http
POST /api/issues/{id}/assign/
Authorization: Token {your_token}
Content-Type: application/json

{
    "employee_id": 5
}
```

#### 5. Reopen Resolved Issue
```http
POST /api/issues/{id}/reopen/
Authorization: Token {your_token}
```

#### 6. Manually Sync to Linear
```http
POST /api/issues/{id}/sync_to_linear/
Authorization: Token {your_token}
```

#### 7. Fetch Issues from Linear
```http
GET /api/issues/fetch_from_linear/
Authorization: Token {your_token}
```

**Query Parameters:**
- `limit=50` - Number of issues to fetch (default: 50)
- `sync=true` - Automatically sync to CRM (default: false)

**Response:**
```json
{
    "message": "Fetched 10 issues from Linear, synced 10 to CRM",
    "linear_issues": [...],
    "synced_issues": [
        {
            "linear_id": "abc123",
            "issue_id": 456,
            "issue_number": "ISS-2025-0010",
            "action": "created"
        }
    ],
    "organization": {
        "id": 1,
        "name": "Demo Company",
        "linear_team_id": "b95250db-8430-4dbc-88f8-9fc109369df0"
    }
}
```

#### 8. Get Issue Statistics
```http
GET /api/issues/stats/
Authorization: Token {your_token}
```

**Response:**
```json
{
    "total": 45,
    "by_status": {
        "open": 10,
        "in_progress": 15,
        "resolved": 18,
        "closed": 2
    },
    "by_priority": {
        "low": 5,
        "medium": 20,
        "high": 15,
        "critical": 5
    },
    "by_source": {
        "client_raised": 30,
        "internal": 15
    },
    "linear_sync": {
        "synced": 40,
        "not_synced": 5
    }
}
```

---

## 🔗 Linear Integration Features

### Automatic Syncing:
1. **When Customer Raises Issue** → Automatically creates in Linear
2. **When Vendor Updates Status** → Automatically updates Linear
3. **When Issue Resolved** → Marks as Done in Linear
4. **When Issue Reopened** → Moves back to In Progress in Linear

### Status Mapping (CRM ↔ Linear):
| CRM Status | Linear State |
|-----------|--------------|
| open | Todo / Backlog |
| in_progress | In Progress |
| resolved | Done / Completed |
| closed | Canceled / Closed |

### Priority Mapping:
| CRM Priority | Linear Priority |
|--------------|-----------------|
| low | 4 (Low) |
| medium | 3 (Medium) |
| high | 2 (High) |
| urgent | 1 (Urgent) |

### Bi-Directional Sync:
- ✅ CRM → Linear: Automatic on create/update
- ✅ Linear → CRM: Manual fetch or webhook-triggered

---

## 🗄️ Database Fields

### Issue Model Fields:
```python
# Basic Info
- id
- issue_number            # Auto-generated: ISS-YYYY-NNNN
- title
- description
- organization            # FK to Organization
- created_at
- updated_at

# Classification
- status                  # open|in_progress|resolved|closed
- priority                # low|medium|high|urgent
- category                # general|delivery|quality|billing|communication|technical|other

# Relationships
- vendor                  # FK to Vendor (optional)
- order                   # FK to Order (optional)
- assigned_to             # FK to Employee (optional)
- created_by              # FK to User (who created)

# Client Issue Tracking
- is_client_issue         # Boolean: True if raised by customer
- raised_by_customer      # FK to Customer (for client issues)

# Resolution Tracking
- resolved_at             # DateTime
- resolved_by             # FK to Employee
- resolution_notes        # Text

# Linear Integration
- linear_issue_id         # Linear issue ID
- linear_issue_url        # Linear issue URL
- linear_team_id          # Linear team ID
- synced_to_linear        # Boolean
- last_synced_at          # DateTime
```

---

## 🔐 Permissions & Access Control

### Customer Permissions:
- ✅ Can raise issues
- ✅ Can view their own issues
- ✅ Can add comments to their issues
- ❌ Cannot update issue status
- ❌ Cannot assign issues
- ❌ Cannot resolve issues
- ❌ Cannot access other customers' issues

### Vendor/Employee Permissions:
- ✅ Can view all issues in their organization
- ✅ Can update issue status
- ✅ Can assign issues to employees
- ✅ Can resolve issues
- ✅ Can reopen issues
- ✅ Can sync to/from Linear
- ✅ Can see client-raised issues
- ❌ Cannot raise new issues (only customers can)
- ❌ Cannot access issues from other organizations

---

## 📊 How to Test the System

### 1. **Setup Linear Team ID** (Required for auto-sync)

Update your organization with Linear team ID:
```python
from crmApp.models import Organization
org = Organization.objects.get(id=YOUR_ORG_ID)
org.linear_team_id = "b95250db-8430-4dbc-88f8-9fc109369df0"  # Your Linear team ID
org.save()
```

Or via API:
```http
PATCH /api/organizations/{id}/
Authorization: Token {token}
Content-Type: application/json

{
    "linear_team_id": "b95250db-8430-4dbc-88f8-9fc109369df0"
}
```

### 2. **Test Customer Raising Issue**

Login as customer (testuser/test123456):
```bash
curl -X POST http://127.0.0.1:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"test123456"}'

# Save the token from response
```

Raise an issue:
```bash
curl -X POST http://127.0.0.1:8000/api/client/issues/raise/ \
  -H "Authorization: Token YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "organization": 5,
    "title": "Test Issue from API",
    "description": "Testing the issue tracking system",
    "priority": "high",
    "category": "quality"
  }'
```

### 3. **Test Vendor Viewing Issues**

Login as vendor (sahel or testuser - they have vendor profiles):
```bash
curl -X GET http://127.0.0.1:8000/api/issues/ \
  -H "Authorization: Token YOUR_VENDOR_TOKEN"
```

Filter for client issues only:
```bash
curl -X GET "http://127.0.0.1:8000/api/issues/?is_client_issue=true" \
  -H "Authorization: Token YOUR_VENDOR_TOKEN"
```

### 4. **Test Updating Issue Status**

```bash
curl -X PATCH http://127.0.0.1:8000/api/issues/123/ \
  -H "Authorization: Token YOUR_VENDOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"in_progress"}'
```

### 5. **Test Resolving Issue**

```bash
curl -X POST http://127.0.0.1:8000/api/issues/123/resolve/ \
  -H "Authorization: Token YOUR_VENDOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"resolution_notes":"Fixed the quality issue"}'
```

### 6. **Check Linear**

Go to your Linear workspace:
- You should see the issue appear automatically
- Status updates should reflect in real-time

---

## 🔧 Configuration Required

### 1. **Linear API Key** (Already configured)
Located in: `shared-backend/.env`
```
LINEAR_API_KEY=lin_api_xxx...
```

### 2. **Linear Team ID** (Set per organization)
Each organization needs their Linear team ID configured:
```python
Organization.linear_team_id = "b95250db-8430-4dbc-88f8-9fc109369df0"
```

To find your Linear Team ID:
```bash
curl -X POST https://api.linear.app/graphql \
  -H "Authorization: YOUR_LINEAR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query":"{ teams { nodes { id name } } }"}'
```

---

## 📱 Frontend Integration

### Customer Page (Raise Issues):
```typescript
// Raise Issue
const raiseIssue = async (data: IssueData) => {
  const response = await fetch('/api/client/issues/raise/', {
    method: 'POST',
    headers: {
      'Authorization': `Token ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      organization: organizationId,
      title: data.title,
      description: data.description,
      priority: data.priority,
      category: data.category
    })
  });
  return response.json();
};

// View My Issues
const getMyIssues = async () => {
  const response = await fetch('/api/issues/', {
    headers: {
      'Authorization': `Token ${token}`
    }
  });
  return response.json();
};
```

### Vendor Page (Manage Issues):
```typescript
// Get All Issues (with filters)
const getIssues = async (filters?: {
  status?: string;
  priority?: string;
  is_client_issue?: boolean;
}) => {
  const params = new URLSearchParams(filters as any);
  const response = await fetch(`/api/issues/?${params}`, {
    headers: {
      'Authorization': `Token ${token}`
    }
  });
  return response.json();
};

// Update Issue Status
const updateStatus = async (issueId: number, status: string) => {
  const response = await fetch(`/api/issues/${issueId}/`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Token ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ status })
  });
  return response.json();
};

// Resolve Issue
const resolveIssue = async (issueId: number, notes: string) => {
  const response = await fetch(`/api/issues/${issueId}/resolve/`, {
    method: 'POST',
    headers: {
      'Authorization': `Token ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ resolution_notes: notes })
  });
  return response.json();
};

// Assign Issue
const assignIssue = async (issueId: number, employeeId: number) => {
  const response = await fetch(`/api/issues/${issueId}/assign/`, {
    method: 'POST',
    headers: {
      'Authorization': `Token ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ employee_id: employeeId })
  });
  return response.json();
};
```

---

## ✅ System Status

### Backend:
- ✅ Issue Model with all fields
- ✅ Customer raise issue endpoint
- ✅ Vendor view/update endpoints
- ✅ Linear auto-sync on create
- ✅ Linear auto-sync on status update
- ✅ Bi-directional sync
- ✅ Permission system
- ✅ Organization filtering
- ✅ Issue statistics
- ✅ Fetch from Linear
- ✅ Bulk sync support
- ✅ Webhook integration ready

### Linear Integration:
- ✅ API configured
- ✅ Auto-create on raise
- ✅ Auto-update on status change
- ✅ Status mapping
- ✅ Priority mapping
- ✅ Fetch issues from Linear
- ✅ Sync to CRM
- ✅ Webhook support

### Access Control:
- ✅ Customer can only see their issues
- ✅ Vendor sees all org issues
- ✅ Permission checks implemented
- ✅ Organization isolation

---

## 🚀 Next Steps

1. **Test the system:**
   ```bash
   cd shared-backend
   python manage.py runserver
   ```

2. **Ensure Linear team ID is set:**
   ```python
   # In Django shell
   from crmApp.models import Organization
   org = Organization.objects.get(id=5)  # testuser's org
   org.linear_team_id = "YOUR_TEAM_ID"
   org.save()
   ```

3. **Test customer raising issue:**
   - Login as testuser
   - POST to `/api/client/issues/raise/`
   - Check Linear for the issue

4. **Test vendor managing issue:**
   - Login as vendor (sahel or testuser in vendor mode)
   - GET `/api/issues/` to see all issues
   - PATCH to update status
   - POST to resolve

**The system is FULLY FUNCTIONAL and ready to use!** 🎉

---

*Last Updated: November 15, 2025*
*System Version: 1.0 - Production Ready*
