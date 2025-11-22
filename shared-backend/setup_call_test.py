#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from crmApp.models import User, UserProfile, Customer, Organization

# Find a vendor user (someone who can see customers)
owner_profile = UserProfile.objects.filter(profile_type='vendor').first()

if owner_profile:
    owner_user = owner_profile.user
    owner_org = owner_profile.organization
    
    print('\n' + '='*70)
    print('📞 VENDOR/OWNER ACCOUNT (CALLER)')
    print('='*70)
    print(f'Username:     {owner_user.username}')
    print(f'Password:     password123')
    print(f'Full Name:    {owner_user.full_name}')
    print(f'User ID:      {owner_user.id}')
    print(f'Profile Type: {owner_profile.profile_type}')
    print(f'Is Owner:     {owner_profile.is_owner}')
    org_name = owner_org.name if owner_org else "None"
    print(f'Organization: {org_name}')
    
    # Find a customer user
    customer_profile = UserProfile.objects.filter(profile_type='customer').first()
    if customer_profile:
        customer_user = customer_profile.user
        customer_org = customer_profile.organization
        
        print('\n' + '='*70)
        print('👤 CUSTOMER ACCOUNT (RECIPIENT)')
        print('='*70)
        print(f'Username:     {customer_user.username}')
        print(f'Password:     password123')
        print(f'Full Name:    {customer_user.full_name}')
        print(f'User ID:      {customer_user.id}')
        cust_org_name = customer_org.name if customer_org else "None"
        print(f'Organization: {cust_org_name}')
        
        # Check if customer exists in vendor's customer list
        if owner_org:
            customer_record = Customer.objects.filter(
                organization=owner_org,
                user=customer_user
            ).first()
            
            print('\n' + '='*70)
            print('🔗 CUSTOMER RELATIONSHIP')
            print('='*70)
            
            if customer_record:
                print(f'✓ {customer_user.full_name} is in {owner_user.full_name} customers list')
                print(f'  Customer Record ID: {customer_record.id}')
                print(f'  Status: {customer_record.status}')
            else:
                # Create customer record
                customer_record = Customer.objects.create(
                    organization=owner_org,
                    name=customer_user.full_name,
                    user=customer_user,
                    email=customer_user.email,
                    phone='',
                    status='active',
                    source='referral'
                )
                print(f'✓ Added {customer_user.full_name} to {owner_user.full_name} customers list')
                print(f'  Customer Record ID: {customer_record.id}')
                print(f'  Status: {customer_record.status}')
        
        print('\n' + '='*70)
        print('🧪 VIDEO CALL TEST INSTRUCTIONS')
        print('='*70)
        print('\n1. Make sure backend is running:')
        print('   cd shared-backend')
        print('   python manage.py runserver')
        print('')
        print('2. Open TWO browsers (or regular + incognito):')
        print('   → http://localhost:5173/')
        print('')
        print('3. Login to both accounts:')
        print(f'   Browser 1 (Vendor): {owner_user.username} / password123')
        print(f'   Browser 2 (Customer): {customer_user.username} / password123')
        print('')
        print('4. Initiate the call from Browser 1 (Vendor):')
        print('   → Click "Customers" in the sidebar')
        print(f'   → Find "{customer_user.full_name}" in the customer list')
        print('   → Click the phone icon 📞 next to their name')
        print('   → Call should be initiated')
        print('')
        print('5. Answer the call in Browser 2 (Customer):')
        print('   → Wait for incoming call notification (toast popup)')
        print('   → Click "Answer" button')
        print('   → Video call window should appear for both users')
        print('')
        print('6. Test the call:')
        print('   → Both should see video interface')
        print('   → Test mute/unmute')
        print('   → Test video on/off')
        print('   → Click "End Call" to finish')
        print('')
        print('='*70)
else:
    print('ERROR: No owner/vendor profile found!')
