import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sharedBackend.settings')
django.setup()

from crmApp.models import User, Employee, UserProfile, Organization

print("=== All Organizations ===")
orgs = Organization.objects.all()
for o in orgs:
    print(f"ID: {o.id}, Name: {o.name}, Owner: {o.owner.email}")

print("\n=== me@me.com User ===")
me_user = User.objects.filter(email='me@me.com').first()
if me_user:
    print(f"User exists: True")
    me_orgs = Organization.objects.filter(owner=me_user)
    print(f"Owner of orgs: {[o.name for o in me_orgs]}")
    if me_orgs:
        print(f"Organization ID: {me_orgs[0].id}")
else:
    print("User does not exist")

print("\n=== admin@crm.com Profiles ===")
admin = User.objects.filter(email='admin@crm.com').first()
if admin:
    profiles = UserProfile.objects.filter(user=admin)
    for p in profiles:
        org_name = p.organization.name if p.organization else None
        print(f"{p.profile_type} - Org: {org_name} (ID: {p.organization_id})")
    
    print("\n=== admin@crm.com Employee Records ===")
    emps = Employee.objects.filter(user=admin)
    if emps:
        for e in emps:
            role_name = e.role.name if e.role else None
            print(f"Org: {e.organization.name} (ID: {e.organization_id}), Role: {role_name}")
    else:
        print("No employee records found")
