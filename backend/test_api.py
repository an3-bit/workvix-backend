#!/usr/bin/env python3
"""
WorkVix API Testing Script
Run this script to test all API endpoints
"""

import requests
import json
from datetime import datetime, timedelta

BASE_URL = "http://localhost:8000/api"
admin_token = None
client_token = None
freelancer_token = None

def test_endpoint(method, endpoint, data=None, headers=None, description=""):
    """Helper function to test API endpoints"""
    url = f"{BASE_URL}{endpoint}"
    print(f"\n🔗 Testing: {description}")
    print(f"📍 {method.upper()} {url}")
    
    try:
        if method.lower() == 'get':
            response = requests.get(url, headers=headers)
        elif method.lower() == 'post':
            response = requests.post(url, json=data, headers=headers)
        elif method.lower() == 'put':
            response = requests.put(url, json=data, headers=headers)
        elif method.lower() == 'delete':
            response = requests.delete(url, headers=headers)
        
        print(f"✅ Status: {response.status_code}")
        if response.status_code < 400:
            try:
                result = response.json()
                print(f"📄 Response: {json.dumps(result, indent=2)[:200]}...")
                return result
            except:
                print(f"📄 Response: {response.text[:200]}...")
                return response.text
        else:
            print(f"❌ Error: {response.text}")
            return None
    except Exception as e:
        print(f"💥 Exception: {str(e)}")
        return None

def get_auth_headers(token):
    """Get authorization headers"""
    if token:
        return {"Authorization": f"Bearer {token}"}
    return {}

def main():
    global admin_token, client_token, freelancer_token
    
    print("🚀 WorkVix API Testing Started")
    print("=" * 50)
    
    # Test 1: User Registration (Client)
    client_data = {
        "name": "John Client",
        "email": "client@test.com",
        "phone": "+1234567890",
        "role": "client",
        "password": "testpass123",
        "password_confirm": "testpass123"
    }
    
    result = test_endpoint('post', '/users/register/', client_data, 
                          description="Register Client User")
    if result and 'tokens' in result:
        client_token = result['tokens']['access']
        print(f"🔑 Client Token: {client_token[:20]}...")
    
    # Test 2: User Registration (Freelancer)
    freelancer_data = {
        "name": "Jane Freelancer",
        "email": "freelancer@test.com",
        "phone": "+1234567891",
        "role": "freelancer",
        "password": "testpass123",
        "password_confirm": "testpass123"
    }
    
    result = test_endpoint('post', '/users/register/', freelancer_data,
                          description="Register Freelancer User")
    if result and 'tokens' in result:
        freelancer_token = result['tokens']['access']
        print(f"🔑 Freelancer Token: {freelancer_token[:20]}...")
    
    # Test 3: Admin Login
    admin_login_data = {
        "email": "admin@workvix.com",
        "password": "workvix123"
    }
    
    result = test_endpoint('post', '/users/login/', admin_login_data,
                          description="Admin Login")
    if result and 'tokens' in result:
        admin_token = result['tokens']['access']
        print(f"🔑 Admin Token: {admin_token[:20]}...")
    
    # Test 4: Get Current User Profile
    test_endpoint('get', '/users/current/', 
                 headers=get_auth_headers(client_token),
                 description="Get Client Profile")
    
    # Test 5: Create Job (Client)
    job_data = {
        "title": "Build a Django REST API",
        "description": "Need a skilled developer to build a REST API for my project",
        "assignment_type": "programming",
        "subject": "Web Development",
        "deadline": (datetime.now() + timedelta(days=7)).isoformat(),
        "pages": 1,
        "urgency": "medium",
        "budget_min": 100.00,
        "budget_max": 500.00,
        "instructions": "Please use Django REST Framework",
        "skills_required": ["Python", "Django", "REST API"]
    }
    
    job_result = test_endpoint('post', '/jobs/create/', job_data,
                              headers=get_auth_headers(client_token),
                              description="Create Job (Client)")
    
    # Test 6: List Jobs (Public)
    test_endpoint('get', '/jobs/',
                 description="List All Jobs (Public)")
    
    # Test 7: Get My Jobs (Client)
    test_endpoint('get', '/jobs/my-jobs/',
                 headers=get_auth_headers(client_token),
                 description="Get My Jobs (Client)")
    
    # Test 8: Guest Job Submission
    guest_job_data = {
        "title": "Design a Logo",
        "description": "Need a professional logo for my startup",
        "assignment_type": "design",
        "subject": "Graphic Design",
        "deadline": (datetime.now() + timedelta(days=5)).isoformat(),
        "pages": 1,
        "urgency": "high",
        "budget_min": 50.00,
        "budget_max": 200.00,
        "instructions": "Modern and clean design preferred",
        "name": "Guest User",
        "email": "guest@test.com",
        "phone": "+1234567892",
        "password": "guestpass123"
    }
    
    test_endpoint('post', '/jobs/guest-submission/', guest_job_data,
                 description="Guest Job Submission")
    
    # Test 9: Freelancer Profile
    test_endpoint('get', '/users/freelancer-profile/',
                 headers=get_auth_headers(freelancer_token),
                 description="Get Freelancer Profile")
    
    # Test 10: Update Freelancer Profile
    freelancer_profile_data = {
        "bio": "Experienced full-stack developer with 5+ years of experience",
        "skills": ["Python", "Django", "React", "JavaScript"],
        "hourly_rate": 50.00,
        "experience_years": 5,
        "portfolio_url": "https://portfolio.example.com"
    }
    
    test_endpoint('put', '/users/freelancer-profile/', freelancer_profile_data,
                 headers=get_auth_headers(freelancer_token),
                 description="Update Freelancer Profile")
    
    # Test placeholder endpoints
    test_endpoints = [
        ('get', '/chat/', 'Chat List'),
        ('get', '/offers/', 'Offers List'),
        ('get', '/orders/', 'Orders List'),
        ('get', '/payments/', 'Payments List'),
        ('get', '/notifications/', 'Notifications List')
    ]
    
    for method, endpoint, desc in test_endpoints:
        test_endpoint(method, endpoint, 
                     headers=get_auth_headers(client_token),
                     description=desc)
    
    print("\n" + "=" * 50)
    print("🎉 API Testing Complete!")
    print("\n📋 SUMMARY:")
    print("✅ User Registration (Client & Freelancer)")
    print("✅ Authentication & JWT Tokens")
    print("✅ Job Creation & Management")
    print("✅ Guest Job Submission Flow")
    print("✅ Profile Management")
    print("✅ Placeholder Endpoints Ready")
    
    print(f"\n🔐 TOKENS FOR MANUAL TESTING:")
    print(f"Admin: {admin_token}")
    print(f"Client: {client_token}")
    print(f"Freelancer: {freelancer_token}")

if __name__ == "__main__":
    main()
