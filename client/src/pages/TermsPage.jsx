// ─────────────────────────────────────────────────────────────────────────────
// TermsPage.jsx — The Terms & Conditions page at /terms.
//
// Sets out the rules users must agree to when using CivicClean: what the service
// is, account responsibilities, acceptable use, user content ownership, the
// premium subscription terms (1,000 kr one-time payment), intellectual property,
// disclaimers, and the governing law (Norway).
//
// Structure mirrors PrivacyPolicyPage:
//   • Hero banner with last-updated date.
//   • Table of Contents (TOC) with anchor links to each section.
//   • Content sections via the Section component.
//   • Back navigation link.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiFileText, FiArrowLeft } from 'react-icons/fi';

const LAST_UPDATED = 'June 10, 2026';

const Section = ({ id, title, children }) => (
  <section id={id} className="scroll-mt-24">
    <h2 className="text-xl font-extrabold text-text mb-4 pb-3 border-b border-border">{title}</h2>
    <div className="space-y-3 text-sm text-muted leading-relaxed">{children}</div>
  </section>
);

const TOC = [
  { id: 'acceptance',    label: 'Acceptance of Terms' },
  { id: 'description',   label: 'Description of Service' },
  { id: 'accounts',      label: 'User Accounts' },
  { id: 'conduct',       label: 'Acceptable Use' },
  { id: 'content',       label: 'User Content' },
  { id: 'premium',       label: 'Premium Subscription' },
  { id: 'ip',            label: 'Intellectual Property' },
  { id: 'disclaimers',   label: 'Disclaimers' },
  { id: 'liability',     label: 'Limitation of Liability' },
  { id: 'termination',   label: 'Termination' },
  { id: 'governing',     label: 'Governing Law' },
  { id: 'changes',       label: 'Changes to Terms' },
  { id: 'contact',       label: 'Contact' },
];

