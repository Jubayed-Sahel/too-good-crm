# Employee Foreign Key Relationship Analysis

## Issue Summary

**Error**: `sqlite3.IntegrityError: FOREIGN KEY constraint failed`

**Root Cause**: Attempting to delete employees (IDs 45, 46) that are referenced by other tables through foreign keys.

## Foreign Key Relationships Found

### Tables Referencing Employee Model

I identified **7 tables** with foreign keys to the `Employee` table:

| Table | Field | on_delete | Related Name | Nullable |
|-------|-------|-----------|--------------|----------|
| `Employee` | `manager` | SET_NULL | `direct_reports` | ✅ Yes |
| `Customer` | `assigned_to` | SET_NULL | `customers` | ✅ Yes |
| `Lead` | `assigned_to` | SET_NULL | `leads` | ✅ Yes |
| `Deal` | `assigned_to` | SET_NULL | `deals` | ✅ Yes |
| `Order` | `assigned_to` | SET_NULL | `assigned_orders` | ✅ Yes |
| `Payment` | `processed_by` | SET_NULL | `processed_payments` | ✅ Yes |
| `Issue` | `assigned_to` | SET_NULL | `assigned_issues` | ✅ Yes |

## The Django vs SQLite Problem

### Why The Error Occurs

**Django Model Definition** (Python):
```python
assigned_to = models.ForeignKey(
    'Employee',
    on_delete=models.SET_NULL,  # ← This is Django ORM behavior
    null=True,
    blank=True
)
```

**Actual Database Schema** (SQLite):
The current SQLite database was likely created **before** these models were properly migrated, and the foreign key constraints don't match the Django model definitions.

### Expected Behavior vs Actual Behavior

| Behavior | Expected (Django) | Actual (SQLite) |
|----------|-------------------|-----------------|
| Delete Employee | FK fields set to NULL | ❌ **Constraint Violation** |
| Reason | `on_delete=SET_NULL` | FK constraint with RESTRICT or CASCADE |

## Investigation Steps Needed

To determine what records are blocking deletion, we need to check:

### 1. Employee 45 References
```sql
-- Check if Employee 45 manages other employees
SELECT COUNT(*) FROM crmApp_employee WHERE manager_id = 45;

-- Check customers assigned to Employee 45
SELECT COUNT(*) FROM crmApp_customer WHERE assigned_to_id = 45;

-- Check leads assigned to Employee 45
SELECT COUNT(*) FROM crmApp_lead WHERE assigned_to_id = 45;

-- Check deals assigned to Employee 45
SELECT COUNT(*) FROM crmApp_deal WHERE assigned_to_id = 45;

-- Check orders assigned to Employee 45
SELECT COUNT(*) FROM crmApp_order WHERE assigned_to_id = 45;

-- Check payments processed by Employee 45
SELECT COUNT(*) FROM crmApp_payment WHERE processed_by_id = 45;

-- Check issues assigned to Employee 45
SELECT COUNT(*) FROM crmApp_issue WHERE assigned_to_id = 45;
```

### 2. Employee 46 References
Same queries with `id = 46`

## Solution Options

### Option A: Use Django ORM (RECOMMENDED)
Django's ORM will properly handle the `on_delete=SET_NULL` behavior:

```python
from crmApp.models import Employee

# Django automatically sets FKs to NULL
employees = Employee.objects.filter(role__isnull=True)
for emp in employees:
    print(f"Deleting Employee {emp.id}...")
    emp.delete()  # Django handles SET_NULL automatically
```

### Option B: Manual SQL with Explicit NULL Setting
If using raw SQL, we must manually set FKs to NULL first:

```sql
-- For Employee 45
UPDATE crmApp_employee SET manager_id = NULL WHERE manager_id = 45;
UPDATE crmApp_customer SET assigned_to_id = NULL WHERE assigned_to_id = 45;
UPDATE crmApp_lead SET assigned_to_id = NULL WHERE assigned_to_id = 45;
UPDATE crmApp_deal SET assigned_to_id = NULL WHERE assigned_to_id = 45;
UPDATE crmApp_order SET assigned_to_id = NULL WHERE assigned_to_id = 45;
UPDATE crmApp_payment SET processed_by_id = NULL WHERE processed_by_id = 45;
UPDATE crmApp_issue SET assigned_to_id = NULL WHERE assigned_to_id = 45;

-- For Employee 46
UPDATE crmApp_employee SET manager_id = NULL WHERE manager_id = 46;
UPDATE crmApp_customer SET assigned_to_id = NULL WHERE assigned_to_id = 46;
UPDATE crmApp_lead SET assigned_to_id = NULL WHERE assigned_to_id = 46;
UPDATE crmApp_deal SET assigned_to_id = NULL WHERE assigned_to_id = 46;
UPDATE crmApp_order SET assigned_to_id = NULL WHERE assigned_to_id = 46;
UPDATE crmApp_payment SET processed_by_id = NULL WHERE processed_by_id = 46;
UPDATE crmApp_issue SET assigned_to_id = NULL WHERE assigned_to_id = 46;

-- Then delete
DELETE FROM crmApp_employee WHERE id IN (45, 46);
```

### Option C: Reassign Records to Another Employee
Instead of setting to NULL, reassign records to an active employee:

```python
from crmApp.models import Employee, Customer, Lead, Deal, Order, Payment, Issue

# Get employees to delete
employees_to_delete = Employee.objects.filter(id__in=[45, 46])

# Get a replacement employee (e.g., a manager or HR employee)
replacement = Employee.objects.filter(
    role__isnull=False
).first()  # or get a specific employee

# Reassign all records
for emp_to_delete in employees_to_delete:
    # Reassign managed employees
    emp_to_delete.direct_reports.all().update(manager=replacement)
    
    # Reassign customers
    emp_to_delete.customers.all().update(assigned_to=replacement)
    
    # Reassign leads
    emp_to_delete.leads.all().update(assigned_to=replacement)
    
    # Reassign deals
    emp_to_delete.deals.all().update(assigned_to=replacement)
    
    # Reassign orders
    emp_to_delete.assigned_orders.all().update(assigned_to=replacement)
    
    # Reassign payments
    emp_to_delete.processed_payments.all().update(processed_by=replacement)
    
    # Reassign issues
    emp_to_delete.assigned_issues.all().update(assigned_to=replacement)
    
    # Now safe to delete
    emp_to_delete.delete()
```

## Database Schema Discrepancy

The error suggests the SQLite database foreign key constraints are **NOT** matching the Django model definitions. This happens when:

1. **Database created before migrations**: The database was created using raw SQL instead of Django migrations
2. **Manual schema changes**: Schema was modified outside Django
3. **Migration issues**: Migrations didn't apply properly

### Check Current FK Constraints
```sql
-- Get the actual CREATE TABLE statement for employees
SELECT sql FROM sqlite_master WHERE type='table' AND name='crmApp_employee';

-- Check all tables that might reference employees
SELECT name, sql FROM sqlite_master 
WHERE type='table' 
AND sql LIKE '%employee%' 
AND name != 'crmApp_employee';
```

## Recommended Action Plan

### Step 1: Query Referencing Records
Run the investigation queries to see which records reference employees 45 and 46.

### Step 2: Choose Deletion Strategy
- **If few records exist**: Set FKs to NULL (Option A or B)
- **If many records exist**: Reassign to another employee (Option C)
- **If no records exist**: Check database schema for mismatched constraints

### Step 3: Execute Safe Deletion
Use Django ORM (Option A) or manual SQL (Option B/C) based on findings.

### Step 4: Verify Success
```python
# Check employees deleted
Employee.objects.filter(id__in=[45, 46]).exists()  # Should return False

# Check all employees have roles
employees_without_roles = Employee.objects.filter(role__isnull=True)
print(f"Employees without roles: {employees_without_roles.count()}")  # Should be 0
```

## Next Steps

I recommend:

1. **Create investigation script** to count referencing records
2. **Review findings** to determine best deletion strategy  
3. **Use Django ORM deletion** (safest, respects on_delete settings)
4. **Verify RBAC** still works after deletion

Would you like me to:
- A) Create an investigation script to count references?
- B) Proceed with Django ORM deletion (automatic NULL setting)?
- C) Create a reassignment script to move records to another employee?
