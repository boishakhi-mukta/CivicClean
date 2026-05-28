import { useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { AuthContext } from '../../../context/AuthContext';
import axiosInstance from '../../../api/axiosInstance';

const STATUS_COLORS = {
  pending:     '#f59e0b',
  'in-progress': '#3b82f6',
  working:     '#8b5cf6',
  resolved:    '#10b981',
  closed:      '#6b7280',
  rejected:    '#ef4444',
};

const StatCard = ({ label, value, color }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
    <div className={`w-3 h-3 rounded-full mb-3 ${color}`} />
    <p className="text-2xl font-black text-gray-900 dark:text-white">{value}</p>
    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-1 uppercase tracking-wide">
      {label}
    </p>
  </div>
);

const CitizenOverview = () => {
  const { currentUser } = useContext(AuthContext);

  const { data: issues = [], isLoading: issuesLoading } = useQuery({
    queryKey: ['myIssues', currentUser?.email],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/issues?email=${encodeURIComponent(currentUser.email)}&limit=1000`
      );
      return res.data.issues;
    },
    enabled: !!currentUser?.email,
  });

  const { data: payments = [], isLoading: paymentsLoading } = useQuery({
    queryKey: ['myPayments'],
    queryFn: async () => {
      const res = await axiosInstance.get('/payments/mine');
      return res.data;
    },
  });

  const pending    = issues.filter(i => i.status === 'pending').length;
  const inProgress = issues.filter(i => ['in-progress', 'working'].includes(i.status)).length;
  const resolved   = issues.filter(i => ['resolved', 'closed'].includes(i.status)).length;
  const totalPaid  = payments.reduce((sum, p) => sum + p.amount, 0);

  const statusGroups = issues.reduce((acc, i) => {
    const s = i.status || 'pending';
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});
  const pieData = Object.entries(statusGroups).map(([name, value]) => ({ name, value }));

  const stats = [
    { label: 'Total Submitted', value: issues.length,     color: 'bg-blue-500' },
    { label: 'Pending',         value: pending,            color: 'bg-amber-500' },
    { label: 'In Progress',     value: inProgress,         color: 'bg-purple-500' },
    { label: 'Resolved',        value: resolved,           color: 'bg-emerald-500' },
    { label: 'Total Payments',  value: `৳${totalPaid}`,   color: 'bg-[#1a3a2a]' },
  ];

  if (issuesLoading || paymentsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#1a3a2a] dark:border-[#d4ff00]" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white mb-6">
        Overview
      </h1>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {stats.map(s => <StatCard key={s.label} {...s} />)}
      </div>

      {pieData.length > 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Issues by Status</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={110}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {pieData.map(entry => (
                  <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || '#94a3b8'} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-14 text-center">
          <span className="text-5xl block mb-4">📋</span>
          <p className="text-gray-500 dark:text-gray-400">
            No issues yet. Head to <strong>Report Issue</strong> to get started.
          </p>
        </div>
      )}
    </div>
  );
};

export default CitizenOverview;
