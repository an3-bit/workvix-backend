# WorkVix API Testing Guide

## 🚀 Quick Start Testing

### 1. Start the Server
```bash
cd /home/andrew/workvixb/backend
source venv/bin/activate
python manage.py runserver
```

### 2. Test with the Python Script
```bash
pip install requests
python test_api.py
```

### 3. Manual Testing with curl/Postman

## 📊 Dashboard Endpoints Overview

### 🏢 Admin Dashboard
- **URL**: `http://localhost:8000/admin/`
- **Login**: admin@workvix.com / workvix123
- **Features**: Complete system management

### 👤 Client Dashboard APIs
Base URL: `http://localhost:8000/api`

#### Authentication
```bash
# Login
curl -X POST http://localhost:8000/api/users/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"client@test.com","password":"testpass123"}'
```

#### Client-Specific Endpoints
```bash
# Get client profile
curl -X GET http://localhost:8000/api/users/current/ \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get my posted jobs
curl -X GET http://localhost:8000/api/jobs/my-jobs/ \
  -H "Authorization: Bearer YOUR_TOKEN"

# Create new job
curl -X POST http://localhost:8000/api/jobs/create/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Web Development Project",
    "description": "Build a responsive website",
    "assignment_type": "programming",
    "subject": "Web Development",
    "deadline": "2025-12-25T10:00:00Z",
    "pages": 5,
    "urgency": "medium",
    "budget_min": 200,
    "budget_max": 800,
    "skills_required": ["HTML", "CSS", "JavaScript"]
  }'

# View job offers (coming soon)
curl -X GET http://localhost:8000/api/offers/ \
  -H "Authorization: Bearer YOUR_TOKEN"

# View orders (coming soon)
curl -X GET http://localhost:8000/api/orders/ \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 👨‍💻 Freelancer Dashboard APIs

#### Authentication
```bash
# Register as freelancer
curl -X POST http://localhost:8000/api/users/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Freelancer",
    "email": "freelancer@test.com",
    "phone": "+1234567890",
    "role": "freelancer",
    "password": "testpass123",
    "password_confirm": "testpass123"
  }'
```

#### Freelancer-Specific Endpoints
```bash
# Get freelancer profile
curl -X GET http://localhost:8000/api/users/freelancer-profile/ \
  -H "Authorization: Bearer YOUR_TOKEN"

# Update freelancer profile
curl -X PUT http://localhost:8000/api/users/freelancer-profile/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bio": "Expert Python developer",
    "skills": ["Python", "Django", "React"],
    "hourly_rate": 75.00,
    "experience_years": 5,
    "portfolio_url": "https://myportfolio.com"
  }'

# Browse available jobs
curl -X GET http://localhost:8000/api/jobs/ \
  -H "Authorization: Bearer YOUR_TOKEN"

# Search jobs by skills
curl -X GET "http://localhost:8000/api/jobs/?search=Python" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Filter jobs by budget
curl -X GET "http://localhost:8000/api/jobs/?min_budget=100&max_budget=500" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Create offer (coming soon)
curl -X POST http://localhost:8000/api/offers/create/ \
  -H "Authorization: Bearer YOUR_TOKEN"

# View my orders (coming soon)
curl -X GET http://localhost:8000/api/orders/my-orders/ \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🎮 Interactive Testing URLs

### Web Browser Testing
1. **Django Admin**: http://localhost:8000/admin/
2. **API Root**: http://localhost:8000/api/
3. **Job Listings**: http://localhost:8000/api/jobs/
4. **User Registration**: http://localhost:8000/api/users/register/

### Postman Collection
Import these endpoints into Postman for easy testing:

```json
{
  "info": {"name": "WorkVix API"},
  "item": [
    {
      "name": "User Registration",
      "request": {
        "method": "POST",
        "url": "{{base_url}}/users/register/",
        "body": {
          "mode": "raw",
          "raw": "{\n  \"name\": \"Test User\",\n  \"email\": \"test@test.com\",\n  \"role\": \"client\",\n  \"password\": \"testpass123\",\n  \"password_confirm\": \"testpass123\"\n}"
        }
      }
    },
    {
      "name": "User Login",
      "request": {
        "method": "POST",
        "url": "{{base_url}}/users/login/",
        "body": {
          "mode": "raw",
          "raw": "{\n  \"email\": \"test@test.com\",\n  \"password\": \"testpass123\"\n}"
        }
      }
    }
  ]
}
```

## 🔍 Testing Scenarios

### 1. Complete User Journey (Client)
1. Register as client
2. Create job posting
3. View job in listings
4. Check job status
5. View offers (when implemented)
6. Accept offer and make payment (when implemented)

### 2. Complete User Journey (Freelancer)
1. Register as freelancer
2. Complete profile with skills
3. Browse available jobs
4. Create offer for job (when implemented)
5. Work on accepted projects (when implemented)

### 3. Guest Job Submission Flow
1. Submit job as guest
2. Complete registration
3. Verify job is now live

## 📱 Dashboard Features to Test

### Client Dashboard Features
- ✅ User authentication & profile management
- ✅ Job posting and management
- ✅ Job status tracking
- 🔄 Offer management (placeholder)
- 🔄 Payment processing (placeholder)
- 🔄 Order tracking (placeholder)
- 🔄 Chat with freelancers (placeholder)

### Freelancer Dashboard Features
- ✅ User authentication & profile management
- ✅ Extended freelancer profile
- ✅ Job browsing and search
- ✅ Job filtering by budget/skills
- 🔄 Offer creation (placeholder)
- 🔄 Order management (placeholder)
- 🔄 Chat with clients (placeholder)
- 🔄 Earnings tracking (placeholder)

### Admin Dashboard Features
- ✅ Django admin interface
- ✅ User management
- ✅ Job oversight
- ✅ System administration

## 🚨 Error Testing
Test these scenarios to ensure proper error handling:
- Invalid credentials
- Expired tokens
- Permission denied (wrong user role)
- Invalid data formats
- Missing required fields
