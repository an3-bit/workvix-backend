from django.db import models
from django.contrib.auth import get_user_model
from common.models import BaseModel

User = get_user_model()


class Chat(BaseModel):
    """Chat model for job-specific conversations"""
    
    job = models.ForeignKey('jobs.Job', on_delete=models.CASCADE, related_name='chats')
    client = models.ForeignKey(User, on_delete=models.CASCADE, related_name='client_chats')
    freelancer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='freelancer_chats')
    is_active = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'chats'
        unique_together = ('job', 'freelancer')  # One chat per job per freelancer
        
    def __str__(self):
        return f"Chat: {self.job.title} - {self.freelancer.name}"


class Message(BaseModel):
    """Message model for chat messages"""
    
    chat = models.ForeignKey(Chat, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'messages'
        ordering = ['created_at']
        
    def __str__(self):
        return f"Message from {self.sender.name} at {self.created_at}"


class MessageAttachment(BaseModel):
    """Attachment model for chat messages"""
    
    message = models.ForeignKey(Message, on_delete=models.CASCADE, related_name='attachments')
    file = models.FileField(upload_to='chat_attachments/')
    original_name = models.CharField(max_length=255)
    file_size = models.PositiveIntegerField()
    content_type = models.CharField(max_length=100)
    
    class Meta:
        db_table = 'message_attachments'
        
    def __str__(self):
        return f"Attachment: {self.original_name}"


class ChatParticipant(BaseModel):
    """Track chat participants and their last seen message"""
    
    chat = models.ForeignKey(Chat, on_delete=models.CASCADE, related_name='participants')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    last_seen_message = models.ForeignKey(
        Message, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='seen_by'
    )
    unread_count = models.PositiveIntegerField(default=0)
    
    class Meta:
        db_table = 'chat_participants'
        unique_together = ('chat', 'user')
        
    def __str__(self):
        return f"{self.user.name} in {self.chat}"
