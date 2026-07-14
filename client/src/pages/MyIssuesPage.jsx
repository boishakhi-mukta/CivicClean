// ─────────────────────────────────────────────────────────────────────────────
// MyIssuesPage.jsx — A legacy "My Reported Issues" page at the /my-issues route.
//
// Note: The richer, up-to-date version is CitizenMyIssues.jsx inside the citizen
// dashboard. That version has boost support, better filtering, and the free-limit
// guard. This page is kept for backwards compatibility.
//
// What this page shows:
//   A table of all issues the current user has submitted, with columns for
//   title, category, location, suggested budget, status, and date reported.
//
// Actions per row:
//   • View — navigates to /explore/<id> to see the full issue detail page.
//   • Edit (pencil icon) — opens UpdateIssueModal, but only for pending issues.
//   • Delete (trash icon) — asks for confirmation then deletes the issue.
//
// getStatusBadge() returns a coloured pill based on the issue status.
// getCategoryColor() returns a coloured dot colour for each category type.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AuthContext } from '../context/AuthContext';
import axiosInstance from '../api/axiosInstance';
import { Fade } from 'react-awesome-reveal';
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

  const handleDeleteClick = async (issue) => {
    const confirmed = window.confirm('Are you sure?\n\nThis action cannot be undone.');
    if (!confirmed) return;
    try {
      await axiosInstance.delete(`/issues/${issue._id}`, {
        data: { email: currentUser.email }
      });
      toast.success('Issue deleted successfully!');
      queryClient.invalidateQueries({ queryKey: ['myIssuesLegacy'] });
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete issue.');
    }
  };

  return (
    <div className="min-h-screen bg-bg py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10 flex flex-col md:flex-row justify-between items-center gap-4">
          <Fade direction="left" triggerOnce>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-text mb-2">My Reported Issues</h1>
              <p className="text-muted">Manage and track the progress of the issues you've reported.</p>
            </div>
          </Fade>
          <Fade direction="right" triggerOnce>
            <Link
              to="/add-issue"
              className="px-6 py-3 bg-primary text-on-primary font-bold rounded-lg shadow-md hover:bg-primary-hover transition-colors"
            >
              + Report New Issue
            </Link>
          </Fade>
        </div>

        {isLoading ? (
          <div className="flex flex-col justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary" />
          </div>
        ) : issues.length === 0 ? (
          <Fade triggerOnce>
            <div className="bg-surface rounded-2xl shadow-sm border border-border p-12 text-center">
              <span className="text-6xl mb-6 block">📝</span>
              <h3 className="text-2xl font-bold text-text mb-3">You haven't reported any issues yet.</h3>
              <p className="text-muted mb-8 max-w-md mx-auto">
                Be a local hero! If you see something wrong in your neighborhood, let us know and help make it right.
              </p>
              <Link
                to="/add-issue"
                className="inline-block px-8 py-4 bg-primary text-on-primary text-lg font-bold rounded-lg shadow-lg hover:bg-primary-hover transition"
              >
                Report Your First Issue
              </Link>
            </div>
          </Fade>
        ) : (
          <Fade direction="up" triggerOnce>
            <div className="bg-surface rounded-2xl shadow-sm border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse whitespace-nowrap">
                  <thead>
                    <tr className="bg-surface-alt/50 border-b border-border text-muted uppercase text-xs tracking-wider font-semibold">
                      <th className="py-4 px-6">#</th>
                      <th className="py-4 px-6">Title</th>
                      <th className="py-4 px-6">Category</th>
                      <th className="py-4 px-6">Location</th>
                      <th className="py-4 px-6">Amount (kr)</th>
                      <th className="py-4 px-6">Status</th>
                      <th className="py-4 px-6">Date</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {issues.map((issue, index) => (
                      <tr key={issue._id} className="hover:bg-surface-alt/60 transition-colors">
                        <td className="py-4 px-6 text-sm text-muted font-medium">
                          {index + 1}
                        </td>
                        <td className="py-4 px-6">
                          <div className="font-bold text-text max-w-[200px] truncate" title={issue.title}>
                            {issue.title}
                          </div>
                        </td>
                        <td className="py-4 px-6 flex items-center mt-2">
                          <span className={`inline-block w-3 h-3 rounded-full mr-2 shadow-sm ${getCategoryColor(issue.category)}`} />
                          <span className="text-sm text-text font-medium">{issue.category}</span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-sm text-muted max-w-[150px] truncate block" title={issue.location}>
                            {issue.location}
                          </span>
                        </td>
                        <td className="py-4 px-6 font-semibold text-primary">
                          {issue.amount || 0}
                        </td>
                        <td className="py-4 px-6">
                          {getStatusBadge(issue.status)}
                        </td>
                        <td className="py-4 px-6 text-sm text-muted">
                          {new Date(issue.date).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => navigate(`/explore/${issue._id}`)}
                              className="p-2 text-info bg-info/10 rounded-lg hover:bg-info/20 transition-colors"
                              title="View Details"
                            >
                              <FiExternalLink />
                            </button>
                            <button
                              onClick={() => handleUpdateClick(issue)}
                              className="p-2 text-success bg-success/10 rounded-lg hover:bg-success/20 transition-colors"
                              title="Update Issue"
                            >
                              <FiEdit2 />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(issue)}
                              className="p-2 text-danger bg-danger/10 rounded-lg hover:bg-danger/20 transition-colors"
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
