"""
Test customer creation via API to verify audit logging
"""
import requests
import json

# Test credentials - adjust based on your setup
API_BASE = "http://127.0.0.1:8000"
LOGIN_URL = f"{API_BASE}/api/auth/login/"
CUSTOMER_URL = f"{API_BASE}/api/customers/"
AUDIT_LOGS_URL = f"{API_BASE}/api/audit-logs/"

print("=" * 80)
print("API CUSTOMER CREATION TEST")
print("=" * 80)

# Step 1: Login
print("\n1. Logging in...")
login_data = {
    "username": "one1",  # Adjust to your test user
    "password": "rootroot"
}

try:
    login_response = requests.post(LOGIN_URL, json=login_data)
    if login_response.status_code == 200:
        token = login_response.json().get('token')
        print(f"✅ Login successful, got token")
        
        headers = {
            "Authorization": f"Token {token}",
            "Content-Type": "application/json"
        }
        
        # Step 2: Get current audit log count
        print("\n2. Getting current audit log count...")
        audit_response = requests.get(AUDIT_LOGS_URL, headers=headers)
        if audit_response.status_code == 200:
            before_count = audit_response.json().get('count', 0)
            print(f"   Audit logs before: {before_count}")
        else:
            print(f"   ⚠️  Could not get audit logs: {audit_response.status_code}")
            before_count = 0
        
        # Step 3: Create a customer
        print("\n3. Creating a new customer...")
        import time
        timestamp = int(time.time())
        customer_data = {
            "name": f"API Test Customer {timestamp}",
            "email": f"apitest{timestamp}@example.com",
            "phone": "123-456-7890",
            "status": "active"
        }
        
        create_response = requests.post(CUSTOMER_URL, json=customer_data, headers=headers)
        if create_response.status_code == 201:
            customer = create_response.json()
            print(f"✅ Customer created: {customer.get('name')} (ID: {customer.get('id')})")
            customer_id = customer.get('id')
            
            # Step 4: Check audit logs again
            print("\n4. Checking audit logs after creation...")
            time.sleep(1)  # Wait a moment for signal to process
            
            audit_response = requests.get(AUDIT_LOGS_URL, headers=headers)
            if audit_response.status_code == 200:
                after_count = audit_response.json().get('count', 0)
                print(f"   Audit logs after: {after_count}")
                print(f"   New logs created: {after_count - before_count}")
                
                # Get recent logs
                recent_response = requests.get(f"{AUDIT_LOGS_URL}recent/", headers=headers)
                if recent_response.status_code == 200:
                    recent_logs = recent_response.json()
                    print(f"\n   Recent audit logs:")
                    for log in recent_logs[:5]:
                        print(f"   - {log['user_email']} {log['action_display']} {log['resource_type_display']}: {log['resource_name']}")
                        if log['resource_id'] == customer_id:
                            print(f"     ✅ FOUND LOG FOR NEW CUSTOMER!")
            else:
                print(f"   ❌ Could not get audit logs: {audit_response.status_code}")
        else:
            print(f"❌ Customer creation failed: {create_response.status_code}")
            print(f"   Response: {create_response.text}")
    else:
        print(f"❌ Login failed: {login_response.status_code}")
        print(f"   Response: {login_response.text}")

except requests.exceptions.ConnectionError:
    print("\n❌ Connection Error!")
    print("   Make sure Django server is running:")
    print("   → python manage.py runserver")
    
except Exception as e:
    print(f"\n❌ Error: {e}")

print("\n" + "=" * 80)

