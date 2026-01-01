import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ClientDashboard from './pages/ClientDashboard';
import ClientJobs from './pages/ClientJobs';
import ClientOrders from './pages/ClientOrders';
import Payment from './pages/Payment';
import Notifications from './pages/Notifications';
import FreelancerDashboard from './pages/FreelancerDashboard';
import FreelancerJobs from './pages/FreelancerJobs';
import CreateJob from './pages/CreateJob';
import EditJob from './pages/EditJob';
import SubmitBid from './pages/SubmitBid';
import SubmitWork from './pages/SubmitWork';
import ChatThread from './pages/ChatThread';
import JobOffers from './pages/JobOffers';
import Chats from './pages/Chats';
import MyOffers from './pages/MyOffers';
import Profile from './pages/Profile';

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <Navbar />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Client Routes */}
          <Route
            path="/client-dashboard"
            element={
              <ProtectedRoute requiredRole="client">
                <ClientDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/client-jobs"
            element={
              <ProtectedRoute requiredRole="client">
                <ClientJobs />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-job"
            element={
              <ProtectedRoute requiredRole="client">
                <CreateJob />
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit-job/:jobId"
            element={
              <ProtectedRoute requiredRole="client">
                <EditJob />
              </ProtectedRoute>
            }
          />

          {/* Freelancer Routes */}
          <Route
            path="/freelancer-dashboard"
            element={
              <ProtectedRoute requiredRole="freelancer">
                <FreelancerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/freelancer-jobs"
            element={
              <ProtectedRoute requiredRole="freelancer">
                <FreelancerJobs />
              </ProtectedRoute>
            }
          />
          <Route
            path="/submit-bid/:jobId"
            element={
              <ProtectedRoute requiredRole="freelancer">
                <SubmitBid />
              </ProtectedRoute>
            }
          />
          <Route
            path="/submit-work/:orderId"
            element={
              <ProtectedRoute requiredRole="freelancer">
                <SubmitWork />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-offers"
            element={
              <ProtectedRoute requiredRole="freelancer">
                <MyOffers />
              </ProtectedRoute>
            }
          />

          {/* Chat & Offers */}
          <Route
            path="/chat/:chatId"
            element={
              <ProtectedRoute>
                <ChatThread />
              </ProtectedRoute>
            }
          />
          <Route
            path="/jobs/:jobId/offers"
            element={
              <ProtectedRoute requiredRole="client">
                <JobOffers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chats"
            element={
              <ProtectedRoute>
                <Chats />
              </ProtectedRoute>
            }
          />
          <Route
            path="/client-orders"
            element={
              <ProtectedRoute requiredRole="client">
                <ClientOrders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute requiredRole="client">
                <ClientOrders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payment/:orderId"
            element={
              <ProtectedRoute requiredRole="client">
                <Payment />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute requiredRole="client">
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/freelancer-profile"
            element={
              <ProtectedRoute requiredRole="freelancer">
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;
