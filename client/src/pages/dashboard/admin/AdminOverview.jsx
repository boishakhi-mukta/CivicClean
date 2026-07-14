// ─────────────────────────────────────────────────────────────────────────────
// AdminOverview.jsx — The main "home" page of the admin dashboard at
// /dashboard/admin.
//
// Gives the admin a bird's-eye view of the whole platform in one glance.
// It fetches data from three separate API endpoints in parallel and combines
// them into a single dashboard with charts, stat cards, and recent-activity
// tables.
//
// Data sources:
//   • /issues (all issues) — total count, counts by status, recent 6
//   • /payments (all payments) — total revenue, revenue by month, recent 6
//   • /users?role=citizen (all citizens) — total registered users, recent 6
//
// StatCard — a small card showing one headline number (e.g., "Total Issues:
//   142"). The coloured left border changes depending on which stat it represents.
//
// PanelCard — a wrapper card used for the charts and the "Latest" tables.
//
// Revenue Line Chart:
//   Builds a monthlyMap from all payments, keyed by a numeric sort key
//   (YYYYMM) so months are always in chronological order even if payments
//   arrive out of order. Each month's total is summed and fed to Recharts'
//   LineChart.
//
// Issues Pie Chart:
//   Counts how many issues are in each status (pending, in-progress, etc.) and
//   draws a PieChart with colour-coded slices defined by STATUS_COLORS.
//
// Bottom tables:
//   The six most recent issues, payments, and users are shown side-by-side
//   so the admin can quickly spot new activity without navigating away.
// ─────────────────────────────────────────────────────────────────────────────

import { useQuery } from '@tanstack/react-query';
import {
  LineChart, Line, CartesianGrid,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend,
} from 'recharts';
import { FiList, FiCheckCircle, FiClock, FiXCircle, FiDollarSign } from 'react-icons/fi';
import axiosInstance from '../../../api/axiosInstance';

const STATUS_COLORS = {
  pending:       '#86efac',
  'in-progress': '#4ade80',
  'in progress': '#4ade80',
  open:          '#4ade80',
  working:       '#22c55e',
  ongoing:       '#22c55e',
  resolved:      '#16a34a',
  closed:        '#166534',
  ended:         '#166534',
  rejected:      '#ef4444',
};

const STATUS_STYLES = {
  pending:       'bg-amber-100  text-amber-800  dark:bg-amber-900/40  dark:text-amber-300',
  'in-progress': 'bg-blue-100   text-blue-800   dark:bg-blue-900/40   dark:text-blue-300',
  'in progress': 'bg-blue-100   text-blue-800   dark:bg-blue-900/40   dark:text-blue-300',
  open:          'bg-sky-100    text-sky-800    dark:bg-sky-900/40    dark:text-sky-300',
  working:       'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
  ongoing:       'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
  resolved:      'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
  closed:        'bg-gray-100   text-gray-700   dark:bg-gray-700      dark:text-gray-300',
  ended:         'bg-gray-100   text-gray-700   dark:bg-gray-700      dark:text-gray-300',
  rejected:      'bg-red-100    text-red-800    dark:bg-red-900/40    dark:text-red-300',
};

