import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jobAPI, Job } from '../api/endpoints';
import JobCard from '../components/JobCard';

const FreelancerJobs: React.FC = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadJobs = async () => {
      try {
        setError('');
        setIsLoading(true);
        const res = await jobAPI.getAllJobs();
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

  const handleBidJob = (jobId: string) => {
    navigate(`/submit-bid/${jobId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Available Jobs</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading jobs...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No jobs available right now. Please check back later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map(job => (
              <JobCard
                key={job._id}
                job={job}
                showBidButton={true}
                onBid={handleBidJob}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FreelancerJobs;