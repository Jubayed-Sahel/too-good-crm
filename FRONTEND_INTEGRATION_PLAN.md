# Frontend Integration Plan - Phase 2

## Overview
This document outlines the step-by-step plan to integrate the newly created backend APIs with the frontend React application, replacing all hardcoded data with real API calls.

---

## Current State

### ✅ Backend Complete
- 4 new models: Issue, Order, Payment, Activity
- Database migrations applied
- REST API endpoints live at `/api/issues/`, `/api/orders/`, `/api/payments/`, `/api/activities/`
- Django admin registered for manual testing

### 🔄 Frontend Status
- Still using hardcoded data from `mockData.ts`
- Components built and styled
- No API integration yet

---

## Phase 2 Roadmap

### Step 1: Create TypeScript Types (Priority: HIGH)

**Files to Create:**

1. **`src/types/issue.types.ts`**
```typescript
export interface Issue {
  id: number;
  code: string;
  issue_number: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: 'quality' | 'delivery' | 'payment' | 'communication' | 'other';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  vendor: number;
  vendor_name?: string;
  order?: number;
  order_number?: string;
  organization: number;
  assigned_to?: number;
  assigned_to_name?: string;
  created_by: number;
  resolved_by?: number;
  created_at: string;
  updated_at: string;
}

export interface CreateIssueData {
  title: string;
  description: string;
  priority: Issue['priority'];
  category: Issue['category'];
  status: Issue['status'];
  vendor: number;
  order?: number;
  assigned_to?: number;
}

export interface UpdateIssueData extends Partial<CreateIssueData> {}

export interface IssueStats {
  total: number;
  by_status: Record<Issue['status'], number>;
  by_priority: Record<Issue['priority'], number>;
  by_category: Record<Issue['category'], number>;
}
```

2. **`src/types/order.types.ts`**
```typescript
export interface OrderItem {
  id?: number;
  item_name: string;
  description?: string;
  quantity: number;
  unit_price: number;
  total_price?: number;
  sku?: string;
  unit?: string;
}

export interface Order {
  id: number;
  code: string;
  order_number: string;
  title: string;
  description?: string;
  order_type: 'purchase' | 'service';
  vendor: number;
  vendor_name?: string;
  customer?: number;
  customer_name?: string;
  total_amount: number;
  currency: string;
  order_date: string;
  delivery_date?: string;
  status: 'pending' | 'confirmed' | 'processing' | 'completed' | 'cancelled';
  organization: number;
  assigned_to?: number;
  assigned_to_name?: string;
  items?: OrderItem[];
  items_count?: number;
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface CreateOrderData {
  title: string;
  description?: string;
  order_type: Order['order_type'];
  vendor: number;
  customer?: number;
  total_amount: number;
  currency?: string;
  order_date: string;
  delivery_date?: string;
  status: Order['status'];
  assigned_to?: number;
  items: OrderItem[];
}

export interface UpdateOrderData extends Partial<CreateOrderData> {}

export interface OrderStats {
  total: number;
  total_revenue: number;
  by_status: Record<Order['status'], number>;
  by_type: Record<Order['order_type'], number>;
}
```

3. **`src/types/payment.types.ts`**
```typescript
export interface Payment {
  id: number;
  code: string;
  payment_number: string;
  invoice_number?: string;
  reference_number?: string;
  vendor?: number;
  vendor_name?: string;
  customer?: number;
  customer_name?: string;
  order?: number;
  order_number?: string;
  payment_type: 'incoming' | 'outgoing';
  payment_method: 'cash' | 'bank_transfer' | 'credit_card' | 'check' | 'online';
  amount: number;
  currency: string;
  payment_date: string;
  due_date?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  transaction_id?: string;
  processed_at?: string;
  processed_by?: number;
  notes?: string;
  organization: number;
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface CreatePaymentData {
  invoice_number?: string;
  reference_number?: string;
  vendor?: number;
  customer?: number;
  order?: number;
  payment_type: Payment['payment_type'];
  payment_method: Payment['payment_method'];
  amount: number;
  currency?: string;
  payment_date: string;
  due_date?: string;
  status: Payment['status'];
  transaction_id?: string;
  notes?: string;
}

export interface UpdatePaymentData extends Partial<CreatePaymentData> {}

export interface PaymentStats {
  total: number;
  total_amount: number;
  by_status: Record<Payment['status'], number>;
  by_payment_type: Record<Payment['payment_type'], number>;
  by_payment_method: Record<Payment['payment_method'], number>;
}
```

