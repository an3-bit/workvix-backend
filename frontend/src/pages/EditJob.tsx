import React, { useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { jobAPI } from '../api/endpoints';
import { ArrowLeft } from 'lucide-react';

const EditJob: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { jobId } = useParams<{ jobId: string }>();
  const job = location.state?.job;

  const [formData, setFormData] = useState({
    title: job?.title || '',
    description: job?.description || '',
    assignment_type: job?.assignment_type || 'programming',
    budget_min: job?.budget_min?.toString?.() || '',
    budget_max: job?.budget_max?.toString?.() || '',
    deadline: job?.deadline ? new Date(job.deadline).toISOString().slice(0,16) : '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
      const payload = {
        title: formData.title,
        description: formData.description,
        assignment_type: formData.assignment_type,
        budget_min: parseFloat(formData.budget_min),
        budget_max: parseFloat(formData.budget_max),
        deadline: new Date(formData.deadline).toISOString(),
      };

      await jobAPI.updateJob(jobId!, payload);
      navigate('/client-dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update job');
    } finally {
      setIsLoading(false);
    }
  };

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate('/client-dashboard')}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 mb-6"
          >
            <ArrowLeft size={20} />
            <span>Back to Dashboard</span>
          </button>
          <p className="text-gray-600">Job not found. Please go back and try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate('/client-dashboard')}
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 mb-6"
        >
          <ArrowLeft size={20} />
          <span>Back to Dashboard</span>
        </button>

        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Edit Job</h1>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Build a React Dashboard"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={5}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe your job requirements in detail..."
              />
            </div>

            {/* Category (Assignment Type) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                name="assignment_type"
                value={formData.assignment_type}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="academic_writing">Academic Writing</option>
                <option value="programming">Programming</option>
                <option value="design">Design</option>
                <option value="marketing">Marketing</option>
                <option value="business">Business</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Budget Min */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Budget ($)
              </label>
              <input
                type="number"
                name="budget_min"
                value={formData.budget_min}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>

            {/* Budget Max */}
            <div>
              <label className="block text sm font-medium text-gray-700 mb-2">
                Maximum Budget ($)
              </label>
              <input
                type="number"
                name="budget_max"
                value={formData.budget_max}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>

            {/* Deadline */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deadline
              </label>
              <input
                type="datetime-local"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-3 rounded-lg transition"
            >
              {isLoading ? 'Updating Job...' : 'Update Job'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditJob;
