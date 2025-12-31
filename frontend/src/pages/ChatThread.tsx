import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { chatAPI, offerAPI } from '../api/endpoints';
import { ArrowLeft, Send, FilePlus, Paperclip, X, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import InlineAlert from '../components/InlineAlert';

const ChatThread: React.FC = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [chat, setChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [offers, setOffers] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const [attachmentName, setAttachmentName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showOffer, setShowOffer] = useState(false);
  const [acceptingOfferId, setAcceptingOfferId] = useState<string | null>(null);
  const [offerCreatedSuccess, setOfferCreatedSuccess] = useState(false);
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
        
        // Fetch offers for this chat
        if (res.data?.job || res.data?.job_id) {
          const jobId = res.data?.job || res.data?.job_id;
          try {
            const offersRes = await offerAPI.jobOffers(jobId);
            setOffers(offersRes.data?.offers || []);
          } catch (offerErr) {
            // Silently fail if offers can't be loaded
            console.error('Failed to load offers:', offerErr);
          }
        }
        
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
    if (!input.trim() && !attachment) return;
    try {
      const formData = new FormData();
      formData.append('content', input.trim());
      if (attachment) {
        formData.append('attachment', attachment);
      }
      
      const res = await chatAPI.sendMessage(chatId!, formData as any);
      setMessages(prev => [...prev, res.data]);
      setInput('');
      setAttachment(null);
      setAttachmentName('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachment(file);
      setAttachmentName(file.name);
    }
  };

  const clearAttachment = () => {
    setAttachment(null);
    setAttachmentName('');
  };

  const handleAcceptOffer = async (offerId: string) => {
    try {
      setAcceptingOfferId(offerId);
      const response = await offerAPI.acceptOffer(offerId);
      
      // Backend now automatically creates order, just redirect to orders page
      setTimeout(() => {
        navigate('/orders');
      }, 1000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to accept offer');
      setAcceptingOfferId(null);
    }
  };

  const handleRejectOffer = async (offerId: string) => {
    try {
      await offerAPI.rejectOffer(offerId);
      // Reload offers
      if (jobId) {
        const offersRes = await offerAPI.jobOffers(jobId);
        setOffers(offersRes.data?.offers || []);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to reject offer');
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
      // Show success message
      setOfferCreatedSuccess(true);
      // Reload offers
      if (jobId) {
        const offersRes = await offerAPI.jobOffers(jobId);
        setOffers(offersRes.data?.offers || []);
      }
      // Clear error and redirect after 3 seconds
      setError('');
      setTimeout(() => {
        navigate('/freelancer-dashboard');
      }, 3000);
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
                {user?.role === 'freelancer' && !offers.some((o: any) => o.freelancer?.id === (user as any)?.id) && (
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
                    <div className="bg-gray-100 rounded-md p-2">
                      {m.content && <p>{m.content}</p>}
                      {m.attachments && m.attachments.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {m.attachments.map((att: any, attIdx: number) => (
                            <a
                              key={attIdx}
                              href={att.file}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 hover:text-blue-800 text-sm px-2 py-1 rounded border border-blue-200"
                            >
                              <Paperclip size={14} />
                              {att.original_name}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {/* Display pending offers */}
                {offers.filter((o: any) => o.status === 'pending').map((offer: any) => (
                  <div key={offer.id} className="flex flex-col bg-blue-50 border border-blue-200 rounded-md p-3">
                    <div className="text-sm text-gray-600 font-semibold mb-2">
                      💼 Offer from {offer.freelancer?.name || 'Freelancer'}
                    </div>
                    <div className="text-sm space-y-1 mb-3">
                      <p><strong>Amount:</strong> ${Number(offer.amount).toLocaleString()}</p>
                      <p><strong>Delivery:</strong> {offer.delivery_time} days</p>
                      {offer.description && <p><strong>Description:</strong> {offer.description}</p>}
                    </div>
                    
                    {/* Accept/Reject buttons only for client */}
                    {user?.role === 'client' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAcceptOffer(offer.id)}
                          disabled={acceptingOfferId === offer.id}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-md bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm transition"
                        >
                          <CheckCircle size={14} />
                          {acceptingOfferId === offer.id ? 'Accepting...' : 'Accept'}
                        </button>
                        <button
                          onClick={() => handleRejectOffer(offer.id)}
                          disabled={acceptingOfferId === offer.id}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-md bg-gray-300 hover:bg-gray-400 disabled:opacity-50 text-gray-700 text-sm transition"
                        >
                          <XCircle size={14} />
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-4 space-y-2">
                {attachmentName && (
                  <div className="bg-blue-50 border border-blue-200 rounded px-3 py-2 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                      <Paperclip size={16} className="text-blue-600" />
                      <span className="text-gray-700">{attachmentName}</span>
                    </div>
                    <button
                      type="button"
                      onClick={clearAttachment}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
                <div className="flex gap-2 items-center">
                  <input
                    type="file"
                    id="file-input"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => document.getElementById('file-input')?.click()}
                    className="p-2 border rounded-md text-gray-500 hover:text-blue-600 hover:border-blue-300"
                    title="Attach a file"
                  >
                    <Paperclip size={18} />
                  </button>
                  <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && send()}
                    placeholder="Type a message"
                    className="flex-1 border rounded-md px-3 py-2"
                  />
                  <button onClick={send} className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">
                    <Send size={18} /> Send
                  </button>
                </div>
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

        {offerCreatedSuccess && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md text-center">
              <CheckCircle size={64} className="mx-auto text-green-500 mb-6" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Offer Created Successfully!</h2>
              <p className="text-gray-600 mb-6">
                Your offer has been sent to the client. You will be notified when they respond.
              </p>
              <p className="text-sm text-gray-500">
                Redirecting to your dashboard in a few seconds...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatThread;