4. **`src/types/activity.types.ts`**
```typescript
export type ActivityType = 'call' | 'email' | 'telegram' | 'meeting' | 'note' | 'task';
export type ActivityStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

export interface Activity {
  id: number;
  organization: number;
  activity_type: ActivityType;
  activity_type_display?: string;
  title: string;
  description?: string;
  customer?: number;
  customer_name?: string;
  lead?: number;
  lead_name?: string;
  deal?: number;
  deal_name?: string;
  assigned_to?: number;
  assigned_to_name?: string;
  status: ActivityStatus;
  status_display?: string;
  scheduled_at?: string;
  completed_at?: string;
  duration_minutes?: number;
  
  // Call fields
  phone_number?: string;
  call_duration?: number;
  call_recording_url?: string;
  
  // Email fields
  email_subject?: string;
  email_body?: string;
  email_attachments?: string[];
  
  // Telegram fields
  telegram_username?: string;
  telegram_chat_id?: string;
  
  // Meeting fields
  meeting_location?: string;
  meeting_url?: string;
  attendees?: string[];
  
  // Task fields
  task_priority?: 'low' | 'medium' | 'high';
  task_due_date?: string;
  
  // Note fields
  is_pinned?: boolean;
  
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface CreateActivityData {
  activity_type: ActivityType;
  title: string;
  description?: string;
  customer?: number;
  lead?: number;
  deal?: number;
  assigned_to?: number;
  status: ActivityStatus;
  scheduled_at?: string;
  duration_minutes?: number;
  phone_number?: string;
  call_duration?: number;
  call_recording_url?: string;
  email_subject?: string;
  email_body?: string;
  email_attachments?: string[];
  telegram_username?: string;
  telegram_chat_id?: string;
  meeting_location?: string;
  meeting_url?: string;
  attendees?: string[];
  task_priority?: 'low' | 'medium' | 'high';
  task_due_date?: string;
  is_pinned?: boolean;
}

export interface UpdateActivityData extends Partial<CreateActivityData> {
  completed_at?: string;
}

export interface ActivityStats {
  total: number;
  by_status: Record<ActivityStatus, number>;
  by_type: Record<ActivityType, number>;
}
```

5. **Update `src/types/index.ts`**
```typescript
// Add these exports
export * from './issue.types';
export * from './order.types';
export * from './payment.types';
export * from './activity.types';
```

---

### Step 2: Create Service Layer (Priority: HIGH)

**Files to Create:**

1. **`src/services/issue.service.ts`**
```typescript
import api from './api';
import type { Issue, CreateIssueData, UpdateIssueData, IssueStats } from '@/types';

export const issueService = {
  // List all issues with optional filters
  getAll: async (params?: {
    vendor?: number;
    order?: number;
    priority?: string;
    category?: string;
    status?: string;
    assigned_to?: number;
    search?: string;
    ordering?: string;
    page?: number;
    page_size?: number;
  }) => {
    const response = await api.get<{ results: Issue[]; count: number }>('/issues/', { params });
    return response.data;
  },

  // Get single issue by ID
  getById: async (id: number) => {
    const response = await api.get<Issue>(`/issues/${id}/`);
    return response.data;
  },

  // Create new issue
  create: async (data: CreateIssueData) => {
    const response = await api.post<Issue>('/issues/', data);
    return response.data;
  },

  // Update existing issue
  update: async (id: number, data: UpdateIssueData) => {
    const response = await api.put<Issue>(`/issues/${id}/`, data);
    return response.data;
  },

  // Delete issue
  delete: async (id: number) => {
    await api.delete(`/issues/${id}/`);
  },

  // Resolve issue
  resolve: async (id: number) => {
    const response = await api.post<Issue>(`/issues/${id}/resolve/`);
    return response.data;
  },

  // Reopen issue
  reopen: async (id: number) => {
    const response = await api.post<Issue>(`/issues/${id}/reopen/`);
    return response.data;
  },

  // Get issue statistics
  getStats: async () => {
    const response = await api.get<IssueStats>('/issues/stats/');
    return response.data;
  },
};
```

