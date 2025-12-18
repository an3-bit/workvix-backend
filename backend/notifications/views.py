from rest_framework import generics, status
from rest_framework.response import Response

# Placeholder views for Notifications app - will be implemented in next phase

class NotificationListView(generics.ListAPIView):
    def list(self, request):
        return Response({'message': 'Notifications list endpoint - coming soon'})

class NotificationDetailView(generics.RetrieveAPIView):
    def retrieve(self, request, pk=None):
        return Response({'message': 'Notification detail endpoint - coming soon'})

class MarkAsReadView(generics.UpdateAPIView):
    def update(self, request, pk=None):
        return Response({'message': 'Mark as read endpoint - coming soon'})

class NotificationPreferencesView(generics.RetrieveUpdateAPIView):
    def retrieve(self, request):
        return Response({'message': 'Notification preferences endpoint - coming soon'})

class UnreadCountView(generics.GenericAPIView):
    def get(self, request):
        return Response({'message': 'Unread count endpoint - coming soon'})
