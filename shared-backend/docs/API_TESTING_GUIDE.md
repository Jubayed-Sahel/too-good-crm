# API Testing Guide - Without Frontend

## 🎯 Multiple Ways to Test Backend Endpoints

---

## Method 1: Python Test Scripts ✅ RECOMMENDED

### Quick Start
```bash
cd shared-backend

# Make sure server is running
python manage.py runserver

# In another terminal, run test script
python test_issues_api.py
```

### Available Test Scripts
1. **`test_auth.py`** - Test authentication (login, signup, logout)
2. **`test_issues_api.py`** - Test issue management endpoints (NEW!)
3. **`show_data.py`** - View database contents

---

## Method 2: Django Admin Panel ✅ EASY

### Access Admin Interface
```
URL: http://localhost:8000/admin
Username: john.doe@demo.com
Password: demo1234
```

### What You Can Do:
- ✅ View all issues
- ✅ Create new issues manually
- ✅ Edit existing issues
- ✅ Delete issues
- ✅ See all database tables
- ✅ Test relationships (vendor, order, etc.)

**Pros:** Visual interface, no coding
**Cons:** Limited to basic CRUD, no custom actions testing

---

## Method 3: cURL Commands ✅ TERMINAL-BASED

### 1. Login First (Get Token)
```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john.doe@demo.com",
    "password": "demo1234"
  }'
```

**Response:**
```json
{
  "token": "abc123def456...",
  "user": {...},
  "message": "Login successful"
}
```

### 2. List Issues
```bash
curl -X GET http://localhost:8000/api/issues/ \
  -H "Authorization: Token YOUR_TOKEN_HERE"
```

### 3. Create Issue
```bash
curl -X POST http://localhost:8000/api/issues/ \
  -H "Authorization: Token YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Issue",
    "description": "Testing via cURL",
    "priority": "high",
    "category": "quality",
    "status": "open"
  }'
```

### 4. Get Issue Detail
```bash
curl -X GET http://localhost:8000/api/issues/1/ \
  -H "Authorization: Token YOUR_TOKEN_HERE"
```

### 5. Update Issue
```bash
curl -X PUT http://localhost:8000/api/issues/1/ \
  -H "Authorization: Token YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Title",
    "priority": "critical",
    "status": "in_progress"
  }'
```

### 6. Resolve Issue (Custom Action)
```bash
curl -X POST http://localhost:8000/api/issues/1/resolve/ \
  -H "Authorization: Token YOUR_TOKEN_HERE"
```

### 7. Get Statistics
```bash
curl -X GET http://localhost:8000/api/issues/stats/ \
  -H "Authorization: Token YOUR_TOKEN_HERE"
```

### 8. Filter Issues
```bash
# By priority
curl -X GET "http://localhost:8000/api/issues/?priority=high" \
  -H "Authorization: Token YOUR_TOKEN_HERE"

# By status
curl -X GET "http://localhost:8000/api/issues/?status=open" \
  -H "Authorization: Token YOUR_TOKEN_HERE"

# Search
curl -X GET "http://localhost:8000/api/issues/?search=quality" \
  -H "Authorization: Token YOUR_TOKEN_HERE"
```

### 9. Delete Issue
```bash
curl -X DELETE http://localhost:8000/api/issues/1/ \
  -H "Authorization: Token YOUR_TOKEN_HERE"
```

---

## Method 4: Postman/Insomnia ✅ GUI TOOL

### Setup Postman

1. **Create Collection:** "Too Good CRM API"

2. **Set Base URL Variable:**
   - Variable: `base_url`
   - Value: `http://localhost:8000/api`

3. **Create Login Request:**
   ```
   POST {{base_url}}/auth/login/
   Body (JSON):
   {
     "username": "john.doe@demo.com",
     "password": "demo1234"
   }
   ```

4. **Extract Token:**
   - Go to "Tests" tab in login request
   - Add script:
   ```javascript
   var jsonData = pm.response.json();
   pm.environment.set("token", jsonData.token);
   ```

