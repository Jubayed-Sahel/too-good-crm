# Modularization Visual Guide

**Visual representation of the new modular architecture**

---

## 🎨 Frontend Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         APPLICATION                              │
│                        (main.tsx, App.tsx)                       │
└────────────────────────────┬────────────────────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
   ┌─────────┐         ┌─────────┐         ┌─────────┐
   │ FEATURES│         │ SHARED  │         │  CORE   │
   └─────────┘         └─────────┘         └─────────┘
        │                    │                    │
        │                    │                    │
┌───────┴───────┐    ┌───────┴───────┐    ┌───────┴───────┐
│               │    │               │    │               │
│  Customers    │    │  Components   │    │  API Client   │
│  ├─components │    │  ├─ErrorState │    │  ├─apiClient  │
│  ├─hooks      │    │  ├─Loading... │    │  └─queryClient│
│  ├─services   │    │  └─ErrorBound.│    │               │
│  ├─types      │    │               │    │  Router       │
│  └─pages      │    │  Hooks        │    │  ├─routes     │
│               │    │  ├─useDebounce│    │  └─guards     │
│  Deals        │    │  └─useDisc... │    │               │
│  ├─components │    │               │    │  Theme        │
│  ├─hooks      │    │  Utils        │    │  ├─tokens     │
│  ├─services   │    │  ├─formatters │    │  └─config     │
│  ├─types      │    │  ├─validators │    │               │
│  └─pages      │    │  └─errorHand..│    │  Config       │
│               │    │               │    │  └─constants  │
│  Leads        │    │  Contexts     │    │               │
│  ├─components │    │  ├─AuthContext│    └───────────────┘
│  ├─hooks      │    │  ├─Permissions│
│  ├─services   │    │  └─AccountMode│
│  ├─types      │    │               │
│  └─pages      │    │  Types        │
│               │    │  ├─common     │
│  Activities   │    │  └─api        │
│  ├─...        │    │               │
│               │    └───────────────┘
│  Employees    │
│  ├─...        │
│               │
│  Analytics    │
│  ├─...        │
│               │
│  Client       │
│  ├─dashboard  │
│  ├─orders     │
│  ├─payments   │
│  ├─vendors    │
│  └─issues     │
│               │
│  Auth         │
│  ├─...        │
│               │
│  Settings     │
│  ├─...        │
│               │
│  Dashboard    │
│  └─...        │
│               │
└───────────────┘

┌──────────────────────────────────────────────────────────┐
│              IMPORT FLOW (Top to Bottom)                 │
│                                                          │
│  Features can import from:                              │
│    ✅ Shared (components, hooks, utils)                │
│    ✅ Core (api, router, theme)                        │
│    ❌ Other Features (NO!)                             │
│                                                          │
│  Shared can import from:                                │
│    ✅ Core only                                         │
│    ❌ Features (NO!)                                    │
│                                                          │
│  Core:                                                   │
│    ✅ Self-contained                                    │
│    ❌ Nothing above it                                  │
└──────────────────────────────────────────────────────────┘
```

---

## 🏗️ Backend Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      DJANGO APPLICATION                          │
│                    (urls.py, settings.py)                        │
└────────────────────────────┬────────────────────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
   ┌─────────┐         ┌─────────┐         ┌─────────┐
   │ DOMAINS │         │  CORE   │         │ SHARED  │
   └─────────┘         └─────────┘         └─────────┘
        │                    │                    │
        │                    │                    │
┌───────┴───────┐    ┌───────┴───────┐    ┌───────┴───────┐
│               │    │               │    │               │
│  Customers    │    │  Exceptions   │    │  Mixins       │
│  ├─models.py  │    │  ├─base.py    │    │  ├─timestamp  │
│  ├─serializ.. │    │  └─handlers.py│    │  └─organizat..│
│  ├─viewsets.py│    │               │    │               │
│  ├─services.py│    │  Middleware   │    │  Utils        │
│  ├─filters.py │    │  ├─org_context│    │  ├─formatters │
│  └─urls.py    │    │  └─error_hand.│    │  └─helpers    │
│               │    │               │    │               │
│  Deals        │    │  Permissions  │    │  Constants    │
│  ├─models/    │    │  ├─base.py    │    │  └─choices.py │
│  │ ├─pipeline │    │  ├─rbac.py    │    │               │
│  │ ├─stage    │    │  └─helpers.py │    └───────────────┘
│  │ └─deal     │    │               │
│  ├─serializ.. │    │  Pagination   │
│  ├─viewsets/  │    │  └─custom.py  │
│  ├─services/  │    │               │
│  └─urls.py    │    │  Validators   │
│               │    │  └─common.py  │
│  Leads        │    │               │
│  ├─models.py  │    └───────────────┘
│  ├─serializ.. │
│  ├─viewsets.py│
│  ├─services.py│
│  └─urls.py    │
│               │
│  Activities   │
│  ├─models/    │
│  │ ├─call     │
│  │ ├─email    │
│  │ └─telegram │
│  ├─serializ.. │
│  ├─viewsets.py│
│  └─urls.py    │
│               │
│  Employees    │
│  Orders       │
│  Payments     │
│  Issues       │
│  Organiz...   │
│               │
└───────────────┘

┌──────────────────────────────────────────────────────────┐
│                    REQUEST FLOW                          │
│                                                          │
│  Client Request                                         │
│       │                                                  │
│       ▼                                                  │
│  URL Router ────────────────┐                          │
│       │                     │                           │
│       ▼                     │                           │
│  Middleware (Core)          │                           │
│    - Organization Context   │                           │
│    - Error Handling         │                           │
│       │                     │                           │
│       ▼                     │                           │
│  ViewSet (Domain)           │                           │
│       │                     │                           │
│       ▼                     │                           │
│  Permissions (Core) ◄───────┘                          │
│       │                                                  │
│       ▼                                                  │
│  Service (Domain)                                       │
│    - Business Logic                                     │
│       │                                                  │
│       ▼                                                  │
│  Model (Domain)                                         │
│       │                                                  │
│       ▼                                                  │
│  Serializer (Domain)                                    │
│       │                                                  │
│       ▼                                                  │
│  Response                                               │
└──────────────────────────────────────────────────────────┘
```

