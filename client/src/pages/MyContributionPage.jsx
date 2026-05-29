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
      doc.setTextColor(26, 58, 42);
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
        body: [
          [contribution.issueTitle || 'N/A', `${contribution.amount || 0} kr`]
        ],
        headStyles: { fillColor: [26, 58, 42], textColor: [212, 255, 0] },
        theme: 'grid',
      });

      const finalY = (doc.lastAutoTable?.finalY || 100) + 30;
      doc.setFontSize(14);
      doc.setTextColor(26, 58, 42);
      doc.text('Thank you for contributing to a cleaner community!', 105, finalY, { align: 'center' });

      doc.save(`CivicClean_Receipt_${receiptId.substring(0, 8)}.pdf`);
      toast.success('Receipt downloaded successfully!');
    } catch (error) {
      console.error('Failed to download receipt:', error);
      toast.error('Failed to download receipt.');
    }
  };

  const totalAmount = contributions.reduce((sum, c) => sum + (c.amount || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-7xl mx-auto space-y-8">

        <Fade direction="down" triggerOnce>
          <div className="mb-2">
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#1a3a2a] dark:text-white mb-2">My Contributions</h1>
            <p className="text-gray-600 dark:text-gray-400">Track the impact of your funding towards resolving community issues.</p>
          </div>
        </Fade>

        {isLoading ? (
          <div className="flex flex-col justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#1a3a2a] dark:border-[#d4ff00]"></div>
          </div>
        ) : contributions.length === 0 ? (
          <Fade triggerOnce>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-12 text-center">
              <span className="text-6xl mb-6 block">🌱</span>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">No contributions yet.</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
                Help fund community clean-ups and track your receipts here. Every contribution counts!
              </p>
              <Link
                to="/all-issues"
                className="inline-block px-8 py-4 bg-[#1a3a2a] text-[#d4ff00] dark:bg-[#d4ff00] dark:text-[#1a3a2a] text-lg font-bold rounded-lg shadow-lg hover:opacity-90 transition-opacity"
              >
                Browse Open Issues
              </Link>
            </div>
          </Fade>
        ) : (
          <>
            <Fade direction="up" triggerOnce>
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse whitespace-nowrap">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 uppercase text-xs tracking-wider font-semibold">
                        <th className="py-4 px-6">#</th>
                        <th className="py-4 px-6">Issue Title</th>
                        <th className="py-4 px-6">Amount Paid (kr)</th>
                        <th className="py-4 px-6">Date</th>
                        <th className="py-4 px-6 text-right">Receipt</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {contributions.map((c, index) => (
                        <tr key={c._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                          <td className="py-4 px-6 text-sm text-gray-500 dark:text-gray-400 font-medium">
                            {index + 1}
                          </td>
                          <td className="py-4 px-6">
                            <div className="font-bold text-gray-900 dark:text-white max-w-[300px] truncate" title={c.issueTitle}>
                              {c.issueTitle}
                            </div>
                          </td>
                          <td className="py-4 px-6 font-semibold text-[#1a3a2a] dark:text-[#d4ff00]">
                            {c.amount}
                          </td>
                          <td className="py-4 px-6 text-sm text-gray-500 dark:text-gray-400">
                            {new Date(c.date).toLocaleDateString()}
                          </td>
                          <td className="py-4 px-6 text-right">
                            <button
                              onClick={() => downloadReceipt(c)}
                              className="inline-flex items-center px-4 py-2 bg-[#d4ff00] text-[#1a3a2a] rounded-lg text-sm font-bold hover:bg-[#bce600] transition-colors shadow-sm"
                            >
                              <FiDownload className="mr-2" /> Download
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
              <div className="bg-[#1a3a2a] dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden p-8 flex flex-col md:flex-row items-center justify-between text-white border border-transparent dark:border-gray-700">
                <div className="flex items-center mb-6 md:mb-0">
                  <div className="text-6xl mr-6">🌿</div>
                  <div>
                    <h3 className="text-2xl font-bold mb-1">Thank You!</h3>
                    <p className="text-green-100 dark:text-gray-400">Your contributions are making the community cleaner and safer.</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-6">
                  <div className="bg-white/10 rounded-xl p-5 backdrop-blur-sm min-w-[150px] text-center border border-white/20">
                    <p className="text-sm text-green-200 dark:text-gray-400 uppercase tracking-widest mb-1 font-semibold">Total Issues</p>
                    <p className="text-3xl font-extrabold text-[#d4ff00]">{contributions.length}</p>
                  </div>
                  <div className="bg-white/10 rounded-xl p-5 backdrop-blur-sm min-w-[150px] text-center border border-white/20">
                    <p className="text-sm text-green-200 dark:text-gray-400 uppercase tracking-widest mb-1 font-semibold">Total Funded</p>
                    <p className="text-3xl font-extrabold text-[#d4ff00]">{totalAmount} kr</p>
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
