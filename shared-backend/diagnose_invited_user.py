import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from crmApp.models import User, UserProfile, Employee, UserOrganization

print("\n" + "="*70)
print("INVITED USER DIAGNOSIS")
print("="*70)
print("\nEnter the email of the INVITED user:")
email = input("Email: ")

try:
    user = User.objects.get(email=email)
except User.DoesNotExist:
    print(f"❌ User with email '{email}' not found!")
    exit(1)

print(f"\n✅ Found user: {user.email} ({user.full_name})")

# Get all profiles
print("\n" + "="*70)
print("USER PROFILES")
print("="*70)
profiles = UserProfile.objects.filter(user=user, status='active').select_related('organization')

if not profiles.exists():
    print("❌ No active profiles found!")
else:
    for profile in profiles:
        org_info = f"Org: {profile.organization.name} (ID: {profile.organization.id})" if profile.organization else "Org: None"
        primary = " [PRIMARY]" if profile.is_primary else ""
        print(f"\n{profile.profile_type.upper()}{primary}")
        print(f"  {org_info}")
        print(f"  Status: {profile.status}")
        
        # For employee profiles, check Employee record
        if profile.profile_type == 'employee' and profile.organization:
            emp = Employee.objects.filter(
                user=user,
                organization=profile.organization,
                status='active'
            ).first()
            if emp:
                role_name = emp.role.name if emp.role else "NO ROLE"
                print(f"  ✅ Employee record exists - Role: {role_name}")
            else:
                print(f"  ❌ NO Employee record found!")

# Get UserOrganization links
print("\n" + "="*70)
print("ORGANIZATION LINKS")
print("="*70)
user_orgs = UserOrganization.objects.filter(user=user, is_active=True).select_related('organization')

if not user_orgs.exists():
    print("❌ No active organization links found!")
else:
    for uo in user_orgs:
        owner_flag = " [OWNER]" if uo.is_owner else " [MEMBER]"
        print(f"  {uo.organization.name} (ID: {uo.organization.id}){owner_flag}")

# Check what would be returned by UserSerializer.get_profiles()
print("\n" + "="*70)
print("WHAT FRONTEND SHOULD SEE")
print("="*70)

valid_profiles = []
for profile in profiles:
    if profile.profile_type == 'employee':
        if not profile.organization:
            print(f"❌ Employee profile skipped: No organization")
            continue
        
        has_active_employee = Employee.objects.filter(
            user=user,
            organization=profile.organization,
            status='active'
        ).exists()
        
        has_active_org_link = UserOrganization.objects.filter(
            user=user,
            organization=profile.organization,
            is_active=True
        ).exists()
        
        if has_active_employee and has_active_org_link:
            print(f"✅ Employee profile for '{profile.organization.name}' - SHOWN")
            valid_profiles.append(profile)
        else:
            print(f"❌ Employee profile for '{profile.organization.name}' - HIDDEN")
            if not has_active_employee:
                print(f"   Reason: No active Employee record")
            if not has_active_org_link:
                print(f"   Reason: No active UserOrganization link")
    elif profile.profile_type == 'vendor':
        org_name = profile.organization.name if profile.organization else "None"
        print(f"✅ Vendor profile (Org: {org_name}) - SHOWN")
        valid_profiles.append(profile)
    elif profile.profile_type == 'customer':
        print(f"✅ Customer profile - SHOWN")
        valid_profiles.append(profile)

print("\n" + "="*70)
print(f"TOTAL PROFILES VISIBLE TO FRONTEND: {len(valid_profiles)}")
print("="*70)

if len(valid_profiles) == 0:
    print("\n🚨 PROBLEM: User has NO visible profiles!")
elif len(valid_profiles) == 1 and valid_profiles[0].profile_type == 'vendor':
    print("\n⚠️  PROBLEM: User only sees vendor profile, employee profile is hidden!")
    print("This means the invited employee cannot access their employee account.")
else:
    print("\n✅ User should see multiple profile options in profile switcher")

print("\n" + "="*70)

