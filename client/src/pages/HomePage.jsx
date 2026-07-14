// ─────────────────────────────────────────────────────────────────────────────
// HomePage.jsx — The public-facing landing page shown at /.
//
// This is the "shop window" of CivicClean — the first thing a visitor sees
// before logging in. It has 8 major sections stacked vertically:
//
//   1. Hero Banner (slideshow) — three rotating banner slides auto-advance
//      every 4 seconds. Each slide has a background image, headline, and a
//      call-to-action button. The useCountUp hook animates the stat numbers
//      (e.g., "1,200 issues resolved") when they scroll into view.
//
//   2. How It Works — a 3-step explainer with icons and a hover-lift card effect.
//
//   3. Feature Showcase (tabs) — three topic tabs (Reporting, Tracking, Community).
//      Clicking a tab swaps the content panel. On mobile, tabs shrink to a
//      horizontal scroll row.
//
//   4. Live Issue Feed — fetches the 6 most recent open issues from the API
//      and shows them as IssueCard components. Requires the user to be logged
//      in; if not, shows a "Sign In to View" prompt.
//
//   5. Top Contributors (Leaderboard preview) — fetches /users/leaderboard and
//      shows the top 5 contributors with ranking badges.
//
//   6. Testimonials — static quote cards from fictional satisfied citizens.
//
//   7. FAQ Accordion — 8 common questions in AccordionItem components. Each
//      item expands/collapses with an animated arrow. Clicking one question
//      closes any previously open one (accordion behaviour).
//
//   8. Call-to-Action Banner — a bold full-width section prompting visitors
//      to register.
//
// useCountUp(target, duration, trigger):
//   Animates a number from 0 up to `target` over `duration` milliseconds.
//   Only starts counting when `trigger` is true (i.e., the element is visible).
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../api/axiosInstance';
import { Fade, Slide } from 'react-awesome-reveal';
import { Typewriter } from 'react-simple-typewriter';
import { FiArrowUpRight, FiFileText, FiMap, FiActivity, FiUsers, FiZap, FiStar } from 'react-icons/fi';
import { FaTrashCan, FaHelmetSafety, FaWrench, FaRoad } from 'react-icons/fa6';
import { AuthContext } from '../context/AuthContext';
import IssueCard, { IssueCardSkeleton } from '../components/IssueCard';

