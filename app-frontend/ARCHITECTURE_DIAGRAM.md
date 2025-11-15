# Issue Tracking System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Mobile App (Android)                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │
        ┌─────────────────────┴─────────────────────┐
        │                                            │
        ▼                                            ▼
┌───────────────┐                          ┌──────────────────┐
│   Customer    │                          │ Vendor/Employee  │
│   Profile     │                          │    Profile       │
└───────────────┘                          └──────────────────┘
        │                                            │
        │ Can:                                       │ Can:
        │ • Create Issues                            │ • View All Issues
        │ • View Own Issues                          │ • Filter Issues
        │ • Add Comments                             │ • Update Status
        │ • Track Status                             │ • Update Priority
        │                                            │ • Resolve Issues
        │                                            │ • Assign Issues
        │                                            │
        │ Cannot:                                    │ Cannot:
        │ • Edit Other Issues                        │ • Create Issues
        │ • Resolve Issues                           │ • Delete Issues
        │                                            │
        └────────────────┬───────────────────────────┘
                         │
                         │ HTTP/REST API
                         │
                         ▼
        ┌────────────────────────────────────────────┐
        │        Django Backend (Python)             │
        │                                            │
        │  ┌──────────────────────────────────┐    │
        │  │  API Endpoints                   │    │
        │  │  • /api/client/issues/raise/     │    │
        │  │  • /api/client/issues/{id}/      │    │
        │  │  • /api/issues/                  │    │
        │  │  • /api/issues/{id}/             │    │
        │  │  • /api/issues/resolve/{id}/     │    │
        │  └──────────────────────────────────┘    │
        │                                            │
        │  ┌──────────────────────────────────┐    │
        │  │  Linear Service                  │    │
        │  │  • Auto-sync on create           │    │
        │  │  • Store Linear ID & URL         │    │
        │  │  • Team-based routing            │    │
        │  └──────────────────────────────────┘    │
        │                                            │
        │  ┌──────────────────────────────────┐    │
        │  │  Database (SQLite/PostgreSQL)    │    │
        │  │  • Issues table                  │    │
        │  │  • Customers table               │    │
        │  │  • Organizations table           │    │
        │  └──────────────────────────────────┘    │
        └────────────────────────────────────────────┘
                         │
                         │ GraphQL API
                         │
                         ▼
        ┌────────────────────────────────────────────┐
        │           Linear (linear.app)              │
        │                                            │
        │  • Issue Tracking                          │
        │  • Team Collaboration                      │
        │  • Status Management                       │
        │  • Comments & Updates                      │
        └────────────────────────────────────────────┘


Mobile App Architecture (MVVM Pattern)
═══════════════════════════════════════

┌─────────────────────────────────────────────────────────────┐
│                        UI Layer                             │
│  ┌───────────────────┐        ┌───────────────────┐       │
│  │  Customer Screens │        │  Vendor Screens   │       │
│  │  • CreateScreen   │        │  • ListScreen     │       │
│  │  • ListScreen     │        │  • DetailScreen   │       │
│  │  • DetailScreen   │        │                   │       │
│  └───────────────────┘        └───────────────────┘       │
└─────────────────────────────────────────────────────────────┘
                         │
                         │ Observes StateFlow
                         │
┌─────────────────────────────────────────────────────────────┐
│                     ViewModel Layer                         │
│  ┌───────────────────────────────────────────────────────┐ │
│  │              IssueViewModel                           │ │
│  │  • UiState (Loading/Success/Error)                    │ │
│  │  • createIssue()                                      │ │
│  │  • loadAllIssues()                                    │ │
│  │  • updateIssueStatus()                                │ │
│  │  • resolveIssue()                                     │ │
│  │  • Filters (status, priority)                         │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                         │
                         │ Calls Repository
                         │
┌─────────────────────────────────────────────────────────────┐
│                    Repository Layer                         │
│  ┌───────────────────────────────────────────────────────┐ │
│  │             IssueRepository                           │ │
│  │  • createIssue()                                      │ │
│  │  • getAllIssues()                                     │ │
│  │  • getIssue()                                         │ │
│  │  • updateIssueStatus()                                │ │
│  │  • resolveIssue()                                     │ │
│  │  • Handles API calls & responses                      │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                         │
                         │ Uses Retrofit
                         │
┌─────────────────────────────────────────────────────────────┐
│                      Data Layer                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │              IssueApiService                          │ │
│  │  • Retrofit Interface                                 │ │
│  │  • POST /client/issues/raise/                         │ │
│  │  • GET /issues/                                       │ │
│  │  • PATCH /issues/{id}/                                │ │
│  └───────────────────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────────────────┐ │
│  │                 ApiClient                             │ │
│  │  • Retrofit Configuration                             │ │
│  │  • OkHttp Client                                      │ │
│  │  • Auth Interceptor                                   │ │
│  └───────────────────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────────────────┐ │
│  │              Issue Data Models                        │ │
│  │  • Issue                                              │ │
│  │  • CreateIssueRequest                                 │ │
│  │  • IssueResponse                                      │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘


Data Flow Examples
══════════════════

Customer Creates Issue:
───────────────────────
1. CustomerCreateIssueScreen
   └─> User fills form (title, description, priority)
       └─> Clicks "Submit"
           └─> IssueViewModel.createIssue()
               └─> IssueRepository.createIssue()
                   └─> IssueApiService.createIssue()
                       └─> Django Backend
                           └─> Linear Service
                               └─> Linear API (creates issue)
                           └─> Save to Database
                       └─> Return IssueResponse
                   └─> Update ViewModel state
               └─> Navigate back to list
           └─> Customer sees new issue with "Synced to Linear" badge

Vendor Views & Updates:
────────────────────────
1. VendorIssuesListScreen
   └─> Load issues on screen open
       └─> IssueViewModel.loadAllIssues()
           └─> IssueRepository.getAllIssues()
               └─> IssueApiService.getAllIssues()
                   └─> Django Backend returns all customer issues
               └─> Update UiState.Success(issues)
           └─> Screen displays filtered list

2. Vendor clicks issue
   └─> VendorIssueDetailScreen
       └─> IssueViewModel.loadIssueDetails(id)
           └─> Load issue data
       └─> Vendor clicks "Update Status"
           └─> IssueViewModel.updateIssueStatus(id, "in_progress")
               └─> IssueRepository.updateIssueStatus()
                   └─> Django Backend updates issue
                       └─> Linear Service syncs update
                   └─> Return updated issue
               └─> Reload issue details
           └─> Customer sees status change in their app

Status/Priority Color Coding:
──────────────────────────────
Status:
  • Open         → Red background
  • In Progress  → Blue background
  • Resolved     → Green background
  • Closed       → Gray background

Priority:
  • Urgent       → Dark Red
  • High         → Orange
  • Medium       → Yellow
  • Low          → Gray

Linear Badge:
  • Synced       → Purple badge with link icon
```

