from rest_framework import generics, status, permissions, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.db.models import Q
from django_filters.rest_framework import DjangoFilterBackend
from .models import Job, JobAttachment, JobView
from .serializers import (
    JobSerializer, 
    JobCreateSerializer, 
    JobListSerializer,
    GuestJobSubmissionSerializer
)

User = get_user_model()


class JobListView(generics.ListAPIView):
    """List all open jobs with filtering and search"""
    
    serializer_class = JobListSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['assignment_type', 'urgency', 'status']
    search_fields = ['title', 'description', 'subject', 'skills_required']
    ordering_fields = ['created_at', 'deadline', 'budget_min', 'budget_max']
    ordering = ['-created_at']
    
    def get_queryset(self):
        queryset = Job.objects.filter(status=Job.OPEN).select_related('client')
        
        # Budget filtering
        min_budget = self.request.query_params.get('min_budget')
        max_budget = self.request.query_params.get('max_budget')
        
        if min_budget:
            queryset = queryset.filter(budget_max__gte=min_budget)
        if max_budget:
            queryset = queryset.filter(budget_min__lte=max_budget)
        
        return queryset


class JobDetailView(generics.RetrieveAPIView):
    """Retrieve job details"""
    
    queryset = Job.objects.all()
    serializer_class = JobSerializer
    permission_classes = [permissions.AllowAny]
    
    def retrieve(self, request, *args, **kwargs):
        job = self.get_object()
        
        # Track job view
        if request.user.is_authenticated:
            JobView.objects.get_or_create(job=job, user=request.user)
        else:
            # Track by IP for anonymous users
            ip_address = self.get_client_ip(request)
            JobView.objects.get_or_create(job=job, ip_address=ip_address)
        
        # Increment view count
        Job.objects.filter(id=job.id).update(views_count=job.views_count + 1)
        
        return super().retrieve(request, *args, **kwargs)
    
    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


class JobCreateView(generics.CreateAPIView):
    """Create a new job"""
    
    serializer_class = JobCreateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        from rest_framework import serializers as drf_serializers
        # Ensure user is a client
        if self.request.user.role != User.CLIENT:
            raise drf_serializers.ValidationError("Only clients can post jobs.")
        
        serializer.save(client=self.request.user, status=Job.OPEN)


class MyJobsView(generics.ListAPIView):
    """List jobs posted by the current user (client)"""
    
    serializer_class = JobSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Job.objects.filter(client=self.request.user).order_by('-created_at')


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def guest_job_submission(request):
    """Handle job submission by guest users"""
    serializer = GuestJobSubmissionSerializer(data=request.data)
    
    if serializer.is_valid():
        # Extract user and job data
        user_data = {
            'name': serializer.validated_data['name'],
            'email': serializer.validated_data['email'],
            'phone': serializer.validated_data.get('phone', ''),
            'password': serializer.validated_data['password'],
            'role': User.CLIENT
        }
        
        job_data = {k: v for k, v in serializer.validated_data.items() 
                   if k not in ['name', 'email', 'phone', 'password']}
        
        # Check if user already exists
        if User.objects.filter(email=user_data['email']).exists():
            return Response({
                'error': 'User with this email already exists. Please login instead.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Create user
        user = User.objects.create_user(**user_data)
        
        # Create job with pending registration status
        job = Job.objects.create(
            client=user,
            status=Job.PENDING_REGISTRATION,
            **job_data
        )
        
        return Response({
            'message': 'Job submitted successfully. Please complete your registration.',
            'job_id': str(job.id),
            'user_id': str(user.id),
            'redirect_to_registration': True
        }, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def complete_guest_registration(request, job_id):
    """Complete registration for guest job submission"""
    try:
        job = Job.objects.get(id=job_id, client=request.user, status=Job.PENDING_REGISTRATION)
        job.status = Job.OPEN
        job.save()
        
        return Response({
            'message': 'Registration completed successfully. Your job is now live.',
            'job': JobSerializer(job).data
        }, status=status.HTTP_200_OK)
    
    except Job.DoesNotExist:
        return Response({
            'error': 'Job not found or already processed.'
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['PUT'])
@permission_classes([permissions.IsAuthenticated])
def update_job_status(request, job_id):
    """Update job status (client only)"""
    try:
        job = Job.objects.get(id=job_id, client=request.user)
        new_status = request.data.get('status')
        
        if new_status not in dict(Job.STATUS_CHOICES):
            return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)
        
        job.status = new_status
        job.save()
        
        return Response({
            'message': 'Job status updated successfully',
            'job': JobSerializer(job).data
        }, status=status.HTTP_200_OK)
    
    except Job.DoesNotExist:
        return Response({'error': 'Job not found'}, status=status.HTTP_404_NOT_FOUND)
