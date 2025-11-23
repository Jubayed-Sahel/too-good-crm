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
org_22 = Organization.objects.get(id=22)  # proyash2's org

print("\n" + "="*60)
print("FIXING EMPLOYEE SETUP")
print("="*60)

# Step 1: Update existing employee profile to point to org 21
print("\n[Step 1] Updating proyash2's employee profile to org 21...")
employee_profile = UserProfile.objects.filter(
    user=proyash2,
    profile_type='employee'
).first()

if employee_profile:
    old_org = employee_profile.organization.name if employee_profile.organization else "None"
    employee_profile.organization = org_21
    employee_profile.status = 'active'
    employee_profile.is_primary = False  # Vendor should be primary
    employee_profile.save()
    print(f"  ✅ Updated employee profile: {old_org} → {org_21.name}")
else:
    print("  ❌ No employee profile found!")
    exit(1)

# Step 2: Remove employee record from org 22 (their own org)
print("\n[Step 2] Removing employee record from org 22 (proyash2's own org)...")
Employee.objects.filter(user=proyash2, organization=org_22).update(status='inactive')
print("  ✅ Deactivated employee record for org 22")

# Step 3: Create a test role with limited permissions in org 21
print("\n[Step 3] Creating 'Customer Handler' role in org 21...")
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

# Step 4: Assign permissions to the role
print("\n[Step 4] Assigning permissions to role...")
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

# Step 5: Create Employee record in org 21
print("\n[Step 5] Creating Employee record for proyash2 in org 21...")
employee, created = Employee.objects.get_or_create(
    user=proyash2,
    organization=org_21,
    defaults={
        'first_name': proyash2.full_name.split()[0] if proyash2.full_name else 'proyash',
        'last_name': proyash2.full_name.split()[1] if len(proyash2.full_name.split()) > 1 else '2',
        'role': role,
        'status': 'active',
        'job_title': 'Customer Support',
        'department': 'Sales',
        'email': proyash2.email,
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
print("\n1. ⚠️  LOGOUT completely from proyash2 account")
print("2. Login again as proyash2@gmail.com")
print("3. Clear browser cache / hard refresh (Ctrl+Shift+R)")
print("4. The Employee profile should now be for org 21 (proyash1's org)")
print("\n5. Check sidebar - should only see:")
print("   ✅ Dashboard")
print("   ✅ Customers")
print("   ✅ Activities")
print("   ✅ Messages")
print("   ✅ Settings")
print("   ❌ Sales (hidden)")
print("   ❌ Issues (hidden)")
print("   ❌ Team (hidden)")
print("\n6. Try to access /sales - should redirect to /dashboard")
print("7. Navigate to /customers - should work!")
print("8. Try to delete a customer - should see error (no delete permission)")
print("\n" + "="*60)