const useCountUp = (target, duration = 2000) => {
  const [count, setCount] = useState(0);
  const triggered = useRef(false);
  useEffect(() => {
    if (!target || triggered.current) return;
    triggered.current = true;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setCount(Math.round(eased * target));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);
  return count;
};

const FAQ_ITEMS = [
  {
    q: 'What is CivicClean?',
    a: 'CivicClean is a community platform that lets citizens report public infrastructure issues — garbage, road damage, broken property, illegal construction — and track them through to resolution. Admins and staff work together to verify and fix each report.',
  },
  {
    q: 'Do I need an account to report an issue?',
    a: 'Yes, a free account is required to submit reports so we can keep you updated on progress. You can browse and view all existing issues without signing in.',
  },
  {
    q: 'How long does it take for an issue to be resolved?',
    a: 'Resolution time varies by severity and location. Once submitted, an admin reviews the report within 1–2 business days and assigns it to a staff member. You can track the live status — Pending → In Progress → Resolved — at any time.',
  },
  {
    q: 'What is the Premium subscription?',
    a: 'Free accounts can submit up to 3 reports. A one-time Premium subscription (1,000 kr) removes that limit, giving you unlimited reporting and the ability to boost issues for faster review.',
  },
  {
    q: 'What does "Boosting" an issue do?',
    a: "Boosting (100 kr) flags your issue for priority review by the admin team. Boosted issues appear at the top of the queue and receive a visual badge so the community can see they're high priority.",
  },
  {
    q: 'Can I contribute to an issue I did not report?',
    a: 'Yes! Any logged-in citizen can make a financial contribution toward the clean-up budget of any open issue. Contributions are tracked and visible on the issue detail page.',
  },
  {
    q: 'Who reviews and resolves the reports?',
    a: 'Administrators review incoming reports, verify them, and assign them to trained staff members. Staff confirm the issue on-site and mark it resolved once the work is complete.',
  },
  {
    q: 'Is my personal information kept private?',
    a: 'Your email address is used only for authentication and notifications. It is never displayed publicly. Only your display name and avatar appear alongside your reports.',
  },
];

const AccordionItem = ({ item, isOpen, onToggle }) => (
  <div className={`border border-border rounded-xl overflow-hidden transition-colors duration-200 ${isOpen ? 'bg-surface' : 'bg-surface hover:bg-surface-alt'}`}>
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between px-6 py-5 text-left gap-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
      aria-expanded={isOpen}
    >
      <span className="font-semibold text-text text-sm sm:text-base">{item.q}</span>
      <svg
        className={`flex-shrink-0 w-5 h-5 text-muted transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary' : ''}`}
        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </button>
    <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
      <div className="overflow-hidden">
        <p className="px-6 pb-5 text-sm text-muted leading-relaxed">{item.a}</p>
      </div>
    </div>
  </div>
);

const FAQ = () => {
  const [openIdx, setOpenIdx] = useState(null);
  const toggle = useCallback((i) => setOpenIdx(prev => prev === i ? null : i), []);

  return (
    <section className="py-20 bg-surface-alt transition-colors duration-200">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <Fade direction="up" triggerOnce>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-text mb-4">Frequently Asked Questions</h2>
            <p className="text-muted max-w-2xl mx-auto">
              Everything you need to know about CivicClean. Can't find an answer? Reach out to our team.
            </p>
          </Fade>
        </div>

        <Fade direction="up" triggerOnce>
          <div className="space-y-3">
            {FAQ_ITEMS.map((item, i) => (
              <AccordionItem
                key={i}
                item={item}
                isOpen={openIdx === i}
                onToggle={() => toggle(i)}
              />
            ))}
          </div>
        </Fade>
      </div>
    </section>
  );
};

const PLATFORM_FEATURES = [
  {
    Icon: FiFileText,
    title: 'Easy Issue Reporting',
    tag: 'Core',
    short: 'Submit in under a minute',
    desc: 'Citizens can report any public infrastructure problem — with a photo, title, category, and precise location — right from their phone or desktop. The whole process takes under a minute and your report is instantly visible to admins.',
  },
  {
    Icon: FiMap,
    title: 'Interactive Map View',
    tag: 'Core',
    short: 'See every issue on a live map',
    desc: 'Every reported issue is plotted on an interactive map in real time. Spot problem hotspots in your neighbourhood, understand which areas have the most activity, and navigate directly to any issue from the map.',
  },
  {
    Icon: FiActivity,
    title: 'Live Status Tracking',
    tag: 'Core',
    short: 'Full audit trail from report to close',
    desc: "Follow every issue through its complete lifecycle — Pending → In Progress → Working → Resolved. Each stage is timestamped and logged so there's a transparent, traceable record from the moment a report is submitted.",
  },
  {
    Icon: FiUsers,
    title: 'Role-Based Dashboards',
    tag: 'Access',
    short: 'Tailored portals for every role',
    desc: 'Citizens, Staff, and Admins each get a dedicated dashboard built around their workflow. Citizens track their reports; Staff manage assigned issues; Admins oversee the entire platform, users, and payments.',
  },
  {
    Icon: FiZap,
    title: 'Priority Boosting',
    tag: 'Premium',
    short: 'Move your issue to the front of the queue',
    desc: 'Pay 100 kr to boost any issue to high priority. Boosted issues are flagged with a visible badge and surface first in the admin review queue — ideal for urgent problems that need immediate attention.',
  },
  {
    Icon: FiStar,
    title: 'Premium Membership',
    tag: 'Premium',
    short: 'Unlimited reporting, one payment',
    desc: 'Free accounts can submit up to 3 reports. A single one-time 1,000 kr Premium subscription removes that cap entirely — unlimited reports, priority support, and access to issue boosting, forever.',
  },
];

const FeatureShowcase = () => {
  const [active, setActive] = useState(0);
  const feat = PLATFORM_FEATURES[active];

  return (
    <section className="py-24 bg-bg transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center mb-14">
          <Fade direction="up" triggerOnce>
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-primary mb-3">Features</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-text mb-4">Everything in One Platform</h2>
            <p className="text-muted max-w-xl mx-auto">
              A complete civic toolkit — from instant reporting to role-based dashboards, live tracking, and priority resolution.
            </p>
          </Fade>
        </div>

        <Fade direction="up" triggerOnce delay={100}>
          <div className="flex flex-col lg:flex-row gap-3 lg:gap-6 bg-surface border border-border rounded-2xl shadow-sm overflow-hidden">

            {/* Left — tab nav */}
            <div className="lg:w-60 xl:w-72 flex-shrink-0 flex flex-row lg:flex-col overflow-x-auto lg:overflow-visible gap-0 border-b lg:border-b-0 lg:border-r border-border p-3 lg:p-4">
              {PLATFORM_FEATURES.map((f, idx) => (
                <button
                  key={f.title}
                  onClick={() => setActive(idx)}
                  className={`group flex-shrink-0 flex items-center gap-3 px-3.5 py-3 rounded-xl text-left w-full transition-all duration-200 ${
                    active === idx
                      ? 'bg-primary text-on-primary'
                      : 'text-muted hover:text-text hover:bg-surface-alt'
                  }`}
                >
                  <f.Icon size={15} className="flex-shrink-0" />
                  <span className="text-sm font-semibold leading-tight whitespace-nowrap lg:whitespace-normal">{f.title}</span>
                  {active === idx && (
                    <FiArrowUpRight size={13} className="ml-auto flex-shrink-0 opacity-70 hidden lg:block" />
                  )}
                </button>
              ))}
            </div>

            {/* Right — detail panel */}
            <div className="flex-1 p-8 lg:p-10 flex flex-col justify-between min-h-[340px]" key={active}>
              <div>
                {/* Tag + icon */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-primary/10 rounded-xl">
                    <feat.Icon size={22} className="text-primary" />
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                    {feat.tag}
                  </span>
                </div>

                {/* Short headline */}
                <p className="text-xs font-bold uppercase tracking-widest text-muted mb-2">{feat.short}</p>

                {/* Title */}
                <h3 className="text-2xl font-extrabold text-text mb-4 leading-snug">{feat.title}</h3>

                {/* Description */}
                <p className="text-muted leading-relaxed max-w-lg">{feat.desc}</p>
              </div>

              {/* Bottom step indicator */}
              <div className="flex items-center gap-2 mt-8">
                {PLATFORM_FEATURES.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActive(idx)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      active === idx ? 'w-8 bg-primary' : 'w-3 bg-border hover:bg-muted'
                    }`}
                    aria-label={`Go to feature ${idx + 1}`}
                  />
                ))}
                <span className="ml-3 text-xs text-muted font-medium">
                  {active + 1} / {PLATFORM_FEATURES.length}
                </span>
              </div>
            </div>
          </div>
        </Fade>
      </div>
    </section>
  );
};

const HomePage = () => {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [
    {
      title: 'Report Garbage Issues',
      emoji: '🗑️',
      subtitle: 'See a pile of trash? Don\'t ignore it. Report it instantly and help us maintain a clean city.',
      ctaText: 'Report Now',
      ctaLink: '/dashboard/citizen/report-issue',
      bgImage: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1920&q=85',
    },
    {
      title: 'Join Clean Drive Events',
      emoji: '🤝',
      subtitle: 'Volunteer for community-driven cleanliness events and make a tangible impact in your neighborhood.',
      ctaText: 'Volunteer Today',
      ctaLink: '/register',
      bgImage: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=1920&q=85',
    },
    {
      title: 'Build a Greener Community',
      emoji: '🌱',
      subtitle: 'Track issues, make a difference, and help build a cleaner community.',
      ctaText: 'Explore Issues',
      ctaLink: '/explore',
      bgImage: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1920&q=85',
    },
  ];

  useEffect(() => {
    document.title = 'CivicClean | Home';
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 4000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const { data: stats = { totalUsers: 0, issuesReported: 0, issuesResolved: 0, totalContributions: 0 } } = useQuery({
    queryKey: ['homeStats'],
    queryFn: async () => (await axiosInstance.get('/stats')).data,
    staleTime: 5 * 60 * 1000,
  });

  const animatedUsers         = useCountUp(stats.totalUsers);
  const animatedReported      = useCountUp(stats.issuesReported);
  const animatedResolved      = useCountUp(stats.issuesResolved);
  const animatedContributions = useCountUp(stats.totalContributions);

  const { data: recentIssues = [], isLoading: loadingIssues } = useQuery({
    queryKey: ['homeResolvedIssues'],
    queryFn: async () => (await axiosInstance.get('/issues?status=resolved&limit=6')).data.issues,
  });

  const categories = [
    {
      name: 'Garbage',
      query: 'Garbage',
      Icon: FaTrashCan,
      description: 'Overflowing bins, illegal dumping, littered streets and public spaces.',
      iconBg: 'bg-primary/10',
      iconColor: 'text-primary',
      bar: 'from-primary to-primary-hover',
      ring: 'hover:ring-primary/20',
    },
    {
      name: 'Illegal Construction',
      query: 'Illegal Construction',
      Icon: FaHelmetSafety,
      description: 'Unauthorized building works, code violations, unsafe structures.',
      iconBg: 'bg-primary/10',
      iconColor: 'text-primary',
      bar: 'from-primary to-primary-hover',
      ring: 'hover:ring-primary/20',
    },
    {
      name: 'Broken Public Property',
      query: 'Broken Public Property',
      Icon: FaWrench,
      description: 'Damaged benches, broken streetlights, vandalized public infrastructure.',
      iconBg: 'bg-primary/10',
      iconColor: 'text-primary',
      bar: 'from-primary to-primary-hover',
      ring: 'hover:ring-primary/20',
    },
    {
      name: 'Road Damage',
      query: 'Road Damage',
      Icon: FaRoad,
      description: 'Potholes, cracked pavement, faded road markings, unsafe intersections.',
      iconBg: 'bg-primary/10',
      iconColor: 'text-primary',
      bar: 'from-primary to-primary-hover',
      ring: 'hover:ring-primary/20',
    },
  ];

  return (
    <div className="bg-bg transition-colors duration-200">

      {/* 1. BANNER */}
      <section className="relative h-[65vh] min-h-[500px] max-h-[780px] w-full overflow-hidden">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${slide.bgImage})` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary/40" />
            </div>

            <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-start text-white">
              <Fade direction="up" cascade damping={0.2} triggerOnce={false} key={currentSlide}>
                <span className="text-5xl sm:text-6xl md:text-8xl mb-4 sm:mb-6">{slide.emoji}</span>
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-3 sm:mb-4 leading-tight max-w-3xl">
                  {index === 0 ? (
                    <Typewriter
                      words={[slide.title]}
                      loop={1}
                      cursor
                      cursorStyle="_"
                      typeSpeed={70}
                      deleteSpeed={50}
                      delaySpeed={1000}
                    />
                  ) : (
                    slide.title
                  )}
                </h1>
                <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 max-w-2xl text-white/80 font-light">{slide.subtitle}</p>
                <button
                  onClick={() => navigate(slide.ctaLink)}
                  className="px-6 sm:px-8 py-3 sm:py-4 bg-on-primary text-primary text-base sm:text-lg font-bold rounded-xl hover:bg-on-primary/90 transition transform hover:-translate-y-1 hover:shadow-xl"
                >
                  {slide.ctaText}
                </button>
              </Fade>
            </div>
          </div>
        ))}

        <div className="absolute bottom-6 sm:bottom-8 left-0 right-0 z-20 flex justify-center space-x-3">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-3 rounded-full transition-all duration-300 ${
                idx === currentSlide ? 'bg-on-primary w-8' : 'bg-white/50 hover:bg-white w-3'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </section>

      {/* 2. STATS BAR */}
      <section className="bg-primary py-12 border-b-4 border-on-primary/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <Fade cascade damping={0.1}>
              <div className="flex flex-col items-center">
                <span className="text-4xl font-extrabold text-on-primary mb-2">{animatedUsers.toLocaleString()}</span>
                <span className="text-on-primary/70 text-sm uppercase tracking-widest">Total Users</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-4xl font-extrabold text-on-primary mb-2">{animatedReported.toLocaleString()}</span>
                <span className="text-on-primary/70 text-sm uppercase tracking-widest">Issues Reported</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-4xl font-extrabold text-on-primary mb-2">{animatedResolved.toLocaleString()}</span>
                <span className="text-on-primary/70 text-sm uppercase tracking-widest">Issues Resolved</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-4xl font-extrabold text-on-primary mb-2">{animatedContributions.toLocaleString()}</span>
                <span className="text-on-primary/70 text-sm uppercase tracking-widest">Total Contributions</span>
              </div>
            </Fade>
          </div>
        </div>
      </section>

      {/* 3. CATEGORIES */}
      <section className="py-20 bg-surface-alt transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Fade direction="up" triggerOnce>
              <span className="inline-block text-xs font-bold uppercase tracking-widest text-primary mb-3">Categories</span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-text mb-4">Report by Category</h2>
              <p className="text-muted max-w-2xl mx-auto">Select a specific issue category to view related complaints or report a new one in your neighborhood.</p>
            </Fade>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Fade cascade damping={0.12} triggerOnce direction="up">
              {categories.map(({ name, Icon, query, description, iconBg, iconColor, bar, ring }) => (
                <Link
                  key={name}
                  to={`/explore?category=${encodeURIComponent(query)}`}
                  className={`group relative bg-surface rounded-2xl border border-border overflow-hidden flex flex-col h-[220px] ring-2 ring-transparent ${ring} hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300`}
                >
                  {/* Sliding accent bar */}
                  <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${bar} origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500`} />

                  {/* Icon row */}
                  <div className="flex items-start justify-between px-6 pt-6 pb-2">
                    <div className={`p-3.5 rounded-xl ${iconBg} transition-transform duration-300 group-hover:scale-110`}>
                      <Icon className={`w-6 h-6 ${iconColor}`} />
                    </div>
                    <FiArrowUpRight
                      size={18}
                      className="text-border group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200"
                    />
                  </div>

                  {/* Text */}
                  <div className="px-6 pb-6 flex flex-col flex-1 justify-end">
                    <h3 className="font-bold text-text text-base mb-1.5 leading-snug">{name}</h3>
                    <p className="text-xs text-muted leading-relaxed line-clamp-2">{description}</p>
                  </div>
                </Link>
              ))}
            </Fade>
          </div>
        </div>
      </section>

      {/* 4. LATEST RESOLVED ISSUES */}
      <section className="py-20 bg-bg transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <Fade direction="left" triggerOnce>
              <div>
                <span className="inline-block text-xs font-bold uppercase tracking-widest text-primary mb-3">Community</span>
                <h2 className="text-3xl md:text-4xl font-extrabold text-text mb-4">Latest Resolved Issues</h2>
                <p className="text-muted">Issues our community has successfully resolved.</p>
              </div>
            </Fade>
            <Fade direction="right">
              <Link to="/explore" className="hidden md:inline-flex items-center text-primary font-bold hover:underline">
                View All Issues &rarr;
              </Link>
            </Fade>
          </div>

          {loadingIssues ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-8">
              {Array.from({ length: 4 }).map((_, i) => (
                <IssueCardSkeleton key={i} />
              ))}
            </div>
          ) : recentIssues.length === 0 ? (
            <div className="text-center py-20 bg-surface-alt rounded-2xl">
              <span className="text-5xl mb-4 block">🎉</span>
              <h3 className="text-2xl font-bold text-text mb-2">No Resolved Issues Yet!</h3>
              <p className="text-muted">Be the first to report and help resolve a community issue.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-8">
              <Fade cascade damping={0.1}>
                {recentIssues.map(issue => (
                  <IssueCard key={issue._id} issue={issue} />
                ))}
              </Fade>
            </div>
          )}

          <div className="mt-10 text-center md:hidden">
            <Link
              to="/explore"
              className="inline-flex px-6 py-3 border-2 border-primary text-primary font-bold rounded-lg hover:bg-primary hover:text-on-primary transition"
            >
              View All Issues
            </Link>
          </div>
        </div>
      </section>

      {/* 5. HOW IT WORKS */}
      <section className="py-24 bg-surface-alt transition-colors duration-200 overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <Fade direction="up" triggerOnce>
              <span className="inline-block text-xs font-bold uppercase tracking-widest text-primary mb-3">Process</span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-text mb-4">How It Works</h2>
              <p className="text-muted max-w-xl mx-auto">
                From report to resolution — a transparent, six-step process that keeps everyone in the loop.
              </p>
            </Fade>
          </div>

          {/* Timeline rail */}
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-[27px] sm:left-1/2 sm:-translate-x-px top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-primary/40 to-transparent" />

            <div className="space-y-0">
              {[
                { step: 1, title: 'Submit a Report',         desc: 'Citizens submit an issue with a title, description, photo, and location. Takes less than a minute.',               icon: '📸' },
                { step: 2, title: 'Admin Reviews & Assigns', desc: 'An admin verifies the report and assigns it to the right government staff member for action.',                             icon: '🔍' },
                { step: 3, title: 'Staff Takes Action',      desc: 'The assigned staff member verifies the issue on-site and begins the physical fix or clean-up.',                            icon: '🛠️' },
                { step: 4, title: 'Track Progress Live',     desc: 'The issue moves through Pending → In Progress → Resolved with a full timestamp audit trail.',                             icon: '📊' },
                { step: 5, title: 'Stay Notified',           desc: 'Citizens can check the live status and complete timeline of every report at any time from their dashboard.',             icon: '🔔' },
                { step: 6, title: 'Premium Priority',        desc: 'Premium citizens can boost issues for faster government response and submit unlimited reports without caps.',             icon: '⭐' },
              ].map(({ step, title, desc, icon }, idx) => {
                const isRight = idx % 2 === 0;
                return (
                  <Fade key={step} direction={isRight ? 'left' : 'right'} triggerOnce delay={idx * 80}>
                    <div className={`relative flex items-start gap-6 pb-12 last:pb-0 ${isRight ? 'sm:flex-row' : 'sm:flex-row-reverse'} flex-row`}>

                      {/* Node dot */}
                      <div className="relative z-10 flex-shrink-0">
                        <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg text-2xl">
                          {icon}
                        </div>
                      </div>

                      {/* Content card */}
                      <div className={`flex-1 bg-surface border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300 ${isRight ? 'sm:mr-8' : 'sm:ml-8'}`}>
                        <span className="inline-block text-[10px] font-black uppercase tracking-widest text-primary mb-1.5">
                          Step {String(step).padStart(2, '0')}
                        </span>
                        <h3 className="text-base font-bold text-text mb-2">{title}</h3>
                        <p className="text-sm text-muted leading-relaxed">{desc}</p>
                      </div>
                    </div>
                  </Fade>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 6. PLATFORM FEATURES */}
      <FeatureShowcase />

      {/* 7. FAQ */}
      <FAQ />

      {/* 8. CTA */}
      <section className="relative py-28 bg-primary overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-on-primary/5 pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-on-primary/5 pointer-events-none" />
        <div className="absolute top-20 left-8 w-32 h-32 rounded-full border border-on-primary/10 pointer-events-none" />
        <div className="absolute bottom-16 right-1/4 w-20 h-20 rounded-full border border-on-primary/10 pointer-events-none" />
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }}
        />

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Slide direction="up" triggerOnce>
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-on-primary/50 mb-5">Get Involved</span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-on-primary mb-6 leading-tight">
              Ready to Make a<br />Difference?
            </h2>
            <p className="text-on-primary/70 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
              Join thousands of community members actively making their neighbourhoods cleaner, safer, and more beautiful. Every report counts.
            </p>

            {!currentUser ? (
              <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                <Link
                  to="/register"
                  className="group inline-flex items-center justify-center gap-2 px-8 py-4 w-full sm:w-auto bg-on-primary text-primary font-bold rounded-xl hover:bg-on-primary/90 transition-all hover:shadow-2xl hover:-translate-y-0.5 text-base"
                >
                  Join the Community
                  <FiArrowUpRight size={18} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center px-8 py-4 w-full sm:w-auto border-2 border-on-primary/30 text-on-primary font-bold rounded-xl hover:bg-on-primary/10 hover:border-on-primary/50 transition-all text-base"
                >
                  Sign In
                </Link>
              </div>
            ) : (
              <Link
                to="/dashboard/citizen/report-issue"
                className="group inline-flex items-center justify-center gap-2 px-10 py-4 bg-on-primary text-primary font-bold rounded-xl hover:bg-on-primary/90 transition-all hover:shadow-2xl hover:-translate-y-0.5 text-lg"
              >
                Report an Issue Now
                <FiArrowUpRight size={20} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
              </Link>
            )}
          </Slide>
        </div>
      </section>

    </div>
  );
};

export default HomePage;
