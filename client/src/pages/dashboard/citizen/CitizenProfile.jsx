import { useState, useContext, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';
import { FiX, FiStar, FiAlertTriangle, FiDownload } from 'react-icons/fi';
import { AuthContext } from '../../../context/AuthContext';
import axiosInstance from '../../../api/axiosInstance';
import PhotoUploader from '../../../components/PhotoUploader';

const inputClass =
  'w-full px-4 py-2.5 rounded-lg border dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-[#d4ff00] transition';

const SubscriptionModal = ({ onClose, onConfirm, isPending }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
    <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-sm shadow-xl p-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Premium Subscription</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
          <FiX size={20} />
        </button>
      </div>
      <div className="text-center mb-8">
        <FiStar className="mx-auto text-amber-400 mb-3" size={44} />
        <p className="text-3xl font-black text-gray-900 dark:text-white mb-1">৳1,000</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          One-time payment · Unlimited issue reporting
        </p>
      </div>
      <div className="flex gap-3">
        <button
          onClick={onConfirm}
          disabled={isPending}
          className="flex-1 py-3 bg-[#d4ff00] text-[#1a3a2a] font-bold rounded-lg hover:bg-[#bce600] transition disabled:opacity-50"
        >
          {isPending ? 'Processing…' : 'Confirm Payment'}
        </button>
        <button
          onClick={onClose}
          className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
);

const CitizenProfile = () => {
  const { currentUser, dbUser, refreshDbUser } = useContext(AuthContext);
  const [showSubModal, setShowSubModal] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm({
    defaultValues: { name: '', avatar_url: '' },
  });

  // Sync form whenever dbUser loads or changes
  useEffect(() => {
    if (dbUser) {
      reset({
        name:       dbUser.name       || '',
        avatar_url: dbUser.avatar_url || '',
      });
    }
  }, [dbUser, reset]);

  const { data: payments = [], isLoading: paymentsLoading } = useQuery({
    queryKey: ['myPayments'],
    queryFn: async () => {
      const res = await axiosInstance.get('/payments/mine');
      return res.data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: (updates) => axiosInstance.patch(`/users/${dbUser._id}`, updates),
    onSuccess: async (_, updates) => {
      await refreshDbUser();
      reset({ name: updates.name, avatar_url: updates.avatar_url });
      toast.success('Profile updated!');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Update failed'),
  });

  const subscriptionMutation = useMutation({
    mutationFn: () =>
      axiosInstance.post('/payments', { type: 'subscription', amount: 1000 }),
    onSuccess: async () => {
      setShowSubModal(false);
      await refreshDbUser();
      await Swal.fire({
        icon: 'success',
        title: 'Premium Activated!',
        text: 'You now have unlimited issue reporting.',
        confirmButtonColor: '#1a3a2a',
      });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Payment failed'),
  });

  const downloadPDF = async () => {
    if (payments.length === 0) {
      toast.error('No payment history to download.');
      return;
    }
    try {
      const { jsPDF }      = await import('jspdf');
      const { default: autoTable } = await import('jspdf-autotable');
      const doc = new jsPDF();

      doc.setFontSize(16);
      doc.text('CivicClean — Payment History', 14, 16);
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`User: ${currentUser.email}`, 14, 24);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 30);

      autoTable(doc, {
        startY: 38,
        head: [['#', 'Type', 'Amount (৳)', 'Transaction ID', 'Issue', 'Date']],
        body: payments.map((p, i) => [
          i + 1,
          p.type,
          p.amount,
          p.transactionId || '—',
          p.issueTitle    || '—',
          new Date(p.date).toLocaleDateString(),
        ]),
        styles: { fontSize: 9 },
        headStyles: { fillColor: [26, 58, 42] },
      });

      doc.save(`civicclean-payments-${Date.now()}.pdf`);
    } catch {
      toast.error('Failed to generate PDF.');
    }
  };

  const photoSrc = dbUser?.avatar_url || currentUser?.photoURL || null;
  const displayName = dbUser?.name || currentUser?.displayName || 'User';

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white mb-6">Profile</h1>

      {/* Blocked warning */}
      {dbUser?.isBlocked && (
        <div className="flex items-center gap-3 mb-6 px-5 py-4 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-xl text-red-700 dark:text-red-400">
          <FiAlertTriangle size={20} className="flex-shrink-0" />
          <p className="font-medium">
            Your account has been blocked. Please contact the authorities.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile card + edit form */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border dark:border-gray-700 p-6">
          {/* Photo uploader */}
          <PhotoUploader
            currentUrl={photoSrc}
            displayName={displayName}
            onUploadComplete={(url) => setValue('avatar_url', url)}
          />

          {/* Name + meta */}
          <div className="mb-6">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">{displayName}</h2>
              {dbUser?.isPremium && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 text-xs font-bold">
                  <FiStar size={10} /> Premium
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{currentUser?.email}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              Issues reported: <strong>{dbUser?.issueCount ?? 0}</strong>
            </p>
          </div>

          {/* Edit form */}
          <form onSubmit={handleSubmit((data) => updateMutation.mutate(data))} className="space-y-4">
            <input type="hidden" {...register('avatar_url')} />
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Display Name
              </label>
              <input
                {...register('name', { required: 'Name is required' })}
                className={inputClass}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="w-full py-2.5 bg-[#1a3a2a] text-[#d4ff00] font-bold rounded-lg hover:bg-[#2c5f45] transition disabled:opacity-60"
            >
              {updateMutation.isPending ? 'Saving…' : 'Save Profile'}
            </button>
          </form>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-6">
          {/* Premium section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border dark:border-gray-700 p-6">
            {dbUser?.isPremium ? (
              <div className="text-center py-4">
                <FiStar className="mx-auto text-amber-400 mb-3" size={36} />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                  Premium Member
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  You have unlimited issue reporting access.
                </p>
              </div>
            ) : (
              <>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  Upgrade to Premium
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
                  Free accounts can submit up to 3 issues. Subscribe to remove all limits.
                </p>
                <button
                  onClick={() => setShowSubModal(true)}
                  className="w-full py-3 bg-[#d4ff00] text-[#1a3a2a] font-bold rounded-lg hover:bg-[#bce600] transition"
                >
                  Subscribe for Unlimited Reporting
                </button>
              </>
            )}
          </div>

          {/* Payment history */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border dark:border-gray-700 p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Payment History</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
              {paymentsLoading
                ? 'Loading…'
                : `${payments.length} transaction${payments.length !== 1 ? 's' : ''} on record`}
            </p>
            <button
              onClick={downloadPDF}
              disabled={paymentsLoading}
              className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-[#1a3a2a] dark:border-[#d4ff00] text-[#1a3a2a] dark:text-[#d4ff00] font-bold rounded-lg hover:bg-[#1a3a2a] hover:text-white dark:hover:bg-[#d4ff00] dark:hover:text-[#1a3a2a] transition disabled:opacity-50"
            >
              <FiDownload size={16} />
              Download PDF
            </button>
          </div>
        </div>
      </div>

      {showSubModal && (
        <SubscriptionModal
          onClose={() => setShowSubModal(false)}
          onConfirm={() => subscriptionMutation.mutate()}
          isPending={subscriptionMutation.isPending}
        />
      )}
    </div>
  );
};

export default CitizenProfile;
