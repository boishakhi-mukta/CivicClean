import { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Pages — public
import HomePage from './pages/HomePage';
import AllIssuesPage from './pages/AllIssuesPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import IssueDetailPage from './pages/IssueDetailPage';
import AddIssuePage from './pages/AddIssuePage';
import MyIssuesPage from './pages/MyIssuesPage';
import MyContributionPage from './pages/MyContributionPage';
import NotFoundPage from './pages/NotFoundPage';
import DashboardPage from './pages/DashboardPage';
import MapPage from './pages/MapPage';
import LeaderboardPage from './pages/LeaderboardPage';
import ProfilePage from './pages/ProfilePage';

// Pages — admin dashboard
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
  const { dbUser, loading } = useContext(AuthContext);
  if (loading) return <LoadingSpinner />;
  if (dbUser?.role === 'admin') return <Navigate to="/dashboard/admin" replace />;
  if (dbUser?.role === 'staff') return <Navigate to="/dashboard/staff" replace />;
  return <Navigate to="/dashboard/citizen" replace />;
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
              background: '#d4ff00',
              color: '#1a3a2a',
              fontWeight: 'bold',
            },
            iconTheme: {
              primary: '#1a3a2a',
              secondary: '#d4ff00',
            },
          },
          error: {
            style: {
              background: '#e3342f',
              color: 'white',
              fontWeight: 'bold',
            },
          },
        }}
      />
      <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
        <Navbar />

        <main className="flex-grow">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/issues" element={<AllIssuesPage />} />
            <Route path="/issues/:id" element={<IssueDetailPage />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Private Routes */}
            <Route path="/add-issue" element={<PrivateRoute><AddIssuePage /></PrivateRoute>} />
            <Route path="/my-issues" element={<PrivateRoute><MyIssuesPage /></PrivateRoute>} />
            <Route path="/my-contributions" element={<PrivateRoute><MyContributionPage /></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />

            {/* /dashboard → role-based redirect */}
            <Route path="/dashboard" element={<PrivateRoute><RoleDashboardRedirect /></PrivateRoute>} />

            {/* Legacy dashboard page kept accessible */}
            <Route path="/dashboard/legacy" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />

            {/* Admin Dashboard Routes */}
            <Route path="/dashboard/admin" element={<AdminRoute><AdminOverview /></AdminRoute>} />
            <Route path="/dashboard/admin/issues" element={<AdminRoute><AdminAllIssues /></AdminRoute>} />
            <Route path="/dashboard/admin/users" element={<AdminRoute><AdminManageUsers /></AdminRoute>} />
            <Route path="/dashboard/admin/staff" element={<AdminRoute><AdminManageStaff /></AdminRoute>} />
            <Route path="/dashboard/admin/payments" element={<AdminRoute><AdminPayments /></AdminRoute>} />
            <Route path="/dashboard/admin/profile" element={<AdminRoute><AdminProfile /></AdminRoute>} />

            {/* Staff Dashboard Routes — nested under shared layout */}
            <Route path="/dashboard/staff" element={<StaffRoute><StaffDashboardLayout /></StaffRoute>}>
              <Route index element={<StaffOverview />} />
              <Route path="issues"  element={<StaffAssignedIssues />} />
              <Route path="profile" element={<StaffProfile />} />
            </Route>

            {/* Citizen Dashboard Routes — nested under shared layout */}
            <Route path="/dashboard/citizen" element={<PrivateRoute><CitizenDashboardLayout /></PrivateRoute>}>
              <Route index element={<CitizenOverview />} />
              <Route path="my-issues"    element={<CitizenMyIssues />} />
              <Route path="report-issue" element={<CitizenReportIssue />} />
              <Route path="profile"      element={<CitizenProfile />} />
            </Route>

            {/* Catch-all 404 Route */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
