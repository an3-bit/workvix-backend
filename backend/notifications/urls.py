from django.urls import path
from . import views

app_name = 'notifications'

urlpatterns = [
    path('', views.NotificationListView.as_view(), name='list'),
    path('create/', views.CreateNotificationView.as_view(), name='create'),
    path('<uuid:pk>/', views.NotificationDetailView.as_view(), name='detail'),
    path('<uuid:pk>/delete/', views.delete_notification, name='delete'),
    path('mark/', views.mark_notifications, name='mark'),
    path('mark-all-read/', views.mark_all_read, name='mark-all-read'),
    path('preferences/', views.NotificationPreferencesView.as_view(), name='preferences'),
    path('unread-count/', views.unread_count, name='unread-count'),
    path('bulk-send/', views.send_bulk_notifications, name='bulk-send'),
]
