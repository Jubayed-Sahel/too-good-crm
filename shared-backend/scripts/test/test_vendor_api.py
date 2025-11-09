import requests

# Login as client
print('🔐 Logging in as client_demo...')
login_response = requests.post(
    'http://127.0.0.1:8000/api/auth/login/',
    json={
        'username': 'client_demo',
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
    
    # Get vendors
    print('\n📋 Fetching vendors...')
    headers = {
        'Authorization': f'Token {token}'
    }
    
    vendors_response = requests.get(
        'http://127.0.0.1:8000/api/vendors/',
        headers=headers
    )
    
    if vendors_response.status_code == 200:
        vendors_data = vendors_response.json()
        
        if 'results' in vendors_data:
            vendors = vendors_data['results']
        else:
            vendors = vendors_data
        
        print(f'✅ Found {len(vendors)} vendor(s):')
        
        if len(vendors) == 0:
            print('   ⚠️  No vendors found!')
        else:
            import json
            for vendor in vendors:
                print(f'\n   Vendor ID: {vendor.get("id")}')
                print(f'   Name: {vendor.get("name")}')
                print(f'   Email: {vendor.get("email")}')
                print(f'   User ID: {vendor.get("user_id")}')
                print(f'   Status: {vendor.get("status")}')
    else:
        print(f'❌ Failed to get vendors: {vendors_response.status_code}')
        print(vendors_response.text)
else:
    print(f'❌ Login failed: {login_response.status_code}')
    print(login_response.text)