5. **Create Authorization Header:**
   - In Collection settings → Authorization
   - Type: API Key
   - Key: `Authorization`
   - Value: `Token {{token}}`

6. **Create Issue Requests:**

   **List Issues:**
   ```
   GET {{base_url}}/issues/
   ```

   **Create Issue:**
   ```
   POST {{base_url}}/issues/
   Body (JSON):
   {
     "title": "Postman Test Issue",
     "priority": "high",
     "category": "quality",
     "status": "open"
   }
   ```

   **Get Issue:**
   ```
   GET {{base_url}}/issues/1/
   ```

   **Update Issue:**
   ```
   PUT {{base_url}}/issues/1/
   Body (JSON):
   {
     "status": "in_progress"
   }
   ```

   **Resolve Issue:**
   ```
   POST {{base_url}}/issues/1/resolve/
   ```

---

## Method 5: PowerShell (Invoke-RestMethod) ✅ WINDOWS

### 1. Login
```powershell
$loginData = @{
    username = "john.doe@demo.com"
    password = "demo1234"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:8000/api/auth/login/" `
    -Method Post `
    -Body $loginData `
    -ContentType "application/json"

$token = $response.token
Write-Host "Token: $token"
```

### 2. Create Headers
```powershell
$headers = @{
    "Authorization" = "Token $token"
    "Content-Type" = "application/json"
}
```

### 3. List Issues
```powershell
$issues = Invoke-RestMethod -Uri "http://localhost:8000/api/issues/" `
    -Method Get `
    -Headers $headers

$issues.results | Format-Table issue_number, title, priority, status
```

### 4. Create Issue
```powershell
$issueData = @{
    title = "PowerShell Test Issue"
    description = "Created from PowerShell"
    priority = "high"
    category = "quality"
    status = "open"
} | ConvertTo-Json

$newIssue = Invoke-RestMethod -Uri "http://localhost:8000/api/issues/" `
    -Method Post `
    -Headers $headers `
    -Body $issueData

Write-Host "Created issue: $($newIssue.issue_number)"
```

### 5. Get Statistics
```powershell
$stats = Invoke-RestMethod -Uri "http://localhost:8000/api/issues/stats/" `
    -Method Get `
    -Headers $headers

Write-Host "Total Issues: $($stats.total)"
$stats.by_status | Format-List
```

---

## Method 6: Django Shell ✅ DIRECT DATABASE

### Access Django Shell
```bash
cd shared-backend
python manage.py shell
```

### Test Models Directly
```python
from crmApp.models import Issue, Organization, User

# Get organization
org = Organization.objects.first()

# Create issue
issue = Issue.objects.create(
    organization=org,
    title="Shell Test Issue",
    description="Created from Django shell",
    priority="high",
    category="quality",
    status="open",
    created_by=User.objects.first()
)

print(f"Created: {issue.issue_number}")

# List all issues
for issue in Issue.objects.all():
    print(f"{issue.issue_number}: {issue.title} - {issue.status}")

# Filter issues
high_priority = Issue.objects.filter(priority="high")
print(f"High priority issues: {high_priority.count()}")

# Get statistics
from django.db.models import Count
stats = Issue.objects.values('status').annotate(count=Count('id'))
for stat in stats:
    print(f"{stat['status']}: {stat['count']}")
```

---

## Method 7: Browser (for GET requests only) ✅ QUICK VIEW

### Direct URLs (after login via admin)
```
http://localhost:8000/api/issues/
http://localhost:8000/api/issues/1/
http://localhost:8000/api/issues/stats/
http://localhost:8000/api/customers/
http://localhost:8000/api/deals/
```

**Note:** This only works for GET requests. Browser shows DRF's browsable API.

---

## 🎯 Recommended Workflow

### For Quick Testing:
1. **Python Script** (`test_issues_api.py`) - Comprehensive automated testing
2. **Django Admin** - Visual verification of data

