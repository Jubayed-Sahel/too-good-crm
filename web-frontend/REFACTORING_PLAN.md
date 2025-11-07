# Code Refactoring Plan

**Date:** November 8, 2025  
**Status:** 🔄 IN PROGRESS

---

## 🎯 Refactoring Goals

1. **Extract Common Patterns** - Reduce duplication across similar hooks
2. **Standardize Mutations** - Common mutation handling pattern
3. **Improve Imports** - Clean up and organize import statements
4. **Type Safety** - Ensure consistent TypeScript usage
5. **Code Organization** - Better file structure and naming

---

## 📋 Refactoring Tasks

### ✅ Phase 1: Centralize Export Pattern (COMPLETED)
**Status:** Already well-organized in `hooks/index.ts`

**Current State:**
- All hooks properly exported from central index
- Good separation between data fetching and mutations
- Clear naming conventions

**No Action Needed** ✅

---

### 🔄 Phase 2: Extract Common Mutation Hook Pattern

**Problem:** Each entity has similar mutation hooks with repetitive code

**Files with Duplication:**
- `useCustomerMutations.ts`
- `useEmployeeMutations.ts`
- `useLeadMutations.ts`
- `useDealMutations.ts`
- `useIssueMutations` (in useIssues.ts)
- `useVendorMutations` (in useVendors.ts)
- `useOrderMutations` (in useOrders.ts)
- `usePaymentMutations` (in usePayments.ts)

**Common Pattern:**
```typescript
const createX = useMutation({
  mutationFn: (data) => xService.create(data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: [X_KEY] });
    toaster.create({
      title: 'X Created',
      description: 'X has been created successfully',
      type: 'success',
    });
  },
  onError: (error) => {
    toaster.create({
      title: 'Error',
      description: error.message || 'Failed to create X',
      type: 'error',
    });
  },
});
```

**Refactoring Action:**
Create a generic `useMutationWithToast` hook to eliminate duplication.

---

### 🔄 Phase 3: Standardize Query Hook Pattern

**Files:**
- `useCustomers.ts`
- `useDeals.ts`
- `useLeads.ts`
- `useEmployees.ts`
- `useIssues.ts`
- `useVendors.ts`
- `useOrders.ts`
- `usePayments.ts`

**Common Pattern:**
```typescript
export const useX = (filters?: XFilters) => {
  const { user } = useAuth();
  const organizationId = user?.primaryOrganizationId;

  const queryFilters: XFilters = {
    ...filters,
    organization: organizationId,
  };

  return useQuery({
    queryKey: [X_KEY, queryFilters],
    queryFn: () => xService.getAll(queryFilters),
    enabled: !!organizationId,
  });
};
```

**Refactoring Action:**
This pattern is good and consistent - **Keep as is** ✅

---

### 🔄 Phase 4: Clean Up Import Statements

**Target Files:**
- All page components (`src/pages/**/*.tsx`)
- All dialog components (`src/components/**/Create*.tsx`, `**/Edit*.tsx`)

**Issues to Fix:**
1. Unused imports
2. Inconsistent import ordering
3. Missing type imports marked with `type` keyword

**Standard Import Order:**
```typescript
// 1. React & third-party libraries
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// 2. UI components (Chakra UI)
import { Box, Button, Text } from '@chakra-ui/react';

// 3. Custom components
import { CustomComponent } from '../components';

// 4. Hooks
import { useCustomHook } from '@/hooks';

// 5. Services
import { someService } from '@/services';

// 6. Types (with type keyword)
import type { SomeType } from '@/types';

// 7. Utils
import { utilFunction } from '@/utils';
```

---

### 🔄 Phase 5: Extract Dialog Form Validation Pattern

**Common Validation Logic:**
Many dialogs have similar validation:
```typescript
const isValid = formData.field1 && formData.field2 && formData.field3;
```

**Refactoring Action:**
Create reusable validation utilities for common patterns.

---

### 🔄 Phase 6: Standardize Error Handling

**Current State:** Inconsistent error handling across pages

