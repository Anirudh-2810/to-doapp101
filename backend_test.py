#!/usr/bin/env python3
"""
Velocity-One Cognitive Task Engine - Backend API Testing
Tests all API endpoints for functionality and integration
"""

import requests
import sys
import json
from datetime import datetime, timedelta
from typing import Dict, Any, Optional

class VelocityAPITester:
    def __init__(self, base_url: str = "https://velocity-engine-11.preview.emergentagent.com"):
        self.base_url = base_url
        self.session = requests.Session()
        self.session.headers.update({'Content-Type': 'application/json'})
        self.tests_run = 0
        self.tests_passed = 0
        self.user_id = None
        self.test_task_id = None

    def log(self, message: str, level: str = "INFO"):
        """Log test messages with timestamp"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"[{timestamp}] {level}: {message}")

    def run_test(self, name: str, method: str, endpoint: str, expected_status: int, 
                 data: Optional[Dict] = None, cookies: bool = True) -> tuple[bool, Dict]:
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        self.tests_run += 1
        
        self.log(f"Testing {name} - {method} {endpoint}")
        
        try:
            if method == 'GET':
                response = self.session.get(url)
            elif method == 'POST':
                response = self.session.post(url, json=data)
            elif method == 'PUT':
                response = self.session.put(url, json=data)
            elif method == 'DELETE':
                response = self.session.delete(url)
            else:
                raise ValueError(f"Unsupported method: {method}")

            success = response.status_code == expected_status
            
            if success:
                self.tests_passed += 1
                self.log(f"✅ PASS - {name} (Status: {response.status_code})")
            else:
                self.log(f"❌ FAIL - {name} (Expected: {expected_status}, Got: {response.status_code})")
                if response.text:
                    self.log(f"   Response: {response.text[:200]}")

            try:
                response_data = response.json() if response.text else {}
            except:
                response_data = {"raw_response": response.text}
                
            return success, response_data

        except Exception as e:
            self.log(f"❌ ERROR - {name}: {str(e)}", "ERROR")
            return False, {"error": str(e)}

    def test_root_endpoint(self):
        """Test API root endpoint"""
        return self.run_test("API Root", "GET", "", 200)

    def test_register_user(self):
        """Test user registration"""
        test_email = f"test_{datetime.now().strftime('%H%M%S')}@example.com"
        success, response = self.run_test(
            "User Registration",
            "POST",
            "auth/register",
            200,
            {
                "email": test_email,
                "password": "testpass123",
                "name": "Test User"
            }
        )
        if success and "id" in response:
            self.user_id = response["id"]
            self.log(f"   Registered user ID: {self.user_id}")
        return success, response

    def test_login_admin(self):
        """Test admin login"""
        success, response = self.run_test(
            "Admin Login",
            "POST",
            "auth/login",
            200,
            {
                "email": "admin@example.com",
                "password": "admin123"
            }
        )
        if success:
            self.log(f"   Logged in as: {response.get('email', 'Unknown')}")
        return success, response

    def test_auth_me(self):
        """Test getting current user info"""
        return self.run_test("Get Current User", "GET", "auth/me", 200)

    def test_create_task(self):
        """Test task creation"""
        tomorrow = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")
        success, response = self.run_test(
            "Create Task",
            "POST",
            "tasks",
            200,
            {
                "text": "Test task for API validation",
                "priority": 2,
                "complexity": 5,
                "deadline": tomorrow,
                "category": "General"
            }
        )
        if success and "id" in response:
            self.test_task_id = response["id"]
            self.log(f"   Created task ID: {self.test_task_id}")
            self.log(f"   Task score: {response.get('score', 'N/A')}")
        return success, response

    def test_get_tasks(self):
        """Test getting tasks list"""
        success, response = self.run_test("Get Tasks", "GET", "tasks", 200)
        if success:
            task_count = len(response) if isinstance(response, list) else 0
            self.log(f"   Found {task_count} tasks")
        return success, response

    def test_complete_task(self):
        """Test task completion"""
        if not self.test_task_id:
            self.log("⚠️  SKIP - Complete Task (No task ID available)")
            return False, {}
        
        return self.run_test(
            "Complete Task",
            "POST",
            f"tasks/{self.test_task_id}/complete",
            200
        )

    def test_delete_task(self):
        """Test task deletion"""
        if not self.test_task_id:
            self.log("⚠️  SKIP - Delete Task (No task ID available)")
            return False, {}
            
        return self.run_test(
            "Delete Task",
            "DELETE",
            f"tasks/{self.test_task_id}",
            200
        )

    def test_telemetry(self):
        """Test telemetry endpoints"""
        success1, _ = self.run_test("Get Telemetry", "GET", "telemetry", 200)
        success2, _ = self.run_test("Get Peak Hours", "GET", "telemetry/peak-hours", 200)
        success3, _ = self.run_test("Get Categories", "GET", "telemetry/categories", 200)
        return (success1 and success2 and success3), {}

    def test_energy_update(self):
        """Test energy level update"""
        return self.run_test(
            "Update Energy",
            "PUT",
            "user/energy",
            200,
            {"energy_level": 7}
        )

    def test_ai_insights(self):
        """Test AI insights generation"""
        success, response = self.run_test("AI Insights", "POST", "ai/insights", 200)
        if success:
            insights_type = response.get("type", "unknown")
            self.log(f"   AI insights type: {insights_type}")
            if insights_type == "error":
                self.log(f"   AI error: {response.get('insights', 'No details')}")
        return success, response

    def test_calendar_status(self):
        """Test calendar status (mocked)"""
        return self.run_test("Calendar Status", "GET", "calendar/status", 200)

    def test_categories_list(self):
        """Test categories endpoint"""
        success, response = self.run_test("Get Categories", "GET", "categories", 200)
        if success and isinstance(response, list):
            self.log(f"   Available categories: {len(response)}")
        return success, response

    def test_logout(self):
        """Test logout"""
        return self.run_test("Logout", "POST", "auth/logout", 200)

    def test_brute_force_protection(self):
        """Test brute force protection"""
        self.log("Testing brute force protection...")
        failed_attempts = 0
        
        for i in range(6):  # Try 6 failed logins
            success, response = self.run_test(
                f"Failed Login Attempt {i+1}",
                "POST",
                "auth/login",
                401,  # Expect 401 for wrong credentials
                {
                    "email": "admin@example.com",
                    "password": "wrongpassword"
                }
            )
            if not success and i < 5:  # First 5 should be 401
                failed_attempts += 1
            elif i == 5:  # 6th attempt should be 429 (rate limited)
                rate_limited = self.run_test(
                    "Rate Limited Login",
                    "POST", 
                    "auth/login",
                    429,
                    {
                        "email": "admin@example.com",
                        "password": "wrongpassword"
                    }
                )[0]
                if rate_limited:
                    self.log("✅ Brute force protection working")
                    return True, {}
                
        return (failed_attempts >= 5), {}

    def run_all_tests(self):
        """Run comprehensive API test suite"""
        self.log("=" * 60)
        self.log("VELOCITY-ONE COGNITIVE TASK ENGINE - API TESTING")
        self.log("=" * 60)
        
        # Test sequence
        test_results = {}
        
        # Basic connectivity
        test_results["root"] = self.test_root_endpoint()
        
        # Authentication flow
        test_results["register"] = self.test_register_user()
        test_results["login"] = self.test_login_admin()
        test_results["auth_me"] = self.test_auth_me()
        
        # Task management
        test_results["create_task"] = self.test_create_task()
        test_results["get_tasks"] = self.test_get_tasks()
        test_results["complete_task"] = self.test_complete_task()
        
        # Create another task for deletion test
        self.test_create_task()
        test_results["delete_task"] = self.test_delete_task()
        
        # Telemetry and insights
        test_results["telemetry"] = self.test_telemetry()
        test_results["energy"] = self.test_energy_update()
        test_results["ai_insights"] = self.test_ai_insights()
        
        # Other endpoints
        test_results["calendar"] = self.test_calendar_status()
        test_results["categories"] = self.test_categories_list()
        
        # Security
        test_results["brute_force"] = self.test_brute_force_protection()
        
        # Cleanup
        test_results["logout"] = self.test_logout()
        
        # Results summary
        self.log("=" * 60)
        self.log("TEST RESULTS SUMMARY")
        self.log("=" * 60)
        
        passed_tests = []
        failed_tests = []
        
        for test_name, (success, _) in test_results.items():
            if success:
                passed_tests.append(test_name)
                self.log(f"✅ {test_name.upper()}")
            else:
                failed_tests.append(test_name)
                self.log(f"❌ {test_name.upper()}")
        
        self.log(f"\nPASSED: {len(passed_tests)}/{len(test_results)}")
        self.log(f"FAILED: {len(failed_tests)}/{len(test_results)}")
        
        if failed_tests:
            self.log(f"\nFAILED TESTS: {', '.join(failed_tests)}")
            return 1
        else:
            self.log("\n🎉 ALL TESTS PASSED!")
            return 0

def main():
    """Main test execution"""
    tester = VelocityAPITester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())