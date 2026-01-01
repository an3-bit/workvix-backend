import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jobAPI } from '../api/endpoints';
import { ArrowLeft, CheckCircle } from 'lucide-react';

const CreateJob: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignment_type: 'programming',
    budget_min: '',
    budget_max: '',
    deadline: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

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
    setSuccess(false);

    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        assignment_type: formData.assignment_type,
        budget_min: parseFloat(formData.budget_min),
        budget_max: parseFloat(formData.budget_max),
        deadline: new Date(formData.deadline).toISOString(),
      };

      console.log('Job payload:', payload);
      await jobAPI.createJob(payload);
      
      // Show success message
      setSuccess(true);
      setIsLoading(false);
      
      // Redirect to dashboard after 3 seconds
      setTimeout(() => {
        navigate('/client-dashboard');
      }, 3000);
    } catch (err: any) {
      console.error('Create job error:', err.response?.data);
      if (err.response?.data && typeof err.response.data === 'object') {
        const errors = err.response.data;
        const errorMessages = Object.keys(errors)
          .map(key => `${key}: ${Array.isArray(errors[key]) ? errors[key].join(', ') : errors[key]}`)
          .join('\n');
        setError(errorMessages);
      } else {
        setError(err.response?.data?.message || 'Failed to create job');
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {!success ? (
          <>
            <button
              onClick={() => navigate('/client-dashboard')}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 mb-6"
            >
              <ArrowLeft size={20} />
              <span>Back to Dashboard</span>
            </button>

            <div className="bg-white rounded-lg shadow-md p-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-6">Post a New Job</h1>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Title *
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

            {/* Assignment Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
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

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Description *
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

            {/* Budget Min */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Budget ($) *
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Budget ($) *
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
                Deadline *
              </label>
              <input
                type="datetime-local"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                onBlur={(e) => {
                  // Ensure the input is properly blurred after selection
                  e.currentTarget.blur();
                }}
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
              {isLoading ? 'Creating Job...' : 'Post Job'}
            </button>
          </form>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="bg-white rounded-lg shadow-lg p-12 max-w-md w-full text-center">
              <CheckCircle size={64} className="mx-auto text-green-500 mb-6" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Job Posted Successfully!</h2>
              <p className="text-gray-600 mb-6">
                Your job has been posted successfully. Freelancers will be bidding on it shortly.
              </p>
              <p className="text-sm text-gray-500">
                Redirecting to dashboard in a few seconds...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateJob;
