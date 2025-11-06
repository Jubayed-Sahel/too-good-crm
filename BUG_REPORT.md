# Bug Report & Issues Found
**Date**: November 7, 2025
**Scope**: Frontend & Backend Comprehensive Audit

## 🔴 CRITICAL ISSUES

### 1. API Endpoint Mismatches (CRITICAL)
**Severity**: HIGH - Will cause 404 errors in production

#### Issue: Inconsistent Base URL Usage
Multiple services are missing `/api/` prefix in their endpoint URLs.

**Backend URLs** (from `crmApp/urls.py`):
- All endpoints are under `/api/` prefix
- Example: `/api/roles/`, `/api/permissions/`, `/api/users/`

**Frontend Issues Found**:

| Service | Current URL | Expected URL | Status |
|---------|-------------|--------------|--------|
| `role.service.ts` | `/rbac/roles` | `/roles` | ❌ WRONG |
| `rbac.service.ts` | `/api/permissions/` | `/permissions/` | ❌ WRONG (double /api/) |
| `userProfile.service.ts` | `/users` | `/users` | ✅ OK |
| `organization.service.ts` | `/organizations` | `/organizations` | ✅ OK |
| `notification.service.ts` | `/notification-preferences` | `/notification-preferences` | ✅ OK |
| `employee.service.ts` | `/employees` | `/employees` | ✅ OK |
| `payment.service.ts` | `/payments/` | `/payments/` | ✅ OK |
| `order.service.ts` | `/orders/` | `/orders/` | ✅ OK |
| `issue.service.ts` | `/issues/` | `/issues/` | ✅ OK |
| `activity.service.ts` | `/activities/` | `/activities/` | ✅ OK |

**Why This Happens**:
- API client (`apiClient.ts`) has `baseURL: 'http://127.0.0.1:8000/api'`
- Services should use relative paths like `/users`, `/roles`
- Service paths are then appended to baseURL → `http://127.0.0.1:8000/api/users`

**Current Bugs**:
1. **role.service.ts**: Uses `/rbac/roles` → Results in `http://127.0.0.1:8000/api/rbac/roles` (404)
   - Should be `/roles` → `http://127.0.0.1:8000/api/roles` ✅

2. **rbac.service.ts**: Uses `/api/permissions/` → Results in `http://127.0.0.1:8000/api/api/permissions/` (404)
   - Should be `/permissions/` → `http://127.0.0.1:8000/api/permissions/` ✅

---

### 2. TypeScript Compilation Errors (CRITICAL)
**Severity**: HIGH - Build fails, cannot deploy

**Total Errors**: 47 TypeScript errors found

#### Category A: Missing Type Exports (13 errors)
**File**: `src/hooks/useRBAC.ts`
```
- CreateRoleData type not exported from @/types
- UpdateRoleData type not exported from @/types
- AssignRoleData type not exported from @/types
```

**File**: `src/hooks/useUser.ts`
```
- userService import fails (file was deleted during refactoring)
```

#### Category B: Type Mismatches (15 errors)
**File**: `src/hooks/useOrganization.ts`
```
- organizationService missing methods: getUserOrganizations, getOrganizationMembers, createOrganization, switchOrganization, inviteUser
- Type mismatches: string vs number for organization IDs
```

**File**: `src/hooks/useRBAC.ts`
```
- rbacService missing methods: getUserPermissions, checkPermission, assignRole, removeRole
- Type mismatches in function signatures
- Unknown types for userRole
```

#### Category C: Missing Properties (10 errors)
**File**: `src/components/leads/LeadStats.tsx`
```
- LeadStats type missing: totalLeads, statusCounts
```

**File**: `src/components/organization/OrganizationSwitcher.tsx`
```
- Organization type missing: subscription property
- Parameter 'userOrg' implicitly any type
```

**File**: `src/pages/ActivityDetailPage.tsx`
```
- Activity type missing: type, customerName, duration, notes properties
```

#### Category D: Wrong Property Names (9 errors)
**File**: `src/pages/ActivityDetailPage.tsx`
```
- Using customerName instead of customer_name
- Activity status comparison issues
```

---

## ⚠️ HIGH PRIORITY ISSUES

### 3. Missing Service Methods
**Severity**: MEDIUM-HIGH - Features won't work

**OrganizationService** missing:
- `getUserOrganizations()` - used in useOrganization hook
- `getOrganizationMembers()` - used in useOrganization hook
- `createOrganization()` - used in useOrganization hook
- `switchOrganization()` - used in useOrganization hook
- `inviteUser()` - used in useOrganization hook

**RBACService** missing:
- `getUserPermissions()` - used in useRBAC hook
- `checkPermission()` - used in useRBAC hook
- `assignRole()` - used in useRBAC hook
- `removeRole()` - used in useRBAC hook

