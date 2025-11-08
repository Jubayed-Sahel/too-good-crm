# Testing Guide: Client-Raised Issues System

## Prerequisites
- Backend server running: `http://127.0.0.1:8000/`
- Frontend server running
- Test accounts with different roles (Customer, Vendor, Employee)

## Test Scenario 1: Client Raises an Issue

### Steps:
1. **Login as Customer**
   - Navigate to login page
   - Use customer credentials

2. **Navigate to Issues Page**
   - Click "Issues" in sidebar
   - URL: `/client/issues`

3. **Raise a New Issue**
   - Click "Raise Issue" button (replaces "Create Issue")
   - Modal opens: "Raise Issue"

4. **Fill the Form**
   - Select an **Organization** from dropdown (required)
   - Enter **Title**: "Payment not received" (required)
   - Enter **Description**: "Invoice #1234 payment is pending for 30 days" (required)
   - Select **Priority**: "High" (required)
   - Select **Category**: "Payment" (required)
   - Optionally select **Vendor** (if applicable)
   - Optionally select **Related Order**

5. **Submit**
   - Click "Raise Issue"
   - Toast notification: "Issue Raised"
   - Modal closes
   - Issue appears in table

6. **Verify Issue**
   - Issue appears with status "OPEN"
   - Shows in client's issues table
   - Client can view details but NOT resolve it

### Expected Results:
✅ Issue created successfully
✅ Issue marked as `is_client_issue=true`
✅ `raised_by_customer` set to current customer
✅ Toast notification shown
✅ Issue appears in table immediately

## Test Scenario 2: Vendor Sees Client Issue

### Steps:
1. **Logout and Login as Vendor**
   - Use vendor account from the organization selected in Scenario 1

2. **Navigate to Issues Page**
   - Click "Issues" in sidebar
   - URL: `/issues`

3. **View Issues Table**
   - Look for the issue raised by client
   - Check the "Source" column

4. **Identify Client Issue**
   - Issue shows **purple "Client" badge**
   - Customer name displayed below badge (e.g., "John Doe")
   - Can see all issue details

5. **Resolve the Issue**
   - Click the checkmark icon (Resolve)
   - Status changes to "RESOLVED"

### Expected Results:
✅ Vendor sees both client and internal issues
✅ Client issues clearly marked with "Client" badge
✅ Customer name displayed
✅ Vendor can resolve client issues
✅ Status updates reflected immediately

## Test Scenario 3: Employee Access

### Steps:
1. **Login as Employee**
   - Use employee account from same organization

2. **Check Access**
   - Navigate to `/issues`
   - Should see same issues as vendor

3. **Verify Permissions**
   - Can view client-raised issues
   - Can resolve issues (if has permission)
   - Can view Linear sync status

### Expected Results:
✅ Employee sees organization's issues
✅ Access matches vendor access
✅ Role-based filtering works correctly

## Test Scenario 4: Client Views Status Update

### Steps:
1. **Login Back as Customer**
   - Same customer from Scenario 1

2. **Navigate to Issues**
   - Go to `/client/issues`

3. **Check Issue Status**
   - Find the previously raised issue
   - Status should show "RESOLVED" (updated by vendor)

4. **View Issue Details**
   - Click view icon
   - Check full details

### Expected Results:
✅ Status updated to "RESOLVED"
✅ Client can see the change
✅ Client still cannot resolve/unresolve
✅ Only view and delete available

## Test Scenario 5: Issue Source Filtering

### Steps:
1. **Login as Vendor**

2. **Navigate to Issues**
   - URL: `/issues`

3. **Create Internal Issue**
   - Click "Create Issue" or use existing internal issues
   - These should show "Internal" badge (gray)

4. **Compare Issues**
   - Client-raised: Purple "Client" badge + customer name
   - Internal: Gray "Internal" badge (subtle)

5. **Verify Stats**
   - Check issue statistics
   - Should show breakdown:
     - Total issues
     - Open/In Progress/Resolved
     - Client Raised vs Internal (if stats support it)

### Expected Results:
✅ Clear visual distinction between client and internal issues
✅ Both types appear in same table
✅ Filtering works correctly
✅ Stats accurate

## Test Scenario 6: Organization Scoping

### Steps:
1. **Create Issues for Multiple Organizations**
   - Login as different customers
   - Raise issues for different organizations

