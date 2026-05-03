import React, { useContext, useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { FiSun, FiMoon, FiMenu, FiX, FiLogOut } from 'react-icons/fi';

const Navbar = () => {
  const { currentUser, logout } = useContext(AuthContext);
  const { isDarkMode, toggleDarkMode } = useContext(ThemeContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const navLinkClass = ({ isActive }) =>
    isActive
      ? 'text-[#d4ff00] font-semibold transition-colors duration-200'
      : 'text-white hover:text-[#d4ff00] transition-colors duration-200';

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#1a3a2a] shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo Section */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl">🌿</span>
            <span className="text-[#d4ff00] font-bold text-xl tracking-wide">
              CivicClean
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <NavLink to="/" className={navLinkClass}>Home</NavLink>
            <NavLink to="/issues" className={navLinkClass}>Issues</NavLink>
            <NavLink to="/map" className={navLinkClass}>Map</NavLink>
            
            {currentUser && (
              <>
                <NavLink to="/add-issue" className={navLinkClass}>Add Issue</NavLink>
                <NavLink to="/my-issues" className={navLinkClass}>My Issues</NavLink>
                <NavLink to="/my-contributions" className={navLinkClass}>Donations</NavLink>
              </>
            )}
          </div>

          {/* Right Section (Auth + Theme Toggle) */}
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
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt="User avatar"
                      className="w-10 h-10 rounded-full object-cover border-2 border-[#d4ff00]"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#d4ff00] flex items-center justify-center text-[#1a3a2a] font-bold text-lg">
                      {getInitials(currentUser.displayName || currentUser.email)}
                    </div>
                  )}
                </button>

                {/* Profile Dropdown */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-xl py-1 z-50 border dark:border-gray-700">
                    <div className="px-4 py-2 border-b dark:border-gray-700">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {currentUser.displayName || 'User'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {currentUser.email}
                      </p>
                    </div>
                    <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700" onClick={() => setIsDropdownOpen(false)}>
                      My Profile
                    </Link>
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        logout();
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                    >
                      <FiLogOut />
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
            <NavLink to="/issues" className="block px-3 py-2 rounded-md text-base font-medium text-white hover:text-[#d4ff00] hover:bg-white/5" onClick={() => setIsMenuOpen(false)}>Issues</NavLink>
            <NavLink to="/map" className="block px-3 py-2 rounded-md text-base font-medium text-white hover:text-[#d4ff00] hover:bg-white/5" onClick={() => setIsMenuOpen(false)}>Map</NavLink>
            
            {currentUser && (
              <>
                <NavLink to="/add-issue" className="block px-3 py-2 rounded-md text-base font-medium text-white hover:text-[#d4ff00] hover:bg-white/5" onClick={() => setIsMenuOpen(false)}>Add Issue</NavLink>
                <NavLink to="/my-issues" className="block px-3 py-2 rounded-md text-base font-medium text-white hover:text-[#d4ff00] hover:bg-white/5" onClick={() => setIsMenuOpen(false)}>My Issues</NavLink>
                <NavLink to="/my-contributions" className="block px-3 py-2 rounded-md text-base font-medium text-white hover:text-[#d4ff00] hover:bg-white/5" onClick={() => setIsMenuOpen(false)}>Donations</NavLink>
                <NavLink to="/profile" className="block px-3 py-2 rounded-md text-base font-medium text-white hover:text-[#d4ff00] hover:bg-white/5" onClick={() => setIsMenuOpen(false)}>My Profile</NavLink>
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
                onClick={() => {
                  setIsMenuOpen(false);
                  logout();
                }}
                className="w-full text-left block px-3 py-2 mt-4 rounded-md text-base font-medium text-red-400 hover:bg-white/5 flex items-center space-x-2"
              >
                <FiLogOut />
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
