import React from 'react';
import { Order } from '../api/endpoints';
import { CheckCircle, Clock, XCircle, Send } from 'lucide-react';

interface OrderCardProps {
  order: Order;
  jobTitle?: string;
  onAction?: (orderId: string, action: 'approve' | 'revision' | 'submit') => void;
  userRole?: 'client' | 'freelancer';
}

const OrderCard: React.FC<OrderCardProps> = ({
  order,
  jobTitle = 'Job',
  onAction,
  userRole = 'client',
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'submitted':
        return 'bg-purple-100 text-purple-800';
      case 'revision_requested':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={16} className="inline mr-2" />;
      case 'active':
      case 'submitted':
        return <Clock size={16} className="inline mr-2" />;
      case 'cancelled':
        return <XCircle size={16} className="inline mr-2" />;
      default:
        return null;
    }
  };

  const canApprove = order.status === 'submitted' && userRole === 'client';
  const canRequestRevision = order.status === 'submitted' && userRole === 'client';
  const canSubmitWork = (order.status === 'active' || order.status === 'revision_requested') && userRole === 'freelancer';

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">{jobTitle}</h3>
          <p className="text-gray-600 text-sm">Amount: ${order.amount?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          {order.delivery_date && (
            <p className="text-gray-600 text-sm">Delivery: {new Date(order.delivery_date).toLocaleString()}</p>
          )}
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
          {getStatusIcon(order.status)}
          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
        </span>
      </div>

      {(canApprove || canRequestRevision || canSubmitWork) && onAction && (
        <div className="flex gap-2 pt-4 border-t flex-wrap">
          {canApprove && (
            <button
              onClick={() => onAction(order._id, 'approve')}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition"
            >
              Approve & Rate
            </button>
          )}
          {canRequestRevision && (
            <button
              onClick={() => onAction(order._id, 'revision')}
              className="flex-1 bg-yellow-100 text-yellow-800 border border-yellow-300 py-2 rounded-lg transition"
            >
              Request Revision
            </button>
          )}
          {canSubmitWork && (
            <button
              onClick={() => onAction(order._id, 'submit')}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition inline-flex items-center justify-center gap-2"
            >
              <Send size={16} /> Submit Work
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default OrderCard;
