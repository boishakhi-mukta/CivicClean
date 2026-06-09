import { Link } from 'react-router-dom';
import { FaXTwitter, FaFacebookF, FaInstagram, FaLinkedinIn } from 'react-icons/fa6';

const Footer = () => (
  <footer className="bg-surface-alt text-text pt-16 pb-8 border-t border-border transition-colors duration-200">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-12">

        <div className="space-y-4">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl">🌿</span>
            <span className="text-primary font-bold text-2xl tracking-wide">CivicClean</span>
          </Link>
          <p className="text-sm leading-relaxed text-muted">
            Empowering communities to report, track, and resolve local cleanliness issues. Together, we can build cleaner, healthier neighborhoods.
          </p>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-text mb-4">Quick Links</h3>
          <ul className="space-y-3">
            {[
              { to: '/', label: 'Home' },
              { to: '/all-issues', label: 'All Issues' },
              { to: '/dashboard/citizen/report-issue', label: 'Report an Issue' },
              { to: '/map', label: 'Map' },
            ].map(({ to, label }) => (
              <li key={to}>
                <Link to={to} className="text-sm text-muted hover:text-primary transition-colors">{label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-text mb-4">Categories</h3>
          <ul className="space-y-3">
            {[
              { to: '/all-issues?category=Garbage',                label: 'Garbage' },
              { to: '/all-issues?category=Road+Damage',            label: 'Road Damage' },
              { to: '/all-issues?category=Broken+Public+Property', label: 'Broken Public Property' },
              { to: '/all-issues?category=Illegal+Construction',   label: 'Illegal Construction' },
            ].map(({ to, label }) => (
              <li key={to}>
                <Link to={to} className="text-sm text-muted hover:text-primary transition-colors">{label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-text mb-4">Connect With Us</h3>
          <div className="flex space-x-4 mb-6">
            {[
              { href: 'https://twitter.com',   Icon: FaXTwitter,   label: 'Twitter' },
              { href: 'https://facebook.com',  Icon: FaFacebookF,  label: 'Facebook' },
              { href: 'https://instagram.com', Icon: FaInstagram,  label: 'Instagram' },
              { href: 'https://linkedin.com',  Icon: FaLinkedinIn, label: 'LinkedIn' },
            ].map(({ href, Icon, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center text-muted hover:bg-primary hover:text-on-primary hover:border-primary transition-all"
              >
                <Icon size={18} />
              </a>
            ))}
          </div>
          <h3 className="text-lg font-semibold text-text mb-4">Legal</h3>
          <ul className="space-y-3">
            <li><Link to="/privacy" className="text-sm text-muted hover:text-primary transition-colors">Privacy Policy</Link></li>
            <li><Link to="/terms"   className="text-sm text-muted hover:text-primary transition-colors">Terms of Service</Link></li>
          </ul>
        </div>

      </div>

      <div className="pt-8 border-t border-border text-center">
        <p className="text-sm text-muted">
          &copy; {new Date().getFullYear()} CivicClean. All rights reserved.
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
