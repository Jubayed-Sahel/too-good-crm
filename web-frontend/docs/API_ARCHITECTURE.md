# API Architecture Guide

## Quick Reference

### ✅ **DO** - Correct API Usage

#### Import the API Client
```typescript
import api from '@/lib/apiClient';
```

#### Import API Configuration
```typescript
import { API_CONFIG } from '@/config/api.config';
```

#### Make API Calls
```typescript
// GET request
const customers = await api.get<Customer[]>(API_CONFIG.ENDPOINTS.CUSTOMERS.LIST);

// POST request
const newCustomer = await api.post<Customer>(
  API_CONFIG.ENDPOINTS.CUSTOMERS.LIST,
  customerData
);

// PUT/PATCH request
const updated = await api.put<Customer>(
  API_CONFIG.ENDPOINTS.CUSTOMERS.DETAIL(id),
  updateData
);

// DELETE request
await api.delete(API_CONFIG.ENDPOINTS.CUSTOMERS.DETAIL(id));
```

#### With Query Parameters
```typescript
const response = await api.get<PaginatedResponse<Customer>>(
  API_CONFIG.ENDPOINTS.CUSTOMERS.LIST,
  { params: { status: 'active', page: 1 } }
);
```

---

### ❌ **DON'T** - Avoid These

```typescript
// ❌ Don't import from deleted files
import api from '../services/api';
import api from '@/services/api';
import { apiService } from '@/services';

// ❌ Don't destructure data (apiClient returns data directly)
const { data } = await api.get('/customers/');  // WRONG
const data = await api.get('/customers/');      // CORRECT

// ❌ Don't hardcode API URLs
await api.get('http://localhost:8000/api/customers/');  // WRONG
await api.get(API_CONFIG.ENDPOINTS.CUSTOMERS.LIST);     // CORRECT

// ❌ Don't use duplicate constants
import { API_ENDPOINTS } from '@/config/constants';  // WRONG (removed)
import { API_CONFIG } from '@/config/api.config';    // CORRECT
```

---

## API Client Features

### Authentication
Automatically adds auth token from localStorage:
```typescript
headers: {
  'Authorization': `Token ${token}`
}
```

### Error Handling
- **401 Unauthorized**: Auto-redirects to `/login` and clears auth
- **403 Forbidden**: Logs error
- **404 Not Found**: Logs error
- **500+ Server Error**: Logs error

### Development Logging
In development mode, all requests/responses are logged:
```
🚀 GET /api/customers/ -> 200 ✅
❌ POST /api/customers/ -> 400
```

---

## API Configuration Structure

### Base URL
```typescript
API_CONFIG.BASE_URL
// From: import.meta.env.VITE_API_BASE_URL
// Default: 'http://127.0.0.1:8000/api'
```

### Endpoints
```typescript
API_CONFIG.ENDPOINTS.AUTH.LOGIN           // '/auth/login/'
API_CONFIG.ENDPOINTS.AUTH.REGISTER        // '/auth/register/'
API_CONFIG.ENDPOINTS.AUTH.LOGOUT          // '/auth/logout/'

API_CONFIG.ENDPOINTS.CUSTOMERS.LIST       // '/customers/'
API_CONFIG.ENDPOINTS.CUSTOMERS.DETAIL(5)  // '/customers/5/'
API_CONFIG.ENDPOINTS.CUSTOMERS.STATS      // '/customers/stats/'

API_CONFIG.ENDPOINTS.DEALS.LIST           // '/deals/'
API_CONFIG.ENDPOINTS.DEALS.DETAIL(10)     // '/deals/10/'
API_CONFIG.ENDPOINTS.DEALS.PIPELINE       // '/deals/pipeline/'

// ... and many more
```

### Helper Functions
```typescript
// Build query string from object
API_CONFIG.buildQueryString({ status: 'active', page: 2 })
// Returns: 'status=active&page=2'

// Build full URL with query params
API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.CUSTOMERS.LIST, { status: 'active' })
// Returns: '/customers/?status=active'
```

---

## Service Layer Pattern

All services follow this pattern:

```typescript
import api from '@/lib/apiClient';
import { API_CONFIG } from '@/config/api.config';
import type { Customer, PaginatedResponse } from '@/types';

class CustomerService {
  async getCustomers(params?: Record<string, any>): Promise<PaginatedResponse<Customer>> {
    return api.get<PaginatedResponse<Customer>>(
      API_CONFIG.ENDPOINTS.CUSTOMERS.LIST,
      { params }
    );
  }

  async getCustomer(id: number): Promise<Customer> {
    return api.get<Customer>(API_CONFIG.ENDPOINTS.CUSTOMERS.DETAIL(id));
  }

  async createCustomer(data: Partial<Customer>): Promise<Customer> {
    return api.post<Customer>(API_CONFIG.ENDPOINTS.CUSTOMERS.LIST, data);
  }

  async updateCustomer(id: number, data: Partial<Customer>): Promise<Customer> {
    return api.put<Customer>(API_CONFIG.ENDPOINTS.CUSTOMERS.DETAIL(id), data);
  }

  async deleteCustomer(id: number): Promise<void> {
    return api.delete(API_CONFIG.ENDPOINTS.CUSTOMERS.DETAIL(id));
  }
}

export const customerService = new CustomerService();
```

---

## Environment Variables

### Required
Create a `.env` file based on `.env.example`:

