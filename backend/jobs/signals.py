from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone
from .models import Job
from notifications.models import Notification
from users.models import User


@receiver(post_save, sender=Job)
def notify_freelancers_on_job_creation(sender, instance, created, **kwargs):
    """Create notification for freelancers when a new job is posted"""
    if not created or instance.status != Job.OPEN:
        return
    
    try:
        # Notify all freelancers (you might want to filter by skills in the future)
        freelancers = User.objects.filter(role=User.FREELANCER)
        
        for freelancer in freelancers:
            Notification.objects.create(
                user=freelancer,
                notification_type=Notification.NEW_MESSAGE,
                title=f"New Job Posted: {instance.title}",
                message=f"A new job '{instance.title}' has been posted by {instance.client.name}. Check it out!",
                priority=Notification.MEDIUM,
                job_id=instance.id,
                data={
                    'job_id': str(instance.id),
                    'job_title': instance.title,
                    'client_name': instance.client.name,
                    'budget': f"${instance.budget_min} - ${instance.budget_max}"
                }
            )
    except Exception as e:
        print(f"Error creating job notification: {e}")