2. **`src/services/order.service.ts`**
```typescript
import api from './api';
import type { Order, CreateOrderData, UpdateOrderData, OrderStats } from '@/types';

export const orderService = {
  getAll: async (params?: {
    vendor?: number;
    customer?: number;
    order_type?: string;
    status?: string;
    assigned_to?: number;
    search?: string;
    ordering?: string;
    page?: number;
    page_size?: number;
  }) => {
    const response = await api.get<{ results: Order[]; count: number }>('/orders/', { params });
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get<Order>(`/orders/${id}/`);
    return response.data;
  },

  create: async (data: CreateOrderData) => {
    const response = await api.post<Order>('/orders/', data);
    return response.data;
  },

  update: async (id: number, data: UpdateOrderData) => {
    const response = await api.put<Order>(`/orders/${id}/`, data);
    return response.data;
  },

  delete: async (id: number) => {
    await api.delete(`/orders/${id}/`);
  },

  complete: async (id: number) => {
    const response = await api.post<Order>(`/orders/${id}/complete/`);
    return response.data;
  },

  cancel: async (id: number) => {
    const response = await api.post<Order>(`/orders/${id}/cancel/`);
    return response.data;
  },

  getStats: async () => {
    const response = await api.get<OrderStats>('/orders/stats/');
    return response.data;
  },
};
```

3. **`src/services/payment.service.ts`**
```typescript
import api from './api';
import type { Payment, CreatePaymentData, UpdatePaymentData, PaymentStats } from '@/types';

export const paymentService = {
  getAll: async (params?: {
    vendor?: number;
    customer?: number;
    order?: number;
    payment_type?: string;
    payment_method?: string;
    status?: string;
    search?: string;
    ordering?: string;
    page?: number;
    page_size?: number;
  }) => {
    const response = await api.get<{ results: Payment[]; count: number }>('/payments/', { params });
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get<Payment>(`/payments/${id}/`);
    return response.data;
  },

  create: async (data: CreatePaymentData) => {
    const response = await api.post<Payment>('/payments/', data);
    return response.data;
  },

  update: async (id: number, data: UpdatePaymentData) => {
    const response = await api.put<Payment>(`/payments/${id}/`, data);
    return response.data;
  },

  delete: async (id: number) => {
    await api.delete(`/payments/${id}/`);
  },

  process: async (id: number) => {
    const response = await api.post<Payment>(`/payments/${id}/process/`);
    return response.data;
  },

  markFailed: async (id: number) => {
    const response = await api.post<Payment>(`/payments/${id}/mark_failed/`);
    return response.data;
  },

  getStats: async () => {
    const response = await api.get<PaymentStats>('/payments/stats/');
    return response.data;
  },
};
```

4. **Update `src/services/activity.service.ts`**
   - Replace mock implementation with real API calls
   - Add all CRUD operations
   - Add custom actions: complete, cancel, stats, upcoming, overdue

5. **Update `src/services/index.ts`**
```typescript
export * from './issue.service';
export * from './order.service';
export * from './payment.service';
// ... existing exports
```

---

### Step 3: Create Custom Hooks (Priority: HIGH)

**Files to Create:**

1. **`src/hooks/useIssues.ts`**
```typescript
import { useState, useEffect } from 'react';
import { issueService } from '@/services';
import type { Issue, IssueStats } from '@/types';

export const useIssues = (filters?: any) => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        setLoading(true);
        const data = await issueService.getAll(filters);
        setIssues(data.results);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchIssues();
  }, [JSON.stringify(filters)]);

  return { issues, loading, error, refetch: () => {} };
};

export const useIssueStats = () => {
  const [stats, setStats] = useState<IssueStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await issueService.getStats();
        setStats(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, loading, error };
};
```

2. **`src/hooks/useOrders.ts`** - Similar pattern
3. **`src/hooks/usePayments.ts`** - Similar pattern

4. **Update `src/hooks/index.ts`**
```typescript
export * from './useIssues';
export * from './useOrders';
export * from './usePayments';
// ... existing exports
```

---

### Step 4: Update Page Components (Priority: MEDIUM)

**Files to Update:**

1. **`src/pages/ClientIssuesPage.tsx`**
   - Replace mock data import with `useIssues` hook
   - Replace stats calculation with `useIssueStats` hook
   - Add error handling UI
   - Add empty state UI

2. **`src/pages/OrdersPage.tsx`**
   - Replace mock data with `useOrders` hook
   - Use `orderService` for CRUD operations
   - Add loading states

3. **`src/pages/PaymentsPage.tsx`**
   - Replace mock data with `usePayments` hook
   - Use `paymentService` for CRUD operations
   - Add error handling

4. **`src/pages/ActivitiesPage.tsx`**
   - Update to use new Activity API
   - Replace mock data with real API calls

---

### Step 5: Update Component Props and State (Priority: MEDIUM)

**Files to Update:**

1. **`src/components/client-issues/IssueFilters.tsx`**
   - Update filter state to match API query params
   - Pass filters to parent component

2. **`src/components/client-issues/IssueTable.tsx`**
   - Update to handle API response format
   - Add pagination controls

3. **Similar updates for:**
   - Order components
   - Payment components
   - Activity components

---

### Step 6: Deprecate Mock Data (Priority: LOW)

**Files to Update/Remove:**

1. **`src/data/mockData.ts`**
   - Remove or comment out mock issue data
   - Remove mock order data
   - Remove mock payment data
   - Mark file as deprecated

2. **Remove mock data imports from:**
   - All page components
   - All service files
   - All hook files

---

### Step 7: Add Error Boundaries and Loading States (Priority: MEDIUM)

**Files to Create/Update:**

1. **Create `src/components/common/ErrorBoundary.tsx`**
2. **Create `src/components/common/LoadingSpinner.tsx`**
3. **Create `src/components/common/EmptyState.tsx`**
4. **Update all page components to use these**

---

### Step 8: Testing Checklist (Priority: HIGH)

**Manual Testing:**

- [ ] Test Issue CRUD operations
- [ ] Test Issue filtering and searching
- [ ] Test Issue resolve/reopen actions
- [ ] Test Issue statistics display
- [ ] Test Order CRUD with items
- [ ] Test Order complete/cancel actions
- [ ] Test Order statistics
- [ ] Test Payment CRUD operations
- [ ] Test Payment process/fail actions
- [ ] Test Payment statistics
- [ ] Test Activity CRUD operations
- [ ] Test Activity complete/cancel actions
- [ ] Test Activity upcoming/overdue lists
- [ ] Test pagination on all list pages
- [ ] Test error handling (network errors, validation errors)
- [ ] Test loading states
- [ ] Test empty states

---

## Implementation Order (Recommended)

### Week 1: Foundation
1. Create all TypeScript types
2. Create all service files
3. Test API calls with Postman/curl

### Week 2: Issues Page
4. Create `useIssues` and `useIssueStats` hooks
5. Update `ClientIssuesPage.tsx`
6. Update Issue components
7. Test Issues page end-to-end

### Week 3: Orders Page
8. Create `useOrders` hook
9. Update `OrdersPage.tsx`
10. Update Order components
11. Test Orders page end-to-end

### Week 4: Payments & Activities
12. Create `usePayments` hook
13. Update `PaymentsPage.tsx`
14. Update `ActivitiesPage.tsx`
15. Update Payment/Activity components
16. Test both pages end-to-end

### Week 5: Polish
17. Add error boundaries
18. Add loading spinners
19. Add empty states
20. Deprecate mock data
21. Final integration testing

---

## Expected Challenges

### Challenge 1: Date/Time Formatting
**Issue:** Backend returns ISO 8601 strings, frontend expects formatted dates
**Solution:** Create utility functions in `src/utils/format.ts`

### Challenge 2: Pagination
**Issue:** Backend uses cursor pagination, frontend may need page numbers
**Solution:** Update pagination components to match DRF pagination format

### Challenge 3: Nested Data
**Issue:** Backend returns nested objects, frontend expects flat data
**Solution:** Update TypeScript types to include both formats, transform in service layer

### Challenge 4: Organization Scoping
**Issue:** All data is scoped to current organization
**Solution:** Ensure auth token includes organization context, backend filters automatically

---

## Success Criteria

- [ ] All 4 pages (Issues, Orders, Payments, Activities) use real API data
- [ ] No mock data imports remain in production code
- [ ] All CRUD operations work correctly
- [ ] All custom actions (resolve, complete, process, etc.) work
- [ ] Statistics endpoints display accurate data
- [ ] Filtering, searching, and ordering work on all list pages
- [ ] Pagination works correctly
- [ ] Error handling shows user-friendly messages
- [ ] Loading states provide good UX
- [ ] Empty states guide users to create data

---

## Next Steps After Phase 2

### Phase 3: Advanced Features
- Lookup endpoints for dropdown data (categories, statuses, etc.)
- Real-time updates with WebSockets
- File upload for attachments
- Export to CSV/PDF
- Advanced analytics and charts

### Phase 4: Optimization
- Implement caching strategies
- Add optimistic UI updates
- Implement infinite scroll
- Add search debouncing
- Optimize bundle size

---

**Phase**: Phase 2 (Frontend Integration)  
**Status**: ⏳ **PENDING** (Backend Complete)  
**Estimated Duration**: 4-5 weeks  
**Priority**: HIGH

**Prerequisites:**
1. ✅ Backend API complete
2. ✅ Migrations applied
3. ⏳ Django server running
4. ⏳ `django-filter` installed

**Ready to Start:** YES (All backend dependencies complete)
