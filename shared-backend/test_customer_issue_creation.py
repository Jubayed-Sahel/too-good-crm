import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from django.contrib.auth import get_user_model
from rest_framework.test import APIRequestFactory, force_authenticate
from crmApp.views.client_issues import ClientRaiseIssueView
from crmApp.models import Organization, UserProfile, Customer, Issue

User = get_user_model()

print("🧪 Testing Customer Issue Creation Fix")
print("=" * 70)

# Get a test user (or create one)
try:
    test_user = User.objects.filter(email='testuser@example.com').first()
    if not test_user:
        print("❌ Test user not found. Please register a user first.")
        exit(1)
    
    print(f"✅ Test User: {test_user.email}")
    
    # Get their customer profile
    customer_profile = UserProfile.objects.filter(
        user=test_user,
        profile_type='customer',
        status='active'
    ).first()
    
    if not customer_profile:
        print("❌ No customer profile found for test user")
        exit(1)
    
    print(f"✅ Customer Profile: Organization = {customer_profile.organization.name}")
    
    # Check if customer record exists
    organization = customer_profile.organization
    customer_record = Customer.objects.filter(
        user=test_user,
        organization=organization
    ).first()
    
    print(f"{'✅' if customer_record else '⚠️'} Customer Record: {'Exists' if customer_record else 'Will be auto-created'}")
    
    # Simulate API request
    print("\n📤 Simulating Issue Creation Request...")
    factory = APIRequestFactory()
    
    request_data = {
        'organization': organization.id,
        'title': 'Test Issue - Customer Portal',
        'description': 'This is a test issue raised from customer portal',
        'priority': 'medium',
        'category': 'general'
    }
    
    request = factory.post('/api/client/issues/raise/', data=request_data, format='json')
    force_authenticate(request, user=test_user)
    
    # Call the view
    view = ClientRaiseIssueView.as_view()
    response = view(request)
    
    print(f"\n📥 Response Status: {response.status_code}")
    
    if response.status_code == 201:
        print("✅ SUCCESS! Issue created successfully")
        response_data = response.data
        print(f"\n📋 Issue Details:")
        print(f"   Issue Number: {response_data['issue']['issue_number']}")
        print(f"   Title: {response_data['issue']['title']}")
        print(f"   Status: {response_data['issue']['status']}")
        print(f"   Priority: {response_data['issue']['priority']}")
        print(f"   Linear Synced: {response_data['issue'].get('synced_to_linear', False)}")
        
        # Verify customer record was created
        customer_record_after = Customer.objects.filter(
            user=test_user,
            organization=organization
        ).first()
        
        if customer_record_after:
            print(f"\n✅ Customer Record: Auto-created/verified")
            print(f"   Name: {customer_record_after.name}")
            print(f"   Email: {customer_record_after.email}")
        
    else:
        print(f"❌ FAILED! Status: {response.status_code}")
        print(f"   Error: {response.data}")
    
    print("\n" + "=" * 70)
    print("🎯 RESULT: Issue creation endpoint is " + ("WORKING ✅" if response.status_code == 201 else "BROKEN ❌"))
    print("=" * 70)
    
except Exception as e:
    print(f"\n❌ ERROR: {str(e)}")
    import traceback
    traceback.print_exc()
