import os
import sys
import django

# Change to the shared-backend directory
os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from crmApp.models import User, Organization, UserProfile

# Update admin@test.com password
try:
    admin_user = User.objects.get(email='admin@test.com')
    admin_user.set_password('admin123')
    admin_user.save()
    print(f"✅ Updated password for {admin_user.email}")
    
    # Ensure user has a profile
    org = Organization.objects.first()
    if org:
        profile, created = UserProfile.objects.get_or_create(
            user=admin_user,
            organization=org,
            defaults={
                'profile_type': 'vendor',
                'is_primary': True,
                'status': 'active'
            }
        )
        print(f"✅ Profile {'created' if created else 'exists'}: {profile.profile_type}")
    
    print(f"\n✅ Login credentials:")
    print(f"  Email: {admin_user.email}")
    print(f"  Password: admin123")
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()

