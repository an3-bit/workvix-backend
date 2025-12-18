from django.urls import path
from . import views

app_name = 'offers'

urlpatterns = [
    # Offers URLs will be implemented in the next phase
    path('', views.OfferListView.as_view(), name='list'),
    path('<uuid:pk>/', views.OfferDetailView.as_view(), name='detail'),
    path('create/', views.CreateOfferView.as_view(), name='create'),
    path('<uuid:pk>/accept/', views.AcceptOfferView.as_view(), name='accept'),
    path('<uuid:pk>/reject/', views.RejectOfferView.as_view(), name='reject'),
]
