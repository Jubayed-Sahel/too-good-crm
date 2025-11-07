#!/usr/bin/env python
"""
Script to test role switching functionality
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from crmApp.models import User, UserProfile

def test_role_switch():
    """Test the role switching logic"""
    
    # Get the user
    user = User.objects.filter(email='employee@test.com').first()
    if not user:
        print("❌ User employee@test.com not found!")
        return
    
    print(f"✓ Found user: {user.email}")
    print("\nCurrent profiles:")
    
    profiles = UserProfile.objects.filter(user=user).order_by('id')
    for profile in profiles:
        primary = "⭐ PRIMARY" if profile.is_primary else ""
        print(f"  {profile.id}. {profile.profile_type.upper()}: {profile.organization.name} {primary}")
    
    # Simulate switching to vendor profile
    vendor_profile = profiles.filter(profile_type='vendor').first()
    if not vendor_profile:
        print("\n❌ No vendor profile found!")
        return
    
    print(f"\n🔄 Simulating switch to VENDOR profile (ID: {vendor_profile.id})...")
    
    # Update all profiles to not be primary
    profiles.update(is_primary=False)
    
    # Set selected profile as primary
    vendor_profile.is_primary = True
    vendor_profile.save()
    
    print("\n✅ After switch:")
    profiles = UserProfile.objects.filter(user=user).order_by('id')
    for profile in profiles:
        primary = "⭐ PRIMARY" if profile.is_primary else ""
        print(f"  {profile.id}. {profile.profile_type.upper()}: {profile.organization.name} {primary}")

if __name__ == '__main__':
    try:
        test_role_switch()
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
