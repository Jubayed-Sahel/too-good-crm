"""
Clean up duplicate user profiles - keep only one of each type per user.
This script ensures each user has at most:
- 1 vendor profile
- 1 employee profile  
- 1 customer profile
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from crmApp.models import UserProfile
from django.db.models import Count

def cleanup_duplicate_profiles():
    """Remove duplicate profiles, keeping the primary one or first created."""
    
    print("🔍 Checking for duplicate profiles...")
    
    # Get users with duplicate profiles of same type
    from django.db.models import Q
    from crmApp.models import User
    
    users = User.objects.all()
    
    for user in users:
        print(f"\n👤 Processing user: {user.email}")
        
        for profile_type in ['vendor', 'employee', 'customer']:
            profiles = UserProfile.objects.filter(
                user=user,
                profile_type=profile_type
            ).order_by('-is_primary', 'created_at')
            
            count = profiles.count()
            
            if count > 1:
                print(f"  ⚠️  Found {count} {profile_type} profiles")
                
                # Keep the first one (primary or oldest)
                keep = profiles.first()
                to_delete = profiles.exclude(pk=keep.pk)
                
                print(f"  ✅ Keeping: {keep} (ID: {keep.id})")
                print(f"  ❌ Deleting {to_delete.count()} duplicate(s)")
                
                for profile in to_delete:
                    print(f"     - Deleting: {profile} (ID: {profile.id})")
                    profile.delete()
                    
            elif count == 1:
                print(f"  ✓ {profile_type}: OK (1 profile)")
            else:
                print(f"  - {profile_type}: None")
    
    print("\n✅ Cleanup complete!")
    
    # Summary
    print("\n📊 Final profile counts:")
    for profile_type in ['vendor', 'employee', 'customer']:
        count = UserProfile.objects.filter(profile_type=profile_type).count()
        print(f"  {profile_type}: {count} profiles")

if __name__ == '__main__':
    cleanup_duplicate_profiles()
