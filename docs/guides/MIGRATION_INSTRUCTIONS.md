# Migration Instructions - Database Redundancy Fixes

## Overview
This guide provides step-by-step instructions for migrating the database and codebase from the old redundant structure to the new normalized structure.

---

## Prerequisites

- [x] All model changes implemented
- [x] All serializer changes implemented
- [ ] Development database backup created
- [ ] All tests passing on old structure
- [ ] Team notified of migration window

---

## Phase 1: Pre-Migration Preparation

### Step 1.1: Backup Current Database
```bash
# PostgreSQL backup
pg_dump -U postgres -d crm_database > backup_before_migration_$(date +%Y%m%d_%H%M%S).sql

# SQLite backup (if using SQLite for development)
cp db.sqlite3 db.sqlite3.backup_$(date +%Y%m%d_%H%M%S)
```

### Step 1.2: Run Current Tests
```bash
cd shared-backend
python manage.py test crmApp
```

**Expected Result:** All tests should pass before proceeding.

### Step 1.3: Create Migration Files
```bash
cd shared-backend
python manage.py makemigrations crmApp
```

**Expected Migrations:**
- Create `addresses` table
- Create `addressables` table  
- Add `default_currency` to organizations
- Modify employee model (remove fields, user_id NOT NULL)
- Make currency fields nullable in Deal, Order, Payment

### Step 1.4: Review Migration Files
```bash
# List migration files
ls -la crmApp/migrations/

# Review latest migration
cat crmApp/migrations/XXXX_auto_YYYYMMDD_HHMM.py
```

**Verify:**
- Check for correct field additions/removals
- Ensure no unexpected changes
- Review dependencies

---

## Phase 2: Data Migration Strategy

### Step 2.1: Create Custom Data Migration

Create a new migration file for data transformation:

```bash
python manage.py makemigrations --empty crmApp --name migrate_redundant_data
```

Edit the generated migration file:

```python
# Generated migration file: crmApp/migrations/XXXX_migrate_redundant_data.py

from django.db import migrations
from django.contrib.contenttypes.models import ContentType

def migrate_employee_data(apps, schema_editor):
    """Migrate employee contact info to user accounts"""
    Employee = apps.get_model('crmApp', 'Employee')
    User = apps.get_model('crmApp', 'User')
    
    for employee in Employee.objects.all():
        if employee.user_id:
            # Update user with employee's contact info
            user = employee.user
            if employee.first_name:
                user.first_name = employee.first_name
            if employee.last_name:
                user.last_name = employee.last_name
            if employee.email:
                user.email = employee.email
            if employee.phone:
                user.phone = employee.phone
            user.save()
        else:
            # Create user account for employee without one
            user = User.objects.create(
                username=employee.email or f'employee_{employee.id}',
                email=employee.email or f'employee_{employee.id}@temp.com',
                first_name=employee.first_name or '',
                last_name=employee.last_name or '',
                phone=employee.phone or ''
            )
            employee.user = user
            employee.save()

def migrate_addresses(apps, schema_editor):
    """Migrate address data from old fields to Address table"""
    Address = apps.get_model('crmApp', 'Address')
    Addressable = apps.get_model('crmApp', 'Addressable')
    
    # Models with address fields
    models_to_migrate = [
        ('Organization', apps.get_model('crmApp', 'Organization')),
        ('Customer', apps.get_model('crmApp', 'Customer')),
        ('Vendor', apps.get_model('crmApp', 'Vendor')),
        ('Lead', apps.get_model('crmApp', 'Lead')),
        ('Employee', apps.get_model('crmApp', 'Employee')),
    ]
    
    for model_name, Model in models_to_migrate:
        content_type = ContentType.objects.get_for_model(Model)
        
        for instance in Model.objects.all():
            # Check if address data exists
            if any([
                getattr(instance, 'address', None),
                getattr(instance, 'city', None),
                getattr(instance, 'state', None),
                getattr(instance, 'country', None),
                getattr(instance, 'postal_code', None)
            ]):
                # Create Address record
                address = Address.objects.create(
                    address_line1=getattr(instance, 'address', '') or '',
                    city=getattr(instance, 'city', '') or '',
                    state=getattr(instance, 'state', '') or '',
                    country=getattr(instance, 'country', '') or '',
                    postal_code=getattr(instance, 'postal_code', '') or getattr(instance, 'zip_code', '') or '',
                    address_type='primary',
                    is_primary=True
                )
                
                # Link via Addressable
                Addressable.objects.create(
                    address=address,
                    content_type=content_type,
                    object_id=instance.id
                )

def migrate_currency_defaults(apps, schema_editor):
    """Set organization default currency from most common currency"""
    Organization = apps.get_model('crmApp', 'Organization')
    Deal = apps.get_model('crmApp', 'Deal')
    
    for org in Organization.objects.all():
        # Find most common currency in deals
        from django.db.models import Count
        common_currency = Deal.objects.filter(
            organization=org
        ).values('currency').annotate(
            count=Count('currency')
        ).order_by('-count').first()
        
        if common_currency:
            org.default_currency = common_currency['currency']
        else:
            org.default_currency = 'USD'
        org.save()

def reverse_migration(apps, schema_editor):
    """Reverse is not supported - restore from backup"""
    raise RuntimeError(
        "Reversing this migration is not supported. "
        "Please restore from database backup if needed."
    )

class Migration(migrations.Migration):
    dependencies = [
        ('crmApp', 'XXXX_previous_migration'),  # Replace with actual previous migration
    ]

    operations = [
        migrations.RunPython(migrate_employee_data, reverse_migration),
        migrations.RunPython(migrate_addresses, reverse_migration),
        migrations.RunPython(migrate_currency_defaults, reverse_migration),
    ]
```

