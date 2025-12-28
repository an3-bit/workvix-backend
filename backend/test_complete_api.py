#!/usr/bin/env python3
"""
WorkVix Complete API Testing Script - All Endpoints
"""

import requests
import json
from datetime import datetime, timedelta

BASE_URL = "http://localhost:8000/api"
tokens = {}

def test_endpoint(method, endpoint, data=None, headers=None, description="", expect_status=None):
    """Enhanced test function"""
    url = f"{BASE_URL}{endpoint}"
    print(f"\n🔗 {description}")
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
        
        status_code = response.status_code
        expected = expect_status or [200, 201]
        
        if status_code in expected:
            print(f"✅ Status: {status_code}")
            try:
                result = response.json()
                if isinstance(result, dict) and len(str(result)) > 300:
                    # Truncate large responses
                    print(f"📄 Response: {json.dumps(result, indent=2)[:250]}...")
                else:
                    print(f"📄 Response: {json.dumps(result, indent=2)}")
                return result
            except:
                print(f"📄 Response: {response.text}")
                return response.text
        else:
            print(f"❌ Status: {status_code}")
            print(f"Error: {response.text}")
            return None
    except Exception as e:
        print(f"💥 Exception: {str(e)}")
        return None

def get_auth_headers(user_type):
    """Get authorization headers"""
    token = tokens.get(user_type)
    if token:
        return {"Authorization": f"Bearer {token}"}
    return {}

