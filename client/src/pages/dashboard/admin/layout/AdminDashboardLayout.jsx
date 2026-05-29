import { useState, useContext } from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import {
  FiGrid, FiList, FiUsers, FiUserCheck, FiCreditCard, FiUser,
  FiMenu, FiX, FiLogOut, FiSun, FiMoon,
} from 'react-icons/fi';
import { AuthContext } from '../../../../context/AuthContext';
import { ThemeContext } from '../../../../context/ThemeContext';

const navItems = [
  { to: '/dashboard/admin',          label: 'Overview',      Icon: FiGrid,       end: true },
  { to: '/dashboard/admin/issues',   label: 'All Issues',    Icon: FiList },
  { to: '/dashboard/admin/users',    label: 'Manage Users',  Icon: FiUsers },
  { to: '/dashboard/admin/staff',    label: 'Manage Staff',  Icon: FiUserCheck },
  { to: '/dashboard/admin/payments', label: 'Payments',      Icon: FiCreditCard },
  { to: '/dashboard/admin/profile',  label: 'Profile',       Icon: FiUser },
];

const AdminDashboardLayout = () => {
  const { currentUser, dbUser, logout } = useContext(AuthContext);
  const { isDarkMode, toggleDarkMode }  = useContext(ThemeContext);
  const [mobileOpen, setMobileOpen]     = useState(false);
  const navigate = useNavigate();

  const displayName = dbUser?.name || currentUser?.displayName || 'Admin';
  const photoSrc    = dbUser?.avatar_url || currentUser?.photoURL || null;

  const handleLogout = () => {
    setMobileOpen(false);
    logout().then(() => navigate('/'));
  };

  const linkClass = ({ isActive }) =>
    isActive
      ? 'text-[#d4ff00] font-semibold border-b-2 border-[#d4ff00] transition-colors duration-200'
      : 'text-white/80 hover:text-[#d4ff00] transition-colors duration-200';

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* ── Top Navbar ── */}
      <nav className="sticky top-0 z-50 bg-[#1a3a2a] shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link to="/dashboard/admin" className="flex items-center gap-2 flex-shrink-0">
              <span className="text-2xl">🌿</span>
              <span className="text-[#d4ff00] font-bold text-xl tracking-wide hidden sm:block">
                CivicClean
              </span>
              <span className="ml-2 text-xs font-semibold uppercase tracking-widest text-white/50 hidden sm:block">
                Admin
              </span>
            </Link>

            {/* Desktop nav links */}
            <div className="hidden md:flex items-center gap-6">
              {navItems.map(({ to, label, end }) => (
                <NavLink key={to} to={to} end={end} className={linkClass}>
                  {label}
                </NavLink>
              ))}
            </div>

            {/* Right controls */}
            <div className="hidden md:flex items-center gap-3">
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-full text-white hover:bg-white/10 transition"
                aria-label="Toggle dark mode"
              >
                {isDarkMode ? <FiSun size={18} /> : <FiMoon size={18} />}
              </button>

              {/* Avatar + name */}
              <div className="flex items-center gap-2">
                {photoSrc ? (
                  <img src={photoSrc} alt="avatar" className="w-8 h-8 rounded-full object-cover border-2 border-[#d4ff00]" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#d4ff00] flex items-center justify-center text-[#1a3a2a] font-bold text-sm">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="text-white text-sm font-medium truncate max-w-[120px]">{displayName}</span>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-red-400 hover:bg-white/10 transition"
              >
                <FiLogOut size={15} /> Logout
              </button>
            </div>

            {/* Mobile controls */}
            <div className="md:hidden flex items-center gap-2">
              <button onClick={toggleDarkMode} className="p-2 text-white hover:bg-white/10 rounded-full">
                {isDarkMode ? <FiSun size={18} /> : <FiMoon size={18} />}
              </button>
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="text-white hover:text-[#d4ff00] focus:outline-none"
              >
                {mobileOpen ? <FiX size={22} /> : <FiMenu size={22} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {mobileOpen && (
          <div className="md:hidden bg-[#1a3a2a] border-t border-white/10 px-4 pb-4 pt-2 space-y-1">
            {navItems.map(({ to, label, Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive ? 'bg-[#d4ff00] text-[#1a3a2a]' : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                <Icon size={16} /> {label}
              </NavLink>
            ))}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-white/10 transition mt-2"
            >
              <FiLogOut size={16} /> Logout
            </button>
          </div>
        )}
      </nav>

      {/* ── Page content ── */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminDashboardLayout;
