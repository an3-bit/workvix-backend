from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from common.models import BaseModel


class UserManager(BaseUserManager):
    """Custom user manager"""
    
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', User.ADMIN)
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
        
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin, BaseModel):
    """Custom User model"""
    
    CLIENT = 'client'
    FREELANCER = 'freelancer'
    ADMIN = 'admin'
    
    ROLE_CHOICES = [
        (CLIENT, 'Client'),
        (FREELANCER, 'Freelancer'),
        (ADMIN, 'Admin'),
    ]
    
    PENDING = 'pending'
    ACTIVE = 'active'
    SUSPENDED = 'suspended'
    
    STATUS_CHOICES = [
        (PENDING, 'Pending'),
        (ACTIVE, 'Active'),
        (SUSPENDED, 'Suspended'),
    ]
    
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=100)
    phone = models.CharField(max_length=20, blank=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default=CLIENT)
    profile_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=PENDING)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    email_verified = models.BooleanField(default=False)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    
    objects = UserManager()
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name']
    
    class Meta:
        db_table = 'users'
        
    def __str__(self):
        return f"{self.name} ({self.email})"


class FreelancerProfile(BaseModel):
    """Extended profile for freelancers"""
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='freelancer_profile')
    bio = models.TextField(blank=True)
    skills = models.JSONField(default=list)  # Store as array of skill names
    hourly_rate = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    experience_years = models.PositiveIntegerField(default=0)
    portfolio_url = models.URLField(blank=True)
    linkedin_url = models.URLField(blank=True)
    github_url = models.URLField(blank=True)
    is_verified = models.BooleanField(default=False)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.00)
    total_jobs_completed = models.PositiveIntegerField(default=0)
    
    class Meta:
        db_table = 'freelancer_profiles'
        
    def __str__(self):
        return f"Freelancer Profile - {self.user.name}"
