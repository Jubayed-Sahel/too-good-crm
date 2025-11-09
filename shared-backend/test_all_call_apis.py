"""
Test all customer and vendor APIs to verify user_id is returned correctly
for Jitsi video call functionality
"""
import requests
import json

BASE_URL = 'http://127.0.0.1:8000/api'

def test_vendor_sees_customers():
    """Test that vendor can see customers with user_id"""
    print('=' * 60)
    print('TEST 1: Vendor sees customers')
    print('=' * 60)
    
    # Login as vendor
    print('\n🔐 Logging in as vendor_demo...')
    login_response = requests.post(
        f'{BASE_URL}/auth/login/',
        json={'username': 'vendor_demo', 'password': 'demo123'}
    )
    
    if login_response.status_code == 200:
        login_data = login_response.json()
        token = login_data['token']
        user = login_data['user']
        
        print(f'✅ Logged in as: {user["username"]} (User ID: {user["id"]})')
        
        # Get customers
        print('\n📋 Fetching customers...')
        headers = {'Authorization': f'Token {token}'}
        customers_response = requests.get(f'{BASE_URL}/customers/', headers=headers)
        
        if customers_response.status_code == 200:
            customers_data = customers_response.json()
            customers = customers_data.get('results', customers_data)
            
            print(f'✅ Found {len(customers)} customer(s)')
            
            for customer in customers:
                print(f'\n   📧 Customer: {customer.get("full_name") or customer.get("name")}')
                print(f'      Email: {customer.get("email")}')
                print(f'      User ID: {customer.get("user_id")} {"✅ CAN CALL" if customer.get("user_id") else "❌ NO CALL"}')
                
            return len(customers) > 0 and any(c.get("user_id") for c in customers)
        else:
            print(f'❌ Failed to fetch customers: {customers_response.status_code}')
            return False
    else:
        print(f'❌ Login failed: {login_response.status_code}')
        return False

def test_client_sees_vendors():
    """Test that client can see vendors with user_id"""
    print('\n' + '=' * 60)
    print('TEST 2: Client sees vendors')
    print('=' * 60)
    
    # Login as client
    print('\n🔐 Logging in as client_demo...')
    login_response = requests.post(
        f'{BASE_URL}/auth/login/',
        json={'username': 'client_demo', 'password': 'demo123'}
    )
    
    if login_response.status_code == 200:
        login_data = login_response.json()
        token = login_data['token']
        user = login_data['user']
        
        print(f'✅ Logged in as: {user["username"]} (User ID: {user["id"]})')
        
        # Get vendors
        print('\n📋 Fetching vendors...')
        headers = {'Authorization': f'Token {token}'}
        vendors_response = requests.get(f'{BASE_URL}/vendors/', headers=headers)
        
        if vendors_response.status_code == 200:
            vendors_data = vendors_response.json()
            vendors = vendors_data.get('results', vendors_data)
            
            print(f'✅ Found {len(vendors)} vendor(s)')
            
            for vendor in vendors:
                print(f'\n   🏢 Vendor: {vendor.get("name")}')
                print(f'      Email: {vendor.get("email")}')
                print(f'      User ID: {vendor.get("user_id")} {"✅ CAN CALL" if vendor.get("user_id") else "❌ NO CALL"}')
                
            return len(vendors) > 0 and any(v.get("user_id") for v in vendors)
        else:
            print(f'❌ Failed to fetch vendors: {vendors_response.status_code}')
            return False
    else:
        print(f'❌ Login failed: {login_response.status_code}')
        return False

if __name__ == '__main__':
    print('\n🧪 Testing Jitsi Call Integration - API Verification')
    print('=' * 60)
    
    test1_passed = test_vendor_sees_customers()
    test2_passed = test_client_sees_vendors()
    
    print('\n' + '=' * 60)
    print('📊 TEST SUMMARY')
    print('=' * 60)
    print(f'Vendor → Customer: {"✅ PASS" if test1_passed else "❌ FAIL"}')
    print(f'Client → Vendor:   {"✅ PASS" if test2_passed else "❌ FAIL"}')
    
    if test1_passed and test2_passed:
        print('\n🎉 All tests passed! Jitsi calling should work in both directions.')
        print('\n📝 Next steps:')
        print('   1. Refresh your browser (Ctrl+Shift+R)')
        print('   2. Login as vendor_demo to call customers')
        print('   3. Login as client_demo to call vendors')
    else:
        print('\n⚠️  Some tests failed. Please check the API responses above.')
