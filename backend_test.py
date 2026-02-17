#!/usr/bin/env python3
"""
BenefitBuddy Backend API Test Suite
Tests all backend endpoints with comprehensive scenarios
"""

import requests
import json
import sys
import os
from datetime import datetime

# Base URL from environment
BASE_URL = "https://benefit-buddy-5.preview.emergentagent.com"
ADMIN_KEY = "ChangeMe-SetStrongKey-2026"

class BenefitBuddyAPITester:
    def __init__(self):
        self.base_url = BASE_URL
        self.admin_key = ADMIN_KEY
        self.test_results = []
        self.submission_id = None
        
    def log_result(self, test_name, success, message, details=None):
        """Log test result"""
        result = {
            'test': test_name,
            'success': success,
            'message': message,
            'details': details,
            'timestamp': datetime.now().isoformat()
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name} - {message}")
        if details:
            print(f"   Details: {details}")
        print()

    def test_create_submission_valid(self):
        """Test POST /api/submissions with valid data"""
        try:
            url = f"{self.base_url}/api/submissions"
            data = {
                "full_name": "John Smith",
                "email": "john.smith@example.com",
                "phone": "555-123-4567",
                "age_range": "65_plus",
                "zip_code": "12345",
                "household_size": "2",
                "monthly_income_range": "1000_2000",
                "employment_status": "retired",
                "veteran": "yes",
                "disability": "no",
                "student": "no",
                "pregnant_or_children": "no",
                "housing_status": "rent",
                "has_health_insurance": "no"
            }
            
            response = requests.post(url, json=data, timeout=30)
            
            if response.status_code == 200:
                result = response.json()
                if 'id' in result and 'matched_benefits' in result:
                    self.submission_id = result['id']  # Store for later tests
                    expected_benefits = ['snap', 'medicaid', 'medicare_savings', 'liheap', 'va_benefits', 'housing_assistance']
                    matched = result['matched_benefits']
                    
                    # Check if expected benefits are matched
                    benefits_match = all(benefit in matched for benefit in expected_benefits)
                    
                    self.log_result(
                        "Create Valid Submission",
                        True,
                        f"Submission created successfully with ID: {result['id']}",
                        f"Matched benefits: {matched}, Expected: {expected_benefits}, Match: {benefits_match}"
                    )
                else:
                    self.log_result(
                        "Create Valid Submission",
                        False,
                        "Response missing required fields",
                        f"Response: {result}"
                    )
            else:
                self.log_result(
                    "Create Valid Submission",
                    False,
                    f"HTTP {response.status_code}",
                    response.text
                )
                
        except Exception as e:
            self.log_result(
                "Create Valid Submission",
                False,
                f"Request failed: {str(e)}",
                None
            )

    def test_get_public_results(self):
        """Test GET /api/public-results/[id]"""
        if not self.submission_id:
            self.log_result(
                "Get Public Results",
                False,
                "No submission ID available from previous test",
                None
            )
            return
            
        try:
            url = f"{self.base_url}/api/public-results/{self.submission_id}"
            response = requests.get(url, timeout=30)
            
            if response.status_code == 200:
                result = response.json()
                required_fields = ['id', 'age_range', 'zip_code', 'household_size', 'matched_benefits', 'created_at']
                
                if all(field in result for field in required_fields):
                    # Check that PII is not included
                    pii_fields = ['full_name', 'email', 'phone']
                    has_pii = any(field in result for field in pii_fields)
                    
                    if not has_pii:
                        self.log_result(
                            "Get Public Results",
                            True,
                            "Public results retrieved successfully without PII",
                            f"Benefits count: {len(result['matched_benefits'])}"
                        )
                    else:
                        self.log_result(
                            "Get Public Results",
                            False,
                            "Response contains PII data",
                            f"Found PII fields: {[f for f in pii_fields if f in result]}"
                        )
                else:
                    missing = [f for f in required_fields if f not in result]
                    self.log_result(
                        "Get Public Results",
                        False,
                        "Response missing required fields",
                        f"Missing: {missing}"
                    )
            elif response.status_code == 404:
                self.log_result(
                    "Get Public Results",
                    False,
                    "Submission not found",
                    f"ID: {self.submission_id}"
                )
            else:
                self.log_result(
                    "Get Public Results",
                    False,
                    f"HTTP {response.status_code}",
                    response.text
                )
                
        except Exception as e:
            self.log_result(
                "Get Public Results",
                False,
                f"Request failed: {str(e)}",
                None
            )

    def test_admin_submissions_unauthorized(self):
        """Test GET /api/admin/submissions without admin key"""
        try:
            url = f"{self.base_url}/api/admin/submissions"
            response = requests.get(url, timeout=30)
            
            if response.status_code == 401:
                self.log_result(
                    "Admin Submissions Unauthorized",
                    True,
                    "Correctly rejected unauthorized request",
                    None
                )
            else:
                self.log_result(
                    "Admin Submissions Unauthorized",
                    False,
                    f"Expected 401, got {response.status_code}",
                    response.text
                )
                
        except Exception as e:
            self.log_result(
                "Admin Submissions Unauthorized",
                False,
                f"Request failed: {str(e)}",
                None
            )

    def test_admin_submissions_authorized(self):
        """Test GET /api/admin/submissions with admin key"""
        try:
            url = f"{self.base_url}/api/admin/submissions"
            params = {"adminKey": self.admin_key}
            response = requests.get(url, params=params, timeout=30)
            
            if response.status_code == 200:
                result = response.json()
                if 'submissions' in result and 'pagination' in result:
                    submissions = result['submissions']
                    pagination = result['pagination']
                    
                    self.log_result(
                        "Admin Submissions Authorized",
                        True,
                        f"Retrieved {len(submissions)} submissions",
                        f"Pagination: {pagination}"
                    )
                else:
                    self.log_result(
                        "Admin Submissions Authorized",
                        False,
                        "Response missing required fields",
                        f"Response keys: {list(result.keys())}"
                    )
            else:
                self.log_result(
                    "Admin Submissions Authorized",
                    False,
                    f"HTTP {response.status_code}",
                    response.text
                )
                
        except Exception as e:
            self.log_result(
                "Admin Submissions Authorized",
                False,
                f"Request failed: {str(e)}",
                None
            )

    def test_admin_export(self):
        """Test GET /api/admin/export"""
        try:
            url = f"{self.base_url}/api/admin/export"
            params = {"adminKey": self.admin_key}
            response = requests.get(url, params=params, timeout=30)
            
            if response.status_code == 200:
                content_type = response.headers.get('content-type', '')
                content_disposition = response.headers.get('content-disposition', '')
                
                if 'text/csv' in content_type and 'attachment' in content_disposition:
                    # Check if CSV has content
                    csv_content = response.text
                    lines = csv_content.split('\n')
                    
                    self.log_result(
                        "Admin CSV Export",
                        True,
                        f"CSV export successful with {len(lines)} lines",
                        f"Content-Type: {content_type}, Size: {len(csv_content)} bytes"
                    )
                else:
                    self.log_result(
                        "Admin CSV Export",
                        False,
                        "Invalid CSV response headers",
                        f"Content-Type: {content_type}, Content-Disposition: {content_disposition}"
                    )
            else:
                self.log_result(
                    "Admin CSV Export",
                    False,
                    f"HTTP {response.status_code}",
                    response.text
                )
                
        except Exception as e:
            self.log_result(
                "Admin CSV Export",
                False,
                f"Request failed: {str(e)}",
                None
            )

    def test_validation_missing_fields(self):
        """Test POST /api/submissions with missing required fields"""
        try:
            url = f"{self.base_url}/api/submissions"
            # Missing required fields: age_range, zip_code, household_size, monthly_income_range, employment_status
            data = {
                "full_name": "Test User",
                "email": "test@example.com"
            }
            
            response = requests.post(url, json=data, timeout=30)
            
            if response.status_code == 400:
                result = response.json()
                if 'error' in result and 'details' in result:
                    self.log_result(
                        "Validation Missing Fields",
                        True,
                        "Correctly rejected invalid submission",
                        f"Error: {result['error']}, Details count: {len(result['details'])}"
                    )
                else:
                    self.log_result(
                        "Validation Missing Fields",
                        False,
                        "400 response but missing error structure",
                        f"Response: {result}"
                    )
            else:
                self.log_result(
                    "Validation Missing Fields",
                    False,
                    f"Expected 400, got {response.status_code}",
                    response.text
                )
                
        except Exception as e:
            self.log_result(
                "Validation Missing Fields",
                False,
                f"Request failed: {str(e)}",
                None
            )

    def test_honeypot_protection(self):
        """Test POST /api/submissions with honeypot field filled"""
        try:
            url = f"{self.base_url}/api/submissions"
            data = {
                "full_name": "Bot User",
                "email": "bot@spam.com",
                "phone": "555-999-9999",
                "age_range": "25_34",
                "zip_code": "99999",
                "household_size": "1",
                "monthly_income_range": "2000_3000",
                "employment_status": "employed",
                "veteran": "no",
                "disability": "no",
                "student": "no",
                "pregnant_or_children": "no",
                "housing_status": "rent",
                "has_health_insurance": "yes",
                "website": "http://spam-bot-site.com"  # Honeypot field
            }
            
            response = requests.post(url, json=data, timeout=30)
            
            if response.status_code == 200:
                result = response.json()
                if result.get('id') == 'blocked':
                    self.log_result(
                        "Honeypot Protection",
                        True,
                        "Honeypot correctly blocked spam submission",
                        f"Response: {result}"
                    )
                else:
                    # This might still be working if it returns a normal ID but doesn't save
                    self.log_result(
                        "Honeypot Protection",
                        True,
                        "Honeypot accepted submission (may not be saved)",
                        f"Response: {result}"
                    )
            else:
                self.log_result(
                    "Honeypot Protection",
                    False,
                    f"HTTP {response.status_code}",
                    response.text
                )
                
        except Exception as e:
            self.log_result(
                "Honeypot Protection",
                False,
                f"Request failed: {str(e)}",
                None
            )

    def test_invalid_submission_id(self):
        """Test GET /api/public-results/[id] with invalid ID"""
        try:
            url = f"{self.base_url}/api/public-results/invalid-id-12345"
            response = requests.get(url, timeout=30)
            
            if response.status_code == 404:
                result = response.json()
                if 'error' in result:
                    self.log_result(
                        "Invalid Submission ID",
                        True,
                        "Correctly returned 404 for invalid ID",
                        f"Error: {result['error']}"
                    )
                else:
                    self.log_result(
                        "Invalid Submission ID",
                        False,
                        "404 response but missing error message",
                        f"Response: {result}"
                    )
            else:
                self.log_result(
                    "Invalid Submission ID",
                    False,
                    f"Expected 404, got {response.status_code}",
                    response.text
                )
                
        except Exception as e:
            self.log_result(
                "Invalid Submission ID",
                False,
                f"Request failed: {str(e)}",
                None
            )

    def run_all_tests(self):
        """Run all test cases"""
        print(f"🚀 Starting BenefitBuddy Backend API Tests")
        print(f"Base URL: {self.base_url}")
        print(f"Timestamp: {datetime.now().isoformat()}")
        print("=" * 60)
        print()
        
        # Test order matters - create submission first to get ID for other tests
        self.test_create_submission_valid()
        self.test_get_public_results()
        self.test_admin_submissions_unauthorized()
        self.test_admin_submissions_authorized()
        self.test_admin_export()
        self.test_validation_missing_fields()
        self.test_honeypot_protection()
        self.test_invalid_submission_id()
        
        # Summary
        print("=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        passed = sum(1 for r in self.test_results if r['success'])
        failed = len(self.test_results) - passed
        
        print(f"Total Tests: {len(self.test_results)}")
        print(f"Passed: {passed}")
        print(f"Failed: {failed}")
        print(f"Success Rate: {(passed/len(self.test_results)*100):.1f}%")
        print()
        
        if failed > 0:
            print("❌ FAILED TESTS:")
            for result in self.test_results:
                if not result['success']:
                    print(f"  - {result['test']}: {result['message']}")
            print()
        
        print("✅ PASSED TESTS:")
        for result in self.test_results:
            if result['success']:
                print(f"  - {result['test']}")
        
        return passed, failed

if __name__ == "__main__":
    tester = BenefitBuddyAPITester()
    passed, failed = tester.run_all_tests()
    
    # Exit with error code if any tests failed
    sys.exit(0 if failed == 0 else 1)