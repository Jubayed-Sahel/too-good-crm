import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from crmApp.models import User, Organization, UserProfile

print("🔍 Analyzing User Organizations for Customer Issue Raising")
print("=" * 70)

# Get all users with customer profiles
users = User.objects.all()

for user in users:
    customer_profile = UserProfile.objects.filter(
        user=user,
        profile_type='customer',
        status='active'
    ).first()
    
    if customer_profile and customer_profile.organization:
        org = customer_profile.organization
        print(f"\n👤 User: {user.email}")
        print(f"   Organization ID: {org.id}")
        print(f"   Organization Name: {org.name}")
        print(f"   Linear Team ID: {org.linear_team_id or 'Not configured'}")
        print(f"   ✅ This user can raise issues for organization ID: {org.id}")

print("\n" + "=" * 70)
print("\n💡 SOLUTION:")
print("   When a customer raises an issue, they should use THEIR OWN organization ID")
print("   The frontend should auto-fill the organization field with the user's org")
print("=" * 70)
