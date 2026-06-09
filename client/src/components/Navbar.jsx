import { useContext, useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FiMenu, FiX, FiLogOut, FiGrid } from 'react-icons/fi';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
  const { currentUser, dbUser, logout } = useContext(AuthContext);
  const [isMenuOpen, setIsMenuOpen]     = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const navLinkClass = ({ isActive }) =>
    isActive
      ? 'text-on-primary font-semibold underline underline-offset-4 transition-colors duration-150'
      : 'text-on-primary/80 hover:text-on-primary transition-colors duration-150';

  const getInitials = (name) => (name ? name.charAt(0).toUpperCase() : 'U');

  const getDashboardPath = () => {
    if (dbUser?.role === 'admin') return '/dashboard/admin';
    if (dbUser?.role === 'staff') return '/dashboard/staff';
    return '/dashboard/citizen';
  };

  const handleLogout = (closeFn) => {
    closeFn();
    logout().then(() => navigate('/'));
  };

  const displayName = dbUser?.name || currentUser?.displayName || 'User';
  const photoSrc    = dbUser?.avatar_url || currentUser?.photoURL || null;

  return (
    <nav className="sticky top-0 z-50 bg-primary shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl">🌿</span>
            <span className="text-on-primary font-bold text-xl tracking-wide">CivicClean</span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center space-x-8">
            <NavLink to="/" className={navLinkClass}>Home</NavLink>
            <NavLink to="/all-issues" className={navLinkClass}>All Issues</NavLink>
            <NavLink to="/map" className={navLinkClass}>Map</NavLink>
            {currentUser && (!dbUser?.role || dbUser?.role === 'citizen') && (
              <>
                <NavLink to="/dashboard/citizen/report-issue" className={navLinkClass}>Report Issue</NavLink>
                <NavLink to="/dashboard/citizen/my-issues" className={navLinkClass}>My Issues</NavLink>
              </>
            )}
          </div>

          {/* Right section */}
          <div className="hidden md:flex items-center space-x-3">
            <ThemeToggle />

            {!currentUser ? (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-md font-medium bg-on-primary text-primary hover:bg-on-primary/90 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-md font-medium text-on-primary border border-on-primary/40 hover:bg-on-primary/10 transition-colors"
                >
                  Register
                </Link>
              </div>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring rounded-full"
                >
                  {photoSrc ? (
                    <img
                      src={photoSrc}
                      alt="User avatar"
                      className="w-10 h-10 rounded-full object-cover border-2 border-on-primary/60"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-on-primary flex items-center justify-center text-primary font-bold text-lg">
                      {getInitials(displayName || currentUser.email)}
                    </div>
                  )}
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-surface rounded-md shadow-xl py-1 z-50 border border-border">
                    <div className="px-4 py-2 border-b border-border">
                      <p className="text-sm font-semibold text-text truncate">{displayName}</p>
                      <p className="text-xs text-muted truncate">{currentUser.email}</p>
                      {dbUser?.role && (
                        <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium capitalize">
                          {dbUser.role}
                        </span>
                      )}
                    </div>

                    <Link
                      to={getDashboardPath()}
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-text hover:bg-surface-alt transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <FiGrid size={14} />
                      <span>Dashboard</span>
                    </Link>

                    <button
                      onClick={() => handleLogout(() => setIsDropdownOpen(false))}
                      className="w-full text-left px-4 py-2 text-sm text-danger hover:bg-surface-alt flex items-center space-x-2 transition-colors"
                    >
                      <FiLogOut size={14} />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-3">
            <ThemeToggle />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-on-primary hover:text-on-primary/80 focus:outline-none"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-primary-hover border-t border-on-primary/10">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {[
              { to: '/', label: 'Home' },
              { to: '/all-issues', label: 'All Issues' },
              { to: '/map', label: 'Map' },
            ].map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setIsMenuOpen(false)}
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    isActive
                      ? 'text-on-primary bg-on-primary/10'
                      : 'text-on-primary/80 hover:text-on-primary hover:bg-on-primary/5'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}

            {currentUser && (!dbUser?.role || dbUser?.role === 'citizen') && (
              <>
                <NavLink to="/dashboard/citizen/report-issue" onClick={() => setIsMenuOpen(false)}
                  className={({ isActive }) => `block px-3 py-2 rounded-md text-base font-medium transition-colors ${isActive ? 'text-on-primary bg-on-primary/10' : 'text-on-primary/80 hover:text-on-primary hover:bg-on-primary/5'}`}>
                  Report Issue
                </NavLink>
                <NavLink to="/dashboard/citizen/my-issues" onClick={() => setIsMenuOpen(false)}
                  className={({ isActive }) => `block px-3 py-2 rounded-md text-base font-medium transition-colors ${isActive ? 'text-on-primary bg-on-primary/10' : 'text-on-primary/80 hover:text-on-primary hover:bg-on-primary/5'}`}>
                  My Issues
                </NavLink>
                <Link
                  to={getDashboardPath()}
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-on-primary/80 hover:text-on-primary hover:bg-on-primary/5"
                >
                  <FiGrid size={16} /><span>Dashboard</span>
                </Link>
              </>
            )}

            {!currentUser ? (
              <div className="mt-4 flex flex-col space-y-2 px-3">
                <Link to="/login" onClick={() => setIsMenuOpen(false)}
                  className="w-full text-center px-4 py-2 rounded-md font-medium bg-on-primary text-primary">
                  Login
                </Link>
                <Link to="/register" onClick={() => setIsMenuOpen(false)}
                  className="w-full text-center px-4 py-2 rounded-md font-medium text-on-primary border border-on-primary/40">
                  Register
                </Link>
              </div>
            ) : (
              <button
                onClick={() => handleLogout(() => setIsMenuOpen(false))}
                className="w-full text-left flex items-center space-x-2 px-3 py-2 mt-4 rounded-md text-base font-medium text-danger hover:bg-on-primary/5"
              >
                <FiLogOut size={16} /><span>Logout</span>
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
