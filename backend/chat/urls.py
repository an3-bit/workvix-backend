from django.urls import path
from . import views

app_name = 'chat'

urlpatterns = [
    path('', views.ChatListView.as_view(), name='list'),
    path('<uuid:pk>/', views.ChatDetailView.as_view(), name='detail'),
    path('create/', views.CreateChatView.as_view(), name='create'),
    path('<uuid:chat_id>/send/', views.SendMessageView.as_view(), name='send-message'),
    path('<uuid:chat_id>/mark-read/', views.mark_messages_read, name='mark-read'),
    path('unread-count/', views.get_unread_count, name='unread-count'),
]
