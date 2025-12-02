# Web Frontend Reorganization Plan

## Current Issues
1. **Duplicate structures**: `features/customers` vs `components/customers` vs `pages/CustomersPage.tsx`
2. **Flat hooks directory**: 32 hooks in one folder without grouping
3. **Flat services directory**: 22 services without domain grouping
4. **Inconsistent pages structure**: Mix of flat files and subdirectories
5. **Duplicate shared/common**: Both `components/common` and `shared/components`

## New Structure (Feature-Based Architecture)

```
src/
├── features/                      # Feature-based modules
│   ├── auth/
│   │   ├── components/           # Auth-specific components
│   │   ├── hooks/                # useAuth, useLogin, etc.
│   │   ├── services/             # auth.service.ts
│   │   ├── types/                # auth.types.ts
│   │   ├── schemas/              # auth.schema.ts
│   │   └── pages/                # LoginPage, SignupPage
│   │
│   ├── customers/
│   │   ├── components/           # CustomerTable, CustomerFilters, etc.
│   │   ├── hooks/                # useCustomers, useCustomerActions, etc.
│   │   ├── services/             # customer.service.ts
│   │   ├── types/                # customer.types.ts
│   │   ├── schemas/              # customer.schema.ts
│   │   └── pages/                # CustomersPage, CustomerDetailPage, etc.
│   │
│   ├── deals/
│   │   ├── components/
│   │   ├── hooks/                # useDeals, useDealActions, useDealMutations
│   │   ├── services/             # deal.service.ts
│   │   ├── types/
│   │   ├── schemas/              # deal.schema.ts
│   │   └── pages/                # SalesPage, DealDetailPage, EditDealPage
│   │
│   ├── leads/
│   │   ├── components/
│   │   ├── hooks/                # useLeads, useLeadMutations
│   │   ├── services/             # lead.service.ts
│   │   ├── types/                # lead.types.ts
│   │   ├── schemas/              # lead.schema.ts
│   │   └── pages/                # LeadDetailPage, EditLeadPage
│   │
│   ├── employees/
│   │   ├── components/
│   │   ├── hooks/                # useEmployees, useEmployeeMutations
│   │   ├── services/             # employee.service.ts
│   │   ├── types/
│   │   ├── schemas/              # employee.schema.ts
│   │   └── pages/                # Employee pages
│   │
│   ├── activities/
│   │   ├── components/           # ActivitiesTable, ActivityFilters, etc.
│   │   ├── hooks/
│   │   ├── services/             # activity.service.ts, auditLog.service.ts
│   │   ├── types/                # activity.types.ts
│   │   └── pages/                # ActivitiesPage, ActivityDetailPage, etc.
│   │
│   ├── issues/
│   │   ├── components/
│   │   ├── hooks/                # useIssues
│   │   ├── services/             # issue.service.ts
│   │   ├── types/                # issue.types.ts
│   │   ├── schemas/              # issue.schema.ts
│   │   └── pages/                # IssuesPage
│   │
│   ├── orders/
│   │   ├── components/
│   │   ├── hooks/                # useOrders
│   │   ├── services/             # order.service.ts
│   │   ├── types/                # order.types.ts
│   │   ├── schemas/              # order.schema.ts
│   │   └── pages/                # OrdersPage, OrderDetailPage
│   │
│   ├── payments/
│   │   ├── components/
│   │   ├── hooks/                # usePayments
│   │   ├── services/             # payment.service.ts
│   │   ├── types/                # payment.types.ts
│   │   └── pages/
│   │
│   ├── vendors/
│   │   ├── components/
│   │   ├── hooks/                # useVendors
│   │   ├── services/             # vendor.service.ts
│   │   ├── types/                # vendor.types.ts
│   │   └── pages/                # VendorsPage
│   │
│   ├── dashboard/
│   │   ├── components/           # DashboardWidgets, StatCards, etc.
│   │   ├── hooks/                # useDashboardStats
│   │   ├── services/
│   │   └── pages/                # DashboardPage, ClientDashboardPage
│   │
│   ├── settings/
│   │   ├── components/           # Settings components
│   │   ├── hooks/
│   │   ├── services/             # notificationPreferences.service.ts
│   │   └── pages/                # SettingsPage, ClientSettingsPage
│   │
│   ├── messages/
│   │   ├── components/           # GeminiChatWindow, VoiceChat, etc.
│   │   ├── hooks/                # useMessages, useGemini, useSpeech*
│   │   ├── services/             # gemini.service.ts
│   │   ├── types/                # gemini.types.ts
│   │   └── pages/                # MessagesPage, ClientMessagesPage
│   │
│   ├── video/
│   │   ├── components/           # VideoCallManager, VideoCallWindow
│   │   ├── hooks/                # usePusherVideoCall, useVideoCallWebSocket
│   │   ├── services/             # video.service.ts
│   │   ├── types/                # video.types.ts
│   │   └── pages/
│   │
│   └── rbac/                      # RBAC & Permissions
│       ├── components/           # PermissionGuard, RequirePermission, etc.
│       ├── hooks/                # useRBAC, usePermissions, usePermissionActions
│       ├── services/             # rbac.service.ts, permission.service.ts, role.service.ts
│       ├── types/                # rbac.types.ts
│       └── pages/                # PermissionDebugPage
│
├── shared/                        # Truly shared/common code
│   ├── components/               # Reusable UI components
│   │   ├── ui/                   # Base UI components (Button, Card, etc.)
│   │   ├── layout/               # Layout components (Sidebar, TopBar, etc.)
│   │   ├── forms/                # Form components (inputs, autocomplete, etc.)
│   │   ├── feedback/             # Feedback components (toasts, dialogs, etc.)
│   │   └── data-display/         # Tables, cards, stats, etc.
│   │
│   ├── hooks/                    # Truly shared hooks
│   │   ├── useUser.ts
│   │   ├── useOrganization.ts
│   │   └── usePusher.ts
│   │
│   ├── contexts/                 # Global contexts
│   │   ├── AccountModeContext.tsx
│   │   ├── PermissionContext.tsx
│   │   └── ProfileContext.tsx
│   │
│   ├── services/                 # Shared services
│   │   ├── organization.service.ts
│   │   ├── userProfile.service.ts
│   │   └── role-selection.service.ts
│   │
│   ├── types/                    # Shared types
│   │   ├── user.types.ts
│   │   └── organization.types.ts
│   │
│   └── utils/                    # Utility functions
│       ├── date.ts
│       ├── format.ts
│       └── validation.ts
│
├── core/                          # Core infrastructure
│   ├── api/                      # API client
│   │   └── apiClient.ts
│   ├── router/                   # Routing configuration
│   └── config/                   # App configuration
│
├── theme/                         # Theme configuration
└── assets/                        # Static assets
```

