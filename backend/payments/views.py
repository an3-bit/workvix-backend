from rest_framework import generics, status
from rest_framework.response import Response

# Placeholder views for Payments app - will be implemented in next phase

class PaymentListView(generics.ListAPIView):
    def list(self, request):
        return Response({'message': 'Payments list endpoint - coming soon'})

class PaymentDetailView(generics.RetrieveAPIView):
    def retrieve(self, request, pk=None):
        return Response({'message': 'Payment detail endpoint - coming soon'})

class CreatePaymentView(generics.CreateAPIView):
    def create(self, request):
        return Response({'message': 'Create payment endpoint - coming soon'})

class ConfirmPaymentView(generics.UpdateAPIView):
    def update(self, request, pk=None):
        return Response({'message': 'Confirm payment endpoint - coming soon'})

class StripeWebhookView(generics.GenericAPIView):
    def post(self, request):
        return Response({'message': 'Stripe webhook endpoint - coming soon'})