```env
# API Configuration
VITE_API_BASE_URL=http://127.0.0.1:8000/api

# Development Settings
VITE_APP_ENV=development
```

### Usage in Code
```typescript
// In api.config.ts
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

// Access in components
if (import.meta.env.VITE_APP_ENV === 'development') {
  console.log('Dev mode');
}
```

---

## React Query Integration

### Using Services with React Query

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customerService } from '@/services';

// Query
export const useCustomers = (filters?: Record<string, string>) => {
  return useQuery({
    queryKey: ['customers', filters],
    queryFn: () => customerService.getCustomers(filters),
  });
};

// Mutation
export const useCreateCustomer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<Customer>) => 
      customerService.createCustomer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
};
```

### Using in Components

```typescript
import { useCustomers, useCreateCustomer } from '@/hooks';

function CustomersPage() {
  const { data, isLoading, error } = useCustomers({ status: 'active' });
  const createMutation = useCreateCustomer();

  const handleCreate = async (customerData: Partial<Customer>) => {
    try {
      await createMutation.mutateAsync(customerData);
      toast.success('Customer created!');
    } catch (error) {
      toast.error('Failed to create customer');
    }
  };

  if (isLoading) return <Loader />;
  if (error) return <ErrorDisplay error={error} />;

  return <CustomerTable customers={data?.results} />;
}
```

---

## File Structure

```
src/
├── lib/
│   └── apiClient.ts              ← HTTP client (Axios)
├── config/
│   ├── api.config.ts             ← API endpoints & config
│   ├── constants.ts              ← App constants (non-API)
│   └── index.ts                  ← Re-exports
├── services/
│   ├── auth.service.ts           ← Auth API calls
│   ├── customer.service.ts       ← Customer API calls
│   ├── deal.service.ts           ← Deal API calls
│   ├── analytics.service.ts      ← Analytics API calls
│   └── index.ts                  ← Service exports
├── hooks/
│   ├── useAuth.ts                ← Auth React Query hooks
│   ├── useCustomers.ts           ← Customer React Query hooks
│   ├── useDeals.ts               ← Deal React Query hooks
│   └── index.ts                  ← Hook exports
└── types/
    ├── auth.types.ts             ← Auth type definitions
    ├── customer.types.ts         ← Customer type definitions
    ├── deal.types.ts             ← Deal type definitions
    └── index.ts                  ← Type exports
```

---

## TypeScript Types

### Response Types
```typescript
// Paginated response
interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// API error
interface ApiError {
  detail?: string;
  message?: string;
  [key: string]: any;
}
```

### Type-safe API Calls
```typescript
// Fully typed
const customers = await api.get<PaginatedResponse<Customer>>(
  API_CONFIG.ENDPOINTS.CUSTOMERS.LIST
);

// TypeScript knows:
customers.count      // number
customers.results    // Customer[]
customers.results[0].name  // string
```

---

## Testing

### Mock API Client
```typescript
import { vi } from 'vitest';

vi.mock('@/lib/apiClient', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));
```

### Mock Service
```typescript
import { customerService } from '@/services';

vi.spyOn(customerService, 'getCustomers').mockResolvedValue({
  count: 1,
  next: null,
  previous: null,
  results: [mockCustomer],
});
```

---

## Best Practices

1. **Always use the API client**: Never create new Axios/Fetch instances
2. **Use API_CONFIG**: Never hardcode endpoints
3. **Use services**: Keep API logic in service layer
4. **Use React Query**: For data fetching in components
5. **Type everything**: Use TypeScript generics for API calls
6. **Handle errors**: Use try/catch and show user feedback
7. **Invalidate queries**: After mutations to refresh data

---

## Common Patterns

### Pagination
```typescript
const [page, setPage] = useState(1);
const { data } = useCustomers({ page });

// Next page
if (data?.next) setPage(page + 1);

// Previous page
if (data?.previous) setPage(page - 1);
```

### Search/Filter
```typescript
const [search, setSearch] = useState('');
const [status, setStatus] = useState('all');

const { data } = useCustomers({
  search,
  status: status !== 'all' ? status : undefined,
});
```

### Create/Update/Delete
```typescript
const create = useCreateCustomer();
const update = useUpdateCustomer();
const remove = useDeleteCustomer();

await create.mutateAsync(data);
await update.mutateAsync({ id, ...data });
await remove.mutateAsync(id);
```

---

## Troubleshooting

### Issue: "Cannot find module '@/lib/apiClient'"
**Solution**: Check your `tsconfig.json` has the `@` path alias:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Issue: "Property 'data' does not exist"
**Solution**: Don't destructure - apiClient returns data directly:
```typescript
// ❌ Wrong
const { data } = await api.get('/customers/');

// ✅ Correct
const data = await api.get('/customers/');
```

### Issue: "401 Unauthorized"
**Solution**: Check if auth token is in localStorage:
```typescript
const token = localStorage.getItem('authToken');
if (!token) {
  // Redirect to login
}
```

### Issue: "Network Error" or "CORS"
**Solution**: 
1. Check backend is running
2. Verify `VITE_API_BASE_URL` in `.env`
3. Check Django CORS settings allow frontend origin

---

## Additional Resources

- **API Config**: `src/config/api.config.ts`
- **API Client**: `src/lib/apiClient.ts`
- **Services**: `src/services/`
- **Hooks**: `src/hooks/`
- **Types**: `src/types/`
- **Refactoring Summary**: `REFACTORING_SUMMARY.md`
