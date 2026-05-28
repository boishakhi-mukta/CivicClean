import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { AuthContext } from '../context/AuthContext';
import { FiMapPin, FiCalendar, FiThumbsUp } from 'react-icons/fi';
import { Fade } from 'react-awesome-reveal';
import ContributionModal from '../components/ContributionModal';

const IssueDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);
  
  const [issue, setIssue] = useState(null);
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchIssueAndContributions = async () => {
    try {
      setLoading(true);
      const [issueRes, contributionsRes] = await Promise.all([
        axiosInstance.get(`/issues/${id}`),
        axiosInstance.get(`/donations?issueId=${id}`)
      ]);
      setIssue(issueRes.data);
      setContributions(contributionsRes.data);
      document.title = `CivicClean | ${issueRes.data.title}`;
    } catch (error) {
      console.error('Failed to fetch details:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssueAndContributions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handlePayClick = () => {
    if (!currentUser) {
      navigate('/login', { state: { from: { pathname: `/issues/${id}` } } });
      return;
    }
    setIsModalOpen(true);
  };

  const handleUpvote = async () => {
    if (!currentUser) {
      navigate('/login', { state: { from: { pathname: `/issues/${id}` } } });
      return;
    }
    try {
      const res = await axiosInstance.patch(`/issues/${id}/upvote`);
      setIssue(res.data);
    } catch (error) {
      console.error('Failed to upvote:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex flex-col justify-center items-center bg-gray-50 dark:bg-gray-900 transition-colors">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#1a3a2a] dark:border-[#d4ff00]"></div>
        <p className="mt-4 text-gray-500 dark:text-gray-400 font-medium">Loading issue details...</p>
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex justify-center items-center bg-gray-50 dark:bg-gray-900 transition-colors">
        <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Issue Not Found</h2>
          <p className="text-gray-500 dark:text-gray-400">The issue you are looking for does not exist or was removed.</p>
        </div>
      </div>
    );
  }

  // Calculate budget progress
  const totalCollected = contributions.reduce((sum, c) => sum + c.amount, 0);
  const suggestedBudget = issue.amount || 1;
  const progressPercent = Math.min(Math.round((totalCollected / suggestedBudget) * 100), 100);

  const getStatusColor = (status) => {
    const s = status?.toLowerCase();
    if (s === 'ended' || s === 'resolved') return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
  };

  const placeholderImage = 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&q=80&w=1200';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <Fade direction="up" triggerOnce>
          {/* Main Issue Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              {/* Image Column */}
              <div className="h-72 lg:h-auto relative">
                <img 
                  src={issue.image || placeholderImage} 
                  alt={issue.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>

              {/* Info Column */}
              <div className="p-8 md:p-10 flex flex-col justify-between">
                <div>
                  <div className="flex flex-wrap gap-3 mb-4">
                    <span className="px-3 py-1 bg-[#1a3a2a] text-white dark:bg-[#d4ff00] dark:text-[#1a3a2a] rounded-md text-sm font-bold shadow-sm">
                      {issue.category}
                    </span>
                    <span className={`px-3 py-1 rounded-md text-sm font-bold uppercase tracking-wider shadow-sm ${getStatusColor(issue.status)}`}>
                      {issue.status || 'Open'}
                    </span>
                    <button 
                      onClick={handleUpvote}
                      className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 rounded-md text-sm font-bold shadow-sm flex items-center hover:bg-blue-200 transition-colors"
                    >
                      <FiThumbsUp className="mr-1" /> {issue.upvoteCount || 0} Upvotes
                    </button>
                  </div>

                  <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-4 leading-tight">
                    {issue.title}
                  </h1>

                  <div className="space-y-3 mb-8">
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <FiMapPin className="mr-3 flex-shrink-0 text-xl text-[#1a3a2a] dark:text-[#d4ff00]" />
                      <span className="text-lg">{issue.location}</span>
                    </div>
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <FiCalendar className="mr-3 flex-shrink-0 text-xl text-[#1a3a2a] dark:text-[#d4ff00]" />
                      <span className="text-lg">{issue.date && !isNaN(new Date(issue.date).getTime()) ? new Date(issue.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'Unknown Date'}</span>
                    </div>
                  </div>

                  <div className="prose prose-lg dark:prose-invert max-w-none mb-8 text-gray-600 dark:text-gray-300">
                    <p className="whitespace-pre-wrap">{issue.description}</p>
                  </div>
                </div>

                {/* Budget Section */}
                <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-xl border border-gray-100 dark:border-gray-600">
                  <div className="flex justify-between items-end mb-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Suggested Budget</p>
                      <p className="text-2xl font-extrabold text-gray-900 dark:text-white">{suggestedBudget} NOK</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Collected</p>
                      <p className="text-2xl font-extrabold text-[#1a3a2a] dark:text-[#d4ff00]">{totalCollected} NOK</p>
                    </div>
                  </div>

                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3 mb-2 overflow-hidden">
                    <div 
                      className="bg-[#1a3a2a] dark:bg-[#d4ff00] h-3 rounded-full transition-all duration-1000 ease-out" 
                      style={{ width: `${progressPercent}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium text-right mb-6">
                    {progressPercent}% Funded
                  </p>

                  <button
                    onClick={handlePayClick}
                    className="w-full py-4 bg-[#d4ff00] text-[#1a3a2a] text-lg font-bold rounded-lg hover:bg-[#bce600] transition transform hover:-translate-y-1 shadow-md"
                  >
                    Pay Clean-Up Contribution
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Fade>

        <Fade direction="up" triggerOnce delay={100}>
          {/* Contributors Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden p-8 md:p-10">
            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-6">Contributors ({contributions.length})</h2>
            
            {contributions.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 italic bg-gray-50 dark:bg-gray-700/50 p-6 rounded-xl border border-gray-100 dark:border-gray-600 text-center">
                No contributions yet. Be the first to support this clean-up!
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="py-4 px-4 font-semibold text-gray-500 dark:text-gray-400 uppercase text-sm tracking-wider">Contributor</th>
                      <th className="py-4 px-4 font-semibold text-gray-500 dark:text-gray-400 uppercase text-sm tracking-wider">Date</th>
                      <th className="py-4 px-4 font-semibold text-gray-500 dark:text-gray-400 uppercase text-sm tracking-wider text-right">Amount (NOK)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contributions.map((c) => (
                      <tr key={c._id} className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                        <td className="py-4 px-4">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-[#1a3a2a] text-[#d4ff00] flex items-center justify-center font-bold mr-3 flex-shrink-0">
                              {c.name ? c.name.charAt(0).toUpperCase() : 'A'}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white">{c.name || 'Anonymous'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-gray-600 dark:text-gray-400">
                          {c.date && !isNaN(new Date(c.date).getTime()) ? new Date(c.date).toLocaleDateString() : 'Unknown'}
                        </td>
                        <td className="py-4 px-4 text-right font-bold text-gray-900 dark:text-white">
                          {c.amount} NOK
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Fade>
      </div>

      {isModalOpen && (
        <ContributionModal 
          issue={issue} 
          onClose={() => setIsModalOpen(false)} 
          onContributionSuccess={fetchIssueAndContributions} 
        />
      )}
    </div>
  );
};

export default IssueDetailPage;
