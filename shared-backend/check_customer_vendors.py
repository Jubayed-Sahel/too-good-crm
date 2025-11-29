#!/usr/bin/env python
"""
Check customer vendor relationships for user four4
"""
import os
import sys
import django

# Setup Django
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from crmApp.models import User, Customer, CustomerOrganization
from crmApp.serializers import CustomerSerializer

print("=" * 80)
print("CHECKING CUSTOMER VENDOR RELATIONSHIPS FOR USER: four4")
print("=" * 80)

try:
    user = User.objects.get(username='four4')
    print(f"\n✓ Found user: {user.username} (ID: {user.id})")
    
    # Get user's profiles
    profiles = user.user_profiles.filter(status='active')
    print(f"\n✓ User has {profiles.count()} active profile(s):")
    for profile in profiles:
        print(f"  - {profile.profile_type}: {profile.organization.name if profile.organization else 'No org'} (Org ID: {profile.organization_id})")
    
    # Get organization IDs
    org_ids = [p.organization_id for p in profiles if p.organization_id]
    print(f"\n✓ Organization IDs: {org_ids}")
    
    # Get customers for these organizations
    from django.db.models import Q
    customers = Customer.objects.filter(
        Q(organization_id__in=org_ids) |
        Q(organizations__id__in=org_ids)
    ).distinct().prefetch_related(
        'customer_organizations',
        'customer_organizations__organization',
        'customer_organizations__assigned_employee'
    )
    
    print(f"\n✓ Found {customers.count()} customer(s)")
    
    # Check each customer's vendor relationships
    for customer in customers[:5]:  # Show first 5
        print(f"\n" + "-" * 80)
        print(f"Customer: {customer.name} (ID: {customer.id})")
        print(f"Primary Organization: {customer.organization_id}")
        
        # Get CustomerOrganization entries
        customer_orgs = customer.customer_organizations.all()
        print(f"Vendor Organizations Count: {customer_orgs.count()}")
        
        for co in customer_orgs:
            print(f"  - Organization: {co.organization.name} (ID: {co.organization_id})")
            print(f"    Status: {co.relationship_status}")
            print(f"    Assigned: {co.assigned_employee.first_name if co.assigned_employee else 'None'}")
        
        # Test serialization
        print(f"\n  Serialized data:")
        serializer = CustomerSerializer(customer)
        vendor_orgs = serializer.data.get('vendor_organizations', [])
        print(f"  vendor_organizations field: {len(vendor_orgs)} items")
        for vo in vendor_orgs:
            print(f"    - {vo.get('organization_name')} (Status: {vo.get('relationship_status')})")
    
    print("\n" + "=" * 80)
    print("CHECK COMPLETE")
    print("=" * 80)
    
except User.DoesNotExist:
    print(f"\n✗ ERROR: User 'four4' not found")
except Exception as e:
    print(f"\n✗ ERROR: {str(e)}")
    import traceback
    traceback.print_exc()
