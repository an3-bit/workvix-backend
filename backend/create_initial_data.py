#!/usr/bin/env python
"""
Script to create initial data for WorkVix backend
"""
import os
import sys
import django

# Add project root to Python path
sys.path.append('/home/andrew/workvixb/backend')

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'workvix_project.settings')
django.setup()

from django.contrib.auth import get_user_model
from users.models import FreelancerProfile

User = get_user_model()

def create_initial_data():
    """Create initial users and data"""
    
    # Create admin user
    if not User.objects.filter(email='admin@workvix.com').exists():
        admin_user = User.objects.create_user(
            email='admin@workvix.com',
            name='Workvix Admin',
            password='admin123',
            role=User.ADMIN,
            profile_status=User.ACTIVE,
            is_staff=True,
            is_superuser=True,
            email_verified=True
        )
        print(f"Created admin user: {admin_user.email}")
    
    # Create sample client
    if not User.objects.filter(email='client@example.com').exists():
        client_user = User.objects.create_user(
            email='client@example.com',
            name='John Client',
            password='client123',
            role=User.CLIENT,
            profile_status=User.ACTIVE,
            email_verified=True
        )
        print(f"Created client user: {client_user.email}")
    
    # Create sample freelancer
    if not User.objects.filter(email='freelancer@example.com').exists():
        freelancer_user = User.objects.create_user(
            email='freelancer@example.com',
            name='Jane Freelancer',
            password='freelancer123',
            role=User.FREELANCER,
            profile_status=User.ACTIVE,
            email_verified=True
        )
        
        # Create freelancer profile
        FreelancerProfile.objects.create(
            user=freelancer_user,
            bio="Experienced web developer and designer",
            skills=['Python', 'Django', 'React', 'JavaScript', 'CSS'],
            hourly_rate=50.00,
            experience_years=5,
            is_verified=True
        )
        print(f"Created freelancer user: {freelancer_user.email}")

if __name__ == '__main__':
    create_initial_data()
    print("Initial data created successfully!")