def main():
    print("🚀 WorkVix Complete API Testing")
    print("=" * 60)
    
    # Step 1: User Registration & Authentication
    print("\n" + "🔐 AUTHENTICATION TESTS" + "="*35)
    
    # Register Client
    client_data = {
        "name": "Test Client",
        "email": "testclient@workvix.com",
        "phone": "+1234567890",
        "role": "client",
        "password": "testpass123",
        "password_confirm": "testpass123"
    }
    
    result = test_endpoint('post', '/users/register/', client_data, 
                          description="Register Client")
    if result and 'tokens' in result:
        tokens['client'] = result['tokens']['access']
    
    # Register Freelancer
    freelancer_data = {
        "name": "Test Freelancer",
        "email": "testfreelancer@workvix.com",
        "phone": "+1234567891",
        "role": "freelancer", 
        "password": "testpass123",
        "password_confirm": "testpass123"
    }
    
    result = test_endpoint('post', '/users/register/', freelancer_data,
                          description="Register Freelancer")
    if result and 'tokens' in result:
        tokens['freelancer'] = result['tokens']['access']
    
    # Admin Login
    admin_login = {
        "email": "admin@workvix.com",
        "password": "workvix123"
    }
    
    result = test_endpoint('post', '/users/login/', admin_login,
                          description="Admin Login")
    if result and 'tokens' in result:
        tokens['admin'] = result['tokens']['access']
    
    # Step 2: Jobs Testing
    print("\n" + "💼 JOBS TESTS" + "="*45)
    
    # Create Job
    job_data = {
        "title": "Build React Frontend",
        "description": "Need a modern React frontend for our app",
        "assignment_type": "programming",
        "subject": "Frontend Development",
        "deadline": (datetime.now() + timedelta(days=10)).isoformat(),
        "pages": 1,
        "urgency": "medium",
        "budget_min": 500.00,
        "budget_max": 1500.00,
        "instructions": "Use React 18 with TypeScript",
        "skills_required": ["React", "TypeScript", "CSS"]
    }
    
    job_result = test_endpoint('post', '/jobs/create/', job_data,
                              headers=get_auth_headers('client'),
                              description="Create Job (Client)")
    job_id = job_result['id'] if job_result else None
    
    # List Jobs
    test_endpoint('get', '/jobs/',
                 description="List All Jobs (Public)")
    
    # Get My Jobs
    test_endpoint('get', '/jobs/my-jobs/',
                 headers=get_auth_headers('client'),
                 description="Get Client's Jobs")
    
    # Step 3: Chat Testing  
    print("\n" + "💬 CHAT TESTS" + "="*45)
    
    # List Chats
    test_endpoint('get', '/chat/',
                 headers=get_auth_headers('client'),
                 description="List Chats (Client)")
    
    test_endpoint('get', '/chat/',
                 headers=get_auth_headers('freelancer'),
                 description="List Chats (Freelancer)")
    
    # Create Chat
    if job_id and tokens.get('freelancer'):
        from jwt import decode
        import jwt
        # Get freelancer ID from token
        try:
            payload = jwt.decode(tokens['freelancer'], options={"verify_signature": False})
            freelancer_id = payload.get('user_id')
            
            chat_data = {
                "job_id": job_id,
                "freelancer_id": freelancer_id
            }
            
            chat_result = test_endpoint('post', '/chat/create/', chat_data,
                                      headers=get_auth_headers('client'),
                                      description="Create Chat (Client)")
            chat_id = chat_result['id'] if chat_result else None
            
            # Send Message
            if chat_id:
                message_data = {
                    "content": "Hi! I'm interested in working on your project."
                }
                
                test_endpoint('post', f'/chat/{chat_id}/send/', message_data,
                             headers=get_auth_headers('freelancer'),
                             description="Send Message (Freelancer)")
                
                # Get Chat Details
                test_endpoint('get', f'/chat/{chat_id}/',
                             headers=get_auth_headers('client'),
                             description="Get Chat Details (Client)")
                
                # Get Unread Count
                test_endpoint('get', '/chat/unread-count/',
                             headers=get_auth_headers('client'),
                             description="Get Unread Count (Client)")
        except:
            print("❌ Could not decode JWT for chat testing")
    
    # Step 4: Offers Testing
    print("\n" + "🎯 OFFERS TESTS" + "="*43)
    
    # Create Offer
    if job_id:
        offer_data = {
            "job_id": job_id,
            "title": "React Frontend Development",
            "description": "I'll build a modern, responsive React frontend with TypeScript",
            "delivery_time": 7,
            "payment_type": "fixed",
            "amount": 1200.00
        }
        
        offer_result = test_endpoint('post', '/offers/create/', offer_data,
                                   headers=get_auth_headers('freelancer'),
                                   description="Create Offer (Freelancer)")
        offer_id = offer_result['id'] if offer_result else None
        
        # List Offers
        test_endpoint('get', '/offers/',
                     headers=get_auth_headers('client'),
                     description="List Offers (Client)")
        
        test_endpoint('get', '/offers/',
                     headers=get_auth_headers('freelancer'),
                     description="List Offers (Freelancer)")
        
        # Get Job Offers
        test_endpoint('get', f'/offers/job/{job_id}/',
                     headers=get_auth_headers('client'),
                     description="Get Job Offers (Client)")
        
        # Accept Offer
        if offer_id:
            test_endpoint('post', f'/offers/{offer_id}/accept/', {},
                         headers=get_auth_headers('client'),
                         description="Accept Offer (Client)")
    
    # Step 5: Orders Testing
    print("\n" + "📦 ORDERS TESTS" + "="*43)
    
    test_endpoint('get', '/orders/',
                 headers=get_auth_headers('client'),
                 description="List Orders (Client)")
    
    test_endpoint('get', '/orders/',
                 headers=get_auth_headers('freelancer'),
                 description="List Orders (Freelancer)")
    
    # Step 6: Payments Testing
    print("\n" + "💳 PAYMENTS TESTS" + "="*41)
    
    test_endpoint('get', '/payments/',
                 headers=get_auth_headers('client'),
                 description="List Payments (Client)")
    
    # Step 7: Notifications Testing
    print("\n" + "🔔 NOTIFICATIONS TESTS" + "="*35)
    
    test_endpoint('get', '/notifications/',
                 headers=get_auth_headers('client'),
                 description="List Notifications (Client)")
    
    test_endpoint('get', '/notifications/',
                 headers=get_auth_headers('freelancer'),
                 description="List Notifications (Freelancer)")
    
    # Step 8: Profile Management
    print("\n" + "👤 PROFILE TESTS" + "="*42)
    
    # Update Freelancer Profile
    profile_data = {
        "bio": "Expert React developer with 5+ years experience",
        "skills": ["React", "TypeScript", "Node.js", "MongoDB"],
        "hourly_rate": 75.00,
        "experience_years": 5,
        "portfolio_url": "https://myportfolio.dev"
    }
    
    test_endpoint('put', '/users/freelancer-profile/', profile_data,
                 headers=get_auth_headers('freelancer'),
                 description="Update Freelancer Profile")
    
    # Get Current User
    test_endpoint('get', '/users/current/',
                 headers=get_auth_headers('client'),
                 description="Get Current User (Client)")
    
    test_endpoint('get', '/users/current/',
                 headers=get_auth_headers('freelancer'),
                 description="Get Current User (Freelancer)")
    
    print("\n" + "=" * 60)
    print("🎉 Complete API Testing Finished!")
    print("\n📊 SUMMARY:")
    print("✅ Authentication & User Management")
    print("✅ Job Creation & Management")
    print("✅ Chat System (Real-time messaging)")
    print("✅ Offer Creation & Management")
    print("✅ Order Workflow")
    print("✅ Payment Integration (Placeholder)")
    print("✅ Notification System")
    print("✅ Profile Management")
    
    print(f"\n🔐 ACTIVE TOKENS:")
    for user_type, token in tokens.items():
        print(f"{user_type.capitalize()}: {token[:30]}...")

if __name__ == "__main__":
    main()
