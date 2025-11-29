#!/usr/bin/env python
"""
Check CustomerOrganization entries distribution
"""
import os
import sys
import django

# Setup Django
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from crmApp.models import CustomerOrganization
from django.db.models import Count

print("=" * 80)
print("CUSTOMER-ORGANIZATION RELATIONSHIPS")
print("=" * 80)

total = CustomerOrganization.objects.count()
print(f"\nTotal CustomerOrganization entries: {total}")

print("\nCustomers with multiple vendors:")
results = CustomerOrganization.objects.values('customer_id', 'customer__name').annotate(
    vendor_count=Count('id')
).filter(vendor_count__gt=1).order_by('-vendor_count')

if results:
    for r in results:
        customer_id = r['customer_id']
        customer_name = r['customer__name']
        vendor_count = r['vendor_count']
        print(f"\n  Customer: {customer_name} (ID: {customer_id}) - {vendor_count} vendors")
        
        # Show all vendors for this customer
        customer_orgs = CustomerOrganization.objects.filter(customer_id=customer_id).select_related('organization')
        for co in customer_orgs:
            print(f"    - {co.organization.name} (Status: {co.relationship_status})")
else:
    print("  No customers with multiple vendors found!")

print("\nCustomers with single vendor:")
results = CustomerOrganization.objects.values('customer_id', 'customer__name').annotate(
    vendor_count=Count('id')
).filter(vendor_count=1).order_by('customer__name')[:10]

for r in results:
    customer_name = r['customer__name']
    vendor_count = r['vendor_count']
    print(f"  {customer_name}: {vendor_count} vendor")

print("\n" + "=" * 80)
