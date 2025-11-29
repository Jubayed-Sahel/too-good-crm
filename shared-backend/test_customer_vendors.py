#!/usr/bin/env python
"""
Test script to verify customer can see vendors from all their organizations
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from crmApp.models import User, Customer, Organization, Vendor, CustomerOrganization
from crmApp.utils.profile_context import get_user_accessible_organizations

print("=" * 60)
print("CUSTOMER VENDOR ACCESS TEST")
print("=" * 60)

# Get the customer user
customer_email = 'customer@1.com'
try:
    user = User.objects.get(email=customer_email)
    print(f"\n✓ Found customer user: {user.email} (ID={user.id})")
except User.DoesNotExist:
    print(f"\n✗ Customer user not found: {customer_email}")
    exit(1)

# Get customer record
customer = Customer.objects.filter(email=customer_email).first()
if customer:
    print(f"✓ Customer record: ID={customer.id}, Name={customer.name}")
else:
    print("✗ No customer record found")
    exit(1)

# Get accessible organization IDs
accessible_org_ids = get_user_accessible_organizations(user)
print(f"\n✓ Accessible organization IDs: {accessible_org_ids}")

# Get organization names
accessible_orgs = Organization.objects.filter(id__in=accessible_org_ids)
print(f"✓ Accessible organizations:")
for org in accessible_orgs:
    print(f"  - {org.name} (ID={org.id})")

# Get all vendors from these organizations
vendors = Vendor.objects.filter(organization_id__in=accessible_org_ids)
print(f"\n✓ Vendors in accessible organizations: {vendors.count()}")
for vendor in vendors:
    print(f"  - {vendor.name} (Org: {vendor.organization.name})")

# Get CustomerOrganization links
print(f"\n✓ CustomerOrganization links for customer {customer.id}:")
customer_orgs = CustomerOrganization.objects.filter(customer=customer).select_related('organization')
for co in customer_orgs:
    print(f"  - Organization: {co.organization.name} (ID={co.organization_id}), Status: {co.relationship_status}")

print("\n" + "=" * 60)
print("TEST COMPLETE")
print("=" * 60)
print("\nExpected behavior:")
print("  1. Customer should have accessible_org_ids = [29, 30]")
print("  2. Vendors from BOTH orgs should be returned")
print("  3. CustomerOrganization links should show both orgs")
print("=" * 60)

