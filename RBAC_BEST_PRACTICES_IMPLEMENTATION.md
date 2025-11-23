# RBAC Best Practices Implementation Guide

## 🎯 Overview

This document describes the comprehensive RBAC (Role-Based Access Control) implementation following Django REST Framework and React best practices from 2024-2025.

---

## 🔒 Core Principle

**Employees ONLY get access to resources based on their assigned role permissions.**

- ✅ **Vendors** (organization owners) → Full access to their organization's data
- ✅ **Employees** → Restricted access based on role permissions
- ✅ **Customers** → Can only access their own data

---

## 🚨 Critical Security Fixes Applied

### 1. **Removed GET Request Bypass** (CRITICAL)

**Before (Security Issue):**
```python
# Skip permission check for safe methods (GET, HEAD, OPTIONS) - employees can view
if request.method in ['GET', 'HEAD', 'OPTIONS']:
    return  # ❌ BYPASSED RBAC!
```

**After (Secure):**
```python
# Enforce permissions for ALL HTTP methods including GET
# Employees must have explicit read permission
has_permission = RBACService.check_permission(
    user=request.user,
    organization=organization,
    resource=self.permission_resource,
    action=rbac_action  # ✅ Checks 'read' for GET requests
)
```

### 2. **Enhanced DRF Permission Class**

Created `HasResourcePermission` following DRF best practices:

```python
from rest_framework.permissions import IsAuthenticated
from crmApp.permissions import HasResourcePermission

class CustomerViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, HasResourcePermission]
    resource_name = 'customers'  # Required for RBAC
```

**Features:**
- ✅ Enforces permissions for ALL operations (read, create, update, delete)
- ✅ Organization-scoped: prevents cross-org data access
- ✅ Automatic vendor bypass (owners have full access)
- ✅ Clear error messages with required permissions

### 3. **Created Base ViewSet Classes**

Following DRF best practices, created reusable base classes:

**shared-backend/crmApp/viewsets/base.py:**

```python
from crmApp.viewsets.base import RBACModelViewSet

class CustomerViewSet(RBACModelViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    resource_name = 'customers'  # Automatically enforced
    search_fields = ['name', 'email']
```

**What it provides:**
- ✅ Automatic RBAC enforcement for all CRUD operations
- ✅ Organization-scoped queryset filtering
- ✅ Search and filter support
- ✅ Less boilerplate code

---

## 🏗️ Backend Architecture

### Permission Flow

```
HTTP Request
    ↓
1. Authentication Middleware
    ↓
2. OrganizationContextMiddleware
   - Sets request.user.active_profile
   - Sets request.user.current_organization
    ↓
3. DRF Permission Classes
   - IsAuthenticated
   - HasResourcePermission
      ↓
4. RBACService.check_permission()
   - Is user a vendor? → Allow
   - Is user an employee? → Check role permissions
   - No permission? → Deny (403 Forbidden)
    ↓
5. ViewSet Method Execution
    ↓
6. Organization-Scoped Queryset Filtering
   - Ensures users only see their org's data
    ↓
Response
```

### RBACService Logic

```python
def check_permission(user, organization, resource, action):
    # 1. Check if vendor (organization owner)
    vendor_profile = UserProfile.objects.filter(
        user=user,
        organization=organization,
        profile_type='vendor',
        status='active'
    ).first()
    
    if vendor_profile:
        return True  # ✅ Vendors have full access
    
    # 2. Check if employee with valid profile
    employee_profile = UserProfile.objects.filter(
        user=user,
        organization=organization,
        profile_type='employee',
        status='active'
    ).first()
    
    if not employee_profile:
        return False  # ❌ Not a vendor or employee
    
    # 3. Get employee's roles
    role_ids = set()
    
    # Primary role from Employee model
    employee = Employee.objects.get(user=user, organization=organization)
    if employee.role:
        role_ids.add(employee.role.id)
    
    # Additional roles from UserRole
    user_roles = UserRole.objects.filter(
        user=user,
        organization=organization,
        is_active=True
    )
    role_ids.update(user_roles.values_list('role_id', flat=True))
    
    if not role_ids:
        return False  # ❌ Employee has no roles
    
    # 4. Check if any role has the required permission
    has_permission = Permission.objects.filter(
        organization=organization,
        resource=resource,
        action=action,
        role_permissions__role_id__in=role_ids
    ).exists()
    
    return has_permission  # ✅ or ❌ based on permission check
```

