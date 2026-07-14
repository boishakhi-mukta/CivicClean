// ─────────────────────────────────────────────────────────────────────────────
// DashboardPage.jsx — A legacy general-purpose dashboard shown to citizens
// who land on /dashboard without a specific sub-route.
//
// This is an older, simpler dashboard — the main role-specific dashboards
// (CitizenDashboardLayout, StaffDashboardLayout, AdminDashboardLayout) are the
// primary ones used day-to-day, each at their own /dashboard/<role> path.
//
// What this page shows:
//   • The user's profile photo (or initial), name, email, and issue count.
//   • A "Quick Actions" grid with shortcut buttons to report an issue, view
//     their issues, explore the map, and browse all issues.
//   • A "Recent Activity" placeholder (not yet implemented).
//
// Note: New citizen-facing features are being added to CitizenDashboardLayout
// instead of this page.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Fade } from 'react-awesome-reveal';
import { FiPlus, FiList, FiMap, FiGrid } from 'react-icons/fi';

const DashboardPage = () => {
  const { currentUser, dbUser, loading } = useContext(AuthContext);

  useEffect(() => {
    document.title = "CivicClean | Dashboard";
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary" />
      </div>
    );
  }

  const displayName = dbUser?.name || currentUser?.displayName || 'User';
  const photoSrc    = dbUser?.avatar_url || currentUser?.photoURL || null;

  const actions = [
    { to: '/dashboard/citizen/report-issue', label: '+ Report New Issue', Icon: FiPlus,  cls: 'bg-primary text-on-primary hover:bg-primary-hover' },
    { to: '/dashboard/citizen/my-issues',    label: 'View My Issues',     Icon: FiList,  cls: 'bg-surface-alt text-text border border-border hover:bg-border/30' },
    { to: '/map',                            label: 'Explore Map',         Icon: FiMap,   cls: 'bg-info/10 text-info hover:bg-info/20' },
    { to: '/explore',                     label: 'Browse Issues',       Icon: FiGrid,  cls: 'bg-success/10 text-success hover:bg-success/20' },
  ];

  return (
    <div className="min-h-screen bg-bg py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-5xl mx-auto">
        <Fade direction="down" triggerOnce>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-text mb-8">
            My Dashboard
          </h1>
        </Fade>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Fade direction="up" triggerOnce delay={100} className="md:col-span-1">
            <div className="bg-surface p-6 sm:p-8 rounded-xl shadow-sm border border-border h-full flex flex-col items-center text-center">
              {photoSrc ? (
                <img
                  src={photoSrc}
                  alt="Profile"
                  className="w-28 h-28 sm:w-32 sm:h-32 rounded-full mb-6 border-4 border-primary object-cover"
                />
              ) : (
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full mb-6 bg-primary border-4 border-primary/50 flex items-center justify-center text-on-primary text-4xl font-extrabold">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
              <h2 className="text-xl sm:text-2xl font-bold text-text mb-2 truncate w-full">{displayName}</h2>
              <p className="text-muted mb-6 text-sm truncate w-full">{currentUser?.email}</p>

              <div className="w-full bg-surface-alt rounded-xl p-4 border border-border">
                <p className="text-xs text-muted uppercase font-semibold tracking-wider mb-1">Issues Reported</p>
                <p className="text-4xl font-black text-primary">{dbUser?.issueCount || 0}</p>
              </div>
            </div>
          </Fade>

          <div className="md:col-span-2 flex flex-col gap-6">
            <Fade direction="up" triggerOnce delay={200}>
              <div className="bg-surface p-6 sm:p-8 rounded-xl shadow-sm border border-border">
                <h3 className="text-xl font-bold text-text mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {actions.map(({ to, label, Icon, cls }) => (
                    <Link
                      key={to}
                      to={to}
                      className={`flex items-center justify-center gap-2 p-4 font-bold rounded-xl transition-all hover:-translate-y-0.5 ${cls}`}
                    >
                      <Icon size={16} />
                      {label}
                    </Link>
                  ))}
                </div>
              </div>
            </Fade>

            <Fade direction="up" triggerOnce delay={300}>
              <div className="bg-surface p-6 sm:p-8 rounded-xl shadow-sm border border-border flex-grow">
                <h3 className="text-xl font-bold text-text mb-4">Recent Activity</h3>
                <p className="text-muted italic">No recent activity to show yet.</p>
              </div>
            </Fade>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