---

## Phase 3: Migration Execution

### Step 3.1: Test Migration on Development Database

```bash
# Apply migrations
python manage.py migrate crmApp

# Check migration status
python manage.py showmigrations crmApp
```

**Verify:**
- All migrations applied successfully
- No errors in console output

### Step 3.2: Verify Data Integrity

```bash
# Django shell
python manage.py shell
```

```python
from crmApp.models import *

# Check employees have users
employees_without_users = Employee.objects.filter(user__isnull=True).count()
print(f"Employees without users: {employees_without_users}")  # Should be 0

# Check addresses migrated
total_addressables = Addressable.objects.count()
total_addresses = Address.objects.count()
print(f"Addressable records: {total_addressables}")
print(f"Address records: {total_addresses}")

# Check organization currencies
orgs_without_currency = Organization.objects.filter(default_currency__isnull=True).count()
print(f"Organizations without default_currency: {orgs_without_currency}")  # Should be 0

# Test employee properties
emp = Employee.objects.first()
print(f"Employee name: {emp.first_name} {emp.last_name}")  # From user
print(f"Employee email: {emp.email}")  # From user
print(f"Employee address: {emp.address}")  # From Address table
print(f"Employee city: {emp.city}")  # From Address table

# Test currency resolution
deal = Deal.objects.first()
print(f"Deal currency (database): {deal.currency}")
print(f"Deal currency (resolved): {deal.resolved_currency}")
```

### Step 3.3: Run Tests

```bash
# Run all tests
python manage.py test crmApp

# Run specific test modules
python manage.py test crmApp.tests.test_models
python manage.py test crmApp.tests.test_serializers
python manage.py test crmApp.tests.test_views
```

**Expected Result:** All tests should pass.

### Step 3.4: Test API Endpoints

Create a test script:

```bash
# test_api_compatibility.py
import requests

BASE_URL = "http://localhost:8000/api"
AUTH_TOKEN = "your-auth-token-here"
HEADERS = {"Authorization": f"Bearer {AUTH_TOKEN}"}

# Test Employee GET
response = requests.get(f"{BASE_URL}/employees/", headers=HEADERS)
print(f"GET /employees/ - Status: {response.status_code}")
if response.status_code == 200:
    employee = response.json()['results'][0]
    print(f"  Employee has first_name: {'first_name' in employee}")
    print(f"  Employee has email: {'email' in employee}")
    print(f"  Employee has address: {'address' in employee}")

# Test Organization GET
response = requests.get(f"{BASE_URL}/organizations/", headers=HEADERS)
print(f"GET /organizations/ - Status: {response.status_code}")
if response.status_code == 200:
    org = response.json()['results'][0]
    print(f"  Organization has default_currency: {'default_currency' in org}")
    print(f"  Organization has address: {'address' in org}")

# Test Deal GET
response = requests.get(f"{BASE_URL}/deals/", headers=HEADERS)
print(f"GET /deals/ - Status: {response.status_code}")
if response.status_code == 200:
    deal = response.json()['results'][0]
    print(f"  Deal has currency: {'currency' in deal}")
    print(f"  Deal currency value: {deal.get('currency')}")

# Run tests
print("\nRunning API compatibility tests...")
```

