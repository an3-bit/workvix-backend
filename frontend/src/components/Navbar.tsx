import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Menu, X, MessageCircle, Bell } from 'lucide-react';
import { useState, useEffect } from 'react';
import { chatAPI } from '../api/endpoints';

const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [unreadChats, setUnreadChats] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fetch unread counts
  const fetchUnreadCounts = async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      // Fetch unread message count
      const chatRes = await chatAPI.unreadCount();
      setUnreadChats(chatRes.data?.unread_count || 0);

      // Fetch all chats to count unread notifications
      const chatsRes = await chatAPI.listChats();
      const chatsData = Array.isArray(chatsRes.data) ? chatsRes.data : chatsRes.data?.results ?? [];
      const totalUnread = chatsData.reduce((sum, chat: any) => sum + (chat.unread_count || 0), 0);
      setUnreadNotifications(totalUnread);
    } catch (err) {
      console.error('Failed to fetch unread counts:', err);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchUnreadCounts();
  }, [isAuthenticated]);

  // Set up polling to refresh counts every 5 seconds
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      fetchUnreadCounts();
    }, 5000);

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const dashboardLink = user?.role === 'client' ? '/client-dashboard' : '/freelancer-dashboard';

  // Badge component
  const Badge: React.FC<{ count: number }> = ({ count }) => {
    if (count === 0) return null;
    return (
      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
        {count > 99 ? '99+' : count}
      </span>
    );
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to={isAuthenticated ? dashboardLink : "/"} className="text-2xl font-bold text-blue-600">
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
                <div className="relative">
                  <Link
                    to="/chats"
                    className="text-gray-700 hover:text-blue-600 font-medium flex items-center gap-1"
                  >
                    <MessageCircle size={18} /> Chats
                  </Link>
                  <Badge count={unreadChats} />
                </div>
                <div className="relative">
                  <Link
                    to="/notifications"
                    className="text-gray-700 hover:text-blue-600 font-medium flex items-center gap-1"
                  >
                    <Bell size={18} /> Notifications
                  </Link>
                  <Badge count={unreadNotifications} />
                </div>
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
                <div className="relative py-2">
                  <Link
                    to="/chats"
                    className="text-gray-700 hover:text-blue-600 font-medium flex items-center gap-2"
                    onClick={() => setIsOpen(false)}
                  >
                    <MessageCircle size={18} /> Chats
                    {unreadChats > 0 && (
                      <span className="bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {unreadChats > 99 ? '99+' : unreadChats}
                      </span>
                    )}
                  </Link>
                </div>
                <div className="relative py-2">
                  <Link
                    to="/notifications"
                    className="text-gray-700 hover:text-blue-600 font-medium flex items-center gap-2"
                    onClick={() => setIsOpen(false)}
                  >
                    <Bell size={18} /> Notifications
                    {unreadNotifications > 0 && (
                      <span className="bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {unreadNotifications > 99 ? '99+' : unreadNotifications}
                      </span>
                    )}
                  </Link>
                </div>
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
