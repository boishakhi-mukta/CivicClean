import { useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { AuthContext } from '../../../context/AuthContext';
import axiosInstance from '../../../api/axiosInstance';

const STATUS_COLORS = {
  pending:       '#f59e0b',
  'in-progress': '#3b82f6',
  working:       '#8b5cf6',
  resolved:      '#10b981',
  closed:        '#6b7280',
  rejected:      '#ef4444',
};

const StatCard = ({ label, value, colorClass }) => (
  <div className="bg-surface rounded-xl p-5 shadow-sm border border-border">
    <p className={`text-2xl font-black ${colorClass}`}>{value}</p>
    <p className="text-xs text-muted font-medium mt-1 uppercase tracking-wide">
      {label}
    </p>
  </div>
);

const StaffOverview = () => {
  const { currentUser } = useContext(AuthContext);

  const { data: issues = [], isLoading } = useQuery({
    queryKey: ['staffIssues', currentUser?.email],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/issues?assignedStaffEmail=${encodeURIComponent(currentUser.email)}&limit=1000`
      );
      return res.data.issues;
    },
    enabled: !!currentUser?.email,
  });

  const today = new Date().toDateString();

  const resolved   = issues.filter(i => ['resolved', 'closed'].includes(i.status)).length;
  const inProgress = issues.filter(i => ['in-progress', 'working'].includes(i.status)).length;
  const todayTasks = issues.filter(i => new Date(i.date).toDateString() === today).length;

  const statusGroups = issues.reduce((acc, i) => {
    const s = i.status || 'pending';
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});
  const chartData = Object.entries(statusGroups).map(([name, count]) => ({ name, count }));

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-extrabold text-text mb-6">
        Overview
      </h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Assigned Issues" value={issues.length}  colorClass="text-info" />
        <StatCard label="Resolved"        value={resolved}       colorClass="text-success" />
        <StatCard label="In Progress"     value={inProgress}     colorClass="text-purple-500 dark:text-purple-400" />
        <StatCard label="Today's Tasks"   value={todayTasks}     colorClass="text-warning" />
      </div>

      {chartData.length > 0 ? (
        <div className="bg-surface rounded-xl shadow-sm border border-border p-6">
          <h2 className="text-lg font-bold text-text mb-4">Issues by Status</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} margin={{ top: 4, right: 16, left: -10, bottom: 0 }}>
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12, fill: '#6b7280' }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 12, fill: '#6b7280' }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                cursor={{ fill: 'rgba(0,0,0,0.04)' }}
                contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.12)' }}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {chartData.map(entry => (
                  <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || '#94a3b8'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="bg-surface rounded-xl border border-border p-14 text-center">
          <span className="text-5xl block mb-4">📋</span>
          <p className="text-muted">
            No issues have been assigned to you yet.
          </p>
        </div>
      )}
    </div>
  );
};

export default StaffOverview;