---

### 4. Deleted Service Still Referenced
**Severity**: MEDIUM - Import errors

**Issue**: `userService` was deleted during refactoring but still imported in:
- `src/hooks/useUser.ts` (line 6)

**Fix**: Remove import and update hook to use `userProfileService`

---

## 📋 MEDIUM PRIORITY ISSUES

### 5. Backend Security Warnings (7 issues)
**Severity**: MEDIUM - Security concerns for production

From `python manage.py check --deploy`:

1. **SECRET_KEY** too short/weak
2. **DEBUG = True** in deployment (should be False)
3. **ALLOWED_HOSTS** is empty
4. **SECURE_HSTS_SECONDS** not set
5. **SECURE_SSL_REDIRECT** not set to True
6. **SESSION_COOKIE_SECURE** not set to True
7. **CSRF_COOKIE_SECURE** not set to True

**Impact**: These are OK for development but MUST be fixed before production deployment.

---

### 6. Type Definition Mismatches
**Severity**: MEDIUM - Data structure inconsistencies

**Activity Type** issues:
- Frontend expects: `type`, `customerName`, `duration`, `notes`
- Backend provides: `activity_type`, `customer_name`, `duration_minutes`, `notes`

**LeadStats Type** issues:
- Frontend expects: `totalLeads`, `statusCounts`
- Backend might provide: `total_leads`, `status_counts`

---

## ✅ GOOD FINDINGS

### What's Working Well:

1. ✅ **Django System Check**: No structural issues (migrations, models, admin)
2. ✅ **API Router**: All 24 viewsets properly registered
3. ✅ **URL Configuration**: Backend URLs correctly configured
4. ✅ **API Client Setup**: Axios client properly configured with interceptors
5. ✅ **Authentication**: Token-based auth interceptor working
6. ✅ **Most Services**: Customer, Lead, Deal, Analytics services appear correct

---

## 🔧 RECOMMENDED FIXES (Priority Order)

### Phase 1: Critical Bugs (Must Fix Immediately)
1. **Fix role.service.ts endpoint**: Change `/rbac/roles` → `/roles`
2. **Fix rbac.service.ts endpoint**: Change `/api/permissions/` → `/permissions/`
3. **Fix useUser.ts import**: Remove userService import, use userProfileService
4. **Add missing type exports** to `@/types/index.ts`:
   - CreateRoleData
   - UpdateRoleData
   - AssignRoleData

### Phase 2: High Priority (Fix Today)
5. **Implement missing OrganizationService methods** or remove from hooks
6. **Implement missing RBACService methods** or remove from hooks
7. **Fix Activity type definition** to match backend
8. **Fix LeadStats type definition** to match backend
9. **Fix Organization type definition** (add subscription?)

### Phase 3: Medium Priority (Fix This Week)
10. **Fix all TypeScript compilation errors**
11. **Update ActivityDetailPage** to use correct property names
12. **Update OrganizationSwitcher** to handle types correctly

### Phase 4: Before Production
13. **Configure Django security settings** in settings.py
14. **Set up environment variables** for secrets
15. **Test all API endpoints** with Postman/curl

---

## 📊 SUMMARY STATISTICS

| Category | Count | Status |
|----------|-------|--------|
| Critical Bugs | 4 | 🔴 Must Fix |
| High Priority | 6 | ⚠️ Should Fix |
| Medium Priority | 11 | 📋 Can Wait |
| Security Warnings | 7 | 🛡️ Before Prod |
| **Total Issues** | **28** | |

| Component | Status |
|-----------|--------|
| Backend Django | ✅ Healthy |
| Backend APIs | ⚠️ Configured (security warnings) |
| Frontend Services | 🔴 2 Critical Bugs |
| Frontend Types | 🔴 47 Compilation Errors |
| Frontend Components | ⚠️ Type Mismatches |

---

## 🎯 IMMEDIATE ACTION ITEMS

**RIGHT NOW** (Next 30 minutes):
1. Fix role.service.ts endpoint
2. Fix rbac.service.ts endpoint
3. Fix useUser.ts import
4. Add missing type exports

**TODAY** (Next 2-4 hours):
5. Implement or stub missing service methods
6. Fix Activity and LeadStats types
7. Test compilation again

**THIS WEEK**:
8. Fix all remaining TypeScript errors
9. Update component property names
10. Plan security configuration for production

---

## 📝 NOTES

- Most backend APIs are correctly configured
- API client interceptor is working properly
- Main issues are in frontend service layer and type definitions
- Refactoring removed some code that's still referenced
- Security warnings are normal for development, but note for production

---

**Next Steps**: Start with Phase 1 critical fixes immediately.
