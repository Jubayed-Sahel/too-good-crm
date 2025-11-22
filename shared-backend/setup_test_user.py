#!/usr/bin/env python
"""Setup test user with profile"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from crmApp.models import User, Organization, UserProfile

def setup_test_user():
    # Get or create test user
    user, user_created = User.objects.get_or_create(
        username='testuser',
        defaults={
            'email': 'test@test.com',
            'first_name': 'Test',
            'last_name': 'User'
        }
    )
    
    if user_created:
        user.set_password('test123')
        user.save()
        print(f"Created user: {user.username}")
    else:
        # Ensure password is set
        user.set_password('test123')
        user.save()
        print(f"User exists: {user.username}")
    
    # Check profiles
    profiles = user.user_profiles.all()
    print(f"User has {profiles.count()} profile(s)")
    
    if profiles.count() == 0:
        print("No profiles found. Creating employee profile...")
        
        # Get or create organization
        org = Organization.objects.first()
        if not org:
            org = Organization.objects.create(
                name="Test Company",
                email="info@testcompany.com",
                phone="+1234567890"
            )
            print(f"Created organization: {org.name}")
        else:
            print(f"Using existing organization: {org.name}")
        
        # Create employee profile
        profile = UserProfile.objects.create(
            user=user,
            organization=org,
            profile_type='employee',
            is_primary=True
        )
        print(f"Created employee profile for {user.username} at {org.name}")
    else:
        for profile in profiles:
            org_name = profile.organization.name if profile.organization else "No Org"
            primary = " (PRIMARY)" if profile.is_primary else ""
            print(f"  - {profile.profile_type} at {org_name}{primary}")
    
    print("\n" + "="*50)
    print("Test User Credentials:")
    print("="*50)
    print(f"Username: {user.username}")
    print(f"Password: test123")
    print(f"Email: {user.email}")
    print("="*50)
    print("\nYou can now login to the Android app!")

if __name__ == '__main__':
    setup_test_user()

