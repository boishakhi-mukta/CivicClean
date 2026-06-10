import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { FiAlertCircle } from 'react-icons/fi';
import axiosInstance from '../../../api/axiosInstance';

const AdminManageUsers = () => {
  const queryClient = useQueryClient();

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
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-text mb-6">Manage Users</h1>
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

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-extrabold text-text mb-6">Manage Users</h1>

      {users.length === 0 ? (
        <div className="bg-surface rounded-xl border border-border p-14 text-center">
          <span className="text-5xl block mb-4">👤</span>
          <p className="text-muted">No users registered yet.</p>
        </div>
      ) : (
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
                {users.map(user => (
                  <tr key={user._id} className="hover:bg-surface-alt/60 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {user.avatar_url ? (
                          <img src={user.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
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
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-surface-alt text-muted">
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
      )}
    </div>
  );
};

export default AdminManageUsers;
