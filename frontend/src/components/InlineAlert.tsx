import React from 'react';
import { AlertCircle } from 'lucide-react';

const InlineAlert: React.FC<{ message?: string; className?: string }> = ({ message, className }) => {
  if (!message) return null;
  return (
    <div className={`bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center gap-2 ${className || ''}`}>
      <AlertCircle size={18} />
      <span>{message}</span>
    </div>
  );
};

export default InlineAlert;