## Migration Steps

### Phase 1: Create New Structure
1. Create `features/` directory with subdirectories
2. Create organized `shared/` directory structure

### Phase 2: Move Files by Feature
1. **Auth**: Move auth components, hooks, services, pages
2. **Customers**: Consolidate all customer-related files
3. **Deals**: Move deal components, hooks, services, pages
4. **Leads**: Move lead files
5. **Employees**: Move employee files
6. **Activities**: Move activity & audit log files
7. **Issues, Orders, Payments, Vendors**: Move respective files
8. **Dashboard**: Move dashboard files
9. **Settings**: Move settings files
10. **Messages**: Move message/chat files
11. **Video**: Move video call files
12. **RBAC**: Consolidate permission/role files

### Phase 3: Organize Shared Components
1. Categorize common components into subfolders
2. Move truly shared hooks to `shared/hooks`
3. Keep contexts in `shared/contexts`

### Phase 4: Update Imports
1. Create index.ts barrel exports for each feature
2. Update imports using find-replace patterns
3. Use relative imports within features
4. Use absolute imports for cross-feature dependencies

### Phase 5: Cleanup
1. Remove old empty directories
2. Update `tsconfig.json` paths if needed
3. Run build and fix any remaining import errors
4. Remove duplicate files

## Benefits of New Structure

1. **Feature Isolation**: Each feature has its own components, hooks, services
2. **Easier Navigation**: Related code is co-located
3. **Better Scalability**: Easy to add new features
4. **Clear Dependencies**: Easier to see feature dependencies
5. **Improved Maintainability**: Changes are isolated to feature folders
6. **Reduced Cognitive Load**: Developers work in one feature folder at a time

## Import Convention

```typescript
// Within same feature (relative imports)
import { CustomerTable } from '../components/CustomerTable';
import { useCustomers } from '../hooks/useCustomers';

// Cross-feature (absolute imports from feature root)
import { useAuth } from '@/features/auth';
import { DealService } from '@/features/deals/services';

// Shared code (absolute imports)
import { Button } from '@/shared/components/ui';
import { useUser } from '@/shared/hooks';
import { apiClient } from '@/core/api';
```

