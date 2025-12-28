import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const dashboardLink = user?.role === 'client' ? '/client-jobs' : '/freelancer-dashboard';

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-blue-600">
            FreelanceHub
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {isAuthenticated ? (
              <>
                <Link
                  to={dashboardLink}
                  className="text-gray-700 hover:text-blue-600 font-medium"
                >
                  Dashboard
                </Link>
                {user?.role === 'client' ? (
                  <>
                    <Link
                      to="/client-jobs"
                      className="text-gray-700 hover:text-blue-600 font-medium"
                    >
                      Jobs
                    </Link>
                    <Link
                      to="/client-orders"
                      className="text-gray-700 hover:text-blue-600 font-medium"
                    >
                      Orders
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/freelancer-jobs"
                      className="text-gray-700 hover:text-blue-600 font-medium"
                    >
                      Jobs
                    </Link>
                    <Link
                      to="/my-offers"
                      className="text-gray-700 hover:text-blue-600 font-medium"
                    >
                      Offers
                    </Link>
                  </>
                )}
                <Link
                  to="/chats"
                  className="text-gray-700 hover:text-blue-600 font-medium"
                >
                  Chats
                </Link>
                <Link
                  to="/notifications"
                  className="text-gray-700 hover:text-blue-600 font-medium"
                >
                  Notifications
                </Link>
                <div className="flex items-center space-x-4">
                  <span className="text-gray-700">
                    {user?.name} ({user?.role})
                  </span>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                  >
                    <LogOut size={18} />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-blue-600 font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2">
            {isAuthenticated ? (
              <>
                <Link
                  to={dashboardLink}
                  className="block text-gray-700 hover:text-blue-600 font-medium py-2"
                  onClick={() => setIsOpen(false)}
                >
                  Dashboard
                </Link>
                {user?.role === 'client' ? (
                  <>
                    <Link
                      to="/client-jobs"
                      className="block text-gray-700 hover:text-blue-600 font-medium py-2"
                      onClick={() => setIsOpen(false)}
                    >
                      Jobs
                    </Link>
                    <Link
                      to="/client-orders"
                      className="block text-gray-700 hover:text-blue-600 font-medium py-2"
                      onClick={() => setIsOpen(false)}
                    >
                      Orders
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/freelancer-jobs"
                      className="block text-gray-700 hover:text-blue-600 font-medium py-2"
                      onClick={() => setIsOpen(false)}
                    >
                      Jobs
                    </Link>
                    <Link
                      to="/my-offers"
                      className="block text-gray-700 hover:text-blue-600 font-medium py-2"
                      onClick={() => setIsOpen(false)}
                    >
                      Offers
                    </Link>
                  </>
                )}
                <Link
                  to="/chats"
                  className="block text-gray-700 hover:text-blue-600 font-medium py-2"
                  onClick={() => setIsOpen(false)}
                >
                  Chats
                </Link>
                <Link
                  to="/notifications"
                  className="block text-gray-700 hover:text-blue-600 font-medium py-2"
                  onClick={() => setIsOpen(false)}
                >
                  Notifications
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block text-gray-700 hover:text-blue-600 font-medium py-2"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-center"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
