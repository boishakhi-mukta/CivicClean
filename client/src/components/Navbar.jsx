import { useContext, useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { FiSun, FiMoon, FiMenu, FiX, FiLogOut, FiGrid } from 'react-icons/fi';

const Navbar = () => {
  const { currentUser, dbUser, logout } = useContext(AuthContext);
  const { isDarkMode, toggleDarkMode } = useContext(ThemeContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const navLinkClass = ({ isActive }) =>
    isActive
      ? 'text-[#d4ff00] font-semibold transition-colors duration-200'
      : 'text-white hover:text-[#d4ff00] transition-colors duration-200';

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  };

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
  const photoSrc = dbUser?.avatar_url || currentUser?.photoURL || null;

  return (
    <nav className="sticky top-0 z-50 bg-[#1a3a2a] shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl">🌿</span>
            <span className="text-[#d4ff00] font-bold text-xl tracking-wide">
              CivicClean
            </span>
          </Link>

          {/* Desktop Navigation Links */}
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

          {/* Right Section */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full text-white hover:bg-white/10 transition"
              aria-label="Toggle Dark Mode"
            >
              {isDarkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
            </button>

            {!currentUser ? (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-md font-medium text-[#1a3a2a] bg-[#d4ff00] hover:bg-[#bce600] transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-md font-medium text-white border border-[#d4ff00] hover:bg-[#d4ff00]/10 transition"
                >
                  Register
                </Link>
              </div>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-2 focus:outline-none"
                >
                  {photoSrc ? (
                    <img
                      src={photoSrc}
                      alt="User avatar"
                      className="w-10 h-10 rounded-full object-cover border-2 border-[#d4ff00]"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#d4ff00] flex items-center justify-center text-[#1a3a2a] font-bold text-lg">
                      {getInitials(displayName || currentUser.email)}
                    </div>
                  )}
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-gray-800 rounded-md shadow-xl py-1 z-50 border dark:border-gray-700">
                    {/* User info header */}
                    <div className="px-4 py-2 border-b dark:border-gray-700">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {displayName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {currentUser.email}
                      </p>
                      {dbUser?.role && (
                        <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-[#d4ff00] text-[#1a3a2a] font-medium capitalize">
                          {dbUser.role}
                        </span>
                      )}
                    </div>

                    {/* Dashboard link */}
                    <Link
                      to={getDashboardPath()}
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <FiGrid size={14} />
                      <span>Dashboard</span>
                    </Link>

                    {/* Logout */}
                    <button
                      onClick={() => handleLogout(() => setIsDropdownOpen(false))}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                    >
                      <FiLogOut size={14} />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-4">
            <button
              onClick={toggleDarkMode}
              className="p-2 text-white hover:bg-white/10 rounded-full"
            >
              {isDarkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
            </button>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white hover:text-[#d4ff00] focus:outline-none"
            >
              {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-[#1a3a2a] border-t border-white/10">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <NavLink to="/" className="block px-3 py-2 rounded-md text-base font-medium text-white hover:text-[#d4ff00] hover:bg-white/5" onClick={() => setIsMenuOpen(false)}>Home</NavLink>
            <NavLink to="/all-issues" className="block px-3 py-2 rounded-md text-base font-medium text-white hover:text-[#d4ff00] hover:bg-white/5" onClick={() => setIsMenuOpen(false)}>All Issues</NavLink>
            <NavLink to="/map" className="block px-3 py-2 rounded-md text-base font-medium text-white hover:text-[#d4ff00] hover:bg-white/5" onClick={() => setIsMenuOpen(false)}>Map</NavLink>
            {currentUser && (!dbUser?.role || dbUser?.role === 'citizen') && (
              <>
                <NavLink to="/dashboard/citizen/report-issue" className="block px-3 py-2 rounded-md text-base font-medium text-white hover:text-[#d4ff00] hover:bg-white/5" onClick={() => setIsMenuOpen(false)}>Report Issue</NavLink>
                <NavLink to="/dashboard/citizen/my-issues" className="block px-3 py-2 rounded-md text-base font-medium text-white hover:text-[#d4ff00] hover:bg-white/5" onClick={() => setIsMenuOpen(false)}>My Issues</NavLink>
                <Link
                  to={getDashboardPath()}
                  className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-white hover:text-[#d4ff00] hover:bg-white/5"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FiGrid size={16} />
                  <span>Dashboard</span>
                </Link>
              </>
            )}

            {!currentUser ? (
              <div className="mt-4 flex flex-col space-y-2 px-3">
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="w-full text-center px-4 py-2 rounded-md font-medium text-[#1a3a2a] bg-[#d4ff00]"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMenuOpen(false)}
                  className="w-full text-center px-4 py-2 rounded-md font-medium text-white border border-[#d4ff00]"
                >
                  Register
                </Link>
              </div>
            ) : (
              <button
                onClick={() => handleLogout(() => setIsMenuOpen(false))}
                className="w-full text-left flex items-center space-x-2 px-3 py-2 mt-4 rounded-md text-base font-medium text-red-400 hover:bg-white/5"
              >
                <FiLogOut size={16} />
                <span>Logout</span>
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
