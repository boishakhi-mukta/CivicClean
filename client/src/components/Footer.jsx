// ─────────────────────────────────────────────────────────────────────────────
// Footer.jsx — The footer that appears at the bottom of every public page.
//
// It is split into four columns:
//   1. Brand — logo, short description, and social media icons.
//   2. Quick Links — shortcuts to the most-visited pages.
//   3. Categories — direct links to browse issues by type (Garbage, Road Damage…).
//   4. Legal — Privacy Policy, Terms & Conditions, Help.
//   5. Contact — email address and city location.
//
// At the very bottom there is a thin copyright bar with extra links.
// ─────────────────────────────────────────────────────────────────────────────

import { Link } from 'react-router-dom';
import { FaXTwitter, FaFacebookF, FaInstagram, FaLinkedinIn, FaGithub } from 'react-icons/fa6';
import { FiMail, FiMapPin } from 'react-icons/fi';

// ── Link lists defined outside the component so they are not recreated on every render ──

// Main navigation shortcuts shown in the "Quick Links" column
const QUICK_LINKS = [
  { to: '/',                                   label: 'Home' },
  { to: '/explore',                            label: 'Explore Issues' },
  { to: '/map',                                label: 'Issue Map' },
  { to: '/about',                              label: 'About Us' },
  { to: '/contact',                            label: 'Contact Us' },
  { to: '/dashboard/citizen/report-issue',     label: 'Report an Issue' },
];

// Links to legal and support pages
const LEGAL_LINKS = [
  { to: '/privacy', label: 'Privacy Policy' },
  { to: '/terms',   label: 'Terms & Conditions' },
  { to: '/help',    label: 'Help & Support' },
];

// Links that filter the Explore page by issue category
const CATEGORY_LINKS = [
  { to: '/explore?category=Garbage',                            label: 'Garbage' },
  { to: '/explore?category=Road+Damage',                        label: 'Road Damage' },
  { to: '/explore?category=Broken+Public+Property',             label: 'Broken Public Property' },
  { to: '/explore?category=Illegal+Construction',               label: 'Illegal Construction' },
];

// Social media profiles with their corresponding icons
const SOCIAL_LINKS = [
  { href: 'https://twitter.com',   Icon: FaXTwitter,   label: 'Twitter / X' },
  { href: 'https://facebook.com',  Icon: FaFacebookF,  label: 'Facebook' },
  { href: 'https://instagram.com', Icon: FaInstagram,  label: 'Instagram' },
  { href: 'https://linkedin.com',  Icon: FaLinkedinIn, label: 'LinkedIn' },
  { href: 'https://github.com',    Icon: FaGithub,     label: 'GitHub' },
];

const Footer = () => (
  <footer className="bg-surface-alt border-t border-border transition-colors duration-200">

    {/* Main content grid — stacks into a single column on phones */}
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">

        {/* Column 1 — Brand + description + social icons */}
        <div className="sm:col-span-2 lg:col-span-1 space-y-5">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">🌿</span>
            <span className="text-primary font-bold text-xl tracking-wide">CivicClean</span>
          </Link>
          <p className="text-sm leading-relaxed text-muted max-w-xs">
            Empowering communities to report, track, and resolve local infrastructure issues. Together we build cleaner, safer neighbourhoods.
          </p>

          {/* Social media icon buttons */}
          <div className="flex items-center gap-2 pt-1">
            {SOCIAL_LINKS.map(({ href, Icon, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="w-9 h-9 rounded-lg bg-surface border border-border flex items-center justify-center text-muted hover:bg-primary hover:text-on-primary hover:border-primary transition-all duration-200"
              >
                <Icon size={15} />
              </a>
            ))}
          </div>
        </div>

        {/* Column 2 — Quick Links */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-text mb-5">Quick Links</h3>
          <ul className="space-y-3">
            {QUICK_LINKS.map(({ to, label }) => (
              <li key={to}>
                <Link
                  to={to}
                  className="text-sm text-muted hover:text-primary transition-colors duration-150"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 3 — Browse by issue category */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-text mb-5">Categories</h3>
          <ul className="space-y-3">
            {CATEGORY_LINKS.map(({ to, label }) => (
              <li key={to}>
                <Link
                  to={to}
                  className="text-sm text-muted hover:text-primary transition-colors duration-150"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 4 — Legal pages */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-text mb-5">Legal</h3>
          <ul className="space-y-3">
            {LEGAL_LINKS.map(({ to, label }) => (
              <li key={to}>
                <Link to={to} className="text-sm text-muted hover:text-primary transition-colors duration-150">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 5 — Contact details */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-text mb-5">Contact Us</h3>
          <ul className="space-y-4">
            {/* Clicking the email address opens the user's email client */}
            <li>
              <a
                href="mailto:bgmukta11@gmail.com"
                className="flex items-start gap-3 text-sm text-muted hover:text-primary transition-colors duration-150 group"
              >
                <FiMail size={15} className="flex-shrink-0 mt-0.5 group-hover:text-primary" />
                bgmukta11@gmail.com
              </a>
            </li>
            <li>
              <span className="flex items-start gap-3 text-sm text-muted">
                <FiMapPin size={15} className="flex-shrink-0 mt-0.5" />
                Oslo, Norway
              </span>
            </li>
          </ul>
        </div>

      </div>
    </div>

    {/* Bottom copyright bar */}
    <div className="border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Year updates automatically — no manual edits needed */}
        <p className="text-xs text-muted">
          &copy; {new Date().getFullYear()} CivicClean. All rights reserved.
        </p>
        <div className="flex items-center gap-4 flex-wrap justify-center sm:justify-end">
          <Link to="/about"   className="text-xs text-muted hover:text-primary transition-colors duration-150">About</Link>
          <span className="text-border">·</span>
          <Link to="/contact" className="text-xs text-muted hover:text-primary transition-colors duration-150">Contact</Link>
          <span className="text-border">·</span>
          <Link to="/privacy" className="text-xs text-muted hover:text-primary transition-colors duration-150">Privacy Policy</Link>
          <span className="text-border">·</span>
          <Link to="/terms"   className="text-xs text-muted hover:text-primary transition-colors duration-150">Terms</Link>
          <span className="text-border">·</span>
          <Link to="/explore" className="text-xs text-muted hover:text-primary transition-colors duration-150">Explore</Link>
        </div>
      </div>
    </div>

  </footer>
);

export default Footer;
