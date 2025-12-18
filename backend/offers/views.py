from rest_framework import generics, status
from rest_framework.response import Response

# Placeholder views for Offers app - will be implemented in next phase

class OfferListView(generics.ListAPIView):
    def list(self, request):
        return Response({'message': 'Offers list endpoint - coming soon'})

class OfferDetailView(generics.RetrieveAPIView):
    def retrieve(self, request, pk=None):
        return Response({'message': 'Offer detail endpoint - coming soon'})

class CreateOfferView(generics.CreateAPIView):
    def create(self, request):
        return Response({'message': 'Create offer endpoint - coming soon'})

class AcceptOfferView(generics.UpdateAPIView):
    def update(self, request, pk=None):
        return Response({'message': 'Accept offer endpoint - coming soon'})

class RejectOfferView(generics.UpdateAPIView):
    def update(self, request, pk=None):
        return Response({'message': 'Reject offer endpoint - coming soon'})
