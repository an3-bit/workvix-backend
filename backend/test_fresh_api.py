#!/usr/bin/env python3
"""
Fresh API Test with Unique Users
Tests all WorkVix API endpoints with newly created users
"""

import requests
import json
from datetime import datetime, timedelta
import time

# Configuration
BASE_URL = 'http://localhost:8000'
timestamp = int(time.time())

def print_section(title):
    print(f"\n{'='*60}")
    print(f"🔥 {title}")
    print('='*60)

def test_endpoint(method, url, data=None, headers=None, description=""):
    """Test an API endpoint and return the response"""
    full_url = f"{BASE_URL}{url}"
    print(f"\n🔗 {description}")
    print(f"📍 {method.upper()} {full_url}")
    
    try:
        if method.lower() == 'get':
            response = requests.get(full_url, headers=headers)
        elif method.lower() == 'post':
            response = requests.post(full_url, json=data, headers=headers)
        elif method.lower() == 'put':
            response = requests.put(full_url, json=data, headers=headers)
        elif method.lower() == 'delete':
            response = requests.delete(full_url, headers=headers)
        
        print(f"✅ Status: {response.status_code}")
        
        if response.status_code < 400:
            result = response.json()
            # Truncate long responses for readability
            if len(str(result)) > 500:
                print(f"📄 Response: {str(result)[:500]}...")
            else:
                print(f"📄 Response: {json.dumps(result, indent=2)}")
            return result
        else:
            print(f"❌ Error: {response.text[:200]}")
            return None
            
    except Exception as e:
        print(f"💥 Exception: {str(e)}")
        return None