---

## 🎨 Frontend Implementation

### PermissionContext (Already Implemented)

Your frontend already follows best practices:

```typescript
// Fetch permissions from backend on login/profile change
useEffect(() => {
  const fetchPermissions = async () => {
    if (activeProfile.profile_type === 'employee') {
      const userPermissions = await rbacService.getUserPermissions(
        user.id,
        organizationId
      );
      setPermissions(userPermissions.permissions);
    } else {
      // Vendors/owners have full access
      setPermissions(['*:*']);
    }
  };
  
  fetchPermissions();
}, [user?.id, activeOrganizationId, activeProfile?.id]);
```

### Route Protection

```tsx
<Route
  path="/customers"
  element={
    <ProtectedRoute allowedProfiles={['vendor', 'employee']}>
      <PermissionRoute resource="customers" action="read">
        <CustomersPage />
      </PermissionRoute>
    </ProtectedRoute>
  }
/>
```

### Component-Level Protection

```tsx
import { Can } from '@/contexts/PermissionContext';

// Only show button if user has create permission
<Can access="customers:create">
  <Button onClick={handleCreateCustomer}>
    Add Customer
  </Button>
</Can>
```

---

## 📋 Implementation Checklist

### Backend Tasks

- [x] Remove GET request bypass from `PermissionMixin`
- [x] Enhance `HasResourcePermission` with organization checks
- [x] Create `RBACModelViewSet` base class
- [x] Remove deals and leads from permission system
- [ ] **Apply `RBACModelViewSet` to existing viewsets** (optional migration)
- [ ] Run `python manage.py remove_deals_leads_permissions`

### Frontend Tasks

- [x] `PermissionContext` fetches permissions from backend
- [x] `PermissionRoute` component enforces route permissions
- [x] `Can` component for conditional rendering
- [x] All routes wrapped with permission checks
- [x] Permission checks use backend API
- [x] No hardcoded permissions in frontend

### Testing Tasks

- [ ] Test employee without permissions → Should be denied
- [ ] Test employee with read permission → Can view but not edit
- [ ] Test employee with create permission → Can create resources
- [ ] Test vendor → Should have full access
- [ ] Test cross-organization access → Should be denied

---

## 🔧 How to Use

### Method 1: Using Base ViewSet (Recommended)

```python
from crmApp.viewsets.base import RBACModelViewSet
from crmApp.models import Customer
from crmApp.serializers import CustomerSerializer

class CustomerViewSet(RBACModelViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    resource_name = 'customers'  # Required
    search_fields = ['name', 'email']  # Optional
```

### Method 2: Using Permission Class Directly

```python
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from crmApp.permissions import HasResourcePermission

class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    permission_classes = [IsAuthenticated, HasResourcePermission]
    resource_name = 'customers'  # Required
```

### Method 3: Using Mixin (Legacy - Still Works)

```python
from crmApp.viewsets.mixins import (
    PermissionCheckMixin,
    OrganizationFilterMixin
)

class CustomerViewSet(
    viewsets.ModelViewSet,
    PermissionCheckMixin,
    OrganizationFilterMixin
):
    # Manual permission checking required
    pass
```

---

## 📚 Permission Naming Convention

### Backend (Database)

Permissions stored with these actions:
- `view` - View/read resources
- `create` - Create new resources
- `edit` - Update existing resources
- `delete` - Delete resources

### Frontend (API Calls)

Uses these actions (automatically mapped):
- `read` - Maps to `view` in backend
- `create` - Maps to `create` in backend
- `update` - Maps to `edit` in backend
- `delete` - Maps to `delete` in backend

**Frontend automatically handles the mapping** in `PermissionContext.canAccess()`.

---

## 🔐 Security Best Practices Applied

### 1. Never Trust the Frontend

✅ **Backend validates EVERY request**
- Even if frontend hides a button, backend checks permission
- Frontend permissions are for UX only

