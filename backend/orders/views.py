from rest_framework import generics, status, serializers
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
from .models import Order, OrderSubmission, OrderRevision
from .serializers import (
    OrderSerializer, CreateOrderSerializer, SubmitWorkSerializer,
    RequestRevisionSerializer, ApproveOrderSerializer
)
from offers.models import Offer


class OrderListView(generics.ListAPIView):
    """List orders for the authenticated user"""
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'client':
            return Order.objects.filter(client=user).order_by('-created_at')
        elif user.role == 'freelancer':
            return Order.objects.filter(freelancer=user).order_by('-created_at')
        return Order.objects.none()


class OrderDetailView(generics.RetrieveAPIView):
    """Get order details"""
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'client':
            return Order.objects.filter(client=user)
        elif user.role == 'freelancer':
            return Order.objects.filter(freelancer=user)
        return Order.objects.none()


class CreateOrderView(generics.CreateAPIView):
    """Create a new order from an accepted offer"""
    serializer_class = CreateOrderSerializer
    permission_classes = [IsAuthenticated]
    
    def perform_create(self, serializer):
        # Only clients can create orders
        if self.request.user.role != 'client':
            raise serializers.ValidationError("Only clients can create orders.")
        
        offer = serializer.validated_data['offer']
        # Verify the client owns the job
        if offer.job.client != self.request.user:
            raise serializers.ValidationError("You can only create orders for your own jobs.")
        
        serializer.save()


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_work(request, order_id):
    """Submit work for an order (freelancers only)"""
    if request.user.role != 'freelancer':
        return Response(
            {"error": "Only freelancers can submit work"},
            status=status.HTTP_403_FORBIDDEN
        )
    
    order = get_object_or_404(Order, id=order_id, freelancer=request.user)
    
    if order.status not in ['active', 'revision_requested']:
        return Response(
            {"error": "Cannot submit work for this order status"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    serializer = SubmitWorkSerializer(data=request.data)
    if serializer.is_valid():
        submission = serializer.save(
            order=order,
            freelancer=request.user
        )
        
        # Update order status to submitted
        order.status = 'submitted'
        order.save()
        
        return Response(
            OrderSerializer(order).data,
            status=status.HTTP_201_CREATED
        )
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def request_revision(request, order_id):
    """Request revision for an order (clients only)"""
    if request.user.role != 'client':
        return Response(
            {"error": "Only clients can request revisions"},
            status=status.HTTP_403_FORBIDDEN
        )
    
    order = get_object_or_404(Order, id=order_id, client=request.user)
    
    if order.status != 'submitted':
        return Response(
            {"error": "Can only request revisions for submitted orders"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    serializer = RequestRevisionSerializer(data=request.data)
    if serializer.is_valid():
        # Create revision record
        OrderRevision.objects.create(
            order=order,
            client=request.user,
            revision_notes=serializer.validated_data['revision_notes']
        )
        
        # Update order status
        order.status = 'revision_requested'
        order.save()
        
        return Response(
            OrderSerializer(order).data,
            status=status.HTTP_200_OK
        )
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def approve_order(request, order_id):
    """Approve and complete an order (clients only)"""
    if request.user.role != 'client':
        return Response(
            {"error": "Only clients can approve orders"},
            status=status.HTTP_403_FORBIDDEN
        )
    
    order = get_object_or_404(Order, id=order_id, client=request.user)
    
    if order.status != 'submitted':
        return Response(
            {"error": "Can only approve submitted orders"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    serializer = ApproveOrderSerializer(data=request.data)
    if serializer.is_valid():
        # Update order status
        order.status = 'completed'
        order.completed_at = timezone.now()
        order.client_feedback = serializer.validated_data.get('feedback', '')
        order.client_rating = serializer.validated_data['rating']
        order.save()
        
        return Response(
            OrderSerializer(order).data,
            status=status.HTTP_200_OK
        )
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cancel_order(request, order_id):
    """Cancel an order"""
    order = get_object_or_404(Order, id=order_id)
    
    # Only client or freelancer involved can cancel
    if request.user not in [order.client, order.freelancer]:
        return Response(
            {"error": "You don't have permission to cancel this order"},
            status=status.HTTP_403_FORBIDDEN
        )
    
    if order.status in ['completed', 'cancelled']:
        return Response(
            {"error": "Cannot cancel completed or already cancelled orders"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    order.status = 'cancelled'
    order.save()
    
    return Response(
        OrderSerializer(order).data,
        status=status.HTTP_200_OK
    )


# Legacy views for backward compatibility
class SubmitWorkView(generics.UpdateAPIView):
    def update(self, request, pk=None):
        return submit_work(request, pk)

class ApproveWorkView(generics.UpdateAPIView):
    def update(self, request, pk=None):
        return approve_order(request, pk)

class RequestRevisionView(generics.CreateAPIView):
    def create(self, request, pk=None):
        return request_revision(request, pk)
