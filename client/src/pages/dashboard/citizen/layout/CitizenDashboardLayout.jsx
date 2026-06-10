import { useState, useContext } from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { FiGrid, FiList, FiPlusCircle, FiUser, FiMenu, FiX, FiLogOut, FiGlobe } from 'react-icons/fi';
import { AuthContext } from '../../../../context/AuthContext';
import ThemeToggle from '../../../../components/ThemeToggle';

const navItems = [
  { to: '/dashboard/citizen',              label: 'Overview',     Icon: FiGrid,       end: true },
  { to: '/explore',                         label: 'Explore',      Icon: FiGlobe },
  { to: '/dashboard/citizen/my-issues',    label: 'My Issues',    Icon: FiList },
  { to: '/dashboard/citizen/report-issue', label: 'Report Issue', Icon: FiPlusCircle },
  { to: '/dashboard/citizen/profile',      label: 'Profile',      Icon: FiUser },
];

const CitizenDashboardLayout = () => {
  const { currentUser, dbUser, logout } = useContext(AuthContext);
  const [mobileOpen, setMobileOpen]     = useState(false);
  const navigate = useNavigate();

  const displayName = dbUser?.name || currentUser?.displayName || 'User';
  const photoSrc    = dbUser?.avatar_url || currentUser?.photoURL || null;

  const handleLogout = () => {
    setMobileOpen(false);
    logout().then(() => navigate('/'));
  };

  const linkClass = ({ isActive }) =>
    isActive
      ? 'text-on-primary font-semibold border-b-2 border-on-primary/60 transition-colors duration-150'
      : 'text-on-primary/70 hover:text-on-primary transition-colors duration-150';

  return (
    <div className="flex flex-col min-h-screen bg-bg">
      <nav className="sticky top-0 z-50 bg-primary shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            <Link to="/dashboard/citizen" className="flex items-center gap-2 flex-shrink-0">
              <span className="text-2xl">🌿</span>
              <span className="text-on-primary font-bold text-xl tracking-wide hidden sm:block">CivicClean</span>
              <span className="ml-2 text-xs font-semibold uppercase tracking-widest text-on-primary/50 hidden sm:block">Citizen</span>
            </Link>

            <div className="hidden md:flex items-center gap-6">
              {navItems.map(({ to, label, end }) => (
                <NavLink key={to} to={to} end={end} className={linkClass}>{label}</NavLink>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-3">
              <ThemeToggle />
              <div className="flex items-center gap-2">
                {photoSrc ? (
                  <img src={photoSrc} alt="avatar" className="w-8 h-8 rounded-full object-cover border-2 border-on-primary/60" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-on-primary flex items-center justify-center text-primary font-bold text-sm">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="text-on-primary text-sm font-medium truncate max-w-[120px]">{displayName}</span>
              </div>
              <button onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-danger hover:bg-on-primary/10 transition-colors">
                <FiLogOut size={15} /> Logout
              </button>
            </div>

            <div className="md:hidden flex items-center gap-2">
              <ThemeToggle />
              <button onClick={() => setMobileOpen(!mobileOpen)}
                className="text-on-primary hover:text-on-primary/80 focus:outline-none" aria-label="Toggle menu">
                {mobileOpen ? <FiX size={22} /> : <FiMenu size={22} />}
              </button>
            </div>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden bg-primary-hover border-t border-on-primary/10 px-4 pb-4 pt-2 space-y-1">
            {navItems.map(({ to, label, Icon, end }) => (
              <NavLink key={to} to={to} end={end} onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? 'bg-on-primary text-primary' : 'text-on-primary/80 hover:bg-on-primary/10 hover:text-on-primary'
                  }`}>
                <Icon size={16} /> {label}
              </NavLink>
            ))}
            <button onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-danger hover:bg-on-primary/10 transition-colors mt-2">
              <FiLogOut size={16} /> Logout
            </button>
          </div>
        )}
      </nav>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default CitizenDashboardLayout;
