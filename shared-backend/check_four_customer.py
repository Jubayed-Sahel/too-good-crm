#!/usr/bin/env python
"""
Check vendors for customer four@four.com
"""
import os
import sys
import django

# Setup Django
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from crmApp.models import Customer, CustomerOrganization

print("=" * 80)
print("CHECKING VENDORS FOR CUSTOMER: four@four.com")
print("=" * 80)

try:
    customers = Customer.objects.filter(email='four@four.com')
    print(f"\n✓ Found {customers.count()} customer(s) with email 'four@four.com'")
    
    for customer in customers:
        print(f"\n{'=' * 80}")
        print(f"Customer: {customer.name} (ID: {customer.id})")
        print(f"  Email: {customer.email}")
        
        # Get all vendor relationships
        vendor_orgs = customer.customer_organizations.select_related('organization', 'assigned_employee').all()
        
        print(f"\n  Total vendors: {vendor_orgs.count()}")
        
        if vendor_orgs.count() > 0:
            print("\n  Vendor details:")
            for i, vo in enumerate(vendor_orgs, 1):
                print(f"\n  {i}. {vo.organization.name} (Org ID: {vo.organization_id})")
                print(f"     Status: {vo.relationship_status}")
                if vo.assigned_employee:
                    print(f"     Assigned: {vo.assigned_employee.first_name} {vo.assigned_employee.last_name}")
                if vo.credit_limit:
                    print(f"     Credit Limit: ${vo.credit_limit}")
                if vo.payment_terms:
                    print(f"     Payment Terms: {vo.payment_terms}")
                if vo.vendor_notes:
                    print(f"     Notes: {vo.vendor_notes}")
        else:
            print("\n  ✗ No vendor relationships found")
    
    print("\n" + "=" * 80)
    
except Customer.DoesNotExist:
    print(f"\n✗ ERROR: Customer with email 'four@four.com' not found")
except Exception as e:
    print(f"\n✗ ERROR: {str(e)}")
    import traceback
    traceback.print_exc()
