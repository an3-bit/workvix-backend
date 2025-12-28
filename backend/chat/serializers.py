from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Chat, Message
from users.serializers import UserProfileSerializer

User = get_user_model()


class MessageSerializer(serializers.ModelSerializer):
    """Serializer for chat messages"""
    
    sender = UserProfileSerializer(read_only=True)
    
    class Meta:
        model = Message
        fields = '__all__'
        read_only_fields = ('id', 'chat', 'sender', 'created_at', 'updated_at')
    
    def create(self, validated_data):
        validated_data['sender'] = self.context['request'].user
        return super().create(validated_data)


class ChatSerializer(serializers.ModelSerializer):
    """Serializer for chat rooms"""
    
    client = UserProfileSerializer(read_only=True)
    freelancer = UserProfileSerializer(read_only=True)
    job_title = serializers.CharField(source='job.title', read_only=True)
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Chat
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at', 'last_message_at')
    
    def get_last_message(self, obj):
        last_message = obj.messages.last()
        if last_message:
            return {
                'content': last_message.content,
                'sender': last_message.sender.name,
                'created_at': last_message.created_at
            }
        return None
    
    def get_unread_count(self, obj):
        user = self.context['request'].user
        return obj.messages.filter(is_read=False).exclude(sender=user).count()


class ChatDetailSerializer(serializers.ModelSerializer):
    """Detailed chat serializer with messages"""
    
    messages = MessageSerializer(many=True, read_only=True)
    client = UserProfileSerializer(read_only=True)
    freelancer = UserProfileSerializer(read_only=True)
    job_title = serializers.CharField(source='job.title', read_only=True)
    
    class Meta:
        model = Chat
        fields = '__all__'


class CreateMessageSerializer(serializers.ModelSerializer):
    """Serializer for creating new messages"""
    
    class Meta:
        model = Message
        fields = ('content',)
    
    def validate(self, attrs):
        if not attrs.get('content'):
            raise serializers.ValidationError("Message must have content.")
        return attrs
