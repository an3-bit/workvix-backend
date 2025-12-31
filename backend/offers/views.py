from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from .models import Offer
from .serializers import OfferSerializer, CreateOfferSerializer, UpdateOfferStatusSerializer
from jobs.models import Job

User = get_user_model()


class OfferListView(generics.ListAPIView):
    """List offers (filtered by user role)"""
    
    serializer_class = OfferSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.role == User.FREELANCER:
            # Freelancers see their own offers
            return Offer.objects.filter(freelancer=user).select_related('job', 'freelancer')
        elif user.role == User.CLIENT:
            # Clients see offers for their jobs
            return Offer.objects.filter(job__client=user).select_related('job', 'freelancer')
        else:
            # Admin sees all offers
            return Offer.objects.all().select_related('job', 'freelancer')


class OfferDetailView(generics.RetrieveAPIView):
    """Get offer details"""
    
    serializer_class = OfferSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.role == User.FREELANCER:
            return Offer.objects.filter(freelancer=user)
        elif user.role == User.CLIENT:
            return Offer.objects.filter(job__client=user)
        else:
            return Offer.objects.all()


class CreateOfferView(generics.CreateAPIView):
    """Create a new offer (freelancers only)"""
    
    serializer_class = CreateOfferSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        # Only freelancers can create offers
        if self.request.user.role != User.FREELANCER:
            from rest_framework import serializers as drf_serializers
            raise drf_serializers.ValidationError("Only freelancers can create offers.")
        
        job_id = serializer.validated_data.pop('job_id')
        try:
            job = Job.objects.get(id=job_id)
        except Job.DoesNotExist:
            from rest_framework import serializers as drf_serializers
            raise drf_serializers.ValidationError("Job not found.")

        # Only disallow clearly closed states; allow open/in_progress/pending_registration
        if job.status in [Job.CLOSED, Job.COMPLETED, Job.CANCELLED]:
            from rest_framework import serializers as drf_serializers
            raise drf_serializers.ValidationError("This job is not accepting offers right now.")
        
        # Ensure a chat exists between the job client and current freelancer
        # and link the offer to that chat
        from chat.models import Chat
        chat = Chat.objects.filter(
            job=job,
            client=job.client,
            freelancer=self.request.user,
            is_active=True
        ).order_by('-updated_at').first()
        if chat is None:
            # Auto-create chat for this job if missing
            chat = Chat.objects.create(
                job=job,
                client=job.client,
                freelancer=self.request.user,
                is_active=True
            )
        
        # Check if freelancer already made an offer for this job
        if Offer.objects.filter(job=job, freelancer=self.request.user).exists():
            from rest_framework import serializers as drf_serializers
            raise drf_serializers.ValidationError("You have already made an offer for this job.")
        
        serializer.save(
            freelancer=self.request.user,
            job=job,
            chat=chat
        )


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def accept_offer(request, offer_id):
    """Accept an offer (client only) and create an order"""
    from django.utils import timezone
    from orders.models import Order
    
    try:
        offer = Offer.objects.get(id=offer_id)
    except Offer.DoesNotExist:
        return Response(
            {'error': 'Offer not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Check if user is the job owner
    if request.user != offer.job.client:
        return Response(
            {'error': 'Only job owner can accept offers'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Check if offer is still pending
    if offer.status != Offer.PENDING:
        return Response(
            {'error': 'Offer is no longer pending'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Accept the offer
    offer.status = Offer.ACCEPTED
    offer.save()
    
    # Close the job and reject other offers
    job = offer.job
    job.status = Job.CLOSED
    job.save()
    
    # Reject all other pending offers for this job
    Offer.objects.filter(
        job=job,
        status=Offer.PENDING
    ).exclude(id=offer.id).update(status=Offer.REJECTED)
    
    # Auto-create order from accepted offer
    delivery_date = timezone.now() + timezone.timedelta(days=offer.delivery_time)
    order = Order.objects.create(
        job=offer.job,
        client=offer.job.client,
        freelancer=offer.freelancer,
        offer=offer,
        status=Order.ACTIVE,
        title=offer.title or f"Order for {offer.job.title}",
        description=offer.description,
        delivery_time=offer.delivery_time,
        amount=offer.amount,
        delivery_date=delivery_date,
        due_date=delivery_date,
    )
    
    from orders.serializers import OrderSerializer
    
    return Response({
        'message': 'Offer accepted successfully and order created',
        'offer': OfferSerializer(offer, context={'request': request}).data,
        'order': OrderSerializer(order, context={'request': request}).data
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def reject_offer(request, offer_id):
    """Reject an offer (client only)"""
    
    try:
        offer = Offer.objects.get(id=offer_id)
    except Offer.DoesNotExist:
        return Response(
            {'error': 'Offer not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Check if user is the job owner
    if request.user != offer.job.client:
        return Response(
            {'error': 'Only job owner can reject offers'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Check if offer is still pending
    if offer.status != Offer.PENDING:
        return Response(
            {'error': 'Offer is no longer pending'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Reject the offer
    offer.status = Offer.REJECTED
    offer.save()
    
    return Response({
        'message': 'Offer rejected successfully',
        'offer': OfferSerializer(offer, context={'request': request}).data
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def job_offers(request, job_id):
    """Get all offers for a specific job (job owner only)"""
    
    try:
        job = Job.objects.get(id=job_id)
    except Job.DoesNotExist:
        return Response(
            {'error': 'Job not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Check if user is the job owner
    if request.user != job.client:
        return Response(
            {'error': 'Only job owner can view offers'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    offers = Offer.objects.filter(job=job).select_related('freelancer')
    serializer = OfferSerializer(offers, many=True, context={'request': request})
    
    return Response({
        'job_title': job.title,
        'offers': serializer.data
    }, status=status.HTTP_200_OK)
