from django.urls import path
from . import views

app_name = 'offers'

urlpatterns = [
    path('', views.OfferListView.as_view(), name='list'),
    path('<uuid:pk>/', views.OfferDetailView.as_view(), name='detail'),
    path('create/', views.CreateOfferView.as_view(), name='create'),
    path('<uuid:offer_id>/accept/', views.accept_offer, name='accept'),
    path('<uuid:offer_id>/reject/', views.reject_offer, name='reject'),
    path('job/<uuid:job_id>/', views.job_offers, name='job-offers'),
]
