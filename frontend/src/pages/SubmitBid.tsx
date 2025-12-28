import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { chatAPI } from '../api/endpoints';
import { ArrowLeft } from 'lucide-react';

const SubmitBid: React.FC = () => {
  const navigate = useNavigate();
  const { jobId } = useParams<{ jobId: string }>();

  const [formData, setFormData] = useState({
    bidAmount: '',
    timeline: '',
    proposal: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Create or open a chat for this job
      const chatRes = await chatAPI.createChat(jobId!);
      const chatId = chatRes.data?.id || chatRes.data?._id;

      // Send initial proposal message in chat
      const proposalText = `Proposal: $${formData.bidAmount} | Timeline: ${formData.timeline}\n\n${formData.proposal}`;
      await chatAPI.sendMessage(chatId, { content: proposalText });

      // Navigate to chat thread
      navigate(`/chat/${chatId}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit bid');
    } finally {
      setIsLoading(false);
    }
  };

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
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Submit Your Bid</h1>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Bid Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Bid Amount ($)
              </label>
              <input
                type="number"
                name="bidAmount"
                value={formData.bidAmount}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>

            {/* Timeline */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estimated Timeline
              </label>
              <input
                type="text"
                name="timeline"
                value={formData.timeline}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., 5 days, 2 weeks"
              />
            </div>

            {/* Proposal */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Proposal
              </label>
              <textarea
                name="proposal"
                value={formData.proposal}
                onChange={handleChange}
                required
                rows={5}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Tell the client why you're the best fit for this job..."
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-3 rounded-lg transition"
            >
              {isLoading ? 'Starting chat...' : 'Submit & Start Chat'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SubmitBid;
