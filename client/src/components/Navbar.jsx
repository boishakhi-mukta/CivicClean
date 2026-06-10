import { useContext, useState, useRef, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FiMenu, FiX, FiLogOut, FiGrid, FiUser } from 'react-icons/fi';
import ThemeToggle from './ThemeToggle';
import toast from 'react-hot-toast';

const Navbar = () => {
  const { currentUser, dbUser, logout } = useContext(AuthContext);
  const [isMenuOpen, setIsMenuOpen]         = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate    = useNavigate();

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

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
    logout().then(() => {
      toast.success('Logged out successfully');
      navigate('/');
    });
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
            <NavLink to="/explore" className={navLinkClass}>Explore</NavLink>
            <NavLink to="/map" className={navLinkClass}>Map</NavLink>
            <NavLink to="/about" className={navLinkClass}>About</NavLink>
            <NavLink to="/contact" className={navLinkClass}>Contact</NavLink>
            {currentUser && (!dbUser?.role || dbUser?.role === 'citizen') && (
              <>
                <NavLink to="/dashboard/citizen/report-issue" className={navLinkClass}>Report Issue</NavLink>
                <NavLink to="/dashboard/citizen/my-issues" className={navLinkClass}>My Issues</NavLink>
              </>
            )}
          </div>

          {/* Right section */}
          <div className="hidden md:flex items-center space-x-3">
            <ThemeToggle className="text-on-primary hover:bg-on-primary/10" />

            {!currentUser ? (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-md font-medium bg-on-primary text-primary hover:bg-on-primary/90 transition-colors"
                >
                  Login
                </Link>
              </div>
            ) : (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(v => !v)}
                  className="flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring rounded-full"
                  aria-expanded={isDropdownOpen}
                  aria-haspopup="true"
                >
                  {photoSrc ? (
                    <img
                      src={photoSrc}
                      alt="User avatar"
                      className="w-9 h-9 rounded-full object-cover border-2 border-on-primary/60 hover:border-on-primary transition"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-on-primary flex items-center justify-center text-primary font-bold text-base">
                      {getInitials(displayName || currentUser.email)}
                    </div>
                  )}
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-surface rounded-xl shadow-2xl border border-border z-50 overflow-hidden">
                    {/* User info */}
                    <div className="px-4 py-3 bg-surface-alt/50">
                      <div className="flex items-center gap-3">
                        {photoSrc ? (
                          <img src={photoSrc} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary text-sm font-bold flex-shrink-0">
                            {getInitials(displayName)}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-text truncate">{displayName}</p>
                          <p className="text-xs text-muted truncate">{currentUser.email}</p>
                        </div>
                      </div>
                      {dbUser?.role && (
                        <span className="mt-2 inline-block text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold capitalize">
                          {dbUser.role}
                        </span>
                      )}
                    </div>

                    <div className="py-1">
                      <Link
                        to={getDashboardPath()}
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-text hover:bg-surface-alt transition-colors"
                      >
                        <FiGrid size={15} className="text-muted flex-shrink-0" />
                        Dashboard
                      </Link>
                      <Link
                        to={`${getDashboardPath()}/profile`}
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-text hover:bg-surface-alt transition-colors"
                      >
                        <FiUser size={15} className="text-muted flex-shrink-0" />
                        Profile
                      </Link>
                    </div>

                    <div className="border-t border-border py-1">
                      <button
                        onClick={() => handleLogout(() => setIsDropdownOpen(false))}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-danger hover:bg-danger/5 transition-colors"
                      >
                        <FiLogOut size={15} className="flex-shrink-0" />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-3">
            <ThemeToggle className="text-on-primary hover:bg-on-primary/10" />
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
              { to: '/explore', label: 'Explore' },
              { to: '/map', label: 'Map' },
              { to: '/about', label: 'About' },
              { to: '/contact', label: 'Contact' },
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
              <div className="mt-4 px-3">
                <Link to="/login" onClick={() => setIsMenuOpen(false)}
                  className="w-full text-center block px-4 py-2 rounded-md font-medium bg-on-primary text-primary">
                  Login
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
