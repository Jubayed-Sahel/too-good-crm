# Multi-Tenant System Implementation Plan

## System Requirements Analysis

### 1. **VENDOR (Organization Owner)**
- ✅ Can own ONE organization (via UserOrganization.is_owner=True)
- ✅ Has vendor UserProfile for their organization
- ✅ Can manage employees in their organization
- ✅ Can create custom roles with predefined permissions from backend
- ✅ Can assign roles to their employees
- ✅ Full access to organization data

### 2. **EMPLOYEE (Organization Member)**
- ✅ Can be part of MULTIPLE organizations
- ✅ Has employee UserProfile for each organization they belong to
- ✅ Access scoped to specific organization data
- ✅ Permissions controlled by roles assigned by vendor/owner
- ✅ Can only see/modify data based on their role permissions

### 3. **CUSTOMER (Standalone)**
- ✅ Does NOT need to belong to an organization
- ✅ Has customer UserProfile (can be standalone or linked to org)
- ✅ Access to customer portal features
- ✅ Can view their own orders, payments, issues
- ✅ Limited access compared to vendor/employee

## Current Architecture Status

### ✅ **Already Implemented**
1. **Models**:
   - User (multi-profile support)
   - UserProfile (vendor/employee/customer profiles)
   - UserOrganization (links users to orgs, tracks ownership)
   - Organization (multi-tenant container)
   - Employee (with role assignment)
   - Role & Permission (RBAC system)
   - Customer (can be standalone or org-linked)

2. **Backend RBAC**:
   - Permission model with resource:action
   - Role model with permission assignments
   - UserRole for additional role assignments
   - Employee.role for primary role
   - RBACService for permission checking

3. **Frontend Services**:
   - role.service.ts
   - permission.service.ts
   - API configuration

### 🔧 **Needs Implementation**

1. **Organization Context Middleware**
   - Track current active organization per request
   - Filter queries by organization automatically
   - Validate user has access to requested organization

2. **Enhanced Serializers**
   - Include organization context in responses
   - Add is_owner flag to user data
   - Include user's roles per organization

3. **ViewSet Permissions**
   - Check organization access
   - Validate RBAC permissions
   - Scope data queries by organization

4. **Frontend Context**
   - Track active organization
   - Switch between organizations (for employees)
   - Display organization-scoped data

5. **Customer Portal**
   - Standalone customer access
   - Organization-linked customer access
   - Limited feature set

## Implementation Tasks

### Backend Tasks

#### Task 1: Organization Context Header
- Add X-Organization-ID header to track active org
- Middleware to set request.organization
- Validate user has access to org

#### Task 2: Enhanced User Serializer
- Include is_owner per organization
- Include roles per organization
- Include active_organization field

#### Task 3: Permission Middleware
- Check RBAC permissions on viewsets
- Custom permission classes
- Organization-scoped queries

#### Task 4: Customer Standalone Support
- Allow customer profile without organization
- Customer-specific endpoints
- Limited data access

### Frontend Tasks

#### Task 1: Organization Context
- Add organization switcher (for multi-org employees)
- Store active organization in context
- Include X-Organization-ID in API calls

#### Task 2: Role Management UI
- Vendor can create roles
- Assign permissions to roles
- Assign roles to employees

#### Task 3: Employee Management UI
- Vendor can invite employees
- Assign roles to employees
- View employee permissions

#### Task 4: Customer Portal
- Separate customer views
- Limited navigation
- Own data only

## API Flow Examples

### Vendor Flow
```
1. Login → Get token + user data with profiles
2. Select vendor profile → Set as primary
3. X-Organization-ID: <vendor_org_id> in all requests
4. Can access: /employees, /roles, /permissions, /customers, /leads, /deals
5. Can create roles and assign to employees
```

### Employee Flow
```
1. Login → Get token + user data with multiple employee profiles
2. Select employee profile for Org A → Set as primary
3. X-Organization-ID: <org_a_id> in all requests
4. Can access: Limited by role permissions in Org A
5. Can switch to Org B → Change X-Organization-ID: <org_b_id>
6. Different permissions in Org B
```

### Customer Flow
```
1. Login → Get token + user data with customer profile
2. No organization context needed (standalone)
3. Can access: /my-orders, /my-payments, /my-issues
4. Cannot access vendor/employee features
```

## Next Steps

1. ✅ Review current implementation
2. 🔨 Create organization context middleware
3. 🔨 Update serializers with enhanced data
4. 🔨 Add permission checking to viewsets
5. 🔨 Create organization switcher in frontend
6. 🔨 Build role management UI
7. 🔨 Build employee management UI
8. 🔨 Create customer portal views
9. ✅ Test multi-tenant isolation
10. ✅ Test RBAC enforcement
