from django.urls import path
from . import views

app_name = 'orders'

urlpatterns = [
    path('', views.OrderListView.as_view(), name='list'),
    path('create/', views.CreateOrderView.as_view(), name='create'),
    path('<uuid:pk>/', views.OrderDetailView.as_view(), name='detail'),
    path('<uuid:order_id>/submit/', views.submit_work, name='submit'),
    path('<uuid:order_id>/approve/', views.approve_order, name='approve'),
    path('<uuid:order_id>/request-revision/', views.request_revision, name='request-revision'),
    path('<uuid:order_id>/cancel/', views.cancel_order, name='cancel'),
]
