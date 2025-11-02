"""
Comprehensive API Test Suite for CRM Backend

This script tests all major API endpoints including:
- User registration and authentication
- Organization management
- RBAC (Roles and Permissions)
- CRM operations (Customers, Leads, Deals)

Usage:
    python test_api.py
"""

import requests
import json
from datetime import datetime

# Configuration
BASE_URL = "http://127.0.0.1:8000/api"
TEST_EMAIL = f"test_{datetime.now().timestamp()}@example.com"
TEST_PASSWORD = "TestPass123!"

# Global token storage
access_token = None
organization_id = None


def print_section(title):
    """Print a formatted section header"""
    print("\n" + "="*70)
    print(f"  {title}")
    print("="*70)


def print_result(endpoint, status_code, success=True):
    """Print test result"""
    symbol = "✅" if success else "❌"
    print(f"{symbol} {endpoint}: {status_code}")


def get_headers(auth=True):
    """Get request headers"""
    headers = {"Content-Type": "application/json"}
    if auth and access_token:
        headers["Authorization"] = f"Bearer {access_token}"
    return headers


# ============================================================================
# TEST: User Registration
# ============================================================================
def test_user_registration():
    print_section("1. User Registration")
    
    data = {
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD,
        "password_confirm": TEST_PASSWORD,
        "first_name": "John",
        "last_name": "Doe",
        "phone": "+1234567890"
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/users/",
            json=data,
            headers=get_headers(auth=False)
        )
        
        if response.status_code == 201:
            print_result("POST /users/ (Register)", response.status_code, True)
            user_data = response.json()
            print(f"   Created User ID: {user_data.get('id')}")
            print(f"   Email: {user_data.get('email')}")
            return True
        else:
            print_result("POST /users/ (Register)", response.status_code, False)
            print(f"   Error: {response.json()}")
            return False
    except Exception as e:
        print(f"❌ Registration failed: {str(e)}")
        return False


# ============================================================================
# TEST: User Login
# ============================================================================
def test_user_login():
    global access_token
    print_section("2. User Login")
    
    data = {
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/auth/login/",
            json=data,
            headers=get_headers(auth=False)
        )
        
        if response.status_code == 200:
            print_result("POST /auth/login/", response.status_code, True)
            tokens = response.json()
            access_token = tokens.get('tokens', {}).get('access')
            print(f"   Access Token: {access_token[:50]}...")
            print(f"   User: {tokens.get('user', {}).get('email')}")
            return True
        else:
            print_result("POST /auth/login/", response.status_code, False)
            print(f"   Error: {response.json()}")
            return False
    except Exception as e:
        print(f"❌ Login failed: {str(e)}")
        return False


# ============================================================================
# TEST: Get Current User
# ============================================================================
def test_get_current_user():
    print_section("3. Get Current User")
    
    try:
        response = requests.get(
            f"{BASE_URL}/users/me/",
            headers=get_headers()
        )
        
        if response.status_code == 200:
            print_result("GET /users/me/", response.status_code, True)
            user = response.json()
            print(f"   Name: {user.get('first_name')} {user.get('last_name')}")
            print(f"   Email: {user.get('email')}")
            return True
        else:
            print_result("GET /users/me/", response.status_code, False)
            return False
    except Exception as e:
        print(f"❌ Get user failed: {str(e)}")
        return False


# ============================================================================
# TEST: Organization Management
# ============================================================================
def test_organization_crud():
    global organization_id
    print_section("4. Organization Management")
    
    # Create Organization
    org_data = {
        "name": "Test Organization",
        "description": "A test organization for API testing",
        "industry": "Technology",
        "size": "small",
        "website": "https://testorg.com"
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/organizations/",
            json=org_data,
            headers=get_headers()
        )
        
        if response.status_code == 201:
            print_result("POST /organizations/ (Create)", response.status_code, True)
            org = response.json()
            organization_id = org.get('id')
            print(f"   Created Org ID: {organization_id}")
            print(f"   Name: {org.get('name')}")
        else:
            print_result("POST /organizations/ (Create)", response.status_code, False)
            print(f"   Error: {response.json()}")
            return False
        
        # List Organizations
        response = requests.get(
            f"{BASE_URL}/organizations/",
            headers=get_headers()
        )
        
        if response.status_code == 200:
            print_result("GET /organizations/ (List)", response.status_code, True)
            orgs = response.json()
            print(f"   Total Organizations: {orgs.get('count', len(orgs))}")
        
        return True
    except Exception as e:
        print(f"❌ Organization test failed: {str(e)}")
        return False


