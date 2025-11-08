# Quick Modularization Reference

**TL;DR:** Feature-based frontend, domain-driven backend. Everything related to one feature lives together.

---

## 🎯 Quick Wins

### Adding a New Feature (Frontend)

**1. Create feature directory:**
```powershell
cd web-frontend\src\features
mkdir my-feature\components, my-feature\hooks, my-feature\services, my-feature\types, my-feature\pages
```

**2. Create files:**
```
my-feature/
├── components/
│   └── MyComponent.tsx
├── hooks/
│   └── useMyFeature.ts
├── services/
│   └── my-feature.service.ts
├── types/
│   └── my-feature.types.ts
├── pages/
│   └── MyFeaturePage.tsx
└── index.ts          # Barrel export
```

**3. Export in index.ts:**
```typescript
export { default as MyComponent } from './components/MyComponent';
export { useMyFeature } from './hooks/useMyFeature';
export * from './services/my-feature.service';
export type * from './types/my-feature.types';
```

**4. Use anywhere:**
```typescript
import { MyComponent, useMyFeature } from '@features/my-feature';
```

---

### Adding a New Domain (Backend)

**1. Create domain directory:**
```powershell
cd shared-backend\crmApp\domains
mkdir my-domain
```

**2. Create files:**
```
my-domain/
├── __init__.py
├── models.py
├── serializers.py
├── viewsets.py
├── services.py
└── urls.py
```

**3. Register URLs:**
```python
# crmApp/urls.py
urlpatterns = [
    path('api/', include([
        path('', include('crmApp.domains.my-domain.urls')),
    ])),
]
```

---

## 📁 Directory Structure

### Frontend
```
src/
├── features/          # Feature modules (business logic)
│   ├── customers/     # All customer-related code
│   ├── deals/         # All deal-related code
│   └── auth/          # All auth-related code
│
├── shared/            # Shared across features
│   ├── components/    # Reusable UI components
│   ├── hooks/         # Common hooks
│   └── utils/         # Helper functions
│
└── core/              # Core infrastructure
    ├── api/           # API client
    ├── router/        # Routing
    └── theme/         # Theming
```

### Backend
```
crmApp/
├── domains/           # Business domains
│   ├── customers/     # Customer domain
│   ├── deals/         # Deal domain
│   └── auth/          # Auth domain
│
├── core/              # Core infrastructure
│   ├── exceptions/    # Exception handling
│   ├── middleware/    # Middleware
│   └── permissions/   # Permissions
│
└── shared/            # Shared utilities
    ├── mixins/        # Model mixins
    └── utils/         # Helper functions
```

---

## 🔗 Import Patterns

### Frontend

**✅ Good (using aliases):**
```typescript
import { CustomerCard } from '@features/customers';
import { ErrorState } from '@shared/components';
import { apiClient } from '@core/api';
```

**❌ Bad (relative paths):**
```typescript
import { CustomerCard } from '../../features/customers/components/CustomerCard';
```

**✅ Within same feature (relative is OK):**
```typescript
// In features/customers/pages/CustomersPage.tsx
import { CustomerCard } from '../components/CustomerCard';
import { useCustomers } from '../hooks/useCustomers';
```

### Backend

**✅ Good:**
```python
from crmApp.domains.customers.models import Customer
from crmApp.core.exceptions import NotFoundException
from crmApp.shared.mixins import TimestampMixin
```

**❌ Bad:**
```python
from ...models import Customer
```

---

## 🚀 Common Tasks

### Add a New Page

**Frontend:**
```powershell
# 1. Create page component
New-Item web-frontend\src\features\my-feature\pages\MyPage.tsx

# 2. Export in feature index
# Add to features/my-feature/index.ts:
# export { default as MyPage } from './pages/MyPage';

# 3. Add route
# In core/router/index.tsx:
# import { MyPage } from '@features/my-feature';
# { path: '/my-page', element: <MyPage /> }
```

### Add a New API Endpoint

**Backend:**
```python
# 1. Add method to viewset
# In domains/my-domain/viewsets.py
@action(detail=False, methods=['get'])
def my_endpoint(self, request):
    return Response({'data': 'hello'})

# 2. Test at: /api/my-domain/my_endpoint/
```

### Add a Hook