```bash
python test_api_compatibility.py
```

---

## Phase 4: Frontend Updates

### Step 4.1: Update Employee Creation Flow

**Old Code (Frontend):**
```typescript
// OLD - Direct employee creation
const createEmployee = async (data: EmployeeFormData) => {
  const response = await api.post('/employees/', {
    first_name: data.firstName,
    last_name: data.lastName,
    email: data.email,
    phone: data.phone,
    address: data.address,
    city: data.city
  });
  return response.data;
};
```

**New Code (Frontend):**
```typescript
// NEW - Two-step process
const createEmployee = async (data: EmployeeFormData) => {
  // Step 1: Create user account
  const userResponse = await api.post('/users/', {
    username: data.email,
    email: data.email,
    first_name: data.firstName,
    last_name: data.lastName,
    phone: data.phone,
    password: generateTemporaryPassword()  // Or handle separately
  });
  
  const userId = userResponse.data.id;
  
  // Step 2: Create employee with user_id
  const employeeResponse = await api.post('/employees/', {
    user_id: userId,
    department: data.department,
    job_title: data.jobTitle,
    address: data.address,  // Still works - backend converts
    city: data.city,
    state: data.state,
    postal_code: data.postalCode,
    emergency_contact_phone: data.emergencyPhone
  });
  
  return employeeResponse.data;
};
```

### Step 4.2: Update Employee Display

**No changes needed** - API responses include all fields via properties.

### Step 4.3: Update Organization Forms

**Add default currency field:**
```typescript
interface OrganizationFormData {
  name: string;
  email: string;
  phone: string;
  default_currency: string;  // NEW FIELD
  address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}
```

---

## Phase 5: Deployment to Production

### Step 5.1: Schedule Maintenance Window

- [ ] Notify all users
- [ ] Schedule downtime (estimate 30-60 minutes)
- [ ] Prepare rollback plan

### Step 5.2: Production Database Backup

```bash
# Full backup
pg_dump -U postgres -h production-db-host -d crm_production > prod_backup_$(date +%Y%m%d_%H%M%S).sql

# Verify backup
pg_restore --list prod_backup_*.sql | head
```

### Step 5.3: Deploy Code

```bash
# Deploy backend
cd shared-backend
git pull origin main
pip install -r requirements.txt

# Deploy frontend
cd ../app-frontend
git pull origin main
npm install
npm run build
```

### Step 5.4: Run Migrations

```bash
cd shared-backend

# Dry run
python manage.py migrate --plan

# Apply migrations
python manage.py migrate

# Verify
python manage.py showmigrations
```

### Step 5.5: Verify Production

```bash
# Check logs
tail -f /var/log/django/error.log

# Run smoke tests
python manage.py test crmApp.tests.test_smoke

# Check API health
curl -H "Authorization: Bearer $TOKEN" https://api.yourapp.com/health
```

### Step 5.6: Monitor

- [ ] Check error rates in monitoring dashboard
- [ ] Monitor API response times
- [ ] Watch for user-reported issues
- [ ] Verify frontend functionality

---

## Phase 6: Post-Migration Cleanup

### Step 6.1: Remove Old Migration Files (After 30 Days)

```bash
# Archive old backups
mkdir -p backups/archive
mv backup_before_migration_*.sql backups/archive/

# Keep only last 3 backups
ls -t backups/*.sql | tail -n +4 | xargs rm
```

### Step 6.2: Update Documentation

- [ ] Update API documentation
- [ ] Update developer onboarding guide
- [ ] Update deployment runbook
- [ ] Archive old documentation

### Step 6.3: Performance Optimization

```sql
-- Add indexes for common queries
CREATE INDEX idx_addressables_content_type ON addressables(addressable_type, addressable_id);
CREATE INDEX idx_addresses_is_primary ON addresses(is_primary) WHERE is_primary = true;
CREATE INDEX idx_employees_user ON employees(user_id);
```

---

## Rollback Procedure

If critical issues arise:

### Step 1: Stop Application

```bash
# Stop web server
sudo systemctl stop gunicorn

# Stop worker processes
sudo systemctl stop celery
```

