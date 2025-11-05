"""
Associate existing users with organizations
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from crmApp.models import User, Organization, UserOrganization, Employee

# Get the first organization
org = Organization.objects.first()

if not org:
    print("No organization found! Run seed_data.py first.")
    exit(1)

print(f"Associating users with organization: {org.name}\n")

# List of users to associate (excluding demo users who already have orgs)
user_emails = ['me@me.com', 'test@example.com', 'newuser@test.com', 'newuser@hey.com', 'theuser@gmail.com']

for email in user_emails:
    user = User.objects.filter(email=email).first()
    
    if not user:
        print(f"❌ User {email} not found")
        continue
    
    # Check if already associated
    if user.user_organizations.filter(organization=org).exists():
        print(f"✓ {email} already associated with {org.name}")
        continue
    
    # Create UserOrganization
    uo, created = UserOrganization.objects.get_or_create(
        user=user,
        organization=org,
        defaults={
            'is_active': True,
            'is_owner': email == 'me@me.com',  # Make me@me.com an owner
        }
    )
    
    # Create Employee profile
    emp, emp_created = Employee.objects.get_or_create(
        user=user,
        organization=org,
        defaults={
            'first_name': user.first_name or 'User',
            'last_name': user.last_name or 'Account',
            'email': user.email,
            'status': 'active',
            'department': 'General',
            'job_title': 'User',
        }
    )
    
    print(f"✅ Associated {email} with {org.name}")
    print(f"   Employee: {emp.full_name} ({emp.job_title})")

print("\n" + "="*50)
print("Done! Users can now see customers and deals.")
print("="*50)
