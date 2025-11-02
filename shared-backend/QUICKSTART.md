# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Set Up Virtual Environment
```bash
cd shared-backend
python -m venv .venv
.\.venv\Scripts\activate  # Windows
# source .venv/bin/activate  # Linux/Mac
```

### Step 2: Install Dependencies
```bash
pip install -r requirement.txt
```

### Step 3: Run Migrations
```bash
python manage.py migrate
```

### Step 4: Seed Sample Data (Optional)
```bash
python manage.py seed_data
```

This creates:
- Superuser: `admin@crm.com` / `admin123`
- Demo organization
- Sample customers and leads
- Sales pipeline

### Step 5: Start Server
```bash
python manage.py runserver
```

Visit: http://127.0.0.1:8000/api/

## 🧪 Test the API

### Option 1: Browser (Easiest)
Open: http://127.0.0.1:8000/api/

### Option 2: Run Test Suite
```bash
python test_api.py
```

### Option 3: Django Shell
```bash
python manage.py shell
```

```python
from crmApp.models import User, Lead
from crmApp.serializers import LeadSerializer

# Get all leads
leads = Lead.objects.all()
for lead in leads:
    print(f"{lead.full_name} - {lead.score}")
```

## 📱 Connect Frontend

The frontend at `http://localhost:5173` is already configured to connect to this backend.

API Base URL: `http://127.0.0.1:8000/api/`

## 🔑 Authentication Flow

1. **Register**: `POST /api/users/`
   ```json
   {
     "email": "user@example.com",
     "password": "pass123",
     "password_confirm": "pass123",
     "first_name": "John",
     "last_name": "Doe"
   }
   ```

2. **Login**: `POST /api/auth/login/`
   ```json
   {
     "email": "user@example.com",
     "password": "pass123"
   }
   ```
   
   Returns:
   ```json
   {
     "user": {...},
     "tokens": {
       "access": "eyJ0...",
       "refresh": "eyJ0..."
     }
   }
   ```

3. **Use Token**: Add to headers
   ```
   Authorization: Bearer eyJ0...
   ```

## 📊 Sample API Calls

### Get Current User
```bash
GET /api/users/me/
Authorization: Bearer YOUR_TOKEN
```

### List Customers
```bash
GET /api/customers/?page=1&page_size=25
```

### Search Leads
```bash
GET /api/leads/?search=company&status=new
```

### Create Deal
```bash
POST /api/deals/
{
  "organization_id": 1,
  "customer_id": 1,
  "pipeline_id": 1,
  "stage_id": 1,
  "title": "New Deal",
  "value": 50000,
  "priority": "high"
}
```

### Get Statistics
```bash
GET /api/customers/stats/
GET /api/leads/stats/
GET /api/deals/stats/
```

## 🛠️ Useful Commands

### Create Superuser
```bash
python manage.py createsuperuser
```

### Check for Errors
```bash
python manage.py check
```

### Run Tests
```bash
python manage.py test tests/
```

### Access Django Admin
```bash
# Start server first
python manage.py runserver
```
Visit: http://127.0.0.1:8000/admin/

### Django Shell
```bash
python manage.py shell
```

## 📁 Project Structure

```
shared-backend/
├── crmApp/
│   ├── models/        # 20+ models in 9 files
│   ├── serializers/   # 37 serializers in 8 files
│   ├── viewsets/      # 14 ViewSets in 8 files
│   ├── utils.py       # Utility functions
│   ├── validators.py  # Custom validators
│   └── permissions.py # Custom permissions
├── tests/             # Unit and API tests
├── test_api.py        # Integration test script
├── manage.py
└── requirement.txt
```

## 🎯 Common Tasks

### Add New Model
1. Create in `crmApp/models/`
2. Import in `crmApp/models/__init__.py`
3. Run: `python manage.py makemigrations`
4. Run: `python manage.py migrate`

### Add New API Endpoint
1. Create serializer in `crmApp/serializers/`
2. Create ViewSet in `crmApp/viewsets/`
3. Add route in `crmApp/urls.py`

### Add Custom Action
```python
@action(detail=True, methods=['post'])
def custom_action(self, request, pk=None):
    obj = self.get_object()
    # Your logic here
    return Response({'message': 'Success'})
```

## 🐛 Troubleshooting

### Import Errors
```bash
# Activate virtual environment
.\.venv\Scripts\activate
```

### Database Locked
```bash
# Stop all Django processes
# Delete db.sqlite3
# Run migrations again
python manage.py migrate
```

### CORS Errors
Check `CORS_ALLOWED_ORIGINS` in `settings.py`

### Authentication Errors
- Check token expiry
- Verify token in Authorization header: `Bearer TOKEN`

## 📚 Learn More

- [Full README](README.md)
- [Refactoring Notes](REFACTORING.md)
- [Django Docs](https://docs.djangoproject.com/)
- [DRF Docs](https://www.django-rest-framework.org/)

## ✅ You're Ready!

The backend is fully set up and ready to use. Check out the API at:
http://127.0.0.1:8000/api/

Happy coding! 🎉
