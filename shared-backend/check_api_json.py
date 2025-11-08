#!/usr/bin/env python
import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from crmApp.models import User
from crmApp.serializers import UserSerializer

# Get admin user
admin_user = User.objects.get(email='admin@crm.com')

# Serialize as the API would
serializer = UserSerializer(admin_user)
data = serializer.data

# Print the exact JSON that would be returned by the API
print("=== EXACT API JSON RESPONSE ===")
print(json.dumps(data['profiles'], indent=2))
