import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from crmApp.serializers import UserCreateSerializer

# Create a test user with all profiles
print("Creating test user...")
print("=" * 60)

serializer = UserCreateSerializer(data={
    'username': 'testuser',
    'email': 'testuser@example.com',
    'password': 'test123456',
    'password_confirm': 'test123456',
    'first_name': 'Test',
    'last_name': 'User',
    'organization_name': 'Test Organization'
})

if serializer.is_valid():
    user = serializer.save()
    print(f"✅ User created successfully!")
    print(f"   Username: {user.username}")
    print(f"   Email: {user.email}")
    print(f"   Password: test123456")
    print(f"\nProfiles created:")
    for profile in user.user_profiles.all():
        print(f"   - {profile.profile_type}: primary={profile.is_primary}, status={profile.status}, org={profile.organization.name}")
else:
    print(f"❌ Error creating user: {serializer.errors}")

print("=" * 60)
