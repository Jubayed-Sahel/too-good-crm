"""
Test the complete call flow from vendor to customer
"""
import requests
import json
import time

BASE_URL = 'http://127.0.0.1:8000/api'

def test_call_flow():
    print('=' * 70)
    print('TESTING COMPLETE CALL FLOW: Vendor → Customer')
    print('=' * 70)
    
    # Step 1: Login as vendor
    print('\n1️⃣  Logging in as vendor_demo...')
    vendor_login = requests.post(
        f'{BASE_URL}/auth/login/',
        json={'username': 'vendor_demo', 'password': 'demo123'}
    )
    
    if vendor_login.status_code != 200:
        print(f'❌ Vendor login failed: {vendor_login.status_code}')
        return
    
    vendor_data = vendor_login.json()
    vendor_token = vendor_data['token']
    vendor_user_id = vendor_data['user']['id']
    print(f'✅ Vendor logged in: user_id={vendor_user_id}')
    
    # Step 2: Login as customer
    print('\n2️⃣  Logging in as client_demo...')
    customer_login = requests.post(
        f'{BASE_URL}/auth/login/',
        json={'username': 'client_demo', 'password': 'demo123'}
    )
    
    if customer_login.status_code != 200:
        print(f'❌ Customer login failed: {customer_login.status_code}')
        return
    
    customer_data = customer_login.json()
    customer_token = customer_data['token']
    customer_user_id = customer_data['user']['id']
    print(f'✅ Customer logged in: user_id={customer_user_id}')
    
    # Step 3: Vendor initiates call
    print(f'\n3️⃣  Vendor initiating audio call to customer...')
    vendor_headers = {'Authorization': f'Token {vendor_token}'}
    
    initiate_response = requests.post(
        f'{BASE_URL}/jitsi-calls/initiate_call/',
        headers=vendor_headers,
        json={
            'recipient_id': customer_user_id,
            'call_type': 'audio'
        }
    )
    
    if initiate_response.status_code not in [200, 201]:
        print(f'❌ Call initiation failed: {initiate_response.status_code}')
        print(f'Response: {initiate_response.text}')
        return
    
    call_data = initiate_response.json()
    call_session = call_data['call_session']
    
    print(f'✅ Call initiated successfully!')
    print(f'   Call ID: {call_session["id"]}')
    print(f'   Session ID: {call_session["session_id"]}')
    print(f'   Room: {call_session["room_name"]}')
    print(f'   Status: {call_session["status"]}')
    print(f'   Initiator: {call_session["initiator"]} (vendor)')
    print(f'   Recipient: {call_session["recipient"]} (customer)')
    print(f'   Jitsi URL: {call_session["jitsi_url"]}')
    
    # Step 4: Check if customer can see the incoming call
    print(f'\n4️⃣  Checking customer\'s active call (simulating polling)...')
    customer_headers = {'Authorization': f'Token {customer_token}'}
    
    my_call_response = requests.get(
        f'{BASE_URL}/jitsi-calls/my_active_call/',
        headers=customer_headers
    )
    
    if my_call_response.status_code == 200:
        customer_call = my_call_response.json()
        print(f'✅ Customer CAN see incoming call!')
        print(f'   Call ID: {customer_call["id"]}')
        print(f'   Status: {customer_call["status"]}')
        print(f'   Initiator: {customer_call["initiator_name"]}')
        print(f'   Should show popup: {customer_call["status"] == "pending" and customer_call["recipient"] == customer_user_id}')
    elif my_call_response.status_code == 404:
        print(f'❌ Customer CANNOT see the call (404 - No active call)')
        print(f'   This means the call was not created properly or is not visible to the customer')
    else:
        print(f'❌ Error checking customer call: {my_call_response.status_code}')
        print(f'   Response: {my_call_response.text}')
    
    # Step 5: Get all active calls
    print(f'\n5️⃣  Checking all active calls in the system...')
    active_calls_response = requests.get(
        f'{BASE_URL}/jitsi-calls/active_calls/',
        headers=vendor_headers
    )
    
    if active_calls_response.status_code == 200:
        active_calls = active_calls_response.json()
        print(f'✅ Found {len(active_calls)} active call(s) in system')
        for call in active_calls:
            print(f'   - Call {call["id"]}: {call["initiator_name"]} → {call["recipient_name"]} ({call["status"]})')
    
    # Step 6: Check customer's presence status
    print(f'\n6️⃣  Checking customer\'s presence/online status...')
    online_users_response = requests.get(
        f'{BASE_URL}/user-presence/online_users/',
        headers=vendor_headers
    )
    
    if online_users_response.status_code == 200:
        online_users = online_users_response.json()
        print(f'✅ Found {len(online_users)} online user(s)')
        for user in online_users:
            user_type = "CUSTOMER" if user['user_id'] == customer_user_id else "VENDOR" if user['user_id'] == vendor_user_id else "OTHER"
            print(f'   - User {user["user_id"]} ({user_type}): {user["status"]} - Available: {user["available_for_calls"]}')
    
    print('\n' + '=' * 70)
    print('SUMMARY')
    print('=' * 70)
    print(f'Call Status: {call_session["status"]}')
    print(f'Expected: Customer browser should poll /jitsi/my-active-call/')
    print(f'Expected: Should receive call with status="pending"')
    print(f'Expected: JitsiCallManager should show incoming call popup')
    print('=' * 70)

if __name__ == '__main__':
    test_call_flow()
