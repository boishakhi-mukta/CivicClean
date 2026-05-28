const STATUS_COLORS = {
  pending:       'bg-gray-100    text-gray-600   dark:bg-gray-700      dark:text-gray-300',
  'in-progress': 'bg-blue-100   text-blue-800   dark:bg-blue-900/40   dark:text-blue-300',
  working:       'bg-yellow-100 text-yellow-800  dark:bg-yellow-900/40 dark:text-yellow-300',
  resolved:      'bg-green-100  text-green-800   dark:bg-green-900/40  dark:text-green-300',
  closed:        'bg-teal-100   text-teal-800    dark:bg-teal-900/40   dark:text-teal-300',
  rejected:      'bg-red-100    text-red-800     dark:bg-red-900/40    dark:text-red-300',
};

const ROLE_COLORS = {
  admin:   'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
  staff:   'bg-blue-100   text-blue-800   dark:bg-blue-900/40   dark:text-blue-300',
  citizen: 'bg-gray-100   text-gray-600   dark:bg-gray-700      dark:text-gray-300',
};

const DOT_COLORS = {
  pending:       'bg-gray-400',
  'in-progress': 'bg-blue-500',
  working:       'bg-yellow-500',
  resolved:      'bg-green-500',
  closed:        'bg-teal-500',
  rejected:      'bg-red-500',
};

const formatDate = (date) => {
  if (!date) return '—';
  const d = new Date(date);
  if (isNaN(d)) return '—';
  return d.toLocaleString(undefined, {
    month:  'short',
    day:    'numeric',
    year:   'numeric',
    hour:   'numeric',
    minute: '2-digit',
  });
};

const IssueTimeline = ({ timeline = [] }) => {
  const sorted = [...timeline].reverse();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 md:p-10">
      <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-6">Issue Timeline</h2>

      {sorted.length === 0 ? (
        <p className="text-gray-400 italic text-center py-6">No updates yet.</p>
      ) : (
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-3.5 top-2 bottom-2 w-0.5 bg-gray-200 dark:bg-gray-700" />

          <div className="space-y-6">
            {sorted.map((entry, idx) => (
              <div key={idx} className="relative flex gap-5 pl-10">
                {/* Dot */}
                <span
                  className={`absolute left-2 top-1.5 w-3 h-3 rounded-full ring-2 ring-white dark:ring-gray-800 flex-shrink-0 ${
                    DOT_COLORS[entry.status] || 'bg-gray-400'
                  }`}
                />

                <div className="flex-1 pb-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    {/* Status badge */}
                    {entry.status && (
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${STATUS_COLORS[entry.status] || ''}`}>
                        {entry.status}
                      </span>
                    )}
                    {/* Role badge */}
                    {entry.role && (
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${ROLE_COLORS[entry.role] || ''}`}>
                        {entry.role}
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-gray-800 dark:text-gray-200 font-medium leading-relaxed">
                    {entry.message}
                  </p>

                  <div className="flex flex-wrap gap-x-3 mt-1.5 text-xs text-gray-400 dark:text-gray-500">
                    {entry.updatedBy && (
                      <span>By: {entry.updatedBy}</span>
                    )}
                    <span>{formatDate(entry.createdAt)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default IssueTimeline;
