"""
COMPREHENSIVE FIX FOR EMPLOYEE INVITATION ISSUE

Problem: When user B is invited as employee to user A's organization,
the employee profile doesn't appear in profile switcher.

Root Cause: When creating profiles at signup, all profiles are created with
organization=None. When invited, employee profile is updated with org, but
if user then creates their OWN organization, it might interfere.

Solution: Ensure employee profiles are properly created and primary profile
logic is correct.
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from django.db import transaction
from crmApp.models import User, UserProfile, Employee, UserOrganization, Organization

def fix_employee_invitation_flow():
    """
    Fix the employee invitation flow by ensuring:
    1. Employee profiles are created correctly
    2. Primary profile logic is correct    3. Vendor profiles don't interfere with employee profiles
    """
    
    print("\n" + "="*70)
    print("EMPLOYEE INVITATION FIX")
    print("="*70)
    
    # Find users who have employee profiles with organizations
    employee_profiles = UserProfile.objects.filter(
        profile_type='employee',
        organization__isnull=False,
        status='active'
    ).select_related('user', 'organization')
    
    print(f"\nFound {employee_profiles.count()} employee profiles with organizations")
    
    fixed_count = 0
    for profile in employee_profiles:
        user = profile.user
        org = profile.organization
        
        # Check if Employee record exists
        employee = Employee.objects.filter(
            user=user,
            organization=org,
            status='active'
        ).first()
        
        # Check if UserOrganization link exists
        user_org = UserOrganization.objects.filter(
            user=user,
            organization=org,
            is_active=True
        ).first()
        
        needs_fix = False
        issues = []
        
        if not employee:
            issues.append("Missing Employee record")
            needs_fix = True
        
        if not user_org:
            issues.append("Missing UserOrganization link")
            needs_fix = True
        
        if needs_fix:
            print(f"\n❌ {user.email} - {', '.join(issues)}")
            print(f"   Employee profile for org: {org.name}")
            
            with transaction.atomic():
                # Create missing Employee record
                if not employee:
                    employee = Employee.objects.create(
                        user=user,
                        organization=org,
                        first_name=user.first_name or '',
                        last_name=user.last_name or '',
                        email=user.email,
                        status='active'
                    )
                    print(f"   ✅ Created Employee record")
                
                # Create or activate UserOrganization link
                if not user_org:
                    user_org, created = UserOrganization.objects.get_or_create(
                        user=user,
                        organization=org,
                        defaults={
                            'is_owner': False,
                            'is_active': True
                        }
                    )
                    if not created:
                        # Reactivate existing link
                        user_org.is_active = True
                        user_org.save()
                        print(f"   ✅ Reactivated UserOrganization link")
                    else:
                        print(f"   ✅ Created UserOrganization link")
            
            fixed_count += 1
        else:
            print(f"✅ {user.email} - Employee profile is correct")
    
    print("\n" + "="*70)
    print(f"Fixed {fixed_count} employee profiles")
    print("="*70)
    
    return fixed_count

def ensure_primary_profiles_correct():
    """
    Ensure primary profile logic is correct:
    - Users with only vendor profile: vendor should be primary
    - Users with only employee profile: employee should be primary
    - Users with both: vendor is primary (they're the owner)
    """
    print("\n" + "="*70)
    print("FIXING PRIMARY PROFILE LOGIC")
    print("="*70)
    
    all_users = User.objects.all()
    fixed_count = 0
    
    for user in all_users:
        profiles = UserProfile.objects.filter(user=user, status='active')
        
        vendor_profile = profiles.filter(profile_type='vendor', organization__isnull=False).first()
        employee_profile = profiles.filter(profile_type='employee', organization__isnull=False).first()
        
        # Determine which should be primary
        should_be_primary = None
        
        if vendor_profile and employee_profile:
            # User is both vendor and employee (different orgs)
            # Vendor should be primary
            should_be_primary = vendor_profile
        elif vendor_profile:
            # User is only vendor
            should_be_primary = vendor_profile
        elif employee_profile:
            # User is only employee
            should_be_primary = employee_profile
        
        if should_be_primary:
            current_primary = profiles.filter(is_primary=True).first()
            
            if current_primary != should_be_primary:
                print(f"\n❌ {user.email} - Wrong primary profile")
                print(f"   Current: {current_primary.profile_type if current_primary else 'None'}")
                print(f"   Should be: {should_be_primary.profile_type}")
                
                with transaction.atomic():
                    # Unset all primary flags
                    profiles.update(is_primary=False)
                    # Set correct primary
                    should_be_primary.is_primary = True
                    should_be_primary.save()
                    print(f"   ✅ Fixed primary profile")
                
                fixed_count += 1
    
    print("\n" + "="*70)
    print(f"Fixed {fixed_count} primary profiles")
    print("="*70)
    
    return fixed_count

if __name__ == '__main__':
    print("\n🔧 Starting comprehensive employee invitation fix...")
    
    fixed_invitations = fix_employee_invitation_flow()
    fixed_primaries = ensure_primary_profiles_correct()
    
    total_fixes = fixed_invitations + fixed_primaries
    
    print("\n" + "="*70)
    print("✅ FIX COMPLETE!")
    print("="*70)
    print(f"Total fixes applied: {total_fixes}")
    print("\n📋 Next steps:")
    print("1. Have invited users logout and login again")
    print("2. They should now see employee profile in profile switcher")
    print("3. They can switch between vendor (their org) and employee (invited org)")
    print("\n" + "="*70)

