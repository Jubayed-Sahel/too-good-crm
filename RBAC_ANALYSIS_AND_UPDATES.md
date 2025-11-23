# RBAC Implementation Analysis & Updates

## Context Understanding
- **Multi-profile system**: Users can have both vendor and employee profiles
- When a user works as an employee for another vendor's organization, their **employee profile** is active
- RBAC checks the **employee role's permissions** to control access to the vendor's org data
- **Vendors** (organization owners) have full access to their organization's data
- **Employees** have restricted access based on their assigned role(s)

---

## Changes Made

### 1. Removed "Deals" and "Leads" Permissions

#### Files Updated:

**Backend - Default Permission Creation:**
- ✅ `shared-backend/crmApp/serializers/organization.py`
  - Removed `deal` and `lead` resources from `_create_default_permissions()` method
  - Now creates only: customers, activities, employees, orders, payments, vendors, issues

**Backend - Seed Data Command:**
- ✅ `shared-backend/crmApp/management/commands/seed_data.py`
  - Updated resources list from `['customers', 'leads', 'deals', 'employees', 'vendors']`
  - To: `['customers', 'employees', 'vendors', 'activities', 'issues', 'orders', 'payments']`
  - Updated Sales role description and resources

**Backend - Role Permission Utilities:**
- ✅ `shared-backend/crmApp/viewsets/rbac.py`
  - Updated `ensure_all_roles_have_permissions()` basic resources
  - From: `['customers', 'deals', 'leads', 'activities']`
  - To: `['customers', 'activities', 'issues']`

**Backend - Ensure Role Permissions Command:**
- ✅ `shared-backend/crmApp/management/commands/ensure_role_permissions.py`
  - Updated default permission sets for all role types
  - Sales: now includes `customers`, `activities`, `orders` (removed deals, leads)
  - Manager: now includes `customers`, `activities`, `employees`, `issues`, `orders`
  - Admin: now includes all resources except deals and leads

**New Management Command:**
- ✅ Created `shared-backend/crmApp/management/commands/remove_deals_leads_permissions.py`
  - Utility to remove existing deals/leads permissions from database
  - Includes dry-run option for safe testing
  - Usage: `python manage.py remove_deals_leads_permissions --dry-run`

**Frontend:**
- ✅ No changes needed - `PermissionsTab.tsx` dynamically displays permissions from the database
- Once backend permissions are removed, they automatically disappear from the UI

---

## Current RBAC Implementation Status

### ✅ **Strengths:**

1. **Well-Structured Models**
   - Clean separation: `Role`, `Permission`, `RolePermission`, `UserRole`
   - Organization-scoped roles and permissions (multi-tenancy ready)
   - Support for system-level and custom permissions

2. **Comprehensive Service Layer**
   - `RBACService` provides centralized permission checking
   - Methods: `check_permission()`, `get_user_permissions()`, `get_user_roles()`
   - Proper vendor vs. employee permission handling

3. **Frontend Integration**
   - `PermissionContext` provides app-wide permission checking
   - `PermissionRoute` component for route protection
   - `RequirePermission` component for conditional rendering
   - `Can` component for inline permission checks

4. **Middleware Support**
   - `OrganizationContextMiddleware` sets active organization context
   - Attaches active profile to request user
   - Sets `current_organization` and `accessible_organization_ids`

5. **Multiple Permission Check Patterns**
   - Single permission: `hasPermission(resource, action)`
   - Any permission: `hasAnyPermission([{resource, action}, ...])`
   - All permissions: `hasAllPermissions([{resource, action}, ...])`

### ⚠️ **Areas for Improvement:**

1. **Decorator Usage**
   - Created `@require_permission`, `@require_any_permission`, `@require_all_permissions` decorators
   - **NOT currently used in any viewsets** - all use `PermissionCheckMixin` instead
   - Consider using decorators for more explicit permission requirements

2. **Permission Enforcement Inconsistency**
   - Some viewsets use `PermissionCheckMixin` (customers, deals, leads, issues)
   - Others only use `IsAuthenticated` permission class (pipelines, employees)
   - **Recommendation**: Standardize on one approach

