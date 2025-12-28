from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db.models import Q
from .models import Notification, NotificationPreference
from .serializers import (
    NotificationSerializer, CreateNotificationSerializer,
    NotificationPreferenceSerializer, MarkNotificationSerializer,
    BulkNotificationSerializer
)


class NotificationListView(generics.ListAPIView):
    """List notifications for the authenticated user"""
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        queryset = Notification.objects.filter(user=user).order_by('-created_at')
        
        # Filter by read/unread status
        read_status = self.request.query_params.get('read')
        if read_status is not None:
            if read_status.lower() == 'true':
                queryset = queryset.filter(is_read=True)
            elif read_status.lower() == 'false':
                queryset = queryset.filter(is_read=False)
        
        # Filter by notification type
        notification_type = self.request.query_params.get('type')
        if notification_type:
            queryset = queryset.filter(notification_type=notification_type)
            
        return queryset


class NotificationDetailView(generics.RetrieveAPIView):
    """Get notification details"""
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)
    
    def retrieve(self, request, *args, **kwargs):
        """Mark notification as read when retrieved"""
        notification = self.get_object()
        if not notification.is_read:
            notification.is_read = True
            notification.read_at = timezone.now()
            notification.save()
        return super().retrieve(request, *args, **kwargs)


class CreateNotificationView(generics.CreateAPIView):
    """Create a new notification (admin only)"""
    serializer_class = CreateNotificationSerializer
    permission_classes = [IsAuthenticated]
    
    def perform_create(self, serializer):
        # Only admins can create notifications manually
        if self.request.user.role != 'admin':
            raise PermissionError("Only admins can create notifications manually.")
        
        serializer.save(sender=self.request.user)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_notifications(request):
    """Mark notifications as read or unread"""
    serializer = MarkNotificationSerializer(data=request.data)
    if serializer.is_valid():
        notification_ids = serializer.validated_data['notification_ids']
        action = serializer.validated_data['action']
        
        # Get user's notifications
        notifications = Notification.objects.filter(
            id__in=notification_ids,
            user=request.user
        )
        
        if action == 'read':
            notifications.update(
                is_read=True,
                read_at=timezone.now()
            )
        else:
            notifications.update(
                is_read=False,
                read_at=None
            )
        
        return Response(
            {"message": f"Notifications marked as {action}"},
            status=status.HTTP_200_OK
        )
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_all_read(request):
    """Mark all notifications as read for the user"""
    Notification.objects.filter(
        user=request.user,
        is_read=False
    ).update(
        is_read=True,
        read_at=timezone.now()
    )
    
    return Response(
        {"message": "All notifications marked as read"},
        status=status.HTTP_200_OK
    )


class NotificationPreferencesView(generics.RetrieveUpdateAPIView):
    """Get and update notification preferences"""
    serializer_class = NotificationPreferenceSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        preferences, created = NotificationPreference.objects.get_or_create(
            user=self.request.user
        )
        return preferences


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def unread_count(request):
    """Get count of unread notifications"""
    count = Notification.objects.filter(
        user=request.user,
        is_read=False
    ).count()
    
    return Response(
        {"unread_count": count},
        status=status.HTTP_200_OK
    )


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_notification(request, pk):
    """Delete a notification"""
    notification = get_object_or_404(
        Notification,
        id=pk,
        user=request.user
    )
    
    notification.delete()
    
    return Response(
        {"message": "Notification deleted successfully"},
        status=status.HTTP_200_OK
    )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_bulk_notifications(request):
    """Send notifications to multiple users (admin only)"""
    if request.user.role != 'admin':
        return Response(
            {"error": "Only admins can send bulk notifications"},
            status=status.HTTP_403_FORBIDDEN
        )
    
    serializer = BulkNotificationSerializer(data=request.data)
    if serializer.is_valid():
        data = serializer.validated_data
        notifications = []
        
        for recipient_id in data['recipient_ids']:
            try:
                from users.models import User
                recipient = User.objects.get(id=recipient_id)
                
                notification = Notification(
                    sender=request.user,
                    recipient=recipient,
                    notification_type=data['notification_type'],
                    title=data['title'],
                    message=data['message'],
                    related_object_type=data.get('related_object_type'),
                    related_object_id=data.get('related_object_id')
                )
                notifications.append(notification)
            except User.DoesNotExist:
                continue
        
        # Bulk create notifications
        Notification.objects.bulk_create(notifications)
        
        return Response(
            {"message": f"Sent {len(notifications)} notifications"},
            status=status.HTTP_201_CREATED
        )
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# Legacy views for backward compatibility
class MarkAsReadView(generics.UpdateAPIView):
    def update(self, request, pk=None):
        return mark_notifications(request)

class UnreadCountView(generics.GenericAPIView):
    def get(self, request):
        return unread_count(request)
