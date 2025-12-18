from rest_framework import generics, status
from rest_framework.response import Response

# Placeholder views for Orders app - will be implemented in next phase

class OrderListView(generics.ListAPIView):
    def list(self, request):
        return Response({'message': 'Orders list endpoint - coming soon'})

class OrderDetailView(generics.RetrieveAPIView):
    def retrieve(self, request, pk=None):
        return Response({'message': 'Order detail endpoint - coming soon'})

class SubmitWorkView(generics.UpdateAPIView):
    def update(self, request, pk=None):
        return Response({'message': 'Submit work endpoint - coming soon'})

class ApproveWorkView(generics.UpdateAPIView):
    def update(self, request, pk=None):
        return Response({'message': 'Approve work endpoint - coming soon'})

class RequestRevisionView(generics.CreateAPIView):
    def create(self, request, pk=None):
        return Response({'message': 'Request revision endpoint - coming soon'})