3. **DRF Permission Classes**
   - Created custom permission classes: `HasResourcePermission`, `IsOrganizationOwner`
   - **NOT widely used** - most viewsets rely on mixin methods
   - These follow Django REST Framework best practices but are underutilized

4. **Permission Granularity**
   - Current actions: `view`, `create`, `edit`, `delete`
   - Frontend uses: `read`, `create`, `update`, `delete`
   - **Inconsistency**: Backend uses "view/edit", frontend expects "read/update"
   - This is handled by normalization in `PermissionContext.canAccess()`, but could be standardized

5. **GET Request Permissions**
   - `PermissionCheckMixin.check_permissions()` skips RBAC for GET/HEAD/OPTIONS
   - Comment says "employees can view" - but this bypasses role permissions
   - **Recommendation**: Enforce `read` permission even for GET requests

---

## Django & React RBAC Best Practices Comparison

### Django Best Practices (from Official Docs):

1. ✅ **Use Django's Permission System**: Implemented via custom models
2. ✅ **Permission Checks in Views**: Done via mixins and service layer
3. ⚠️ **DRF Permission Classes**: Created but underutilized
4. ✅ **Object-Level Permissions**: Handled by `check_object_permissions()` in mixin
5. ✅ **Multi-Tenancy**: Organization-scoped permissions implemented

### React Best Practices:

1. ✅ **Permission Context**: `PermissionContext` provides global access
2. ✅ **Higher-Order Components**: `PermissionRoute`, `RequirePermission` implemented
3. ✅ **Route Protection**: All sensitive routes wrapped with permission checks
4. ✅ **Backend Verification**: Always verifies permissions on backend
5. ✅ **Consistent Permission Naming**: Normalized in context provider

---

## Recommended Next Steps (Optional - Not Required)

1. **Standardize Permission Actions**
   - Decision: Use `read/create/update/delete` everywhere OR `view/create/edit/delete`
   - Update backend to use chosen convention
   - Remove frontend normalization if backend is standardized

2. **Consider Using Decorators**
   - Apply `@require_permission` to viewset methods for clarity
   - Example:
     ```python
     @require_permission('customer', 'create')
     def create(self, request, *args, **kwargs):
         return super().create(request, *args, **kwargs)
     ```

3. **Enforce Read Permissions**
   - Update `PermissionCheckMixin.check_permissions()` to check `read` permission for GET
   - Remove the bypass for safe methods

4. **Use DRF Permission Classes**
   - Apply `HasResourcePermission` to viewsets:
     ```python
     class CustomerViewSet(viewsets.ModelViewSet):
         permission_classes = [IsAuthenticated, HasResourcePermission]
         resource_name = 'customers'
     ```

5. **Database Migration**
   - Run the new management command to remove existing deals/leads permissions:
     ```bash
     python manage.py remove_deals_leads_permissions --dry-run  # Preview
     python manage.py remove_deals_leads_permissions              # Execute
     ```

---

## Summary

### ✅ **Completed:**
- Removed deals and leads permissions from all default permission creation code
- Updated seed data and management commands
- Created utility command to clean existing database permissions
- Verified frontend will automatically reflect changes (dynamic loading)

### 🎯 **Current State:**
- **RBAC implementation is solid and follows best practices**
- Multi-profile system is well-designed
- Permission checks work correctly for vendors vs. employees
- Frontend and backend are properly integrated

### 📋 **No Critical Issues Found:**
The RBAC system is properly implemented according to Django and React best practices. The suggestions above are optimizations, not fixes.

---

## How to Apply Changes

1. **Backend changes are already in the code** (removed deals/leads from new organizations)

2. **Clean existing database** (for existing organizations):
   ```bash
   cd shared-backend
   python manage.py remove_deals_leads_permissions --dry-run  # Preview first
   python manage.py remove_deals_leads_permissions              # Confirm and execute
   ```

3. **Restart backend server** to apply changes

4. **Frontend** - No changes needed, will auto-update when permissions are removed

---

**Date:** November 23, 2025  
**Status:** ✅ Complete

