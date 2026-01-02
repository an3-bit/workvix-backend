import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { paymentAPI, orderAPI } from '../api/endpoints';
import { CreditCard, Loader, AlertCircle, CheckCircle } from 'lucide-react';

const Payment: React.FC = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState<any>(null);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [selectedMethodId, setSelectedMethodId] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAddMethod, setShowAddMethod] = useState(false);

  // Add method form
  const [formData, setFormData] = useState({
    method_type: 'credit_card',
    card_number: '',
    cardholder_name: '',
    expiry_month: '',
    expiry_year: '',
    cvv: '',
    billing_address: '',
  });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        // Load order
        const orderRes = await orderAPI.getOrderById(orderId!);
        const orderData = orderRes.data;
        setOrder(orderData);

        // Load payment methods
        const methodsRes = await paymentAPI.listMethods();
        const methods = Array.isArray(methodsRes.data) 
          ? methodsRes.data 
          : methodsRes.data?.results || [];
        setPaymentMethods(methods);

        // Set first method as default
        if (methods.length > 0) {
          setSelectedMethodId(methods[0].id || methods[0]._id);
        }
      } catch (err: any) {
        setError(err.response?.data?.error || err.response?.data?.detail || 'Failed to load payment details');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [orderId]);

  const handleAddMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      // Basic validation
      if (!formData.card_number || !formData.cardholder_name || !formData.expiry_month || !formData.expiry_year || !formData.cvv) {
        setError('All card fields are required');
        setSubmitting(false);
        return;
      }

      const payload = {
        method_type: formData.method_type,
        card_number: formData.card_number.replace(/\s/g, ''),
        cardholder_name: formData.cardholder_name,
        expiry_month: parseInt(formData.expiry_month),
        expiry_year: parseInt(formData.expiry_year),
        cvv: formData.cvv,
        billing_address: formData.billing_address || '',
      };

      const res = await paymentAPI.addMethod(payload);
      const newMethod = res.data;
      setPaymentMethods([...paymentMethods, newMethod]);
      setSelectedMethodId(newMethod.id || newMethod._id);
      setShowAddMethod(false);
      setFormData({
        method_type: 'credit_card',
        card_number: '',
        cardholder_name: '',
        expiry_month: '',
        expiry_year: '',
        cvv: '',
        billing_address: '',
      });
      setSuccess('Payment method added successfully');
    } catch (err: any) {
      setError(err.response?.data?.error || err.response?.data?.detail || 'Failed to add payment method');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMakePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    if (!selectedMethodId) {
      setError('Please select or add a payment method');
      setSubmitting(false);
      return;
    }

    try {
      const payload = {
        order: orderId!,
        payment_method_id: selectedMethodId,
        payment_type: 'order' as const,
      };

      await paymentAPI.createPayment(payload);
      setSuccess('Payment initiated successfully! Redirecting to orders...');
      setTimeout(() => {
        navigate('/client-orders');
      }, 2000);
    } catch (err: any) {
      console.error('Payment error:', err.response?.data || err);
      const errorMsg = err.response?.data?.error || 
                       err.response?.data?.detail || 
                       err.response?.data?.payment_method_id?.[0] ||
                       'Failed to process payment';
      setError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader size={48} className="animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading payment details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle size={48} className="text-red-600 mx-auto mb-4" />
          <p className="text-gray-600">Order not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Make Payment</h1>
          <p className="text-gray-600 text-sm mt-2">Complete your payment securely</p>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Job:</span>
              <span className="font-medium text-gray-900">{order.job?.title || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Freelancer:</span>
              <span className="font-medium text-gray-900">{order.freelancer?.name || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                order.status === 'active' ? 'bg-blue-100 text-blue-800' : 
                order.status === 'submitted' ? 'bg-green-100 text-green-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {order.status || 'N/A'}
              </span>
            </div>
            <div className="border-t border-gray-200 pt-3 mt-3">
              <div className="flex justify-between text-lg font-bold">
                <span className="text-gray-900">Total Amount:</span>
                <span className="text-blue-600">${order.amount || '0.00'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
            <div className="flex items-start">
              <AlertCircle size={20} className="flex-shrink-0 mr-3 mt-0.5" />
              <div>{error}</div>
            </div>
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mb-6">
            <div className="flex items-start">
              <CheckCircle size={20} className="flex-shrink-0 mr-3 mt-0.5" />
              <div>{success}</div>
            </div>
          </div>
        )}

        {/* Payment Methods */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Select Payment Method</h2>
            <button
              onClick={() => setShowAddMethod(!showAddMethod)}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              {showAddMethod ? 'Cancel' : '+ Add New Method'}
            </button>
          </div>

          {/* Add Method Form */}
          {showAddMethod && (
            <form onSubmit={handleAddMethod} className="bg-gray-50 p-4 rounded-lg mb-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Card Number
                  </label>
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    value={formData.card_number}
                    onChange={(e) => setFormData({ ...formData, card_number: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={formData.cardholder_name}
                    onChange={(e) => setFormData({ ...formData, cardholder_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Month
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="12"
                      placeholder="MM"
                      value={formData.expiry_month}
                      onChange={(e) => setFormData({ ...formData, expiry_month: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Year
                    </label>
                    <input
                      type="number"
                      min={new Date().getFullYear()}
                      placeholder="YYYY"
                      value={formData.expiry_year}
                      onChange={(e) => setFormData({ ...formData, expiry_year: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CVV
                    </label>
                    <input
                      type="password"
                      placeholder="***"
                      maxLength={4}
                      value={formData.cvv}
                      onChange={(e) => setFormData({ ...formData, cvv: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Billing Address (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="123 Main St, City, State, ZIP"
                    value={formData.billing_address}
                    onChange={(e) => setFormData({ ...formData, billing_address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
                >
                  {submitting ? 'Adding...' : 'Add Payment Method'}
                </button>
              </div>
            </form>
          )}

          {/* Select Method */}
          {paymentMethods.length > 0 ? (
            <div className="space-y-3 mb-6">
              {paymentMethods.map((method) => (
                <label key={method.id || method._id} className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="payment_method"
                    value={method.id || method._id}
                    checked={selectedMethodId === (method.id || method._id)}
                    onChange={(e) => setSelectedMethodId(e.target.value)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <div className="ml-3 flex items-center">
                    <CreditCard size={20} className="text-gray-600 mr-2" />
                    <div>
                      <p className="font-medium text-gray-900">{method.method_type}</p>
                      <p className="text-sm text-gray-600">{method.masked_card_number || method.cardholder_name}</p>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          ) : (
            <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg mb-6">
              No payment methods found. Add one to continue.
            </div>
          )}
        </div>

        {/* Payment Form */}
        <form onSubmit={handleMakePayment} className="space-y-6">
          <button
            type="submit"
            disabled={submitting || !selectedMethodId || paymentMethods.length === 0}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg"
          >
            {submitting ? 'Processing...' : `Pay $${order.amount || '0.00'}`}
          </button>

          <button
            type="button"
            onClick={() => navigate('/client-orders')}
            className="w-full bg-gray-200 text-gray-900 py-3 rounded-lg hover:bg-gray-300 font-medium"
          >
            Cancel
          </button>
        </form>

        {/* Security Notice */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>🔒 Your payment information is secure and encrypted.</p>
        </div>
      </div>
    </div>
  );
};

export default Payment;
