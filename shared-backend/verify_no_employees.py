#!/usr/bin/env python
"""
Script to verify no employee records exist
"""
import os
import sys
import django

# Setup Django
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from crmApp.models import Employee, UserProfile

def verify_no_employees():
    """Verify no employee records exist"""
    print(f"\n{'='*80}")
    print("VERIFICATION: Checking for employee records")
    print(f"{'='*80}\n")
    
    employee_count = Employee.objects.count()
    employee_profile_count = UserProfile.objects.filter(profile_type='employee').count()
    
    print(f"Employee Records: {employee_count}")
    print(f"Employee UserProfile Records: {employee_profile_count}\n")
    
    if employee_count == 0 and employee_profile_count == 0:
        print("[SUCCESS] No employee records found in database")
        print("[SUCCESS] Database is clean - no employees assigned to any organization")
    else:
        print("[WARNING] Found employee records:")
        if employee_count > 0:
            print(f"  - {employee_count} Employee record(s)")
        if employee_profile_count > 0:
            print(f"  - {employee_profile_count} Employee UserProfile record(s)")
    
    print(f"\n{'='*80}\n")

if __name__ == '__main__':
    verify_no_employees()

