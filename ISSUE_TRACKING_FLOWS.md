# Issue Tracking System - Visual Flow Diagram

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     ISSUE TRACKING SYSTEM                        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                          FRONTEND LAYER                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ IssuesPage   │  │IssueDetailPg │  │EditIssuePage │          │
│  │              │  │              │  │              │          │
│  │ - List       │  │ - View       │  │ - Edit Form  │          │
│  │ - Filters    │  │ - Resolve    │  │ - Update     │          │
│  │ - Stats      │  │ - Close      │  │ - Validation │          │
│  │ - Create     │  │ - Reopen     │  │              │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                 │                 │                    │
│         └─────────────────┼─────────────────┘                    │
│                           │                                      │
│                  ┌────────▼─────────┐                           │
│                  │   React Hooks    │                           │
│                  │   (useIssues)    │                           │
│                  │                  │                           │
│                  │ - useIssues()    │                           │
│                  │ - useIssue(id)   │                           │
│                  │ - useMutations() │                           │
│                  └────────┬─────────┘                           │
│                           │                                      │
│                  ┌────────▼─────────┐                           │
│                  │  Issue Service   │                           │
│                  │  (API Client)    │                           │
│                  │                  │                           │
│                  │ - getAll()       │                           │
│                  │ - getById()      │                           │
│                  │ - create()       │                           │
│                  │ - update()       │                           │
│                  │ - resolve()      │                           │
│                  └────────┬─────────┘                           │
│                           │                                      │
└───────────────────────────┼──────────────────────────────────────┘
                            │
                   ┌────────▼─────────┐
                   │   HTTP/REST API   │
                   └────────┬─────────┘
                            │
┌───────────────────────────▼──────────────────────────────────────┐
│                        BACKEND LAYER                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌────────────────────────────────────────────────────────┐     │
│  │                    URL Router                          │     │
│  │  /api/issues/                                          │     │
│  │  /api/issues/{id}/                                     │     │
│  │  /api/issues/raise/                                    │     │
│  │  /api/issues/resolve/{id}/                             │     │
│  │  /api/client/issues/raise/                             │     │
│  └────────────────────┬───────────────────────────────────┘     │
│                       │                                          │
│         ┌─────────────┼─────────────┐                           │
│         │             │             │                            │
│  ┌──────▼──────┐ ┌───▼────────┐ ┌──▼──────────┐               │
│  │IssueViewSet │ │RaiseIssue  │ │ClientRaise  │               │
│  │             │ │View        │ │IssueView    │               │
│  │ - list()    │ │            │ │             │               │
│  │ - retrieve()│ │ - post()   │ │ - post()    │               │
│  │ - create()  │ │            │ │             │               │
│  │ - update()  │ │            │ │             │               │
│  │ - destroy() │ │            │ │             │               │
│  │ - resolve() │ │            │ │             │               │
│  │ - reopen()  │ │            │ │             │               │
│  │ - stats()   │ │            │ │             │               │
│  └──────┬──────┘ └───┬────────┘ └──┬──────────┘               │
│         │            │              │                           │
│         └────────────┼──────────────┘                           │
│                      │                                           │
│            ┌─────────▼──────────┐                               │
│            │  Permission Check  │                               │
│            │     (RBAC)         │                               │
│            └─────────┬──────────┘                               │
│                      │                                           │
│            ┌─────────▼──────────┐                               │
│            │  Issue Serializer  │                               │
│            │                    │                               │
│            │ - Validate data    │                               │
│            │ - Format response  │                               │
│            └─────────┬──────────┘                               │
│                      │                                           │
│            ┌─────────▼──────────┐      ┌──────────────────┐    │
│            │   Issue Model      │◄────►│ Linear Service   │    │
│            │                    │      │                  │    │
│            │ - issue_number     │      │ - createIssue()  │    │
│            │ - title            │      │ - syncStatus()   │    │
│            │ - description      │      │ - mapPriority()  │    │
│            │ - priority         │      └──────────────────┘    │
│            │ - status           │                               │
│            │ - category         │      ┌──────────────────┐    │
│            │ - vendor_id        │◄────►│  Organization    │    │
│            │ - order_id         │      └──────────────────┘    │
│            │ - organization_id  │                               │
│            │ - linear_issue_id  │      ┌──────────────────┐    │
│            └─────────┬──────────┘◄────►│     Vendor       │    │
│                      │                  └──────────────────┘    │
│                      │                                           │
│            ┌─────────▼──────────┐      ┌──────────────────┐    │
│            │     Database       │◄────►│     Order        │    │
│            │   (SQLite/PG)      │      └──────────────────┘    │
│            └────────────────────┘                               │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

