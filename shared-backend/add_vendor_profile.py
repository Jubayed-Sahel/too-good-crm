#!/usr/bin/env python
"""
Script to add missing vendor profile to existing users
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from crmApp.models import User, UserProfile, Organization
from django.utils import timezone

def add_vendor_profile():
    """Add vendor profile to employee@test.com user"""
    
    # Get the user
    user = User.objects.filter(email='employee@test.com').first()
    if not user:
        print("❌ User employee@test.com not found!")
        return
    
    print(f"✓ Found user: {user.email}")
    
    # Get their organization from existing profile
    existing_profile = UserProfile.objects.filter(user=user).first()
    if not existing_profile:
        print("❌ No profiles found for user!")
        return
    
    organization = existing_profile.organization
    print(f"✓ Organization: {organization.name}")
    
    # Check if vendor profile already exists
    vendor_profile = UserProfile.objects.filter(
        user=user,
        organization=organization,
        profile_type='vendor'
    ).first()
    
    if vendor_profile:
        print(f"✓ Vendor profile already exists (ID: {vendor_profile.id})")
        return
    
    # Create vendor profile
    vendor_profile = UserProfile.objects.create(
        user=user,
        organization=organization,
        profile_type='vendor',
        is_primary=False,  # Keep employee as primary
        status='active',
        activated_at=timezone.now()
    )
    
    print(f"✓ Created vendor profile (ID: {vendor_profile.id})")
    print("\n" + "="*50)
    print("✅ Vendor profile added successfully!")
    print("="*50)
    
    # Show all profiles
    print("\nUser now has the following profiles:")
    all_profiles = UserProfile.objects.filter(user=user)
    for profile in all_profiles:
        primary = "PRIMARY" if profile.is_primary else ""
        print(f"  - {profile.profile_type.upper()}: {organization.name} (ID: {profile.id}) {primary}")

if __name__ == '__main__':
    try:
        add_vendor_profile()
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        sys.exit(1)
