import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Fade, Slide } from 'react-awesome-reveal';
import { FiCheckCircle, FiUsers, FiMapPin, FiShield, FiStar, FiHeart } from 'react-icons/fi';
import axiosInstance from '../api/axiosInstance';

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

const StatCard = ({ value, label, icon: Icon }) => (
  <div className="flex flex-col items-center p-6 bg-surface rounded-2xl border border-border shadow-sm">
    <div className="p-3 rounded-full bg-primary/10 mb-3">
      <Icon className="text-primary" size={22} />
    </div>
    <span className="text-3xl font-extrabold text-primary">{value.toLocaleString()}</span>
    <span className="text-sm text-muted mt-1 text-center">{label}</span>
  </div>
);

const AboutPage = () => {
  useEffect(() => {
    document.title = 'CivicClean | About';
  }, []);

  const { data: stats = { totalUsers: 0, issuesReported: 0, issuesResolved: 0, totalContributions: 0 } } = useQuery({
    queryKey: ['homeStats'],
    queryFn: async () => (await axiosInstance.get('/stats')).data,
    staleTime: 5 * 60 * 1000,
  });

  const totalUsers        = useCountUp(stats.totalUsers);
  const issuesReported    = useCountUp(stats.issuesReported);
  const issuesResolved    = useCountUp(stats.issuesResolved);
  const totalContributions = useCountUp(stats.totalContributions);

  return (
    <div className="bg-bg transition-colors duration-200">

      {/* HERO */}
      <section className="relative h-[65vh] min-h-[480px] max-h-[780px] w-full overflow-hidden flex items-center">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url(https://images.unsplash.com/photo-1509316785289-025f5b846b35?auto=format&fit=crop&w=1920&q=85)" }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/85 via-primary/70 to-primary/50" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white">
          <Fade direction="up" cascade damping={0.15} triggerOnce>
            <span className="inline-block text-sm font-bold uppercase tracking-widest text-on-primary/70 mb-4 bg-on-primary/10 px-3 py-1 rounded-full">
              About CivicClean
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight max-w-3xl mb-5">
              Building Cleaner Cities,<br />Together
            </h1>
            <p className="text-lg sm:text-xl text-white/80 max-w-2xl mb-8 font-light leading-relaxed">
              CivicClean connects citizens, government staff, and administrators to report, track,
              and resolve public infrastructure issues — transparently and efficiently.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/explore"
                className="inline-flex items-center justify-center px-8 py-4 bg-on-primary text-primary font-bold rounded-xl hover:bg-on-primary/90 transition-all hover:shadow-xl hover:-translate-y-0.5"
              >
                Explore Issues
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-on-primary/50 text-on-primary font-bold rounded-xl hover:bg-on-primary/10 transition-all"
              >
                Join the Community
              </Link>
            </div>
          </Fade>
        </div>
      </section>

      {/* MISSION */}
      <section className="py-20 bg-surface-alt">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Fade direction="up" triggerOnce>
            <span className="inline-block text-sm font-bold uppercase tracking-widest text-primary mb-4">Our Mission</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-text mb-6">
              Empowering Citizens to Take Action
            </h2>
            <p className="text-lg text-muted leading-relaxed">
              CivicClean was built on a single belief: every citizen deserves clean, safe, and functional public spaces.
              Our platform bridges the gap between community reports and government action, creating accountability at
              every step — so no issue gets ignored, and every fix gets tracked.
            </p>
          </Fade>
        </div>
      </section>

      {/* LIVE STATS */}
      <section className="py-16 bg-bg">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Fade direction="up" triggerOnce>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-text text-center mb-10">Platform at a Glance</h2>
          </Fade>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <Fade cascade damping={0.1} triggerOnce>
              <StatCard value={totalUsers}         label="Registered Citizens"   icon={FiUsers}    />
              <StatCard value={issuesReported}     label="Issues Reported"       icon={FiMapPin}   />
              <StatCard value={issuesResolved}     label="Issues Resolved"       icon={FiCheckCircle} />
              <StatCard value={totalContributions} label="Community Contributions" icon={FiHeart}  />
            </Fade>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 bg-surface-alt">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Fade direction="up" triggerOnce>
              <span className="inline-block text-sm font-bold uppercase tracking-widest text-primary mb-3">The Process</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-text mb-4">From Report to Resolution</h2>
              <p className="text-muted max-w-2xl mx-auto">
                A transparent, three-step process that keeps citizens informed at every stage.
              </p>
            </Fade>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-12 left-1/4 right-1/4 h-0.5 bg-border z-0" />
            <Fade cascade damping={0.15} triggerOnce>
              {[
                { step: '01', emoji: '📸', title: 'Citizens Report',   desc: 'Submit an issue with title, photo, category, and location. Takes under 60 seconds.' },
                { step: '02', emoji: '🔍', title: 'Admin Reviews',     desc: 'Admin verifies the report, assigns priority, and dispatches a staff member.' },
                { step: '03', emoji: '✅', title: 'Staff Resolves',    desc: 'Staff verifies on-site, marks the issue resolved. Status updates in real time.' },
              ].map(({ step, emoji, title, desc }) => (
                <div key={step} className="relative bg-surface rounded-2xl p-8 border border-border shadow-sm text-center z-10">
                  <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-on-primary font-black text-lg mx-auto mb-4">
                    {step}
                  </div>
                  <div className="text-4xl mb-3">{emoji}</div>
                  <h3 className="text-lg font-bold text-text mb-2">{title}</h3>
                  <p className="text-sm text-muted leading-relaxed">{desc}</p>
                </div>
              ))}
            </Fade>
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section className="py-20 bg-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <Fade direction="up" triggerOnce>
              <span className="inline-block text-sm font-bold uppercase tracking-widest text-primary mb-3">What We Stand For</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-text">Our Core Values</h2>
            </Fade>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Fade cascade damping={0.1} triggerOnce>
              {[
                { icon: FiShield,       color: 'bg-info/10 text-info',       title: 'Transparency',    desc: 'Every issue report, status change, and resolution is visible and auditable by all stakeholders.' },
                { icon: FiUsers,        color: 'bg-success/10 text-success',  title: 'Community First', desc: 'We build tools that empower every citizen — not just the tech-savvy — to participate in civic life.' },
                { icon: FiCheckCircle,  color: 'bg-primary/10 text-primary',  title: 'Accountability',  desc: 'Staff assignments, timelines, and resolution history hold every actor accountable to the community.' },
                { icon: FiStar,         color: 'bg-warning/10 text-warning',  title: 'Excellence',      desc: 'We continuously improve the platform based on real community feedback and evolving civic needs.' },
                { icon: FiHeart,        color: 'bg-danger/10 text-danger',    title: 'Civic Pride',     desc: 'We believe clean, well-maintained public spaces build pride, trust, and stronger neighborhoods.' },
                { icon: FiMapPin,       color: 'bg-info/10 text-info',        title: 'Local Impact',    desc: 'Every report and contribution stays local — addressing real issues in real neighborhoods.' },
              ].map(({ icon: Icon, color, title, desc }) => (
                <div key={title} className="flex gap-4 p-6 bg-surface rounded-2xl border border-border shadow-sm">
                  <div className={`p-3 rounded-xl ${color} flex-shrink-0 self-start`}>
                    <Icon size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-text mb-1">{title}</h3>
                    <p className="text-sm text-muted leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </Fade>
          </div>
        </div>
      </section>

      {/* WHO USES IT */}
      <section className="py-20 bg-surface-alt">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <Fade direction="up" triggerOnce>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-text mb-4">Who Uses CivicClean?</h2>
              <p className="text-muted max-w-2xl mx-auto">Three roles, one goal: a cleaner community.</p>
            </Fade>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Fade cascade damping={0.1} triggerOnce>
              {[
                { emoji: '🏙️', role: 'Citizens',      badge: 'bg-primary/10 text-primary',  desc: 'Report issues, track status, contribute to clean-up funds, and upgrade to Premium for priority handling.' },
                { emoji: '⚙️', role: 'Staff Members', badge: 'bg-info/10 text-info',         desc: 'Receive assigned issues, verify on-site conditions, update progress, and mark cases as resolved.' },
                { emoji: '🛡️', role: 'Administrators',badge: 'bg-warning/10 text-warning',   desc: 'Oversee all reports, manage users and staff accounts, review payment records, and monitor platform health.' },
              ].map(({ emoji, role, badge, desc }) => (
                <div key={role} className="bg-surface rounded-2xl border border-border shadow-sm p-8 text-center">
                  <span className="text-5xl block mb-4">{emoji}</span>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 ${badge}`}>{role}</span>
                  <p className="text-sm text-muted leading-relaxed">{desc}</p>
                </div>
              ))}
            </Fade>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Fade direction="up" triggerOnce>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-on-primary mb-4">
              Ready to Make a Difference?
            </h2>
            <p className="text-on-primary/70 text-lg mb-8">
              Join thousands of citizens already building a cleaner, more accountable community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="inline-flex items-center justify-center px-8 py-4 bg-on-primary text-primary font-bold rounded-xl hover:bg-on-primary/90 transition-all hover:shadow-xl hover:-translate-y-0.5"
              >
                Create Free Account
              </Link>
              <Link
                to="/explore"
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-on-primary/40 text-on-primary font-bold rounded-xl hover:bg-on-primary/10 transition-all"
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
