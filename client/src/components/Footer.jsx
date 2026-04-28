import React from 'react';
import { Link } from 'react-router-dom';
import { FaXTwitter, FaFacebookF, FaInstagram, FaLinkedinIn } from 'react-icons/fa6';

const Footer = () => {
  return (
    <footer className="bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-300 pt-16 pb-8 border-t dark:border-gray-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-12">
          
          {/* Column 1: Brand & Description */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-2xl">🌿</span>
              <span className="text-[#1a3a2a] dark:text-[#d4ff00] font-bold text-2xl tracking-wide">
                CivicClean
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
              Empowering communities to report, track, and resolve local cleanliness issues. Together, we can build cleaner, healthier neighborhoods.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li><Link to="/" className="text-sm hover:text-[#1a3a2a] dark:hover:text-[#d4ff00] transition">Home</Link></li>
              <li><Link to="/issues" className="text-sm hover:text-[#1a3a2a] dark:hover:text-[#d4ff00] transition">All Issues</Link></li>
              <li><Link to="/add-issue" className="text-sm hover:text-[#1a3a2a] dark:hover:text-[#d4ff00] transition">Report an Issue</Link></li>
              <li><Link to="/my-contributions" className="text-sm hover:text-[#1a3a2a] dark:hover:text-[#d4ff00] transition">Leaderboard</Link></li>
            </ul>
          </div>

          {/* Column 3: Categories */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Categories</h3>
            <ul className="space-y-3">
              <li><Link to="/issues?category=littering" className="text-sm hover:text-[#1a3a2a] dark:hover:text-[#d4ff00] transition">Littering</Link></li>
              <li><Link to="/issues?category=dumping" className="text-sm hover:text-[#1a3a2a] dark:hover:text-[#d4ff00] transition">Illegal Dumping</Link></li>
              <li><Link to="/issues?category=infrastructure" className="text-sm hover:text-[#1a3a2a] dark:hover:text-[#d4ff00] transition">Broken Bins</Link></li>
              <li><Link to="/issues?category=graffiti" className="text-sm hover:text-[#1a3a2a] dark:hover:text-[#d4ff00] transition">Graffiti</Link></li>
            </ul>
          </div>

          {/* Column 4: Connect & Legal */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Connect With Us</h3>
            <div className="flex space-x-4 mb-6">
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center hover:bg-[#1a3a2a] hover:text-white dark:hover:bg-[#d4ff00] dark:hover:text-[#1a3a2a] transition-all">
                <FaXTwitter size={18} />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center hover:bg-[#1a3a2a] hover:text-white dark:hover:bg-[#d4ff00] dark:hover:text-[#1a3a2a] transition-all">
                <FaFacebookF size={18} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center hover:bg-[#1a3a2a] hover:text-white dark:hover:bg-[#d4ff00] dark:hover:text-[#1a3a2a] transition-all">
                <FaInstagram size={18} />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center hover:bg-[#1a3a2a] hover:text-white dark:hover:bg-[#d4ff00] dark:hover:text-[#1a3a2a] transition-all">
                <FaLinkedinIn size={18} />
              </a>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Legal</h3>
            <ul className="space-y-3">
              <li><Link to="/privacy" className="text-sm hover:text-[#1a3a2a] dark:hover:text-[#d4ff00] transition">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-sm hover:text-[#1a3a2a] dark:hover:text-[#d4ff00] transition">Terms of Service</Link></li>
            </ul>
          </div>

        </div>

        {/* Copyright Line */}
        <div className="pt-8 border-t border-gray-200 dark:border-gray-800 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-500">
            &copy; {new Date().getFullYear()} CivicClean. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
