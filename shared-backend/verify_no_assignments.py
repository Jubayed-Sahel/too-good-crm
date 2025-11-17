#!/usr/bin/env python
"""
Script to verify no users are assigned to any organization
"""
import os
import sys
import django

# Setup Django
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from crmApp.models import UserProfile, Organization, User, Employee

def verify_no_assignments():
    """Verify no users are assigned to any organization"""
    print(f"\n{'='*80}")
    print("VERIFICATION: Checking user-organization assignments")
    print(f"{'='*80}\n")
    
    # Check UserProfile records
    profile_count = UserProfile.objects.count()
    vendor_profiles = UserProfile.objects.filter(profile_type='vendor').count()
    employee_profiles = UserProfile.objects.filter(profile_type='employee').count()
    customer_profiles = UserProfile.objects.filter(profile_type='customer').count()
    
    print("USER-ORGANIZATION ASSIGNMENTS (UserProfile):")
    print(f"  Total UserProfile Records: {profile_count}")
    print(f"  Vendor Profiles: {vendor_profiles}")
    print(f"  Employee Profiles: {employee_profiles}")
    print(f"  Customer Profiles: {customer_profiles}")
    
    if profile_count == 0:
        print("  [SUCCESS] No user-organization assignments found")
    else:
        print("  [WARNING] Found UserProfile records!")
    
    print()
    
    # Check Employee records
    employee_count = Employee.objects.count()
    print("EMPLOYEE RECORDS:")
    print(f"  Employee Records: {employee_count}")
    
    if employee_count == 0:
        print("  [SUCCESS] No employee records found")
    else:
        print("  [WARNING] Found employee records!")
    
    print()
    
    # Check what remains
    org_count = Organization.objects.count()
    user_count = User.objects.count()
    
    print("DATABASE STATE:")
    print(f"  Total Organizations: {org_count}")
    print(f"  Total Users: {user_count}")
    print(f"  Total UserProfiles: {profile_count}")
    print(f"  Total Employees: {employee_count}")
    
    print()
    
    # Summary
    print(f"{'='*80}")
    print("SUMMARY:")
    print(f"{'='*80}")
    
    if profile_count == 0 and employee_count == 0:
        print("[SUCCESS] No users are assigned to any organization")
        print("[SUCCESS] All user-organization links have been removed")
        print(f"[INFO] Organizations ({org_count}) and Users ({user_count}) still exist")
        print("[INFO] Users can be reassigned to organizations later if needed")
    else:
        print("[WARNING] Some assignments still exist:")
        if profile_count > 0:
            print(f"  - {profile_count} UserProfile record(s)")
        if employee_count > 0:
            print(f"  - {employee_count} Employee record(s)")
    
    print(f"\n{'='*80}\n")

if __name__ == '__main__':
    verify_no_assignments()

