from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import OrderSubmission
from notifications.models import Notification


@receiver(post_save, sender=OrderSubmission)
def notify_client_on_work_submission(sender, instance, created, **kwargs):
    """Create notification for client when freelancer submits work"""
    if not created:
        return
    
    try:
        order = instance.order
        client = order.client
        freelancer = instance.freelancer
        
        # Notify the client about work submission
        Notification.objects.create(
            user=client,
            notification_type=Notification.WORK_SUBMITTED,
            title=f"Work Submitted: {order.job.title if order.job else 'Order'}",
            message=f"{freelancer.name} has submitted work for your order. Please review it.",
            priority=Notification.HIGH,
            order_id=order.id,
            data={
                'order_id': str(order.id),
                'job_title': order.job.title if order.job else 'Order',
                'freelancer_name': freelancer.name,
                'submission_text': instance.submission_text[:100] if instance.submission_text else ''
            }
        )
    except Exception as e:
        print(f"Error creating work submission notification: {e}")
