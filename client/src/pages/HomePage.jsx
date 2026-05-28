import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../api/axiosInstance';
import { Fade, Slide } from 'react-awesome-reveal';
import { Typewriter } from 'react-simple-typewriter';
import { FiTrash2, FiAlertTriangle, FiPenTool, FiMap } from 'react-icons/fi';
import { AuthContext } from '../context/AuthContext';
import IssueCard from '../components/IssueCard';

const HomePage = () => {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [
    {
      title: "Report Garbage Issues",
      emoji: "🗑️",
      subtitle: "See a pile of trash? Don't ignore it. Report it instantly and help us maintain a clean city.",
      ctaText: "Report Now",
      ctaLink: "/add-issue",
      bgImage: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&q=80"
    },
    {
      title: "Join Clean Drive Events",
      emoji: "🤝",
      subtitle: "Volunteer for community-driven cleanliness events and make a tangible impact in your neighborhood.",
      ctaText: "Volunteer Today",
      ctaLink: "/register",
      bgImage: "https://images.unsplash.com/photo-1594834749740-74b3f69606de?auto=format&fit=crop&q=80"
    },
    {
      title: "Build a Greener Community",
      emoji: "🌱",
      subtitle: "Track issues, earn contribution points, and climb the leaderboard as a local hero.",
      ctaText: "See All Issues",
      ctaLink: "/issues",
      bgImage: "https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?auto=format&fit=crop&q=80"
    }
  ];

  useEffect(() => {
    document.title = "CivicClean | Home";
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

  const { data: recentIssues = [], isLoading: loadingIssues } = useQuery({
    queryKey: ['homeRecentIssues'],
    queryFn: async () => (await axiosInstance.get('/issues?limit=6')).data.issues,
  });

  const categories = [
    { name: 'Garbage', icon: <FiTrash2 className="text-4xl mb-4 text-[#d4ff00]" />, query: 'Garbage' },
    { name: 'Illegal Construction', icon: <FiPenTool className="text-4xl mb-4 text-[#d4ff00]" />, query: 'Illegal Construction' },
    { name: 'Broken Public Property', icon: <FiAlertTriangle className="text-4xl mb-4 text-[#d4ff00]" />, query: 'Broken Public Property' },
    { name: 'Road Damage', icon: <FiMap className="text-4xl mb-4 text-[#d4ff00]" />, query: 'Road Damage' },
  ];

  return (
    <div className="bg-white dark:bg-gray-900 transition-colors duration-200">

      {/* 1. BANNER SECTION */}
      <section className="relative h-[600px] w-full overflow-hidden">
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
              <div className="absolute inset-0 bg-gradient-to-r from-[#1a3a2a]/90 to-black/60"></div>
            </div>

            <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-start text-white">
              <Fade direction="up" cascade damping={0.2} triggerOnce={false} key={currentSlide}>
                <span className="text-6xl md:text-8xl mb-6">{slide.emoji}</span>
                <h1 className="text-4xl md:text-6xl font-extrabold mb-4 leading-tight max-w-3xl">
                  {index === 0 ? (
                    <Typewriter
                      words={[slide.title]}
                      loop={1}
                      cursor
                      cursorStyle='_'
                      typeSpeed={70}
                      deleteSpeed={50}
                      delaySpeed={1000}
                    />
                  ) : (
                    slide.title
                  )}
                </h1>
                <p className="text-xl md:text-2xl mb-8 max-w-2xl text-gray-200 font-light">
                  {slide.subtitle}
                </p>
                <button
                  onClick={() => navigate(slide.ctaLink)}
                  className="px-8 py-4 bg-[#d4ff00] text-[#1a3a2a] text-lg font-bold rounded-lg hover:bg-[#bce600] transition transform hover:-translate-y-1 hover:shadow-xl"
                >
                  {slide.ctaText}
                </button>
              </Fade>
            </div>
          </div>
        ))}

        <div className="absolute bottom-8 left-0 right-0 z-20 flex justify-center space-x-3">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                idx === currentSlide ? 'bg-[#d4ff00] w-8' : 'bg-white/50 hover:bg-white'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </section>

      {/* 2. STATS BAR */}
      <section className="bg-[#1a3a2a] py-12 border-b-4 border-[#d4ff00]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <Fade cascade damping={0.1}>
              <div className="flex flex-col items-center">
                <span className="text-4xl font-extrabold text-[#d4ff00] mb-2">{stats.totalUsers}</span>
                <span className="text-white text-sm uppercase tracking-widest">Total Users</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-4xl font-extrabold text-[#d4ff00] mb-2">{stats.issuesReported}</span>
                <span className="text-white text-sm uppercase tracking-widest">Issues Reported</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-4xl font-extrabold text-[#d4ff00] mb-2">{stats.issuesResolved}</span>
                <span className="text-white text-sm uppercase tracking-widest">Issues Resolved</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-4xl font-extrabold text-[#d4ff00] mb-2">{stats.totalContributions}</span>
                <span className="text-white text-sm uppercase tracking-widest">Total Contributions</span>
              </div>
            </Fade>
          </div>
        </div>
      </section>

      {/* 3. CATEGORY SECTION */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800/50 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Fade direction="up">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Report by Category</h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">Select a specific issue category to view related complaints or report a new one in your neighborhood.</p>
            </Fade>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <Fade cascade damping={0.1}>
              {categories.map((cat, idx) => (
                <Link
                  key={idx}
                  to={`/issues?category=${encodeURIComponent(cat.query)}`}
                  className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition duration-300 flex flex-col items-center text-center group border border-gray-100 dark:border-gray-700"
                >
                  <div className="p-4 rounded-full bg-[#1a3a2a] group-hover:scale-110 transition-transform duration-300">
                    {cat.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-6">{cat.name}</h3>
                </Link>
              ))}
            </Fade>
          </div>
        </div>
      </section>

      {/* 4. RECENT COMPLAINTS */}
      <section className="py-20 bg-white dark:bg-gray-900 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <Fade direction="left">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Recent Complaints</h2>
                <p className="text-gray-600 dark:text-gray-400">See what's happening around the community right now.</p>
              </div>
            </Fade>
            <Fade direction="right">
              <Link to="/issues" className="hidden md:inline-flex items-center text-[#1a3a2a] dark:text-[#d4ff00] font-bold hover:underline">
                View All Issues &rarr;
              </Link>
            </Fade>
          </div>

          {loadingIssues ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#1a3a2a] dark:border-[#d4ff00]"></div>
            </div>
          ) : recentIssues.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 dark:bg-gray-800 rounded-2xl">
              <span className="text-5xl mb-4 block">🎉</span>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No Recent Issues!</h3>
              <p className="text-gray-600 dark:text-gray-400">The community is looking sparkling clean.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Fade cascade damping={0.1}>
                {recentIssues.map(issue => (
                  <IssueCard key={issue._id} issue={issue} />
                ))}
              </Fade>
            </div>
          )}

          <div className="mt-10 text-center md:hidden">
            <Link to="/issues" className="inline-flex px-6 py-3 border-2 border-[#1a3a2a] dark:border-[#d4ff00] text-[#1a3a2a] dark:text-[#d4ff00] font-bold rounded-lg hover:bg-[#1a3a2a] hover:text-white dark:hover:bg-[#d4ff00] dark:hover:text-[#1a3a2a] transition">
              View All Issues
            </Link>
          </div>
        </div>
      </section>

      {/* 5. CTA SECTION */}
      <section className="bg-[#1a3a2a] py-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-white/5 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-[#d4ff00]/10 blur-3xl"></div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <Slide direction="up">
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
              Ready to Make a Difference?
            </h2>
            <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
              Join thousands of community members actively making their neighborhoods cleaner, safer, and more beautiful. Every report counts.
            </p>

            {!currentUser ? (
              <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                <Link to="/register" className="px-8 py-4 w-full sm:w-auto bg-[#d4ff00] text-[#1a3a2a] font-bold rounded-lg hover:bg-[#bce600] transition shadow-lg text-lg">
                  Join the Community
                </Link>
                <span className="text-gray-400">or</span>
                <Link to="/login" className="px-8 py-4 w-full sm:w-auto bg-transparent border-2 border-white text-white font-bold rounded-lg hover:bg-white hover:text-[#1a3a2a] transition shadow-lg text-lg">
                  Sign In
                </Link>
              </div>
            ) : (
              <Link to="/add-issue" className="inline-block px-10 py-5 bg-[#d4ff00] text-[#1a3a2a] font-bold rounded-lg hover:bg-[#bce600] transition shadow-lg text-xl transform hover:-translate-y-1">
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
