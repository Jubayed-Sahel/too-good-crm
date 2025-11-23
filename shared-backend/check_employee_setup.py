import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from crmApp.models import User, Employee, Organization, UserOrganization

p1 = User.objects.get(email='proyash1@gmail.com')
p2 = User.objects.get(email='proyash2@gmail.com')
o21 = Organization.objects.get(id=21)
o22 = Organization.objects.get(id=22)

print("\n" + "="*60)
print("OWNERSHIP CHECK")
print("="*60)
print(f"Organization 21: '{o21.name}'")
print(f"  Owner: proyash1@gmail.com ✅")
print(f"\nOrganization 22: '{o22.name}'")
print(f"  Owner: proyash2@gmail.com ✅")

print("\n" + "="*60)
print("EMPLOYEE RELATIONSHIPS")
print("="*60)

emp_in_21 = Employee.objects.filter(user=p2, organization=o21, status='active').first()
emp_in_22 = Employee.objects.filter(user=p2, organization=o22, status='active').first()

print(f"\n❓ Is proyash2 employee of org 21 (proyash1's org)?")
if emp_in_21:
    role_name = emp_in_21.role.name if emp_in_21.role else "NO ROLE"
    print(f"  ✅ YES - Role: {role_name}")
else:
    print(f"  ❌ NO")

print(f"\n❓ Is proyash2 employee of org 22 (their OWN org)?")
if emp_in_22:
    role_name = emp_in_22.role.name if emp_in_22.role else "NO ROLE"
    print(f"  ⚠️  YES - Role: {role_name}")
    print(f"  🚨 PROBLEM: proyash2 can't test RBAC on their own organization!")
    print(f"  🚨 Owners always get ALL permissions regardless of employee role!")
else:
    print(f"  ✅ NO (good)")

print("\n" + "="*60)
print("THE ISSUE")
print("="*60)
if emp_in_22 and not emp_in_21:
    print("❌ proyash2 is ONLY an employee of their OWN organization (22)")
    print("❌ Since they OWN org 22, they get ALL permissions")
    print("❌ This is why RBAC appears to not work")
    print("\n💡 Solution: Make proyash2 an employee of org 21 instead!")
elif emp_in_22 and emp_in_21:
    print("⚠️  proyash2 is employee of BOTH organizations")
    print("⚠️  When they access org 22, they get ALL permissions (owner)")
    print("⚠️  When they access org 21, RBAC should work")
elif emp_in_21 and not emp_in_22:
    print("✅ Setup is CORRECT!")
    print("✅ proyash2 is employee of proyash1's org (21)")
    print("✅ RBAC should work properly")

print("\n" + "="*60)

