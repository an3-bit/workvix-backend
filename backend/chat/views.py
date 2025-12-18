from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from .models import Chat, Message

# Placeholder views for Chat app - will be implemented in next phase

class ChatListView(generics.ListAPIView):
    def list(self, request):
        return Response({'message': 'Chat list endpoint - coming soon'})

class ChatDetailView(generics.RetrieveAPIView):
    def retrieve(self, request, pk=None):
        return Response({'message': 'Chat detail endpoint - coming soon'})

class CreateChatView(generics.CreateAPIView):
    def create(self, request):
        return Response({'message': 'Create chat endpoint - coming soon'})

class MessageListView(generics.ListAPIView):
    def list(self, request, chat_id=None):
        return Response({'message': 'Messages list endpoint - coming soon'})

class SendMessageView(generics.CreateAPIView):
    def create(self, request, chat_id=None):
        return Response({'message': 'Send message endpoint - coming soon'})
