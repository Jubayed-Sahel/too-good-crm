# Quick Employee Setup Script
# Run in Django shell: python manage.py shell < create_employee.py

from django.contrib.auth import get_user_model
from crmApp.models import Organization, UserProfile, UserOrganization, Employee
from django.utils import timezone
from django.db import transaction

User = get_user_model()

# Get first organization
org = Organization.objects.first()
print(f"Organization: {org.name} (ID: {org.id})")

# Create employee user
email = "employee@test.com"
username = "employee_test"
password = "employee123"

user, created = User.objects.get_or_create(
    email=email,
    defaults={
        'username': username,
        'first_name': 'Test',
        'last_name': 'Employee',
        'is_active': True,
        'is_verified': True
    }
)

if created:
    user.set_password(password)
    user.save()
    print(f"Created user: {email}")
else:
    print(f"User exists: {email}")

# Create employee profile
profile, created = UserProfile.objects.get_or_create(
    user=user,
    organization=org,
    profile_type='employee',
    defaults={
        'is_primary': True,
        'status': 'active',
        'activated_at': timezone.now()
    }
)

if created:
    print(f"Created employee profile")
else:
    print(f"Employee profile exists")

# Link to organization
user_org, created = UserOrganization.objects.get_or_create(
    user=user,
    organization=org,
    defaults={
        'is_active': True,
        'invitation_accepted_at': timezone.now()
    }
)

# Create Employee record
emp, created = Employee.objects.get_or_create(
    user=user,
    organization=org,
    defaults={
        'email': user.email,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'status': 'active'
    }
)

print("\n" + "="*60)
print("EMPLOYEE CREATED SUCCESSFULLY!")
print("="*60)
print(f"Email: {email}")
print(f"Password: {password}")
print(f"Organization: {org.name}")
print("\nLogin at: http://localhost:5173/login")
print("="*60)
