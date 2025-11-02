# CRM Backend API

A Django REST Framework-based backend for a comprehensive CRM system with multi-tenant architecture and role-based access control.

## 🚀 Features

- **Authentication & Authorization**
  - JWT-based authentication
  - Custom User model with email login
  - Role-Based Access Control (RBAC)
  - Multi-tenant architecture

- **Core CRM Features**
  - Customer Management
  - Lead Management with conversion tracking
  - Deal & Pipeline Management
  - Employee Management
  - Vendor Management
  - Organization Management

- **API Features**
  - RESTful API endpoints
  - Comprehensive filtering and search
  - Pagination support
  - Bulk operations
  - Statistics and analytics endpoints
  - Export functionality

## 📋 Prerequisites

- Python 3.8+
- pip
- Virtual environment (recommended)

## 🛠️ Installation

### 1. Create and activate virtual environment

```bash
# Windows
python -m venv .venv
.\.venv\Scripts\activate

# Linux/Mac
python3 -m venv .venv
source .venv/bin/activate
```

### 2. Install dependencies

```bash
pip install -r requirement.txt
```

### 3. Apply migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

### 4. Create superuser

```bash
python manage.py createsuperuser
```

### 5. Run development server

```bash
python manage.py runserver
```

The API will be available at: `http://127.0.0.1:8000/api/`

## 📁 Project Structure

```
shared-backend/
├── crmAdmin/           # Project settings
│   ├── settings.py     # Configuration
│   ├── urls.py         # Root URL config
│   └── wsgi.py
├── crmApp/             # Main application
│   ├── models/         # Database models (modular)
│   │   ├── auth.py     # User, Token models
│   │   ├── organization.py
│   │   ├── rbac.py     # Role, Permission models
│   │   ├── customer.py
│   │   ├── lead.py
│   │   └── deal.py
│   ├── serializers/    # DRF serializers (modular)
│   │   ├── auth.py
│   │   ├── customer.py
│   │   └── ...
│   ├── viewsets/       # API ViewSets (modular)
│   │   ├── auth.py
│   │   ├── customer.py
│   │   └── ...
│   ├── migrations/     # Database migrations
│   ├── admin.py        # Django admin config
│   ├── urls.py         # App URL routes
│   ├── utils.py        # Utility functions
│   ├── validators.py   # Custom validators
│   ├── permissions.py  # Custom permissions
│   ├── pagination.py   # Pagination classes
│   ├── exceptions.py   # Exception handlers
│   ├── constants.py    # App constants
│   └── mixins.py       # ViewSet mixins
├── tests/              # Test suite
│   ├── test_models.py
│   ├── test_serializers.py
│   └── test_api.py
├── test_api.py         # Comprehensive API test script
├── manage.py
├── requirement.txt
└── README.md
```

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/login/` - User login
- `POST /api/auth/logout/` - User logout
- `POST /api/auth/change-password/` - Change password
- `GET /api/users/me/` - Current user profile
- `POST /api/users/` - User registration

### Organizations
- `GET /api/organizations/` - List organizations
- `POST /api/organizations/` - Create organization
- `GET /api/organizations/{id}/` - Get organization
- `GET /api/organizations/{id}/members/` - Get members
- `POST /api/organizations/{id}/add_member/` - Add member

### RBAC
- `GET /api/roles/` - List roles
- `POST /api/roles/` - Create role
- `POST /api/roles/{id}/assign_permission/` - Assign permission
- `GET /api/permissions/` - List permissions
- `GET /api/user-roles/my_roles/` - Get my roles

### Customers
- `GET /api/customers/` - List customers
- `POST /api/customers/` - Create customer
- `GET /api/customers/{id}/` - Get customer
- `PUT/PATCH /api/customers/{id}/` - Update customer
- `DELETE /api/customers/{id}/` - Delete customer
- `GET /api/customers/stats/` - Customer statistics
- `POST /api/customers/{id}/activate/` - Activate customer
- `POST /api/customers/{id}/deactivate/` - Deactivate customer

### Leads
- `GET /api/leads/` - List leads
- `POST /api/leads/` - Create lead
- `GET /api/leads/{id}/` - Get lead
- `PUT/PATCH /api/leads/{id}/` - Update lead
- `DELETE /api/leads/{id}/` - Delete lead
- `GET /api/leads/stats/` - Lead statistics
- `POST /api/leads/{id}/convert/` - Convert to customer
- `POST /api/leads/{id}/qualify/` - Mark as qualified
- `POST /api/leads/{id}/disqualify/` - Mark as unqualified

### Deals
- `GET /api/deals/` - List deals
- `POST /api/deals/` - Create deal
- `GET /api/deals/{id}/` - Get deal
- `PUT/PATCH /api/deals/{id}/` - Update deal
- `DELETE /api/deals/{id}/` - Delete deal
- `GET /api/deals/stats/` - Deal statistics
- `POST /api/deals/{id}/move_stage/` - Move to stage
- `POST /api/deals/{id}/mark_won/` - Mark as won
- `POST /api/deals/{id}/mark_lost/` - Mark as lost
- `POST /api/deals/{id}/reopen/` - Reopen deal

### Pipelines
- `GET /api/pipelines/` - List pipelines
- `POST /api/pipelines/` - Create pipeline
- `POST /api/pipelines/{id}/set_default/` - Set as default
- `GET /api/pipeline-stages/` - List stages
- `POST /api/pipeline-stages/` - Create stage
- `POST /api/pipeline-stages/{id}/reorder/` - Reorder stage

### Employees & Vendors
- `GET /api/employees/` - List employees
- `POST /api/employees/` - Create employee
- `GET /api/employees/departments/` - List departments
- `POST /api/employees/{id}/terminate/` - Terminate employee
- `GET /api/vendors/` - List vendors
- `POST /api/vendors/` - Create vendor

## 🔍 Query Parameters

### Filtering
```
GET /api/customers/?status=active
GET /api/leads/?source=website&priority=high
GET /api/deals/?pipeline=1&stage=2
```

### Search
```
GET /api/customers/?search=john
GET /api/leads/?search=company
```

### Pagination
```
GET /api/customers/?page=1&page_size=50
```

### Ordering
```
GET /api/deals/?ordering=-created_at
GET /api/leads/?ordering=score
```

## 🧪 Testing

### Run Unit Tests
```bash
python manage.py test tests/
```

### Run API Test Suite
```bash
# Make sure server is running
python manage.py runserver

