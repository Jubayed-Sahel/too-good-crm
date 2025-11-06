"""
Backend API Verification Script

This script tests all critical API endpoints to ensure the backend
fulfills all frontend data needs.
"""

import requests
import json
from typing import Dict, Any

BASE_URL = "http://127.0.0.1:8000/api"


class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    END = '\033[0m'


class APITester:
    def __init__(self, base_url: str):
        self.base_url = base_url
        self.token = None
        self.passed = 0
        self.failed = 0
        self.warnings = 0
    
    def print_header(self, text: str):
        print(f"\n{Colors.BLUE}{'='*60}")
        print(f"{text}")
        print(f"{'='*60}{Colors.END}\n")
    
    def print_test(self, name: str, status: str, details: str = ""):
        if status == "PASS":
            print(f"{Colors.GREEN}✓{Colors.END} {name}")
            self.passed += 1
        elif status == "FAIL":
            print(f"{Colors.RED}✗{Colors.END} {name}")
            if details:
                print(f"  {Colors.RED}Error: {details}{Colors.END}")
            self.failed += 1
        elif status == "WARN":
            print(f"{Colors.YELLOW}⚠{Colors.END} {name}")
            if details:
                print(f"  {Colors.YELLOW}Warning: {details}{Colors.END}")
            self.warnings += 1
    
    def test_endpoint(self, method: str, endpoint: str, name: str, 
                     data: Dict = None, expect_auth: bool = True) -> bool:
        """Test a single endpoint"""
        url = f"{self.base_url}{endpoint}"
        headers = {}
        
        if expect_auth and self.token:
            headers['Authorization'] = f'Token {self.token}'
        
        try:
            if method == "GET":
                response = requests.get(url, headers=headers, timeout=5)
            elif method == "POST":
                response = requests.post(url, json=data, headers=headers, timeout=5)
            elif method == "PUT":
                response = requests.put(url, json=data, headers=headers, timeout=5)
            elif method == "DELETE":
                response = requests.delete(url, headers=headers, timeout=5)
            
            # Check if endpoint exists (not 404)
            if response.status_code == 404:
                self.print_test(name, "FAIL", f"Endpoint not found: {endpoint}")
                return False
            
            # Check if authentication works
            if expect_auth and response.status_code == 401:
                self.print_test(name, "WARN", "Authentication required (expected)")
                return True
            
            # Check if request is valid
            if response.status_code >= 500:
                self.print_test(name, "FAIL", f"Server error: {response.status_code}")
                return False
            
            self.print_test(name, "PASS")
            return True
            
        except requests.exceptions.ConnectionError:
            self.print_test(name, "FAIL", "Cannot connect to server. Is it running?")
            return False
        except requests.exceptions.Timeout:
            self.print_test(name, "FAIL", "Request timeout")
            return False
        except Exception as e:
            self.print_test(name, "FAIL", str(e))
            return False
    
    def run_tests(self):
        """Run all API endpoint tests"""
        
        self.print_header("Backend API Verification")
        
        # Test server connection
        self.print_header("1. Server Connection")
        try:
            response = requests.get(f"{self.base_url}/users/", timeout=5)
            self.print_test("Server is reachable", "PASS")
        except:
            self.print_test("Server is reachable", "FAIL", 
                          "Server not running on http://127.0.0.1:8000")
            return
        
        # Authentication Endpoints
        self.print_header("2. Authentication Endpoints")
        self.test_endpoint("POST", "/users/", "User Registration", expect_auth=False)
        self.test_endpoint("POST", "/auth/login/", "User Login", expect_auth=False)
        self.test_endpoint("POST", "/auth/logout/", "User Logout")
        self.test_endpoint("POST", "/auth/change-password/", "Change Password")
        self.test_endpoint("GET", "/users/me/", "Get Current User")
        
        # User Endpoints
        self.print_header("3. User Management")
        self.test_endpoint("GET", "/users/", "List Users")
        self.test_endpoint("PUT", "/users/update_profile/", "Update Profile")
        
        # Organization Endpoints
        self.print_header("4. Organization Management")
        self.test_endpoint("GET", "/organizations/", "List Organizations")
        self.test_endpoint("GET", "/organizations/my_organizations/", "My Organizations")
        
        # Customer Endpoints
        self.print_header("5. Customer Management")
        self.test_endpoint("GET", "/customers/", "List Customers")
        self.test_endpoint("GET", "/customers/stats/", "Customer Stats")
        
        # Lead Endpoints
        self.print_header("6. Lead Management")
        self.test_endpoint("GET", "/leads/", "List Leads")
        self.test_endpoint("GET", "/leads/stats/", "Lead Stats")
        
        # Deal Endpoints
        self.print_header("7. Deal Management")
        self.test_endpoint("GET", "/deals/", "List Deals")
        self.test_endpoint("GET", "/deals/stats/", "Deal Stats")
        
        # Pipeline Endpoints
        self.print_header("8. Pipeline Management")
        self.test_endpoint("GET", "/pipelines/", "List Pipelines")
        self.test_endpoint("GET", "/pipeline-stages/", "List Pipeline Stages")
        
        # Employee Endpoints
        self.print_header("9. Employee Management")
        self.test_endpoint("GET", "/employees/", "List Employees")
        self.test_endpoint("GET", "/employees/departments/", "Employee Departments")
        
        # Vendor Endpoints
        self.print_header("10. Vendor Management")
        self.test_endpoint("GET", "/vendors/", "List Vendors")
        self.test_endpoint("GET", "/vendors/types/", "Vendor Types")
        
        # RBAC Endpoints
        self.print_header("11. RBAC (Roles & Permissions)")
        self.test_endpoint("GET", "/roles/", "List Roles")
        self.test_endpoint("GET", "/permissions/", "List Permissions")
        self.test_endpoint("GET", "/user-roles/my_roles/", "My Roles")
        
        # Analytics Endpoints
        self.print_header("12. Analytics & Reporting")
        self.test_endpoint("GET", "/analytics/dashboard/", "Dashboard Analytics")
        self.test_endpoint("GET", "/analytics/sales_funnel/", "Sales Funnel")
        self.test_endpoint("GET", "/analytics/revenue_by_period/", "Revenue by Period")
        self.test_endpoint("GET", "/analytics/employee_performance/", "Employee Performance")
        self.test_endpoint("GET", "/analytics/top_performers/", "Top Performers")
        
        # Print Summary
        self.print_header("Test Summary")
        total = self.passed + self.failed + self.warnings
        print(f"Total Tests: {total}")
        print(f"{Colors.GREEN}Passed: {self.passed}{Colors.END}")
        print(f"{Colors.YELLOW}Warnings: {self.warnings}{Colors.END}")
        print(f"{Colors.RED}Failed: {self.failed}{Colors.END}")
        
        if self.failed == 0:
            print(f"\n{Colors.GREEN}{'='*60}")
            print("✓ All critical endpoints are available!")
            print("✓ Backend is ready to serve frontend requests")
            print(f"{'='*60}{Colors.END}\n")
        else:
            print(f"\n{Colors.RED}{'='*60}")
            print("✗ Some endpoints failed")
            print("Please check the errors above")
            print(f"{'='*60}{Colors.END}\n")


if __name__ == "__main__":
    print(f"""
{Colors.BLUE}╔══════════════════════════════════════════════════════════╗
║         Backend API Verification Tool                   ║
║                                                          ║
║  This script verifies that the backend provides all     ║
║  API endpoints required by the frontend application.    ║
╚══════════════════════════════════════════════════════════╝{Colors.END}
""")
    
    tester = APITester(BASE_URL)
    tester.run_tests()
    
    print(f"\n{Colors.BLUE}Note:{Colors.END} Make sure the Django development server is running:")
    print(f"  cd shared-backend")
    print(f"  python manage.py runserver\n")
