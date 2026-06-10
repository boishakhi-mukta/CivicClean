import { lazy, Suspense, useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// — always-needed: guards, layout shells, tiny utilities ──────────────────
import PrivateRoute from './routes/PrivateRoute';
import AdminRoute from './routes/AdminRoute';
import StaffRoute from './routes/StaffRoute';
import { AuthContext } from './context/AuthContext';
import LoadingSpinner from './components/LoadingSpinner';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';

// — public pages ───────────────────────────────────────────────────────────
const HomePage          = lazy(() => import('./pages/HomePage'));
const AllIssuesPage     = lazy(() => import('./pages/AllIssuesPage'));
const AboutPage         = lazy(() => import('./pages/AboutPage'));
const LoginPage         = lazy(() => import('./pages/LoginPage'));
const RegisterPage      = lazy(() => import('./pages/RegisterPage'));
const IssueDetailPage   = lazy(() => import('./pages/IssueDetailPage'));
const NotFoundPage      = lazy(() => import('./pages/NotFoundPage'));
const MapPage           = lazy(() => import('./pages/MapPage'));
const ContactPage       = lazy(() => import('./pages/ContactPage'));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'));
const TermsPage         = lazy(() => import('./pages/TermsPage'));
const HelpPage          = lazy(() => import('./pages/HelpPage'));

// — admin dashboard ────────────────────────────────────────────────────────
const AdminDashboardLayout = lazy(() => import('./pages/dashboard/admin/layout/AdminDashboardLayout'));
const AdminOverview        = lazy(() => import('./pages/dashboard/admin/AdminOverview'));
const AdminAllIssues       = lazy(() => import('./pages/dashboard/admin/AdminAllIssues'));
const AdminManageUsers     = lazy(() => import('./pages/dashboard/admin/AdminManageUsers'));
const AdminManageStaff     = lazy(() => import('./pages/dashboard/admin/AdminManageStaff'));
const AdminPayments        = lazy(() => import('./pages/dashboard/admin/AdminPayments'));
const AdminProfile         = lazy(() => import('./pages/dashboard/admin/AdminProfile'));

// — staff dashboard ────────────────────────────────────────────────────────
const StaffDashboardLayout = lazy(() => import('./pages/dashboard/staff/layout/StaffDashboardLayout'));
const StaffOverview        = lazy(() => import('./pages/dashboard/staff/StaffOverview'));
const StaffAssignedIssues  = lazy(() => import('./pages/dashboard/staff/StaffAssignedIssues'));
const StaffProfile         = lazy(() => import('./pages/dashboard/staff/StaffProfile'));

// — citizen dashboard ──────────────────────────────────────────────────────
const CitizenDashboardLayout = lazy(() => import('./pages/dashboard/citizen/layout/CitizenDashboardLayout'));
const CitizenOverview        = lazy(() => import('./pages/dashboard/citizen/CitizenOverview'));
const CitizenMyIssues        = lazy(() => import('./pages/dashboard/citizen/CitizenMyIssues'));
const CitizenReportIssue     = lazy(() => import('./pages/dashboard/citizen/CitizenReportIssue'));
const CitizenProfile         = lazy(() => import('./pages/dashboard/citizen/CitizenProfile'));

// — spinner shown while a lazy chunk loads ─────────────────────────────────
const PageLoader = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
  </div>
);

// Redirects /dashboard → correct role-specific sub-dashboard
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
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public */}
            <Route path="/"            element={<HomePage />} />
            <Route path="/explore"     element={<AllIssuesPage />} />
            <Route path="/explore/:id" element={<IssueDetailPage />} />
            <Route path="/about"       element={<AboutPage />} />
            <Route path="/map"         element={<MapPage />} />
            <Route path="/contact"     element={<ContactPage />} />
            <Route path="/privacy"     element={<PrivacyPolicyPage />} />
            <Route path="/terms"       element={<TermsPage />} />
            <Route path="/help"        element={<HelpPage />} />
            <Route path="/login"       element={<LoginPage />} />
            <Route path="/register"    element={<RegisterPage />} />

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
        </Suspense>
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
        position="top-right"
        reverseOrder={false}
        gutter={12}
        containerStyle={{ top: 20, right: 20 }}
        toastOptions={{
          duration: 3500,
          style: {
            borderRadius: '10px',
            padding: '14px 18px',
            fontSize: '14px',
            fontWeight: '500',
            boxShadow: '0 4px 24px rgba(0,0,0,0.14)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            maxWidth: '360px',
          },
          success: {
            iconTheme: { primary: '#16a34a', secondary: '#fff' },
            style: {
              background: '#f0fdf4',
              color: '#15803d',
              border: '1px solid #bbf7d0',
            },
          },
          error: {
            iconTheme: { primary: '#dc2626', secondary: '#fff' },
            style: {
              background: '#fef2f2',
              color: '#b91c1c',
              border: '1px solid #fecaca',
            },
          },
          loading: {
            style: {
              background: '#f8fafc',
              color: '#334155',
              border: '1px solid #e2e8f0',
            },
          },
        }}
      />
      <AppShell />
    </BrowserRouter>
  );
}

export default App;
