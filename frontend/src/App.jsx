import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import Navbar from './components/shared/Navbar';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import Home from './components/Home';
import Jobs from './components/Jobs';
import Browse from './components/Browse';
import Profile from './components/Profile';
import SavedJobs from './components/SavedJobs';
import JobDescription from './components/JobDescription';
import SkillGapAnalyzer from './components/SkillGapAnalyzer';

// Recruiter Components
import RecruiterDashboard from './components/admin/RecruiterDashboard';
import Companies from './components/admin/Companies';
import CompanyCreate from './components/admin/CompanyCreate';
import CompanySetup from './components/admin/CompanySetup';
import AdminJobs from './components/admin/AdminJobs';
import PostJob from './components/admin/PostJob';
import EditJob from './components/admin/EditJob';
import Applicants from './components/admin/Applicants';
import ProtectedRoute from './components/admin/ProtectedRoute';
import CandidateProtectedRoute from './components/CandidateProtectedRoute';

// Admin Governance Components
import AdminDashboard from './components/admin/AdminDashboard';
import AdminJobsManagement from './components/admin/AdminJobsManagement';
import AdminRecruiters from './components/admin/AdminRecruiters';
import AdminCandidates from './components/admin/AdminCandidates';
import AdminApplications from './components/admin/AdminApplications';
import AdminActivity from './components/admin/AdminActivity';
import AdminProtectedRoute from './components/admin/AdminProtectedRoute';

const appRouter = createBrowserRouter([
  // Public & Candidate Routes
  {
    path: '/',
    element: <Home />
  },
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/signup',
    element: <Signup />
  },
  {
    path: '/jobs',
    element: <Jobs />
  },
  {
    path: '/description/:id',
    element: <JobDescription />
  },
  {
    path: '/browse',
    element: <Browse />
  },
  {
    path: '/profile',
    element: <Profile />
  },
  {
    path: '/saved-jobs',
    element: <CandidateProtectedRoute><SavedJobs /></CandidateProtectedRoute>
  },
  {
    path: '/skill-gap-analyzer',
    element: <SkillGapAnalyzer />
  },

  // Recruiter Workspace Routes
  {
    path: '/recruiter/dashboard',
    element: <ProtectedRoute><RecruiterDashboard /></ProtectedRoute>
  },
  {
    path: '/recruiter/companies',
    element: <ProtectedRoute><Companies /></ProtectedRoute>
  },
  {
    path: '/recruiter/companies/create',
    element: <ProtectedRoute><CompanyCreate /></ProtectedRoute>
  },
  {
    path: '/recruiter/companies/:id',
    element: <ProtectedRoute><CompanySetup /></ProtectedRoute>
  },
  {
    path: '/recruiter/jobs',
    element: <ProtectedRoute><AdminJobs /></ProtectedRoute>
  },
  {
    path: '/recruiter/jobs/create',
    element: <ProtectedRoute><PostJob /></ProtectedRoute>
  },
  {
    path: '/recruiter/jobs/edit/:id',
    element: <ProtectedRoute><EditJob /></ProtectedRoute>
  },
  {
    path: '/recruiter/jobs/:id/applicants',
    element: <ProtectedRoute><Applicants /></ProtectedRoute>
  },
  {
    path: '/recruiter/applicants',
    element: <ProtectedRoute><Applicants /></ProtectedRoute>
  },

  // Legacy Recruiter Route Aliases for backwards compatibility
  {
    path: '/admin/companies',
    element: <Navigate to="/recruiter/companies" replace />
  },
  {
    path: '/admin/companies/create',
    element: <Navigate to="/recruiter/companies/create" replace />
  },
  {
    path: '/admin/companies/:id',
    element: <ProtectedRoute><CompanySetup /></ProtectedRoute>
  },
  {
    path: '/admin/jobs/create',
    element: <Navigate to="/recruiter/jobs/create" replace />
  },
  {
    path: '/admin/jobs/:id/applicants',
    element: <ProtectedRoute><Applicants /></ProtectedRoute>
  },
  {
    path: '/admin/jobs/edit/:id',
    element: <ProtectedRoute><EditJob /></ProtectedRoute>
  },

  // Dedicated Secured Capstone Admin Panel Routes
  {
    path: '/admin/dashboard',
    element: <AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>
  },
  {
    path: '/admin/jobs',
    element: <AdminProtectedRoute><AdminJobsManagement /></AdminProtectedRoute>
  },
  {
    path: '/admin/recruiters',
    element: <AdminProtectedRoute><AdminRecruiters /></AdminProtectedRoute>
  },
  {
    path: '/admin/candidates',
    element: <AdminProtectedRoute><AdminCandidates /></AdminProtectedRoute>
  },
  {
    path: '/admin/applications',
    element: <AdminProtectedRoute><AdminApplications /></AdminProtectedRoute>
  },
  {
    path: '/admin/activity',
    element: <AdminProtectedRoute><AdminActivity /></AdminProtectedRoute>
  },

  // Catch-all 404 Route
  {
    path: '*',
    element: <Navigate to="/" replace />
  }
]);

function App() {
  return (
    <div>
      <RouterProvider router={appRouter} />
    </div>
  );
}

export default App;