def main():
    print_section("FRESH WORKVIX API TESTING")
    
    # Generate unique emails
    client_email = f"freshclient{timestamp}@workvix.com"
    freelancer_email = f"freshfreelancer{timestamp}@workvix.com"
    
    tokens = {}
    
    # 1. Register Fresh Client
    print_section("USER REGISTRATION")
    client_data = {
        "name": "Fresh Test Client",
        "email": client_email,
        "phone": "+1234567890",
        "role": "client",
        "password": "testpass123",
        "password_confirm": "testpass123"
    }
    
    client_result = test_endpoint('post', '/api/users/register/', client_data, description="Register Fresh Client")
    if client_result and 'tokens' in client_result:
        tokens['client'] = client_result['tokens']['access']
        print(f"✅ Client token obtained")
    
    # 2. Register Fresh Freelancer
    freelancer_data = {
        "name": "Fresh Test Freelancer",
        "email": freelancer_email,
        "phone": "+1234567891",
        "role": "freelancer",
        "password": "testpass123",
        "password_confirm": "testpass123"
    }
    
    freelancer_result = test_endpoint('post', '/api/users/register/', freelancer_data, description="Register Fresh Freelancer")
    if freelancer_result and 'tokens' in freelancer_result:
        tokens['freelancer'] = freelancer_result['tokens']['access']
        print(f"✅ Freelancer token obtained")
    
    # 3. Admin Login
    admin_data = {
        "email": "admin@workvix.com",
        "password": "workvix123"
    }
    
    admin_result = test_endpoint('post', '/api/users/login/', admin_data, description="Admin Login")
    if admin_result and 'tokens' in admin_result:
        tokens['admin'] = admin_result['tokens']['access']
        print(f"✅ Admin token obtained")
    
    def get_headers(role):
        token = tokens.get(role)
        return {"Authorization": f"Bearer {token}"} if token else {}
    
    # 4. Test Jobs
    print_section("JOBS TESTING")
    
    job_data = {
        "title": "Fresh API Test Job",
        "description": "Testing all job endpoints with fresh data",
        "assignment_type": "programming",
        "subject": "API Development",
        "deadline": (datetime.now() + timedelta(days=7)).isoformat(),
        "pages": 5,
        "urgency": "medium",
        "budget_min": 300.00,
        "budget_max": 800.00,
        "instructions": "Build comprehensive API endpoints",
        "skills_required": ["Python", "Django", "REST API"]
    }
    
    job_result = test_endpoint('post', '/api/jobs/create/', job_data, get_headers('client'), "Create Job")
    job_id = job_result['id'] if job_result else None
    
    test_endpoint('get', '/api/jobs/', description="List All Jobs (Public)")
    test_endpoint('get', '/api/jobs/my-jobs/', headers=get_headers('client'), description="Get Client's Jobs")
    
    if job_id:
        test_endpoint('get', f'/api/jobs/{job_id}/', description="Get Job Details")
    
    # 5. Test Chat System
    print_section("CHAT SYSTEM TESTING")
    
    test_endpoint('get', '/api/chat/', headers=get_headers('client'), description="List Chats (Client)")
    test_endpoint('get', '/api/chat/', headers=get_headers('freelancer'), description="List Chats (Freelancer)")
    
    if job_id:
        chat_data = {"job": job_id}
        chat_result = test_endpoint('post', '/api/chat/create/', chat_data, get_headers('freelancer'), "Create Chat")
        chat_id = chat_result['id'] if chat_result else None
        
        if chat_id:
            message_data = {
                "chat": chat_id,
                "message": "Hello! I'm interested in your project."
            }
            test_endpoint('post', '/api/chat/send-message/', message_data, get_headers('freelancer'), "Send Message")
    
    # 6. Test Offers System
    print_section("OFFERS SYSTEM TESTING")
    
    test_endpoint('get', '/api/offers/', headers=get_headers('client'), description="List Offers (Client)")
    test_endpoint('get', '/api/offers/', headers=get_headers('freelancer'), description="List Offers (Freelancer)")
    
    if job_id:
        offer_data = {
            "job": job_id,
            "amount": 500.00,
            "delivery_time": 7,
            "description": "I can deliver high-quality API development work using Django REST Framework."
        }
        offer_result = test_endpoint('post', '/api/offers/create/', offer_data, get_headers('freelancer'), "Create Offer")
        offer_id = offer_result['id'] if offer_result else None
        
        if offer_id:
            test_endpoint('post', f'/api/offers/{offer_id}/accept/', {}, get_headers('client'), "Accept Offer")
    
    # 7. Test Orders System
    print_section("ORDERS SYSTEM TESTING")
    
    test_endpoint('get', '/api/orders/', headers=get_headers('client'), description="List Orders (Client)")
    test_endpoint('get', '/api/orders/', headers=get_headers('freelancer'), description="List Orders (Freelancer)")
    
    # 8. Test Payments System
    print_section("PAYMENTS SYSTEM TESTING")
    
    test_endpoint('get', '/api/payments/', headers=get_headers('client'), description="List Payments (Client)")
    test_endpoint('get', '/api/payments/methods/', headers=get_headers('client'), description="List Payment Methods")
    
    # 9. Test Notifications System
    print_section("NOTIFICATIONS SYSTEM TESTING")
    
    test_endpoint('get', '/api/notifications/', headers=get_headers('client'), description="List Notifications (Client)")
    test_endpoint('get', '/api/notifications/', headers=get_headers('freelancer'), description="List Notifications (Freelancer)")
    test_endpoint('get', '/api/notifications/unread-count/', headers=get_headers('client'), description="Get Unread Count")
    
    # 10. Test Profile Management
    print_section("PROFILE MANAGEMENT TESTING")
    
    test_endpoint('get', '/api/users/current/', headers=get_headers('client'), description="Get Current User (Client)")
    test_endpoint('get', '/api/users/current/', headers=get_headers('freelancer'), description="Get Current User (Freelancer)")
    
    # Update freelancer profile
    profile_data = {
        "bio": "Expert Django developer with 5+ years experience in API development",
        "skills": ["Python", "Django", "REST API", "PostgreSQL"],
        "hourly_rate": 75.00,
        "availability": "full_time"
    }
    test_endpoint('put', '/api/users/freelancer-profile/', profile_data, get_headers('freelancer'), "Update Freelancer Profile")
    
    print_section("TESTING COMPLETE!")
    print("🎉 All WorkVix API endpoints have been tested!")
    print(f"📊 Test completed with users:")
    print(f"   👤 Client: {client_email}")
    print(f"   🔧 Freelancer: {freelancer_email}")
    print(f"   🔑 Admin: admin@workvix.com")

if __name__ == "__main__":
    main()
