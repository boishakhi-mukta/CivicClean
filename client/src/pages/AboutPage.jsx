// ─────────────────────────────────────────────────────────────────────────────
// AboutPage.jsx — The "About CivicClean" marketing page.
//
// Sections on this page (top to bottom):
//   1. Hero banner — large headline with live animated counters that count
//      up to the real platform stats (total users, issues reported, resolved).
//      useCountUp() runs an animation that eases the number from 0 to the
//      real value so it looks like a live ticking counter when you scroll past.
//   2. Mission statement — a blockquote + four capability highlights.
//   3. How it works — a 3-step process: Citizens Report → Admin Reviews → Staff Resolves.
//   4. Core Values carousel — a full-width carousel showing all 6 platform values
//      (Transparency, Community First, etc.). Auto-advances every 4.2 seconds;
//      pauses when the mouse hovers over it. Arrow + dot navigation also work.
//   5. Who uses CivicClean — three role cards (Citizen, Staff, Admin) listing
//      each role's capabilities.
//   6. CTA (call to action) — buttons to register or browse issues.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Fade } from 'react-awesome-reveal';
import {
  FiCheckCircle, FiUsers, FiMapPin, FiShield, FiStar, FiHeart,
  FiArrowRight, FiActivity, FiZap, FiFileText, FiEye, FiAward,
  FiChevronLeft, FiChevronRight,
} from 'react-icons/fi';
import axiosInstance from '../api/axiosInstance';


/* ── Values data ───────────────────────────────────────────────── */
const VALUES = [
  {
    Icon: FiShield,
    title: 'Transparency',
    desc: 'Every issue report, status change, and resolution is visible and auditable by all stakeholders — no black boxes, no hidden actions.',
    bg: '#1b3a2a',
    stripe: '#2e5e40',
  },
  {
    Icon: FiUsers,
    title: 'Community First',
    desc: 'We build tools that empower every citizen — not just the tech-savvy — to participate actively in civic life.',
    bg: '#2c3e1e',
    stripe: '#4a6434',
  },
  {
    Icon: FiCheckCircle,
    title: 'Accountability',
    desc: 'Staff assignments, timelines, and resolution history hold every actor accountable to the community they serve.',
    bg: '#1a3030',
    stripe: '#2a5050',
  },
  {
    Icon: FiStar,
    title: 'Excellence',
    desc: 'We continuously refine the platform based on real community feedback and the evolving needs of civic life.',
    bg: '#3a2e14',
    stripe: '#5c4a22',
  },
  {
    Icon: FiHeart,
    title: 'Civic Pride',
    desc: 'Clean, well-maintained public spaces build pride, trust, and stronger neighbourhoods for everyone who lives there.',
    bg: '#1e1e2e',
    stripe: '#2e2e4e',
  },
  {
    Icon: FiZap,
    title: 'Local Impact',
    desc: 'Every report stays local — directly addressing real issues in real neighbourhoods where people live and work.',
    bg: '#2a2014',
    stripe: '#453318',
  },
];

/* ── Count-up hook ─────────────────────────────────────────────── */
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

