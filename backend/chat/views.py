from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from django.db.models import Q
from .models import Chat, Message, MessageAttachment
from .serializers import (
    ChatSerializer, 
    ChatDetailSerializer, 
    MessageSerializer,
    CreateMessageSerializer
)
from jobs.models import Job

User = get_user_model()


class ChatListView(generics.ListAPIView):
    """List all chats for the current user"""
    
    serializer_class = ChatSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        return Chat.objects.filter(
            Q(client=user) | Q(freelancer=user)
        ).select_related('client', 'freelancer', 'job').order_by('-updated_at')


class ChatDetailView(generics.RetrieveAPIView):
    """Get detailed chat with all messages"""
    
    serializer_class = ChatDetailSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        return Chat.objects.filter(
            Q(client=user) | Q(freelancer=user)
        ).prefetch_related('messages__sender')
    
    def retrieve(self, request, *args, **kwargs):
        chat = self.get_object()
        
        # Mark messages as read for current user
        Message.objects.filter(
            chat=chat,
            is_read=False
        ).exclude(sender=request.user).update(is_read=True)
        
        return super().retrieve(request, *args, **kwargs)


class CreateChatView(generics.CreateAPIView):
    """Create a new chat for a job"""
    
    serializer_class = ChatSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def create(self, request, *args, **kwargs):
        job_id = request.data.get('job_id') or request.data.get('job')
        freelancer_id = request.data.get('freelancer_id') or request.user.id
        
        if not job_id:
            return Response(
                {'error': 'job or job_id is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            job = Job.objects.get(id=job_id)
            freelancer = User.objects.get(id=freelancer_id, role=User.FREELANCER)
        except (Job.DoesNotExist, User.DoesNotExist):
            return Response(
                {'error': 'Job or freelancer not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check if user has permission to create chat
        user = request.user
        if user.role == User.CLIENT and job.client != user:
            return Response(
                {'error': 'Only job owner can start chat'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        if user.role == User.FREELANCER:
            client = job.client
            freelancer = user
        else:
            client = user
        
        # Get or create chat
        chat, created = Chat.objects.get_or_create(
            job=job,
            client=client,
            freelancer=freelancer,
            defaults={'is_active': True}
        )
        
        serializer = self.get_serializer(chat)
        return Response(
            serializer.data, 
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK
        )


class SendMessageView(generics.CreateAPIView):
    """Send a message in a chat"""
    
    serializer_class = CreateMessageSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def create(self, request, chat_id, *args, **kwargs):
        try:
            chat = Chat.objects.get(
                id=chat_id,
                is_active=True
            )
        except Chat.DoesNotExist:
            return Response(
                {'error': 'Chat not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check if user is part of this chat
        user = request.user
        if user not in [chat.client, chat.freelancer]:
            return Response(
                {'error': 'You are not part of this chat'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            # Get file from validated data
            attachment_file = serializer.validated_data.pop('attachment', None)
            
            message = serializer.save(
                chat=chat,
                sender=user
            )
            
            # Handle file attachment if present
            if attachment_file:
                try:
                    MessageAttachment.objects.create(
                        message=message,
                        file=attachment_file,
                        original_name=attachment_file.name,
                        file_size=attachment_file.size,
                        content_type=attachment_file.content_type or 'application/octet-stream'
                    )
                except Exception as e:
                    # If attachment fails, still return the message but log the error
                    print(f"Error saving attachment: {str(e)}")
            
            # Update chat's last message time
            from django.utils import timezone
            chat.last_message_at = timezone.now()
            chat.save()
            
            return Response(
                MessageSerializer(message, context={'request': request}).data,
                status=status.HTTP_201_CREATED
            )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def mark_messages_read(request, chat_id):
    """Mark all messages in a chat as read for current user"""
    
    try:
        chat = Chat.objects.get(id=chat_id)
    except Chat.DoesNotExist:
        return Response(
            {'error': 'Chat not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Check if user is part of this chat
    user = request.user
    if user not in [chat.client, chat.freelancer]:
        return Response(
            {'error': 'You are not part of this chat'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Mark messages as read
    updated_count = Message.objects.filter(
        chat=chat,
        is_read=False
    ).exclude(sender=user).update(is_read=True)
    
    return Response({
        'message': f'Marked {updated_count} messages as read'
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_unread_count(request):
    """Get total unread message count for user"""
    
    user = request.user
    unread_count = Message.objects.filter(
        chat__in=Chat.objects.filter(
            Q(client=user) | Q(freelancer=user)
        ),
        is_read=False
    ).exclude(sender=user).count()
    
    return Response({
        'unread_count': unread_count
    }, status=status.HTTP_200_OK)
