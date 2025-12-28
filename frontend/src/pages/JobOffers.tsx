import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { offerAPI, orderAPI } from '../api/endpoints';
import { ArrowLeft } from 'lucide-react';

const JobOffers: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const [offers, setOffers] = useState<any[]>([]);
  const [jobTitle, setJobTitle] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [creatingOrderFor, setCreatingOrderFor] = useState<string | null>(null);
  const [orderData, setOrderData] = useState({ delivery_date: '', special_instructions: '' });

  const load = async () => {
    if (!jobId) return;
    setLoading(true);
    setError('');
    try {
      const res = await offerAPI.jobOffers(jobId);
      setOffers(res.data?.offers || []);
      setJobTitle(res.data?.job_title || '');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch offers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [jobId]);

  const accept = async (offerId: string) => {
    try {
      await offerAPI.acceptOffer(offerId);
      // Prompt create order
      setCreatingOrderFor(offerId);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to accept offer');
    }
  };

  const reject = async (offerId: string) => {
    try {
      await offerAPI.rejectOffer(offerId);
      await load();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to reject offer');
    }
  };

  const createOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!creatingOrderFor) return;
    try {
      await orderAPI.createOrder({
        offer: creatingOrderFor,
        delivery_date: new Date(orderData.delivery_date).toISOString(),
        special_instructions: orderData.special_instructions || undefined,
      });
      setCreatingOrderFor(null);
      setOrderData({ delivery_date: '', special_instructions: '' });
      // Navigate to client dashboard with orders tab active
      setTimeout(() => navigate('/client-dashboard?tab=orders'), 500);
    } catch (err: any) {
      const msg = err.response?.data?.error || err.response?.data?.detail || 'Failed to create order';
      // Log full backend response for debugging
      // eslint-disable-next-line no-console
      console.error('Order creation failed', err.response?.data || err);
      setError(msg);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-3xl mx-auto px-4">
        <button
          onClick={() => navigate('/client-jobs')}
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 mb-4"
        >
          <ArrowLeft size={20} />
          <span>Back to Jobs</span>
        </button>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-2">Offers for: {jobTitle || 'Job'}</h2>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-3">{error}</div>
          )}
          {loading ? (
            <div>Loading...</div>
          ) : (
            <div className="space-y-4">
              {offers.length === 0 && <div className="text-gray-500">No offers yet.</div>}
              {offers.map((offer: any) => (
                <div key={offer.id} className="border rounded-md p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{offer.title}</div>
                      <div className="text-sm text-gray-600">By: {offer.freelancer?.name}</div>
                      <div className="mt-1">Amount: ${offer.amount}</div>
                      <div>Delivery: {offer.delivery_time} days</div>
                      <div className="text-sm text-gray-500">Status: {offer.status}</div>
                    </div>
                    <div className="flex gap-2">
                      {offer.status === 'pending' && (
                        <>
                          <button className="px-3 py-2 rounded-md bg-green-600 text-white" onClick={() => accept(offer.id)}>Accept</button>
                          <button className="px-3 py-2 rounded-md bg-gray-200" onClick={() => reject(offer.id)}>Reject</button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {creatingOrderFor && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Create Order from Accepted Offer</h3>
              <form onSubmit={createOrder} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium">Delivery Date</label>
                  <input
                    type="datetime-local"
                    value={orderData.delivery_date}
                    onChange={e => setOrderData({ ...orderData, delivery_date: e.target.value })}
                    className="w-full border rounded-md px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Special Instructions</label>
                  <textarea
                    rows={3}
                    value={orderData.special_instructions}
                    onChange={e => setOrderData({ ...orderData, special_instructions: e.target.value })}
                    className="w-full border rounded-md px-3 py-2"
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <button type="button" className="px-3 py-2 rounded-md border" onClick={() => setCreatingOrderFor(null)}>Cancel</button>
                  <button type="submit" className="px-3 py-2 rounded-md bg-blue-600 text-white">Create Order</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobOffers;
