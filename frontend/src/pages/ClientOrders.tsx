import React, { useEffect, useState } from 'react';
import { orderAPI } from '../api/endpoints';
import { CheckCircle2, Clock, AlertCircle, MessageCircle, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const statusBadge = (status: string) => {
  const base = 'inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold';
  switch (status) {
    case 'active':
      return `${base} bg-blue-100 text-blue-800`;
    case 'submitted':
      return `${base} bg-purple-100 text-purple-800`;
    case 'revision_requested':
      return `${base} bg-yellow-100 text-yellow-800`;
    case 'completed':
      return `${base} bg-green-100 text-green-800`;
    case 'cancelled':
      return `${base} bg-red-100 text-red-800`;
    default:
      return `${base} bg-gray-100 text-gray-700`;
  }
};

const ClientOrders: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'active' | 'all'>('active');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await orderAPI.listOrders();
        const data = Array.isArray(res.data) ? res.data : res.data?.results ?? [];
        setOrders(data);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleApprove = async (orderId: string) => {
    const rating = Number(window.prompt('Rate the work (1-5)', '5')) || 5;
    const feedback = window.prompt('Feedback (optional)', '') || '';
    try {
      await orderAPI.approveOrder(orderId, { rating, feedback });
      // Reload orders
      const res = await orderAPI.listOrders();
      const data = Array.isArray(res.data) ? res.data : res.data?.results ?? [];
      setOrders(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to approve order');
    }
  };

  const handleRequestRevision = async (orderId: string) => {
    const notes = window.prompt('Revision notes (min 10 chars)', 'Please adjust...');
    if (!notes) return;
    try {
      await orderAPI.requestRevision(orderId, { revision_notes: notes });
      const res = await orderAPI.listOrders();
      const data = Array.isArray(res.data) ? res.data : res.data?.results ?? [];
      setOrders(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to request revision');
    }
  };

  const filteredOrders = activeTab === 'active'
    ? orders.filter(o => !['completed', 'cancelled'].includes(o.status))
    : orders;

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
          <p className="text-gray-600 text-sm">Track your work orders and payments.</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-4 flex items-center gap-2">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-6 py-3 font-medium border-b-2 transition ${
              activeTab === 'active'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Active Orders ({orders.filter(o => !['completed', 'cancelled'].includes(o.status)).length})
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-6 py-3 font-medium border-b-2 transition ${
              activeTab === 'all'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            All Orders ({orders.length})
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-600">Loading orders...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No orders found.</div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map(order => (
              <div key={order.id || order._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{order.job?.title || 'Order'}</h3>
                    <p className="text-sm text-gray-600">Freelancer: {order.freelancer?.name || 'Unknown'}</p>
                  </div>
                  <span className={statusBadge(order.status)}>
                    {order.status === 'completed' && <CheckCircle2 size={16} />}
                    {order.status === 'active' && <Clock size={16} />}
                    {order.status === 'submitted' && <CheckCircle2 size={16} />}
                    {order.status === 'revision_requested' && <AlertCircle size={16} />}
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1).replace('_', ' ')}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                  <div>
                    <p className="text-gray-500">Amount</p>
                    <p className="font-semibold text-gray-900">${Number(order.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Delivery Date</p>
                    <p className="font-semibold text-gray-900">
                      {order.delivery_date ? new Date(order.delivery_date).toLocaleDateString() : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Status</p>
                    <p className="font-semibold text-gray-900 capitalize">{order.status.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Created</p>
                    <p className="font-semibold text-gray-900">{new Date(order.createdAt || order.created_at).toLocaleDateString()}</p>
                  </div>
                </div>

                {order.special_instructions && (
                  <div className="mb-4 p-3 bg-gray-50 rounded border border-gray-200">
                    <p className="text-sm text-gray-700"><strong>Instructions:</strong> {order.special_instructions}</p>
                  </div>
                )}

                <div className="flex gap-2 flex-wrap pt-4 border-t">
                  {order.job?.id && (
                    <button
                      onClick={() => navigate(`/chat/${order.id}`)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200 text-sm font-medium transition"
                    >
                      <MessageCircle size={16} /> Chat
                    </button>
                  )}
                  {order.status === 'active' && (
                    <button
                      onClick={() => navigate(`/payment/${order.id || order._id}`)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 text-sm font-medium transition"
                    >
                      <CreditCard size={16} /> Make Payment
                    </button>
                  )}
                  {order.status === 'submitted' && (
                    <>
                      <button
                        onClick={() => handleApprove(order.id || order._id)}
                        className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 text-sm font-medium transition"
                      >
                        Approve & Rate
                      </button>
                      <button
                        onClick={() => handleRequestRevision(order.id || order._id)}
                        className="px-4 py-2 rounded-md bg-yellow-100 text-yellow-800 hover:bg-yellow-200 text-sm font-medium transition"
                      >
                        Request Revision
                      </button>
                    </>
                  )}
                  {order.status === 'active' && !order.job?.id && (
                    <div className="ml-auto px-4 py-2 text-sm text-gray-600">
                      Awaiting submission...
                    </div>
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

export default ClientOrders;
