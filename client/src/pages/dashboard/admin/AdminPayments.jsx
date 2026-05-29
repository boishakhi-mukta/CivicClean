import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { FiDownload } from 'react-icons/fi';
import axiosInstance from '../../../api/axiosInstance';

const TYPE_STYLES = {
  boost:        'bg-amber-100  text-amber-800',
  subscription: 'bg-purple-100 text-purple-800',
};

const AdminPayments = () => {
  const [typeFilter, setTypeFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['adminPayments', typeFilter],
    queryFn: async () => {
      const params = typeFilter ? `?type=${typeFilter}` : '';
      return (await axiosInstance.get(`/payments${params}`)).data;
    },
  });

  const payments = data?.payments || [];

  const downloadInvoice = async (payment) => {
    try {
      const { jsPDF }           = await import('jspdf');
      const { default: autoTable } = await import('jspdf-autotable');
      const doc = new jsPDF();

      doc.setFontSize(18);
      doc.setTextColor(26, 58, 42);
      doc.text('CivicClean', 14, 18);

      doc.setFontSize(11);
      doc.setTextColor(80);
      doc.text('Official Payment Invoice', 14, 26);

      doc.setDrawColor(212, 255, 0);
      doc.setLineWidth(0.8);
      doc.line(14, 30, 196, 30);

      autoTable(doc, {
        startY: 36,
        body: [
          ['Transaction ID', payment.transactionId || '—'],
          ['User Email',     payment.userEmail],
          ['Payment Type',   payment.type],
          ['Amount',         `kr${payment.amount}`],
          ['Issue',          payment.issueTitle || 'N/A'],
          ['Date',           new Date(payment.date).toLocaleString()],
        ],
        theme: 'plain',
        styles: { fontSize: 10 },
        columnStyles: {
          0: { fontStyle: 'bold', textColor: [26, 58, 42], cellWidth: 50 },
          1: { textColor: [50, 50, 50] },
        },
      });

      const finalY = doc.lastAutoTable?.finalY || 100;
      doc.setFontSize(9);
      doc.setTextColor(150);
      doc.text('Thank you for contributing to CivicClean.', 14, finalY + 14);

      doc.save(`invoice-${payment.transactionId || payment._id}.pdf`);
    } catch {
      toast.error('Failed to generate invoice.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#1a3a2a] dark:border-[#d4ff00]" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white">Payments</h1>
        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-white text-sm outline-none focus:ring-2 focus:ring-[#d4ff00]"
        >
          <option value="">All Types</option>
          <option value="boost">Boost</option>
          <option value="subscription">Subscription</option>
        </select>
      </div>

      {payments.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-14 text-center">
          <span className="text-5xl block mb-4">💳</span>
          <p className="text-gray-500 dark:text-gray-400">No payments found.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead className="bg-gray-50 dark:bg-gray-700/50 border-b dark:border-gray-700 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold">
                <tr>
                  <th className="px-5 py-4">#</th>
                  <th className="px-5 py-4">User</th>
                  <th className="px-5 py-4">Type</th>
                  <th className="px-5 py-4">Amount</th>
                  <th className="px-5 py-4">Issue</th>
                  <th className="px-5 py-4">Date</th>
                  <th className="px-5 py-4">Transaction ID</th>
                  <th className="px-5 py-4 text-right">Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {payments.map((p, idx) => (
                  <tr key={p._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-5 py-4 text-sm text-gray-400">{idx + 1}</td>
                    <td className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300 max-w-[140px] truncate">
                      {p.userEmail}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${TYPE_STYLES[p.type] || ''}`}>
                        {p.type}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm font-bold text-gray-900 dark:text-white">kr{p.amount}</td>
                    <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-[140px] truncate">
                      {p.issueTitle || '—'}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {new Date(p.date).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-400 font-mono">
                      {p.transactionId ? p.transactionId.slice(0, 16) + '…' : '—'}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => downloadInvoice(p)}
                        title="Download Invoice"
                        className="p-1.5 rounded-lg text-[#1a3a2a] bg-[#d4ff00]/20 hover:bg-[#d4ff00]/40 dark:text-[#d4ff00] transition"
                      >
                        <FiDownload size={15} />
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

export default AdminPayments;
