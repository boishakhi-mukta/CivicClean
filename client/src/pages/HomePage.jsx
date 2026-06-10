import { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../api/axiosInstance';
import { Fade, Slide } from 'react-awesome-reveal';
import { Typewriter } from 'react-simple-typewriter';
import { FiTrash2, FiAlertTriangle, FiPenTool, FiMap } from 'react-icons/fi';
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
      <span
        className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 ${
          isOpen ? 'bg-primary text-on-primary rotate-45' : 'bg-surface-alt text-muted'
        }`}
        aria-hidden="true"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </span>
    </button>
    <div
      className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
    >
      <div className="overflow-hidden">
        <p className="px-6 pb-5 text-sm text-muted leading-relaxed">{item.a}</p>
      </div>
    </div>
  </div>
);

const FAQ = () => {
  const [openIdx, setOpenIdx] = useState(null);
  const toggle = useCallback((i) => setOpenIdx(prev => prev === i ? null : i), []);

  const half = Math.ceil(FAQ_ITEMS.length / 2);
  const col1 = FAQ_ITEMS.slice(0, half);
  const col2 = FAQ_ITEMS.slice(half);

  return (
    <section className="py-20 bg-surface-alt transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <Fade direction="up" triggerOnce>
            <span className="inline-block text-sm font-bold uppercase tracking-widest text-primary mb-3">FAQ</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-text mb-4">Frequently Asked Questions</h2>
            <p className="text-muted max-w-2xl mx-auto">
              Everything you need to know about CivicClean. Can't find an answer? Reach out to our team.
            </p>
          </Fade>
        </div>

        <Fade direction="up" triggerOnce>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-3">
              {col1.map((item, i) => (
                <AccordionItem
                  key={i}
                  item={item}
                  isOpen={openIdx === i}
                  onToggle={() => toggle(i)}
                />
              ))}
            </div>
            <div className="space-y-3">
              {col2.map((item, i) => (
                <AccordionItem
                  key={half + i}
                  item={item}
                  isOpen={openIdx === half + i}
                  onToggle={() => toggle(half + i)}
                />
              ))}
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
    { name: 'Garbage',               Icon: FiTrash2,       query: 'Garbage' },
    { name: 'Illegal Construction',  Icon: FiPenTool,      query: 'Illegal Construction' },
    { name: 'Broken Public Property',Icon: FiAlertTriangle,query: 'Broken Public Property' },
    { name: 'Road Damage',           Icon: FiMap,          query: 'Road Damage' },
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
            <Fade direction="up">
              <h2 className="text-3xl md:text-4xl font-bold text-text mb-4">Report by Category</h2>
              <p className="text-muted max-w-2xl mx-auto">Select a specific issue category to view related complaints or report a new one in your neighborhood.</p>
            </Fade>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <Fade cascade damping={0.1}>
              {categories.map(({ name, Icon, query }) => (
                <Link
                  key={name}
                  to={`/explore?category=${encodeURIComponent(query)}`}
                  className="bg-surface p-8 rounded-2xl shadow-lg hover:shadow-2xl transition duration-300 flex flex-col items-center text-center group border border-border"
                >
                  <div className="p-4 rounded-full bg-primary group-hover:scale-110 transition-transform duration-300">
                    <Icon className="text-4xl text-on-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-text mt-6">{name}</h3>
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
            <Fade direction="left">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-text mb-4">Latest Resolved Issues</h2>
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
      <section className="py-20 bg-surface-alt transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Fade direction="up" triggerOnce>
              <h2 className="text-3xl md:text-4xl font-bold text-text mb-4">How It Works</h2>
              <p className="text-muted max-w-2xl mx-auto">
                From report to resolution — a simple, transparent process that keeps everyone in the loop.
              </p>
            </Fade>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Fade cascade damping={0.1} triggerOnce>
              {[
                { step: '01', icon: '📸', title: 'Submit a Report',         desc: 'Citizens submit an issue with a title, description, photo, and location. Takes less than a minute.' },
                { step: '02', icon: '🔍', title: 'Admin Reviews & Assigns', desc: 'An admin reviews the report and assigns it to the right government staff member.' },
                { step: '03', icon: '🛠️', title: 'Staff Takes Action',      desc: 'The assigned staff verifies the issue on-site and starts working on the fix.' },
                { step: '04', icon: '📊', title: 'Track Progress',           desc: 'The issue moves through Pending → In-Progress → Resolved → Closed with live timeline updates.' },
                { step: '05', icon: '🔔', title: 'Stay Updated',             desc: 'Citizens can check the status and full timeline of their reported issue at any time.' },
                { step: '06', icon: '⭐', title: 'Premium Priority',         desc: 'Premium citizens can boost issue priority for faster resolution and submit unlimited reports.' },
              ].map(({ step, icon, title, desc }) => (
                <div
                  key={step}
                  className="relative bg-surface rounded-2xl p-8 shadow-md border border-border hover:shadow-xl transition-shadow duration-300"
                >
                  <span className="absolute top-4 right-4 text-xs font-bold text-border tracking-widest">{step}</span>
                  <div className="text-4xl mb-4">{icon}</div>
                  <h3 className="text-lg font-bold text-text mb-2">{title}</h3>
                  <p className="text-sm text-muted leading-relaxed">{desc}</p>
                </div>
              ))}
            </Fade>
          </div>
        </div>
      </section>

      {/* 6. PLATFORM FEATURES */}
      <section className="py-20 bg-bg transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Fade direction="up" triggerOnce>
              <h2 className="text-3xl md:text-4xl font-bold text-text mb-4">Platform Features</h2>
              <p className="text-muted max-w-2xl mx-auto">
                Everything you need to report, manage, and resolve public infrastructure issues efficiently.
              </p>
            </Fade>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Fade cascade damping={0.1} triggerOnce>
              {[
                { icon: '📝', title: 'Easy Issue Reporting',    desc: 'Submit reports with photos, title, category, and precise location in under a minute.',                            color: 'from-blue-500 to-blue-600' },
                { icon: '🗺️', title: 'Interactive Map View',    desc: 'Visualize all reported issues on an interactive map to understand problem hotspots.',                             color: 'from-green-500 to-green-600' },
                { icon: '📊', title: 'Live Status Tracking',    desc: 'Follow every issue through its lifecycle with a full audit timeline — Pending to Closed.',                        color: 'from-purple-500 to-purple-600' },
                { icon: '👥', title: 'Role-Based Dashboards',   desc: 'Separate dashboards for Citizens, Staff, and Admins — each tailored to their workflow.',                          color: 'from-amber-500 to-amber-600' },
                { icon: '⚡', title: 'Priority Boosting',       desc: 'Citizens can pay 100 kr to boost an issue to high priority for faster government response.',                       color: 'from-red-500 to-red-600' },
                { icon: '🌟', title: 'Premium Membership',      desc: 'Unlock unlimited issue reporting and priority support with a one-time 1,000 kr subscription.',                    color: 'from-primary to-primary-hover' },
              ].map(({ icon, title, desc, color }) => (
                <div
                  key={title}
                  className="bg-surface rounded-2xl shadow-md border border-border overflow-hidden hover:shadow-xl transition-shadow duration-300"
                >
                  <div className={`bg-gradient-to-r ${color} p-5`}>
                    <span className="text-3xl">{icon}</span>
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-text mb-2">{title}</h3>
                    <p className="text-sm text-muted leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </Fade>
          </div>
        </div>
      </section>

      {/* 7. FAQ */}
      <FAQ />

      {/* 8. CTA */}
      <section className="bg-primary py-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-on-primary/5 blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-on-primary/10 blur-3xl" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <Slide direction="up">
            <h2 className="text-4xl md:text-5xl font-extrabold text-on-primary mb-6">
              Ready to Make a Difference?
            </h2>
            <p className="text-xl text-on-primary/80 mb-10 max-w-2xl mx-auto">
              Join thousands of community members actively making their neighborhoods cleaner, safer, and more beautiful. Every report counts.
            </p>

            {!currentUser ? (
              <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                <Link
                  to="/register"
                  className="px-8 py-4 w-full sm:w-auto bg-on-primary text-primary font-bold rounded-lg hover:bg-on-primary/90 transition shadow-lg text-lg"
                >
                  Join the Community
                </Link>
                <span className="text-on-primary/50">or</span>
                <Link
                  to="/login"
                  className="px-8 py-4 w-full sm:w-auto border-2 border-on-primary/60 text-on-primary font-bold rounded-lg hover:bg-on-primary/10 transition shadow-lg text-lg"
                >
                  Sign In
                </Link>
              </div>
            ) : (
              <Link
                to="/dashboard/citizen/report-issue"
                className="inline-block px-10 py-5 bg-on-primary text-primary font-bold rounded-lg hover:bg-on-primary/90 transition shadow-lg text-xl transform hover:-translate-y-1"
              >
                Report an Issue Now
              </Link>
            )}
          </Slide>
        </div>
      </section>

    </div>
  );
};

export default HomePage;