/* ── Page ──────────────────────────────────────────────────────── */
const AboutPage = () => {
  useEffect(() => { document.title = 'CivicClean | About'; }, []);
  const [activeValue, setActiveValue] = useState(0);
  const autoPlayRef = useRef(null);

  const goTo = (idx) => setActiveValue((idx + VALUES.length) % VALUES.length);

  const startAutoPlay = () => {
    autoPlayRef.current = setInterval(() => {
      setActiveValue(v => (v + 1) % VALUES.length);
    }, 4200);
  };
  const stopAutoPlay = () => clearInterval(autoPlayRef.current);

  useEffect(() => {
    startAutoPlay();
    return () => stopAutoPlay();
  }, []);

  const { data: stats = { totalUsers: 0, issuesReported: 0, issuesResolved: 0 } } = useQuery({
    queryKey: ['homeStats'],
    queryFn: async () => (await axiosInstance.get('/stats')).data,
    staleTime: 5 * 60 * 1000,
  });

  const totalUsers     = useCountUp(stats.totalUsers);
  const issuesReported = useCountUp(stats.issuesReported);
  const issuesResolved = useCountUp(stats.issuesResolved);

  return (
    <div className="bg-bg transition-colors duration-200">

      {/* ── 1. HERO ── */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden bg-primary">
        {/* Decorative circles */}
        <div className="absolute -top-32 -right-32 w-[480px] h-[480px] rounded-full bg-on-primary/5 pointer-events-none" />
        <div className="absolute top-1/2 -translate-y-1/2 -right-16 w-72 h-72 rounded-full bg-on-primary/5 pointer-events-none" />
        <div className="absolute -bottom-24 left-1/3 w-96 h-96 rounded-full bg-on-primary/5 pointer-events-none" />
        <div className="absolute top-20 left-8 w-32 h-32 rounded-full border border-on-primary/10 pointer-events-none" />
        <div className="absolute bottom-16 right-1/4 w-20 h-20 rounded-full border border-on-primary/10 pointer-events-none" />

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 w-full">
          <div className="max-w-4xl">
            <Fade direction="up" cascade damping={0.18} triggerOnce>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-on-primary leading-[1.05] tracking-tight mb-7">
                Building Cleaner<br />
                Cities,{' '}
                <span className="relative inline-block">
                  Together
                  <span className="absolute bottom-1 left-0 right-0 h-[3px] bg-on-primary/40 rounded-full" />
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-on-primary/70 max-w-2xl leading-relaxed mb-10 font-light">
                CivicClean connects citizens, government staff, and administrators to report,
                track, and resolve public infrastructure issues — transparently and efficiently.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/explore"
                  className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-on-primary text-primary font-bold rounded-xl hover:bg-on-primary/90 transition-all hover:shadow-2xl hover:-translate-y-0.5 text-base"
                >
                  Explore Issues
                  <FiArrowRight size={18} className="group-hover:translate-x-1 transition-transform duration-200" />
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center px-8 py-4 border-2 border-on-primary/30 text-on-primary font-bold rounded-xl hover:bg-on-primary/10 hover:border-on-primary/50 transition-all text-base"
                >
                  Join the Community
                </Link>
              </div>
            </Fade>
          </div>

          {/* Floating stat pills */}
          <Fade direction="up" triggerOnce delay={400}>
            <div className="flex flex-wrap gap-3 mt-14">
              {[
                { label: 'Registered Citizens', value: totalUsers.toLocaleString() },
                { label: 'Issues Reported',     value: issuesReported.toLocaleString() },
                { label: 'Issues Resolved',     value: issuesResolved.toLocaleString() },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center gap-3 px-5 py-3 bg-on-primary/10 border border-on-primary/20 rounded-2xl backdrop-blur-sm">
                  <span className="text-2xl font-extrabold text-on-primary">{value}</span>
                  <span className="text-xs text-on-primary/60 font-medium leading-tight max-w-[80px]">{label}</span>
                </div>
              ))}
            </div>
          </Fade>
        </div>
      </section>

      {/* ── 2. MISSION ── */}
      <section className="py-24 bg-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Left — statement */}
            <Fade direction="left" triggerOnce>
              <div>
                <span className="inline-block text-xs font-bold uppercase tracking-widest text-primary mb-4">Our Mission</span>
                <blockquote className="text-3xl sm:text-4xl font-extrabold text-text leading-snug mb-6 pl-5 border-l-4 border-primary">
                  "Every citizen deserves clean, safe, and functional public spaces."
                </blockquote>
                <p className="text-muted leading-relaxed text-base">
                  CivicClean was built on that belief. Our platform bridges the gap between
                  community reports and government action — creating accountability at every
                  step so no issue gets ignored and every fix gets tracked.
                </p>
              </div>
            </Fade>

            {/* Right — capability list */}
            <Fade direction="right" triggerOnce>
              <div className="space-y-5">
                {[
                  { Icon: FiFileText, title: 'Instant Reporting',       desc: 'Citizens submit geo-tagged issues with photos in under a minute from any device.' },
                  { Icon: FiEye,      title: 'Full Transparency',        desc: 'Every status change is timestamped and publicly visible — no black boxes.' },
                  { Icon: FiActivity, title: 'Live Progress Tracking',   desc: 'Follow your report through every stage from Pending to Resolved in real time.' },
                  { Icon: FiAward,    title: 'Community Accountability', desc: 'Staff assignments, deadlines, and outcomes are logged and auditable by all.' },
                ].map(({ Icon, title, desc }, idx) => (
                  <Fade key={title} direction="right" triggerOnce delay={idx * 80}>
                    <div className="flex items-start gap-4 group">
                      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                        <Icon size={17} className="text-primary group-hover:text-on-primary transition-colors duration-300" />
                      </div>
                      <div>
                        <h3 className="font-bold text-text text-sm mb-0.5">{title}</h3>
                        <p className="text-sm text-muted leading-relaxed">{desc}</p>
                      </div>
                    </div>
                  </Fade>
                ))}
              </div>
            </Fade>
          </div>
        </div>
      </section>

      {/* ── 4. HOW IT WORKS ── */}
      <section className="py-24 bg-surface-alt">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Fade direction="up" triggerOnce>
              <span className="inline-block text-xs font-bold uppercase tracking-widest text-primary mb-3">The Process</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-text mb-4">From Report to Resolution</h2>
              <p className="text-muted max-w-xl mx-auto">
                A transparent, three-step process that keeps every stakeholder informed at every stage.
              </p>
            </Fade>
          </div>

          <div className="relative">
            {/* Connecting dashed line (desktop) */}
            <div className="hidden md:block absolute top-9 left-[calc(16.67%+28px)] right-[calc(16.67%+28px)] h-px border-t-2 border-dashed border-primary/30 z-0" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative z-10">
              {[
                { step: '01', Icon: FiFileText,    title: 'Citizens Report',  desc: 'Submit an issue with title, photo, category, and location in under 60 seconds — from any device.' },
                { step: '02', Icon: FiEye,         title: 'Admin Reviews',    desc: 'The admin verifies the report, sets priority, and dispatches the right staff member.' },
                { step: '03', Icon: FiCheckCircle, title: 'Staff Resolves',   desc: 'Staff verifies on-site, completes the fix, and marks it resolved. Status updates instantly.' },
              ].map(({ step, Icon, title, desc }, idx) => (
                <Fade key={step} direction="up" triggerOnce delay={idx * 100}>
                  <div className="flex flex-col items-center text-center group">
                    {/* Step circle */}
                    <div className="relative mb-6">
                      <div className="w-[72px] h-[72px] rounded-2xl bg-primary flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <Icon size={28} className="text-on-primary" />
                      </div>
                      <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-surface border-2 border-primary flex items-center justify-center text-[10px] font-black text-primary">
                        {idx + 1}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-text mb-2">{title}</h3>
                    <p className="text-sm text-muted leading-relaxed max-w-xs">{desc}</p>
                  </div>
                </Fade>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. VALUES ── */}
      <section className="py-24 bg-bg overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header */}
          <div className="text-center mb-16">
            <Fade direction="up" triggerOnce>
              <span className="inline-block text-xs font-bold uppercase tracking-widest text-primary mb-3">What We Stand For</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-text mb-4">Our Core Values</h2>
              <p className="text-muted max-w-lg mx-auto text-sm leading-relaxed">
                Six principles that shape how CivicClean operates — from the code we write to the community we serve.
              </p>
            </Fade>
          </div>

          {/* ── Carousel (all screen sizes) ── */}
          <Fade direction="up" triggerOnce>
            <div
              className="relative"
              onMouseEnter={stopAutoPlay}
              onMouseLeave={startAutoPlay}
            >
              {/* Track wrapper — clips overflow */}
              <div className="overflow-hidden rounded-3xl">
                <div
                  className="flex"
                  style={{
                    transform: `translateX(-${activeValue * 100}%)`,
                    transition: 'transform 0.55s cubic-bezier(0.77,0,0.175,1)',
                  }}
                >
                  {VALUES.map((val, i) => {
                    const Icon = val.Icon;
                    return (
                      <div
                        key={val.title}
                        className="flex-shrink-0 w-full relative overflow-hidden"
                        style={{ background: val.bg, minHeight: '340px' }}
                      >
                        {/* Subtle grid texture */}
                        <div
                          className="absolute inset-0 opacity-[0.04] pointer-events-none"
                          style={{
                            backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
                            backgroundSize: '32px 32px',
                          }}
                        />

                        {/* Decorative circles */}
                        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full pointer-events-none" style={{ background: 'rgba(255,255,255,0.04)' }} />
                        <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full pointer-events-none" style={{ background: 'rgba(255,255,255,0.03)' }} />

                        {/* Stripe band */}
                        <div
                          className="absolute inset-x-0 pointer-events-none"
                          style={{ height: '3px', bottom: '80px', background: val.stripe, opacity: 0.6 }}
                        />

                        {/* Card content */}
                        <div className="relative px-10 py-12 flex flex-col sm:flex-row items-start gap-8 h-full">

                          {/* Left: icon + number */}
                          <div className="flex-shrink-0 flex flex-col items-start gap-4">
                            <div
                              className="w-16 h-16 rounded-2xl flex items-center justify-center"
                              style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(4px)' }}
                            >
                              <Icon size={28} className="text-white" />
                            </div>
                            <span className="text-white/20 text-5xl font-black font-mono leading-none select-none">
                              0{i + 1}
                            </span>
                          </div>

                          {/* Right: text */}
                          <div className="flex-1">
                            <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-3">Core Value</p>
                            <h3 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-5 leading-tight">
                              {val.title}
                            </h3>
                            <p className="text-white/65 text-base leading-relaxed max-w-xl">
                              {val.desc}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Arrow buttons */}
              <button
                onClick={() => goTo(activeValue - 1)}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white transition-all duration-200 hover:scale-110 z-10"
                aria-label="Previous"
              >
                <FiChevronLeft size={20} />
              </button>
              <button
                onClick={() => goTo(activeValue + 1)}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white transition-all duration-200 hover:scale-110 z-10"
                aria-label="Next"
              >
                <FiChevronRight size={20} />
              </button>

              {/* Dot navigation */}
              <div className="flex items-center justify-center gap-2 mt-6">
                {VALUES.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goTo(i)}
                    aria-label={`Go to slide ${i + 1}`}
                    className={`rounded-full transition-all duration-300 ${
                      activeValue === i
                        ? 'w-7 h-2.5 bg-primary'
                        : 'w-2.5 h-2.5 bg-border hover:bg-primary/50'
                    }`}
                  />
                ))}
              </div>

              {/* Progress bar */}
              <div className="mt-4 h-0.5 bg-border rounded-full overflow-hidden max-w-xs mx-auto">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-300"
                  style={{ width: `${((activeValue + 1) / VALUES.length) * 100}%` }}
                />
              </div>
            </div>
          </Fade>

        </div>
      </section>

      {/* ── 6. WHO USES IT ── */}
      <section className="py-24 bg-surface-alt">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <Fade direction="up" triggerOnce>
              <span className="inline-block text-xs font-bold uppercase tracking-widest text-primary mb-3">Roles</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-text mb-4">Who Uses CivicClean?</h2>
              <p className="text-muted max-w-xl mx-auto">Three distinct roles, one shared goal — a cleaner, more accountable community.</p>
            </Fade>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                emoji: '🏙️',
                role: 'Citizens',
                tagline: 'Report. Track. Contribute.',
                capabilities: [
                  'Submit geo-tagged issue reports with photos',
                  'Track status from Pending to Resolved',
                  'Contribute to community clean-up budgets',
                  'Boost issues for faster priority review',
                  'Upgrade to Premium for unlimited reporting',
                ],
              },
              {
                emoji: '⚙️',
                role: 'Staff Members',
                tagline: 'Verify. Act. Resolve.',
                capabilities: [
                  'Receive assigned issues with full context',
                  'Verify conditions and status on-site',
                  'Update issue progress in real time',
                  'Mark cases as resolved with notes',
                  'View personal assignment history',
                ],
              },
              {
                emoji: '🛡️',
                role: 'Administrators',
                tagline: 'Oversee. Manage. Monitor.',
                capabilities: [
                  'Review and verify all incoming reports',
                  'Assign issues to trained staff members',
                  'Manage citizen and staff accounts',
                  'Monitor payments and Premium upgrades',
                  'Access full platform analytics',
                ],
              },
            ].map(({ emoji, role, tagline, capabilities }, idx) => (
              <Fade key={role} direction="up" triggerOnce delay={idx * 100}>
                <div className="group bg-surface border border-border rounded-2xl overflow-hidden hover:border-primary/30 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col">
                  {/* Card header */}
                  <div className="bg-primary/5 border-b border-border px-7 pt-8 pb-6">
                    <span className="text-4xl block mb-4">{emoji}</span>
                    <h3 className="text-xl font-extrabold text-text mb-1">{role}</h3>
                    <p className="text-xs font-bold uppercase tracking-widest text-primary">{tagline}</p>
                  </div>
                  {/* Capabilities */}
                  <ul className="px-7 py-6 space-y-3 flex-1">
                    {capabilities.map(cap => (
                      <li key={cap} className="flex items-start gap-3 text-sm text-muted">
                        <FiCheckCircle size={14} className="flex-shrink-0 text-primary mt-0.5" />
                        {cap}
                      </li>
                    ))}
                  </ul>
                </div>
              </Fade>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. CTA ── */}
      <section className="relative py-28 bg-primary overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-on-primary/5 pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-on-primary/5 pointer-events-none" />
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }}
        />

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Fade direction="up" triggerOnce>
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-on-primary/50 mb-5">Get Involved</span>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-on-primary mb-6 leading-tight">
              Ready to Make a<br />Difference?
            </h2>
            <p className="text-on-primary/70 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
              Join thousands of citizens already building a cleaner, more accountable community. Every report counts.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-on-primary text-primary font-bold rounded-xl hover:bg-on-primary/90 transition-all hover:shadow-2xl hover:-translate-y-0.5 text-base"
              >
                Create Free Account
                <FiArrowRight size={18} className="group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
              <Link
                to="/explore"
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-on-primary/30 text-on-primary font-bold rounded-xl hover:bg-on-primary/10 hover:border-on-primary/50 transition-all text-base"
              >
                Browse Issues
              </Link>
            </div>
          </Fade>
        </div>
      </section>

    </div>
  );
};

export default AboutPage;
