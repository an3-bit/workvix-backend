from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from .models import User, FreelancerProfile


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration"""
    
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ('name', 'email', 'phone', 'role', 'password', 'password_confirm')
        
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords don't match.")
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        
        # Create freelancer profile if role is freelancer
        if user.role == User.FREELANCER:
            FreelancerProfile.objects.create(user=user)
            
        return user


class UserLoginSerializer(serializers.Serializer):
    """Serializer for user login"""
    
    email = serializers.EmailField()
    password = serializers.CharField()
    
    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')
        
        if email and password:
            user = authenticate(request=self.context.get('request'),
                              email=email, password=password)
            if not user:
                raise serializers.ValidationError('Invalid credentials.')
            if not user.is_active:
                raise serializers.ValidationError('User account is disabled.')
                
            attrs['user'] = user
            return attrs
        else:
            raise serializers.ValidationError('Must include email and password.')


class FreelancerProfileSerializer(serializers.ModelSerializer):
    """Serializer for freelancer profile"""
    
    class Meta:
        model = FreelancerProfile
        fields = '__all__'
        read_only_fields = ('user', 'rating', 'total_jobs_completed', 'is_verified')


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for user profile"""
    
    freelancer_profile = FreelancerProfileSerializer(read_only=True)
    
    class Meta:
        model = User
        fields = ('id', 'name', 'email', 'phone', 'role', 'profile_status', 
                 'email_verified', 'avatar', 'created_at', 'freelancer_profile')
        read_only_fields = ('id', 'email', 'role', 'created_at', 'email_verified')


class UserUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating user profile"""
    
    class Meta:
        model = User
        fields = ('name', 'phone', 'avatar')
