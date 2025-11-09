"""
Check admin user organization
"""

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from crmApp.models import User
from rest_framework.authtoken.models import Token

admin = User.objects.select_related('current_organization').get(email='admin@crm.com')

print(f"User: {admin.email}")
print(f"Has current_organization attr: {hasattr(admin, 'current_organization')}")
print(f"Current organization: {admin.current_organization}")
print(f"Current organization ID: {admin.current_organization.id if admin.current_organization else None}")

# Check token
token = Token.objects.get(user=admin)
print(f"\nToken: {token.key}")
print(f"Token user: {token.user.email}")
print(f"Token user org: {token.user.current_organization}")
