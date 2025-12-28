import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Briefcase, Users, TrendingUp, ArrowRight } from 'lucide-react';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Connect with Top Talent or Find Your Dream Projects
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              FreelanceHub is your marketplace to post jobs or find freelance work. 
              Whether you're a client looking for talent or a freelancer seeking opportunities, 
              we've got you covered.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              {!isAuthenticated ? (
                <>
                  <button
                    onClick={() => navigate('/register')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition flex items-center justify-center space-x-2"
                  >
                    <span>Get Started</span>
                    <ArrowRight size={20} />
                  </button>
                  <button
                    onClick={() => navigate('/login')}
                    className="bg-white hover:bg-gray-50 text-blue-600 border border-blue-600 px-8 py-3 rounded-lg font-medium transition"
                  >
                    Sign In
                  </button>
                </>
              ) : (
                <button
                  onClick={() => navigate(
                    user?.role === 'client' ? '/client-dashboard' : '/freelancer-dashboard'
                  )}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition flex items-center justify-center space-x-2"
                >
                  <span>Go to Dashboard</span>
                  <ArrowRight size={20} />
                </button>
              )}
            </div>
          </div>
          <div className="flex justify-center">
            <div className="w-full max-w-md">
              <div className="bg-white rounded-lg shadow-lg p-8">
                <div className="text-center">
                  <Briefcase className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    {isAuthenticated
                      ? `Welcome, ${user?.name}!`
                      : 'Ready to Get Started?'}
                  </h2>
                  <p className="text-gray-600 mb-6">
                    {user?.role === 'client'
                      ? 'Post jobs and find talented freelancers'
                      : user?.role === 'freelancer'
                      ? 'Browse and bid on exciting projects'
                      : 'Join thousands of professionals on our platform'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Why Choose FreelanceHub?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="text-center p-8 rounded-lg hover:shadow-lg transition">
              <div className="flex justify-center mb-4">
                <Briefcase className="w-12 h-12 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Easy Job Posting</h3>
              <p className="text-gray-600">
                Clients can post jobs in minutes and connect with qualified freelancers instantly.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center p-8 rounded-lg hover:shadow-lg transition">
              <div className="flex justify-center mb-4">
                <Users className="w-12 h-12 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Talented Pool</h3>
              <p className="text-gray-600">
                Access to a diverse pool of freelancers with verified skills and ratings.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center p-8 rounded-lg hover:shadow-lg transition">
              <div className="flex justify-center mb-4">
                <TrendingUp className="w-12 h-12 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Secure & Reliable</h3>
              <p className="text-gray-600">
                Safe transactions with milestone payments and dispute resolution support.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!isAuthenticated && (
        <section className="bg-blue-600 py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-6">
              Ready to Start Your Journey?
            </h2>
            <p className="text-blue-100 text-lg mb-8">
              Join thousands of clients and freelancers using FreelanceHub
            </p>
            <button
              onClick={() => navigate('/register')}
              className="bg-white hover:bg-gray-50 text-blue-600 px-8 py-3 rounded-lg font-medium transition inline-flex items-center space-x-2"
            >
              <span>Sign Up Now</span>
              <ArrowRight size={20} />
            </button>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;