**Frontend:**
```typescript
// features/my-feature/hooks/useMyData.ts
import { useQuery } from '@tanstack/react-query';
import { myService } from '../services/my-feature.service';

export const useMyData = () => {
  return useQuery({
    queryKey: ['my-data'],
    queryFn: myService.getData,
  });
};

// Export in index.ts
export { useMyData } from './hooks/useMyData';

// Use anywhere
import { useMyData } from '@features/my-feature';
```

### Add Business Logic

**Backend:**
```python
# domains/my-domain/services.py
class MyDomainService:
    @staticmethod
    def do_something(data: dict):
        # Business logic here
        return result

# Use in viewset
from .services import MyDomainService

class MyViewSet(viewsets.ModelViewSet):
    def create(self, request):
        result = MyDomainService.do_something(request.data)
        return Response(result)
```

---

## 📝 Naming Conventions

### Frontend
- **Components**: `PascalCase` (CustomerCard.tsx)
- **Hooks**: `camelCase` with `use` prefix (useCustomers.ts)
- **Services**: `camelCase.service.ts` (customer.service.ts)
- **Types**: `camelCase.types.ts` (customer.types.ts)
- **Pages**: `PascalCase` with `Page` suffix (CustomersPage.tsx)

### Backend
- **Files**: `snake_case` (customer_service.py)
- **Classes**: `PascalCase` (CustomerService)
- **Functions**: `snake_case` (get_customer_data)
- **Variables**: `snake_case` (customer_id)

---

## 🎨 Code Organization Rules

### 1. Feature Isolation
- All code for a feature in one folder
- Features don't import from other features (use shared instead)
- Clear feature boundaries

### 2. Shared Code
- Put reusable code in `/shared`
- UI components (buttons, forms, etc.)
- Common hooks (useDebounce, useDisclosure)
- Utility functions (formatters, validators)

### 3. Core Infrastructure
- API clients
- Router configuration
- Theme setup
- Global configuration

### 4. No Circular Dependencies
```typescript
// ❌ Bad
// features/customers imports from features/deals
// features/deals imports from features/customers

// ✅ Good
// Both import from shared
// features/customers imports from shared/components
// features/deals imports from shared/components
```

---

## 🧪 Testing

### Frontend Tests
```
features/my-feature/
├── __tests__/
│   ├── components/
│   │   └── MyComponent.test.tsx
│   ├── hooks/
│   │   └── useMyFeature.test.ts
│   └── pages/
│       └── MyPage.test.tsx
```

### Backend Tests
```
domains/my-domain/
├── tests/
│   ├── test_models.py
│   ├── test_serializers.py
│   ├── test_viewsets.py
│   └── test_services.py
```

---

## 🔍 Finding Code

**Before (flat structure):**
- "Where is the customer create dialog?" → Search entire codebase
- "Where is customer API?" → Could be anywhere

**After (modular):**
- "Where is the customer create dialog?" → `features/customers/components/`
- "Where is customer API?" → `features/customers/services/`
- "Where is customer business logic?" → `domains/customers/services.py`

---

## 🚨 Common Mistakes

### ❌ Don't Do This
```typescript
// Importing from another feature
import { DealCard } from '@features/deals';
// in customers feature

// Using absolute paths within same feature
import { CustomerCard } from '@features/customers/components/CustomerCard';
// in features/customers/pages/
```

### ✅ Do This Instead
```typescript
// Move shared component to shared
import { ItemCard } from '@shared/components';
// Can be used in both customers and deals

// Use relative paths within feature
import { CustomerCard } from '../components/CustomerCard';
// in features/customers/pages/
```

---

## 📦 Barrel Exports

**Always create index.ts for features:**
```typescript
// features/customers/index.ts
export { default as CustomerCard } from './components/CustomerCard';
export { useCustomers } from './hooks/useCustomers';
export * from './services/customer.service';
```

**Benefits:**
- Clean imports: `import { CustomerCard } from '@features/customers'`
- Easy refactoring (change internal structure without breaking imports)
- Clear public API

---

## 🎓 Best Practices

1. **Start small**: Move one feature at a time
2. **Test after each move**: Make sure nothing breaks
3. **Update imports immediately**: Don't let broken imports pile up
4. **Document as you go**: Update README for each feature
5. **Keep it simple**: Don't over-engineer

---

## 🆘 Need Help?

- See `MODULARIZATION_PLAN.md` for detailed strategy
- See `MODULARIZATION_IMPLEMENTATION.md` for step-by-step guide
- Check feature README files for specific documentation

---

**Remember:** The goal is maintainability. If you can find what you need quickly, we're doing it right! 🎯
