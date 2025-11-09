import requests
import json

# API base URL
BASE_URL = 'http://127.0.0.1:8000/api'

# Login as vendor
print('🔐 Logging in as vendor_demo...')
login_response = requests.post(
    f'{BASE_URL}/auth/login/',
    json={
        'username': 'vendor_demo',
        'password': 'demo123'
    }
)

if login_response.status_code == 200:
    login_data = login_response.json()
    token = login_data['token']
    user = login_data['user']
    
    print(f'✅ Logged in as: {user["username"]} ({user["email"]})')
    print(f'   User ID: {user["id"]}')
    print(f'   Profiles: {len(user["profiles"])}')
    
    for profile in user['profiles']:
        print(f'     - {profile["profile_type"]} in {profile["organization_name"]} (Org ID: {profile["organization"]})')
    
    # Get customers
    print('\n📋 Fetching customers...')
    headers = {
        'Authorization': f'Token {token}'
    }
    
    customers_response = requests.get(
        f'{BASE_URL}/customers/',
        headers=headers
    )
    
    if customers_response.status_code == 200:
        customers_data = customers_response.json()
        
        if 'results' in customers_data:
            customers = customers_data['results']
        else:
            customers = customers_data
        
        print(f'✅ Found {len(customers)} customer(s):')
        
        if len(customers) == 0:
            print('   ⚠️  No customers found!')
            print('\n   This might be because:')
            print('   1. The customer is in a different organization')
            print('   2. The queryset filter is not working correctly')
        else:
            for customer in customers:
                print(f'\n   Customer ID: {customer.get("id")}')
                print(f'   Name: {customer.get("name") or customer.get("full_name")}')
                print(f'   Email: {customer.get("email")}')
                print(f'   Organization ID: {customer.get("organization")}')
                print(f'   Status: {customer.get("status")}')
    else:
        print(f'❌ Failed to get customers: {customers_response.status_code}')
        print(customers_response.text)
else:
    print(f'❌ Login failed: {login_response.status_code}')
    print(login_response.text)
