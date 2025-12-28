from django.urls import path
from . import views

app_name = 'payments'

urlpatterns = [
    path('', views.PaymentListView.as_view(), name='list'),
    path('create/', views.CreatePaymentView.as_view(), name='create'),
    path('<uuid:pk>/', views.PaymentDetailView.as_view(), name='detail'),
    path('<uuid:payment_id>/process/', views.process_payment, name='process'),
    path('history/', views.payment_history, name='history'),
    path('methods/', views.PaymentMethodListView.as_view(), name='methods-list'),
    path('methods/add/', views.AddPaymentMethodView.as_view(), name='add-method'),
    path('methods/<uuid:method_id>/remove/', views.remove_payment_method, name='remove-method'),
    path('webhook/stripe/', views.StripeWebhookView.as_view(), name='stripe-webhook'),
]
