# Mobile App Architecture - Issue Tracking System

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         MOBILE APP (Android)                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │                      UI LAYER                               │    │
│  │                                                             │    │
│  │  ┌──────────────┐      ┌──────────────┐                   │    │
│  │  │   Customer   │      │    Vendor    │                   │    │
│  │  │   Screens    │      │   Screens    │                   │    │
│  │  │              │      │              │                   │    │
│  │  │ • IssuesList │      │ • IssuesList │                   │    │
│  │  │ • CreateIssue│      │ • Filters    │                   │    │
│  │  │ • IssueDetail│      │ • IssueDetail│                   │    │
│  │  │ • AddComment │      │ • UpdateStatus│                   │    │
│  │  └──────┬───────┘      └──────┬───────┘                   │    │
│  │         │                     │                            │    │
│  │         └──────────┬──────────┘                            │    │
│  │                    │                                       │    │
│  └────────────────────┼───────────────────────────────────────┘    │
│                       │                                             │
│  ┌────────────────────▼───────────────────────────────────────┐    │
│  │                  VIEWMODEL LAYER                           │    │
│  │                                                             │    │
│  │  ┌─────────────────┐      ┌──────────────────┐            │    │
│  │  │  LoginViewModel │      │  IssueViewModel   │            │    │
│  │  │                 │      │                   │            │    │
│  │  │ • login()       │      │ • createIssue()   │            │    │
│  │  │ • UiState       │      │ • loadAllIssues() │            │    │
│  │  └────────┬────────┘      │ • updateStatus()  │            │    │
│  │           │               │ • resolveIssue()  │            │    │
│  │           │               └─────────┬─────────┘            │    │
│  └───────────┼─────────────────────────┼──────────────────────┘    │
│              │                         │                            │
│  ┌───────────▼─────────────────────────▼──────────────────────┐    │
│  │                  REPOSITORY LAYER                          │    │
│  │                                                             │    │
│  │  ┌──────────────┐         ┌────────────────┐              │    │
│  │  │AuthRepository│         │IssueRepository │              │    │
│  │  │              │         │                │              │    │
│  │  │ • login()    │         │ • createIssue()│              │    │
│  │  │ • register() │         │ • getIssues()  │              │    │
│  │  │ • saveToken()│         │ • updateIssue()│              │    │
│  │  └──────┬───────┘         └───────┬────────┘              │    │
│  └─────────┼─────────────────────────┼────────────────────────┘    │
│            │                         │                              │
│  ┌─────────▼─────────────────────────▼────────────────────────┐    │
│  │                     API CLIENT                              │    │
│  │                                                             │    │
│  │  ┌─────────────────┐      ┌──────────────────┐            │    │
│  │  │AuthApiService   │      │IssueApiService   │            │    │
│  │  │                 │      │                  │            │    │
│  │  │ POST /login     │      │ POST /raise      │            │    │
│  │  │ POST /register  │      │ GET  /issues     │            │    │
│  │  │ GET  /me        │      │ PATCH /issues/:id│            │    │
│  │  └─────────────────┘      └──────────────────┘            │    │
│  │                                                             │    │
│  │  • Token Management                                         │    │
│  │  • Auto Headers (Authorization)                             │    │
│  │  • Timeout: 30s                                             │    │
│  └─────────────────────────┬───────────────────────────────────┘    │
│                            │                                         │
└────────────────────────────┼─────────────────────────────────────────┘
                             │
                             │ HTTPS/REST API
                             │
┌────────────────────────────▼─────────────────────────────────────────┐
│                      BACKEND (Django)                                 │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                    API ENDPOINTS                             │    │
│  │                                                              │    │
│  │  Authentication               Issue Management              │    │
│  │  ─────────────               ─────────────────              │    │
│  │  POST   /auth/login/         POST   /client/issues/raise/   │    │
│  │  POST   /users/              GET    /client/issues/:id/     │    │
│  │  POST   /auth/logout/        POST   /client/issues/:id/comment/│ │
│  │  GET    /users/me/           GET    /issues/                │    │
│  │                              PATCH  /issues/:id/            │    │
│  │                              POST   /issues/resolve/:id/    │    │
│  └──────────────────────────────────────────────────────────────┘    │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │                     AUTHORIZATION                             │    │
│  │                                                               │    │
│  │  • Token Authentication                                       │    │
│  │  • Permission Classes                                         │    │
│  │  • Role-Based Access (Customer/Vendor)                        │    │
│  └──────────────────────────────────────────────────────────────┘    │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │                     BUSINESS LOGIC                            │    │
│  │                                                               │    │
│  │  Customer Logic               Vendor Logic                    │    │
│  │  ──────────────               ─────────────                   │    │
│  │  • Can create issues          • Can view all issues           │    │
│  │  • Can view own issues        • Can update status             │    │
│  │  • Can add comments           • Can update priority           │    │
│  │  • Cannot update status       • Can assign issues             │    │
│  │  • Cannot resolve             • Can resolve issues            │    │
│  └──────────────────────────────────────────────────────────────┘    │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │                       DATABASE                                │    │
│  │                                                               │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐     │    │
│  │  │  Users   │  │  Issues  │  │Customers │  │Employees │     │    │
│  │  │          │  │          │  │          │  │          │     │    │
│  │  │ username │  │ title    │  │ user     │  │ user     │     │    │
│  │  │ email    │  │ status   │  │ org      │  │ org      │     │    │
│  │  │ password │  │ priority │  │          │  │          │     │    │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘     │    │
│  └──────────────────────────────────────────────────────────────┘    │
└───────────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagrams

### 1. Customer Creates Issue Flow

```
Customer                Mobile App               Backend                Database
   │                        │                       │                       │
   │ 1. Fills form          │                       │                       │
   │───────────────────────>│                       │                       │
   │                        │                       │                       │
   │ 2. Clicks "Create"     │                       │                       │
   │───────────────────────>│                       │                       │
   │                        │                       │                       │
   │                        │ 3. POST /client/      │                       │
   │                        │    issues/raise/      │                       │
   │                        │──────────────────────>│                       │
   │                        │    + Auth Token       │                       │
   │                        │                       │                       │
   │                        │                       │ 4. Validate token     │
   │                        │                       │───────────────────────>
   │                        │                       │                       │
   │                        │                       │ 5. Check permissions  │
   │                        │                       │───────────────────────>
   │                        │                       │                       │
   │                        │                       │ 6. Create issue       │
   │                        │                       │───────────────────────>
   │                        │                       │                       │
   │                        │                       │ 7. Generate issue_number
   │                        │                       │───────────────────────>
   │                        │                       │                       │
   │                        │                       │<──────────────────────│
   │                        │ 8. Return issue       │                       │
   │                        │<──────────────────────│                       │
   │                        │                       │                       │
   │ 9. Show success        │                       │                       │
   │<───────────────────────│                       │                       │
   │                        │                       │                       │
   │ 10. Navigate to list   │                       │                       │
   │<───────────────────────│                       │                       │
```

### 2. Vendor Updates Issue Status Flow

```
Vendor                  Mobile App               Backend                Database
   │                        │                       │                       │
   │ 1. Opens issue detail  │                       │                       │
   │───────────────────────>│                       │                       │
   │                        │                       │                       │
   │                        │ 2. GET /issues/:id    │                       │
   │                        │──────────────────────>│                       │
   │                        │                       │                       │
   │                        │                       │ 3. Fetch issue        │
   │                        │                       │───────────────────────>
   │                        │                       │<──────────────────────│
   │                        │                       │                       │
   │                        │ 4. Return issue data  │                       │
   │ 5. View issue          │<──────────────────────│                       │
   │<───────────────────────│                       │                       │
   │                        │                       │                       │
   │ 6. Changes status      │                       │                       │
   │───────────────────────>│                       │                       │
   │                        │                       │                       │
   │                        │ 7. PATCH /issues/:id  │                       │
   │                        │    {status: "in_progress"}                    │
   │                        │──────────────────────>│                       │
   │                        │                       │                       │
   │                        │                       │ 8. Validate vendor    │
   │                        │                       │───────────────────────>
   │                        │                       │                       │
   │                        │                       │ 9. Update issue       │
   │                        │                       │───────────────────────>
   │                        │                       │                       │
   │                        │                       │ 10. Sync to Linear    │
   │                        │                       │    (if configured)    │
   │                        │                       │                       │
   │                        │                       │<──────────────────────│
   │                        │ 11. Return updated    │                       │
   │                        │     issue             │                       │
   │                        │<──────────────────────│                       │
   │                        │                       │                       │
   │ 12. Show success       │                       │                       │
   │<───────────────────────│                       │                       │
   │                        │                       │                       │
   │ [Customer sees update next time they check]   │                       │
```