---

## 🔄 Feature Module Internal Structure

```
features/customers/
│
├─ components/              # UI Components
│  ├─ CustomerCard.tsx      # Display customer info
│  ├─ CustomerForm.tsx      # Create/edit form
│  ├─ CustomerList.tsx      # List view
│  └─ CustomerAutocomplete  # Search & select
│     .tsx
│
├─ hooks/                   # React Query hooks
│  ├─ useCustomers.ts       # Fetch customers
│  ├─ useCustomerMutations  # Create/Update/Delete
│  │  .ts
│  └─ useCustomersPage.ts   # Page state management
│
├─ services/                # API communication
│  └─ customer.service.ts   # API methods
│     ├─ getCustomers()
│     ├─ createCustomer()
│     ├─ updateCustomer()
│     └─ deleteCustomer()
│
├─ types/                   # TypeScript types
│  └─ customer.types.ts
│     ├─ Customer
│     ├─ CreateCustomerData
│     └─ UpdateCustomerData
│
├─ pages/                   # Page components
│  ├─ CustomersPage.tsx     # List page
│  ├─ CustomerDetailPage    # Detail page
│  │  .tsx
│  └─ EditCustomerPage      # Edit page
│     .tsx
│
└─ index.ts                 # Barrel export
   └─ Public API
      ├─ Export components
      ├─ Export hooks
      ├─ Export services
      └─ Export types

┌──────────────────────────────────────────────────────────┐
│              INTERNAL IMPORT PATTERN                     │
│                                                          │
│  Within feature (use relative paths):                   │
│                                                          │
│  // In pages/CustomersPage.tsx                         │
│  import { CustomerCard } from '../components/CustomerCard';│
│  import { useCustomers } from '../hooks/useCustomers';  │
│  import type { Customer } from '../types/customer.types';│
│                                                          │
│  External usage (use barrel export):                    │
│                                                          │
│  // In other parts of app                              │
│  import { CustomerCard, useCustomers } from '@features/customers';│
└──────────────────────────────────────────────────────────┘
```

---

## 🏛️ Domain Module Internal Structure (Backend)

```
domains/customers/
│
├─ models.py                # Database models
│  └─ Customer
│     ├─ Fields
│     ├─ Relationships
│     ├─ Methods
│     └─ Meta
│
├─ serializers.py           # Data serialization
│  ├─ CustomerSerializer
│  ├─ CustomerListSerializer
│  └─ CustomerDetailSerializer
│
├─ viewsets.py              # API endpoints
│  └─ CustomerViewSet
│     ├─ list()
│     ├─ retrieve()
│     ├─ create()
│     ├─ update()
│     ├─ destroy()
│     └─ custom_actions()
│
├─ services.py              # Business logic
│  └─ CustomerService
│     ├─ get_customers_by_org()
│     ├─ create_customer()
│     ├─ update_customer()
│     └─ delete_customer()
│
├─ filters.py               # Query filtering
│  └─ CustomerFilter
│
├─ urls.py                  # URL routing
│  └─ Router configuration
│
└─ tests/                   # Unit tests
   ├─ test_models.py
   ├─ test_serializers.py
   ├─ test_viewsets.py
   └─ test_services.py

┌──────────────────────────────────────────────────────────┐
│                  LAYER FLOW                              │
│                                                          │
│  ViewSet (HTTP Layer)                                   │
│       │                                                  │
│       ├─ Handles request/response                       │
│       ├─ Validates permissions                          │
│       └─ Calls service layer                            │
│       │                                                  │
│       ▼                                                  │
│  Service (Business Logic Layer)                         │
│       │                                                  │
│       ├─ Complex business logic                         │
│       ├─ Cross-model operations                         │
│       └─ Reusable methods                               │
│       │                                                  │
│       ▼                                                  │
│  Model (Data Layer)                                     │
│       │                                                  │
│       ├─ Database schema                                │
│       ├─ Validation                                     │
│       └─ Simple model methods                           │
└──────────────────────────────────────────────────────────┘
```

