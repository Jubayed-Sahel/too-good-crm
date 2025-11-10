# Too Good CRM

A comprehensive Customer Relationship Management system built with modern technologies for managing customers, leads, deals, employees, and business operations.

## 🎯 Project Overview

Too Good CRM is a full-stack CRM application with:
- **Web Frontend** - React + TypeScript SPA
- **Mobile Frontend** - Kotlin/Android native app
- **Backend API** - Django REST Framework
- **Database** - SQLite (dev) / PostgreSQL (prod)

## 📁 Repository Structure

```
too-good-crm/
├── shared-backend/        # Django REST API backend
│   ├── crmApp/           # Main application
│   ├── scripts/          # Utility scripts (test, fix, seed, utilities)
│   └── docs/             # Backend documentation
├── web-frontend/          # React + TypeScript web application
│   ├── src/              # Source code
│   └── docs/             # Frontend documentation
├── app-frontend/          # Kotlin/Android mobile application
├── docs/                  # Project-wide documentation
│   ├── setup/            # Setup guides
│   ├── guides/           # User guides
│   └── implementation/   # Implementation docs
├── scripts/               # Project utility scripts
├── database_schema.sql    # Database schema
└── PRD.pdf               # Product requirements document
```

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 18+
- Android Studio (for mobile app)
- Git

### Backend Setup

```bash
cd shared-backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Seed database (optional)
python scripts/seed/comprehensive_seed_data.py

# Start server
python manage.py runserver
```

Backend runs at: `http://localhost:8000`

See [Backend README](shared-backend/README.md) for detailed documentation.

### Web Frontend Setup

```bash
cd web-frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Web app runs at: `http://localhost:5173`

See [Frontend README](web-frontend/README.md) for detailed documentation.

### Mobile App Setup

```bash
cd app-frontend

# Open in Android Studio
# Sync Gradle dependencies
# Run on emulator or device
```

See [Mobile README](app-frontend/README.md) for detailed documentation.

### MCP (Model Context Protocol) Setup

MCP enables AI assistants like Claude to interact with your CRM data and browser automation.

```bash
# Configure MCP servers in Claude Desktop
# See MCP_SETUP.md for complete instructions

# Launch Edge in debug mode (for Edge DevTools MCP)
# Windows:
launch-edge-debug.bat
# Or PowerShell:
.\launch-edge-debug.ps1

# Check console errors in browser
python scripts\check_console_errors.py
# Or use advanced monitoring:
python scripts\check_console_errors_advanced.py
```

See [MCP Setup Guide](MCP_SETUP.md) for detailed configuration instructions.
See [Console Error Checking Guide](scripts/CONSOLE_ERROR_CHECKING_GUIDE.md) for debugging browser errors.

## ✨ Key Features

### Customer Management
- Complete customer lifecycle management
- Customer profiles with contact information
- Activity tracking and history
- Customer notes and tags
- Customer analytics

### Lead Management
- Lead capture and qualification
- Lead scoring and prioritization
- Lead assignment and routing
- Lead conversion tracking
- Lead source analytics

### Deal Management
- Sales pipeline visualization
- Deal stages and progression
- Deal value tracking
- Forecasting and reporting
- Win/loss analysis

### Employee Management
- Employee profiles and roles
- Team organization
- Activity tracking
- Performance metrics
- Employee invitations

### Issue Tracking
- Issue creation and assignment
- Linear integration for issue sync
- Issue status tracking
- Priority management
- Resolution workflows

### Analytics & Reporting
- Sales analytics dashboard
- Revenue tracking
- Conversion funnel analysis
- Activity reports
- Custom report generation

### Role-Based Access Control (RBAC)
- Flexible permission system
- Role management
- Organization-level isolation
- Fine-grained access control
- Audit logging

### Multi-User Support
- User profiles and authentication
- Profile switching
- Organization management
- Team collaboration
- Activity feeds

### Integrations
- **Linear** - Issue tracking synchronization
- **Jitsi** - Call management
- **MCP** - AI assistant integration (Django CRM + Edge DevTools)

## 🏗️ Architecture

### Backend Architecture
```
Django REST Framework
├── Models (Database layer)
├── Serializers (Data transformation)
├── Viewsets (API endpoints)
├── Services (Business logic)
├── Middleware (Request processing)
└── Permissions (Access control)
```

### Frontend Architecture
```
React + TypeScript
├── Pages (Route components)
├── Components (UI components)
├── Features (Feature modules)
├── Services (API layer)
├── Hooks (Reusable logic)
├── Contexts (Global state)
└── Utils (Helper functions)
```

### Mobile Architecture
```
Kotlin + Jetpack Compose
├── UI Layer (Composables)
├── ViewModel Layer (State management)
├── Repository Layer (Data access)
├── Network Layer (API client)
└── Data Layer (Local storage)
```

## 🔐 Authentication & Security

### Authentication
- JWT token-based authentication
- Access and refresh token flow
- Token auto-refresh
- Secure token storage

### Authorization
- Role-Based Access Control (RBAC)
- Permission-based routing
- Organization-level isolation
- API endpoint permissions

### Security Features
- CORS configuration
- CSRF protection
- SQL injection prevention
- XSS protection
- Password hashing (bcrypt)
- Rate limiting

## 📊 Database Schema

The application uses a comprehensive relational database schema with:

### Core Tables
- `users` - User accounts
- `user_profiles` - User profile information
- `organizations` - Organization/company data
- `employees` - Employee profiles

### CRM Tables
- `customers` - Customer records
- `leads` - Lead information
- `deals` - Sales deals
- `orders` - Customer orders
- `vendors` - Vendor information

### Activity Tables
- `activities` - Activity logs
- `calls` - Call records
- `notifications` - User notifications
- `issues` - Issue tracking

### RBAC Tables
- `roles` - User roles
- `permissions` - Permission definitions
- `role_permissions` - Role-permission mappings

See [database_schema.sql](database_schema.sql) for complete schema.

### Tech Stack

**Backend:**
- Python 3.8+
- Django 4.x
- Django REST Framework
- SQLite/PostgreSQL
- JWT Authentication

**Web Frontend:**
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Chakra UI
- React Query
- Axios

**Mobile:**
- Kotlin
- Jetpack Compose
- Retrofit
- Coroutines
- Material Design 3

**Prerequisites:**
- Python 3.8+ server
- PostgreSQL database
- Environment variables configured

**Steps:**
```bash
# Install dependencies
pip install -r requirements.txt

# Configure database
export DATABASE_URL=postgresql://...

# Run migrations
python manage.py migrate

# Collect static files
python manage.py collectstatic

# Start with gunicorn
gunicorn crmAdmin.wsgi:application
```

### Frontend Deployment

**Build:**
```bash
cd web-frontend
npm run build
```

### Mobile Deployment

**Build APK:**
```bash
cd app-frontend
./gradlew assembleRelease
```

## Acknowledgments

- Django REST Framework
- React and the React ecosystem
- Jetpack Compose

---