const StatCard = ({ label, value, Icon, accent }) => (
  <div className={`bg-surface rounded-2xl border border-border p-5 flex items-center gap-4 hover:shadow-md transition-shadow duration-200`}>
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

const AdminOverview = () => {
  const { data: issuesData, isLoading: issuesLoading } = useQuery({
    queryKey: ['adminIssuesAll'],
    queryFn: async () => (await axiosInstance.get('/issues?limit=1000')).data,
  });

  const { data: paymentsData, isLoading: paymentsLoading } = useQuery({
    queryKey: ['adminPaymentsAll'],
    queryFn: async () => (await axiosInstance.get('/payments')).data,
  });

  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: async () => (await axiosInstance.get('/users?role=citizen')).data,
  });

  if (issuesLoading || paymentsLoading || usersLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        {/* Header */}
        <div>
          <div className="h-7 w-32 bg-surface-alt rounded-lg mb-2" />
          <div className="h-4 w-56 bg-surface-alt rounded-lg" />
        </div>
        {/* Stat cards */}
        <div className="grid grid-cols-2 xl:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-surface rounded-2xl border border-border p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-surface-alt flex-shrink-0" />
              <div className="flex-1 min-w-0 space-y-2">
                <div className="h-6 w-12 bg-surface-alt rounded" />
                <div className="h-3 w-20 bg-surface-alt rounded" />
              </div>
            </div>
          ))}
        </div>
        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="bg-surface rounded-2xl border border-border overflow-hidden">
              <div className="px-5 py-4 border-b border-border">
                <div className="h-4 w-36 bg-surface-alt rounded" />
              </div>
              <div className="p-5">
                <div className="h-[220px] bg-surface-alt rounded-xl" />
              </div>
            </div>
          ))}
        </div>
        {/* Activity panels */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-surface rounded-2xl border border-border overflow-hidden">
              <div className="px-5 py-4 border-b border-border">
                <div className="h-4 w-28 bg-surface-alt rounded" />
              </div>
              <div className="p-5 space-y-3">
                {Array.from({ length: 6 }).map((_, j) => (
                  <div key={j} className="flex items-center justify-between gap-3">
                    <div className="h-4 flex-1 bg-surface-alt rounded" />
                    <div className="h-5 w-16 bg-surface-alt rounded-full flex-shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const issues   = issuesData?.issues   || [];
  const payments = paymentsData?.payments || [];

  const resolved  = issues.filter(i => ['resolved', 'closed'].includes(i.status)).length;
  const pending   = issues.filter(i => i.status === 'pending').length;
  const rejected  = issues.filter(i => i.status === 'rejected').length;
  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

  const statusGroups = issues.reduce((acc, i) => {
    const s = i.status || 'pending';
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});
  const pieData = Object.entries(statusGroups).map(([name, value]) => ({ name, value }));

  const monthlyMap = payments.reduce((acc, p) => {
    const d = new Date(p.date);
    // Numeric sort key so months are always chronological
    const sortKey = d.getFullYear() * 100 + (d.getMonth() + 1);
    const label   = d.toLocaleString('default', { month: 'short', year: '2-digit' });
    if (!acc[sortKey]) acc[sortKey] = { month: label, total: 0 };
    acc[sortKey].total += p.amount;
    return acc;
  }, {});
  const barData = Object.keys(monthlyMap)
    .map(Number)
    .sort((a, b) => a - b)
    .map(k => monthlyMap[k]);

  const latestIssues   = issues.slice(0, 6);
  const latestPayments = payments.slice(0, 6);
  const latestUsers    = users.slice(0, 6);

  return (
    <div className="space-y-6">

      {/* Page header */}
      <div>
        <h1 className="text-2xl font-extrabold text-text">Overview</h1>
        <p className="text-sm text-muted mt-0.5">Platform summary and recent activity</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-5 gap-4">
        <StatCard label="Total Issues"  value={issues.length}          Icon={FiList}         accent="bg-primary" />
        <StatCard label="Resolved"      value={resolved}               Icon={FiCheckCircle}  accent="bg-green-600" />
        <StatCard label="Pending"       value={pending}                Icon={FiClock}        accent="bg-green-400" />
        <StatCard label="Rejected"      value={rejected}               Icon={FiXCircle}      accent="bg-red-500" />
        <StatCard label="Total Revenue" value={`kr${totalPaid.toLocaleString()}`} Icon={FiDollarSign} accent="bg-violet-500" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <PanelCard title="Revenue by Month (kr)">
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={barData} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
                <Tooltip
                  formatter={(v) => [`kr${v}`, 'Revenue']}
                  contentStyle={{ borderRadius: 10, border: '1px solid var(--color-border)', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 12 }}
                />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="rgb(48 109 41)"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: 'rgb(48 109 41)', strokeWidth: 0 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted text-sm text-center py-10">No payment data yet.</p>
          )}
        </PanelCard>

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
            <p className="text-muted text-sm text-center py-10">No issue data yet.</p>
          )}
        </PanelCard>
      </div>

      {/* Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        <PanelCard title="Latest Issues">
          {latestIssues.length === 0 ? (
            <p className="text-muted text-sm">None yet.</p>
          ) : (
            <div className="space-y-3">
              {latestIssues.map(issue => (
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

        <PanelCard title="Latest Payments">
          {latestPayments.length === 0 ? (
            <p className="text-muted text-sm">None yet.</p>
          ) : (
            <div className="space-y-3">
              {latestPayments.map(p => (
                <div key={p._id} className="flex items-center justify-between gap-3">
                  <p className="text-xs text-muted truncate flex-1 min-w-0">{p.userEmail}</p>
                  <span className="text-sm font-bold text-primary flex-shrink-0">kr{p.amount}</span>
                </div>
              ))}
            </div>
          )}
        </PanelCard>

        <PanelCard title="Recent Users">
          {latestUsers.length === 0 ? (
            <p className="text-muted text-sm">None yet.</p>
          ) : (
            <div className="space-y-3">
              {latestUsers.map(u => (
                <div key={u._id} className="flex items-center gap-3">
                  {u.avatar_url ? (
                    <img src={u.avatar_url} alt="" loading="lazy" className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold flex-shrink-0">
                      {(u.name || u.email).charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text truncate leading-tight font-medium">{u.name || '—'}</p>
                    <p className="text-xs text-muted truncate leading-tight">{u.email}</p>
                  </div>
                  {u.isPremium && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 flex-shrink-0">Pro</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </PanelCard>

      </div>
    </div>
  );
};

export default AdminOverview;
