import { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Pages — public
import HomePage from './pages/HomePage';
import AllIssuesPage from './pages/AllIssuesPage';
import AboutPage from './pages/AboutPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import IssueDetailPage from './pages/IssueDetailPage';
import NotFoundPage from './pages/NotFoundPage';
import MapPage from './pages/MapPage';

// Pages — admin dashboard
import AdminDashboardLayout from './pages/dashboard/admin/layout/AdminDashboardLayout';
import AdminOverview from './pages/dashboard/admin/AdminOverview';
import AdminAllIssues from './pages/dashboard/admin/AdminAllIssues';
import AdminManageUsers from './pages/dashboard/admin/AdminManageUsers';
import AdminManageStaff from './pages/dashboard/admin/AdminManageStaff';
import AdminPayments from './pages/dashboard/admin/AdminPayments';
import AdminProfile from './pages/dashboard/admin/AdminProfile';

// Pages — staff dashboard
import StaffDashboardLayout from './pages/dashboard/staff/layout/StaffDashboardLayout';
import StaffOverview from './pages/dashboard/staff/StaffOverview';
import StaffAssignedIssues from './pages/dashboard/staff/StaffAssignedIssues';
import StaffProfile from './pages/dashboard/staff/StaffProfile';

// Pages — citizen dashboard
import CitizenDashboardLayout from './pages/dashboard/citizen/layout/CitizenDashboardLayout';
import CitizenOverview from './pages/dashboard/citizen/CitizenOverview';
import CitizenMyIssues from './pages/dashboard/citizen/CitizenMyIssues';
import CitizenReportIssue from './pages/dashboard/citizen/CitizenReportIssue';
import CitizenProfile from './pages/dashboard/citizen/CitizenProfile';

// Route guards
import PrivateRoute from './routes/PrivateRoute';
import AdminRoute from './routes/AdminRoute';
import StaffRoute from './routes/StaffRoute';

// Context
import { AuthContext } from './context/AuthContext';
import LoadingSpinner from './components/LoadingSpinner';

// Layout
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';

// Redirects /dashboard to the correct role-specific dashboard
const RoleDashboardRedirect = () => {
  const { currentUser, dbUser, loading } = useContext(AuthContext);
  if (loading || (currentUser && !dbUser)) return <LoadingSpinner />;
  if (dbUser?.role === 'admin') return <Navigate to="/dashboard/admin" replace />;
  if (dbUser?.role === 'staff') return <Navigate to="/dashboard/staff" replace />;
  return <Navigate to="/dashboard/citizen" replace />;
};

const AppShell = () => {
  const { pathname } = useLocation();
  const isDashboardRoute = pathname.startsWith('/dashboard');

  return (
    <div className="flex flex-col min-h-screen bg-bg transition-colors duration-200">
      {!isDashboardRoute && <Navbar />}

      <main className="flex-grow">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/explore" element={<AllIssuesPage />} />
          <Route path="/explore/:id" element={<IssueDetailPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Legacy redirects */}
          <Route path="/all-issues"       element={<Navigate to="/explore" replace />} />
          <Route path="/all-issues/:id"   element={<Navigate to="/explore" replace />} />
          <Route path="/add-issue"        element={<Navigate to="/dashboard/citizen/report-issue" replace />} />
          <Route path="/my-issues"        element={<Navigate to="/dashboard/citizen/my-issues"    replace />} />
          <Route path="/profile"          element={<Navigate to="/dashboard/citizen/profile"      replace />} />
          <Route path="/my-contributions" element={<Navigate to="/dashboard/citizen"              replace />} />

          <Route path="/dashboard" element={<PrivateRoute><RoleDashboardRedirect /></PrivateRoute>} />

          <Route path="/dashboard/admin" element={<AdminRoute><AdminDashboardLayout /></AdminRoute>}>
            <Route index element={<AdminOverview />} />
            <Route path="issues"   element={<AdminAllIssues />} />
            <Route path="users"    element={<AdminManageUsers />} />
            <Route path="staff"    element={<AdminManageStaff />} />
            <Route path="payments" element={<AdminPayments />} />
            <Route path="profile"  element={<AdminProfile />} />
          </Route>

          <Route path="/dashboard/staff" element={<StaffRoute><StaffDashboardLayout /></StaffRoute>}>
            <Route index element={<StaffOverview />} />
            <Route path="issues"  element={<StaffAssignedIssues />} />
            <Route path="profile" element={<StaffProfile />} />
          </Route>

          <Route path="/dashboard/citizen" element={<PrivateRoute><CitizenDashboardLayout /></PrivateRoute>}>
            <Route index element={<CitizenOverview />} />
            <Route path="my-issues"    element={<CitizenMyIssues />} />
            <Route path="report-issue" element={<CitizenReportIssue />} />
            <Route path="profile"      element={<CitizenProfile />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      {!isDashboardRoute && <Footer />}
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Toaster
        position="bottom-right"
        reverseOrder={false}
        toastOptions={{
          success: {
            style: {
              background: 'rgb(21 128 61)',
              color: 'white',
              fontWeight: 'bold',
            },
          },
          error: {
            style: {
              background: 'rgb(185 28 28)',
              color: 'white',
              fontWeight: 'bold',
            },
          },
        }}
      />
      <AppShell />
    </BrowserRouter>
  );
}

export default App;
