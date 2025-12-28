import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { chatAPI } from '../api/endpoints';
import { MessageCircle, Clock, Mail, AlertCircle } from 'lucide-react';

const Chats: React.FC = () => {
  const navigate = useNavigate();
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await chatAPI.listChats();
        const data = Array.isArray(res.data) ? res.data : res.data?.results ?? [];
        setChats(data);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to load chats');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Chats</h1>
            <p className="text-gray-600 text-sm">Pick a conversation to continue negotiating with freelancers.</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-4 flex items-center gap-2">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-gray-600">Loading chats...</div>
        ) : chats.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No chats yet. Submit or accept a bid to start chatting.</div>
        ) : (
          <div className="space-y-3">
            {chats.map(chat => {
              const last = chat.last_message;
              const otherUser = chat.client?.name === chat.freelancer?.name
                ? chat.freelancer?.name
                : chat.client?.name || chat.freelancer?.name;
              return (
                <button
                  key={chat.id || chat._id}
                  onClick={() => navigate(`/chat/${chat.id || chat._id}`)}
                  className="w-full bg-white border border-gray-200 rounded-lg p-4 text-left shadow-sm hover:shadow-md transition flex items-center gap-3"
                >
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-full"><MessageCircle size={20} /></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-gray-900 truncate">{chat.job_title || chat.job?.title || 'Chat'}</div>
                      {chat.unread_count > 0 && (
                        <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">{chat.unread_count}</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 truncate">With: {otherUser || 'Freelancer'}</div>
                    {last ? (
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                        <Clock size={14} />
                        <span>{new Date(last.created_at || last.createdAt).toLocaleString()}</span>
                        <span className="truncate">• {last.content}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                        <Mail size={14} />
                        <span>No messages yet</span>
                      </div>
                    )}
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

export default Chats;
