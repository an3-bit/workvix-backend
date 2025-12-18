from django.urls import path
from . import views

app_name = 'notifications'

urlpatterns = [
    # Notifications URLs will be implemented in the next phase
    path('', views.NotificationListView.as_view(), name='list'),
    path('<uuid:pk>/', views.NotificationDetailView.as_view(), name='detail'),
    path('<uuid:pk>/mark-read/', views.MarkAsReadView.as_view(), name='mark-read'),
    path('preferences/', views.NotificationPreferencesView.as_view(), name='preferences'),
    path('unread-count/', views.UnreadCountView.as_view(), name='unread-count'),
]
