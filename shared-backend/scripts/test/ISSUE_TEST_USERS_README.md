# Issue Tracking Test Users

This document describes the test users created for issue tracking simulation.

## Quick Start

To create test users, run:
```bash
python manage.py create_issue_test_users
```

## Test Users

### 1. Customer User
- **Email**: `customer@test.com`
- **Password**: `customer123`
- **Profile Type**: Customer
- **Name**: John Customer
- **Organization**: Test Organization
- **Capabilities**:
  - ✅ Can raise issues
  - ✅ Can view issues they raised
  - ✅ Can update issues they raised
  - ✅ Can delete issues they raised
  - ❌ Cannot view issues raised by other customers
  - ❌ Cannot update issues raised by other customers

### 2. Vendor User
- **Email**: `vendor@test.com`
- **Password**: `vendor123`
- **Profile Type**: Vendor
- **Name**: Jane Vendor
- **Organization**: Test Organization
- **Capabilities**:
  - ❌ Cannot raise issues
  - ✅ Can view all customer-raised issues in their organization
  - ✅ Can update any customer-raised issue in their organization
  - ✅ Can resolve any customer-raised issue in their organization
  - ✅ Can reopen any customer-raised issue in their organization
  - ✅ Can delete any customer-raised issue in their organization

### 3. Employee User
- **Email**: `employee@test.com`
- **Password**: `employee123`
- **Profile Type**: Employee
- **Name**: Bob Employee
- **Organization**: Test Organization
- **Role**: Support Manager
- **Permissions**:
  - `issue:read` - Can read issues
  - `issue:update` - Can update issues
  - `issue:delete` - Can delete issues
- **Capabilities**:
  - ❌ Cannot raise issues
  - ✅ Can view all customer-raised issues in their organization
  - ✅ Can update any customer-raised issue in their organization (with permission)
  - ✅ Can resolve any customer-raised issue in their organization (with permission)
  - ✅ Can reopen any customer-raised issue in their organization (with permission)
  - ✅ Can delete any customer-raised issue in their organization (with permission)

## Sample Issues

The script creates 3 sample issues:

1. **ISS-2025-0001** - Product delivery delayed
   - Priority: High
   - Category: Delivery
   - Status: Open
   - Raised by: John Customer

2. **ISS-2025-0002** - Quality issue with product
   - Priority: Medium
   - Category: Quality
   - Status: Open
   - Raised by: John Customer

3. **ISS-2025-0003** - Billing question
   - Priority: Low
   - Category: Billing
   - Status: In Progress
   - Raised by: John Customer

## Testing Scenarios

### Scenario 1: Customer Raises Issue
1. Login as `customer@test.com`
2. Navigate to Issues page
3. Click "Raise Issue" button
4. Fill out issue form:
   - Title: "New test issue"
   - Description: "This is a test issue"
   - Priority: Medium
   - Category: General
5. Submit the form
6. Verify issue appears in the list
7. Verify issue is marked as "Client" issue
8. Verify issue is synced to Linear (if configured)

### Scenario 2: Vendor Views Customer Issues
1. Login as `vendor@test.com`
2. Navigate to Issues page
3. Verify "Raise Issue" button is NOT visible
4. Verify all 3 sample issues are visible
5. Verify issue details are shown correctly
6. Verify Linear sync status is shown (if configured)

### Scenario 3: Vendor Updates Issue Status
1. Login as `vendor@test.com`
2. Navigate to Issues page
3. Find an issue with status "Open"
4. Change status to "In Progress"
5. Verify status is updated
6. Verify Linear sync status is shown in notification
7. Login as `customer@test.com`
8. Verify customer can see the updated status

### Scenario 4: Employee Resolves Issue
1. Login as `employee@test.com`
2. Navigate to Issues page
3. Find an issue with status "Open" or "In Progress"
4. Click "Resolve" button
5. Add resolution notes: "Issue has been resolved"
6. Submit the form
7. Verify issue status is changed to "Resolved"
8. Verify Linear sync status is shown in notification
9. Login as `customer@test.com`
10. Verify customer can see the resolved status and notes

### Scenario 5: Employee Cannot Raise Issue
1. Login as `employee@test.com`
2. Navigate to Issues page
3. Verify "Raise Issue" button is NOT visible
4. Try to create issue via API (should fail with 403 Forbidden)

### Scenario 6: Customer Cannot See Other Customer's Issues
1. Login as `customer@test.com`
2. Navigate to Issues page
3. Verify only issues raised by this customer are visible
4. Verify other customers' issues are NOT visible

## Linear Integration Testing

If Linear is configured:

1. **Verify Issue Creation Sync**:
   - Customer raises an issue
   - Check Linear app for the new issue
   - Verify issue ID and URL are stored in CRM

2. **Verify Issue Update Sync**:
   - Vendor/Employee updates issue status
   - Check Linear app for status change
   - Verify `last_synced_at` timestamp is updated

3. **Verify Issue Resolution Sync**:
   - Vendor/Employee resolves an issue
   - Check Linear app for status change to "Done"
   - Verify resolution notes are synced

4. **Verify Linear Webhook**:
   - Update issue in Linear app
   - Check CRM for the update
   - Verify status is updated in CRM

## Cleanup

To remove test users and data:
```bash
python manage.py shell
```

```python
from crmApp.models import User, Organization, Issue

# Delete test organization (this will cascade delete all related data)
Organization.objects.filter(name='Test Organization').delete()

# Or delete specific users
User.objects.filter(email__in=['customer@test.com', 'vendor@test.com', 'employee@test.com']).delete()
```

## Troubleshooting

### Issue: "Permission denied" when employee tries to update issue
- **Solution**: Verify employee has `issue:update` permission in their role
- Check: `Employee.role.permissions` contains `issue:update`

### Issue: Customer cannot see their issues
- **Solution**: Verify customer profile is active and linked to correct organization
- Check: `UserProfile.status = 'active'` and `UserProfile.organization` is correct

### Issue: Vendor cannot see customer issues
- **Solution**: Verify vendor profile is active and linked to same organization as customer
- Check: Both vendor and customer are in the same organization

### Issue: Linear sync not working
- **Solution**: Verify Linear API key and team ID are configured
- Check: `Organization.linear_team_id` is set
- Check: `LINEAR_API_KEY` environment variable is set

## Files

- **Command**: `crmApp/management/commands/create_issue_test_users.py`
- **Script**: `scripts/test/create_issue_test_users.py`
- **Documentation**: This file

## Notes

- All test users are created in the same organization ("Test Organization")
- All test users have the same password format: `{profile_type}123`
- Sample issues are created automatically when running the command
- The script is idempotent - running it multiple times will not create duplicates
- Existing users and issues will be reused if they already exist

