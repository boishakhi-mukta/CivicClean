// ─────────────────────────────────────────────────────────────────────────────
// PrivacyPolicyPage.jsx — The legal Privacy Policy page at /privacy.
//
// Explains to users what personal data CivicClean collects (name, email, photos,
// location strings), how it is used, who it is shared with, and how long it is
// kept. Also covers user rights (access, deletion), cookie use, and how to
// contact the team with privacy concerns.
//
// Structure:
//   • A hero banner at the top with the last-updated date.
//   • A Table of Contents (TOC) in a sticky sidebar on desktop, or inline on
//     mobile, linking to each section via anchor IDs.
//   • The policy content in clearly labelled Section components.
//   • A "Back to Home" link at the bottom.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiShield, FiArrowLeft } from 'react-icons/fi';

const LAST_UPDATED = 'June 10, 2026';

const Section = ({ id, title, children }) => (
  <section id={id} className="scroll-mt-24">
    <h2 className="text-xl font-extrabold text-text mb-4 pb-3 border-b border-border">{title}</h2>
    <div className="space-y-3 text-sm text-muted leading-relaxed">{children}</div>
  </section>
);

const TOC = [
  { id: 'overview',    label: 'Overview' },
  { id: 'collection',  label: 'Information We Collect' },
  { id: 'use',         label: 'How We Use Your Information' },
  { id: 'sharing',     label: 'Sharing of Information' },
  { id: 'storage',     label: 'Data Storage & Security' },
  { id: 'rights',      label: 'Your Rights' },
  { id: 'cookies',     label: 'Cookies' },
  { id: 'children',    label: "Children's Privacy" },
  { id: 'changes',     label: 'Changes to This Policy' },
  { id: 'contact',     label: 'Contact' },
];

