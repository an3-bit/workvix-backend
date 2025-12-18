from django.db import models
from django.contrib.auth import get_user_model
from common.models import BaseModel

User = get_user_model()


class Offer(BaseModel):
    """Offer model for freelancer offers on jobs"""
    
    FIXED = 'fixed'
    HOURLY = 'hourly'
    
    PAYMENT_TYPE_CHOICES = [
        (FIXED, 'Fixed Price'),
        (HOURLY, 'Hourly Rate'),
    ]
    
    PENDING = 'pending'
    ACCEPTED = 'accepted'
    REJECTED = 'rejected'
    WITHDRAWN = 'withdrawn'
    
    STATUS_CHOICES = [
        (PENDING, 'Pending'),
        (ACCEPTED, 'Accepted'),
        (REJECTED, 'Rejected'),
        (WITHDRAWN, 'Withdrawn'),
    ]
    
    job = models.ForeignKey('jobs.Job', on_delete=models.CASCADE, related_name='offers')
    freelancer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='offers')
    chat = models.ForeignKey('chat.Chat', on_delete=models.CASCADE, related_name='offers')
    
    title = models.CharField(max_length=200)
    description = models.TextField()
    delivery_time = models.PositiveIntegerField(help_text="Delivery time in days")
    payment_type = models.CharField(max_length=20, choices=PAYMENT_TYPE_CHOICES)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    estimated_hours = models.PositiveIntegerField(null=True, blank=True, help_text="For hourly offers")
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=PENDING)
    
    # Milestones for future implementation
    milestones = models.JSONField(default=list, help_text="List of milestone objects")
    
    # Offer validity
    valid_until = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'offers'
        unique_together = ('job', 'freelancer')  # One offer per freelancer per job
        ordering = ['-created_at']
        
    def __str__(self):
        return f"Offer by {self.freelancer.name} for {self.job.title}"
    
    @property
    def is_expired(self):
        from django.utils import timezone
        return self.valid_until and self.valid_until < timezone.now()
    
    @property
    def total_amount(self):
        """Calculate total amount for hourly offers"""
        if self.payment_type == self.HOURLY and self.estimated_hours:
            return self.amount * self.estimated_hours
        return self.amount


class OfferRevision(BaseModel):
    """Track offer revisions/updates"""
    
    offer = models.ForeignKey(Offer, on_delete=models.CASCADE, related_name='revisions')
    title = models.CharField(max_length=200)
    description = models.TextField()
    delivery_time = models.PositiveIntegerField()
    payment_type = models.CharField(max_length=20, choices=Offer.PAYMENT_TYPE_CHOICES)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    estimated_hours = models.PositiveIntegerField(null=True, blank=True)
    reason = models.TextField(help_text="Reason for revision")
    
    class Meta:
        db_table = 'offer_revisions'
        ordering = ['-created_at']
        
    def __str__(self):
        return f"Revision for {self.offer.title} at {self.created_at}"
