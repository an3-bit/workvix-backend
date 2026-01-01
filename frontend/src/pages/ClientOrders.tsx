import React, { useEffect, useState } from 'react';
import { orderAPI } from '../api/endpoints';
import { CheckCircle2, Clock, AlertCircle, MessageCircle, CreditCard, X, FileText, Download } from 'lucide-react';
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
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);

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
    try {
      await orderAPI.approveOrder(orderId, { rating: 5, feedback: '' });
      // Reload orders
      const res = await orderAPI.listOrders();
      const data = Array.isArray(res.data) ? res.data : res.data?.results ?? [];
      setOrders(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to approve order');
    }
  };

  const handleRequestRevision = async (orderId: string) => {
    try {
      await orderAPI.requestRevision(orderId, { revision_notes: 'Please adjust accordingly' });
      // Find the order to get chat ID
      const order = orders.find(o => (o.id || o._id) === orderId);
      if (order?.chat) {
        navigate(`/chat/${order.chat}`);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to request revision');
    }
  };

  const handleViewSubmission = (submission: any) => {
    setSelectedSubmission(submission);
    setShowSubmissionModal(true);
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
                  {order.status === 'submitted' && order.submissions && order.submissions.length > 0 && (
                    <button
                      onClick={() => handleViewSubmission(order.submissions[0])}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-purple-100 text-purple-700 hover:bg-purple-200 text-sm font-medium transition"
                    >
                      <FileText size={16} /> View Submission
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
                        Approve
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

      {/* Submission Modal */}
      {showSubmissionModal && selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Work Submission Details</h2>
              <button
                onClick={() => {
                  setShowSubmissionModal(false);
                  setSelectedSubmission(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Submission Text */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Work Details</h3>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedSubmission.submission_text}</p>
                </div>
              </div>

              {/* Notes */}
              {selectedSubmission.notes && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Additional Notes</h3>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedSubmission.notes}</p>
                  </div>
                </div>
              )}

              {/* Attachment */}
              {selectedSubmission.attachment && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Attached File</h3>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FileText size={24} className="text-blue-600" />
                      <div>
                        <p className="font-medium text-gray-900">
                          {selectedSubmission.attachment.split('/').pop()}
                        </p>
                        <p className="text-sm text-gray-600">
                          Attached on {new Date(selectedSubmission.created_at || selectedSubmission.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <a
                      href={selectedSubmission.attachment}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      <Download size={16} /> Download
                    </a>
                  </div>
                </div>
              )}

              {/* Submission Date */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Submitted:</span>{' '}
                  {new Date(selectedSubmission.created_at || selectedSubmission.createdAt).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="sticky bottom-0 bg-white border-t p-6 flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowSubmissionModal(false);
                  setSelectedSubmission(null);
                }}
                className="px-6 py-2 rounded-lg bg-gray-200 text-gray-900 hover:bg-gray-300 font-medium transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientOrders;
