import api from './client';

// Types
export interface Job {
  _id: string;
  clientId: string;
  title: string;
  description: string;
  budget?: number;
  budget_min?: number;
  budget_max?: number;
  deadline: string;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  category?: string;
  assignment_type?: string;
  assignedFreelancer?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  _id: string;
  job?: { id: string; title: string };
  client?: { id: string; name: string };
  freelancer?: { id: string; name: string };
  status: 'active' | 'submitted' | 'revision_requested' | 'completed' | 'cancelled';
  amount: number;
  delivery_date?: string;
  special_instructions?: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'client' | 'freelancer' | 'admin';
  profileImage?: string;
  bio?: string;
  createdAt: string;
}

// Job Endpoints
export const jobAPI = {
  // Client jobs
  createJob: (jobData: Omit<Job, '_id' | 'createdAt' | 'updatedAt'>) =>
    api.post('/jobs/create/', jobData),
  getClientJobs: () => api.get('/jobs/my-jobs/'),
  getJobById: (jobId: string) => api.get(`/jobs/${jobId}/`),
  updateJob: (jobId: string, jobData: Partial<Job>) =>
    api.patch(`/jobs/${jobId}/update/`, jobData),
  deleteJob: (jobId: string) => api.delete(`/jobs/${jobId}/`),
  assignFreelancer: (jobId: string, freelancerId: string) =>
    api.put(`/jobs/${jobId}/assign/`, { freelancerId }),

  // Freelancer jobs
  getAllJobs: (filters?: any) => api.get('/jobs/', { params: filters }),
  getJobsByCategory: (category: string) =>
    api.get('/jobs/category/', { params: { category } }),
};

// Order/Bid Endpoints
export const orderAPI = {
  // Shared orders
  listOrders: () => api.get('/orders/'),
  getOrderById: (orderId: string) => api.get(`/orders/${orderId}/`),
  createOrder: (payload: { offer: string; delivery_date: string; special_instructions?: string }) =>
    api.post('/orders/create/', payload),
  // Freelancer actions
  submitWork: (orderId: string, payload: { submission_text: string; notes?: string; attachment?: File }) =>
    api.post(`/orders/${orderId}/submit/`, payload),
  // Client actions
  requestRevision: (orderId: string, payload: { revision_notes: string }) =>
    api.post(`/orders/${orderId}/request-revision/`, payload),
  approveOrder: (orderId: string, payload: { rating: number; feedback?: string }) =>
    api.post(`/orders/${orderId}/approve/`, payload),
};

// Chat Endpoints
export const chatAPI = {
  listChats: () => api.get('/chat/'),
  getChat: (chatId: string) => api.get(`/chat/${chatId}/`),
  createChat: (jobId: string, freelancerId?: string) =>
    api.post('/chat/create/', { job_id: jobId, freelancer_id: freelancerId }),
  sendMessage: (chatId: string, payload: { content: string }) =>
    api.post(`/chat/${chatId}/send/`, payload),
  markRead: (chatId: string) => api.post(`/chat/${chatId}/mark-read/`, {}),
  unreadCount: () => api.get('/chat/unread-count/'),
};

// Offer Endpoints
export const offerAPI = {
  listOffers: () => api.get('/offers/'),
  getOffer: (offerId: string) => api.get(`/offers/${offerId}/`),
  createOffer: (payload: { job_id: string; title?: string; description: string; delivery_time: number; payment_type?: 'fixed' | 'hourly'; amount: number }) =>
    api.post('/offers/create/', payload),
  acceptOffer: (offerId: string) => api.post(`/offers/${offerId}/accept/`, {}),
  rejectOffer: (offerId: string) => api.post(`/offers/${offerId}/reject/`, {}),
  jobOffers: (jobId: string) => api.get(`/offers/job/${jobId}/`),
};

// Payment Endpoints
export const paymentAPI = {
  listPayments: () => api.get('/payments/'),
  createPayment: (payload: { order: string; payment_method_id: string; payment_type: 'order' | 'milestone' | 'refund' }) =>
    api.post('/payments/create/', payload),
  processPayment: (paymentId: string, payload: { action: 'release' | 'refund'; notes?: string }) =>
    api.post(`/payments/${paymentId}/process/`, payload),
  listMethods: () => api.get('/payments/methods/'),
  addMethod: (payload: { method_type: string; card_number: string; cardholder_name: string; expiry_month: number; expiry_year: number; cvv: string; billing_address?: string }) =>
    api.post('/payments/methods/add/', payload),
  removeMethod: (methodId: string) => api.delete(`/payments/methods/${methodId}/remove/`),
};

// User Endpoints
export const userAPI = {
  getProfile: () => api.get('/users/profile/'),
  updateProfile: (userData: Partial<User>) => api.put('/users/profile/', userData),
  login: (email: string, password: string) =>
    api.post('/users/login/', { email, password }),
  register: (userData: any) => api.post('/users/register/', userData),
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};