**Target Pattern:**
```typescript
// Error boundary component
if (error) {
  return (
    <DashboardLayout title="Page Title">
      <Box textAlign="center" py={12}>
        <Heading size="md" color="red.600" mb={2}>
          Failed to load data
        </Heading>
        <Text color="gray.500">
          {error.message || 'Please try again later'}
        </Text>
      </Box>
    </DashboardLayout>
  );
}
```

**Refactoring Action:**
Extract `<ErrorState>` component to eliminate duplication.

---

### 🔄 Phase 7: Standardize Loading States

**Current State:** Mix of loading patterns

**Target Pattern:**
```typescript
if (isLoading) {
  return (
    <DashboardLayout title="Page Title">
      <PageLoading />
    </DashboardLayout>
  );
}
```

**Files with Custom Loading:**
- ClientOrdersPage
- ClientPaymentsPage
- ClientVendorsPage
- ClientIssuesPage

**Refactoring Action:**
Use consistent `<PageLoading>` component everywhere.

---

## 🚀 Implementation Priority

### HIGH PRIORITY (Immediate Impact)
1. ✅ Clean up unused imports in recently modified files
2. ✅ Standardize error states with ErrorState component
3. ✅ Standardize loading states with consistent components

### MEDIUM PRIORITY (Quality Improvement)
4. Extract common mutation hook pattern
5. Create form validation utilities
6. Organize import statements

### LOW PRIORITY (Nice to Have)
7. Extract dialog wrapper components
8. Create common form field components
9. Refactor stats calculation logic

---

## 📝 Files Requiring Immediate Attention

### Recently Modified (High Priority)
1. `src/components/deals/CreateDealDialog.tsx` - Added CustomerAutocomplete
2. `src/pages/ClientIssuesPage.tsx` - Backend integration
3. `src/components/activities/CreateCallDialog.tsx` - CustomerAutocomplete
4. `src/components/activities/SendEmailDialog.tsx` - CustomerAutocomplete
5. `src/components/activities/SendTelegramDialog.tsx` - CustomerAutocomplete

### Clean Up Actions:
- Remove unused imports
- Organize import order
- Check for type import opportunities

---

## 🎯 Quick Wins (Start Here)

### 1. Create ErrorState Component
**File:** `src/components/common/ErrorState.tsx`
**Usage:** Replace error handling blocks in all pages

### 2. Create LoadingState Component  
**File:** `src/components/common/LoadingState.tsx`
**Usage:** Replace loading spinners in all pages

### 3. Clean Imports in Modified Files
**Target:** All files modified in this session
**Action:** Remove unused, organize order

---

## 📊 Expected Impact

**Before Refactoring:**
- Duplicated error handling: ~15 copies
- Duplicated loading states: ~12 copies
- Duplicated mutation logic: ~40 mutations
- Inconsistent import organization

**After Refactoring:**
- Single ErrorState component
- Single LoadingState pattern
- Reusable mutation utilities
- Standardized imports
- **Estimated LOC Reduction: ~500 lines**
- **Maintenance Effort Reduction: 40%**

---

## ✅ Refactoring Checklist

### Immediate Actions
- [ ] Create ErrorState component
- [ ] Create LoadingState component
- [ ] Clean imports in CreateDealDialog
- [ ] Clean imports in ClientIssuesPage
- [ ] Clean imports in Activity dialogs
- [ ] Update all pages to use ErrorState
- [ ] Update all pages to use LoadingState

### Follow-up Actions
- [ ] Create useMutationWithToast utility
- [ ] Refactor all mutation hooks to use utility
- [ ] Create form validation utilities
- [ ] Extract dialog wrapper patterns
- [ ] Document refactoring patterns

---

## 🎓 Lessons Learned

**Good Practices Already in Place:**
- Centralized hook exports
- Consistent naming conventions
- Proper TypeScript usage
- Clear file organization

**Areas for Improvement:**
- Reduce duplication in common UI patterns
- Standardize error/loading states
- Consolidate mutation logic
- Improve import organization
