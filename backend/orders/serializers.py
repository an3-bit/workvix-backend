from rest_framework import serializers
from django.utils import timezone
from .models import Order, OrderSubmission, OrderRevision
from jobs.serializers import JobListSerializer
from users.serializers import UserProfileSerializer
from offers.serializers import OfferSerializer


class OrderSubmissionSerializer(serializers.ModelSerializer):
    """Serializer for order submissions"""
    
    class Meta:
        model = OrderSubmission
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at')


class OrderRevisionSerializer(serializers.ModelSerializer):
    """Serializer for order revisions"""
    
    class Meta:
        model = OrderRevision
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at')


class OrderSerializer(serializers.ModelSerializer):
    """Serializer for order listing and details"""
    
    job = JobListSerializer(read_only=True)
    client = UserProfileSerializer(read_only=True)
    freelancer = UserProfileSerializer(read_only=True)
    offer = OfferSerializer(read_only=True)
    submissions = OrderSubmissionSerializer(many=True, read_only=True)
    revisions = OrderRevisionSerializer(many=True, read_only=True)
    
    class Meta:
        model = Order
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at', 'client', 
                          'freelancer', 'job', 'offer')


class CreateOrderSerializer(serializers.ModelSerializer):
    """Serializer for creating orders"""
    
    class Meta:
        model = Order
        fields = ['offer', 'delivery_date', 'special_instructions']
        
    def validate_delivery_date(self, value):
        if value <= timezone.now():
            raise serializers.ValidationError("Delivery date must be in the future.")
        return value
    
    def create(self, validated_data):
        offer = validated_data['offer']
        
        # Ensure the offer is accepted
        if offer.status != 'accepted':
            raise serializers.ValidationError("Can only create order from accepted offers.")
        
        # Create order with data from the offer
        order = Order.objects.create(
            job=offer.job,
            client=offer.job.client,
            freelancer=offer.freelancer,
            offer=offer,
            title=offer.title,
            description=offer.description,
            delivery_time=offer.delivery_time,
            amount=offer.amount,
            delivery_date=validated_data['delivery_date'],
            special_instructions=validated_data.get('special_instructions', ''),
            status='active'
        )
        
        return order


class SubmitWorkSerializer(serializers.ModelSerializer):
    """Serializer for work submission"""
    
    class Meta:
        model = OrderSubmission
        fields = ['submission_text', 'attachment', 'notes']


class RequestRevisionSerializer(serializers.Serializer):
    """Serializer for requesting revisions"""
    
    revision_notes = serializers.CharField()
    
    def validate_revision_notes(self, value):
        if len(value.strip()) < 10:
            raise serializers.ValidationError("Revision notes must be at least 10 characters long.")
        return value


class ApproveOrderSerializer(serializers.Serializer):
    """Serializer for order approval"""
    
    feedback = serializers.CharField(required=False, allow_blank=True)
    rating = serializers.IntegerField(min_value=1, max_value=5)
