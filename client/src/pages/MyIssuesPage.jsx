import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AuthContext } from '../context/AuthContext';
import axiosInstance from '../api/axiosInstance';
import { Fade } from 'react-awesome-reveal';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';
import { FiEdit2, FiTrash2, FiExternalLink } from 'react-icons/fi';
import UpdateIssueModal from '../components/UpdateIssueModal';

const MyIssuesPage = () => {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [selectedIssue, setSelectedIssue] = useState(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  useEffect(() => {
    document.title = "CivicClean | My Issues";
  }, []);

  const { data: issues = [], isLoading } = useQuery({
    queryKey: ['myIssuesLegacy', currentUser?.email],
    queryFn: async () => {
      const res = await axiosInstance.get(`/issues?email=${encodeURIComponent(currentUser.email)}`);
      return res.data.issues;
    },
    enabled: !!currentUser?.email,
  });

  const getStatusBadge = (status) => {
    const s = status?.toLowerCase();
    if (s === 'ended' || s === 'resolved') {
      return <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400">Resolved</span>;
    }
    if (s === 'in-progress' || s === 'in progress') {
      return <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-400">In Progress</span>;
    }
    return <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-400">Open</span>;
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Garbage': return 'bg-yellow-500';
      case 'Illegal Construction': return 'bg-red-500';
      case 'Broken Public Property': return 'bg-purple-500';
      case 'Road Damage': return 'bg-gray-600';
      default: return 'bg-blue-500';
    }
  };

  const handleUpdateClick = (issue) => {
    setSelectedIssue(issue);
    setIsUpdateModalOpen(true);
  };

  const handleDeleteClick = (issue) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "This action cannot be undone.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e3342f',
      cancelButtonColor: '#6cb2eb',
      confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axiosInstance.delete(`/issues/${issue._id}`, {
            data: { email: currentUser.email }
          });
          toast.success('Issue deleted successfully!');
          queryClient.invalidateQueries({ queryKey: ['myIssuesLegacy'] });
        } catch (error) {
          toast.error(error.response?.data?.error || 'Failed to delete issue.');
        }
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10 flex flex-col md:flex-row justify-between items-center gap-4">
          <Fade direction="left" triggerOnce>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-[#1a3a2a] dark:text-white mb-2">My Reported Issues</h1>
              <p className="text-gray-600 dark:text-gray-400">Manage and track the progress of the issues you've reported.</p>
            </div>
          </Fade>
          <Fade direction="right" triggerOnce>
            <Link
              to="/add-issue"
              className="px-6 py-3 bg-[#d4ff00] text-[#1a3a2a] font-bold rounded-lg shadow-md hover:bg-[#bce600] transition-colors"
            >
              + Report New Issue
            </Link>
          </Fade>
        </div>

        {isLoading ? (
          <div className="flex flex-col justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#1a3a2a] dark:border-[#d4ff00]"></div>
          </div>
        ) : issues.length === 0 ? (
          <Fade triggerOnce>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-12 text-center">
              <span className="text-6xl mb-6 block">📝</span>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">You haven't reported any issues yet.</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
                Be a local hero! If you see something wrong in your neighborhood, let us know and start earning contribution points.
              </p>
              <Link
                to="/add-issue"
                className="inline-block px-8 py-4 bg-[#1a3a2a] text-[#d4ff00] dark:bg-[#d4ff00] dark:text-[#1a3a2a] text-lg font-bold rounded-lg shadow-lg hover:opacity-90 transition-opacity"
              >
                Report Your First Issue
              </Link>
            </div>
          </Fade>
        ) : (
          <Fade direction="up" triggerOnce>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse whitespace-nowrap">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 uppercase text-xs tracking-wider font-semibold">
                      <th className="py-4 px-6">#</th>
                      <th className="py-4 px-6">Title</th>
                      <th className="py-4 px-6">Category</th>
                      <th className="py-4 px-6">Location</th>
                      <th className="py-4 px-6">Amount (NOK)</th>
                      <th className="py-4 px-6">Status</th>
                      <th className="py-4 px-6">Date</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {issues.map((issue, index) => (
                      <tr key={issue._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                        <td className="py-4 px-6 text-sm text-gray-500 dark:text-gray-400 font-medium">
                          {index + 1}
                        </td>
                        <td className="py-4 px-6">
                          <div className="font-bold text-gray-900 dark:text-white max-w-[200px] truncate" title={issue.title}>
                            {issue.title}
                          </div>
                        </td>
                        <td className="py-4 px-6 flex items-center mt-2">
                          <span className={`inline-block w-3 h-3 rounded-full mr-2 shadow-sm ${getCategoryColor(issue.category)}`}></span>
                          <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">{issue.category}</span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-sm text-gray-600 dark:text-gray-400 max-w-[150px] truncate block" title={issue.location}>
                            {issue.location}
                          </span>
                        </td>
                        <td className="py-4 px-6 font-semibold text-[#1a3a2a] dark:text-[#d4ff00]">
                          {issue.amount || 0}
                        </td>
                        <td className="py-4 px-6">
                          {getStatusBadge(issue.status)}
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-500 dark:text-gray-400">
                          {new Date(issue.date).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => navigate(`/issues/${issue._id}`)}
                              className="p-2 text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                              title="View Details"
                            >
                              <FiExternalLink />
                            </button>
                            <button
                              onClick={() => handleUpdateClick(issue)}
                              className="p-2 text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors"
                              title="Update Issue"
                            >
                              <FiEdit2 />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(issue)}
                              className="p-2 text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                              title="Delete Issue"
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Fade>
        )}
      </div>

      {isUpdateModalOpen && selectedIssue && (
        <UpdateIssueModal
          issue={selectedIssue}
          onClose={() => setIsUpdateModalOpen(false)}
          onUpdateSuccess={() => queryClient.invalidateQueries({ queryKey: ['myIssuesLegacy'] })}
        />
      )}
    </div>
  );
};

export default MyIssuesPage;