## User Flow Diagrams

### Flow 1: Employee Creates Issue

```
┌─────────┐     ┌──────────┐     ┌────────────┐     ┌──────────┐
│Employee │     │ Frontend │     │  Backend   │     │ Linear   │
└────┬────┘     └────┬─────┘     └─────┬──────┘     └────┬─────┘
     │               │                  │                  │
     ├─Navigate to /issues              │                  │
     │               │                  │                  │
     ├─Click "Create Issue"             │                  │
     │               │                  │                  │
     ├─Fill form     │                  │                  │
     │               │                  │                  │
     ├─Submit────────►                  │                  │
     │               │                  │                  │
     │               ├─POST /api/issues/│                  │
     │               │                  │                  │
     │               │      ◄──Check permissions           │
     │               │                  │                  │
     │               │      ◄──Validate data               │
     │               │                  │                  │
     │               │      ◄──Create Issue                │
     │               │                  │                  │
     │               │                  ├──Sync to Linear─►│
     │               │                  │                  │
     │               │                  │◄─Linear ID───────┤
     │               │                  │                  │
     │               │◄─Issue Created───┤                  │
     │               │                  │                  │
     │◄─Success notification            │                  │
     │               │                  │                  │
     ├─View issue detail                │                  │
     │               │                  │                  │
```

### Flow 2: Customer Raises Issue

```
┌─────────┐     ┌──────────┐     ┌────────────┐     ┌──────────┐
│Customer │     │ Frontend │     │  Backend   │     │  Vendor  │
└────┬────┘     └────┬─────┘     └─────┬──────┘     └────┬─────┘
     │               │                  │                  │
     ├─Login (customer profile)         │                  │
     │               │                  │                  │
     ├─Navigate to /client/issues       │                  │
     │               │                  │                  │
     ├─Click "Raise Issue"              │                  │
     │               │                  │                  │
     ├─Select vendor │                  │                  │
     │               │                  │                  │
     ├─Fill details  │                  │                  │
     │               │                  │                  │
     ├─Submit────────►                  │                  │
     │               │                  │                  │
     │               ├─POST /api/client/issues/raise/      │
     │               │                  │                  │
     │               │      ◄──Create Issue                │
     │               │                  │                  │
     │               │      ◄──Set is_client_issue=true    │
     │               │                  │                  │
     │               │      ◄──Link to customer            │
     │               │                  │                  │
     │               │                  ├──Notify vendor──►│
     │               │                  │                  │
     │               │◄─Issue Created───┤                  │
     │               │                  │                  │
     │◄─Success      │                  │                  │
     │               │                  │                  │
```

### Flow 3: Resolve Issue

```
┌─────────┐     ┌──────────┐     ┌────────────┐     ┌──────────┐
│Employee │     │ Frontend │     │  Backend   │     │ Linear   │
└────┬────┘     └────┬─────┘     └─────┬──────┘     └────┬─────┘
     │               │                  │                  │
     ├─Open issue detail                │                  │
     │               │                  │                  │
     ├─Click "Resolve"                  │                  │
     │               │                  │                  │
     ├─Enter resolution notes           │                  │
     │               │                  │                  │
     ├─Submit────────►                  │                  │
     │               │                  │                  │
     │               ├─POST /api/issues/resolve/{id}/      │
     │               │                  │                  │
     │               │      ◄──Check permission            │
     │               │                  │                  │
     │               │      ◄──Update status=resolved      │
     │               │                  │                  │
     │               │      ◄──Set resolved_at             │
     │               │                  │                  │
     │               │      ◄──Set resolved_by             │
     │               │                  │                  │
     │               │      ◄──Add resolution_notes        │
     │               │                  │                  │
     │               │                  ├──Update Linear──►│
     │               │                  │                  │
     │               │                  │◄─Confirmed───────┤
     │               │                  │                  │
     │               │◄─Issue Resolved──┤                  │
     │               │                  │                  │
     │◄─Success notification            │                  │
     │               │                  │                  │
```

