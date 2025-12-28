from rest_framework import serializers
from django.utils import timezone
from .models import Payment, PaymentMethod, Transaction
from orders.serializers import OrderSerializer
from users.serializers import UserProfileSerializer


class PaymentMethodSerializer(serializers.ModelSerializer):
    """Serializer for payment methods"""
    
    class Meta:
        model = PaymentMethod
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at', 'user')
        extra_kwargs = {
            'card_number': {'write_only': True},
            'cvv': {'write_only': True},
        }


class TransactionSerializer(serializers.ModelSerializer):
    """Serializer for transactions"""
    
    class Meta:
        model = Transaction
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at', 'transaction_id')


class PaymentSerializer(serializers.ModelSerializer):
    """Serializer for payment listing and details"""
    
    order = OrderSerializer(read_only=True)
    payer = UserProfileSerializer(read_only=True)
    payee = UserProfileSerializer(read_only=True)
    transactions = TransactionSerializer(many=True, read_only=True)
    
    class Meta:
        model = Payment
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at', 'payer', 'payee', 
                          'transaction_id', 'payment_date')


class CreatePaymentSerializer(serializers.ModelSerializer):
    """Serializer for creating payments"""
    
    payment_method_id = serializers.UUIDField()
    
    class Meta:
        model = Payment
        fields = ['order', 'payment_method_id', 'payment_type']
        
    def validate(self, attrs):
        order = attrs['order']
        payment_method_id = attrs['payment_method_id']
        
        # Validate payment method belongs to user
        try:
            payment_method = PaymentMethod.objects.get(
                id=payment_method_id,
                user=self.context['request'].user
            )
        except PaymentMethod.DoesNotExist:
            raise serializers.ValidationError("Invalid payment method.")
        
        # Validate order status
        if order.status != 'active':
            raise serializers.ValidationError("Can only make payments for active orders.")
        
        # Validate user is the client
        if order.client != self.context['request'].user:
            raise serializers.ValidationError("Only the client can make payments for this order.")
        
        attrs['payment_method'] = payment_method
        return attrs
    
    def create(self, validated_data):
        payment_method = validated_data.pop('payment_method')
        order = validated_data['order']
        
        payment = Payment.objects.create(
            order=order,
            payer=self.context['request'].user,
            payee=order.freelancer,
            amount=order.amount,
            payment_type=validated_data['payment_type'],
            status='pending'
        )
        
        # Create transaction record
        Transaction.objects.create(
            payment=payment,
            amount=payment.amount,
            transaction_type='payment',
            status='pending',
            payment_method=payment_method
        )
        
        return payment


class ProcessPaymentSerializer(serializers.Serializer):
    """Serializer for processing payments"""
    
    action = serializers.ChoiceField(choices=['release', 'refund'])
    notes = serializers.CharField(required=False, allow_blank=True)


class AddPaymentMethodSerializer(serializers.ModelSerializer):
    """Serializer for adding payment methods"""
    
    class Meta:
        model = PaymentMethod
        fields = ['method_type', 'card_number', 'cardholder_name', 
                 'expiry_month', 'expiry_year', 'cvv', 'billing_address']
        extra_kwargs = {
            'card_number': {'write_only': True},
            'cvv': {'write_only': True},
        }
    
    def validate_card_number(self, value):
        # Basic card number validation
        if len(value.replace(' ', '')) < 13:
            raise serializers.ValidationError("Invalid card number.")
        return value
    
    def validate_expiry_month(self, value):
        if value < 1 or value > 12:
            raise serializers.ValidationError("Invalid expiry month.")
        return value
    
    def validate_expiry_year(self, value):
        current_year = timezone.now().year
        if value < current_year:
            raise serializers.ValidationError("Card has expired.")
        return value
