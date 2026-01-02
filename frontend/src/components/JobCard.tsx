import React from 'react';
import { Job } from '../api/endpoints';
import { Edit2, Users } from 'lucide-react';

interface JobCardProps {
  job: Job;
  onEdit?: (job: Job) => void;
  showActions?: boolean;
  showBidButton?: boolean;
  onBid?: (jobId: string) => void;
  showOffersButton?: boolean;
  onViewOffers?: (jobId: string) => void;
}

const JobCard: React.FC<JobCardProps> = ({
  job,
  onEdit,
  showActions = false,
  showBidButton = false,
  onBid,
  showOffersButton = false,
  onViewOffers,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatMoney = (value: number | undefined) => {
    if (value === undefined || value === null || isNaN(Number(value))) return undefined;
    return Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const budgetText = (() => {
    const single = formatMoney(job.budget as any);
    const min = formatMoney(job.budget_min as any);
    const max = formatMoney(job.budget_max as any);
    if (single) return `$${single}`;
    if (min && max) return `$${min} - $${max}`;
    if (min) return `$${min}`;
    if (max) return `$${max}`;
    return '—';
  })();

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">{job.title}</h3>
          <p className="text-gray-600 text-sm line-clamp-2">{job.description}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
          {job.status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div>
          <p className="text-gray-500">Budget</p>
          <p className="font-semibold text-gray-800">{budgetText}</p>
        </div>
        <div>
          <p className="text-gray-500">Deadline</p>
          <p className="font-semibold text-gray-800">{formatDate(job.deadline)}</p>
        </div>
        <div>
          <p className="text-gray-500">Category</p>
          <p className="font-semibold text-gray-800">{job.assignment_type || job.category || '—'}</p>
        </div>
        <div>
          <p className="text-gray-500">Posted</p>
          <p className="font-semibold text-gray-800">{formatDate(job.createdAt)}</p>
        </div>
      </div>

      {job.assignedFreelancer && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded">
          <p className="text-sm text-green-800">
            <Users size={16} className="inline mr-2" />
            Assigned to freelancer
          </p>
        </div>
      )}

      {showActions && (
        <div className="flex gap-2 pt-4 border-t">
          {onEdit && (
            <button
              onClick={() => onEdit(job)}
              disabled={job.status === 'in-progress' || job.status === 'completed' || job.status === 'cancelled'}
              className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg transition ${
                job.status === 'in-progress' || job.status === 'completed' || job.status === 'cancelled'
                  ? 'bg-gray-400 text-white cursor-not-allowed opacity-50'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
              title={job.status === 'in-progress' || job.status === 'completed' || job.status === 'cancelled' ? 'Cannot edit closed or in-progress jobs' : ''}
            >
              <Edit2 size={16} />
              <span>Edit</span>
            </button>
          )}
        </div>
      )}

      {showBidButton && onBid && (
        <button
          onClick={() => onBid(job._id)}
          disabled={job.status === 'completed' || job.status === 'cancelled'}
          className={`w-full py-2 rounded-lg transition mt-4 ${
            job.status === 'completed' || job.status === 'cancelled'
              ? 'bg-gray-400 text-white cursor-not-allowed opacity-50'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {job.status === 'completed' ? 'Job Completed' : job.status === 'cancelled' ? 'Job Cancelled' : 'Submit Bid'}
        </button>
      )}

      {showOffersButton && onViewOffers && (
        <button
          onClick={() => onViewOffers(job._id)}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg transition mt-4"
        >
          View Offers
        </button>
      )}
    </div>
  );
};

export default JobCard;
