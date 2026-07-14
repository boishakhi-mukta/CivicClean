// ─────────────────────────────────────────────────────────────────────────────
// App.jsx — The root of the entire application.
//
// Think of this file as the "floor plan" of CivicClean.  It decides:
//   • Which page the user sees based on the web address (URL) they visit.
//   • Whether the top navigation bar and footer should be shown (hidden inside dashboards).
//   • Which pages are public (anyone can visit) vs. protected (login required).
//   • Which dashboard a logged-in user lands on based on their role
//     (admin → admin dashboard, staff → staff dashboard, citizen → citizen dashboard).
//
// Pages are loaded "lazily" — they are only downloaded when the user actually
// visits them, keeping the initial load of the site fast.
// ─────────────────────────────────────────────────────────────────────────────

import { lazy, Suspense, useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Guards that decide who is allowed through (always loaded upfront)
import PrivateRoute from './routes/PrivateRoute';
import AdminRoute from './routes/AdminRoute';
import StaffRoute from './routes/StaffRoute';
import { AuthContext } from './context/AuthContext';
import LoadingSpinner from './components/LoadingSpinner';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';

// ── Public pages (no login needed) ───────────────────────────────────────────
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

// ── Admin dashboard pages (only admins can reach these) ──────────────────────
const AdminDashboardLayout = lazy(() => import('./pages/dashboard/admin/layout/AdminDashboardLayout'));
const AdminOverview        = lazy(() => import('./pages/dashboard/admin/AdminOverview'));
const AdminAllIssues       = lazy(() => import('./pages/dashboard/admin/AdminAllIssues'));
const AdminManageUsers     = lazy(() => import('./pages/dashboard/admin/AdminManageUsers'));
const AdminManageStaff     = lazy(() => import('./pages/dashboard/admin/AdminManageStaff'));
const AdminPayments        = lazy(() => import('./pages/dashboard/admin/AdminPayments'));
const AdminProfile         = lazy(() => import('./pages/dashboard/admin/AdminProfile'));

// ── Staff dashboard pages (only staff members can reach these) ───────────────
const StaffDashboardLayout = lazy(() => import('./pages/dashboard/staff/layout/StaffDashboardLayout'));
const StaffOverview        = lazy(() => import('./pages/dashboard/staff/StaffOverview'));
const StaffAssignedIssues  = lazy(() => import('./pages/dashboard/staff/StaffAssignedIssues'));
const StaffProfile         = lazy(() => import('./pages/dashboard/staff/StaffProfile'));

// ── Citizen dashboard pages (logged-in citizens) ─────────────────────────────
const CitizenDashboardLayout = lazy(() => import('./pages/dashboard/citizen/layout/CitizenDashboardLayout'));
const CitizenOverview        = lazy(() => import('./pages/dashboard/citizen/CitizenOverview'));
const CitizenMyIssues        = lazy(() => import('./pages/dashboard/citizen/CitizenMyIssues'));
const CitizenReportIssue     = lazy(() => import('./pages/dashboard/citizen/CitizenReportIssue'));
const CitizenProfile         = lazy(() => import('./pages/dashboard/citizen/CitizenProfile'));

// Tiny spinner shown while a page chunk is being downloaded
const PageLoader = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
  </div>
);

// Reads the user's role and sends them to the right dashboard automatically.
// If someone visits /dashboard without specifying a role sub-path, this
// figures out which one to use (admin, staff, or citizen).
const RoleDashboardRedirect = () => {
  const { currentUser, dbUser, loading } = useContext(AuthContext);
  if (loading || (currentUser && !dbUser)) return <LoadingSpinner />;
  if (dbUser?.role === 'admin') return <Navigate to="/dashboard/admin" replace />;
  if (dbUser?.role === 'staff') return <Navigate to="/dashboard/staff" replace />;
  return <Navigate to="/dashboard/citizen" replace />;
};

// The main layout wrapper that surrounds every page.
// It shows the Navbar and Footer only on public pages —
// dashboard pages have their own sidebar layout instead.
const AppShell = () => {
  const { pathname } = useLocation();
  const isDashboardRoute = pathname.startsWith('/dashboard');

  return (
    <div className="flex flex-col min-h-screen bg-bg transition-colors duration-200">
      {/* Hide the top navbar on dashboard pages — they use a sidebar instead */}
      {!isDashboardRoute && <Navbar />}

      <main className="flex-grow">
        {/* While a page is loading, show a small spinner */}
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* ── Public routes — anyone can visit these ── */}
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

            {/* Old URL paths that now forward to the new addresses */}
            <Route path="/all-issues"       element={<Navigate to="/explore" replace />} />
            <Route path="/all-issues/:id"   element={<Navigate to="/explore" replace />} />
            <Route path="/add-issue"        element={<Navigate to="/dashboard/citizen/report-issue" replace />} />
            <Route path="/my-issues"        element={<Navigate to="/dashboard/citizen/my-issues"    replace />} />
            <Route path="/profile"          element={<Navigate to="/dashboard/citizen/profile"      replace />} />
            <Route path="/my-contributions" element={<Navigate to="/dashboard/citizen"              replace />} />

            {/* /dashboard → automatically redirect to the correct role dashboard */}
            <Route path="/dashboard" element={<PrivateRoute><RoleDashboardRedirect /></PrivateRoute>} />

            {/* ── Admin dashboard (blocked for non-admins) ── */}
            <Route path="/dashboard/admin" element={<AdminRoute><AdminDashboardLayout /></AdminRoute>}>
              <Route index element={<AdminOverview />} />
              <Route path="issues"   element={<AdminAllIssues />} />
              <Route path="users"    element={<AdminManageUsers />} />
              <Route path="staff"    element={<AdminManageStaff />} />
              <Route path="payments" element={<AdminPayments />} />
              <Route path="profile"  element={<AdminProfile />} />
            </Route>

            {/* ── Staff dashboard (blocked for non-staff) ── */}
            <Route path="/dashboard/staff" element={<StaffRoute><StaffDashboardLayout /></StaffRoute>}>
              <Route index element={<StaffOverview />} />
              <Route path="issues"  element={<StaffAssignedIssues />} />
              <Route path="profile" element={<StaffProfile />} />
            </Route>

            {/* ── Citizen dashboard (any logged-in user) ── */}
            <Route path="/dashboard/citizen" element={<PrivateRoute><CitizenDashboardLayout /></PrivateRoute>}>
              <Route index element={<CitizenOverview />} />
              <Route path="my-issues"    element={<CitizenMyIssues />} />
              <Route path="report-issue" element={<CitizenReportIssue />} />
              <Route path="profile"      element={<CitizenProfile />} />
            </Route>

            {/* Catch-all: any unknown URL shows the 404 page */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </main>

      {/* Footer is also hidden on dashboard pages */}
      {!isDashboardRoute && <Footer />}
    </div>
  );
};

function App() {
  return (
    // BrowserRouter enables clicking links to change pages without a full reload
    <BrowserRouter>
      {/* Scroll back to the top of the page every time the user navigates */}
      <ScrollToTop />

      {/* Toast notifications — the small pop-up messages like "Issue updated!" */}
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
          // Green style for success messages
          success: {
            iconTheme: { primary: '#16a34a', secondary: '#fff' },
            style: {
              background: '#f0fdf4',
              color: '#15803d',
              border: '1px solid #bbf7d0',
            },
          },
          // Red style for error messages
          error: {
            iconTheme: { primary: '#dc2626', secondary: '#fff' },
            style: {
              background: '#fef2f2',
              color: '#b91c1c',
              border: '1px solid #fecaca',
            },
          },
          // Neutral style for loading messages
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