const PrivacyPolicyPage = () => {
  useEffect(() => { document.title = 'CivicClean | Privacy Policy'; }, []);

  return (
    <div className="min-h-screen bg-bg transition-colors duration-200">

      {/* ── Hero ── */}
      <div className="relative bg-primary overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.05] pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-on-primary/15 flex items-center justify-center">
              <FiShield size={20} className="text-on-primary" />
            </div>
            <span className="text-on-primary/60 text-sm font-semibold">Legal</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-on-primary tracking-tight mb-4">
            Privacy Policy
          </h1>
          <p className="text-on-primary/70 text-sm max-w-xl leading-relaxed">
            Last updated: <strong className="text-on-primary/90">{LAST_UPDATED}</strong>
          </p>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">

          {/* Table of contents (sticky sidebar) */}
          <aside className="hidden lg:block">
            <div className="sticky top-6">
              <p className="text-xs font-bold text-muted uppercase tracking-widest mb-4">On this page</p>
              <nav className="space-y-1">
                {TOC.map(({ id, label }) => (
                  <a
                    key={id}
                    href={`#${id}`}
                    className="block text-sm text-muted hover:text-primary transition-colors py-1 border-l-2 border-transparent hover:border-primary pl-3"
                  >
                    {label}
                  </a>
                ))}
              </nav>
              <div className="mt-8 pt-6 border-t border-border">
                <Link
                  to="/"
                  className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-primary transition-colors font-medium"
                >
                  <FiArrowLeft size={12} /> Back to Home
                </Link>
              </div>
            </div>
          </aside>

          {/* Content */}
          <div className="lg:col-span-3 space-y-10">

            <Section id="overview" title="Overview">
              <p>
                CivicClean ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we
                collect, use, disclose, and safeguard your information when you use our civic issue reporting platform at
                civicclean.netlify.app and any related services (collectively, the "Platform").
              </p>
              <p>
                By using the Platform, you agree to the collection and use of information in accordance with this policy.
                If you disagree with any part of this policy, please discontinue use of the Platform.
              </p>
            </Section>

            <Section id="collection" title="Information We Collect">
              <p><strong className="text-text">Information you provide directly:</strong></p>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li>Account information: name, email address, profile photo</li>
                <li>Issue reports: title, category, description, location, photos</li>
                <li>Contact form submissions: name, email, subject, message</li>
                <li>Payment information processed securely through Stripe (we do not store raw card data)</li>
              </ul>
              <p className="mt-3"><strong className="text-text">Information collected automatically:</strong></p>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li>Authentication data via Firebase (sign-in method, UID)</li>
                <li>Browser type, operating system, and device identifiers</li>
                <li>Pages visited, timestamps, and interaction data for analytics</li>
                <li>IP address for security and fraud prevention</li>
              </ul>
            </Section>

            <Section id="use" title="How We Use Your Information">
              <p>We use the information we collect to:</p>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li>Create and manage your account and authenticate you securely</li>
                <li>Process and display civic issue reports to relevant authorities and the public</li>
                <li>Assign issues to staff and facilitate resolution workflows</li>
                <li>Process premium subscription payments via Stripe</li>
                <li>Respond to your contact messages and support requests</li>
                <li>Send account-related notifications (status updates, confirmations)</li>
                <li>Improve the Platform through usage analytics</li>
                <li>Comply with applicable laws and regulations</li>
              </ul>
            </Section>

            <Section id="sharing" title="Sharing of Information">
              <p>
                We do not sell, trade, or rent your personal information to third parties. We may share information with:
              </p>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li>
                  <strong className="text-text">Service providers:</strong> Firebase (authentication), MongoDB Atlas (database),
                  Cloudinary (image storage), Stripe (payments), Netlify/Vercel (hosting). These providers are bound by
                  data processing agreements.
                </li>
                <li>
                  <strong className="text-text">Municipal authorities:</strong> Issue reports may be shared with relevant
                  local government bodies for resolution purposes.
                </li>
                <li>
                  <strong className="text-text">Legal requirements:</strong> We may disclose your information if required by
                  law or to protect the rights, property, or safety of CivicClean, our users, or others.
                </li>
              </ul>
              <p>Issue reports (title, category, location, description, and photos) are publicly visible on the Platform.</p>
            </Section>

            <Section id="storage" title="Data Storage & Security">
              <p>
                Your data is stored on MongoDB Atlas servers located in the European Union. We implement industry-standard
                security measures including:
              </p>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li>HTTPS/TLS encryption for all data in transit</li>
                <li>Encrypted storage for sensitive fields</li>
                <li>Firebase Authentication for secure identity management</li>
                <li>Role-based access controls (admin, staff, citizen)</li>
                <li>Regular security reviews and dependency updates</li>
              </ul>
              <p>
                Despite these measures, no method of transmission over the Internet is 100% secure. We cannot guarantee
                absolute security but we are committed to protecting your data to the best of our ability.
              </p>
            </Section>

            <Section id="rights" title="Your Rights">
              <p>Depending on your jurisdiction, you may have the right to:</p>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li><strong className="text-text">Access</strong> — request a copy of the personal data we hold about you</li>
                <li><strong className="text-text">Rectification</strong> — update or correct inaccurate information via your profile settings</li>
                <li><strong className="text-text">Erasure</strong> — request deletion of your account and associated data</li>
                <li><strong className="text-text">Portability</strong> — receive your data in a machine-readable format</li>
                <li><strong className="text-text">Objection</strong> — object to processing based on legitimate interests</li>
              </ul>
              <p>
                To exercise any of these rights, contact us at{' '}
                <a href="mailto:bgmukta11@gmail.com" className="text-primary hover:underline">bgmukta11@gmail.com</a>.
                We will respond within 30 days.
              </p>
            </Section>

            <Section id="cookies" title="Cookies">
              <p>
                The Platform uses minimal cookies and local storage for session management and authentication tokens
                (managed by Firebase). We do not use advertising or third-party tracking cookies.
              </p>
              <p>
                You can configure your browser to refuse cookies, though this may affect certain features of the Platform.
              </p>
            </Section>

            <Section id="children" title="Children's Privacy">
              <p>
                CivicClean is not directed to children under the age of 13. We do not knowingly collect personal information
                from children under 13. If we become aware that a child under 13 has provided us with personal information,
                we will take steps to delete such information promptly.
              </p>
            </Section>

            <Section id="changes" title="Changes to This Policy">
              <p>
                We may update this Privacy Policy from time to time. We will notify you of significant changes by posting
                the new policy on this page with an updated "Last updated" date. Continued use of the Platform after
                changes constitutes acceptance of the updated policy.
              </p>
            </Section>

            <Section id="contact" title="Contact">
              <p>
                If you have questions or concerns about this Privacy Policy or our data practices, please reach out:
              </p>
              <div className="bg-surface-alt rounded-xl border border-border p-4 mt-3 not-prose">
                <p className="text-text font-semibold text-sm mb-1">CivicClean</p>
                <p className="text-sm text-muted">Oslo, Norway</p>
                <a href="mailto:bgmukta11@gmail.com" className="text-sm text-primary hover:underline">bgmukta11@gmail.com</a>
              </div>
              <p className="mt-4">
                You may also use our{' '}
                <Link to="/contact" className="text-primary hover:underline font-medium">Contact page</Link>{' '}
                to send us a message directly.
              </p>
            </Section>

          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