# ============================================================================
# TEST: Customer Management
# ============================================================================
def test_customer_crud():
    print_section("5. Customer Management")
    
    if not organization_id:
        print("❌ Skipping - No organization ID available")
        return False
    
    # Create Customer
    customer_data = {
        "organization_id": organization_id,
        "name": "Jane Smith",
        "email": "jane.smith@example.com",
        "phone": "+1987654321",
        "customer_type": "individual",
        "company_name": "Smith Consulting",
        "status": "active"
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/customers/",
            json=customer_data,
            headers=get_headers()
        )
        
        if response.status_code == 201:
            print_result("POST /customers/ (Create)", response.status_code, True)
            customer = response.json()
            customer_id = customer.get('id')
            print(f"   Created Customer ID: {customer_id}")
            print(f"   Name: {customer.get('name')}")
        else:
            print_result("POST /customers/ (Create)", response.status_code, False)
            print(f"   Error: {response.json()}")
            return False
        
        # List Customers
        response = requests.get(
            f"{BASE_URL}/customers/",
            headers=get_headers()
        )
        
        if response.status_code == 200:
            print_result("GET /customers/ (List)", response.status_code, True)
            customers = response.json()
            print(f"   Total Customers: {customers.get('count', len(customers))}")
        
        # Get Customer Stats
        response = requests.get(
            f"{BASE_URL}/customers/stats/",
            headers=get_headers()
        )
        
        if response.status_code == 200:
            print_result("GET /customers/stats/", response.status_code, True)
            stats = response.json()
            print(f"   Total: {stats.get('total')}, Active: {stats.get('active')}")
        
        return True
    except Exception as e:
        print(f"❌ Customer test failed: {str(e)}")
        return False


# ============================================================================
# TEST: Lead Management
# ============================================================================
def test_lead_crud():
    print_section("6. Lead Management")
    
    if not organization_id:
        print("❌ Skipping - No organization ID available")
        return False
    
    # Create Lead
    lead_data = {
        "organization_id": organization_id,
        "first_name": "Alice",
        "last_name": "Johnson",
        "email": "alice.johnson@example.com",
        "phone": "+1555123456",
        "company": "Johnson Industries",
        "source": "website",
        "priority": "high",
        "score": 85,
        "status": "new"
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/leads/",
            json=lead_data,
            headers=get_headers()
        )
        
        if response.status_code == 201:
            print_result("POST /leads/ (Create)", response.status_code, True)
            lead = response.json()
            lead_id = lead.get('id')
            print(f"   Created Lead ID: {lead_id}")
            print(f"   Name: {lead.get('first_name')} {lead.get('last_name')}")
            print(f"   Score: {lead.get('score')}")
        else:
            print_result("POST /leads/ (Create)", response.status_code, False)
            print(f"   Error: {response.json()}")
            return False
        
        # List Leads
        response = requests.get(
            f"{BASE_URL}/leads/",
            headers=get_headers()
        )
        
        if response.status_code == 200:
            print_result("GET /leads/ (List)", response.status_code, True)
            leads = response.json()
            print(f"   Total Leads: {leads.get('count', len(leads))}")
        
        # Get Lead Stats
        response = requests.get(
            f"{BASE_URL}/leads/stats/",
            headers=get_headers()
        )
        
        if response.status_code == 200:
            print_result("GET /leads/stats/", response.status_code, True)
            stats = response.json()
            print(f"   Total: {stats.get('total')}, Converted: {stats.get('converted')}")
        
        # Qualify Lead
        response = requests.post(
            f"{BASE_URL}/leads/{lead_id}/qualify/",
            headers=get_headers()
        )
        
        if response.status_code == 200:
            print_result(f"POST /leads/{lead_id}/qualify/", response.status_code, True)
        
        return True
    except Exception as e:
        print(f"❌ Lead test failed: {str(e)}")
        return False


