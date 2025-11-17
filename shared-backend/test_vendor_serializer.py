"""
Test vendor profile serializer
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from crmApp.models import User
from crmApp.serializers import UserSerializer

user = User.objects.get(email='dummy@gmail.com')
serializer = UserSerializer(user)
data = serializer.data

vendor_profile = [p for p in data.get('profiles', []) if p.get('profile_type') == 'vendor'][0]
print('Vendor Profile Serialized:')
print(f'  Organization Name: {vendor_profile.get("organization_name")}')
print(f'  Organization ID: {vendor_profile.get("organization")}')
print(f'  Is Owner: {vendor_profile.get("is_owner")}')

