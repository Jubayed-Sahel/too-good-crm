# Customers Feature

Customer management functionality including CRUD operations, search, filtering, and statistics.

## 📁 Structure

```
features/customers/
├── components/          # UI Components
│   ├── CreateCustomerDialog.tsx
│   ├── CustomerDetailModal.tsx
│   ├── CustomerFilters.tsx
│   ├── CustomersPageContent.tsx
│   ├── CustomersPageLoading.tsx
│   ├── CustomerStats.tsx
│   └── CustomerTable.tsx
├── hooks/               # React Query hooks
│   ├── useCustomers.ts
│   ├── useCustomersPage.ts
│   └── useCustomerActions.ts
├── services/            # API communication
│   └── customer.service.ts
├── types/               # TypeScript types
│   └── customer.types.ts
├── pages/               # Page components
│   ├── CustomersPage.tsx
│   ├── CustomerDetailPage.tsx
│   └── EditCustomerPage.tsx
└── index.ts             # Barrel export
```

## 🚀 Usage

### Import from feature module
```typescript
import { 
  CustomersPage,
  useCustomers,
  type Customer 
} from '@features/customers';
```

### Fetch customers
```typescript
const { data: customers, isLoading, error } = useCustomers();
```

### Use customer components
```typescript
import { CustomerTable, CreateCustomerDialog } from '@features/customers';

function MyComponent() {
  return (
    <>
      <CustomerTable customers={customers} />
      <CreateCustomerDialog />
    </>
  );
}
```

## 📝 Available Exports

### Components
- `CreateCustomerDialog` - Dialog for creating new customers
- `CustomerDetailModal` - Modal showing customer details
- `CustomerFilters` - Filter UI for customer list
- `CustomersPageContent` - Main customer list content
- `CustomersPageLoading` - Loading skeleton for customers page
- `CustomerStats` - Customer statistics display
- `CustomerTable` - Table view of customers

### Hooks
- `useCustomers()` - Fetch customers list
- `useCustomersPage()` - Page-level state management
- `useCustomerActions()` - Customer action handlers

### Types
- `Customer` - Customer entity interface
- `CustomerNote` - Customer note interface
- `CustomerStatus` - Customer status enum
- `CreateCustomerData` - DTO for creating customers
- `UpdateCustomerData` - DTO for updating customers

## 🔗 Dependencies

- `@shared/components` - ErrorState, ErrorBoundary
- `@shared/utils` - Error handling utilities
- `@core/api` - API client
- `@chakra-ui/react` - UI components
- `@tanstack/react-query` - Data fetching

## ✅ Best Practices

1. **Import from barrel export** - Always use `@features/customers` instead of deep imports
2. **Keep feature isolated** - Don't import from other features
3. **Use shared components** - Reusable UI goes in `@shared/components`
4. **Type safety** - Export all types for external use
