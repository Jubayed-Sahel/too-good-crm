"""
Quick Linear Integration Test
Just tests if the endpoints are accessible
"""

import requests

print("Testing Linear Integration Endpoints...")
print("="*60)

# Test 1: Check if server is running
try:
    response = requests.get("http://localhost:8000/api/issues/stats/", timeout=2)
    print(f"✅ Server is running! Status: {response.status_code}")
except Exception as e:
    print(f"❌ Server not running: {str(e)}")
    print("\nPlease start the server first:")
    print("  cd C:\\Users\\User\\Desktop\\p\\too-good-crm\\shared-backend")
    print("  python manage.py runserver 0.0.0.0:8000")
    exit(1)

# Test 2: Login
print("\n" + "="*60)
print("Logging in...")
try:
    response = requests.post(
        "http://localhost:8000/api/auth/login/",
        json={"username": "admin@crm.com", "password": "admin123"}
    )
    if response.status_code == 200:
        token = response.json().get('token')
        print(f"✅ Login successful! Token: {token[:20]}...")
    else:
        print(f"❌ Login failed: {response.json()}")
        exit(1)
except Exception as e:
    print(f"❌ Login error: {str(e)}")
    exit(1)

# Test 3: Create issue with Linear sync
print("\n" + "="*60)
print("Creating issue with Linear sync...")
headers = {
    "Authorization": f"Token {token}",
    "Content-Type": "application/json"
}

data = {
    "title": "Test Linear Integration",
    "description": "Testing automatic sync to Linear",
    "priority": "high",
    "category": "technical",
    "auto_sync_linear": True,
    "linear_team_id": "b95250db-8430-4dbc-88f8-9fc109369df0"
}

try:
    url = "http://localhost:8000/api/issues/raise/"
    print(f"URL: {url}")
    print(f"Data: {data}")
    
    response = requests.post(url, json=data, headers=headers)
    print(f"Status: {response.status_code}")
    print(f"Response Headers: {dict(response.headers)}")
    
    if response.status_code == 201:
        result = response.json()
        print(f"\n🎉 SUCCESS!")
        print(f"   Issue: {result['issue']['issue_number']}")
        print(f"   Status: {result['issue']['status']}")
        print(f"   Message: {result.get('message', 'Issue created')}")
        
        if result['issue'].get('synced_to_linear'):
            print(f"\n✅ SYNCED TO LINEAR!")
            print(f"   Linear URL: {result['issue']['linear_issue_url']}")
            print(f"\n   🔗 View in Linear: {result['issue']['linear_issue_url']}")
        else:
            print(f"\n⚠️  Not synced to Linear (auto_sync was disabled or failed)")
            
        print(f"\nFull response:")
        import json
        print(json.dumps(result, indent=2))
    else:
        print(f"❌ Error: {response.json()}")
        
except Exception as e:
    print(f"❌ Exception: {str(e)}")

print("\n" + "="*60)
print("Test complete!")
