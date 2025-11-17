#!/usr/bin/env python
"""
Script to remove ALL employee records from the database
"""
import os
import sys
import django

# Setup Django
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from crmApp.models import Employee, UserProfile

def remove_all_employees():
    """Remove all employee records from the database"""
    print(f"\n{'='*80}")
    print("REMOVING ALL EMPLOYEE RECORDS FROM DATABASE")
    print(f"{'='*80}\n")
    
    # Count all employee records
    all_employees = Employee.objects.all().select_related('organization', 'user', 'role')
    employee_count = all_employees.count()
    
    if employee_count == 0:
        print("[INFO] No employee records found in database")
    else:
        print(f"Found {employee_count} employee record(s) across all organizations:\n")
        
        # Group by organization for display
        org_counts = {}
        for emp in all_employees:
            org_name = emp.organization.name
            if org_name not in org_counts:
                org_counts[org_name] = 0
            org_counts[org_name] += 1
        
        for org_name, count in sorted(org_counts.items()):
            print(f"  - {org_name}: {count} employee(s)")
        
        print(f"\n{'='*80}")
        print("Deleting all employee records...")
        print(f"{'='*80}\n")
        
        # Delete all employee records
        deleted_count = all_employees.delete()[0]
        print(f"[SUCCESS] Deleted {deleted_count} employee record(s)")
    
    # Also remove all employee UserProfile records
    print(f"\n{'='*80}")
    print("Checking for employee UserProfile records...")
    print(f"{'='*80}\n")
    
    employee_profiles = UserProfile.objects.filter(profile_type='employee').select_related('organization')
    profile_count = employee_profiles.count()
    
    if profile_count == 0:
        print("[INFO] No employee UserProfile records found")
    else:
        print(f"Found {profile_count} employee UserProfile record(s):\n")
        
        # Group by organization for display
        org_profile_counts = {}
        for profile in employee_profiles:
            org_name = profile.organization.name if profile.organization else "No Organization"
            if org_name not in org_profile_counts:
                org_profile_counts[org_name] = 0
            org_profile_counts[org_name] += 1
        
        for org_name, count in sorted(org_profile_counts.items()):
            print(f"  - {org_name}: {count} profile(s)")
        
        print(f"\nDeleting all employee UserProfile records...\n")
        
        # Delete all employee UserProfile records
        deleted_profiles = employee_profiles.delete()[0]
        print(f"[SUCCESS] Deleted {deleted_profiles} employee UserProfile record(s)")
    
    # Verify removal
    print(f"\n{'='*80}")
    print("Verification")
    print(f"{'='*80}\n")
    
    remaining_employees = Employee.objects.count()
    remaining_profiles = UserProfile.objects.filter(profile_type='employee').count()
    
    if remaining_employees == 0 and remaining_profiles == 0:
        print("[SUCCESS] All employee records have been removed from the database")
        print("[SUCCESS] No employees are assigned to any vendor or organization")
    else:
        print(f"[WARNING] Still found:")
        if remaining_employees > 0:
            print(f"  - {remaining_employees} employee record(s)")
        if remaining_profiles > 0:
            print(f"  - {remaining_profiles} employee UserProfile record(s)")
    
    print(f"\n{'='*80}\n")

if __name__ == '__main__':
    # Safety confirmation
    print("\n" + "!"*80)
    print("WARNING: This will delete ALL employee records from the database!")
    print("This action cannot be undone!")
    print("!"*80)
    
    response = input("\nAre you sure you want to proceed? (yes/no): ")
    
    if response.lower() == 'yes':
        remove_all_employees()
    else:
        print("\n[INFO] Operation cancelled. No records were deleted.")

