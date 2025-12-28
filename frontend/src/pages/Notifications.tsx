import React, { useEffect, useState } from 'react';
import { chatAPI } from '../api/endpoints';
import { Bell, MessageCircle, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Notifications: React.FC = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        // Fetch all chats to use as notifications
        const res = await chatAPI.listChats();
        const data = Array.isArray(res.data) ? res.data : res.data?.results ?? [];
        
        // Filter chats with unread messages
        const unreadChats = data.filter((c: any) => c.unread_count > 0);
        
        // If no unread, show all recent chats
        if (unreadChats.length === 0) {
          setNotifications(data.slice(0, 10));
        } else {
          setNotifications(unreadChats);
        }
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to load notifications');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const clearNotification = (chatId: string) => {
    setNotifications(prev => prev.filter(n => (n.id || n._id) !== chatId));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-3xl mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600 text-sm">Stay updated with messages from freelancers.</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-gray-600">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell size={48} className="mx-auto text-gray-400 mb-3" />
            <p className="text-gray-500">No notifications yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map(notification => {
              const chatId = notification.id || notification._id;
              const unreadBadge = notification.unread_count > 0;
              return (
                <button
                  key={chatId}
                  onClick={() => navigate(`/chat/${chatId}`)}
                  className={`w-full text-left bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition ${
                    unreadBadge ? 'border-blue-300 bg-blue-50' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <MessageCircle size={18} className={unreadBadge ? 'text-blue-600' : 'text-gray-600'} />
                        <h3 className="font-semibold text-gray-900">{notification.job_title || 'Message'}</h3>
                        {unreadBadge && (
                          <span className="inline-flex items-center justify-center w-5 h-5 bg-blue-600 text-white text-xs font-bold rounded-full">
                            {notification.unread_count}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        From: {notification.freelancer?.name || notification.client?.name || 'User'}
                      </p>
                      {notification.last_message && (
                        <p className="text-sm text-gray-500 mt-2 line-clamp-2">{notification.last_message.content}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-2">
                        {notification.last_message?.created_at
                          ? new Date(notification.last_message.created_at).toLocaleString()
                          : new Date(notification.updated_at || notification.updatedAt).toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        clearNotification(chatId);
                      }}
                      className="p-2 text-gray-400 hover:text-red-600 transition"
                      title="Clear"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
