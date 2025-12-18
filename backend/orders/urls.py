from django.urls import path
from . import views

app_name = 'orders'

urlpatterns = [
    # Orders URLs will be implemented in the next phase
    path('', views.OrderListView.as_view(), name='list'),
    path('<uuid:pk>/', views.OrderDetailView.as_view(), name='detail'),
    path('<uuid:pk>/submit/', views.SubmitWorkView.as_view(), name='submit'),
    path('<uuid:pk>/approve/', views.ApproveWorkView.as_view(), name='approve'),
    path('<uuid:pk>/request-revision/', views.RequestRevisionView.as_view(), name='request-revision'),
]
