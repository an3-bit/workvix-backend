from django.urls import path
from . import views

app_name = 'chat'

urlpatterns = [
    # Chat URLs will be implemented in the next phase
    path('', views.ChatListView.as_view(), name='list'),
    path('<uuid:pk>/', views.ChatDetailView.as_view(), name='detail'),
    path('create/', views.CreateChatView.as_view(), name='create'),
    path('<uuid:chat_id>/messages/', views.MessageListView.as_view(), name='messages'),
    path('<uuid:chat_id>/send/', views.SendMessageView.as_view(), name='send-message'),
]
