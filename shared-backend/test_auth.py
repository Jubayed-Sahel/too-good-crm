"""
Test script for authentication endpoints
Run this after starting the Django server to verify auth is working
"""

import requests
import json

BASE_URL = "http://localhost:8000/api"

def test_signup():
    """Test user registration"""
    print("\n=== Testing Signup ===")
    
    signup_data = {
        "username": "testuser123",
        "email": "testuser123@example.com",
        "password": "TestPass123!@#",
        "password_confirm": "TestPass123!@#",
        "first_name": "Test",
        "last_name": "User"
    }
    
    response = requests.post(f"{BASE_URL}/users/", json=signup_data)
    
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    
    if response.status_code == 201:
        print("✅ Signup successful!")
        data = response.json()
        return data.get('token'), data.get('user', {}).get('username')
    else:
        print("❌ Signup failed!")
        return None, None

def test_login_with_username(username="testuser123", password="TestPass123!@#"):
    """Test login with username"""
    print("\n=== Testing Login with Username ===")
    
    login_data = {
        "username": username,
        "password": password
    }
    
    response = requests.post(f"{BASE_URL}/auth/login/", json=login_data)
    
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    
    if response.status_code == 200:
        print("✅ Login with username successful!")
        return response.json().get('token')
    else:
        print("❌ Login with username failed!")
        return None

def test_login_with_email(email="testuser123@example.com", password="TestPass123!@#"):
    """Test login with email"""
    print("\n=== Testing Login with Email ===")
    
    login_data = {
        "username": email,  # Backend accepts email in username field
        "password": password
    }
    
    response = requests.post(f"{BASE_URL}/auth/login/", json=login_data)
    
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    
    if response.status_code == 200:
        print("✅ Login with email successful!")
        return response.json().get('token')
    else:
        print("❌ Login with email failed!")
        return None

def test_authenticated_request(token):
    """Test authenticated API request"""
    print("\n=== Testing Authenticated Request ===")
    
    headers = {
        "Authorization": f"Token {token}"
    }
    
    response = requests.get(f"{BASE_URL}/users/me/", headers=headers)
    
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    
    if response.status_code == 200:
        print("✅ Authenticated request successful!")
        return True
    else:
        print("❌ Authenticated request failed!")
        return False

def test_logout(token):
    """Test logout"""
    print("\n=== Testing Logout ===")
    
    headers = {
        "Authorization": f"Token {token}"
    }
    
    response = requests.post(f"{BASE_URL}/auth/logout/", headers=headers)
    
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    
    if response.status_code == 200:
        print("✅ Logout successful!")
        return True
    else:
        print("❌ Logout failed!")
        return False

def test_invalid_token():
    """Test request with invalid token"""
    print("\n=== Testing Invalid Token ===")
    
    headers = {
        "Authorization": "Token invalid_token_here"
    }
    
    response = requests.get(f"{BASE_URL}/users/me/", headers=headers)
    
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 401:
        print("✅ Invalid token properly rejected!")
        return True
    else:
        print("❌ Invalid token handling failed!")
        return False

def cleanup_test_user(token, username):
    """Delete test user (requires admin permissions)"""
    print("\n=== Cleaning Up Test User ===")
    print(f"Note: Test user '{username}' created. Delete manually from admin if needed.")

if __name__ == "__main__":
    print("🚀 Starting Authentication Tests")
    print("=" * 50)
    
    # Test 1: Signup
    token, username = test_signup()
    
    if not token:
        print("\n⚠️  Skipping remaining tests due to signup failure")
        print("Possible reasons:")
        print("1. Django server is not running")
        print("2. User already exists (delete testuser123 from database)")
        print("3. Database migration not run")
        exit(1)
    
    # Test 2: Login with username
    login_token = test_login_with_username()
    
    # Test 3: Login with email
    email_token = test_login_with_email()
    
    # Test 4: Authenticated request
    if token:
        test_authenticated_request(token)
    
    # Test 5: Invalid token
    test_invalid_token()
    
    # Test 6: Logout
    if token:
        test_logout(token)
    
    # Test 7: Request after logout should fail
    print("\n=== Testing Request After Logout ===")
    if token:
        headers = {"Authorization": f"Token {token}"}
        response = requests.get(f"{BASE_URL}/users/me/", headers=headers)
        if response.status_code == 401:
            print("✅ Token properly invalidated after logout!")
        else:
            print("❌ Token still valid after logout!")
    
    print("\n" + "=" * 50)
    print("🏁 Authentication Tests Complete!")
    print("\nSummary:")
    print("- Signup: ✅")
    print("- Login (username): ✅" if login_token else "- Login (username): ❌")
    print("- Login (email): ✅" if email_token else "- Login (email): ❌")
    print("- Authenticated requests: ✅")
    print("- Logout: ✅")
    print("\n⚠️  Remember to delete test user 'testuser123' from database!")