## Component Hierarchy

```
App.tsx
└── Routes
    ├── /issues
    │   └── IssuesPage
    │       ├── PageHeader
    │       ├── IssueStatsGrid
    │       │   └── StatCard (x4)
    │       ├── IssueFiltersPanel
    │       │   ├── SearchInput
    │       │   ├── StatusFilter
    │       │   ├── PriorityFilter
    │       │   └── CategoryFilter
    │       ├── IssuesDataTable
    │       │   └── Table.Row (for each issue)
    │       │       ├── Badge (status, priority)
    │       │       └── ActionButtons
    │       └── CreateIssueModal
    │           └── Form
    │
    ├── /issues/:id
    │   └── IssueDetailPage
    │       ├── PageHeader
    │       ├── StatusBadges
    │       ├── IssueContent
    │       │   ├── Description Card
    │       │   ├── Resolution Notes Card
    │       │   └── Linear Integration Card
    │       ├── IssueDetails Sidebar
    │       │   └── Details Card
    │       ├── ResolveIssueModal
    │       └── ConfirmDialog (delete)
    │
    └── /issues/:id/edit
        └── EditIssuePage
            ├── PageHeader
            └── Form Card
                ├── Title Input
                ├── Description Textarea
                ├── Priority Select
                ├── Category Select
                ├── Status Select
                └── Action Buttons
```

## Data Flow

```
User Action
    │
    ▼
React Component
    │
    ▼
React Hook (useIssues)
    │
    ▼
React Query
    │
    ▼
Issue Service (issueService)
    │
    ▼
API Client (axios)
    │
    ▼
HTTP Request
    │
    ▼
Django URL Router
    │
    ▼
ViewSet/View
    │
    ▼
Permission Check
    │
    ▼
Serializer Validation
    │
    ▼
Django ORM
    │
    ▼
Database
    │
    ▼
Response Data
    │
    ▼
Serializer Format
    │
    ▼
JSON Response
    │
    ▼
API Client
    │
    ▼
React Query Cache
    │
    ▼
React Component Update
    │
    ▼
UI Update
```

## Permission Flow

```
┌─────────────────────────────────────────────────────────┐
│                   Permission Check                       │
└─────────────────────────────────────────────────────────┘

User makes request
    │
    ▼
Identify user profile (employee/vendor/customer)
    │
    ├──► Customer?
    │    │
    │    ├──► Viewing own issue? ──► ALLOW
    │    └──► Viewing other's issue? ──► DENY
    │
    ├──► Employee/Vendor?
    │    │
    │    ▼
    │    Check RBAC permissions
    │    │
    │    ├──► Has issue:view? ──► ALLOW
    │    └──► No permission? ──► DENY
    │
    └──► Not authenticated? ──► DENY
```

## State Management Flow

```
┌─────────────────────────────────────────────────────────┐
│                   React Query State                      │
└─────────────────────────────────────────────────────────┘

Query Keys:
├── ['issues', filters] ──► Issues list with filters
├── ['issues', id] ──► Single issue by ID
└── ['issues', 'stats'] ──► Issue statistics

Mutations:
├── createIssue ──► Creates new issue
│   └── Invalidates: ['issues']
│
├── updateIssue ──► Updates existing issue
│   └── Invalidates: ['issues'], ['issues', id]
│
├── deleteIssue ──► Deletes issue
│   └── Invalidates: ['issues']
│
└── resolveIssue ──► Resolves issue
    └── Invalidates: ['issues'], ['issues', id], ['issues', 'stats']
```

---

**Last Updated**: November 9, 2025

