#!/usr/bin/env python
"""
Script to remove all user-organization assignments (UserProfile records)
This will unassign all users (vendors and employees) from organizations
"""
import os
import sys
import django

# Setup Django
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from crmApp.models import UserProfile, Organization, User

def remove_all_user_org_assignments():
    """Remove all UserProfile records (user-organization assignments)"""
    print(f"\n{'='*80}")
    print("REMOVING ALL USER-ORGANIZATION ASSIGNMENTS")
    print(f"{'='*80}\n")
    
    # Count all UserProfile records
    all_profiles = UserProfile.objects.all().select_related('organization', 'user')
    profile_count = all_profiles.count()
    
    if profile_count == 0:
        print("[INFO] No UserProfile records found in database")
    else:
        print(f"Found {profile_count} UserProfile record(s):\n")
        
        # Group by profile type and organization
        profile_summary = {}
        for profile in all_profiles:
            profile_type = profile.profile_type
            org_name = profile.organization.name if profile.organization else "No Organization"
            
            key = f"{profile_type} - {org_name}"
            if key not in profile_summary:
                profile_summary[key] = 0
            profile_summary[key] += 1
        
        for key, count in sorted(profile_summary.items()):
            print(f"  - {key}: {count} profile(s)")
        
        print(f"\n{'='*80}")
        print("Deleting all UserProfile records...")
        print(f"{'='*80}\n")
        
        # Delete all UserProfile records
        deleted_count = all_profiles.delete()[0]
        print(f"[SUCCESS] Deleted {deleted_count} UserProfile record(s)")
    
    # Verify removal
    print(f"\n{'='*80}")
    print("Verification")
    print(f"{'='*80}\n")
    
    remaining_profiles = UserProfile.objects.count()
    org_count = Organization.objects.count()
    user_count = User.objects.count()
    
    print(f"Remaining UserProfile Records: {remaining_profiles}")
    print(f"Total Organizations in DB: {org_count}")
    print(f"Total Users in DB: {user_count}\n")
    
    if remaining_profiles == 0:
        print("[SUCCESS] All user-organization assignments have been removed")
        print("[SUCCESS] No users are assigned to any organization")
        print(f"[INFO] Organizations still exist in database ({org_count} organizations)")
        print("[INFO] Users still exist in database (can be reassigned later)")
    else:
        print(f"[WARNING] Still found {remaining_profiles} UserProfile record(s)")
    
    print(f"\n{'='*80}\n")

if __name__ == '__main__':
    # Safety confirmation
    print("\n" + "!"*80)
    print("WARNING: This will remove ALL user-organization assignments!")
    print("This will unassign ALL users (vendors and employees) from ALL organizations!")
    print("Organizations will remain in the database but no users will be linked to them.")
    print("This action cannot be undone!")
    print("!"*80)
    
    response = input("\nAre you sure you want to proceed? (yes/no): ")
    
    if response.lower() == 'yes':
        remove_all_user_org_assignments()
    else:
        print("\n[INFO] Operation cancelled. No records were deleted.")

