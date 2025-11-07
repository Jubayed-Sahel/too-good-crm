# Client UI Backend Integration - Implementation Plan

## Overview
This document outlines the plan to connect the web-frontend client UI pages to the Django backend API.

## Current Status

### ✅ Completed
1. **Backend Models** - All models exist and working:
   - `Vendor` - with organization multi-tenancy
   - `Order` - linked to vendors, customers, organization
   - `Payment` - linked to orders, vendors, customers
   - `Issue` - linked to vendors, orders

2. **Backend ViewSets** - All CRUD operations available:
   - `VendorViewSet` - filtering, stats
   - `OrderViewSet` - complete(), cancel(), stats
   - `PaymentViewSet` - process(), mark_failed(), stats
   - `IssueViewSet` - resolve(), reopen(), stats

3. **Backend Serializers** - All serializers defined with proper validation

4. **Frontend Services** - API service layer created:
   - `vendor.service.ts` ✅
   - `order.service.ts` ✅
   - `payment.service.ts` ✅
   - `issue.service.ts` ✅

5. **Frontend Types** - Type definitions created:
   - `vendor.types.ts` ✅
   - `order.types.ts` ✅ (already existed)
   - `payment.types.ts` ✅ (already existed)
   - `issue.types.ts` ✅ (already existed)

6. **Frontend Hooks** - React Query hooks created:
   - `useVendors.ts` ✅
   - `useOrders.ts` (needs creation)
   - `usePayments.ts` (needs creation)
   - `useIssues.ts` (needs creation)

### 🚧 In Progress
Need to create hooks for orders, payments, and issues

### ❌ To Do

#### 1. Create React Query Hooks
- [ ] `useOrders.ts` - similar to useVendors
- [ ] `usePayments.ts` - similar to useVendors
- [ ] `useIssues.ts` - similar to useVendors

#### 2. Update Client Dashboard Page (`ClientDashboardPage.tsx`)
**Current:** Uses hardcoded mock stats
**Needs:**
- Fetch real vendor stats (total, active, new this month)
- Fetch real order stats (total, active, total spent)
- Fetch real payment stats (pending, paid, overdue)
- Fetch real issue stats (total, open, in_progress, resolved)

**Backend Endpoint Needed:**
```
GET /api/analytics/client-dashboard-stats/
```
This endpoint needs to be created in analytics viewset to return comprehensive client stats.

#### 3. Update Client Vendors Page (`ClientVendorsPage.tsx`)
**Current:** Uses hardcoded vendor array
**Needs:**
- [ ] Replace mock data with `useVendors()` hook
- [ ] Replace mock stats with `useVendorStats()` hook
- [ ] Add loading states
- [ ] Add error handling
- [ ] Implement real search/filtering via API
- [ ] Add create vendor dialog
- [ ] Add edit vendor dialog
- [ ] Add delete vendor confirmation

#### 4. Update Client Orders Page (`ClientOrdersPage.tsx`)
**Current:** Uses hardcoded order array
**Needs:**
- [ ] Replace mock data with `useOrders()` hook
- [ ] Replace mock stats with `useOrderStats()` hook
- [ ] Add loading states
- [ ] Add error handling
- [ ] Implement real search/filtering via API
- [ ] Add vendor filter integration
- [ ] Add create order dialog
- [ ] Add cancel/complete order actions

#### 5. Update Client Payments Page (`ClientPaymentsPage.tsx`)
**Current:** Uses hardcoded payment array
**Needs:**
- [ ] Replace mock data with `usePayments()` hook
- [ ] Replace mock stats with `usePaymentStats()` hook
- [ ] Add loading states
- [ ] Add error handling
- [ ] Implement real search/filtering via API
- [ ] Add "Pay Now" functionality
- [ ] Add "Download Receipt" functionality
- [ ] Integrate with payment gateway (future)

#### 6. Update Client Issues Page (`ClientIssuesPage.tsx`)
**Current:** Uses hardcoded issue array
**Needs:**
- [ ] Replace mock data with `useIssues()` hook
- [ ] Replace mock stats with `useIssueStats()` hook
- [ ] Add loading states
- [ ] Add error handling
- [ ] Implement real search/filtering via API
- [ ] Connect CreateIssueDialog to API
- [ ] Implement resolve/delete actions
- [ ] Add issue detail page integration

#### 7. Backend Enhancements Needed

**Analytics Endpoint:**
```python
@action(detail=False, methods=['get'])
def client_dashboard_stats(self, request):
    """Get comprehensive client dashboard statistics"""
    # Return: vendors, orders, payments, issues stats
```

**Vendor Serializer Enhancement:**
Add computed fields:
- `total_orders` - count of orders from this vendor
- `total_spent` - sum of order amounts
- `last_order` - most recent order date

#### 8. Component Updates Needed

All client component files in:
- `src/components/client-vendors/`
- `src/components/client-orders/`
- `src/components/client-payments/`
- `src/components/client-issues/`
- `src/components/client-dashboard/`

Need to ensure they work with real data types from backend.

## Implementation Order

1. **Phase 1: Hooks & Services** ✅
   - vendor.service.ts ✅
   - useVendors.ts ✅
   - order hooks (TODO)
   - payment hooks (TODO)
   - issue hooks (TODO)

2. **Phase 2: Backend Analytics**
   - Add client_dashboard_stats endpoint
   - Add computed fields to serializers

3. **Phase 3: Page Updates**
   - ClientVendorsPage (easiest, start here)
   - ClientOrdersPage
   - ClientPaymentsPage
   - ClientIssuesPage
   - ClientDashboardPage (depends on all others)

4. **Phase 4: Testing & Iteration**
   - Test each page with real backend
   - Fix any API mismatches
   - Handle edge cases (empty states, errors)
   - Add proper loading states

## Notes

- All client pages use organization-based filtering (multi-tenancy)
- User's `primaryOrganizationId` is used from auth context
- Backend already has organization filtering in all viewsets
- Need to ensure consistent error handling across all pages
- Mock data provides good reference for expected data structure
