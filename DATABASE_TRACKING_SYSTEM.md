# ✅ Organization-Employee Database Tracking System

## Database Tables

The system already has comprehensive tables to track organization-employee relationships:

### 1. **`employees`** Table
Tracks all employees within organizations.

**Key Fields:**
- `organization_id` - Links employee to organization
- `user_id` - Links to User account
- `user_profile_id` - Links to UserProfile
- `role_id` - Primary role assigned to employee
- `job_title`, `department` - Job details
- `status` - active, inactive, on-leave, terminated
- `manager_id` - Hierarchical reporting structure

**Constraints:**
- Unique: `(organization, user)` - One employee record per user per organization
- Unique: User can only be active employee in ONE organization at a time

### 2. **`user_profiles`** Table
Links users to organizations with profile types.

**Key Fields:**
- `user_id` - The user
- `organization_id` - The organization
- `profile_type` - vendor, employee, customer
- `is_primary` - Primary profile for the user
- `status` - active, inactive, suspended

**Constraints:**
- Unique: `(user, profile_type)` - One profile of each type per user

### 3. **`user_organizations`** Table
Junction table for user-organization membership.

**Key Fields:**
- `user_id` - The user
- `organization_id` - The organization
- `is_owner` - Is the user an owner?
- `is_active` - Is membership active?
- `joined_at` - When they joined

**Constraints:**
- Unique: `(user, organization)` - One membership per user per organization

### 4. **`user_roles`** Table
Tracks additional roles assigned to users.

**Key Fields:**
- `user_id` - The user
- `role_id` - The role
- `organization_id` - The organization
- `is_active` - Is role assignment active?
- `assigned_by` - Who assigned the role

**Constraints:**
- Unique: `(user, role, organization)` - One assignment per user-role-org combo

## Relationship Flow

```
User
  ├─ UserProfile (vendor) ──→ Organization (owns)
  ├─ UserProfile (employee) ──→ Organization (works in)
  │    └─ Employee Record
  │         ├─ Primary Role
  │         ├─ Job Title
  │         ├─ Department
  │         └─ Manager
  └─ UserProfile (customer) ──→ Organization (customer of)
```

## Management Commands

### 1. Show All Organizations

```bash
python manage.py show_org_employees
```

**Output:**
```
[ORG] ahmed ltd (ID: 12)
  Linear Team ID: d9cfd946-f144-4ce4-804e-05f944767334
  Active Employees: 10
  Vendors: 2
  Customers: 2
```

### 2. Show Organization Employees

```bash
python manage.py show_org_employees --org-id 12
```

**Output:**
```
[EMPLOYEE] John Doe
  Email: john@example.com
  Job Title: Sales Manager
  Department: Sales
  Primary Role: Sales Manager
```

### 3. Show Detailed Information

```bash
python manage.py show_org_employees --org-id 12 --detailed
```

**Output:**
```
[EMPLOYEE] John Doe
  Email: john@example.com
  Job Title: Sales Manager
  Department: Sales
  Primary Role: Sales Manager
  Permissions (20):
    customer: create, delete, edit, view
    deal: create, delete, edit, view
    sales: create, delete, edit, view
    activities: create, edit, view
    analytics: view
```

### 4. Show User's Organizations

```bash
python manage.py show_org_employees --user-email john@example.com
```

**Output:**
```
[USER] john@example.com (John Doe)

[PROFILE] EMPLOYEE
  Organization: ahmed ltd (ID: 12)
  Is Primary: True
  Job Title: Sales Manager
  Department: Sales
  Primary Role: Sales Manager
```

## Employee Dashboard Access

### How It Works

1. **Employee logs in**
   - System checks `UserProfile` for employee profile
   - Gets organization from employee profile

2. **System loads employee record**
   - Queries `Employee` table
   - Gets `role_id` (primary role)
   - Gets additional roles from `UserRole` table

