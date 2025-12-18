from django.db import models
from django.contrib.auth import get_user_model
from common.models import BaseModel

User = get_user_model()


class Notification(BaseModel):
    """Notification model for in-app and email notifications"""
    
    # Notification types
    NEW_MESSAGE = 'new_message'
    NEW_OFFER = 'new_offer'
    OFFER_ACCEPTED = 'offer_accepted'
    OFFER_REJECTED = 'offer_rejected'
    PAYMENT_CONFIRMED = 'payment_confirmed'
    WORK_SUBMITTED = 'work_submitted'
    ORDER_COMPLETED = 'order_completed'
    ORDER_CANCELLED = 'order_cancelled'
    REVISION_REQUESTED = 'revision_requested'
    DEADLINE_REMINDER = 'deadline_reminder'
    
    TYPE_CHOICES = [
        (NEW_MESSAGE, 'New Message'),
        (NEW_OFFER, 'New Offer'),
        (OFFER_ACCEPTED, 'Offer Accepted'),
        (OFFER_REJECTED, 'Offer Rejected'),
        (PAYMENT_CONFIRMED, 'Payment Confirmed'),
        (WORK_SUBMITTED, 'Work Submitted'),
        (ORDER_COMPLETED, 'Order Completed'),
        (ORDER_CANCELLED, 'Order Cancelled'),
        (REVISION_REQUESTED, 'Revision Requested'),
        (DEADLINE_REMINDER, 'Deadline Reminder'),
    ]
    
    # Priority levels
    LOW = 'low'
    MEDIUM = 'medium'
    HIGH = 'high'
    URGENT = 'urgent'
    
    PRIORITY_CHOICES = [
        (LOW, 'Low'),
        (MEDIUM, 'Medium'),
        (HIGH, 'High'),
        (URGENT, 'Urgent'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    notification_type = models.CharField(max_length=30, choices=TYPE_CHOICES)
    title = models.CharField(max_length=200)
    message = models.TextField()
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default=MEDIUM)
    
    # Status
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)
    
    # Related objects (generic foreign keys would be better, but keeping simple)
    job_id = models.UUIDField(null=True, blank=True)
    order_id = models.UUIDField(null=True, blank=True)
    chat_id = models.UUIDField(null=True, blank=True)
    offer_id = models.UUIDField(null=True, blank=True)
    
    # Delivery channels
    send_email = models.BooleanField(default=True)
    email_sent = models.BooleanField(default=False)
    email_sent_at = models.DateTimeField(null=True, blank=True)
    
    # Metadata
    data = models.JSONField(default=dict, help_text="Additional notification data")
    
    class Meta:
        db_table = 'notifications'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'is_read']),
            models.Index(fields=['notification_type']),
        ]
        
    def __str__(self):
        return f"Notification: {self.title} for {self.user.name}"


class NotificationPreference(BaseModel):
    """User notification preferences"""
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='notification_preferences')
    
    # Email preferences
    email_new_message = models.BooleanField(default=True)
    email_new_offer = models.BooleanField(default=True)
    email_offer_accepted = models.BooleanField(default=True)
    email_payment_confirmed = models.BooleanField(default=True)
    email_work_submitted = models.BooleanField(default=True)
    email_order_completed = models.BooleanField(default=True)
    email_deadline_reminder = models.BooleanField(default=True)
    
    # In-app preferences
    in_app_new_message = models.BooleanField(default=True)
    in_app_new_offer = models.BooleanField(default=True)
    in_app_offer_accepted = models.BooleanField(default=True)
    in_app_payment_confirmed = models.BooleanField(default=True)
    in_app_work_submitted = models.BooleanField(default=True)
    in_app_order_completed = models.BooleanField(default=True)
    
    # Marketing preferences
    marketing_emails = models.BooleanField(default=False)
    newsletter = models.BooleanField(default=False)
    
    class Meta:
        db_table = 'notification_preferences'
        
    def __str__(self):
        return f"Preferences for {self.user.name}"


class EmailTemplate(BaseModel):
    """Email template model"""
    
    name = models.CharField(max_length=100, unique=True)
    subject = models.CharField(max_length=200)
    html_content = models.TextField()
    text_content = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    
    # Template variables (JSON list of variable names)
    variables = models.JSONField(default=list, help_text="List of template variables")
    
    class Meta:
        db_table = 'email_templates'
        
    def __str__(self):
        return self.name
