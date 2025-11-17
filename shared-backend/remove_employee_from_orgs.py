#!/usr/bin/env python
"""
Script to remove an employee from all organizations
"""
import os
import sys
import django

# Setup Django
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from crmApp.models import User, Employee, UserProfile

def remove_employee_from_all_orgs(email):
    """Remove employee from all organizations"""
    try:
        # Get user
        user = User.objects.get(email=email)
        print(f"\n{'='*80}")
        print(f"User: {user.email} (ID: {user.id})")
        print(f"{'='*80}\n")
        
        # Get all employee records (active and inactive)
        employees = Employee.objects.filter(user=user).select_related('organization')
        
        if not employees.exists():
            print(f"[INFO] No employee records found for {email}")
            return
        
        print(f"Found {employees.count()} employee record(s):\n")
        
        for employee in employees:
            print(f"  - {employee.first_name} {employee.last_name}")
            print(f"    Organization: {employee.organization.name} (ID: {employee.organization.id})")
            print(f"    Status: {employee.status}")
            print(f"    Role: {employee.role.name if employee.role else 'None'}")
        
        # Confirm deletion
        print(f"\n{'='*80}")
        print("Removing employee from all organizations...")
        print(f"{'='*80}\n")
        
        # Delete all employee records
        deleted_count = employees.delete()[0]
        print(f"[SUCCESS] Deleted {deleted_count} employee record(s)")
        
        # Also check and remove UserProfile records with employee profile_type
        user_profiles = UserProfile.objects.filter(
            user=user,
            profile_type='employee'
        ).select_related('organization')
        
        if user_profiles.exists():
            print(f"\nFound {user_profiles.count()} employee UserProfile record(s):\n")
            for profile in user_profiles:
                print(f"  - Organization: {profile.organization.name} (ID: {profile.organization.id})")
                print(f"    Status: {profile.status}")
            
            deleted_profiles = user_profiles.delete()[0]
            print(f"\n[SUCCESS] Deleted {deleted_profiles} employee UserProfile record(s)")
        else:
            print(f"\n[INFO] No employee UserProfile records found")
        
        # Verify removal
        remaining_employees = Employee.objects.filter(user=user)
        if remaining_employees.exists():
            print(f"\n[WARNING] Still found {remaining_employees.count()} employee record(s)!")
        else:
            print(f"\n[SUCCESS] User {email} is no longer an employee of any organization")
        
        print(f"\n{'='*80}\n")
    
    except User.DoesNotExist:
        print(f"[ERROR] User with email '{email}' not found in database")
    except Exception as e:
        print(f"[ERROR] Error: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    email = 'dummy@gmail.com'
    if len(sys.argv) > 1:
        email = sys.argv[1]
    
    remove_employee_from_all_orgs(email)

