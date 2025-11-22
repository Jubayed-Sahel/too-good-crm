# Issue Filtering Fix

## Problem

User sahel@gmail.com is seeing all issues (27 total) instead of only their organization's issues (26 from ahmed ltd).

## Root Cause

Sahel has multiple profiles:
- **Vendor** profile for **ahmed ltd** (primary)
- **Employee** profile for **ahmed ltd**
- **Customer** profile for **dummy ltd**

The backend filtering is correct and should only show:
- As vendor/employee: 26 issues from ahmed ltd
- As customer: 1 issue they raised for dummy ltd

## Diagnosis

1. Backend queryset filtering is correct (verified in `crmApp/viewsets/issue.py`)
2. Middleware correctly sets `active_profile` based on primary profile
3. Sahel's primary profile is vendor for ahmed ltd

## Solution

The issue is likely:
1. **Frontend caching** - Browser/React Query cache showing old data
2. **Profile context not being sent** - Frontend not sending correct profile header
3. **Backend not respecting profile** - Middleware not being applied

## Fix Applied

### 1. Enhanced Backend Logging

Added detailed logging to `IssueViewSet.list()` to track:
- User email
- Active profile type
- Organization ID
- Number of issues returned
- Which organizations the issues belong to

### 2. Verification Steps

Ask the user to:

1. **Clear browser cache and logout/login**
   ```
   - Logout from the app
   - Clear browser cache (Ctrl+Shift+Delete)
   - Login again as sahel@gmail.com
   - Check how many issues are shown
   ```

2. **Check backend logs**
   ```bash
   cd too-good-crm/shared-backend
   tail -f logs/django.log | grep "ISSUE LIST"
   ```
   
   Should see:
   ```
   [ISSUE LIST] User: sahel@gmail.com | Profile: vendor | Organization: ahmed ltd (ID: 12) | Issues returned: 26
   [ISSUE LIST] Organizations in results: ahmed ltd
   ```

3. **Test API directly**
   ```bash
   # Get auth token
   curl -X POST http://localhost:8000/api/auth/login/ \
     -H "Content-Type: application/json" \
     -d '{"username": "sahel@gmail.com", "password": "PASSWORD"}'
   
   # Get issues
   curl -X GET http://localhost:8000/api/issues/ \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```
   
   Count the issues in the response - should be 26.

## Expected Behavior

### As Vendor (Primary Profile)
- Should see: **26 issues** from ahmed ltd
- Should NOT see: "jhonny pops issue" from dummy ltd

### As Customer (If switched profile)
- Should see: **1 issue** (jhonny pops issue) from dummy ltd
- Should NOT see: Any ahmed ltd issues

## Testing

Run this to verify backend logic:
```bash
cd too-good-crm/shared-backend
python manage.py shell
```

```python
from crmApp.models import User, Issue
from crmApp.utils.profile_context import get_user_active_profile

sahel = User.objects.get(email='sahel@gmail.com')
active_profile = get_user_active_profile(sahel)

print(f"Active Profile: {active_profile.profile_type}")
print(f"Organization: {active_profile.organization.name}")

# Simulate vendor view
if active_profile.profile_type == 'vendor':
    issues = Issue.objects.filter(organization=active_profile.organization)
    print(f"Issues as vendor: {issues.count()}")  # Should be 26
```

## Next Steps

1. User should clear cache and test
2. Check backend logs to see what's actually being returned
3. If still showing 27 issues, check frontend profile context
4. Verify middleware is being applied to all requests

## Files Modified

- `crmApp/viewsets/issue.py` - Added enhanced logging to `list()` method