### For Development:
1. **Postman/Insomnia** - Save and organize requests
2. **Python Script** - Automated regression testing

### For Debugging:
1. **Django Shell** - Direct database access
2. **cURL** - Test specific edge cases

---

## 📝 Testing Checklist for Issues API

- [ ] **Authentication**
  - [ ] Login with email
  - [ ] Login with username
  - [ ] Token works in headers
  - [ ] Invalid token rejected

- [ ] **List Issues**
  - [ ] GET /api/issues/ works
  - [ ] Pagination works
  - [ ] Returns correct fields
  - [ ] Filter by priority works
  - [ ] Filter by status works
  - [ ] Filter by category works
  - [ ] Search works

- [ ] **Create Issue**
  - [ ] POST /api/issues/ creates issue
  - [ ] Auto-generates issue_number
  - [ ] Sets organization automatically
  - [ ] Sets created_by automatically
  - [ ] Validates required fields
  - [ ] Returns created issue data

- [ ] **Get Issue Detail**
  - [ ] GET /api/issues/{id}/ works
  - [ ] Returns full issue data
  - [ ] Includes vendor info if set
  - [ ] Includes order info if set
  - [ ] Returns 404 for invalid ID

- [ ] **Update Issue**
  - [ ] PUT /api/issues/{id}/ updates
  - [ ] Partial update works
  - [ ] Validates data
  - [ ] Returns updated issue

- [ ] **Custom Actions**
  - [ ] POST /api/issues/{id}/resolve/ works
  - [ ] Sets status to 'resolved'
  - [ ] Sets resolved_by to current user
  - [ ] POST /api/issues/{id}/reopen/ works
  - [ ] Clears resolved_by

- [ ] **Statistics**
  - [ ] GET /api/issues/stats/ works
  - [ ] Returns counts by status
  - [ ] Returns counts by priority
  - [ ] Returns counts by category
  - [ ] Shows total count

- [ ] **Delete Issue**
  - [ ] DELETE /api/issues/{id}/ works
  - [ ] Returns 204 No Content
  - [ ] Actually removes from database

---

## 🔧 Troubleshooting

### Server Not Running
```bash
cd shared-backend
python manage.py runserver
```

### Database Not Migrated
```bash
python manage.py migrate
```

### No Test Data
```bash
python seed_data.py
```

### Token Authentication Failing
```bash
# Check if token is in database
python manage.py shell
>>> from rest_framework.authtoken.models import Token
>>> Token.objects.all()
```

### CORS Errors (if testing from browser)
Check `crmAdmin/settings.py`:
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
```

---

## 📊 Example Test Output

When you run `python test_issues_api.py`:

```
============================================================
🔐 LOGGING IN
============================================================
Status: 200
✅ Login successful!
Token: abc123def456...
User: john.doe@demo.com

============================================================
📋 LIST ISSUES
============================================================
Status: 200
✅ Found 5 issues

Issues:
  • [ISS-2025-0001] Defective product batch
    Priority: high | Status: open
  • [ISS-2025-0002] Late delivery
    Priority: medium | Status: in_progress
  ...

============================================================
➕ CREATE ISSUE
============================================================
Creating issue with data:
{
  "title": "Test Quality Issue - API Test",
  "description": "This is a test issue created via API testing script",
  "priority": "high",
  "category": "quality",
  "status": "open"
}

Status: 201
✅ Issue created successfully!
Issue ID: 6
Issue Number: ISS-2025-0006
Created at: 2025-11-07T12:34:56.789Z

============================================================
✅ ALL TESTS COMPLETED!
============================================================
```

---

## 🎓 Learning Resources

- **Django REST Framework Docs:** https://www.django-rest-framework.org/
- **Postman Learning:** https://learning.postman.com/
- **cURL Tutorial:** https://curl.se/docs/manual.html
- **Python Requests:** https://requests.readthedocs.io/

---

**Last Updated:** November 7, 2025
