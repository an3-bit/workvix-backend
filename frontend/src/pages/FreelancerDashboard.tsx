import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jobAPI, orderAPI, offerAPI, Job, Order } from '../api/endpoints';
import DashboardStats from '../components/DashboardStats';
import JobCard from '../components/JobCard';
import OrderCard from '../components/OrderCard';
import { Briefcase } from 'lucide-react';

const FreelancerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [offers, setOffers] = useState<any[]>([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [activeTab, setActiveTab] = useState<'jobs' | 'orders'>('jobs');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setError('');
      setIsLoadingJobs(true);
      setIsLoadingOrders(true);

      const [jobsRes, ordersRes, offersRes] = await Promise.all([
        jobAPI.getAllJobs(),
        orderAPI.listOrders(),
        offerAPI.listOffers(),
      ]);

      // Handle paginated responses
      const jobsData = Array.isArray(jobsRes.data)
        ? jobsRes.data
        : (jobsRes.data?.results ?? []);
      const ordersData = Array.isArray(ordersRes.data)
        ? ordersRes.data
        : (ordersRes.data?.results ?? []);
      const offersData = Array.isArray(offersRes.data)
        ? offersRes.data
        : (offersRes.data?.results ?? offersRes.data?.offers ?? []);

      const normalizeJob = (j: any) => ({
        ...j,
        _id: j._id ?? j.id,
        createdAt: j.createdAt ?? j.created_at,
        updatedAt: j.updatedAt ?? j.updated_at,
      });
      const normalizeOrder = (o: any) => ({
        ...o,
        _id: o._id ?? o.id,
        createdAt: o.createdAt ?? o.created_at,
        updatedAt: o.updatedAt ?? o.updated_at,
      });

      setJobs(jobsData.map(normalizeJob));
      setOrders(ordersData.map(normalizeOrder));
      setOffers(offersData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch data');
      console.error(err);
    } finally {
      setIsLoadingJobs(false);
      setIsLoadingOrders(false);
    }
  };

  const handleBidJob = (jobId: string) => {
    navigate(`/submit-bid/${jobId}`);
  };

  const handleOrderAction = async (
    orderId: string,
    action: 'approve' | 'revision' | 'submit'
  ) => {
    // Only handle submit for freelancers
    if (action === 'submit') {
      navigate(`/submit-work/${orderId}`);
    }
  };

  const stats = {
    totalJobs: offers.length, // Total offers/bids submitted
    activeJobs: orders.filter(o => o.status === 'active' || o.status === 'submitted').length,
    completedJobs: orders.filter(o => o.status === 'completed').length,
    totalEarnings: orders
      .filter(o => o.status === 'completed')
      .reduce((sum, o) => sum + (Number(o.amount) || 0), 0),
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Freelancer Dashboard</h1>
          <button
            onClick={() => navigate('/freelancer-jobs')}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition"
          >
            <Briefcase size={20} />
            <span>Browse Jobs</span>
          </button>
        </div>

        {/* Stats */}
        <DashboardStats stats={stats} userRole="freelancer" />

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b">
          <button
            onClick={() => setActiveTab('jobs')}
            className={`px-6 py-3 font-medium border-b-2 transition ${
              activeTab === 'jobs'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Available Jobs ({jobs.length})
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-6 py-3 font-medium border-b-2 transition ${
              activeTab === 'orders'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            My Orders ({orders.length})
          </button>
        </div>

        {/* Content */}
        <div>
          {activeTab === 'jobs' && (
            <div>
              {isLoadingJobs ? (
                <div className="text-center py-12">
                  <p className="text-gray-600">Loading jobs...</p>
                </div>
              ) : jobs.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600">No jobs available at the moment</p>
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
          )}

          {activeTab === 'orders' && (
            <div>
              {isLoadingOrders ? (
                <div className="text-center py-12">
                  <p className="text-gray-600">Loading orders...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600">No orders yet. Start bidding on jobs!</p>
                  <button
                    onClick={() => setActiveTab('jobs')}
                    className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
                  >
                    Browse Jobs
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {orders.map(order => (
                    <OrderCard
                      key={order._id}
                      order={order}
                      jobTitle={order.job?.title || 'Order'}
                      userRole="freelancer"
                      onAction={handleOrderAction}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FreelancerDashboard;
