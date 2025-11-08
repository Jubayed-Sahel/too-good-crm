# Modularization Implementation Guide

**Date:** November 8, 2025  
**Status:** 📋 READY TO IMPLEMENT

---

## Quick Start

This guide provides step-by-step instructions to modularize the codebase incrementally without breaking existing functionality.

---

## Phase 1: Setup Infrastructure (Day 1)

### 1.1 Update Path Aliases

**File: `web-frontend/tsconfig.json`**
```jsonc
{
  "compilerOptions": {
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@features/*": ["./src/features/*"],
      "@shared/*": ["./src/shared/*"],
      "@core/*": ["./src/core/*"]
    }
  },
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
```

**File: `web-frontend/tsconfig.app.json`**
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@features/*": ["./src/features/*"],
      "@shared/*": ["./src/shared/*"],
      "@core/*": ["./src/core/*"]
    }
  }
}
```

### 1.2 Create Directory Structure

**Run these commands:**
```powershell
# Frontend
cd web-frontend\src
mkdir features\customers\components, features\customers\hooks, features\customers\services, features\customers\types, features\customers\pages
mkdir shared\components, shared\hooks, shared\utils, shared\types, shared\contexts, shared\constants
mkdir core\api, core\config, core\router, core\theme

# Or create all at once
mkdir features, shared, core
mkdir features\auth, features\customers, features\deals, features\leads, features\activities
mkdir features\employees, features\analytics, features\client, features\settings, features\dashboard
```

---

## Phase 2: Proof of Concept - Customers Feature (Day 1-2)

### 2.1 Move Shared Components First

**Create: `web-frontend/src/shared/components/ErrorBoundary.tsx`**
```typescript
// Move from src/components/common/ErrorBoundary.tsx
export { default } from '@/components/common/ErrorBoundary';
```

**Create: `web-frontend/src/shared/components/index.ts`**
```typescript
export { default as ErrorBoundary } from './ErrorBoundary';
export { default as ErrorState } from './ErrorState';
export { default as LoadingState } from './LoadingState';
```

### 2.2 Move Customers Feature

**Create: `web-frontend/src/features/customers/index.ts`** (Barrel Export)
```typescript
// Components
export { default as CustomerCard } from './components/CustomerCard';
export { default as CustomerForm } from './components/CustomerForm';
export { default as CustomerList } from './components/CustomerList';
export { default as CustomerAutocomplete } from './components/CustomerAutocomplete';

// Hooks
export { useCustomers } from './hooks/useCustomers';
export { useCustomerMutations } from './hooks/useCustomerMutations';
export { useCustomersPage } from './hooks/useCustomersPage';

// Pages
export { default as CustomersPage } from './pages/CustomersPage';
export { default as CustomerDetailPage } from './pages/CustomerDetailPage';
export { default as EditCustomerPage } from './pages/EditCustomerPage';

// Services
export * from './services/customer.service';

// Types
export type * from './types/customer.types';
```

**Move Files:**
1. `src/components/customers/*` → `src/features/customers/components/`
2. `src/hooks/useCustomers.ts` → `src/features/customers/hooks/`
3. `src/hooks/useCustomerMutations.ts` → `src/features/customers/hooks/`
4. `src/hooks/useCustomersPage.ts` → `src/features/customers/hooks/`
5. `src/services/customer.service.ts` → `src/features/customers/services/`
6. `src/types/customer.types.ts` → `src/features/customers/types/`
7. `src/pages/CustomersPage.tsx` → `src/features/customers/pages/`
8. `src/pages/CustomerDetailPage.tsx` → `src/features/customers/pages/`
9. `src/pages/EditCustomerPage.tsx` → `src/features/customers/pages/`

### 2.3 Update Imports in Customers Feature

**Before:**
```typescript
import { Customer } from '@/types/customer.types';
import { useCustomers } from '@/hooks';
import { customerService } from '@/services';
import { CustomerCard } from '@/components/customers';
```

**After:**
```typescript
import type { Customer } from '../types/customer.types';
import { useCustomers } from '../hooks/useCustomers';
import { customerService } from '../services/customer.service';
import { CustomerCard } from '../components/CustomerCard';
```

**Or using barrel exports:**
```typescript
import { 
  Customer, 
  useCustomers, 
  customerService, 
  CustomerCard 
} from '@features/customers';
```

### 2.4 Update Router

**File: `web-frontend/src/core/router/index.tsx`**
```typescript
import { createBrowserRouter } from 'react-router-dom';

// Feature imports
import { 
  CustomersPage, 
  CustomerDetailPage, 
  EditCustomerPage 
} from '@features/customers';

import { 
  DealsPage, 
  DealDetailPage, 
  EditDealPage 
} from '@features/deals';

// ... other imports

export const router = createBrowserRouter([
  {
    path: '/customers',
    element: <CustomersPage />,
  },
  {
    path: '/customers/:id',
    element: <CustomerDetailPage />,
  },
  // ... other routes
]);
```

---

## Phase 3: Modularize Remaining Features (Day 3-5)

### 3.1 Deals Feature

**Create structure:**
```
features/deals/
├── components/
│   ├── DealCard.tsx
│   ├── DealForm.tsx
│   ├── PipelineBoard.tsx
│   └── StageColumn.tsx
├── hooks/
│   ├── useDeals.ts
│   ├── useDealMutations.ts
│   └── useDealsPage.ts
├── services/
│   └── deal.service.ts
├── types/
│   └── deal.types.ts
├── pages/
│   ├── DealsPage.tsx
│   ├── DealDetailPage.tsx
│   ├── EditDealPage.tsx
│   └── SalesPage.tsx
└── index.ts
```

### 3.2 Client Portal Features

**Create structure:**
```
features/client/
├── dashboard/
│   ├── components/
│   └── pages/
│       └── ClientDashboardPage.tsx
├── orders/
│   ├── components/
│   ├── hooks/
│   │   └── useOrders.ts
│   ├── services/
│   │   └── order.service.ts
│   └── pages/
│       ├── ClientOrdersPage.tsx
│       └── ClientOrderDetailPage.tsx
├── payments/
│   ├── components/
│   ├── hooks/
│   │   └── usePayments.ts
│   ├── services/
│   │   └── payment.service.ts
│   └── pages/
│       └── ClientPaymentsPage.tsx
├── vendors/
│   ├── components/
│   ├── hooks/
│   │   └── useVendors.ts
│   ├── services/
│   │   └── vendor.service.ts
│   └── pages/
│       └── ClientVendorsPage.tsx
├── issues/
│   ├── components/
│   ├── hooks/
│   │   └── useIssues.ts
│   ├── services/
│   │   └── issue.service.ts
│   └── pages/
│       ├── ClientIssuesPage.tsx
│       └── ClientIssueDetailPage.tsx
└── index.ts
```

### 3.3 Auth Feature

**Create structure:**
```
features/auth/
├── components/
│   └── RoleSelectionDialog.tsx
├── hooks/
│   ├── useAuth.ts
│   └── useRBAC.ts
├── services/
│   ├── auth.service.ts
│   └── rbac.service.ts
├── types/
│   └── auth.types.ts
├── pages/
│   ├── LoginPage.tsx
│   └── SignupPage.tsx
└── index.ts
```

---

## Phase 4: Backend Modularization (Day 6-8)

### 4.1 Create Core Infrastructure

**Create: `shared-backend/crmApp/core/exceptions/base.py`**
```python
# Move from crmApp/exceptions.py
from rest_framework.exceptions import APIException as DRFAPIException

class APIException(DRFAPIException):
    status_code = 500
    default_detail = 'A server error occurred.'
    default_code = 'error'

# ... rest of exceptions
```

### 4.2 Create Customers Domain

**Create structure:**
```
domains/customers/
├── __init__.py
├── models.py          # Move from models/customer.py
├── serializers.py     # Move from serializers/customer.py
├── viewsets.py        # Move from viewsets/customer.py
├── services.py        # Business logic
├── filters.py         # Query filters
└── urls.py           # URL routing
```

**File: `shared-backend/crmApp/domains/customers/urls.py`**
```python
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .viewsets import CustomerViewSet

router = DefaultRouter()
router.register(r'customers', CustomerViewSet, basename='customer')

urlpatterns = router.urls
```

**File: `shared-backend/crmApp/urls.py`**
```python
from django.urls import path, include

urlpatterns = [
    path('api/', include([
        path('', include('crmApp.domains.customers.urls')),
        path('', include('crmApp.domains.deals.urls')),
        path('', include('crmApp.domains.leads.urls')),
        # ... other domains
    ])),
]
```

### 4.3 Create Services Layer

**File: `shared-backend/crmApp/domains/customers/services.py`**
```python
from typing import Optional, List
from django.db.models import QuerySet
from .models import Customer
from crmApp.core.exceptions import NotFoundException

class CustomerService:
    """Business logic for customer management"""
    
    @staticmethod
    def get_customers_by_organization(organization_id: int) -> QuerySet[Customer]:
        """Get all customers for an organization"""
        return Customer.objects.filter(
            organization_id=organization_id
        ).select_related('organization', 'created_by')
    
    @staticmethod
    def create_customer(organization_id: int, data: dict, created_by_id: int) -> Customer:
        """Create a new customer"""
        customer = Customer.objects.create(
            organization_id=organization_id,
            created_by_id=created_by_id,
            **data
        )
        return customer
    
    @staticmethod
    def update_customer(customer_id: int, data: dict) -> Customer:
        """Update an existing customer"""
        try:
            customer = Customer.objects.get(id=customer_id)
            for key, value in data.items():
                setattr(customer, key, value)
            customer.save()
            return customer
        except Customer.DoesNotExist:
            raise NotFoundException('Customer not found')
    
    @staticmethod
    def delete_customer(customer_id: int) -> None:
        """Delete a customer"""
        try:
            customer = Customer.objects.get(id=customer_id)
            customer.delete()
        except Customer.DoesNotExist:
            raise NotFoundException('Customer not found')
```

**Update ViewSet to use Service:**
```python
from rest_framework import viewsets
from .models import Customer
from .serializers import CustomerSerializer
from .services import CustomerService

class CustomerViewSet(viewsets.ModelViewSet):
    serializer_class = CustomerSerializer
    
    def get_queryset(self):
        organization_id = self.request.organization.id
        return CustomerService.get_customers_by_organization(organization_id)
    
    def perform_create(self, serializer):
        organization_id = self.request.organization.id
        created_by_id = self.request.user.id
        CustomerService.create_customer(
            organization_id=organization_id,
            data=serializer.validated_data,
            created_by_id=created_by_id
        )
```

---

## Phase 5: Testing & Validation (Day 9-10)

### 5.1 Test Frontend Module

**Create: `web-frontend/src/features/customers/__tests__/useCustomers.test.ts`**
```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCustomers } from '../hooks/useCustomers';

describe('useCustomers', () => {
  it('should fetch customers', async () => {
    const queryClient = new QueryClient();
    const wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );

    const { result } = renderHook(() => useCustomers(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeDefined();
  });
});
```

### 5.2 Test Backend Module

**Create: `shared-backend/crmApp/domains/customers/tests/test_services.py`**
```python
from django.test import TestCase
from crmApp.domains.customers.services import CustomerService
from crmApp.domains.customers.models import Customer
from crmApp.domains.organizations.models import Organization
from django.contrib.auth import get_user_model

User = get_user_model()

class CustomerServiceTest(TestCase):
    def setUp(self):
        self.org = Organization.objects.create(name='Test Org')
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='password123'
        )
    
    def test_create_customer(self):
        customer_data = {
            'first_name': 'John',
            'last_name': 'Doe',
            'email': 'john@example.com'
        }
        
        customer = CustomerService.create_customer(
            organization_id=self.org.id,
            data=customer_data,
            created_by_id=self.user.id
        )
        
        self.assertIsNotNone(customer.id)
        self.assertEqual(customer.first_name, 'John')
        self.assertEqual(customer.organization_id, self.org.id)
```

---

## Phase 6: Documentation (Day 11)

### 6.1 Feature README

**Create: `web-frontend/src/features/customers/README.md`**
```markdown
# Customers Feature

Customer management functionality including CRUD operations, search, and filtering.

## Components

- **CustomerCard**: Display customer information in card format
- **CustomerForm**: Form for creating/editing customers
- **CustomerList**: List view of customers with filtering
- **CustomerAutocomplete**: Searchable customer selection

## Hooks

- **useCustomers()**: Fetch customers list
- **useCustomerMutations()**: Create, update, delete customers
- **useCustomersPage()**: Page-level state management

## Usage

```typescript
import { CustomersPage, useCustomers } from '@features/customers';

function MyComponent() {
  const { data: customers, isLoading } = useCustomers();
  
  if (isLoading) return <div>Loading...</div>;
  
  return <CustomerList customers={customers} />;
}
```

## API

See [API.md](./API.md) for detailed API documentation.
```

---

## Migration Checklist

### Frontend
- [ ] Phase 1: Setup path aliases
- [ ] Phase 2: Move customers feature
  - [ ] Move components
  - [ ] Move hooks
  - [ ] Move services
  - [ ] Move types
  - [ ] Move pages
  - [ ] Create barrel exports
  - [ ] Update imports
  - [ ] Test functionality
- [ ] Phase 3: Move remaining features
  - [ ] Deals
  - [ ] Leads
  - [ ] Activities
  - [ ] Employees
  - [ ] Client portal
  - [ ] Auth
  - [ ] Settings
  - [ ] Analytics
- [ ] Phase 4: Move shared code
  - [ ] Components
  - [ ] Hooks
  - [ ] Utils
  - [ ] Contexts
- [ ] Phase 5: Move core code
  - [ ] API client
  - [ ] Router
  - [ ] Theme
  - [ ] Config
- [ ] Phase 6: Cleanup
  - [ ] Remove old directories
  - [ ] Update all imports
  - [ ] Test all features
  - [ ] Update documentation

### Backend
- [ ] Phase 1: Create core infrastructure
  - [ ] Exceptions
  - [ ] Middleware
  - [ ] Permissions
  - [ ] Pagination
- [ ] Phase 2: Move customers domain
  - [ ] Models
  - [ ] Serializers
  - [ ] Viewsets
  - [ ] Services
  - [ ] URLs
  - [ ] Tests
- [ ] Phase 3: Move remaining domains
  - [ ] Deals
  - [ ] Leads
  - [ ] Activities
  - [ ] Employees
  - [ ] Orders
  - [ ] Payments
  - [ ] Issues
  - [ ] Organizations
- [ ] Phase 4: Cleanup
  - [ ] Remove old files
  - [ ] Update imports
  - [ ] Test all endpoints
  - [ ] Update documentation

---

## Rollback Plan

If issues arise:
1. Keep old structure during migration
2. Use feature flags to switch between old/new
3. Can revert by reverting path aliases
4. Database migrations are safe (no schema changes)

---

## Success Metrics

- ✅ Build passes without errors
- ✅ All tests pass
- ✅ No runtime errors
- ✅ Import statements simplified
- ✅ Code is easier to navigate
- ✅ Feature boundaries are clear

---

**Ready to Start:** Yes  
**Breaking Changes:** No  
**Safe to Implement:** Yes (incremental migration)
