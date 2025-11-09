# Too Good CRM - Backend API

Django REST Framework backend for the Too Good CRM system.

## Quick Start

```bash
# Install dependencies
pip install -r requirement.txt

# Run migrations
python manage.py migrate

# Seed database
python scripts/seed/comprehensive_seed_data.py

# Start server
python manage.py runserver
```

API runs at: `http://localhost:8000`

## Project Structure

- `crmAdmin/` - Django project settings
- `crmApp/` - Main application
  - `models/` - Database models
  - `serializers/` - DRF serializers
  - `viewsets/` - API viewsets
  - `views/` - Custom views
  - `services/` - Business logic
  - `middleware/` - Custom middleware
  - `decorators/` - Custom decorators
  - `utils/` - Utility functions
- `scripts/` - Utility scripts (**organized!**)
  - `seed/` - Database seeding
  - `fix/` - Database fixes
  - `test/` - API testing
  - `verify/` - Data verification
  - `utilities/` - General utilities
- `docs/` - Documentation
- `tests/` - Unit tests

See [scripts/README.md](scripts/README.md) for detailed script documentation.  
See [docs/README.md](docs/README.md) for API and integration docs.

## Key Features

- JWT Authentication
- Role-Based Access Control (RBAC)
- Organization-level data isolation
- RESTful API with Django REST Framework
- Linear integration for issue tracking
- Twilio integration for communications
- Comprehensive permission system

## API Endpoints

- `/api/auth/` - Authentication
- `/api/customers/` - Customer management
- `/api/leads/` - Lead management
- `/api/deals/` - Deal management  
- `/api/employees/` - Employee management
- `/api/issues/` - Issue tracking
- `/api/analytics/` - Analytics
- `/api/roles/` - RBAC management

See [docs/API_TESTING_GUIDE.md](docs/API_TESTING_GUIDE.md) for complete API documentation.

## Scripts Usage

```bash
# Seed database
python scripts/seed/comprehensive_seed_data.py

# Test API
python scripts/test/test_full_lifecycle.py

# Verify setup
python scripts/verify/verify_api.py

# Show database info
python scripts/utilities/show_data.py
```

See [scripts/README.md](scripts/README.md) for all available scripts.

## Documentation

- [API Testing Guide](docs/API_TESTING_GUIDE.md)
- [Linear Integration](docs/LINEAR_INTEGRATION_GUIDE.md)  
- [Scripts Documentation](scripts/README.md)
- [Issue Endpoints](docs/ISSUE_ACTION_ENDPOINTS.md)

## Testing

```bash
# Run Django tests
python manage.py test

# Run custom tests
python scripts/test/test_login.py
python scripts/test/test_full_lifecycle.py
```

## Contributing

1. Create feature branch
2. Make changes
3. Write tests
4. Update documentation
5. Submit pull request

