// ─────────────────────────────────────────────────────────────────────────────
// StaffOverview.jsx — The home page of the staff dashboard at /dashboard/staff.
//
// Shows a staff member's personal workload summary. Unlike the admin overview
// (which shows all issues platform-wide), this only fetches issues that are
// assigned to THIS staff member (/issues?assignedStaffEmail=...).
//
// Four stat cards:
//   1. Total Assigned — all issues ever assigned to this staff member
//   2. Resolved — issues with status "resolved" or "ended"
//   3. In Progress — issues with status "in-progress", "working", or "ongoing"
//   4. Today's Tasks — issues whose updatedAt date matches today's date
//      (i.e., issues touched today, used as a daily workload indicator)
//
// PieChart:
//   Breaks down the staff member's assigned issues by status, identical in
//   structure to the citizen overview chart but filtered to this staff's data.
//
// Recent Activity list:
//   The 5 most recently updated issues assigned to this staff member, with
//   status badge and last-updated date. Each links to the Assigned Issues page.
// ─────────────────────────────────────────────────────────────────────────────

import { useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { FiList, FiCheckCircle, FiClock, FiCalendar } from 'react-icons/fi';
import { AuthContext } from '../../../context/AuthContext';
import axiosInstance from '../../../api/axiosInstance';

const STATUS_COLORS = {
  pending:       '#86efac',
  'in-progress': '#4ade80',
  working:       '#22c55e',
  resolved:      '#16a34a',
  closed:        '#166534',
  rejected:      '#ef4444',
};

const STATUS_STYLES = {
  pending:       'bg-amber-100  text-amber-800  dark:bg-amber-900/40  dark:text-amber-300',
  'in-progress': 'bg-blue-100   text-blue-800   dark:bg-blue-900/40   dark:text-blue-300',
  working:       'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
  resolved:      'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
  closed:        'bg-gray-100   text-gray-700   dark:bg-gray-700      dark:text-gray-300',
  rejected:      'bg-red-100    text-red-800    dark:bg-red-900/40    dark:text-red-300',
};

const StatCard = ({ label, value, Icon, accent }) => (
  <div className="bg-surface rounded-2xl border border-border p-5 flex items-center gap-4 hover:shadow-md transition-shadow duration-200">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${accent}`}>
      <Icon size={20} className="text-on-primary" />
    </div>
    <div className="min-w-0">
      <p className="text-2xl font-extrabold text-text leading-none">{value}</p>
      <p className="text-xs text-muted font-medium mt-1 uppercase tracking-wide truncate">{label}</p>
    </div>
  </div>
);

const PanelCard = ({ title, children, className = '' }) => (
  <div className={`bg-surface rounded-2xl border border-border overflow-hidden ${className}`}>
    <div className="px-5 py-4 border-b border-border">
      <h2 className="text-sm font-bold text-text">{title}</h2>
    </div>
    <div className="p-5">{children}</div>
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

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div>
          <div className="h-7 w-28 bg-surface-alt rounded-lg mb-2" />
          <div className="h-4 w-52 bg-surface-alt rounded-lg" />
        </div>
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-surface rounded-2xl border border-border p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-surface-alt flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-6 w-10 bg-surface-alt rounded" />
                <div className="h-3 w-20 bg-surface-alt rounded" />
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="bg-surface rounded-2xl border border-border overflow-hidden">
              <div className="px-5 py-4 border-b border-border">
                <div className="h-4 w-32 bg-surface-alt rounded" />
              </div>
              <div className="p-5">
                <div className="h-[240px] bg-surface-alt rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const today     = new Date().toDateString();
  const resolved  = issues.filter(i => ['resolved', 'closed'].includes(i.status)).length;
  const inProgress = issues.filter(i => ['in-progress', 'working'].includes(i.status)).length;
  const todayTasks = issues.filter(i => new Date(i.date).toDateString() === today).length;

  const statusGroups = issues.reduce((acc, i) => {
    const s = i.status || 'pending';
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});
  const pieData = Object.entries(statusGroups).map(([name, value]) => ({ name, value }));
  const recent  = issues.slice(0, 6);

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-2xl font-extrabold text-text">Overview</h1>
        <p className="text-sm text-muted mt-0.5">Your assigned issues and progress</p>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Assigned Issues" value={issues.length}  Icon={FiList}        accent="bg-primary" />
        <StatCard label="Resolved"        value={resolved}       Icon={FiCheckCircle} accent="bg-green-600" />
        <StatCard label="In Progress"     value={inProgress}     Icon={FiClock}       accent="bg-green-500" />
        <StatCard label="Today's Tasks"   value={todayTasks}     Icon={FiCalendar}    accent="bg-amber-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        <PanelCard title="Issues by Status">
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="45%"
                  outerRadius={80}
                  innerRadius={40}
                  paddingAngle={2}
                  label={({ percent }) => percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : null}
                  labelLine={false}
                >
                  {pieData.map(entry => (
                    <Cell key={entry.name} fill={STATUS_COLORS[entry.name?.toLowerCase()] || '#94a3b8'} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: 10, border: '1px solid var(--color-border)', fontSize: 12 }}
                />
                <Legend
                  iconSize={8}
                  iconType="circle"
                  wrapperStyle={{ paddingTop: 8, fontSize: 11 }}
                  formatter={(value) => <span style={{ color: 'var(--color-muted)' }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted text-sm text-center py-10">No issues assigned yet.</p>
          )}
        </PanelCard>

        <PanelCard title="Recent Assigned">
          {recent.length === 0 ? (
            <p className="text-muted text-sm">No issues yet.</p>
          ) : (
            <div className="space-y-3">
              {recent.map(issue => (
                <div key={issue._id} className="flex items-center justify-between gap-3">
                  <p className="text-sm text-text truncate flex-1 min-w-0">{issue.title}</p>
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold capitalize flex-shrink-0 ${STATUS_STYLES[issue.status?.toLowerCase()] || 'bg-surface-alt text-muted'}`}>
                    {issue.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </PanelCard>

      </div>
    </div>
  );
};

export default StaffOverview;
