import React, { useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AuthContext } from '../context/AuthContext';
import axiosInstance from '../api/axiosInstance';
import { Fade } from 'react-awesome-reveal';
import toast from 'react-hot-toast';
import { FiDownload } from 'react-icons/fi';
import jsPDF from 'jspdf';
import { autoTable } from 'jspdf-autotable';

const MyContributionPage = () => {
  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    document.title = "CivicClean | My Contributions";
  }, []);

  const { data: contributions = [], isLoading } = useQuery({
    queryKey: ['myContributions', currentUser?.email],
    queryFn: async () => {
      const res = await axiosInstance.get(`/donations?email=${encodeURIComponent(currentUser.email)}`);
      return res.data;
    },
    enabled: !!currentUser?.email,
  });

  const downloadReceipt = (contribution) => {
    try {
      const doc = new jsPDF();
      const receiptId = contribution._id || 'receipt';
      const contributionDate = contribution.date
        ? new Date(contribution.date).toLocaleDateString()
        : 'N/A';

      doc.setFontSize(22);
      doc.setTextColor(48, 109, 41);
      doc.text('CivicClean Receipt', 105, 20, { align: 'center' });

      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text('Official clean-up contribution record', 105, 28, { align: 'center' });

      doc.setDrawColor(200);
      doc.line(20, 35, 190, 35);

      doc.setFontSize(12);
      doc.setTextColor(40);
      doc.text('Contributor Details:', 20, 45);
      doc.setFontSize(11);
      doc.text(`Name: ${contribution.name || 'N/A'}`, 20, 52);
      doc.text(`Email: ${contribution.email || 'N/A'}`, 20, 58);
      doc.text(`Date: ${contributionDate}`, 20, 64);
      doc.text(`Receipt ID: ${receiptId}`, 20, 70);

      autoTable(doc, {
        startY: 80,
        head: [['Issue Title', 'Amount (kr)']],
        body: [[contribution.issueTitle || 'N/A', `${contribution.amount || 0} kr`]],
        headStyles: { fillColor: [48, 109, 41] },
        theme: 'grid',
      });

      const finalY = (doc.lastAutoTable?.finalY || 100) + 30;
      doc.setFontSize(14);
      doc.setTextColor(48, 109, 41);
      doc.text('Thank you for contributing to a cleaner community!', 105, finalY, { align: 'center' });

      doc.save(`CivicClean_Receipt_${receiptId.substring(0, 8)}.pdf`);
      toast.success('Receipt downloaded successfully!');
    } catch (error) {
      toast.error('Failed to download receipt.');
    }
  };

  const totalAmount = contributions.reduce((sum, c) => sum + (c.amount || 0), 0);

  return (
    <div className="min-h-screen bg-bg py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-7xl mx-auto space-y-8">

        <Fade direction="down" triggerOnce>
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-text mb-2">My Contributions</h1>
            <p className="text-muted">Track the impact of your funding towards resolving community issues.</p>
          </div>
        </Fade>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary" />
          </div>
        ) : contributions.length === 0 ? (
          <Fade triggerOnce>
            <div className="bg-surface rounded-xl shadow-sm border border-border p-12 text-center">
              <span className="text-6xl mb-6 block">🌱</span>
              <h3 className="text-2xl font-bold text-text mb-3">No contributions yet.</h3>
              <p className="text-muted mb-8 max-w-md mx-auto">
                Help fund community clean-ups and track your receipts here. Every contribution counts!
              </p>
              <Link
                to="/explore"
                className="inline-block px-8 py-4 bg-primary text-on-primary text-lg font-bold rounded-lg shadow-lg hover:bg-primary-hover transition-colors"
              >
                Browse Open Issues
              </Link>
            </div>
          </Fade>
        ) : (
          <>
            <Fade direction="up" triggerOnce>
              <div className="bg-surface rounded-xl shadow-sm border border-border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left whitespace-nowrap">
                    <thead>
                      <tr className="bg-surface-alt/50 border-b border-border text-muted uppercase text-xs tracking-wider font-semibold">
                        <th className="py-4 px-6">#</th>
                        <th className="py-4 px-6">Issue Title</th>
                        <th className="py-4 px-6">Amount Paid (kr)</th>
                        <th className="py-4 px-6">Date</th>
                        <th className="py-4 px-6 text-right">Receipt</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {contributions.map((c, index) => (
                        <tr key={c._id} className="hover:bg-surface-alt/60 transition-colors">
                          <td className="py-4 px-6 text-sm text-muted font-medium">{index + 1}</td>
                          <td className="py-4 px-6">
                            <div className="font-bold text-text max-w-[300px] truncate" title={c.issueTitle}>
                              {c.issueTitle}
                            </div>
                          </td>
                          <td className="py-4 px-6 font-semibold text-primary">{c.amount}</td>
                          <td className="py-4 px-6 text-sm text-muted">
                            {new Date(c.date).toLocaleDateString()}
                          </td>
                          <td className="py-4 px-6 text-right">
                            <button
                              onClick={() => downloadReceipt(c)}
                              className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary/10 text-primary rounded-lg text-sm font-bold hover:bg-primary/20 transition-colors"
                            >
                              <FiDownload size={14} /> Download
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </Fade>

            <Fade direction="up" triggerOnce delay={100}>
              <div className="bg-primary rounded-xl shadow-xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4 sm:gap-6">
                  <div className="text-5xl sm:text-6xl">🌿</div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-on-primary mb-1">Thank You!</h3>
                    <p className="text-on-primary/70 text-sm sm:text-base">
                      Your contributions are making the community cleaner and safer.
                    </p>
                  </div>
                </div>

                <div className="flex flex-row sm:flex-col md:flex-row gap-4 w-full sm:w-auto">
                  <div className="flex-1 sm:flex-none bg-on-primary/10 rounded-xl p-4 sm:p-5 text-center border border-on-primary/20 min-w-[130px]">
                    <p className="text-xs text-on-primary/60 uppercase tracking-widest mb-1 font-semibold">Total Issues</p>
                    <p className="text-2xl sm:text-3xl font-extrabold text-on-primary">{contributions.length}</p>
                  </div>
                  <div className="flex-1 sm:flex-none bg-on-primary/10 rounded-xl p-4 sm:p-5 text-center border border-on-primary/20 min-w-[130px]">
                    <p className="text-xs text-on-primary/60 uppercase tracking-widest mb-1 font-semibold">Total Funded</p>
                    <p className="text-2xl sm:text-3xl font-extrabold text-on-primary">{totalAmount} kr</p>
                  </div>
                </div>
              </div>
            </Fade>
          </>
        )}
      </div>
    </div>
  );
};

export default MyContributionPage;