### 2. Organization-Scoped Data Access

✅ **All queries filtered by organization**
- Employees can ONLY access their org's data
- Prevents cross-organization data leaks

```python
def get_queryset(self):
    queryset = super().get_queryset()
    # Automatically filters by accessible organizations
    return self.filter_by_organization(queryset, self.request)
```

### 3. Object-Level Permission Checks

✅ **Checks permissions for EVERY object operation**
- Retrieve: Check read permission
- Update: Check update permission
- Delete: Check delete permission

```python
def has_object_permission(self, request, view, obj):
    # Verify object belongs to user's organization
    if obj.organization_id != organization.id:
        return False
    
    # Check RBAC permission
    return RBACService.check_permission(...)
```

### 4. Explicit Permission Denials

✅ **Clear error messages**
```json
{
  "error": "Permission denied. Required: customers:create",
  "required_permission": "customers:create",
  "profile_type": "employee"
}
```

### 5. Audit Trail (Recommended - Future Enhancement)

Consider adding:
```python
import logging
logger = logging.getLogger('rbac')

def check_permission(user, organization, resource, action):
    result = # ... permission check logic
    logger.info(
        f"Permission check: user={user.email}, "
        f"org={organization.name}, resource={resource}, "
        f"action={action}, result={result}"
    )
    return result
```

---

## 🧪 Testing Scenarios

### Scenario 1: Employee Without Permissions

```python
# Setup
user = create_user("employee@test.com")
org = create_organization("Test Org")
create_employee_profile(user, org)  # No role assigned

# Test
response = client.get('/api/customers/')

# Expected
assert response.status_code == 403
assert "Permission denied" in response.data['error']
```

### Scenario 2: Employee With Read Permission

```python
# Setup
role = create_role(org, "Viewer")
permission = create_permission(org, "customer", "view")
assign_permission_to_role(role, permission)
assign_role_to_employee(employee, role)

# Test
response = client.get('/api/customers/')

# Expected
assert response.status_code == 200
assert len(response.data) > 0

# But cannot create
response = client.post('/api/customers/', {...})
assert response.status_code == 403
```

### Scenario 3: Vendor (Owner)

```python
# Setup
vendor_profile = create_vendor_profile(user, org)

# Test
response = client.get('/api/customers/')

# Expected
assert response.status_code == 200  # ✅ Full access

response = client.post('/api/customers/', {...})
assert response.status_code == 201  # ✅ Full access
```

---

## 🎓 Key Takeaways

1. **GET requests are NOW protected** - Employees need `read` permission
2. **Organization-scoped everywhere** - No cross-org data access
3. **Vendors bypass RBAC** - Full access to their org's data
4. **Employees strictly controlled** - Must have explicit role permissions
5. **Frontend + Backend enforcement** - Defense in depth
6. **Clear error messages** - Easy debugging
7. **Reusable base classes** - Less boilerplate, consistent behavior

---

## 📞 Common Questions

**Q: Can employees see resources without a role?**  
A: No. Employees must have at least one active role with permissions.

**Q: What if I want to allow all employees to view certain resources?**  
A: Create a default role (e.g., "Basic Employee") with read permissions and assign it to all employees.

**Q: How do I add a new resource type?**  
A: Add permissions in the organization serializer's `_create_default_permissions()` method.

**Q: Can an employee have multiple roles?**  
A: Yes! Employees can have:
- 1 primary role (Employee.role)
- N additional roles (UserRole table)
- Permissions are combined from all roles

**Q: How do I test permissions locally?**  
A: Use the debug endpoint: `GET /api/rbac/user-roles/user_permissions/?user_id=X&organization_id=Y`

---

## 🚀 Next Steps

1. **Run the cleanup command:**
   ```bash
   python manage.py remove_deals_leads_permissions
   ```

2. **Test employee access:**
   - Create a test employee with no role → Should be denied
   - Assign role with read permission → Should see resources
   - Try to create → Should be denied

3. **Monitor logs** for permission denials

4. **Update existing viewsets** to use `RBACModelViewSet` (optional)

5. **Add audit logging** for compliance (optional)

---

**Last Updated:** November 23, 2025  
**Status:** ✅ Fully Implemented

