import { useState, useContext } from 'react';
import { NavLink, Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  FiGrid, FiList, FiUsers, FiUserCheck, FiCreditCard, FiUser,
  FiMenu, FiX, FiLogOut, FiChevronRight,
} from 'react-icons/fi';
import { AuthContext } from '../../../../context/AuthContext';
import ThemeToggle from '../../../../components/ThemeToggle';

const NAV_ITEMS = [
  { to: '/dashboard/admin',          label: 'Overview',      Icon: FiGrid,       end: true },
  { to: '/dashboard/admin/issues',   label: 'All Issues',    Icon: FiList },
  { to: '/dashboard/admin/users',    label: 'Manage Users',  Icon: FiUsers },
  { to: '/dashboard/admin/staff',    label: 'Manage Staff',  Icon: FiUserCheck },
  { to: '/dashboard/admin/payments', label: 'Payments',      Icon: FiCreditCard },
  { to: '/dashboard/admin/profile',  label: 'Profile',       Icon: FiUser },
];

const PAGE_TITLES = {
  '/dashboard/admin':          'Overview',
  '/dashboard/admin/issues':   'All Issues',
  '/dashboard/admin/users':    'Manage Users',
  '/dashboard/admin/staff':    'Manage Staff',
  '/dashboard/admin/payments': 'Payments',
  '/dashboard/admin/profile':  'Profile',
};

const SidebarContent = ({ displayName, photoSrc, dbUser, onLogout, onClose }) => (
  <div className="flex flex-col h-full">
    {/* Logo */}
    <div className="flex items-center justify-between px-5 h-16 border-b border-border flex-shrink-0">
      <Link to="/" onClick={onClose} className="flex items-center gap-2.5">
        <span className="text-xl">🌿</span>
        <div>
          <span className="font-bold text-text text-base leading-none block">CivicClean</span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary leading-none block mt-0.5">Admin</span>
        </div>
      </Link>
      {onClose && (
        <button onClick={onClose} className="text-muted hover:text-text lg:hidden">
          <FiX size={20} />
        </button>
      )}
    </div>

    {/* Nav */}
    <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted px-3 mb-2">Navigation</p>
      {NAV_ITEMS.map(({ to, label, Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onClose}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
              isActive
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-muted hover:text-text hover:bg-surface-alt'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <Icon size={16} className="flex-shrink-0" />
              <span className="flex-1">{label}</span>
              {isActive && <FiChevronRight size={13} className="opacity-60" />}
            </>
          )}
        </NavLink>
      ))}
    </nav>

    {/* User panel */}
    <div className="px-3 py-4 border-t border-border flex-shrink-0">
      <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-surface-alt transition-colors">
        {photoSrc ? (
          <img src={photoSrc} alt="avatar" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary text-xs font-bold flex-shrink-0">
            {displayName.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-text truncate leading-tight">{displayName}</p>
          <p className="text-[10px] text-muted capitalize leading-tight mt-0.5">{dbUser?.role || 'Admin'}</p>
        </div>
        <button
          onClick={onLogout}
          title="Logout"
          className="text-muted hover:text-danger transition-colors flex-shrink-0"
        >
          <FiLogOut size={15} />
        </button>
      </div>
    </div>
  </div>
);

const AdminDashboardLayout = () => {
  const { currentUser, dbUser, logout } = useContext(AuthContext);
  const [sidebarOpen, setSidebarOpen]   = useState(false);
  const navigate   = useNavigate();
  const { pathname } = useLocation();

  const displayName = dbUser?.name || currentUser?.displayName || 'Admin';
  const photoSrc    = dbUser?.avatar_url || currentUser?.photoURL || null;
  const pageTitle   = PAGE_TITLES[pathname] || 'Dashboard';

  const handleLogout = () => {
    setSidebarOpen(false);
    logout().then(() => navigate('/'));
  };

  return (
    <div className="flex h-screen bg-surface overflow-hidden">

      {/* ── Desktop sidebar ── */}
      <aside className="hidden lg:flex flex-col w-56 xl:w-60 flex-shrink-0 bg-bg border-r border-border">
        <SidebarContent
          displayName={displayName}
          photoSrc={photoSrc}
          dbUser={dbUser}
          onLogout={handleLogout}
        />
      </aside>

      {/* ── Mobile sidebar drawer ── */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-64 bg-bg border-r border-border flex-shrink-0 flex flex-col shadow-2xl">
            <SidebarContent
              displayName={displayName}
              photoSrc={photoSrc}
              dbUser={dbUser}
              onLogout={handleLogout}
              onClose={() => setSidebarOpen(false)}
            />
          </aside>
        </div>
      )}

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top header */}
        <header className="h-14 flex items-center justify-between px-4 sm:px-6 border-b border-border bg-surface/80 backdrop-blur-sm flex-shrink-0 gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-1.5 rounded-lg text-muted hover:text-text hover:bg-surface-alt transition-colors"
              aria-label="Open menu"
            >
              <FiMenu size={20} />
            </button>
            <div>
              <h1 className="text-sm font-bold text-text leading-none">{pageTitle}</h1>
              <p className="text-[11px] text-muted leading-none mt-0.5 hidden sm:block">Admin Dashboard</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            {photoSrc ? (
              <img src={photoSrc} alt="avatar" className="w-7 h-7 rounded-full object-cover" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-on-primary text-xs font-bold">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboardLayout;
