from django.urls import path
from . import views

app_name = 'jobs'

urlpatterns = [
    path('', views.JobListView.as_view(), name='list'),
    path('<uuid:pk>/', views.JobDetailView.as_view(), name='detail'),
    path('create/', views.JobCreateView.as_view(), name='create'),
    path('my-jobs/', views.MyJobsView.as_view(), name='my-jobs'),
    path('guest-submission/', views.guest_job_submission, name='guest-submission'),
    path('<uuid:job_id>/complete-registration/', views.complete_guest_registration, name='complete-registration'),
    path('<uuid:job_id>/update-status/', views.update_job_status, name='update-status'),
]
