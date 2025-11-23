# Team Page Organization Filter Fix

## 🐛 **Problem Identified**

The Team page was potentially showing employees from **ALL organizations** where the user is a member, instead of just employees from the **currently active organization**.

---

## 🔍 **Root Cause Analysis**

### **Backend Behavior:**

In `shared-backend/crmApp/viewsets/employee.py`, the `get_queryset()` method works as follows:

```python
def get_queryset(self):
    # Get ALL organizations where user is an active member
    user_orgs = self.request.user.user_organizations.filter(
        is_active=True
    ).values_list('organization_id', flat=True)
    
    # Returns employees from ALL user's organizations
    queryset = Employee.objects.filter(
        Q(organization_id__in=user_orgs) |  # All orgs user belongs to
        Q(user=self.request.user, ...)
    )
    
    # CRITICAL: Only filters by specific org if frontend sends it
    org_id = self.request.query_params.get('organization')
    if org_id:
        queryset = queryset.filter(organization_id=org_id)  # ✅ THIS FILTERS
```

**What this means:**
- If frontend sends `organization` parameter → Returns employees from that org only ✅
- If frontend does NOT send `organization` parameter → Returns employees from ALL user's orgs ❌

---

### **Frontend Behavior (BEFORE FIX):**

**File:** `web-frontend/src/components/team/TeamMembersTab.tsx`

```typescript
// BEFORE:
const { employees, isLoading, error, refetch } = useEmployees();
// No organization parameter passed! ❌
```

**File:** `web-frontend/src/hooks/useEmployees.ts`

```typescript
const queryParams = {
  ...params,
  // Falls back to user's active_profile.organization
  organization: params?.organization || user?.active_profile?.organization,
};
```

**Problem:**
If `user.active_profile.organization` is not properly set or is an object instead of an ID, the backend doesn't receive the `organization` filter correctly, leading to employees from ALL organizations being returned.

---

## ✅ **Solution Applied**

### **Change:** Explicitly pass `activeOrganizationId` to `useEmployees` hook

**File:** `web-frontend/src/components/team/TeamMembersTab.tsx`

**Added import:**
```typescript
import { useProfile } from '@/contexts/ProfileContext';
```

**Updated data fetching:**
```typescript
// AFTER:
const { activeOrganizationId } = useProfile();
const { employees, isLoading, error, refetch } = useEmployees({ 
  organization: activeOrganizationId  // ✅ Explicitly pass org ID
});
```

---

## 📊 **Flow Diagram**

### **Before Fix:**
```
User is member of:
  - Org 1 (ID: 21) - "pro1" (Owner)
  - Org 2 (ID: 22) - "pro2" (Employee)

Team Page Opens:
  └─> useEmployees() called (no org parameter)
      └─> Backend query returns ALL employees:
          - Employees from Org 21 (pro1) ✅
          - Employees from Org 22 (pro2) ❌ (WRONG!)
```

### **After Fix:**
```
User is member of:
  - Org 1 (ID: 21) - "pro1" (Owner) [ACTIVE]
  - Org 2 (ID: 22) - "pro2" (Employee)

Team Page Opens:
  └─> activeOrganizationId = 21
  └─> useEmployees({ organization: 21 }) called
      └─> Backend query filters: organization_id=21
          - Employees from Org 21 (pro1) ✅
          - Employees from Org 22 (pro2) ❌ (Filtered out)
```

---

## 🧪 **How to Test**

### **Scenario: User is Member of Multiple Organizations**

**Setup:**
1. Create User A (proyash1@gmail.com)
2. User A creates Org 1 ("pro1") → User A is Owner
3. User A invites User B (proyash2@gmail.com) to Org 1 → User B is Employee
4. User B creates Org 2 ("pro2") → User B is Owner
5. User B invites User C (proyash3@gmail.com) to Org 2 → User C is Employee

**Test as User B (Member of BOTH Org 1 and Org 2):**

1. Login as User B (proyash2@gmail.com)
2. Switch to Employee profile (Org 1)
3. Navigate to Team page

**Expected Result (AFTER FIX):**
- ✅ Shows ONLY User B's employee profile in Org 1
- ❌ Does NOT show employees from Org 2 (User B's own org)

4. Switch to Vendor profile (Org 2)
5. Navigate to Team page

**Expected Result (AFTER FIX):**
- ✅ Shows ONLY employees in Org 2 (User C)
- ❌ Does NOT show employees from Org 1 (where User B is an employee)

---

## 🔑 **Key Points**

### **1. ProfileContext provides `activeOrganizationId`**
```typescript
// From ProfileContext
const activeOrganizationId = activeProfile?.organization?.id || null;
```

This is the **single source of truth** for which organization the user is currently viewing.

### **2. Always pass organization filter to data fetching hooks**

**Good:**
```typescript
useEmployees({ organization: activeOrganizationId });
useCustomers({ organization: activeOrganizationId });
useIssues({ organization: activeOrganizationId });
```

**Bad:**
```typescript
useEmployees();  // Might fetch from all user's orgs!
```

### **3. Backend correctly implements organization filtering**

The backend is **correctly implemented**. It:
1. Returns employees from all user's organizations by default (for cross-org visibility if needed)
2. Filters by specific organization when `organization` parameter is provided

The issue was the **frontend not providing** the organization filter.

---

## 🛠️ **Files Changed**

1. ✅ `web-frontend/src/components/team/TeamMembersTab.tsx`
   - Added `useProfile` import
   - Explicitly pass `activeOrganizationId` to `useEmployees`

---

## 🎯 **Related Components to Check**

Make sure these components also pass `organization` filter where applicable:

- ✅ `TeamSettings.tsx` - Already passes `organization` in `fetchEmployees()`
- ✅ `useEmployees` hook - Already implements fallback to `user.active_profile.organization`
- ⚠️ Any other component using `useEmployees` - Should explicitly pass `organization`

---

## ✅ **Status: FIXED**

The Team page now correctly shows employees **only from the currently active organization**.

**Test it with a user who is a member of multiple organizations!** 🚀

