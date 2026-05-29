import { useQuery } from '@tanstack/react-query';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend,
} from 'recharts';
import axiosInstance from '../../../api/axiosInstance';

const STATUS_COLORS = {
  pending:       '#f59e0b',
  'in-progress': '#3b82f6',
  'in progress': '#3b82f6',
  open:          '#0ea5e9',
  working:       '#8b5cf6',
  ongoing:       '#8b5cf6',
  resolved:      '#10b981',
  closed:        '#6b7280',
  ended:         '#6b7280',
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

const StatCard = ({ label, value, accent, colorClass }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
    <p className={`text-2xl font-black ${colorClass || ''}`} style={colorClass ? {} : { color: accent }}>{value}</p>
    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-1 uppercase tracking-wide">{label}</p>
  </div>
);

const SectionTitle = ({ children }) => (
  <h2 className="text-base font-bold text-gray-900 dark:text-white mb-3">{children}</h2>
);

const AdminOverview = () => {
  const { data: issuesData, isLoading: issuesLoading } = useQuery({
    queryKey: ['adminIssuesAll'],
    queryFn: async () => {
      const res = await axiosInstance.get('/issues?limit=1000');
      return res.data;
    },
  });

  const { data: paymentsData, isLoading: paymentsLoading } = useQuery({
    queryKey: ['adminPaymentsAll'],
    queryFn: async () => {
      const res = await axiosInstance.get('/payments');
      return res.data;
    },
  });

  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: async () => {
      const res = await axiosInstance.get('/users?role=citizen');
      return res.data;
    },
  });

  if (issuesLoading || paymentsLoading || usersLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#1a3a2a] dark:border-[#d4ff00]" />
      </div>
    );
  }

  const issues   = issuesData?.issues   || [];
  const payments = paymentsData?.payments || [];

  const resolved  = issues.filter(i => ['resolved', 'closed'].includes(i.status)).length;
  const pending   = issues.filter(i => i.status === 'pending').length;
  const rejected  = issues.filter(i => i.status === 'rejected').length;
  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

  // PieChart: issues by status
  const statusGroups = issues.reduce((acc, i) => {
    const s = i.status || 'pending';
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});
  const pieData = Object.entries(statusGroups).map(([name, value]) => ({ name, value }));

  // BarChart: payments grouped by month
  const monthlyMap = payments.reduce((acc, p) => {
    const key = new Date(p.date).toLocaleString('default', { month: 'short', year: '2-digit' });
    acc[key] = (acc[key] || 0) + p.amount;
    return acc;
  }, {});
  const barData = Object.entries(monthlyMap).map(([month, total]) => ({ month, total }));

  const latestIssues   = issues.slice(0, 5);
  const latestPayments = payments.slice(0, 5);
  const latestUsers    = users.slice(0, 5);

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white mb-6">Overview</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatCard label="Total Issues"   value={issues.length}  accent="#3b82f6" />
        <StatCard label="Resolved"       value={resolved}       accent="#10b981" />
        <StatCard label="Pending"        value={pending}        accent="#f59e0b" />
        <StatCard label="Rejected"       value={rejected}       accent="#ef4444" />
        <StatCard label="Total Revenue"  value={`kr${totalPaid}`} colorClass="text-[#1a3a2a] dark:text-[#d4ff00]" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Payments BarChart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <SectionTitle>Revenue by Month (kr)</SectionTitle>
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barData} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6b7280' }} tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#6b7280' }} tickLine={false} axisLine={false} />
                <Tooltip
                  formatter={(v) => [`kr${v}`, 'Revenue']}
                  contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.12)' }}
                />
                <Bar dataKey="total" fill="#1a3a2a" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-sm text-center py-10">No payment data yet.</p>
          )}
        </div>

        {/* Issues PieChart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <SectionTitle>Issues by Status</SectionTitle>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="45%"
                  outerRadius={75}
                  label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                  labelLine={true}
                >
                  {pieData.map(entry => (
                    <Cell key={entry.name} fill={STATUS_COLORS[entry.name?.toLowerCase()] || '#94a3b8'} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [value]}
                  contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', backgroundColor: '#1f2937', color: '#f3f4f6' }}
                />
                <Legend
                  iconSize={10}
                  wrapperStyle={{ paddingTop: 8, fontSize: 12 }}
                  formatter={(value) => (
                    <span style={{ color: '#9ca3af' }}>{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-sm text-center py-10">No issue data yet.</p>
          )}
        </div>
      </div>

      {/* Mini tables row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Latest Issues */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
          <SectionTitle>Latest Issues</SectionTitle>
          <div className="space-y-3">
            {latestIssues.length === 0 ? (
              <p className="text-gray-400 text-sm">None yet.</p>
            ) : latestIssues.map(issue => (
              <div key={issue._id} className="flex items-center justify-between gap-2">
                <p className="text-sm text-gray-900 dark:text-white truncate max-w-[60%]">{issue.title}</p>
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize shrink-0 ${STATUS_STYLES[issue.status?.toLowerCase()] || 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}>
                  {issue.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Latest Payments */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
          <SectionTitle>Latest Payments</SectionTitle>
          <div className="space-y-3">
            {latestPayments.length === 0 ? (
              <p className="text-gray-400 text-sm">None yet.</p>
            ) : latestPayments.map(p => (
              <div key={p._id} className="flex items-center justify-between gap-2">
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[60%]">{p.userEmail}</p>
                <span className="text-sm font-bold text-[#1a3a2a] dark:text-[#d4ff00] shrink-0">kr{p.amount}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Latest Users */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
          <SectionTitle>Recent Users</SectionTitle>
          <div className="space-y-3">
            {latestUsers.length === 0 ? (
              <p className="text-gray-400 text-sm">None yet.</p>
            ) : latestUsers.map(u => (
              <div key={u._id} className="flex items-center gap-2">
                {u.avatar_url ? (
                  <img src={u.avatar_url} alt="" className="w-7 h-7 rounded-full object-cover shrink-0" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-[#d4ff00] flex items-center justify-center text-[#1a3a2a] text-xs font-bold shrink-0">
                    {(u.name || u.email).charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 dark:text-white truncate leading-tight">{u.name || u.email}</p>
                  {u.name && <p className="text-xs text-gray-400 truncate leading-tight">{u.email}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
