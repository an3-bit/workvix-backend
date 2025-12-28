from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db.models import Q
import uuid
from .models import Payment, PaymentMethod, Transaction
from .serializers import (
    PaymentSerializer, CreatePaymentSerializer, ProcessPaymentSerializer,
    AddPaymentMethodSerializer, PaymentMethodSerializer, TransactionSerializer
)
from orders.models import Order


class PaymentListView(generics.ListAPIView):
    """List payments for the authenticated user"""
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        # Users can see payments where they are either payer or payee
        return Payment.objects.filter(
            Q(payer=user) | Q(payee=user)
        ).order_by('-created_at')


class PaymentDetailView(generics.RetrieveAPIView):
    """Get payment details"""
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        return Payment.objects.filter(
            Q(payer=user) | Q(payee=user)
        )


class CreatePaymentView(generics.CreateAPIView):
    """Create a new payment"""
    serializer_class = CreatePaymentSerializer
    permission_classes = [IsAuthenticated]


class PaymentMethodListView(generics.ListAPIView):
    """List user's payment methods"""
    serializer_class = PaymentMethodSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return PaymentMethod.objects.filter(
            user=self.request.user,
            is_active=True
        )


class AddPaymentMethodView(generics.CreateAPIView):
    """Add a new payment method"""
    serializer_class = AddPaymentMethodSerializer
    permission_classes = [IsAuthenticated]
    
    def perform_create(self, serializer):
        # Mask the card number for security
        card_number = serializer.validated_data['card_number']
        masked_number = '*' * (len(card_number) - 4) + card_number[-4:]
        
        serializer.save(
            user=self.request.user,
            masked_card_number=masked_number,
            is_active=True
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def process_payment(request, payment_id):
    """Process payment (release funds or refund)"""
    payment = get_object_or_404(Payment, id=payment_id)
    
    # Only admin or involved parties can process payments
    if request.user.role != 'admin' and request.user not in [payment.payer, payment.payee]:
        return Response(
            {"error": "You don't have permission to process this payment"},
            status=status.HTTP_403_FORBIDDEN
        )
    
    serializer = ProcessPaymentSerializer(data=request.data)
    if serializer.is_valid():
        action = serializer.validated_data['action']
        notes = serializer.validated_data.get('notes', '')
        
        if action == 'release':
            if payment.status != 'escrow':
                return Response(
                    {"error": "Can only release funds from escrow"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            payment.status = 'completed'
            payment.payment_date = timezone.now()
            
            # Create release transaction
            Transaction.objects.create(
                payment=payment,
                amount=payment.amount,
                transaction_type='release',
                status='completed',
                transaction_id=str(uuid.uuid4()),
                notes=notes
            )
            
        elif action == 'refund':
            if payment.status not in ['escrow', 'completed']:
                return Response(
                    {"error": "Cannot refund this payment"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            payment.status = 'refunded'
            
            # Create refund transaction
            Transaction.objects.create(
                payment=payment,
                amount=payment.amount,
                transaction_type='refund',
                status='completed',
                transaction_id=str(uuid.uuid4()),
                notes=notes
            )
        
        payment.save()
        
        return Response(
            PaymentSerializer(payment).data,
            status=status.HTTP_200_OK
        )
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def remove_payment_method(request, method_id):
    """Remove a payment method"""
    method = get_object_or_404(
        PaymentMethod, 
        id=method_id, 
        user=request.user
    )
    
    method.is_active = False
    method.save()
    
    return Response(
        {"message": "Payment method removed successfully"},
        status=status.HTTP_200_OK
    )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def payment_history(request):
    """Get payment history for user"""
    user = request.user
    payments = Payment.objects.filter(
        Q(payer=user) | Q(payee=user)
    ).order_by('-created_at')
    
    # Add pagination if needed
    serializer = PaymentSerializer(payments, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


# Legacy views for backward compatibility
class ConfirmPaymentView(generics.UpdateAPIView):
    def update(self, request, pk=None):
        return process_payment(request, pk)


class StripeWebhookView(generics.GenericAPIView):
    """Stripe webhook endpoint for payment processing"""
    
    def post(self, request):
        # This would integrate with Stripe's webhook system
        # For now, return a placeholder response
        return Response({
            'message': 'Stripe webhook received',
            'status': 'processed'
        }, status=status.HTTP_200_OK)
