import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from crmApp.models import (
    User, Employee, Organization, UserProfile, 
    Role, Permission, RolePermission
)

# Get users and organizations
proyash1 = User.objects.get(email='proyash1@gmail.com')
proyash2 = User.objects.get(email='proyash2@gmail.com')
org_21 = Organization.objects.get(id=21)  # proyash1's org

print("\n" + "="*60)
print("FIXING EMPLOYEE SETUP")
print("="*60)

# Step 1: Create employee profile for proyash2 in org 21
print("\n[Step 1] Creating employee profile for proyash2 in org 21...")
employee_profile, created = UserProfile.objects.get_or_create(
    user=proyash2,
    organization=org_21,
    profile_type='employee',
    defaults={
        'status': 'active',
        'is_primary': False,  # Keep their vendor profile as primary for now
    }
)

if created:
    print("  ✅ Employee profile created")
else:
    print("  ℹ️  Employee profile already exists")
    employee_profile.status = 'active'
    employee_profile.save()

# Step 2: Create a test role with limited permissions
print("\n[Step 2] Creating 'Customer Handler' role with limited permissions...")
role, created = Role.objects.get_or_create(
    organization=org_21,
    name='Customer Handler',
    defaults={
        'slug': 'customer-handler',
        'description': 'Can manage customers and activities only',
        'is_system_role': False,
        'is_active': True
    }
)

if created:
    print("  ✅ Role 'Customer Handler' created")
else:
    print("  ℹ️  Role 'Customer Handler' already exists")

# Step 3: Assign permissions to the role
print("\n[Step 3] Assigning permissions to role...")
permission_configs = [
    ('customer', 'read'),
    ('customer', 'create'),
    ('customer', 'update'),
    ('activity', 'read'),
    ('activity', 'create'),
]

for resource, action in permission_configs:
    perm = Permission.objects.filter(
        organization=org_21,
        resource=resource,
        action=action
    ).first()
    
    if perm:
        role_perm, created = RolePermission.objects.get_or_create(
            role=role,
            permission=perm
        )
        if created:
            print(f"  ✅ Added {resource}:{action}")
        else:
            print(f"  ℹ️  {resource}:{action} already assigned")
    else:
        print(f"  ⚠️  Permission {resource}:{action} not found - creating it...")
        perm = Permission.objects.create(
            organization=org_21,
            resource=resource,
            action=action,
            description=f"{action.title()} {resource}"
        )
        RolePermission.objects.create(role=role, permission=perm)
        print(f"  ✅ Created and added {resource}:{action}")

# Step 4: Create Employee record
print("\n[Step 4] Creating Employee record for proyash2 in org 21...")
employee, created = Employee.objects.get_or_create(
    user=proyash2,
    organization=org_21,
    defaults={
        'role': role,
        'status': 'active',
        'position': 'Customer Support',
        'department': 'Sales',
    }
)

if created:
    print(f"  ✅ Employee record created with role '{role.name}'")
else:
    print(f"  ℹ️  Employee record already exists")
    employee.role = role
    employee.status = 'active'
    employee.save()
    print(f"  ✅ Updated employee role to '{role.name}'")

print("\n" + "="*60)
print("SETUP COMPLETE!")
print("="*60)
print(f"\n✅ proyash2@gmail.com is now an employee of proyash1's organization (21)")
print(f"✅ Role: 'Customer Handler'")
print(f"✅ Permissions:")
print(f"   - customer:read, customer:create, customer:update")
print(f"   - activity:read, activity:create")
print(f"\n❌ Should NOT have access to:")
print(f"   - Sales/Orders")
print(f"   - Issues")
print(f"   - Team/Employees")
print(f"   - customer:delete")

print("\n" + "="*60)
print("TESTING INSTRUCTIONS")
print("="*60)
print("\n1. Logout from proyash2 account")
print("2. Login again as proyash2@gmail.com")
print("3. Click profile switcher (top right)")
print("4. You should see:")
print("   - Vendor profile for 'pro1' (org 22) - your own org")
print("   - Employee profile for 'pro1' (org 21) - proyash1's org")
print("\n5. Switch to Employee profile for org 21")
print("6. Check sidebar - should only see:")
print("   ✅ Dashboard")
print("   ✅ Customers")
print("   ✅ Activities")
print("   ✅ Messages")
print("   ✅ Settings")
print("   ❌ Sales (hidden)")
print("   ❌ Issues (hidden)")
print("   ❌ Team (hidden)")
print("\n7. Try to access /sales - should redirect to /dashboard")
print("8. Check permissions in Settings → Profile → Roles")
print("\n" + "="*60)

