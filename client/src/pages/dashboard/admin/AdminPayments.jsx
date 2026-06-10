import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { FiDownload, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import axiosInstance from '../../../api/axiosInstance';

const TYPE_STYLES = {
  boost:        'bg-amber-100  text-amber-800  dark:bg-amber-900/40  dark:text-amber-300',
  subscription: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
};

const METHOD_LABELS = {
  'mobile-banking': 'Mobile Banking',
  'card':           'Card',
  'bank-transfer':  'Bank Transfer',
};

const PAGE_SIZE = 10;

const AdminPayments = () => {
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);

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
      doc.setTextColor(48, 109, 41);
      doc.text('CivicClean', 14, 18);

      doc.setFontSize(11);
      doc.setTextColor(80);
      doc.text('Official Payment Invoice', 14, 26);

      doc.setDrawColor(48, 109, 41);
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
          0: { fontStyle: 'bold', textColor: [48, 109, 41], cellWidth: 50 },
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
      <div className="animate-pulse">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <div className="h-7 w-28 bg-surface-alt rounded-lg mb-2" />
            <div className="h-4 w-52 bg-surface-alt rounded-lg" />
          </div>
          <div className="h-9 w-28 bg-surface-alt rounded-lg" />
        </div>
        <div className="bg-surface rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface-alt/50 border-b border-border">
                <tr>
                  {Array.from({ length: 9 }).map((_, i) => (
                    <th key={i} className="px-5 py-4">
                      <div className="h-3 w-14 bg-surface-alt rounded" />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-5 py-4"><div className="h-4 w-5 bg-surface-alt rounded" /></td>
                    <td className="px-5 py-4"><div className="h-4 w-32 bg-surface-alt rounded" /></td>
                    <td className="px-5 py-4"><div className="h-5 w-16 bg-surface-alt rounded-full" /></td>
                    <td className="px-5 py-4"><div className="h-4 w-12 bg-surface-alt rounded" /></td>
                    <td className="px-5 py-4"><div className="h-4 w-20 bg-surface-alt rounded" /></td>
                    <td className="px-5 py-4"><div className="h-4 w-24 bg-surface-alt rounded" /></td>
                    <td className="px-5 py-4"><div className="h-4 w-20 bg-surface-alt rounded" /></td>
                    <td className="px-5 py-4"><div className="h-4 w-28 bg-surface-alt rounded" /></td>
                    <td className="px-5 py-4 text-right"><div className="h-7 w-7 bg-surface-alt rounded-lg ml-auto" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  const totalPages   = Math.max(1, Math.ceil(payments.length / PAGE_SIZE));
  const safePage     = Math.min(page, totalPages);
  const pagePayments = payments.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-text">Payments</h1>
          <p className="text-sm text-muted mt-0.5">Transaction history and invoices</p>
        </div>
        <div className="flex items-center gap-3">
          {payments.length > 0 && (
            <p className="text-sm text-muted">{payments.length} total</p>
          )}
          <select
            value={typeFilter}
            onChange={e => { setTypeFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 rounded-lg border border-border bg-surface text-text text-sm outline-none focus:ring-2 focus:ring-focus-ring"
          >
            <option value="">All Types</option>
            <option value="boost">Boost</option>
            <option value="subscription">Subscription</option>
          </select>
        </div>
      </div>

      {payments.length === 0 ? (
        <div className="bg-surface rounded-xl border border-border p-14 text-center">
          <span className="text-5xl block mb-4">💳</span>
          <p className="text-muted">No payments found.</p>
        </div>
      ) : (
        <>
          <div className="bg-surface rounded-xl shadow-sm border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left whitespace-nowrap">
                <thead className="bg-surface-alt/50 border-b border-border text-xs uppercase tracking-wider text-muted font-semibold">
                  <tr>
                    <th className="px-5 py-4">#</th>
                    <th className="px-5 py-4">User</th>
                    <th className="px-5 py-4">Type</th>
                    <th className="px-5 py-4">Amount</th>
                    <th className="px-5 py-4">Method</th>
                    <th className="px-5 py-4">Issue</th>
                    <th className="px-5 py-4">Date</th>
                    <th className="px-5 py-4">Transaction ID</th>
                    <th className="px-5 py-4 text-right">Invoice</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {pagePayments.map((p, idx) => (
                    <tr key={p._id} className="hover:bg-surface-alt/60 transition-colors">
                      <td className="px-5 py-4 text-sm text-muted">{(safePage - 1) * PAGE_SIZE + idx + 1}</td>
                      <td className="px-5 py-4 text-sm text-text max-w-[140px] truncate">
                        {p.userEmail}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${TYPE_STYLES[p.type] || ''}`}>
                          {p.type}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm font-bold text-text">kr{p.amount}</td>
                      <td className="px-5 py-4 text-sm text-muted">
                        {METHOD_LABELS[p.paymentMethod] || '—'}
                      </td>
                      <td className="px-5 py-4 text-sm text-muted max-w-[140px] truncate">
                        {p.issueTitle || '—'}
                      </td>
                      <td className="px-5 py-4 text-sm text-muted">
                        {new Date(p.date).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-4 text-xs text-muted font-mono">
                        {p.transactionId ? p.transactionId.slice(0, 16) + '…' : '—'}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => downloadInvoice(p)}
                          title="Download Invoice"
                          className="p-1.5 rounded-lg text-primary bg-primary/10 hover:bg-primary/20 transition"
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

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 px-1">
              <p className="text-sm text-muted">
                Showing {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, payments.length)} of {payments.length}
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

export default AdminPayments;
