#!/usr/bin/env python
"""
Test script to verify multi-vendor customer linking works correctly.

Usage:
    python test_multi_vendor_customer.py
"""

import os
import sys
import django

# Setup Django
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from django.contrib.auth import get_user_model
from crmApp.models import Organization, Customer, CustomerOrganization, UserProfile

User = get_user_model()


def test_multi_vendor_customer():
    """Test that customers can be linked to multiple vendors"""
    
    print("=" * 60)
    print("TESTING MULTI-VENDOR CUSTOMER SUPPORT")
    print("=" * 60)
    
    # Create test vendors
    print("\n1. Creating test vendor organizations...")
    vendor_a, _ = Organization.objects.get_or_create(
        name="Vendor A Test",
        defaults={'slug': 'vendor-a-test'}
    )
    vendor_b, _ = Organization.objects.get_or_create(
        name="Vendor B Test",
        defaults={'slug': 'vendor-b-test'}
    )
    print(f"   ✓ Vendor A: {vendor_a.name} (ID: {vendor_a.id})")
    print(f"   ✓ Vendor B: {vendor_b.name} (ID: {vendor_b.id})")
    
    # Create test customer user
    print("\n2. Creating test customer user...")
    test_email = "test.customer@example.com"
    customer_user, created = User.objects.get_or_create(
        email=test_email,
        defaults={
            'username': test_email,
            'first_name': 'Test',
            'last_name': 'Customer'
        }
    )
    if created:
        customer_user.set_password('testpass123')
        customer_user.save()
        print(f"   ✓ Created new user: {customer_user.email}")
    else:
        print(f"   ✓ Using existing user: {customer_user.email}")
    
    # Create customer profile
    customer_profile, _ = UserProfile.objects.get_or_create(
        user=customer_user,
        profile_type='customer',
        defaults={'status': 'active'}
    )
    
    # Test Case 1: Vendor A creates customer
    print("\n3. Vendor A creates customer record...")
    customer, created = Customer.objects.get_or_create(
        email=test_email,
        defaults={
            'name': f"{customer_user.first_name} {customer_user.last_name}",
            'organization': vendor_a,
            'user': customer_user,
            'status': 'active'
        }
    )
    print(f"   ✓ Customer: {customer.name} (ID: {customer.id})")
    
    # Ensure CustomerOrganization link exists
    customer_org_a, created = CustomerOrganization.objects.get_or_create(
        customer=customer,
        organization=vendor_a,
        defaults={'relationship_status': 'active'}
    )
    if created:
        print(f"   ✓ Created CustomerOrganization link for Vendor A")
    else:
        print(f"   ✓ CustomerOrganization link already exists for Vendor A")
    
    # Test Case 2: Vendor B links same customer
    print("\n4. Vendor B links same customer...")
    existing_customer = Customer.objects.filter(email__iexact=test_email).first()
    
    if existing_customer:
        print(f"   ✓ Found existing customer: {existing_customer.email}")
        
        # Create CustomerOrganization link
        customer_org_b, created = CustomerOrganization.objects.get_or_create(
            customer=existing_customer,
            organization=vendor_b,
            defaults={'relationship_status': 'active'}
        )
        
        if created:
            print(f"   ✓ Created CustomerOrganization link for Vendor B")
        else:
            print(f"   ✓ CustomerOrganization link already exists for Vendor B")
    else:
        print("   ✗ ERROR: Customer not found!")
        return False
    
    # Test Case 3: Verify customer sees both vendors
    print("\n5. Verifying customer can see both vendors...")
    customer_orgs = CustomerOrganization.objects.filter(customer=customer)
    print(f"   Total vendor links: {customer_orgs.count()}")
    
    for co in customer_orgs:
        print(f"   - {co.organization.name} (Status: {co.relationship_status})")
    
    # Test Case 4: Verify organizations see customer
    print("\n6. Verifying vendors can see customer...")
    
    # Vendor A's customers
    vendor_a_customers = Customer.objects.filter(organizations__id=vendor_a.id)
    print(f"   Vendor A customers: {vendor_a_customers.count()}")
    if customer in vendor_a_customers:
        print(f"   ✓ Customer visible to Vendor A")
    else:
        print(f"   ✗ ERROR: Customer NOT visible to Vendor A!")
        return False
    
    # Vendor B's customers
    vendor_b_customers = Customer.objects.filter(organizations__id=vendor_b.id)
    print(f"   Vendor B customers: {vendor_b_customers.count()}")
    if customer in vendor_b_customers:
        print(f"   ✓ Customer visible to Vendor B")
    else:
        print(f"   ✗ ERROR: Customer NOT visible to Vendor B!")
        return False
    
    # Summary
    print("\n" + "=" * 60)
    print("TEST RESULTS")
    print("=" * 60)
    print("✅ Multi-vendor customer linking works correctly!")
    print(f"✅ Customer {customer.email} is linked to {customer_orgs.count()} vendors")
    print("✅ Both vendors can see the customer")
    print("✅ Customer can see both vendors")
    print("=" * 60)
    
    return True


if __name__ == '__main__':
    try:
        success = test_multi_vendor_customer()
        sys.exit(0 if success else 1)
    except Exception as e:
        print(f"\n✗ ERROR: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

