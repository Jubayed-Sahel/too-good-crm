# Test Users Credentials

## Issue Tracking Test Users

### Customer User
- **Email**: `customer@test.com`
- **Password**: `customer123`
- **Profile**: Customer
- **Can**: Raise issues, view/update/delete their own issues

### Vendor User
- **Email**: `vendor@test.com`
- **Password**: `vendor123`
- **Profile**: Vendor
- **Can**: View and update all customer-raised issues (cannot raise issues)

### Employee User
- **Email**: `employee@test.com`
- **Password**: `employee123`
- **Profile**: Employee
- **Role**: Support Manager
- **Can**: View and update all customer-raised issues (cannot raise issues)
- **Permissions**: `issue:read`, `issue:update`, `issue:delete`

## How to Create Test Users

Run the management command:
```bash
cd shared-backend
python manage.py create_issue_test_users
```

## Sample Issues

The script creates 3 sample issues:
1. **ISS-2025-0001** - Product delivery delayed (High, Delivery, Open)
2. **ISS-2025-0002** - Quality issue with product (Medium, Quality, Open)
3. **ISS-2025-0003** - Billing question (Low, Billing, In Progress)

All issues are raised by the customer user and are visible to vendor and employee users.

## Testing Workflow

1. **Login as Customer** (`customer@test.com`)
   - Raise a new issue
   - View your issues
   - Update your issues

2. **Login as Vendor** (`vendor@test.com`)
   - View all customer-raised issues
   - Update issue status (e.g., to "In Progress")
   - Resolve issues
   - Note: "Raise Issue" button should NOT be visible

3. **Login as Employee** (`employee@test.com`)
   - View all customer-raised issues
   - Update issue status
   - Resolve issues
   - Note: "Raise Issue" button should NOT be visible

4. **Verify Updates**
   - Login as customer again
   - Verify you can see updates made by vendor/employee
   - Verify issue status changes are reflected

## Linear Integration

If Linear is configured:
- Issues are automatically synced to Linear on creation
- Status changes are automatically synced to Linear
- Resolution notes are automatically synced to Linear
- Linear issue ID and URL are stored in CRM

## Organization

All test users belong to: **Test Organization**

