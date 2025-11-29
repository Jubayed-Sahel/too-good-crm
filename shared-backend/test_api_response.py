#!/usr/bin/env python
"""
Test API endpoint response for customer
"""
import os
import sys
import django

# Setup Django
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from crmApp.models import Customer
from crmApp.serializers import CustomerSerializer
import json

print("=" * 80)
print("TESTING API RESPONSE FOR CUSTOMER ID 56")
print("=" * 80)

customer = Customer.objects.prefetch_related(
    'customer_organizations',
    'customer_organizations__organization',
    'customer_organizations__assigned_employee'
).get(id=56)

print(f"\nCustomer: {customer.name} (ID: {customer.id})")
print(f"Email: {customer.email}")

# Serialize the customer
serializer = CustomerSerializer(customer)
data = serializer.data

print(f"\nSerialized data keys: {list(data.keys())}")
print(f"\nvendor_organizations field:")
print(json.dumps(data.get('vendor_organizations'), indent=2))

print("\n" + "=" * 80)
print("DIRECT QUERY CHECK")
print("=" * 80)

vendor_orgs = customer.customer_organizations.all()
print(f"\nDirect query count: {vendor_orgs.count()}")
for vo in vendor_orgs:
    print(f"  - {vo.organization.name} (ID: {vo.id})")