2. **Login as Vendor from Organization A**
   - Navigate to `/issues`
   - Should ONLY see Organization A's issues

3. **Login as Vendor from Organization B**
   - Navigate to `/issues`
   - Should ONLY see Organization B's issues

### Expected Results:
✅ Organization scoping works
✅ Vendors see only their organization's issues
✅ No cross-organization data leakage

## Test Scenario 7: Linear Integration

### Steps:
1. **Raise Issue as Client**
   - Create a new client issue

2. **Login as Vendor**
   - View the client issue

3. **Sync to Linear**
   - Click "Raise Issue" to sync with Linear
   - Check Linear column

4. **Verify Linear Link**
   - "View" button appears in Linear column
   - Click to open Linear in new tab
   - Issue details match

### Expected Results:
✅ Client issues can be synced to Linear
✅ Linear link displayed correctly
✅ External link works
✅ Sync status updated

## Test Scenario 8: Error Handling

### Steps:
1. **Try Invalid Data**
   - Leave required fields empty
   - Submit form

2. **Check Validation**
   - Error messages appear
   - Form prevents submission

3. **Try Without Organization**
   - Leave organization unselected
   - Attempt submit

4. **API Errors**
   - Simulate network error (disconnect internet briefly)
   - Try to raise issue

### Expected Results:
✅ Validation errors shown
✅ Required field indicators work
✅ API errors show toast notifications
✅ Form doesn't submit with invalid data

## API Testing (Optional)

### Test Client Endpoints Directly:

#### 1. Raise Issue:
```bash
curl -X POST http://127.0.0.1:8000/api/client/issues/raise/ \
  -H "Authorization: Token YOUR_CUSTOMER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "organization": 1,
    "title": "Test Issue",
    "description": "Testing client raise",
    "priority": "medium",
    "category": "quality"
  }'
```

Expected: 201 Created with issue data

#### 2. Get Issue Details:
```bash
curl http://127.0.0.1:8000/api/client/issues/1/ \
  -H "Authorization: Token YOUR_CUSTOMER_TOKEN"
```

Expected: 200 OK with issue details

#### 3. Add Comment:
```bash
curl -X POST http://127.0.0.1:8000/api/client/issues/1/comment/ \
  -H "Authorization: Token YOUR_CUSTOMER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "comment": "Is there any update on this?"
  }'
```

Expected: 200 OK with updated issue

## Verification Checklist

### Backend:
- [ ] Migration 0005 applied successfully
- [ ] Client endpoints return correct data
- [ ] Role-based filtering works
- [ ] Organization scoping enforced
- [ ] Stats API includes by_source

### Frontend:
- [ ] ClientRaiseIssueModal opens
- [ ] Organization dropdown loads
- [ ] Vendor/Order dropdowns load dynamically
- [ ] Form validation works
- [ ] Issue submission successful
- [ ] Toast notifications appear
- [ ] Issues table shows source badges
- [ ] Customer names displayed for client issues

### Integration:
- [ ] Client can raise issues
- [ ] Vendors see client issues
- [ ] Employees see client issues
- [ ] Status updates visible to clients
- [ ] Linear sync works for client issues
- [ ] Organization scoping prevents data leaks

### Security:
- [ ] Customers only see their issues
- [ ] Vendors only see their org's issues
- [ ] Cannot access other customer's issues
- [ ] Proper authentication required
- [ ] Token validation works

## Known Issues/Limitations

1. **Comment Feature**: Backend supports comments, but UI doesn't show comment history yet
2. **Real-time Updates**: Changes don't update in real-time; requires page refresh
3. **Attachments**: No file upload support yet
4. **Notifications**: No email notifications when issues are raised/resolved

## Success Criteria

All scenarios pass if:
1. ✅ Clients can successfully raise issues about organizations
2. ✅ Vendors/employees see client issues in their dashboard
3. ✅ Clear visual distinction (badge + customer name)
4. ✅ Organization scoping prevents cross-org access
5. ✅ Status updates work bidirectionally
6. ✅ Linear integration maintained
7. ✅ No TypeScript/console errors
8. ✅ Proper error handling and validation

---

**Date:** November 8, 2025
**Status:** Ready for Testing
**Implemented By:** GitHub Copilot
