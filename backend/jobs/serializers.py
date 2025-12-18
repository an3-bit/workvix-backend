from rest_framework import serializers
from django.utils import timezone
from .models import Job, JobAttachment, JobView
from users.serializers import UserProfileSerializer


class JobAttachmentSerializer(serializers.ModelSerializer):
    """Serializer for job attachments"""
    
    class Meta:
        model = JobAttachment
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at')


class JobSerializer(serializers.ModelSerializer):
    """Serializer for job listing and details"""
    
    attachments = JobAttachmentSerializer(many=True, read_only=True)
    client = UserProfileSerializer(read_only=True)
    is_expired = serializers.ReadOnlyField()
    
    class Meta:
        model = Job
        fields = '__all__'
        read_only_fields = ('id', 'client', 'created_at', 'updated_at', 
                          'views_count', 'offers_count', 'is_expired')
    
    def validate_deadline(self, value):
        if value <= timezone.now():
            raise serializers.ValidationError("Deadline must be in the future.")
        return value
    
    def validate(self, attrs):
        if attrs.get('budget_min', 0) > attrs.get('budget_max', 0):
            raise serializers.ValidationError("Minimum budget cannot be greater than maximum budget.")
        return attrs


class JobCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating jobs"""
    
    attachments = serializers.ListField(
        child=serializers.FileField(),
        required=False,
        allow_empty=True
    )
    
    class Meta:
        model = Job
        fields = ['title', 'description', 'assignment_type', 'subject', 
                 'deadline', 'pages', 'urgency', 'budget_min', 'budget_max', 
                 'instructions', 'skills_required', 'attachments']
    
    def create(self, validated_data):
        attachments_data = validated_data.pop('attachments', [])
        job = Job.objects.create(**validated_data)
        
        # Handle file attachments
        for attachment_file in attachments_data:
            JobAttachment.objects.create(
                job=job,
                file=attachment_file,
                original_name=attachment_file.name,
                file_size=attachment_file.size,
                content_type=getattr(attachment_file, 'content_type', 'application/octet-stream')
            )
        
        return job


class JobListSerializer(serializers.ModelSerializer):
    """Simplified serializer for job listing"""
    
    client_name = serializers.CharField(source='client.name', read_only=True)
    is_expired = serializers.ReadOnlyField()
    
    class Meta:
        model = Job
        fields = ['id', 'title', 'assignment_type', 'subject', 'deadline', 
                 'pages', 'urgency', 'budget_min', 'budget_max', 'status',
                 'client_name', 'views_count', 'offers_count', 'is_expired',
                 'created_at']


class GuestJobSubmissionSerializer(serializers.Serializer):
    """Serializer for guest job submission (before registration)"""
    
    # Job data
    title = serializers.CharField(max_length=200)
    description = serializers.CharField()
    assignment_type = serializers.ChoiceField(choices=Job.ASSIGNMENT_TYPE_CHOICES)
    subject = serializers.CharField(max_length=100)
    deadline = serializers.DateTimeField()
    pages = serializers.IntegerField(min_value=1)
    urgency = serializers.ChoiceField(choices=Job.URGENCY_CHOICES)
    budget_min = serializers.DecimalField(max_digits=10, decimal_places=2)
    budget_max = serializers.DecimalField(max_digits=10, decimal_places=2)
    instructions = serializers.CharField(required=False, allow_blank=True)
    skills_required = serializers.ListField(child=serializers.CharField(), required=False)
    
    # User registration data
    name = serializers.CharField(max_length=100)
    email = serializers.EmailField()
    phone = serializers.CharField(max_length=20, required=False)
    password = serializers.CharField(write_only=True)
    
    def validate_deadline(self, value):
        if value <= timezone.now():
            raise serializers.ValidationError("Deadline must be in the future.")
        return value
    
    def validate(self, attrs):
        if attrs.get('budget_min', 0) > attrs.get('budget_max', 0):
            raise serializers.ValidationError("Minimum budget cannot be greater than maximum budget.")
        return attrs
