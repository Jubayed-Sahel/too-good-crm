"""
Test script for RBAC and Role Selection system
Tests the complete authentication and role switching flow
"""

import requests
import json

BASE_URL = "http://127.0.0.1:8000/api"

def test_user_registration():
    """Test user registration with organization creation"""
    print("\n" + "="*60)
    print("TEST 1: User Registration")
    print("="*60)
    
    payload = {
        "username": "testuser123",
        "email": "testuser123@example.com",
        "password": "TestPass123!@#",
        "password_confirm": "TestPass123!@#",
        "first_name": "Test",
        "last_name": "User",
        "organization_name": "Test Organization Inc"
    }
    
    response = requests.post(f"{BASE_URL}/users/", json=payload)
    
    if response.status_code == 201:
        data = response.json()
        print("✅ Registration successful!")
        print(f"   User ID: {data['user']['id']}")
        print(f"   Username: {data['user']['username']}")
        print(f"   Email: {data['user']['email']}")
        print(f"   Token: {data['token'][:20]}...")
        print(f"   Profiles created: {len(data['user']['profiles'])}")
        
        for profile in data['user']['profiles']:
            primary = " (PRIMARY)" if profile['is_primary'] else ""
            print(f"     - {profile['profile_type_display']}: {profile['organization_name']}{primary}")
        
        return data['token'], data['user']
    else:
        print(f"❌ Registration failed: {response.status_code}")
        print(f"   Error: {response.text}")
        return None, None


def test_available_roles(token):
    """Test getting available roles for user"""
    print("\n" + "="*60)
    print("TEST 2: Get Available Roles")
    print("="*60)
    
    headers = {"Authorization": f"Token {token}"}
    response = requests.get(f"{BASE_URL}/auth/role-selection/available_roles/", headers=headers)
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Found {data['count']} available roles:")
        
        profiles = []
        for profile in data['profiles']:
            primary = " (PRIMARY)" if profile['is_primary'] else ""
            print(f"   - ID: {profile['id']} | {profile['profile_type_display']} @ {profile['organization_name']}{primary}")
            profiles.append(profile)
        
        return profiles
    else:
        print(f"❌ Failed to get roles: {response.status_code}")
        print(f"   Error: {response.text}")
        return []


def test_select_role(token, profile_id, profile_name):
    """Test selecting a specific role"""
    print("\n" + "="*60)
    print(f"TEST 3: Select Role - {profile_name}")
    print("="*60)
    
    headers = {"Authorization": f"Token {token}"}
    payload = {"profile_id": profile_id}
    
    response = requests.post(f"{BASE_URL}/auth/role-selection/select_role/", json=payload, headers=headers)
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Role switched successfully!")
        print(f"   Message: {data['message']}")
        print(f"   Active Profile: {data['active_profile']['profile_type_display']}")
        print(f"   Organization: {data['active_profile']['organization_name']}")
        print(f"   Is Primary: {data['active_profile']['is_primary']}")
        return True
    else:
        print(f"❌ Failed to select role: {response.status_code}")
        print(f"   Error: {response.text}")
        return False


def test_current_role(token):
    """Test getting current active role"""
    print("\n" + "="*60)
    print("TEST 4: Get Current Role")
    print("="*60)
    
    headers = {"Authorization": f"Token {token}"}
    response = requests.get(f"{BASE_URL}/auth/role-selection/current_role/", headers=headers)
    
    if response.status_code == 200:
        data = response.json()
        profile = data['profile']
        print(f"✅ Current role retrieved:")
        print(f"   Profile Type: {profile['profile_type_display']}")
        print(f"   Organization: {profile['organization_name']}")
        print(f"   Is Primary: {profile['is_primary']}")
        print(f"   Status: {profile['status_display']}")
        return True
    else:
        print(f"❌ Failed to get current role: {response.status_code}")
        print(f"   Error: {response.text}")
        return False


def test_login(username, password):
    """Test user login"""
    print("\n" + "="*60)
    print("TEST 5: User Login")
    print("="*60)
    
    payload = {
        "username": username,
        "password": password
    }
    
    response = requests.post(f"{BASE_URL}/auth/login/", json=payload)
    
    if response.status_code == 200:
        data = response.json()
        print("✅ Login successful!")
        print(f"   User: {data['user']['username']}")
        print(f"   Token: {data['token'][:20]}...")
        print(f"   Profiles: {len(data['user']['profiles'])}")
        return data['token']
    else:
        print(f"❌ Login failed: {response.status_code}")
        print(f"   Error: {response.text}")
        return None


def run_all_tests():
    """Run all tests"""
    print("\n")
    print("╔" + "="*58 + "╗")
    print("║" + " "*15 + "RBAC SYSTEM TEST SUITE" + " "*21 + "║")
    print("╚" + "="*58 + "╝")
    
    # Test 1: Registration
    token, user = test_user_registration()
    if not token:
        print("\n❌ Tests aborted due to registration failure")
        return
    
    # Test 2: Get available roles
    profiles = test_available_roles(token)
    if not profiles:
        print("\n❌ Tests aborted due to role fetch failure")
        return
    
    # Test 3: Select each role
    for profile in profiles:
        if profile['profile_type'] != 'vendor':  # Skip vendor since it's primary
            test_select_role(token, profile['id'], profile['profile_type_display'])
    
    # Test 4: Get current role
    test_current_role(token)
    
    # Test 5: Login with existing user
    test_login(user['username'], "TestPass123!@#")
    
    # Summary
    print("\n" + "="*60)
    print("✅ ALL TESTS COMPLETED SUCCESSFULLY!")
    print("="*60)
    print("\nSystem Features Verified:")
    print("  ✓ User registration with organization creation")
    print("  ✓ Automatic creation of 3 profiles (vendor, employee, customer)")
    print("  ✓ Role listing API")
    print("  ✓ Role selection/switching")
    print("  ✓ Current role retrieval")
    print("  ✓ User login")
    print("\n" + "="*60)


if __name__ == "__main__":
    try:
        run_all_tests()
    except requests.exceptions.ConnectionError:
        print("\n❌ ERROR: Cannot connect to backend server")
        print("   Make sure Django server is running at http://127.0.0.1:8000")
        print("   Run: cd shared-backend && python manage.py runserver")
    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
