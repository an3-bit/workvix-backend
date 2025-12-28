from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Offer
from users.serializers import UserProfileSerializer
from jobs.serializers import JobListSerializer

User = get_user_model()


class OfferSerializer(serializers.ModelSerializer):
    """Serializer for offers"""
    
    freelancer = UserProfileSerializer(read_only=True)
    job = JobListSerializer(read_only=True)
    
    class Meta:
        model = Offer
        fields = '__all__'
        read_only_fields = ('id', 'freelancer', 'created_at', 'updated_at')


class CreateOfferSerializer(serializers.ModelSerializer):
    """Serializer for creating offers"""
    
    job_id = serializers.UUIDField(write_only=True, required=False)
    job = serializers.UUIDField(write_only=True, required=False)
    title = serializers.CharField(required=False)
    payment_type = serializers.CharField(default='fixed')
    
    class Meta:
        model = Offer
        fields = ('job_id', 'job', 'title', 'description', 'delivery_time', 'payment_type', 'amount')
        
    def validate(self, attrs):
        # Handle both job_id and job field names
        job_id = attrs.get('job_id') or attrs.get('job')
        if not job_id:
            raise serializers.ValidationError("Either job_id or job is required")
        
        attrs['job_id'] = job_id
        attrs.pop('job', None)  # Remove job field if it exists
        
        # Auto-generate title if not provided
        if not attrs.get('title'):
            from jobs.models import Job
            try:
                job = Job.objects.get(id=job_id)
                attrs['title'] = f"Proposal for: {job.title}"
            except Job.DoesNotExist:
                raise serializers.ValidationError("Job not found")
        
        return attrs
    
    def validate_delivery_time(self, value):
        if value <= 0:
            raise serializers.ValidationError("Delivery time must be positive.")
        return value
    
    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Amount must be positive.")
        return value


class UpdateOfferStatusSerializer(serializers.ModelSerializer):
    """Serializer for updating offer status"""
    
    class Meta:
        model = Offer
        fields = ('status',)
    
    def validate_status(self, value):
        if value not in dict(Offer.STATUS_CHOICES):
            raise serializers.ValidationError("Invalid status.")
        return value
