import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiChevronDown, FiSearch, FiFileText, FiMap, FiUser, FiStar,
  FiAlertCircle, FiMail, FiShield,
} from 'react-icons/fi';

const CATEGORIES = [
  {
    id:    'getting-started',
    icon:  FiUser,
    label: 'Getting Started',
    color: 'bg-primary/10 text-primary',
    faqs: [
      {
        q: 'How do I create an account?',
        a: 'Click "Login" in the top navigation bar, then select "Create an account" or sign in with your Google account. Fill in your display name and email, set a password, and you\'re ready to go.',
      },
      {
        q: 'Is CivicClean free to use?',
        a: 'Yes! CivicClean is free for all citizens. Free accounts can report up to 3 issues. For unlimited reporting, you can upgrade to a Premium account for a one-time payment of 1,000 kr.',
      },
      {
        q: 'What types of issues can I report?',
        a: 'You can report four categories of civic issues: Garbage (overflowing bins, illegal dumping), Road Damage (potholes, cracked pavements), Broken Public Property (damaged benches, broken streetlights), and Illegal Construction.',
      },
    ],
  },
  {
    id:    'reporting',
    icon:  FiAlertCircle,
    label: 'Reporting Issues',
    color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
    faqs: [
      {
        q: 'How do I report a civic issue?',
        a: 'Log in and navigate to Dashboard → Report Issue, or click "Report Issue" in the navigation bar. Fill in the title, category, priority, location, description, and upload a photo. Click "Submit Issue" when ready.',
      },
      {
        q: 'Can I edit or delete an issue after submitting?',
        a: 'Yes. Go to Dashboard → My Issues, find the issue you want to change, and click the edit (pencil) icon to modify the title, description, category, or location. You can also delete pending issues that have not yet been assigned.',
      },
      {
        q: 'What photo requirements are there?',
        a: 'Photos must be under 10 MB and in JPG, PNG, or WebP format. A clear photo of the issue helps staff verify and prioritise your report more quickly.',
      },
      {
        q: 'Why was my issue rejected?',
        a: 'Issues may be rejected if they are duplicates of existing reports, contain inappropriate content, fall outside the supported categories, or cannot be verified. Check the status details on your My Issues page for more information.',
      },
    ],
  },
  {
    id:    'tracking',
    icon:  FiFileText,
    label: 'Tracking & Status',
    color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    faqs: [
      {
        q: 'What do the different issue statuses mean?',
        a: (
          <ul className="space-y-1.5 mt-1">
            {[
              { s: 'Pending',     d: 'Your report has been submitted and is waiting for review.' },
              { s: 'In Progress', d: 'A staff member has been assigned and is investigating.' },
              { s: 'Working',     d: 'Active work is underway to resolve the issue.' },
              { s: 'Resolved',    d: 'The issue has been fixed by the assigned staff.' },
              { s: 'Closed',      d: 'The resolution has been confirmed and the case is closed.' },
              { s: 'Rejected',    d: 'The issue could not be verified or is a duplicate.' },
            ].map(({ s, d }) => (
              <li key={s}><strong className="text-text">{s}:</strong> {d}</li>
            ))}
          </ul>
        ),
      },
      {
        q: 'How long does it take for an issue to be resolved?',
        a: 'Resolution times vary depending on the category and priority level. High-priority issues are typically reviewed within 24–48 hours. Road damage and broken public property may take longer depending on resource availability.',
      },
      {
        q: 'Can I boost my issue to prioritise it?',
        a: 'Yes! Premium members can boost issues to increase their visibility and get faster attention from staff. The "Boost" option appears on your My Issues page.',
      },
    ],
  },
  {
    id:    'map',
    icon:  FiMap,
    label: 'Issue Map',
    color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
    faqs: [
      {
        q: 'How do I use the interactive map?',
        a: 'Navigate to the Map page from the top navigation. Use the Category and Status dropdown filters to narrow down the issues displayed. Click any marker on the map to see the issue title, category, status, and a link to its full details.',
      },
      {
        q: 'Why do some markers appear in unexpected locations?',
        a: 'Some older issues were submitted without precise GPS coordinates and use an approximate city-centre location. New issues submitted with location data appear at the exact address provided.',
      },
    ],
  },
  {
    id:    'account',
    icon:  FiShield,
    label: 'Account & Security',
    color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
    faqs: [
      {
        q: 'How do I update my profile or change my photo?',
        a: 'Go to your Dashboard → Profile page. Click "Edit Profile" to update your display name, phone number, and profile photo. Click "Save Changes" when done.',
      },
      {
        q: 'How do I change my password?',
        a: 'Go to Dashboard → Profile, click "Edit Profile", scroll to the "Change Password" section, enter your current password and your new password, then save. This option is only available for accounts that use email/password sign-in (not Google accounts).',
      },
      {
        q: 'My account has been blocked — what do I do?',
        a: 'Accounts may be blocked for repeated policy violations. Please contact us at bgmukta11@gmail.com or via the Contact page with your account email to request a review.',
      },
      {
        q: 'How do I delete my account?',
        a: 'Send a deletion request to bgmukta11@gmail.com from your registered email address. We will process the request within 14 days and remove all your personal data in accordance with our Privacy Policy.',
      },
    ],
  },
  {
    id:    'premium',
    icon:  FiStar,
    label: 'Premium',
    color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
    faqs: [
      {
        q: 'What does Premium include?',
        a: 'Premium members get unlimited issue reporting (free accounts are limited to 3), the ability to boost issues for faster resolution, and priority support.',
      },
      {
        q: 'Is Premium a one-time payment or subscription?',
        a: 'Premium is a one-time payment of 1,000 kr that permanently unlocks unlimited reporting for your account.',
      },
      {
        q: 'Can I get a refund?',
        a: 'Refund requests are considered on a case-by-case basis. Contact us within 7 days of payment at bgmukta11@gmail.com with your transaction ID.',
      },
    ],
  },
];

