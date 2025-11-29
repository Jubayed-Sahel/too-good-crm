#!/usr/bin/env python
"""
Add multiple vendor relationships to demonstrate multi-vendor support
"""
import os
import sys
import django

# Setup Django
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from crmApp.models import Customer, Organization, CustomerOrganization, Employee

print("=" * 80)
print("ADDING MULTIPLE VENDOR RELATIONSHIPS")
print("=" * 80)

# Get some customers and organizations
customers = Customer.objects.all()[:5]
organizations = Organization.objects.all()[:5]

print(f"\nAvailable customers: {customers.count()}")
print(f"Available organizations: {organizations.count()}")

if customers.count() < 1 or organizations.count() < 2:
    print("\n✗ Not enough data to create multi-vendor relationships")
    sys.exit(1)

added = 0

for customer in customers:
    print(f"\n{'=' * 80}")
    print(f"Customer: {customer.name} (ID: {customer.id})")
    print(f"Current vendors: {customer.customer_organizations.count()}")
    
    # Get existing vendor IDs
    existing_vendor_ids = set(customer.customer_organizations.values_list('organization_id', flat=True))
    print(f"  Existing vendor IDs: {existing_vendor_ids}")
    
    # Add 2-3 more vendors to this customer
    for org in organizations:
        if org.id not in existing_vendor_ids:
            # Create relationship
            co = CustomerOrganization.objects.create(
                customer=customer,
                organization=org,
                relationship_status='active',
                vendor_notes=f'Added for multi-vendor testing',
                credit_limit=50000.00,
                payment_terms='Net 30'
            )
            print(f"  ✓ Added vendor: {org.name} (ID: {org.id})")
            added += 1
            existing_vendor_ids.add(org.id)
            
            # Stop after adding 2 vendors per customer
            if len(existing_vendor_ids) >= 3:
                break
    
    # Show final count
    final_count = customer.customer_organizations.count()
    print(f"  Final vendor count: {final_count}")

print(f"\n{'=' * 80}")
print(f"SUMMARY: Added {added} new vendor relationships")
print(f"{'=' * 80}")

# Show some examples
print("\nCustomers with multiple vendors:")
from django.db.models import Count
results = CustomerOrganization.objects.values('customer_id', 'customer__name').annotate(
    vendor_count=Count('id')
).filter(vendor_count__gt=1).order_by('-vendor_count')[:5]

for r in results:
    customer_id = r['customer_id']
    customer_name = r['customer__name']
    vendor_count = r['vendor_count']
    print(f"\n  {customer_name} (ID: {customer_id}) - {vendor_count} vendors:")
    
    customer_orgs = CustomerOrganization.objects.filter(customer_id=customer_id).select_related('organization')
    for co in customer_orgs:
        print(f"    - {co.organization.name} (Status: {co.relationship_status})")
