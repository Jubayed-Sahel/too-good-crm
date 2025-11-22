#!/usr/bin/env python
"""
Create multiple profiles for testuser to enable profile switching
"""

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from crmApp.models import User, UserProfile, Organization, Role

def create_profiles_for_testuser():
    """Create vendor, customer, and employee profiles for testuser"""
    
    # Get testuser
    try:
        user = User.objects.get(username='testuser')
        print(f"[OK] Found user: {user.username} ({user.email})")
    except User.DoesNotExist:
        print("[!] testuser not found. Creating...")
        user = User.objects.create_user(
            username='testuser',
            email='test@test.com',
            password='test123',
            first_name='Test',
            last_name='User'
        )
        print(f"[OK] Created user: {user.username}")
    
    # Get or create organization
    org, created = Organization.objects.get_or_create(
        name='Test Organization',
        defaults={
            'description': 'Test organization for profile switching',
            'is_active': True
        }
    )
    print(f"[OK] {'Created' if created else 'Found'} organization: {org.name}")
    
    # Get existing roles if any (roles require organization, so we'll skip if not found)
    try:
        vendor_role = Role.objects.filter(name__icontains='vendor', organization=org).first()
        customer_role = Role.objects.filter(name__icontains='customer').first()
        employee_role = Role.objects.filter(name__icontains='employee', organization=org).first()
    except:
        vendor_role = customer_role = employee_role = None
        print("[i] Roles not configured, profiles will be created without specific roles")
    
    # Get current profiles
    existing_profiles = UserProfile.objects.filter(user=user)
    print(f"\n[INFO] Current profiles: {existing_profiles.count()}")
    for p in existing_profiles:
        print(f"   - {p.profile_type} (ID: {p.id}, Org: {p.organization}, Primary: {p.is_primary})")
    
    # Check what profiles we need to create
    has_vendor = existing_profiles.filter(profile_type='vendor').exists()
    has_customer = existing_profiles.filter(profile_type='customer').exists()
    has_employee = existing_profiles.filter(profile_type='employee').exists()
    
    created_count = 0
    
    # Create VENDOR profile if missing
    if not has_vendor:
        vendor_profile = UserProfile.objects.create(
            user=user,
            organization=org,
            profile_type='vendor',
            is_primary=False,  # Keep existing primary
            status='active'
        )
        if vendor_role:
            vendor_profile.roles.add(vendor_role)
        print(f"[OK] Created VENDOR profile (ID: {vendor_profile.id})")
        created_count += 1
    else:
        print("[i] VENDOR profile already exists")
    
    # Create CUSTOMER profile if missing
    if not has_customer:
        customer_profile = UserProfile.objects.create(
            user=user,
            organization=None,  # Customers typically don't have org
            profile_type='customer',
            is_primary=False,  # Keep existing primary
            status='active'
        )
        if customer_role:
            customer_profile.roles.add(customer_role)
        print(f"[OK] Created CUSTOMER profile (ID: {customer_profile.id})")
        created_count += 1
    else:
        print("[i] CUSTOMER profile already exists")
    
    # Update EMPLOYEE profile if missing (ensure it has organization)
    if has_employee:
        employee_profiles = existing_profiles.filter(profile_type='employee')
        for emp in employee_profiles:
            if emp.organization is None:
                emp.organization = org
                emp.save()
                print(f"[OK] Updated EMPLOYEE profile with organization")
            if employee_role:
                emp.roles.add(employee_role)
        print("[i] EMPLOYEE profile already exists")
    else:
        employee_profile = UserProfile.objects.create(
            user=user,
            organization=org,  # Employee MUST have org
            profile_type='employee',
            is_primary=False,
            status='active'
        )
        if employee_role:
            employee_profile.roles.add(employee_role)
        print(f"[OK] Created EMPLOYEE profile (ID: {employee_profile.id})")
        created_count += 1
    
    # Refresh profiles
    all_profiles = UserProfile.objects.filter(user=user)
    
    print(f"\n[SUCCESS] Done! User now has {all_profiles.count()} profiles:")
    for p in all_profiles:
        primary_marker = "[*]" if p.is_primary else "[ ]"
        org_name = str(p.organization.name if p.organization else 'None')
        print(f"   {primary_marker} {p.profile_type.upper():10} (ID: {p.id:2}, Org: {org_name:20}, Primary: {p.is_primary})")
    
    if created_count > 0:
        print(f"\n[OK] Created {created_count} new profile(s)")
        print("[OK] Profile switcher should now appear in the Android app!")
    else:
        print("\n[OK] All profiles already exist")
        print("[OK] Profile switcher should be visible in the Android app")
    
    print("\n[NEXT STEPS]")
    print("   1. Login to the Android app with testuser/test123")
    print("   2. You should see the profile switcher above the top bar")
    print("   3. Tap to open dropdown and select different profiles")
    print("   4. Try switching between Vendor, Customer, and Employee")

if __name__ == '__main__':
    create_profiles_for_testuser()

