// ─────────────────────────────────────────────────────────────────────────────
// Navbar.jsx — The navigation bar that appears at the top of every public page.
//
// What it shows changes depending on whether you are logged in:
//   • Not logged in  → logo + links + a "Login" button.
//   • Logged-in citizen → extra "Report Issue" and "My Issues" links.
//   • Any logged-in user → a profile avatar that opens a dropdown menu
//     with links to your dashboard, profile, and a "Sign out" option.
//
// On small screens (phones) the links collapse into a hamburger menu (☰).
// The navbar sticks to the top of the screen as you scroll.
// ─────────────────────────────────────────────────────────────────────────────

import { useContext, useState, useRef, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FiMenu, FiX, FiLogOut, FiGrid, FiUser } from 'react-icons/fi';
import ThemeToggle from './ThemeToggle';
import toast from 'react-hot-toast';

const Navbar = () => {
  const { currentUser, dbUser, logout } = useContext(AuthContext);

  // Controls whether the mobile hamburger menu is open or closed
  const [isMenuOpen, setIsMenuOpen]         = useState(false);

  // Controls whether the user's profile dropdown is open or closed
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Used to detect clicks outside the dropdown so it closes automatically
  const dropdownRef = useRef(null);
  const navigate    = useNavigate();

  // Close the profile dropdown whenever the user clicks anywhere outside it
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Styling for nav links — active (current) page gets underlined
  const navLinkClass = ({ isActive }) =>
    isActive
      ? 'text-on-primary font-semibold underline underline-offset-4 transition-colors duration-150'
      : 'text-on-primary/80 hover:text-on-primary transition-colors duration-150';

  // Shows the first letter of the user's name when there is no profile photo
  const getInitials = (name) => (name ? name.charAt(0).toUpperCase() : 'U');

  // Returns the correct dashboard URL based on the user's role
  const getDashboardPath = () => {
    if (dbUser?.role === 'admin') return '/dashboard/admin';
    if (dbUser?.role === 'staff') return '/dashboard/staff';
    return '/dashboard/citizen';
  };

  // Logs the user out, closes any open menu, and sends them back to the home page
  const handleLogout = (closeFn) => {
    closeFn();
    logout().then(() => {
      toast.success('Logged out successfully');
      navigate('/');
    });
  };

  // Prefer the database name, then the Google display name, otherwise show "User"
  const displayName = dbUser?.name || currentUser?.displayName || 'User';

  // Prefer the database avatar, then the Google profile photo, otherwise show initials
  const photoSrc    = dbUser?.avatar_url || currentUser?.photoURL || null;

  return (
    <nav className="sticky top-0 z-50 bg-primary shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo — clicking it always goes back to the home page */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl">🌿</span>
            <span className="text-on-primary font-bold text-xl tracking-wide">CivicClean</span>
          </Link>

          {/* Desktop navigation links — hidden on small screens */}
          <div className="hidden md:flex items-center space-x-8">
            <NavLink to="/" className={navLinkClass}>Home</NavLink>
            <NavLink to="/explore" className={navLinkClass}>Explore</NavLink>
            <NavLink to="/map" className={navLinkClass}>Map</NavLink>
            <NavLink to="/about" className={navLinkClass}>About</NavLink>
            <NavLink to="/contact" className={navLinkClass}>Contact</NavLink>

            {/* Extra links only visible to logged-in citizens (not admin or staff) */}
            {currentUser && (!dbUser?.role || dbUser?.role === 'citizen') && (
              <>
                <NavLink to="/dashboard/citizen/report-issue" className={navLinkClass}>Report Issue</NavLink>
                <NavLink to="/dashboard/citizen/my-issues" className={navLinkClass}>My Issues</NavLink>
              </>
            )}
          </div>

          {/* Right side — theme toggle and login/profile section */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Sun/moon button to switch between light and dark mode */}
            <ThemeToggle className="text-on-primary hover:bg-on-primary/10" />

            {/* If not logged in, show a Login button */}
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
              /* If logged in, show the user's avatar — clicking it opens the dropdown menu */
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(v => !v)}
                  className="flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring rounded-full"
                  aria-expanded={isDropdownOpen}
                  aria-haspopup="true"
                >
                  {/* Show profile photo if available, otherwise show the initial letter */}
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

                {/* Dropdown menu — shown when the avatar is clicked */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-surface rounded-xl shadow-2xl border border-border z-50 overflow-hidden">

                    {/* User's name, email, and role badge at the top of the dropdown */}
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
                      {/* Show a role pill (e.g. "admin", "staff", "citizen") */}
                      {dbUser?.role && (
                        <span className="mt-2 inline-block text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold capitalize">
                          {dbUser.role}
                        </span>
                      )}
                    </div>

                    {/* Quick links inside the dropdown */}
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

                    {/* Sign out button — separated by a dividing line */}
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

          {/* Mobile: theme toggle + hamburger icon (shown only on small screens) */}
          <div className="md:hidden flex items-center space-x-3">
            <ThemeToggle className="text-on-primary hover:bg-on-primary/10" />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-on-primary hover:text-on-primary/80 focus:outline-none"
              aria-label="Toggle menu"
            >
              {/* Show X when menu is open, hamburger icon when closed */}
              {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown menu — expands below the navbar when the hamburger is tapped */}
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

            {/* Citizen-only links in mobile menu */}
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

            {/* Login button or Logout button at the bottom of the mobile menu */}
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