---

## 🔗 Dependency Graph

```
┌────────────────────────────────────────────────────────┐
│           ALLOWED DEPENDENCIES                         │
│                                                        │
│  ┌──────────┐                                         │
│  │ Features │ ──────┐                                 │
│  └──────────┘       │                                 │
│       ▲             ▼                                 │
│       │        ┌────────┐                             │
│       │        │ Shared │                             │
│       │        └────────┘                             │
│       │             │                                 │
│       │             ▼                                 │
│       │        ┌────────┐                             │
│       └────────│  Core  │                             │
│                └────────┘                             │
│                                                        │
│  Features can use: Shared, Core                       │
│  Shared can use: Core                                 │
│  Core: Self-contained                                 │
└────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────┐
│          FORBIDDEN DEPENDENCIES                        │
│                                                        │
│  ❌ Features ←→ Features (cross-feature imports)      │
│  ❌ Shared → Features                                 │
│  ❌ Core → Shared or Features                         │
│                                                        │
│  Why?                                                  │
│  - Prevents circular dependencies                     │
│  - Maintains clear architecture layers                │
│  - Makes testing easier                               │
│  - Enables independent feature development            │
└────────────────────────────────────────────────────────┘
```

---

## 📦 Feature Communication Pattern

```
┌──────────────────────────────────────────────────────────┐
│       HOW FEATURES SHARE FUNCTIONALITY                   │
│                                                          │
│  ❌ WRONG: Feature A imports from Feature B             │
│                                                          │
│  Feature A ────X────> Feature B                         │
│                                                          │
│  ✅ CORRECT: Both use Shared                            │
│                                                          │
│  Feature A ───┐                                         │
│               │                                         │
│               ▼                                         │
│           Shared Component                              │
│               ▲                                         │
│               │                                         │
│  Feature B ───┘                                         │
│                                                          │
│  Example:                                               │
│  - Move CustomerCard to shared/components if used by    │
│    multiple features                                    │
│  - Keep CustomerCard in features/customers if only      │
│    used there                                           │
└──────────────────────────────────────────────────────────┘
```

---

## 🎯 Decision Tree: Where Does Code Go?

```
                    New Code to Add
                          │
                          ▼
                Is it used by multiple features?
                    /              \
                  Yes               No
                   │                 │
                   ▼                 ▼
          Is it a UI component?   Which feature does it belong to?
              /        \                    │
            Yes         No                  ▼
             │           │            Put in that feature/
             ▼           ▼               (customers/, deals/, etc.)
    shared/components  Is it a hook?
                         /      \
                       Yes      No
                        │        │
                        ▼        ▼
                 shared/hooks  Is it a utility?
                                 /        \
                               Yes        No
                                │          │
                                ▼          ▼
                          shared/utils  Is it infrastructure?
                                         /              \
                                       Yes              No
                                        │                │
                                        ▼                ▼
                                    core/           shared/types
                               (api, router, etc.)
```

---

## 📊 Code Organization Stats

```
┌──────────────────────────────────────────────────────────┐
│                    BEFORE                                │
│                                                          │
│  📁 pages/               28 files (flat)                │
│  📁 components/          ~40 files (by type)            │
│  📁 hooks/               ~20 files (flat)               │
│  📁 services/            ~15 files (flat)               │
│                                                          │
│  Finding code: 🔍 Search entire codebase                │
│  Adding feature: 😰 Touch multiple directories          │
│  Testing: 🤔 Hard to isolate                            │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│                    AFTER                                 │
│                                                          │
│  📁 features/            9 feature modules               │
│     └─ customers/        ~5 files                        │
│     └─ deals/            ~6 files                        │
│     └─ leads/            ~5 files                        │
│     ... etc                                              │
│  📁 shared/              Truly shared code               │
│  📁 core/                Infrastructure                  │
│                                                          │
│  Finding code: ✅ Go directly to feature                │
│  Adding feature: 😊 One directory                       │
│  Testing: ✨ Test feature in isolation                  │
└──────────────────────────────────────────────────────────┘
```

---

**Remember:** The goal is to make the codebase easier to understand, maintain, and scale. If you can navigate to the right code quickly, we've succeeded! 🎯