# In another terminal
python test_api.py
```

### Test with Django Shell
```bash
python manage.py shell
```

```python
from crmApp.models import User, Lead, Customer
from crmApp.serializers import LeadSerializer

# Create test data
lead = Lead.objects.create(
    organization_id=1,
    first_name="Test",
    last_name="Lead",
    email="test@example.com"
)

# Test serializer
serializer = LeadSerializer(lead)
print(serializer.data)
```

## 🔐 Authentication

All endpoints (except registration and login) require authentication.

### Get Access Token
```bash
POST /api/auth/login/
{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "user": {...},
  "tokens": {
    "access": "eyJ0eXAiOiJKV1QiLCJhbGci...",
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGci..."
  }
}
```

### Use Token in Requests
```bash
GET /api/users/me/
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGci...
```

## 📊 Database Models

### Core Models
- **User** - Custom user with email authentication
- **Organization** - Multi-tenant organization
- **UserOrganization** - User-organization membership
- **Role** - User roles
- **Permission** - System permissions
- **Employee** - Employee records
- **Vendor** - Vendor management
- **Customer** - Customer records
- **Lead** - Sales leads with conversion tracking
- **Deal** - Sales opportunities
- **Pipeline** - Sales pipeline
- **PipelineStage** - Pipeline stages

## 🛡️ Security Features

- JWT authentication with refresh tokens
- Password hashing (Django default)
- Token revocation support
- Organization-scoped data access
- Role-based permissions
- CORS configuration
- CSRF protection
- Custom exception handling

## 📝 Environment Variables (Production)

Create a `.env` file:

```env
DEBUG=False
SECRET_KEY=your-secret-key-here
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
DATABASE_URL=postgresql://user:password@localhost/dbname

# CORS
CORS_ALLOWED_ORIGINS=https://yourdomain.com

# Email (for production)
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
```

## 📚 Dependencies

- Django 5.2.7
- djangorestframework 3.16.1
- djangorestframework-simplejwt 5.4.0
- django-cors-headers 4.9.0
- PyJWT 2.10.1

## 🤝 Contributing

1. Follow PEP 8 style guide
2. Write unit tests for new features
3. Update documentation
4. Keep code modular and clean

## 📄 License

This project is proprietary software.

## 👥 Authors

- Development Team

## 🐛 Known Issues

None currently.

## 🔮 Future Enhancements

- [ ] Email integration
- [ ] File upload support
- [ ] Advanced reporting
- [ ] Audit logging
- [ ] Webhook support
- [ ] API rate limiting
- [ ] Caching with Redis
- [ ] Task queue with Celery

## 📞 Support

For support, contact the development team.