3. **System calculates permissions**
   - Gets all permissions from primary role
   - Gets all permissions from additional roles
   - Applies permission mapping (sales → customer, deal, lead)
   - Returns combined permission set

4. **Frontend checks permissions**
   - Employee can see dashboard if they have `analytics.view` or `dashboard.view`
   - Employee can access resources based on their permissions
   - Frontend shows/hides features based on permissions

### Example Flow

```
Employee: john@example.com
Organization: ahmed ltd
Primary Role: Sales Manager
  Permissions:
    - sales.view, sales.create, sales.edit
    - activities.view, activities.create
    - analytics.view

System applies mapping:
  sales.* → customer.*, deal.*, lead.*
  analytics.* → dashboard.*

Final permissions:
  ✓ customer.view, customer.create, customer.edit
  ✓ deal.view, deal.create, deal.edit
  ✓ lead.view, lead.create, lead.edit
  ✓ activities.view, activities.create
  ✓ dashboard.view

Employee can now:
  ✓ See dashboard
  ✓ Access customers, deals, leads
  ✓ Create and edit sales records
  ✓ View and create activities
  ✓ View analytics
```

## Database Queries

### Get All Employees for Organization

```python
from crmApp.models import Employee, Organization

org = Organization.objects.get(id=12)
employees = Employee.objects.filter(
    organization=org,
    status='active'
).select_related('user', 'role', 'manager')

for emp in employees:
    print(f"{emp.full_name} - {emp.role.name if emp.role else 'No role'}")
```

### Get Employee's Permissions

```python
from crmApp.models import Employee, Organization
from crmApp.utils.permissions import PermissionChecker

employee = Employee.objects.get(user__email='john@example.com', status='active')
checker = PermissionChecker(employee.user, employee.organization)
permissions = checker.get_all_permissions()

print(f"Permissions: {permissions}")
```

### Get User's Organizations

```python
from crmApp.models import User, UserProfile

user = User.objects.get(email='john@example.com')
profiles = UserProfile.objects.filter(
    user=user,
    status='active'
).select_related('organization')

for profile in profiles:
    print(f"{profile.profile_type}: {profile.organization.name}")
```

### Check if User is Employee

```python
from crmApp.models import Employee, Organization

def is_employee(user, organization):
    return Employee.objects.filter(
        user=user,
        organization=organization,
        status='active'
    ).exists()
```

## Database Indexes

For performance, the following indexes exist:

```python
# employees table
indexes = [
    ('organization', 'status'),
    ('organization', 'department'),
    ('user', 'organization'),
    ('user', 'status'),
]

# user_profiles table
indexes = [
    ('user', 'organization'),
    ('profile_type', 'status'),
]

# user_roles table
indexes = [
    ('user', 'organization'),
]
```

## API Endpoints

### Get Organization Employees

```
GET /api/employees/?organization=12
```

### Get Employee Details

```
GET /api/employees/{employee_id}/
```

### Get User's Permissions

```
GET /api/user-context/permissions/?organization=12
```

### Assign Role to Employee

```
POST /api/user-roles/bulk_assign/
{
  "role_id": 5,
  "user_ids": [1, 2, 3]
}
```

## Summary

✅ **Database tables exist** - employees, user_profiles, user_organizations, user_roles
✅ **Tracking system works** - Can track all employees per organization
✅ **Management commands available** - Easy to view and debug relationships
✅ **Permission system integrated** - Employees get permissions from roles
✅ **Dashboard access working** - Employees can see dashboard based on permissions
✅ **Indexes optimized** - Fast queries for organization-employee lookups

**The database tracking system is comprehensive and working correctly!** 🎉

## Quick Reference Commands

```bash
# Show all organizations
python manage.py show_org_employees

# Show specific organization
python manage.py show_org_employees --org-id 12

# Show with permissions
python manage.py show_org_employees --org-id 12 --detailed

# Show user's organizations
python manage.py show_org_employees --user-email john@example.com

# Show detailed user info
python manage.py show_org_employees --user-email john@example.com --detailed
```