const TermsPage = () => {
  useEffect(() => { document.title = 'CivicClean | Terms & Conditions'; }, []);

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
              <FiFileText size={20} className="text-on-primary" />
            </div>
            <span className="text-on-primary/60 text-sm font-semibold">Legal</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-on-primary tracking-tight mb-4">
            Terms &amp; Conditions
          </h1>
          <p className="text-on-primary/70 text-sm max-w-xl leading-relaxed">
            Last updated: <strong className="text-on-primary/90">{LAST_UPDATED}</strong>
          </p>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">

          {/* Table of contents */}
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

            <Section id="acceptance" title="1. Acceptance of Terms">
              <p>
                By accessing or using the CivicClean platform at civicclean.netlify.app (the "Platform"), you agree to be
                bound by these Terms &amp; Conditions ("Terms"), our{' '}
                <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>, and all applicable laws
                and regulations. If you do not agree with any of these Terms, you must not use the Platform.
              </p>
              <p>
                These Terms constitute a legally binding agreement between you and CivicClean ("we", "us", or "our"). We
                reserve the right to update these Terms at any time.
              </p>
            </Section>

            <Section id="description" title="2. Description of Service">
              <p>
                CivicClean is a civic issue reporting and tracking platform that allows community members to:
              </p>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li>Report local civic issues (garbage, road damage, illegal construction, etc.)</li>
                <li>Track the status of reported issues</li>
                <li>View an interactive map of community issues</li>
                <li>Interact with municipal staff handling issue resolution</li>
              </ul>
              <p>
                We reserve the right to modify, suspend, or discontinue any part of the Platform at any time without notice.
              </p>
            </Section>

            <Section id="accounts" title="3. User Accounts">
              <p>
                To use certain features of the Platform, you must create an account. You agree to:
              </p>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li>Provide accurate, complete, and current registration information</li>
                <li>Maintain the security of your password and account credentials</li>
                <li>Notify us immediately of any unauthorised use of your account</li>
                <li>Accept responsibility for all activities that occur under your account</li>
                <li>Not create more than one personal account</li>
              </ul>
              <p>
                We reserve the right to suspend or terminate accounts that violate these Terms or engage in fraudulent,
                abusive, or disruptive behaviour.
              </p>
            </Section>

            <Section id="conduct" title="4. Acceptable Use">
              <p>You agree NOT to use the Platform to:</p>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li>Submit false, misleading, or fabricated issue reports</li>
                <li>Harass, threaten, or intimidate other users or staff</li>
                <li>Upload content that is defamatory, obscene, or infringes third-party rights</li>
                <li>Attempt to gain unauthorised access to any part of the Platform or its systems</li>
                <li>Use automated bots, scrapers, or similar tools without our written consent</li>
                <li>Violate any applicable local, national, or international law or regulation</li>
                <li>Interfere with or disrupt the integrity or performance of the Platform</li>
              </ul>
              <p>
                Violation of these rules may result in immediate account suspension or termination, and we may report
                illegal activity to the relevant authorities.
              </p>
            </Section>

            <Section id="content" title="5. User Content">
              <p>
                When you submit issue reports, photos, descriptions, or other content ("User Content"), you:
              </p>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li>
                  Grant CivicClean a non-exclusive, royalty-free, worldwide licence to use, display, and distribute your
                  User Content for the purpose of operating the Platform
                </li>
                <li>Represent that you own or have the right to submit such content</li>
                <li>Acknowledge that issue reports are publicly visible on the Platform</li>
                <li>Remain solely responsible for the accuracy and legality of your content</li>
              </ul>
              <p>
                We reserve the right to remove any User Content that violates these Terms or that we deem inappropriate,
                without prior notice.
              </p>
            </Section>

            <Section id="premium" title="6. Premium Subscription">
              <p>
                CivicClean offers a Premium subscription plan that unlocks unlimited issue reporting and additional features.
                By subscribing:
              </p>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li>You authorise us to charge the applicable fees to your chosen payment method</li>
                <li>Payments are processed securely by Stripe; we do not store your card details</li>
                <li>Subscriptions renew automatically unless cancelled before the renewal date</li>
                <li>Refunds are considered on a case-by-case basis — contact us within 7 days of charge</li>
                <li>We reserve the right to modify pricing with 30 days' notice</li>
              </ul>
            </Section>

            <Section id="ip" title="7. Intellectual Property">
              <p>
                The Platform, including its design, logos, software, and original content (excluding User Content), is the
                exclusive property of CivicClean and is protected by copyright and other intellectual property laws.
              </p>
              <p>
                You may not reproduce, distribute, modify, or create derivative works from any Platform content without our
                express written permission.
              </p>
            </Section>

            <Section id="disclaimers" title="8. Disclaimers">
              <p>
                The Platform is provided on an "as is" and "as available" basis without warranties of any kind, either
                express or implied, including but not limited to:
              </p>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li>Warranties of merchantability or fitness for a particular purpose</li>
                <li>Warranties that the Platform will be uninterrupted, error-free, or secure</li>
                <li>Warranties regarding the accuracy or completeness of any information on the Platform</li>
              </ul>
              <p>
                CivicClean does not guarantee that reported issues will be acted upon by municipal authorities; our role is
                solely to facilitate communication between citizens and relevant bodies.
              </p>
            </Section>

            <Section id="liability" title="9. Limitation of Liability">
              <p>
                To the fullest extent permitted by law, CivicClean and its officers, directors, employees, and agents shall
                not be liable for any indirect, incidental, special, consequential, or punitive damages arising from:
              </p>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li>Your use of or inability to use the Platform</li>
                <li>Any unauthorised access to or alteration of your data</li>
                <li>Any conduct or content of third parties on the Platform</li>
                <li>Any errors, inaccuracies, or omissions in Platform content</li>
              </ul>
              <p>
                Our total liability shall not exceed the amount you paid to us in the three months preceding the claim.
              </p>
            </Section>

            <Section id="termination" title="10. Termination">
              <p>
                We may terminate or suspend your access to the Platform immediately, without prior notice, for any reason,
                including if you breach these Terms. Upon termination, your right to use the Platform will cease immediately.
              </p>
              <p>
                You may close your account at any time by contacting us at{' '}
                <a href="mailto:bgmukta11@gmail.com" className="text-primary hover:underline">bgmukta11@gmail.com</a>.
                We will process account deletion requests within 14 days.
              </p>
            </Section>

            <Section id="governing" title="11. Governing Law">
              <p>
                These Terms shall be governed by and construed in accordance with the laws of Norway, without regard to its
                conflict of law provisions. Any disputes arising under these Terms shall be subject to the exclusive
                jurisdiction of the courts of Oslo, Norway.
              </p>
            </Section>

            <Section id="changes" title="12. Changes to Terms">
              <p>
                We reserve the right to modify these Terms at any time. We will provide notice of significant changes by
                updating the "Last updated" date at the top of this page. Continued use of the Platform after changes
                constitutes your acceptance of the revised Terms.
              </p>
              <p>
                We encourage you to review these Terms periodically.
              </p>
            </Section>

            <Section id="contact" title="13. Contact">
              <p>If you have questions about these Terms, please contact us:</p>
              <div className="bg-surface-alt rounded-xl border border-border p-4 mt-3">
                <p className="text-text font-semibold text-sm mb-1">CivicClean</p>
                <p className="text-sm text-muted">Oslo, Norway</p>
                <a href="mailto:bgmukta11@gmail.com" className="text-sm text-primary hover:underline">bgmukta11@gmail.com</a>
              </div>
              <p className="mt-4">
                You can also reach us through our{' '}
                <Link to="/contact" className="text-primary hover:underline font-medium">Contact page</Link>.
              </p>
            </Section>

          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
