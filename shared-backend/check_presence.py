"""
Check UserPresence records
"""
import requests

BASE_URL = 'http://127.0.0.1:8000/api'

# Login as customer
customer_login = requests.post(
    f'{BASE_URL}/auth/login/',
    json={'username': 'client_demo', 'password': 'demo123'}
)

customer_data = customer_login.json()
customer_token = customer_data['token']
customer_user_id = customer_data['user']['id']

print(f'Customer user_id: {customer_user_id}')
print(f'\nChecking customer presence...')

# Check presence directly
customer_headers = {'Authorization': f'Token {customer_token}'}
presence_response = requests.get(
    f'{BASE_URL}/user-presence/',
    headers=customer_headers
)

if presence_response.status_code == 200:
    presences = presence_response.json()
    if isinstance(presences, dict) and 'results' in presences:
        presences = presences['results']
    print(f'Found {len(presences)} presence records')
    for p in presences:
        if p['user'] == customer_user_id:
            print(f'\n✅ Customer presence found:')
            print(f'   User ID: {p["user"]}')
            print(f'   Status: {p["status"]}')
            print(f'   Current Call: {p.get("current_call")}')
            print(f'   Available: {p["available_for_calls"]}')
