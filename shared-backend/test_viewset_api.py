#!/usr/bin/env python
"""
Make a direct API call to see what's returned
"""
import os
import sys
import django

# Setup Django
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from django.test import RequestFactory
from crmApp.viewsets.customer import CustomerViewSet
from crmApp.models import User
import json

print("=" * 80)
print("SIMULATING API CALL TO /api/customers/56/")
print("=" * 80)

# Get a vendor user
user = User.objects.get(username='four4')
print(f"\nUser: {user.username} (ID: {user.id})")

# Create a fake request
factory = RequestFactory()
request = factory.get('/api/customers/56/')
request.user = user

# Create viewset instance
viewset = CustomerViewSet()
viewset.request = request
viewset.format_kwarg = None
viewset.kwargs = {'pk': 56}

# Get the customer
try:
    customer = viewset.get_object()
    print(f"\nCustomer: {customer.name} (ID: {customer.id})")
    
    # Get serializer
    serializer = viewset.get_serializer(customer)
    data = serializer.data
    
    print(f"\nvendor_organizations count: {len(data.get('vendor_organizations', []))}")
    print("\nvendor_organizations data:")
    for vo in data.get('vendor_organizations', []):
        print(f"  - {vo['organization_name']} (Status: {vo['relationship_status']})")
    
    print(f"\nFull vendor_organizations JSON:")
    print(json.dumps(data.get('vendor_organizations'), indent=2))
    
except Exception as e:
    print(f"\nERROR: {str(e)}")
    import traceback
    traceback.print_exc()

print("\n" + "=" * 80)
