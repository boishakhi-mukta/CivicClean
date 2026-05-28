import { useState, useContext } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { AuthContext } from '../../../../context/AuthContext';
import { FiGrid, FiList, FiPlusCircle, FiUser, FiMenu } from 'react-icons/fi';

const navItems = [
  { to: '/dashboard/citizen',              label: 'Overview',      Icon: FiGrid,       end: true },
  { to: '/dashboard/citizen/my-issues',    label: 'My Issues',     Icon: FiList },
  { to: '/dashboard/citizen/report-issue', label: 'Report Issue',  Icon: FiPlusCircle },
  { to: '/dashboard/citizen/profile',      label: 'Profile',       Icon: FiUser },
];

const SidebarContent = ({ currentUser, onNav }) => {
  const initials = (str) => str?.charAt(0).toUpperCase() || 'U';

  return (
    <div className="flex flex-col h-full">
      {/* User info */}
      <div className="p-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          {currentUser?.photoURL ? (
            <img
              src={currentUser.photoURL}
              alt="avatar"
              className="w-11 h-11 rounded-full border-2 border-[#d4ff00] object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-11 h-11 rounded-full bg-[#d4ff00] flex items-center justify-center text-[#1a3a2a] font-bold text-lg flex-shrink-0">
              {initials(currentUser?.displayName || currentUser?.email)}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-white font-semibold text-sm truncate">
              {currentUser?.displayName || 'User'}
            </p>
            <p className="text-gray-400 text-xs truncate">{currentUser?.email}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ to, label, Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-[#d4ff00] text-[#1a3a2a]'
                  : 'text-gray-300 hover:bg-white/10 hover:text-white'
              }`
            }
            onClick={onNav}
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

const CitizenDashboardLayout = () => {
  const { currentUser } = useContext(AuthContext);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-[calc(100vh-64px)] bg-gray-100 dark:bg-gray-900">
      {/* Desktop sidebar */}
      <aside className="hidden md:block w-60 bg-[#1a3a2a] flex-shrink-0">
        <SidebarContent currentUser={currentUser} onNav={() => {}} />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-60 h-full bg-[#1a3a2a] z-50">
            <SidebarContent currentUser={currentUser} onNav={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 bg-[#1a3a2a]">
          <button onClick={() => setMobileOpen(true)} className="text-white" aria-label="Open menu">
            <FiMenu size={22} />
          </button>
          <span className="text-[#d4ff00] font-bold text-sm">Citizen Dashboard</span>
        </div>

        <main className="flex-1 p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default CitizenDashboardLayout;
