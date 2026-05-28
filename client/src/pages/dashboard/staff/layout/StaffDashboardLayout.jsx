import { useState, useContext } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { FiGrid, FiList, FiUser, FiMenu, FiX, FiLogOut } from 'react-icons/fi';
import { AuthContext } from '../../../../context/AuthContext';

const navItems = [
  { to: '/dashboard/staff',        label: 'Overview',         Icon: FiGrid, end: true },
  { to: '/dashboard/staff/issues', label: 'Assigned Issues',  Icon: FiList },
  { to: '/dashboard/staff/profile',label: 'Profile',          Icon: FiUser },
];

const StaffDashboardLayout = () => {
  const { currentUser, dbUser, logout } = useContext(AuthContext);
  const [mobileOpen, setMobileOpen] = useState(false);

  const displayName = dbUser?.name || currentUser?.displayName || 'Staff';
  const photoSrc    = dbUser?.avatar_url || currentUser?.photoURL || null;

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-5 py-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          {photoSrc ? (
            <img src={photoSrc} alt="avatar" className="w-10 h-10 rounded-full object-cover border-2 border-[#d4ff00]" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-[#d4ff00] flex items-center justify-center text-[#1a3a2a] font-bold text-lg">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-white font-semibold text-sm truncate">{displayName}</p>
            <p className="text-white/50 text-xs truncate">{currentUser?.email}</p>
          </div>
        </div>
        <span className="mt-3 inline-block px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold uppercase tracking-wide">
          Staff
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, label, Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-[#d4ff00] text-[#1a3a2a]'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`
            }
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-white/10">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-all"
        >
          <FiLogOut size={17} />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-60 bg-[#1a3a2a] fixed inset-y-0 left-0 z-30">
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#1a3a2a] transform transition-transform duration-300 md:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="absolute top-4 right-4">
          <button onClick={() => setMobileOpen(false)} className="text-white/60 hover:text-white">
            <FiX size={20} />
          </button>
        </div>
        <SidebarContent />
      </aside>

      {/* Content */}
      <div className="flex-1 md:ml-60">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 bg-[#1a3a2a] sticky top-0 z-20">
          <button onClick={() => setMobileOpen(true)} className="text-white">
            <FiMenu size={22} />
          </button>
          <span className="text-white font-bold text-sm">Staff Dashboard</span>
        </div>

        <main className="p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default StaffDashboardLayout;
