from rest_framework import serializers
from django.utils import timezone
from .models import Notification, NotificationPreference
from users.serializers import UserProfileSerializer


class NotificationSerializer(serializers.ModelSerializer):
    """Serializer for notification listing and details"""
    
    recipient_name = serializers.CharField(source='user.name', read_only=True)
    
    class Meta:
        model = Notification
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at', 'user')


class CreateNotificationSerializer(serializers.ModelSerializer):
    """Serializer for creating notifications"""
    
    class Meta:
        model = Notification
        fields = ['recipient', 'notification_type', 'title', 'message', 
                 'related_object_type', 'related_object_id']
        
    def create(self, validated_data):
        # Set sender from context if provided
        sender = self.context.get('sender')
        if sender:
            validated_data['sender'] = sender
            
        return super().create(validated_data)


class NotificationPreferenceSerializer(serializers.ModelSerializer):
    """Serializer for notification preferences"""
    
    class Meta:
        model = NotificationPreference
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at', 'user')


class MarkNotificationSerializer(serializers.Serializer):
    """Serializer for marking notifications as read/unread"""
    
    notification_ids = serializers.ListField(
        child=serializers.UUIDField(),
        allow_empty=False
    )
    action = serializers.ChoiceField(choices=['read', 'unread'])


class BulkNotificationSerializer(serializers.Serializer):
    """Serializer for bulk notification operations"""
    
    recipient_ids = serializers.ListField(
        child=serializers.UUIDField(),
        allow_empty=False
    )
    notification_type = serializers.CharField()
    title = serializers.CharField()
    message = serializers.CharField()
    related_object_type = serializers.CharField(required=False)
    related_object_id = serializers.UUIDField(required=False)
