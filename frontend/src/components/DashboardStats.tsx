import React from 'react';
import { Briefcase, Users, DollarSign, TrendingUp, FileText, CheckCircle } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => {
  return (
    <div className={`${color} rounded-lg shadow-md p-6 text-white`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-90">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
        </div>
        <div className="text-4xl opacity-50">{icon}</div>
      </div>
    </div>
  );
};

interface DashboardStatsProps {
  stats: {
    totalJobs?: number;
    activeJobs: number;
    totalEarnings?: number;
    totalSpent?: number;
    completedJobs: number;
  };
  userRole: 'client' | 'freelancer';
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ stats, userRole }) => {
  if (userRole === 'client') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Total Jobs Posted"
          value={stats.totalJobs || 0}
          icon={<Briefcase />}
          color="bg-blue-500"
        />
        <StatCard
          title="Active Jobs"
          value={stats.activeJobs}
          icon={<TrendingUp />}
          color="bg-green-500"
        />
        <StatCard
          title="Completed Jobs"
          value={stats.completedJobs}
          icon={<Users />}
          color="bg-purple-500"
        />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <StatCard
        title="Active Orders"
        value={stats.activeJobs}
        icon={<Briefcase />}
        color="bg-blue-500"
      />
      <StatCard
        title="Completed Jobs"
        value={stats.completedJobs}
        icon={<CheckCircle />}
        color="bg-green-500"
      />
      <StatCard
        title="Total Earnings"
        value={`$${typeof stats.totalEarnings === 'number' ? stats.totalEarnings.toFixed(2) : '0.00'}`}
        icon={<DollarSign />}
        color="bg-purple-500"
      />
      <StatCard
        title="Offers Submitted"
        value={stats.totalJobs || 0}
        icon={<FileText />}
        color="bg-orange-500"
      />
    </div>
  );
};

export default DashboardStats;
