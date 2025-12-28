import React, { useEffect, useState } from 'react';
import { offerAPI } from '../api/endpoints';
import { AlertCircle, Clock, CheckCircle2, XCircle, ArrowLeft, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const statusBadge = (status: string) => {
  const base = 'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold';
  switch (status) {
    case 'accepted':
      return `${base} bg-green-100 text-green-800`;
    case 'rejected':
      return `${base} bg-red-100 text-red-800`;
    case 'withdrawn':
      return `${base} bg-gray-100 text-gray-700`;
    default:
      return `${base} bg-yellow-100 text-yellow-800`;
  }
};

const MyOffers: React.FC = () => {
  const navigate = useNavigate();
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await offerAPI.listOffers();
        const data = Array.isArray(res.data) ? res.data : res.data?.results ?? [];
        setOffers(data);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to load offers');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Offers</h1>
            <p className="text-gray-600 text-sm">Track your proposals and whether clients accepted them.</p>
          </div>
          <button
            onClick={() => navigate('/freelancer-dashboard')}
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft size={18} /> Back
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-4 flex items-center gap-2">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-gray-600">Loading offers...</div>
        ) : offers.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No offers yet.</div>
        ) : (
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="grid grid-cols-12 px-4 py-2 text-xs font-semibold text-gray-500 border-b">
              <div className="col-span-4">Job</div>
              <div className="col-span-2">Amount</div>
              <div className="col-span-2">Delivery</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>
            {offers.map(offer => (
              <div key={offer.id || offer._id} className="grid grid-cols-12 px-4 py-3 border-b last:border-0 items-center">
                <div className="col-span-4">
                  <div className="font-medium text-gray-900 truncate">{offer.job?.title || 'Job'}</div>
                  <div className="text-sm text-gray-600">Chat: {offer.chat || '—'}</div>
                </div>
                <div className="col-span-2 text-sm font-semibold">${Number(offer.amount).toLocaleString()}</div>
                <div className="col-span-2 text-sm text-gray-700">{offer.delivery_time} days</div>
                <div className="col-span-2">
                  <span className={statusBadge(offer.status)}>
                    {offer.status === 'accepted' && <CheckCircle2 size={14} />}
                    {offer.status === 'rejected' && <XCircle size={14} />}
                    {offer.status === 'pending' && <Clock size={14} />}
                    {offer.status === 'withdrawn' && <XCircle size={14} />}
                    {offer.status.charAt(0).toUpperCase() + offer.status.slice(1)}
                  </span>
                </div>
                <div className="col-span-2 flex justify-end gap-2">
                  {offer.chat && (
                    <button
                      onClick={() => navigate(`/chat/${offer.chat}`)}
                      className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm"
                    >
                      <MessageCircle size={16} /> Chat
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOffers;
