from django.urls import path
from . import views

app_name = 'payments'

urlpatterns = [
    # Payments URLs will be implemented in the next phase
    path('', views.PaymentListView.as_view(), name='list'),
    path('create/', views.CreatePaymentView.as_view(), name='create'),
    path('<uuid:pk>/', views.PaymentDetailView.as_view(), name='detail'),
    path('<uuid:pk>/confirm/', views.ConfirmPaymentView.as_view(), name='confirm'),
    path('webhook/stripe/', views.StripeWebhookView.as_view(), name='stripe-webhook'),
]