### Step 2: Restore Database

```bash
# Drop current database
dropdb crm_production

# Restore from backup
createdb crm_production
pg_restore -d crm_production prod_backup_YYYYMMDD_HHMMSS.sql
```

### Step 3: Revert Code

```bash
# Checkout previous version
cd shared-backend
git checkout <previous-commit-hash>

# Reinstall dependencies
pip install -r requirements.txt

# Restart services
sudo systemctl start gunicorn
sudo systemctl start celery
```

### Step 4: Verify Rollback

```bash
# Check application status
curl https://api.yourapp.com/health

# Verify data
python manage.py shell
# Run verification queries
```

---

## Troubleshooting

### Issue: Employees Without Users

**Symptom:** `Employee.user_id cannot be NULL` error

**Solution:**
```python
# Create user accounts for orphaned employees
from crmApp.models import Employee, User

orphaned = Employee.objects.filter(user__isnull=True)
for emp in orphaned:
    user = User.objects.create(
        username=f'employee_{emp.id}',
        email=emp.email or f'employee_{emp.id}@temp.com',
        first_name=emp.first_name or '',
        last_name=emp.last_name or ''
    )
    emp.user = user
    emp.save()
```

### Issue: Missing Addresses

**Symptom:** `employee.address` returns None

**Solution:**
```python
# Verify address migration
from crmApp.models import Employee, Address, Addressable

emp = Employee.objects.get(id=1)
addresses = emp.get_addresses()
print(f"Addresses for employee {emp.id}: {addresses.count()}")

# Manually create address if missing
if addresses.count() == 0:
    emp.set_address({
        'address_line1': '123 Main St',
        'city': 'New York',
        'state': 'NY',
        'postal_code': '10001',
        'country': 'USA'
    })
```

### Issue: Currency Not Resolving

**Symptom:** Deal currency shows None

**Solution:**
```python
# Check organization default currency
from crmApp.models import Deal

deal = Deal.objects.get(id=1)
print(f"Deal.currency: {deal.currency}")
print(f"Organization.default_currency: {deal.organization.default_currency}")
print(f"Resolved: {deal.resolved_currency}")

# Set organization default if missing
if not deal.organization.default_currency:
    deal.organization.default_currency = 'USD'
    deal.organization.save()
```

---

## Verification Checklist

After migration, verify:

### Data Integrity
- [ ] All employees have user accounts
- [ ] All address data migrated
- [ ] All organizations have default_currency
- [ ] No NULL values in required fields
- [ ] Foreign key relationships intact

### API Compatibility
- [ ] GET /employees/ returns contact info
- [ ] GET /employees/ returns address info
- [ ] GET /organizations/ returns default_currency
- [ ] GET /deals/ returns resolved currency
- [ ] POST /employees/ with user_id works
- [ ] POST /organizations/ with address works

### Frontend Functionality
- [ ] Employee list displays correctly
- [ ] Employee creation flow works
- [ ] Organization settings save correctly
- [ ] Deal/Order forms work
- [ ] Address fields display/edit correctly

### Performance
- [ ] API response times acceptable
- [ ] Database queries optimized
- [ ] No N+1 query issues
- [ ] Memory usage normal

---

## Timeline Estimate

- **Phase 1 (Preparation):** 2-4 hours
- **Phase 2 (Data Migration Script):** 4-6 hours
- **Phase 3 (Testing):** 4-8 hours
- **Phase 4 (Frontend Updates):** 4-6 hours
- **Phase 5 (Production Deployment):** 1-2 hours
- **Phase 6 (Post-Migration):** 2-4 hours

**Total:** 17-30 hours (3-5 working days)

---

## Success Criteria

Migration is complete when:

1. ✅ All Django migrations applied successfully
2. ✅ All data migrated without loss
3. ✅ All tests passing
4. ✅ API responses match expected format
5. ✅ Frontend functionality verified
6. ✅ No critical bugs reported
7. ✅ Performance metrics acceptable
8. ✅ Documentation updated

---

## Support Contacts

- **Database:** DBA Team - dba@company.com
- **Backend:** Backend Team Lead - backend@company.com
- **Frontend:** Frontend Team Lead - frontend@company.com
- **DevOps:** DevOps Team - devops@company.com

---

## Document Version
- **Version:** 1.0
- **Last Updated:** January 2025
- **Author:** AI Assistant
