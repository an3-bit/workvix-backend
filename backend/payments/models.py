from django.db import models
from django.contrib.auth import get_user_model
from common.models import BaseModel

User = get_user_model()


class Payment(BaseModel):
    """Payment model for order payments"""
    
    STRIPE = 'stripe'
    PAYPAL = 'paypal'
    WALLET = 'wallet'
    
    PROVIDER_CHOICES = [
        (STRIPE, 'Stripe'),
        (PAYPAL, 'PayPal'),
        (WALLET, 'Wallet'),
    ]
    
    PENDING = 'pending'
    INITIATED = 'initiated'
    PROCESSING = 'processing'
    PAID = 'paid'
    FAILED = 'failed'
    REFUNDED = 'refunded'
    PARTIALLY_REFUNDED = 'partially_refunded'
    
    STATUS_CHOICES = [
        (PENDING, 'Pending'),
        (INITIATED, 'Initiated'),
        (PROCESSING, 'Processing'),
        (PAID, 'Paid'),
        (FAILED, 'Failed'),
        (REFUNDED, 'Refunded'),
        (PARTIALLY_REFUNDED, 'Partially Refunded'),
    ]
    
    ORDER = 'order'
    MILESTONE = 'milestone'
    REFUND = 'refund'
    
    TYPE_CHOICES = [
        (ORDER, 'Order Payment'),
        (MILESTONE, 'Milestone Payment'),
        (REFUND, 'Refund'),
    ]
    
    order = models.ForeignKey('orders.Order', on_delete=models.CASCADE, related_name='payments')
    client = models.ForeignKey(User, on_delete=models.CASCADE, related_name='payments_made')
    freelancer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='payments_received')
    
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    platform_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    freelancer_amount = models.DecimalField(max_digits=10, decimal_places=2)
    
    payment_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default=ORDER)
    provider = models.CharField(max_length=20, choices=PROVIDER_CHOICES)
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default=PENDING)
    
    # Provider-specific fields
    provider_transaction_id = models.CharField(max_length=255, blank=True)
    provider_payment_intent_id = models.CharField(max_length=255, blank=True)
    provider_response = models.JSONField(default=dict)
    
    # Payment metadata
    currency = models.CharField(max_length=3, default='USD')
    description = models.TextField(blank=True)
    
    # Dates
    initiated_at = models.DateTimeField(null=True, blank=True)
    paid_at = models.DateTimeField(null=True, blank=True)
    failed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'payments'
        ordering = ['-created_at']
        
    def __str__(self):
        return f"Payment #{self.id}: ${self.amount} - {self.status}"


class Transaction(BaseModel):
    """Transaction model for payment history"""
    
    DEBIT = 'debit'
    CREDIT = 'credit'
    
    TYPE_CHOICES = [
        (DEBIT, 'Debit'),
        (CREDIT, 'Credit'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='transactions')
    payment = models.ForeignKey(Payment, on_delete=models.CASCADE, related_name='transactions')
    
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    transaction_type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    description = models.TextField()
    
    # Balance tracking
    balance_before = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    balance_after = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    class Meta:
        db_table = 'transactions'
        ordering = ['-created_at']
        
    def __str__(self):
        return f"Transaction: {self.transaction_type} ${self.amount}"


class Wallet(BaseModel):
    """User wallet for storing balance"""
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='wallet')
    balance = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    currency = models.CharField(max_length=3, default='USD')
    is_frozen = models.BooleanField(default=False)
    
    class Meta:
        db_table = 'wallets'
        
    def __str__(self):
        return f"Wallet: {self.user.name} - ${self.balance}"


class Escrow(BaseModel):
    """Escrow model for holding payments"""
    
    HOLDING = 'holding'
    RELEASED = 'released'
    REFUNDED = 'refunded'
    
    STATUS_CHOICES = [
        (HOLDING, 'Holding'),
        (RELEASED, 'Released'),
        (REFUNDED, 'Refunded'),
    ]
    
    payment = models.OneToOneField(Payment, on_delete=models.CASCADE, related_name='escrow')
    order = models.ForeignKey('orders.Order', on_delete=models.CASCADE, related_name='escrows')
    
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=HOLDING)
    
    released_at = models.DateTimeField(null=True, blank=True)
    refunded_at = models.DateTimeField(null=True, blank=True)
    
    # Auto-release settings
    auto_release_days = models.PositiveIntegerField(default=7)
    auto_release_date = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'escrows'
        
    def __str__(self):
        return f"Escrow: Order #{self.order.id} - ${self.amount}"
