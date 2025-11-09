"""
Set current organization for admin user
"""

import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from crmApp.models import User, Organization

# Get admin user
admin = User.objects.get(email='admin@crm.com')

# Get first organization
org = Organization.objects.first()

if org:
    admin.current_organization = org
    admin.save()
    print(f"✅ Set current_organization for {admin.email}")
    print(f"   Organization: {org.name} (ID: {org.id})")
else:
    print("❌ No organization found!")
    print("Please run: python manage.py seed_data")
