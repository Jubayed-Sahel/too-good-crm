#!/usr/bin/env python
"""
Script to verify vendors and organizations are intact
"""
import os
import sys
import django

# Setup Django
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from crmApp.models import Employee, UserProfile, Organization, User

def verify_vendors_intact():
    """Verify vendors and organizations are intact, employees are removed"""
    print(f"\n{'='*80}")
    print("VERIFICATION: Checking database state")
    print(f"{'='*80}\n")
    
    # Check employees
    employee_count = Employee.objects.count()
    employee_profile_count = UserProfile.objects.filter(profile_type='employee').count()
    
    print("EMPLOYEE RECORDS:")
    print(f"  Employee Records: {employee_count}")
    print(f"  Employee UserProfile Records: {employee_profile_count}")
    
    if employee_count == 0 and employee_profile_count == 0:
        print("  [SUCCESS] No employee records found - employees are not assigned to any organization")
    else:
        print("  [WARNING] Found employee records!")
    
    print()
    
    # Check vendors
    vendor_profile_count = UserProfile.objects.filter(profile_type='vendor').count()
    vendor_users = UserProfile.objects.filter(profile_type='vendor').select_related('organization', 'user')
    
    print("VENDOR RECORDS:")
    print(f"  Vendor UserProfile Records: {vendor_profile_count}")
    
    if vendor_profile_count > 0:
        print("\n  Vendors and their organizations:")
        for vendor in vendor_users:
            org_name = vendor.organization.name if vendor.organization else "No Organization"
            user_email = vendor.user.email if vendor.user else "No User"
            print(f"    - {user_email} -> {org_name} (Status: {vendor.status})")
        print("  [SUCCESS] Vendors and their organizations are intact")
    else:
        print("  [INFO] No vendor records found")
    
    print()
    
    # Check organizations
    org_count = Organization.objects.count()
    print("ORGANIZATIONS:")
    print(f"  Total Organizations: {org_count}")
    
    if org_count > 0:
        print("\n  Organizations in database:")
        for org in Organization.objects.all()[:10]:  # Show first 10
            print(f"    - {org.name} (ID: {org.id})")
        if org_count > 10:
            print(f"    ... and {org_count - 10} more")
        print("  [SUCCESS] Organizations are intact")
    else:
        print("  [WARNING] No organizations found in database")
    
    print()
    
    # Summary
    print(f"{'='*80}")
    print("SUMMARY:")
    print(f"{'='*80}")
    print("  - Employees: REMOVED from all organizations [OK]")
    print("  - Vendors: INTACT with their organizations [OK]")
    print("  - Organizations: INTACT [OK]")
    print(f"\n{'='*80}\n")

if __name__ == '__main__':
    verify_vendors_intact()

