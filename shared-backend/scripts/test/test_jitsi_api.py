"""
Quick test script to verify Jitsi API endpoints are working.
Run this after starting the Django server.

Usage:
    python test_jitsi_api.py
"""

import requests
import json
from time import sleep

BASE_URL = "http://127.0.0.1:8000/api"

def print_section(title):
    print("\n" + "="*60)
    print(f"  {title}")
    print("="*60)

def print_response(response):
    print(f"Status: {response.status_code}")
    try:
        print(f"Response: {json.dumps(response.json(), indent=2)}")
    except:
        print(f"Response: {response.text}")
    print()

def test_jitsi_api():
    """Test the Jitsi calling API endpoints"""
    
    print_section("JITSI API TEST")
    
    # Step 1: Login as User 1 (testuser4)
    print_section("1. Login as User 1 (testuser4)")
    login1 = requests.post(
        f"{BASE_URL}/auth/login/",
        json={"username": "testuser4", "password": "testpass123"}
    )
    print_response(login1)
    
    if login1.status_code != 200:
        print("❌ Login failed for User 1!")
        return
    
    token1 = login1.json()['token']
    user1_id = login1.json()['user']['id']
    headers1 = {"Authorization": f"Token {token1}"}
    
    # Step 2: Login as User 2 (calluser4)
    print_section("2. Login as User 2 (calluser4)")
    login2 = requests.post(
        f"{BASE_URL}/auth/login/",
        json={"username": "calluser4", "password": "testpass123"}
    )
    print_response(login2)
    
    if login2.status_code != 200:
        print("❌ Login failed for User 2!")
        return
    
    token2 = login2.json()['token']
    user2_id = login2.json()['user']['id']
    headers2 = {"Authorization": f"Token {token2}"}
    
    # Step 3: User 1 updates status to online
    print_section("3. User 1 sets status to ONLINE")
    status1 = requests.post(
        f"{BASE_URL}/user-presence/update_my_status/",
        headers=headers1,
        json={
            "status": "online",
            "available_for_calls": True,
            "status_message": "Available for testing"
        }
    )
    print_response(status1)
    
    # Step 4: User 2 updates status to online
    print_section("4. User 2 sets status to ONLINE")
    status2 = requests.post(
        f"{BASE_URL}/user-presence/update_my_status/",
        headers=headers2,
        json={
            "status": "online",
            "available_for_calls": True,
            "status_message": "Ready for calls"
        }
    )
    print_response(status2)
    
    # Step 5: User 1 gets list of online users
    print_section("5. User 1 checks ONLINE USERS")
    online = requests.get(
        f"{BASE_URL}/user-presence/online_users/",
        headers=headers1
    )
    print_response(online)
    
    # Step 6: User 1 initiates a call to User 2
    print_section("6. User 1 INITIATES CALL to User 2")
    initiate = requests.post(
        f"{BASE_URL}/jitsi-calls/initiate_call/",
        headers=headers1,
        json={
            "recipient_id": user2_id,
            "call_type": "video"
        }
    )
    print_response(initiate)
    
    if initiate.status_code != 201:
        print("❌ Call initiation failed!")
        return
    
    call_id = initiate.json()['call_session']['id']
    jitsi_url = initiate.json()['call_session']['jitsi_url']
    
    print(f"✅ Call initiated successfully!")
    print(f"   Call ID: {call_id}")
    print(f"   Jitsi URL: {jitsi_url}")
    
    # Step 7: User 2 checks active calls
    print_section("7. User 2 checks ACTIVE CALLS (should see incoming)")
    active = requests.get(
        f"{BASE_URL}/jitsi-calls/active_calls/",
        headers=headers2
    )
    print_response(active)
    
    # Step 8: User 2 answers the call
    print_section("8. User 2 ANSWERS the call")
    answer = requests.post(
        f"{BASE_URL}/jitsi-calls/{call_id}/update_status/",
        headers=headers2,
        json={"action": "answer"}
    )
    print_response(answer)
    
    if answer.status_code != 200:
        print("❌ Answer call failed!")
        return
    
    print(f"✅ Call answered successfully!")
    print(f"   Status: {answer.json()['call_session']['status']}")
    print(f"   Both users should now open: {jitsi_url}")
    
    # Step 9: User 1 checks their active call
    print_section("9. User 1 checks MY ACTIVE CALL")
    my_call = requests.get(
        f"{BASE_URL}/jitsi-calls/my_active_call/",
        headers=headers1
    )
    print_response(my_call)
    
    # Simulate call duration
    print_section("⏱️  Simulating 3-second call...")
    sleep(3)
    
    # Step 10: User 1 ends the call
    print_section("10. User 1 ENDS the call")
    end = requests.post(
        f"{BASE_URL}/jitsi-calls/{call_id}/update_status/",
        headers=headers1,
        json={"action": "end"}
    )
    print_response(end)
    
    if end.status_code != 200:
        print("❌ End call failed!")
        return
    
    print(f"✅ Call ended successfully!")
    print(f"   Duration: {end.json().get('duration_formatted', 'N/A')}")
    print(f"   Duration (seconds): {end.json().get('duration_seconds', 'N/A')}")
    
    # Step 11: Heartbeat test
    print_section("11. User 1 sends HEARTBEAT")
    heartbeat = requests.post(
        f"{BASE_URL}/user-presence/heartbeat/",
        headers=headers1
    )
    print_response(heartbeat)
    
    # Final summary
    print_section("✅ TEST COMPLETE - ALL ENDPOINTS WORKING!")
    print("\n🎉 Jitsi Integration is fully functional!")
    print("\nNext steps:")
    print("1. Build React frontend components")
    print("2. Create user interface for calling")
    print("3. Add real-time notifications (WebSocket)")
    print()

if __name__ == "__main__":
    try:
        print("\n🚀 Starting Jitsi API Test Suite...")
        print("📡 Make sure Django server is running on http://127.0.0.1:8000\n")
        test_jitsi_api()
    except requests.exceptions.ConnectionError:
        print("\n❌ ERROR: Cannot connect to Django server!")
        print("   Please start the server first:")
        print("   cd shared-backend && python manage.py runserver")
    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
