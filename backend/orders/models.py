from django.db import models
from django.contrib.auth import get_user_model
from common.models import BaseModel

User = get_user_model()


class Order(BaseModel):
    """Order model for accepted offers"""
    
    ACTIVE = 'active'
    SUBMITTED = 'submitted'
    REVISION_REQUESTED = 'revision_requested'
    COMPLETED = 'completed'
    CANCELLED = 'cancelled'
    DISPUTED = 'disputed'
    
    STATUS_CHOICES = [
        (ACTIVE, 'Active'),
        (SUBMITTED, 'Submitted'),
        (REVISION_REQUESTED, 'Revision Requested'),
        (COMPLETED, 'Completed'),
        (CANCELLED, 'Cancelled'),
        (DISPUTED, 'Disputed'),
    ]
    
    job = models.OneToOneField('jobs.Job', on_delete=models.CASCADE, related_name='order')
    client = models.ForeignKey(User, on_delete=models.CASCADE, related_name='client_orders')
    freelancer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='freelancer_orders')
    offer = models.OneToOneField('offers.Offer', on_delete=models.CASCADE, related_name='order')
    
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default=ACTIVE)
    
    # Order details
    title = models.CharField(max_length=200)
    description = models.TextField()
    delivery_time = models.PositiveIntegerField(help_text="Delivery time in days")
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Dates
    delivery_date = models.DateTimeField(null=True, blank=True)
    due_date = models.DateTimeField(null=True, blank=True)
    submitted_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    # Revision tracking
    revision_count = models.PositiveIntegerField(default=0)
    max_revisions = models.PositiveIntegerField(default=3)
    
    # Instructions and feedback
    special_instructions = models.TextField(blank=True, default='')
    client_instructions = models.TextField(blank=True, default='')
    completion_notes = models.TextField(blank=True, default='')
    client_feedback = models.TextField(blank=True, default='')
    client_rating = models.PositiveIntegerField(null=True, blank=True)
    
    class Meta:
        db_table = 'orders'
        ordering = ['-created_at']
        
    def __str__(self):
        return f"Order: {self.title} - {self.freelancer.name}"
    
    @property
    def is_overdue(self):
        from django.utils import timezone
        return self.due_date < timezone.now() and self.status not in [self.COMPLETED, self.CANCELLED]
    
    @property
    def can_request_revision(self):
        return self.revision_count < self.max_revisions


class OrderSubmission(BaseModel):
    """Work submission by freelancer"""
    
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='submissions')
    freelancer = models.ForeignKey(User, on_delete=models.CASCADE)
    submission_text = models.TextField()
    attachment = models.FileField(upload_to='order_submissions/', null=True, blank=True)
    notes = models.TextField(blank=True)
    is_approved = models.BooleanField(default=False)
    approved_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'order_submissions'
        ordering = ['-created_at']
        
    def __str__(self):
        return f"Submission for {self.order.title}"


class OrderDeliverable(BaseModel):
    """Files delivered by freelancer"""
    
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='deliverables')
    file = models.FileField(upload_to='order_deliverables/')
    original_name = models.CharField(max_length=255)
    file_size = models.PositiveIntegerField()
    content_type = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    
    class Meta:
        db_table = 'order_deliverables'
        
    def __str__(self):
        return f"Deliverable: {self.original_name}"


class OrderRevision(BaseModel):
    """Order revision requests"""
    
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='revisions')
    requested_by = models.ForeignKey(User, on_delete=models.CASCADE)
    reason = models.TextField()
    instructions = models.TextField()
    resolved = models.BooleanField(default=False)
    resolved_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'order_revisions'
        ordering = ['-created_at']
        
    def __str__(self):
        return f"Revision Request #{self.id} for {self.order.title}"


class OrderMilestone(BaseModel):
    """Order milestones for tracking progress"""
    
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='milestones')
    title = models.CharField(max_length=200)
    description = models.TextField()
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    due_date = models.DateTimeField()
    is_completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'order_milestones'
        ordering = ['due_date']
        
    def __str__(self):
        return f"Milestone: {self.title}"
