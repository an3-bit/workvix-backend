from django.db import models
from django.contrib.auth import get_user_model
from common.models import BaseModel

User = get_user_model()


class Job(BaseModel):
    """Job model for job postings"""
    
    ACADEMIC_WRITING = 'academic_writing'
    PROGRAMMING = 'programming'
    DESIGN = 'design'
    MARKETING = 'marketing'
    BUSINESS = 'business'
    OTHER = 'other'
    
    ASSIGNMENT_TYPE_CHOICES = [
        (ACADEMIC_WRITING, 'Academic Writing'),
        (PROGRAMMING, 'Programming'),
        (DESIGN, 'Design'),
        (MARKETING, 'Marketing'),
        (BUSINESS, 'Business'),
        (OTHER, 'Other'),
    ]
    
    LOW = 'low'
    MEDIUM = 'medium'
    HIGH = 'high'
    URGENT = 'urgent'
    
    URGENCY_CHOICES = [
        (LOW, 'Low'),
        (MEDIUM, 'Medium'),
        (HIGH, 'High'),
        (URGENT, 'Urgent'),
    ]
    
    PENDING_REGISTRATION = 'pending_registration'
    OPEN = 'open'
    CLOSED = 'closed'
    IN_PROGRESS = 'in_progress'
    COMPLETED = 'completed'
    CANCELLED = 'cancelled'
    
    STATUS_CHOICES = [
        (PENDING_REGISTRATION, 'Pending Registration'),
        (OPEN, 'Open'),
        (CLOSED, 'Closed'),
        (IN_PROGRESS, 'In Progress'),
        (COMPLETED, 'Completed'),
        (CANCELLED, 'Cancelled'),
    ]
    
    client = models.ForeignKey(User, on_delete=models.CASCADE, related_name='jobs')
    title = models.CharField(max_length=200)
    description = models.TextField()
    assignment_type = models.CharField(max_length=50, choices=ASSIGNMENT_TYPE_CHOICES)
    subject = models.CharField(max_length=100)
    deadline = models.DateTimeField()
    pages = models.PositiveIntegerField(default=1)
    urgency = models.CharField(max_length=20, choices=URGENCY_CHOICES, default=MEDIUM)
    budget_min = models.DecimalField(max_digits=10, decimal_places=2)
    budget_max = models.DecimalField(max_digits=10, decimal_places=2)
    instructions = models.TextField(blank=True)
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default=PENDING_REGISTRATION)
    skills_required = models.JSONField(default=list)  # Array of required skills
    is_featured = models.BooleanField(default=False)
    views_count = models.PositiveIntegerField(default=0)
    offers_count = models.PositiveIntegerField(default=0)
    
    class Meta:
        db_table = 'jobs'
        ordering = ['-created_at']
        
    def __str__(self):
        return f"{self.title} - {self.client.name}"
    
    @property
    def is_expired(self):
        from django.utils import timezone
        return self.deadline < timezone.now()


class JobAttachment(BaseModel):
    """Job attachment model"""
    
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='attachments')
    file = models.FileField(upload_to='job_attachments/')
    original_name = models.CharField(max_length=255)
    file_size = models.PositiveIntegerField()
    content_type = models.CharField(max_length=100)
    
    class Meta:
        db_table = 'job_attachments'
        
    def __str__(self):
        return f"{self.job.title} - {self.original_name}"


class JobView(BaseModel):
    """Track job views by users"""
    
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='job_views')
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    
    class Meta:
        db_table = 'job_views'
        unique_together = ('job', 'user')  # One view per user per job
