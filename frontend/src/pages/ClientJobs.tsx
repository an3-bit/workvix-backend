import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jobAPI, Job } from '../api/endpoints';
import JobCard from '../components/JobCard';
import { Plus } from 'lucide-react';

const ClientJobs: React.FC = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadJobs = async () => {
      try {
        setError('');
        setIsLoading(true);
        const res = await jobAPI.getClientJobs();
        const data = Array.isArray(res.data) ? res.data : (res.data?.results ?? []);
        const normalizeJob = (j: any) => ({
          ...j,
          _id: j._id ?? j.id,
          createdAt: j.createdAt ?? j.created_at,
          updatedAt: j.updatedAt ?? j.updated_at,
        });
        setJobs(data.map(normalizeJob));
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load jobs');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadJobs();
  }, []);

  const handleDeleteJob = async (jobId: string) => {
    if (!window.confirm('Are you sure you want to delete this job?')) return;
    try {
      await jobAPI.deleteJob(jobId);
      setJobs(prev => prev.filter(j => j._id !== jobId));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete job');
    }
  };

  const handleEditJob = (job: Job) => {
    navigate(`/edit-job/${job._id}`, { state: { job } });
  };

  const handleAssignFreelancer = (jobId: string) => {
    navigate(`/assign-freelancer/${jobId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Jobs</h1>
          <button
            onClick={() => navigate('/create-job')}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition"
          >
            <Plus size={20} />
            <span>Post New Job</span>
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Content */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading jobs...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">No jobs posted yet</p>
            <button
              onClick={() => navigate('/create-job')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
            >
              Post Your First Job
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map(job => (
              <JobCard
                key={job._id}
                job={job}
                showActions={true}
                onEdit={handleEditJob}
                onDelete={handleDeleteJob}
                onAssign={handleAssignFreelancer}
                showOffersButton
                onViewOffers={(id) => navigate(`/jobs/${id}/offers`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientJobs;