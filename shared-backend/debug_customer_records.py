import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from crmApp.models import User, Organization, Customer, UserProfile

print("🔍 Analyzing Customer Records Issue")
print("=" * 70)

# Get all users
users = User.objects.all()
print(f"\n📊 Total Users: {users.count()}")

# Check which users have customer profiles but no customer records
for user in users:
    customer_profile = UserProfile.objects.filter(
        user=user,
        profile_type='customer',
        status='active'
    ).first()
    
    if customer_profile:
        # Check if they have a customer record for their organization
        org = customer_profile.organization
        customer_record = Customer.objects.filter(
            user=user,
            organization=org
        ).first()
        
        status_icon = "✅" if customer_record else "❌"
        print(f"\n{status_icon} User: {user.email}")
        print(f"   Organization: {org.name if org else 'None'}")
        print(f"   Customer Profile: Yes")
        print(f"   Customer Record: {'Yes' if customer_record else 'NO - THIS IS THE PROBLEM!'}")

print("\n" + "=" * 70)
print("🎯 ISSUE IDENTIFIED:")
print("   Users have customer PROFILES but no customer RECORDS")
print("   The client_issues.py endpoint tries to create the record,")
print("   but it may be failing in the transaction.")
