// ─────────────────────────────────────────────────────────────────────────────
// AdminManageUsers.jsx — Admin tool for managing citizen accounts at
// /dashboard/admin/users.
//
// Fetches all citizen accounts (role=citizen) and displays them in a table
// with their name, email, plan (Free/Premium), issue count, and block status.
//
// Blocking / Unblocking:
//   Each row has a block toggle button. Pressing it shows a browser confirm
//   dialog with the citizen's name and email so the admin doesn't accidentally
//   block the wrong person. Confirming sends a PATCH /users/:id/block request.
//   Blocked citizens cannot submit new issues — they see a "Your account has
//   been blocked" screen when they try to report.
//
// Pagination is handled client-side:
//   PAGE_SIZE=10 means the first 10 citizens are shown on page 1, the next
//   10 on page 2, etc. No server round-trip is needed to change pages.
//
// The table shows an "isBlocked" badge in red if a citizen is blocked,
// and a green "Active" badge otherwise.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { FiAlertCircle, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import axiosInstance from '../../../api/axiosInstance';

const PAGE_SIZE = 10;

const AdminManageUsers = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);

  const { data: users = [], isLoading, isError, error } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: async () => (await axiosInstance.get('/users?role=citizen')).data,
  });

  const blockMutation = useMutation({
    mutationFn: (id) => axiosInstance.patch(`/users/${id}/block`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      toast.success('User status updated');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Action failed'),
  });

  const handleBlockToggle = (user) => {
    const action = user.isBlocked ? 'unblock' : 'block';
    const confirmed = window.confirm(`${action.charAt(0).toUpperCase() + action.slice(1)} user?\n\n${user.name || user.email} will be ${action}ed.`);
    if (confirmed) blockMutation.mutate(user._id);
  };

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="mb-6">
          <div className="h-7 w-36 bg-surface-alt rounded-lg mb-2" />
          <div className="h-4 w-64 bg-surface-alt rounded-lg" />
        </div>
        <div className="bg-surface rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface-alt/50 border-b border-border">
                <tr>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <th key={i} className="px-5 py-4">
                      <div className="h-3 w-16 bg-surface-alt rounded" />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-surface-alt flex-shrink-0" />
                        <div className="h-4 w-24 bg-surface-alt rounded" />
                      </div>
                    </td>
                    <td className="px-5 py-4"><div className="h-4 w-36 bg-surface-alt rounded" /></td>
                    <td className="px-5 py-4"><div className="h-5 w-14 bg-surface-alt rounded-full" /></td>
                    <td className="px-5 py-4"><div className="h-4 w-8 bg-surface-alt rounded" /></td>
                    <td className="px-5 py-4"><div className="h-5 w-14 bg-surface-alt rounded-full" /></td>
                    <td className="px-5 py-4 text-right"><div className="h-7 w-16 bg-surface-alt rounded-lg ml-auto" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div>
        <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-text">Manage Users</h1>
        <p className="text-sm text-muted mt-0.5">View, block, and monitor citizen accounts</p>
      </div>
        <div className="bg-danger/5 border border-danger/30 rounded-xl p-6 flex items-start gap-3">
          <FiAlertCircle className="text-danger mt-0.5 flex-shrink-0" size={20} />
          <div>
            <p className="font-semibold text-danger">Failed to load users</p>
            <p className="text-sm text-danger mt-1">
              {error?.response?.data?.message || error?.message || 'Unknown error'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const totalPages = Math.max(1, Math.ceil(users.length / PAGE_SIZE));
  const safePage   = Math.min(page, totalPages);
  const pageUsers  = users.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-text">Manage Users</h1>
          <p className="text-sm text-muted mt-0.5">View, block, and monitor citizen accounts</p>
        </div>
        {users.length > 0 && (
          <p className="text-sm text-muted">{users.length} total</p>
        )}
      </div>

      {users.length === 0 ? (
        <div className="bg-surface rounded-xl border border-border p-14 text-center">
          <span className="text-5xl block mb-4">👤</span>
          <p className="text-muted">No users registered yet.</p>
        </div>
      ) : (
        <>
          <div className="bg-surface rounded-xl shadow-sm border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left whitespace-nowrap">
                <thead className="bg-surface-alt/50 border-b border-border text-xs uppercase tracking-wider text-muted font-semibold">
                  <tr>
                    <th className="px-5 py-4">User</th>
                    <th className="px-5 py-4">Email</th>
                    <th className="px-5 py-4">Plan</th>
                    <th className="px-5 py-4">Issues</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {pageUsers.map(user => (
                    <tr key={user._id} className="hover:bg-surface-alt/60 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {user.avatar_url ? (
                            <img src={user.avatar_url} alt="" loading="lazy" className="w-8 h-8 rounded-full object-cover" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary text-xs font-bold">
                              {(user.name || user.email).charAt(0).toUpperCase()}
                            </div>
                          )}
                          <span className="font-medium text-text text-sm">
                            {user.name || '—'}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-muted">{user.email}</td>
                      <td className="px-5 py-4">
                        {user.isPremium ? (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                            Premium
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-surface-alt text-muted">
                            Free
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-sm text-text font-medium">
                        {user.issueCount ?? 0}
                      </td>
                      <td className="px-5 py-4">
                        {user.isBlocked ? (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-danger/10 text-danger">
                            Blocked
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-success/10 text-success">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => handleBlockToggle(user)}
                          disabled={blockMutation.isPending}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed ${
                            user.isBlocked
                              ? 'bg-success/10 text-success hover:bg-success/20'
                              : 'bg-danger/10 text-danger hover:bg-danger/20'
                          }`}
                        >
                          {user.isBlocked ? 'Unblock' : 'Block'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 px-1">
              <p className="text-sm text-muted">
                Showing {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, users.length)} of {users.length}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                  className="p-2 rounded-lg border border-border bg-surface text-muted hover:bg-surface-alt disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  <FiChevronLeft size={15} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(n => n === 1 || n === totalPages || Math.abs(n - safePage) <= 1)
                  .reduce((acc, n, idx, arr) => {
                    if (idx > 0 && n - arr[idx - 1] > 1) acc.push('…');
                    acc.push(n);
                    return acc;
                  }, [])
                  .map((item, idx) =>
                    item === '…' ? (
                      <span key={`ellipsis-${idx}`} className="px-2 text-muted text-sm select-none">…</span>
                    ) : (
                      <button
                        key={item}
                        onClick={() => setPage(item)}
                        className={`w-8 h-8 rounded-lg text-sm font-semibold transition ${
                          safePage === item
                            ? 'bg-primary text-on-primary'
                            : 'border border-border bg-surface text-text hover:bg-surface-alt'
                        }`}
                      >
                        {item}
                      </button>
                    )
                  )}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={safePage === totalPages}
                  className="p-2 rounded-lg border border-border bg-surface text-muted hover:bg-surface-alt disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  <FiChevronRight size={15} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminManageUsers;