const AccordionItem = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border last:border-0">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-start gap-3 py-4 text-left group"
        aria-expanded={open}
      >
        <FiChevronDown
          size={16}
          className={`flex-shrink-0 mt-0.5 text-muted transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
        <span className={`text-sm font-semibold leading-snug ${open ? 'text-primary' : 'text-text group-hover:text-primary'} transition-colors`}>
          {q}
        </span>
      </button>
      {open && (
        <div className="pb-4 pl-7 text-sm text-muted leading-relaxed">
          {typeof a === 'string' ? <p>{a}</p> : a}
        </div>
      )}
    </div>
  );
};

const HelpPage = () => {
  useEffect(() => { document.title = 'CivicClean | Help & Support'; }, []);

  const [search,          setSearch]          = useState('');
  const [activeCategory,  setActiveCategory]  = useState('all');

  const filtered = CATEGORIES.map(cat => ({
    ...cat,
    faqs: cat.faqs.filter(
      ({ q, a }) =>
        typeof a === 'string'
          ? q.toLowerCase().includes(search.toLowerCase()) || a.toLowerCase().includes(search.toLowerCase())
          : q.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter(cat =>
    (activeCategory === 'all' || cat.id === activeCategory) && cat.faqs.length > 0
  );

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
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-on-primary/5 pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-on-primary/5 pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-on-primary tracking-tight mb-4">
            Help &amp; Support
          </h1>
          <p className="text-on-primary/70 text-base sm:text-lg max-w-xl mx-auto leading-relaxed mb-8">
            Find answers to common questions about using CivicClean.
          </p>

          {/* Search */}
          <div className="relative max-w-xl mx-auto">
            <FiSearch size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
            <input
              type="search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search questions…"
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-surface border border-border text-text text-sm outline-none focus:ring-2 focus:ring-focus-ring shadow-lg"
            />
          </div>
        </div>
      </div>

      {/* ── Category filter ── */}
      <div className="sticky top-0 z-20 bg-surface/95 backdrop-blur-sm border-b border-border shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 py-3 overflow-x-auto scrollbar-none">
            <button
              onClick={() => setActiveCategory('all')}
              className={`flex-shrink-0 px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeCategory === 'all'
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-alt text-muted hover:bg-border/40'
              }`}
            >
              All Topics
            </button>
            {CATEGORIES.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveCategory(id)}
                className={`flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeCategory === id
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-alt text-muted hover:bg-border/40'
                }`}
              >
                <Icon size={11} />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── FAQ sections ── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">

        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-4">🔍</p>
            <h2 className="text-lg font-bold text-text mb-2">No results found</h2>
            <p className="text-sm text-muted mb-6">Try a different search term or browse all topics.</p>
            <button
              onClick={() => { setSearch(''); setActiveCategory('all'); }}
              className="px-6 py-2.5 bg-primary text-on-primary font-bold rounded-xl hover:bg-primary-hover transition text-sm"
            >
              Clear search
            </button>
          </div>
        ) : (
          filtered.map(({ id, icon: Icon, label, color, faqs }) => (
            <div key={id} className="bg-surface rounded-2xl border border-border overflow-hidden shadow-sm">
              <div className="flex items-center gap-3 px-6 py-4 border-b border-border bg-surface-alt/40">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                  <Icon size={16} />
                </div>
                <h2 className="text-sm font-extrabold text-text uppercase tracking-wider">{label}</h2>
                <span className="ml-auto text-xs font-bold text-muted bg-surface-alt px-2 py-0.5 rounded-md">
                  {faqs.length} {faqs.length === 1 ? 'question' : 'questions'}
                </span>
              </div>
              <div className="px-6">
                {faqs.map(({ q, a }) => (
                  <AccordionItem key={q} q={q} a={a} />
                ))}
              </div>
            </div>
          ))
        )}

        {/* Still need help? */}
        <div className="bg-primary/5 border border-primary/15 rounded-2xl p-8 text-center">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <FiMail size={20} className="text-primary" />
          </div>
          <h3 className="text-lg font-extrabold text-text mb-2">Still need help?</h3>
          <p className="text-sm text-muted mb-5 max-w-sm mx-auto leading-relaxed">
            Can't find what you're looking for? Our team is happy to assist you directly.
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-on-primary font-bold rounded-xl hover:bg-primary-hover transition text-sm"
          >
            <FiMail size={14} />
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;
