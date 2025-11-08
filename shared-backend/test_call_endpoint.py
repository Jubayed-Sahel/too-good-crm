"""
Test the initiate_call endpoint directly
"""
import requests
import os
from dotenv import load_dotenv

# Load environment
load_dotenv('d:\\Projects\\too-good-crm\\shared-backend\\.env')

# Get a valid auth token
# First, let's try to get customer ID
print("Testing Twilio Call Endpoint")
print("=" * 60)

# You'll need to add a valid token here
# Get it from the browser: Application -> Local Storage -> token
TOKEN = "YOUR_TOKEN_HERE"  # Replace with actual token from browser

# Or login to get token
login_url = "http://127.0.0.1:8000/api/auth/login/"
login_data = {
    "username": "admin",  # Replace with your username
    "password": "admin"   # Replace with your password
}

print("\n1. Logging in...")
try:
    response = requests.post(login_url, json=login_data)
    if response.status_code == 200:
        token = response.json().get('token')
        print(f"   ✓ Login successful! Token: {token[:20]}...")
    else:
        print(f"   ✗ Login failed: {response.status_code}")
        print(f"   Response: {response.text}")
        exit(1)
except Exception as e:
    print(f"   ✗ Error: {e}")
    exit(1)

# Get customers
print("\n2. Getting customers...")
headers = {"Authorization": f"Token {token}"}
customers_url = "http://127.0.0.1:8000/api/customers/"

try:
    response = requests.get(customers_url, headers=headers)
    if response.status_code == 200:
        data = response.json()
        customers = data.get('results', [])
        print(f"   ✓ Found {len(customers)} customers")
        
        # Find customer with phone
        customer_with_phone = None
        for c in customers:
            if c.get('phone'):
                customer_with_phone = c
                break
        
        if customer_with_phone:
            print(f"   ✓ Customer with phone: {customer_with_phone['name']} ({customer_with_phone['phone']})")
            customer_id = customer_with_phone['id']
        else:
            print("   ✗ No customer with phone number found")
            exit(1)
    else:
        print(f"   ✗ Failed: {response.status_code}")
        print(f"   Response: {response.text}")
        exit(1)
except Exception as e:
    print(f"   ✗ Error: {e}")
    exit(1)

# Test initiate_call endpoint
print(f"\n3. Initiating call to customer ID {customer_id}...")
call_url = f"http://127.0.0.1:8000/api/customers/{customer_id}/initiate_call/"

try:
    response = requests.post(call_url, headers=headers)
    print(f"   Status Code: {response.status_code}")
    print(f"   Response Headers: {dict(response.headers)}")
    print(f"   Response Body:")
    
    try:
        print(f"   {response.json()}")
    except:
        print(f"   {response.text}")
    
    if response.status_code == 201:
        print("\n   ✓ SUCCESS! Call initiated")
    elif response.status_code == 400:
        print("\n   ⚠ BAD REQUEST - Check error message above")
    else:
        print(f"\n   ✗ FAILED with status {response.status_code}")
        
except Exception as e:
    print(f"   ✗ Error: {e}")
    import traceback
    traceback.print_exc()

print("\n" + "=" * 60)
