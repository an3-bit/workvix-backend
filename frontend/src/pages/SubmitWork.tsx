import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { orderAPI } from '../api/endpoints';
import { ArrowLeft, Upload, FileText, X, CheckCircle } from 'lucide-react';

const SubmitWork: React.FC = () => {
  const navigate = useNavigate();
  const { orderId } = useParams<{ orderId: string }>();

  const [order, setOrder] = useState<any>(null);
  const [formData, setFormData] = useState({
    submission_text: '',
    notes: '',
  });
  const [attachment, setAttachment] = useState<File | null>(null);
  const [attachmentPreview, setAttachmentPreview] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [loadingOrder, setLoadingOrder] = useState(true);
  const [success, setSuccess] = useState(false);

  // Load order details
  useEffect(() => {
    const loadOrder = async () => {
      try {
        if (!orderId) return;
        const res = await orderAPI.getOrderById(orderId);
        setOrder(res.data);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to load order');
      } finally {
        setLoadingOrder(false);
      }
    };
    loadOrder();
  }, [orderId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachment(file);
      setAttachmentPreview(file.name);
    }
  };

  const handleRemoveAttachment = () => {
    setAttachment(null);
    setAttachmentPreview('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.submission_text.trim()) {
      setError('Please provide details about your work submission');
      return;
    }

    setIsLoading(true);

    try {
      const data = new FormData();
      data.append('submission_text', formData.submission_text);
      data.append('notes', formData.notes);
      
      if (attachment) {
        data.append('attachment', attachment);
      }

      await orderAPI.submitWork(orderId!, data as any);
      
      // Show success message
      setSuccess(true);
      setIsLoading(false);
      
      // Redirect to dashboard after 3 seconds
      setTimeout(() => {
        navigate('/freelancer-dashboard');
      }, 3000);
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 
                       err.response?.data?.message || 
                       'Failed to submit work';
      setError(errorMsg);
      setIsLoading(false);
    }
  };

  if (loadingOrder) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8">
        <div className="bg-white rounded-lg shadow-lg p-12 max-w-md w-full text-center">
          <CheckCircle size={64} className="mx-auto text-green-500 mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Thank You for Submitting Your Work!</h2>
          <p className="text-gray-600 mb-6">
            The client will review it shortly and get back to you.
          </p>
          <p className="text-sm text-gray-500">
            Redirecting to your dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate('/freelancer-dashboard')}
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 mb-6"
        >
          <ArrowLeft size={20} />
          <span>Back to Dashboard</span>
        </button>

        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Submit Your Work</h1>
          {order && (
            <p className="text-gray-600 mb-6">
              Project: <span className="font-semibold">{order.title}</span>
            </p>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Work Details */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Work Details / Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="submission_text"
                value={formData.submission_text}
                onChange={handleChange}
                required
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe the work you've completed, what was done, and any relevant details..."
              />
            </div>

            {/* Additional Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Any additional information or notes for the client (optional)..."
              />
            </div>

            {/* File Attachment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Attach File(s)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition">
                <input
                  type="file"
                  id="file-input"
                  onChange={handleFileSelect}
                  className="hidden"
                  accept="*/*"
                />
                <label
                  htmlFor="file-input"
                  className="cursor-pointer flex flex-col items-center space-y-2"
                >
                  <Upload size={32} className="text-gray-400" />
                  <span className="text-sm text-gray-600">
                    Click to upload or drag and drop
                  </span>
                  <span className="text-xs text-gray-500">
                    Supported formats: All file types
                  </span>
                </label>
              </div>

              {/* File Preview */}
              {attachmentPreview && (
                <div className="mt-4 flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <FileText size={20} className="text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900">{attachmentPreview}</p>
                      <p className="text-sm text-gray-500">
                        {(attachment!.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveAttachment}
                    className="text-gray-400 hover:text-red-600"
                  >
                    <X size={20} />
                  </button>
                </div>
              )}
            </div>

            {/* Budget Info */}
            {order && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Amount:</span> ${order.amount}
                </p>
                <p className="text-sm text-gray-700 mt-2">
                  <span className="font-semibold">Delivery Date:</span>{' '}
                  {new Date(order.delivery_date).toLocaleDateString()}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-3 rounded-lg transition"
            >
              {isLoading ? 'Submitting...' : 'Submit Work'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SubmitWork;
