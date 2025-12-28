import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { chatAPI, offerAPI } from '../api/endpoints';
import { ArrowLeft, Send, FilePlus, Paperclip } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import InlineAlert from '../components/InlineAlert';

const ChatThread: React.FC = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [chat, setChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showOffer, setShowOffer] = useState(false);
  const [offerData, setOfferData] = useState({
    amount: '',
    delivery_time: 3,
    description: '',
    payment_type: 'fixed' as 'fixed' | 'hourly',
  });
  const jobId = useMemo(() => chat?.job || chat?.job_id || chat?.job?.id, [chat]);
  const jobTitle = useMemo(() => chat?.job_title || chat?.job?.title || 'Job', [chat]);

  useEffect(() => {
    const load = async () => {
      if (!chatId) return;
      setLoading(true);
      setError('');
      try {
        const res = await chatAPI.getChat(chatId);
        setChat(res.data);
        setMessages(res.data?.messages || []);
        // Mark as read
        await chatAPI.markRead(chatId);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to load chat');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [chatId]);

  const send = async () => {
    if (!input.trim()) return;
    try {
      const res = await chatAPI.sendMessage(chatId!, { content: input.trim() });
      setMessages(prev => [...prev, res.data]);
      setInput('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send');
    }
  };

  const submitOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobId) {
      setError('Job not found for this chat.');
      return;
    }
    if (user?.role !== 'freelancer') {
        setError('Only freelancers can create offers.');
        return;
    }
    const amount = Number(offerData.amount);
    const days = Number(offerData.delivery_time);
    if (!amount || amount <= 0) {
      setError('Amount must be greater than 0.');
      return;
    }
    if (!days || days <= 0) {
      setError('Delivery time must be at least 1 day.');
      return;
    }
    try {
      await offerAPI.createOffer({
        job_id: String(jobId),
        description: offerData.description || 'Offer from chat',
        delivery_time: days,
        amount,
        payment_type: offerData.payment_type,
      });
      // Notify client in chat
      await chatAPI.sendMessage(chatId!, { content: `Sent an offer: $${offerData.amount} | ${offerData.delivery_time} days.` });
      setShowOffer(false);
      // Clear error and redirect to offers list
      setError('');
      setTimeout(() => navigate('/my-offers'), 500);
    } catch (err: any) {
      const msg = err.response?.data?.error || err.response?.data?.detail || 'Failed to create offer';
       // Log backend response to console for debugging
       // eslint-disable-next-line no-console
       console.error('Offer creation failed', err.response?.data || err);
       setError(msg);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-3xl mx-auto px-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 mb-4"
        >
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>

        <div className="bg-white rounded-lg shadow-md p-4">
          {loading ? (
            <div>Loading chat...</div>
          ) : error ? (
            <InlineAlert message={error} />
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold">{jobTitle}</h2>
                  {jobId && (
                    <Link to={`/jobs/${jobId}/offers`} className="text-sm text-blue-600 hover:text-blue-700">
                      View offers for this job
                    </Link>
                  )}
                </div>
                {user?.role === 'freelancer' && (
                  <button
                    onClick={() => setShowOffer(true)}
                    className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md"
                  >
                    <FilePlus size={18} /> Create Offer
                  </button>
                )}
              </div>

              <div className="space-y-3 max-h-[50vh] overflow-y-auto border rounded-md p-3">
                {messages.map((m, idx) => (
                  <div key={idx} className="flex flex-col">
                    <div className="text-sm text-gray-500">{m.sender?.name || 'You'}</div>
                    <div className="bg-gray-100 rounded-md p-2">{m.content}</div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex gap-2 items-center">
                <button
                  type="button"
                  className="p-2 border rounded-md text-gray-500 hover:text-blue-600 hover:border-blue-300"
                  title="Attachments coming soon"
                  disabled
                >
                  <Paperclip size={18} />
                </button>
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Type a message"
                  className="flex-1 border rounded-md px-3 py-2"
                />
                <button onClick={send} className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">
                  <Send size={18} /> Send
                </button>
              </div>
            </>
          )}
        </div>

        {showOffer && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Create Offer</h3>
              <form onSubmit={submitOffer} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium">Amount ($)</label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={offerData.amount}
                    onChange={e => setOfferData({ ...offerData, amount: e.target.value })}
                    className="w-full border rounded-md px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Delivery Time (days)</label>
                  <input
                    type="number"
                    min={1}
                    value={offerData.delivery_time}
                    onChange={e => setOfferData({ ...offerData, delivery_time: Number(e.target.value) })}
                    className="w-full border rounded-md px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Payment Type</label>
                  <select
                    value={offerData.payment_type}
                    onChange={e => setOfferData({ ...offerData, payment_type: e.target.value as 'fixed' | 'hourly' })}
                    className="w-full border rounded-md px-3 py-2"
                  >
                    <option value="fixed">Fixed</option>
                    <option value="hourly">Hourly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium">Description</label>
                  <textarea
                    rows={3}
                    value={offerData.description}
                    onChange={e => setOfferData({ ...offerData, description: e.target.value })}
                    className="w-full border rounded-md px-3 py-2"
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <button type="button" className="px-3 py-2 rounded-md border" onClick={() => setShowOffer(false)}>Cancel</button>
                  <button type="submit" className="px-3 py-2 rounded-md bg-green-600 text-white">Create Offer</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatThread;
