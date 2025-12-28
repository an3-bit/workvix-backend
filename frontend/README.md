# FreelanceHub Frontend

A modern React/TypeScript frontend for the FreelanceHub freelance marketplace platform.

## Features

### Client Dashboard
- ✅ Post new jobs
- ✅ Manage job postings (edit, delete)
- ✅ View and manage bids/orders
- ✅ Accept, reject, or complete orders
- ✅ Assign freelancers to jobs
- ✅ View statistics and dashboard metrics

### Freelancer Dashboard
- ✅ Browse available jobs
- ✅ Submit bids on jobs
- ✅ Manage orders/bids
- ✅ View job details and requirements
- ✅ View statistics and earnings

### Authentication
- ✅ User registration (client/freelancer)
- ✅ Secure login
- ✅ Protected routes
- ✅ Role-based access control

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Axios** - API client
- **Lucide React** - Icons

## Project Structure

```
frontend/
├── src/
│   ├── api/
│   │   ├── client.ts          # Axios instance with interceptors
│   │   └── endpoints.ts       # API endpoints and types
│   ├── components/
│   │   ├── Navbar.tsx         # Navigation bar
│   │   ├── ProtectedRoute.tsx # Route protection wrapper
│   │   ├── DashboardStats.tsx # Statistics cards
│   │   ├── JobCard.tsx        # Job listing card
│   │   └── OrderCard.tsx      # Order/bid card
│   ├── context/
│   │   └── AuthContext.tsx    # Authentication context
│   ├── pages/
│   │   ├── Home.tsx           # Landing page
│   │   ├── Login.tsx          # Login page
│   │   ├── Register.tsx       # Registration page
│   │   ├── ClientDashboard.tsx    # Client dashboard
│   │   ├── FreelancerDashboard.tsx # Freelancer dashboard
│   │   ├── CreateJob.tsx      # Create job form
│   │   ├── EditJob.tsx        # Edit job form
│   │   └── SubmitBid.tsx      # Submit bid form
│   ├── styles/
│   │   └── index.css          # Global styles
│   ├── App.tsx                # Main app component
│   └── main.tsx               # Entry point
├── index.html                 # HTML template
├── package.json               # Dependencies
├── tailwind.config.js         # Tailwind configuration
├── tsconfig.json              # TypeScript configuration
└── vite.config.ts             # Vite configuration
```

## Installation

### Prerequisites
- Node.js 14+ and npm/yarn

### Steps

1. **Clone and navigate to frontend**
```bash
cd frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Create environment file**
```bash
cp .env.example .env.local
```

4. **Update API URL in .env.local** (if needed)
```
REACT_APP_API_URL=http://localhost:5000/api
```

## Development

### Start development server
```bash
npm run dev
```

The application will open at `http://localhost:3000` by default.

### Build for production
```bash
npm run build
```

### Run tests
```bash
npm run test
```

## API Integration

The frontend connects to the backend API at the URL specified in `REACT_APP_API_URL`. 

### Key Endpoints Used:

**Authentication:**
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `GET /users/profile` - Get user profile

**Jobs:**
- `GET /jobs` - Get all jobs
- `GET /jobs/client/my-jobs` - Get client's jobs
- `POST /jobs` - Create new job
- `PUT /jobs/:id` - Update job
- `DELETE /jobs/:id` - Delete job
- `PUT /jobs/:id/assign` - Assign freelancer

**Orders/Bids:**
- `GET /orders/client/my-orders` - Get client's orders
- `GET /orders/freelancer/my-orders` - Get freelancer's orders
- `POST /jobs/:id/bid` - Submit bid
- `PUT /orders/:id/accept` - Accept order
- `PUT /orders/:id/reject` - Reject order
- `PUT /orders/:id/complete` - Complete order

## Authentication Flow

1. User registers or logs in
2. Backend returns JWT token
3. Token stored in localStorage
4. Token automatically included in API requests via axios interceptor
5. Expired tokens trigger re-authentication

## Protected Routes

Routes are protected using the `ProtectedRoute` component which:
- Checks if user is authenticated
- Verifies user has required role (client/freelancer)
- Redirects unauthorized users to login

## Styling

The project uses Tailwind CSS for styling with a mobile-first responsive design:
- Mobile: Base styles for small screens
- Tablet: `sm:` and `md:` prefixes
- Desktop: `lg:` and `xl:` prefixes

## State Management

The app uses:
- **React Context** for global authentication state
- **React Hooks** (useState, useEffect) for component state
- **Custom hooks** like `useAuth()` for auth context access

## Error Handling

- API errors are caught and displayed in UI error messages
- Form validation on client side
- Unauthorized requests trigger logout
- Network errors are handled gracefully

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

## Performance Optimizations

- Code splitting with React Router
- Lazy loading of components
- Optimized re-renders with React hooks
- CSS optimization with Tailwind
- Image optimization (when applicable)

## Future Enhancements

- [ ] Search and filter jobs
- [ ] User reviews and ratings
- [ ] Payment integration
- [ ] Real-time notifications
- [ ] Chat/messaging system
- [ ] File upload for portfolio
- [ ] Advanced analytics
- [ ] Email notifications

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

ISC

## Support

For issues or questions, please contact the development team.