## Role-Based Access Control

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER ROLES & PERMISSIONS                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────┐      ┌────────────────┐      ┌───────────┐ │
│  │   CUSTOMER     │      │     VENDOR     │      │    BOTH   │ │
│  │   (CLIENT)     │      │   (EMPLOYEE)   │      │           │ │
│  ├────────────────┤      ├────────────────┤      ├───────────┤ │
│  │                │      │                │      │           │ │
│  │ ✅ Create      │      │ ✅ View All    │      │Can Switch:│ │
│  │    Issues      │      │    Issues      │      │           │ │
│  │                │      │                │      │ CLIENT    │ │
│  │ ✅ View Own    │      │ ✅ Update      │      │    ↕      │ │
│  │    Issues      │      │    Status      │      │ VENDOR    │ │
│  │                │      │                │      │           │ │
│  │ ✅ Add         │      │ ✅ Update      │      │           │ │
│  │    Comments    │      │    Priority    │      │           │ │
│  │                │      │                │      │           │ │
│  │ ✅ Track       │      │ ✅ Assign      │      │           │ │
│  │    Status      │      │    Issues      │      │           │ │
│  │                │      │                │      │           │ │
│  │ ❌ Update      │      │ ✅ Resolve     │      │           │ │
│  │    Status      │      │    Issues      │      │           │ │
│  │                │      │                │      │           │ │
│  │ ❌ Resolve     │      │ ✅ Filter &    │      │           │ │
│  │    Issues      │      │    Search      │      │           │ │
│  │                │      │                │      │           │ │
│  │ ❌ Assign      │      │ ❌ Create      │      │           │ │
│  │    Issues      │      │    Issues      │      │           │ │
│  └────────────────┘      └────────────────┘      └───────────┘ │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## UI Component Hierarchy

```
MainActivity
├── LoginScreen
│   └── LoginViewModel → AuthRepository → AuthApiService
│
├── DashboardScreen (Vendor)
│   └── Navigation Menu
│
├── ClientDashboardScreen (Customer)
│   └── Navigation Menu
│
└── IssuesScreen (Smart Router)
    ├── IF activeMode == CLIENT:
    │   └── CustomerIssuesListScreen
    │       ├── CustomerCreateIssueScreen
    │       │   └── IssueViewModel → IssueRepository → IssueApiService
    │       └── CustomerIssueDetailScreen
    │           └── IssueViewModel → IssueRepository → IssueApiService
    │
    └── IF activeMode == VENDOR:
        └── VendorIssuesListScreen
            └── VendorIssueDetailScreen
                └── IssueViewModel → IssueRepository → IssueApiService
```

## State Management Flow

```
┌──────────────────────────────────────────────────────────┐
│                    STATE FLOW                             │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  UI Composable                                            │
│       │                                                   │
│       │ 1. User Action                                    │
│       │                                                   │
│       ▼                                                   │
│  ViewModel                                                │
│       │                                                   │
│       │ 2. Business Logic                                 │
│       │                                                   │
│       ▼                                                   │
│  Repository                                               │
│       │                                                   │
│       │ 3. API Call                                       │
│       │                                                   │
│       ▼                                                   │
│  API Service (Retrofit)                                   │
│       │                                                   │
│       │ 4. HTTP Request                                   │
│       │                                                   │
│       ▼                                                   │
│  Backend API                                              │
│       │                                                   │
│       │ 5. Response                                       │
│       │                                                   │
│       ▼                                                   │
│  Repository                                               │
│       │                                                   │
│       │ 6. Result<T>                                      │
│       │                                                   │
│       ▼                                                   │
│  ViewModel                                                │
│       │                                                   │
│       │ 7. Update UiState                                 │
│       │                                                   │
│       ▼                                                   │
│  UI Composable                                            │
│       │                                                   │
│       │ 8. Recompose                                      │
│       │                                                   │
│       ▼                                                   │
│  User sees result                                         │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

## Key Technologies Used

```
┌─────────────────────────────────────────────────────────┐
│                    TECH STACK                            │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Mobile App (Android)                                    │
│  ─────────────────────                                   │
│  • Language: Kotlin                                      │
│  • UI: Jetpack Compose                                   │
│  • Architecture: MVVM                                    │
│  • Networking: Retrofit 2                                │
│  • Serialization: Gson                                   │
│  • Async: Kotlin Coroutines + Flow                       │
│  • State: StateFlow, MutableStateFlow                    │
│  • Storage: SharedPreferences                            │
│                                                          │
│  Backend                                                 │
│  ────────                                                │
│  • Framework: Django + DRF                               │
│  • Database: SQLite (dev) / PostgreSQL (prod)            │
│  • Auth: Token Authentication                            │
│  • API: RESTful                                          │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

This architecture provides:
- ✅ Clean separation of concerns
- ✅ Role-based access control
- ✅ Scalable and maintainable code
- ✅ Type-safe API communication
- ✅ Reactive UI updates
- ✅ Proper error handling

