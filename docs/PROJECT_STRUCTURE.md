# Project Structure

## Overview

This is a full-stack CRM application with the following components:
- **shared-backend**: Django REST API backend
- **web-frontend**: React + TypeScript web application
- **app-frontend**: Kotlin/Android mobile application

## Directory Structure

```
too-good-crm/
├── shared-backend/          # Django REST API
│   ├── crmAdmin/            # Django project settings
│   ├── crmApp/              # Main application
│   │   ├── models/          # Database models
│   │   ├── serializers/     # DRF serializers
│   │   ├── viewsets/        # API viewsets
│   │   ├── views/           # Custom views
│   │   ├── services/        # Business logic
│   │   ├── management/      # Django management commands
│   │   └── ...
│   ├── scripts/             # Utility scripts
│   │   ├── test/            # Test scripts
│   │   ├── fix/             # Fix/repair scripts
│   │   ├── seed/            # Database seeding
│   │   ├── utilities/       # Utility scripts
│   │   └── verify/          # Verification scripts
│   ├── docs/                # Backend documentation
│   ├── tests/               # Unit tests
│   └── requirements.txt     # Python dependencies
│
├── web-frontend/            # React web application
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   ├── hooks/           # Custom React hooks
│   │   ├── contexts/        # React contexts
│   │   ├── types/           # TypeScript types
│   │   └── ...
│   ├── docs/                # Frontend documentation
│   └── package.json         # Node dependencies
│
├── app-frontend/            # Android mobile application
│   └── app/                 # Kotlin source code
│
├── docs/                    # Project-wide documentation
├── scripts/                 # Project-wide utility scripts
└── README.md                # Main project README
```

## Backend Organization

### Core Application (`crmApp/`)
- **models/**: Database models (User, Organization, Customer, Issue, etc.)
- **serializers/**: DRF serializers for API responses
- **viewsets/**: REST API endpoints
- **views/**: Custom API views (client issues, Linear webhooks)
- **services/**: Business logic (Linear integration, RBAC, etc.)
- **management/commands/**: Django management commands
- **middleware/**: Custom middleware (organization context)
- **decorators/**: Custom decorators (RBAC permissions)

### Scripts (`scripts/`)
- **test/**: Test scripts for API endpoints
- **fix/**: Scripts to fix database issues
- **seed/**: Database seeding scripts
- **utilities/**: Utility scripts (check users, get Linear team ID)
- **verify/**: Verification scripts (API endpoints, user profiles)

### Documentation (`docs/`)
- **API_TESTING_GUIDE.md**: How to test API endpoints
- **LINEAR_INTEGRATION_GUIDE.md**: Linear integration documentation
- **ISSUE_ACTION_ENDPOINTS.md**: Issue management endpoints

## Frontend Organization

### Source Code (`src/`)
- **components/**: Reusable React components
  - **common/**: Common UI components
  - **dashboard/**: Dashboard components
  - **issues/**: Issue management components
  - **customers/**: Customer management components
  - etc.
- **pages/**: Page-level components
- **services/**: API service layer
- **hooks/**: Custom React hooks
- **contexts/**: React contexts (Profile, Permission)
- **types/**: TypeScript type definitions

### Documentation (`docs/`)
- **API_ARCHITECTURE.md**: API integration architecture
- **AUTH_IMPLEMENTATION.md**: Authentication implementation
- **PERMISSION_MANAGEMENT_GUIDE.md**: Permission system guide

## Key Files

### Backend
- `manage.py`: Django management script
- `requirements.txt`: Python dependencies
- `crmAdmin/settings.py`: Django settings
- `crmApp/urls.py`: URL routing

### Frontend
- `vite.config.ts`: Vite configuration
- `package.json`: Node dependencies
- `tsconfig.json`: TypeScript configuration
- `src/main.tsx`: Application entry point

## Scripts Location

### Backend Scripts
- Test scripts: `shared-backend/scripts/test/`
- Fix scripts: `shared-backend/scripts/fix/`
- Utility scripts: `shared-backend/scripts/utilities/`
- Management commands: `shared-backend/crmApp/management/commands/`

### Project Scripts
- Utility scripts: `scripts/`
- Documentation: `docs/`

## Important Notes

1. **MCP Servers**: `mcp_server.py` and `mcp_server_remote.py` are in the backend root
2. **Logs**: Django logs are in `shared-backend/logs/`
3. **Media**: User uploads are in `shared-backend/media/`
4. **Database**: SQLite database is `shared-backend/db.sqlite3` (development only)

## Environment Setup

See:
- `shared-backend/ENV_SETUP.md`: Backend environment setup
- `web-frontend/README.md`: Frontend setup
- `docs/`: Additional setup guides

