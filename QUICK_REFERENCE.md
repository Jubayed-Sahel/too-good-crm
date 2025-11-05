# Quick Reference: Refactored Code Organization

**Last Updated:** November 6, 2025

---

## 🎯 Quick Links

- **Full Refactoring Summary:** `REFACTORING_SUMMARY_2025.md`
- **Backend Architecture:** `shared-backend/BACKEND_ARCHITECTURE.md`
- **Backend Overview:** `shared-backend/README_OVERVIEW.md`

---

## 📦 Import Cheat Sheet

### Frontend Imports

```typescript
// ✅ Config & Constants
import { API_CONFIG, ROUTES, STORAGE_KEYS } from '@/config';

// ✅ Components (new barrel export)
import { LoginForm, Card, DashboardHeader } from '@/components';

// ✅ Hooks
import { useAuth, useCustomers, useDeals } from '@/hooks';

// ✅ Services
import { authService, customerService, dealService } from '@/services';

// ✅ Types
import type { Customer, Deal, Lead } from '@/types';

// ✅ Utils (includes new error handling)
import { 
  formatCurrency, 
  formatDate, 
  isValidEmail,
  extractErrorMessage,
  handleErrorWithToast 
} from '@/utils';
```

### Backend Imports

```python
# ✅ Models
from crmApp.models import User, Customer, Lead, Deal

# ✅ Serializers
from crmApp.serializers import (
    CustomerSerializer,
    CustomerListSerializer,
    LeadSerializer,
    DealSerializer
)

# ✅ Services
from crmApp.services import (
    CustomerService,
    LeadService,
    DealService,
    AnalyticsService
)

# ✅ Error Handling (NEW)
from crmApp.error_handler import (
    error_response,
    success_response,
    BusinessLogicError,
    ResourceNotFoundError
)

# ✅ Utilities
from crmApp.utils import (
    normalize_phone,
    validate_email,
    format_currency
)
```

---

## 🔧 Common Patterns

### Frontend Error Handling

```typescript
// Pattern 1: With toast notification
import { handleErrorWithToast } from '@/utils';
import { toaster } from '@/components/ui/toaster';

try {
  await someApiCall();
} catch (error) {
  handleErrorWithToast(error, toaster, 'Operation failed');
}

// Pattern 2: Manual error extraction
import { extractErrorMessage, formatValidationErrors } from '@/utils';

try {
  await someApiCall();
} catch (error) {
  const message = extractErrorMessage(error);
  const fieldErrors = formatValidationErrors(error);
  setErrors(fieldErrors);
}
```

### Frontend API Calls

```typescript
import { API_CONFIG, buildUrl } from '@/config';
import { apiClient } from '@/services';

// Simple GET
const response = await apiClient.get(API_CONFIG.ENDPOINTS.CUSTOMERS.LIST);

// GET with query params
const url = buildUrl(API_CONFIG.ENDPOINTS.CUSTOMERS.LIST, {
  page: 1,
  page_size: 25,
  search: 'john',
  status: 'active'
});
const response = await apiClient.get(url);

// POST
const response = await apiClient.post(
  API_CONFIG.ENDPOINTS.CUSTOMERS.LIST,
  customerData
);

// Dynamic endpoint
const customerId = 123;
const response = await apiClient.get(
  API_CONFIG.ENDPOINTS.CUSTOMERS.DETAIL(customerId)
);
```

### Backend ViewSet Responses

```python
from rest_framework.decorators import action
from rest_framework.response import Response
from crmApp.error_handler import success_response, error_response

class CustomerViewSet(viewsets.ModelViewSet):
    
    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        customer = self.get_object()
        
        if customer.status == 'active':
            return error_response(
                "Customer is already active",
                status_code=400
            )
        
        customer.status = 'active'
        customer.save()
        
        return success_response(
            CustomerSerializer(customer).data,
            message="Customer activated successfully"
        )
```

### Backend Service Layer

```python
from crmApp.services import CustomerService
from crmApp.error_handler import BusinessLogicError

class CustomerViewSet(viewsets.ModelViewSet):
    
    def create(self, request):
        try:
            customer = CustomerService.create_customer(
                request.data,
                created_by=request.user,
                organization=request.user.current_organization
            )
            return success_response(
                CustomerSerializer(customer).data,
                message="Customer created successfully",
                status_code=201
            )
        except BusinessLogicError as e:
            return error_response(str(e), status_code=e.status_code)
```

---

## 🗂️ File Organization

### Frontend Structure
```
src/
├── components/
│   ├── index.ts          # ⭐ NEW: Barrel export
│   ├── auth/
│   │   └── index.ts      # Category export
│   ├── common/
│   │   └── index.ts
│   └── ...
├── config/
│   ├── index.ts          # ⭐ Enhanced
│   ├── api.config.ts     # ⭐ Added analytics
│   └── constants.ts
├── hooks/
│   └── index.ts          # ✨ Cleaned up
├── services/
│   └── index.ts
├── types/
│   └── index.ts
└── utils/
    ├── index.ts          # ⭐ Updated
    ├── format.ts
    ├── validation.ts
    └── errorHandling.ts  # ⭐ NEW
```

### Backend Structure
```
crmApp/
├── models/               # Database layer
├── serializers/          # API serialization
│   └── __init__.py       # ✅ Has __all__
├── viewsets/             # HTTP/API layer
│   └── __init__.py       # ✅ Has __all__
├── services/             # Business logic
│   └── __init__.py       # ✅ Has __all__
├── error_handler.py      # ⭐ NEW
├── utils.py
├── validators.py
├── permissions.py
└── mixins.py
```

---

## 🚀 Migration Guide

### Updating Imports (Frontend)

```typescript
// Old way
import LoginForm from '../../components/auth/LoginForm';
import Card from '../../components/common/Card';

// New way
import { LoginForm, Card } from '@/components';
```

### Using Error Handling (Frontend)

```typescript
// Old way
catch (error) {
  const message = error.response?.data?.detail || 
                  error.response?.data?.message || 
                  'An error occurred';
  toaster.create({
    title: 'Error',
    description: message,
    type: 'error'
  });
}

// New way
import { handleErrorWithToast } from '@/utils';

catch (error) {
  handleErrorWithToast(error, toaster, 'Operation');
}
```

### Using Config Constants (Frontend)

```typescript
// Old way
const token = localStorage.getItem('authToken');
const apiUrl = 'http://127.0.0.1:8000/api/customers/';

// New way
import { API_CONFIG, STORAGE_KEYS } from '@/config';

const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
const apiUrl = API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.CUSTOMERS.LIST;
```

---

## 📝 Key Takeaways

### Frontend
✅ Use barrel exports for cleaner imports  
✅ Use `@/utils/errorHandling` for all API errors  
✅ Import from `@/config` for all constants  
✅ All API endpoints defined in `api.config.ts`  

### Backend
✅ Backend already well-organized  
✅ Use `error_handler.py` for consistent responses  
✅ All modules have `__all__` declarations  
✅ Service layer handles business logic  

---

## 🔗 Related Files

- `REFACTORING_SUMMARY_2025.md` - Complete refactoring documentation
- `IMPLEMENTATION_PROGRESS.md` - Integration progress tracker
- `shared-backend/BACKEND_ARCHITECTURE.md` - Backend technical docs
- `shared-backend/REFACTORING_SUMMARY.md` - Service layer details

---

**Quick Start:** Just import what you need from the barrel exports! 🚀