# ============================================================================
# TEST: Pipeline and Deal Management
# ============================================================================
def test_pipeline_and_deal():
    print_section("7. Pipeline & Deal Management")
    
    if not organization_id:
        print("❌ Skipping - No organization ID available")
        return False
    
    # Create Pipeline
    pipeline_data = {
        "organization_id": organization_id,
        "name": "Sales Pipeline",
        "description": "Standard sales pipeline",
        "is_default": True
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/pipelines/",
            json=pipeline_data,
            headers=get_headers()
        )
        
        if response.status_code == 201:
            print_result("POST /pipelines/ (Create)", response.status_code, True)
            pipeline = response.json()
            pipeline_id = pipeline.get('id')
            print(f"   Created Pipeline ID: {pipeline_id}")
        else:
            print_result("POST /pipelines/ (Create)", response.status_code, False)
            print(f"   Error: {response.json()}")
            return False
        
        # Create Pipeline Stage
        stage_data = {
            "pipeline_id": pipeline_id,
            "name": "Qualified",
            "description": "Qualified leads",
            "order": 1,
            "probability": 50
        }
        
        response = requests.post(
            f"{BASE_URL}/pipeline-stages/",
            json=stage_data,
            headers=get_headers()
        )
        
        if response.status_code == 201:
            print_result("POST /pipeline-stages/ (Create)", response.status_code, True)
            stage = response.json()
            stage_id = stage.get('id')
            print(f"   Created Stage ID: {stage_id}")
        else:
            print_result("POST /pipeline-stages/ (Create)", response.status_code, False)
            return False
        
        # Get Deal Stats
        response = requests.get(
            f"{BASE_URL}/deals/stats/",
            headers=get_headers()
        )
        
        if response.status_code == 200:
            print_result("GET /deals/stats/", response.status_code, True)
            stats = response.json()
            print(f"   Total Deals: {stats.get('total_deals')}")
            print(f"   Total Value: ${stats.get('total_value')}")
        
        return True
    except Exception as e:
        print(f"❌ Pipeline/Deal test failed: {str(e)}")
        return False


# ============================================================================
# TEST: Search and Filter
# ============================================================================
def test_search_and_filter():
    print_section("8. Search & Filter Operations")
    
    try:
        # Search Customers
        response = requests.get(
            f"{BASE_URL}/customers/?search=Smith",
            headers=get_headers()
        )
        
        if response.status_code == 200:
            print_result("GET /customers/?search=Smith", response.status_code, True)
            results = response.json()
            print(f"   Search Results: {results.get('count', len(results))}")
        
        # Filter Leads by Status
        response = requests.get(
            f"{BASE_URL}/leads/?status=new",
            headers=get_headers()
        )
        
        if response.status_code == 200:
            print_result("GET /leads/?status=new", response.status_code, True)
            results = response.json()
            print(f"   Filtered Results: {results.get('count', len(results))}")
        
        # Pagination Test
        response = requests.get(
            f"{BASE_URL}/customers/?page_size=5&page=1",
            headers=get_headers()
        )
        
        if response.status_code == 200:
            print_result("GET /customers/?page_size=5&page=1", response.status_code, True)
        
        return True
    except Exception as e:
        print(f"❌ Search/Filter test failed: {str(e)}")
        return False


# ============================================================================
# TEST: Logout
# ============================================================================
def test_logout():
    print_section("9. User Logout")
    
    try:
        response = requests.post(
            f"{BASE_URL}/auth/logout/",
            headers=get_headers()
        )
        
        if response.status_code == 200:
            print_result("POST /auth/logout/", response.status_code, True)
            print("   Successfully logged out")
            return True
        else:
            print_result("POST /auth/logout/", response.status_code, False)
            return False
    except Exception as e:
        print(f"❌ Logout failed: {str(e)}")
        return False


# ============================================================================
# MAIN TEST RUNNER
# ============================================================================
def run_all_tests():
    print("\n" + "🚀 " + "="*66)
    print("   CRM API Test Suite")
    print("   Testing: " + BASE_URL)
    print("="*70)
    
    tests = [
        ("User Registration", test_user_registration),
        ("User Login", test_user_login),
        ("Get Current User", test_get_current_user),
        ("Organization CRUD", test_organization_crud),
        ("Customer CRUD", test_customer_crud),
        ("Lead CRUD", test_lead_crud),
        ("Pipeline & Deal", test_pipeline_and_deal),
        ("Search & Filter", test_search_and_filter),
        ("Logout", test_logout),
    ]
    
    results = []
    
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"\n❌ {test_name} crashed: {str(e)}")
            results.append((test_name, False))
    
    # Summary
    print_section("TEST SUMMARY")
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        symbol = "✅" if result else "❌"
        print(f"{symbol} {test_name}")
    
    print(f"\n{'='*70}")
    print(f"   Tests Passed: {passed}/{total} ({(passed/total)*100:.1f}%)")
    print("="*70 + "\n")
    
    return passed == total


if __name__ == "__main__":
    try:
        success = run_all_tests()
        exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n\n❌ Tests interrupted by user")
        exit(1)
    except Exception as e:
        print(f"\n\n❌ Fatal error: {str(e)}")
        exit(1)
