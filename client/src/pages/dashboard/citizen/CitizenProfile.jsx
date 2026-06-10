import { useState, useContext, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FiX, FiStar, FiAlertTriangle, FiDownload } from 'react-icons/fi';
import { AuthContext } from '../../../context/AuthContext';
import axiosInstance from '../../../api/axiosInstance';
import PhotoUploader from '../../../components/PhotoUploader';
import { getUploadErrorMessage, uploadPhotoWithFallback } from '../../../utils/uploadPhoto';

const inputClass =
  'w-full px-4 py-2.5 rounded-lg border border-border bg-surface-alt text-text outline-none focus:ring-2 focus:ring-focus-ring transition';

const PAYMENT_METHODS = [
  { value: 'mobile-banking', label: 'Mobile Banking' },
  { value: 'card', label: 'Card' },
  { value: 'bank-transfer', label: 'Bank Transfer' },
];

const SubscriptionModal = ({ onClose, onConfirm, isPending, paymentMethod, onPaymentMethodChange }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay/50 p-4">
    <div className="bg-surface rounded-2xl w-full max-w-sm shadow-xl p-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-text">Premium Subscription</h3>
        <button
          onClick={onClose}
          disabled={isPending}
          className="text-muted hover:text-text disabled:opacity-50"
        >
          <FiX size={20} />
        </button>
      </div>
      <div className="text-center mb-6">
        <FiStar className="mx-auto text-amber-400 mb-3" size={44} />
        <p className="text-3xl font-black text-text mb-1">1,000 kr</p>
        <p className="text-sm text-muted">
          One-time payment · Unlimited issue reporting
        </p>
      </div>

      <div className="mb-6">
        <p className="text-sm font-semibold text-text mb-2">Payment Method</p>
        <div className="grid gap-2">
          {PAYMENT_METHODS.map(method => (
            <label
              key={method.value}
              className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 cursor-pointer transition ${
                paymentMethod === method.value
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:bg-surface-alt'
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value={method.value}
                checked={paymentMethod === method.value}
                onChange={(e) => onPaymentMethodChange(e.target.value)}
                disabled={isPending}
                className="accent-primary"
              />
              <span className="text-sm font-medium text-text">{method.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onConfirm}
          disabled={isPending}
          className="flex-1 py-3 bg-primary text-on-primary font-bold rounded-lg hover:bg-primary-hover transition disabled:opacity-50"
        >
          {isPending ? 'Processing…' : 'Confirm Payment'}
        </button>
        <button
          onClick={onClose}
          className="flex-1 py-3 bg-surface-alt text-text font-medium rounded-lg hover:bg-border/30 transition"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
);

const CitizenProfile = () => {
  const { currentUser, dbUser, refreshDbUser, updateCurrentUserProfile } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const [showSubModal, setShowSubModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('mobile-banking');
  const [photoFile, setPhotoFile] = useState(null);

  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm({
    defaultValues: { name: '', avatar_url: '' },
  });

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
    mutationFn: async (updates) => {
      if (!dbUser?._id) {
        throw new Error('Profile is still loading. Please try again.');
      }

      const avatar_url = photoFile
        ? await uploadPhotoWithFallback(photoFile, { folder: 'avatars' })
        : updates.avatar_url || dbUser.avatar_url || '';

      return axiosInstance.patch(`/users/${dbUser._id}`, { ...updates, avatar_url });
    },
    onSuccess: async (response) => {
      const updated = response.data;
      updateCurrentUserProfile({
        name: updated.name || '',
        avatar_url: updated.avatar_url || '',
      });
      const refreshed = await refreshDbUser();
      const latest = refreshed || updated;
      reset({ name: latest.name || '', avatar_url: latest.avatar_url || '' });
      setPhotoFile(null);
      toast.success('Profile updated!');
    },
    onError: (err) => toast.error(err.response?.data?.message || getUploadErrorMessage(err) || 'Update failed'),
  });

  const subscriptionMutation = useMutation({
    mutationFn: () => {
      if (dbUser?.isPremium) {
        throw new Error('Your account is already premium.');
      }
      return axiosInstance.post('/payments', {
        type: 'subscription',
        amount: 1000,
        paymentMethod,
      });
    },
    onSuccess: async (response) => {
      setShowSubModal(false);
      setPaymentMethod('mobile-banking');
      await refreshDbUser();
      queryClient.invalidateQueries({ queryKey: ['myPayments'] });
      queryClient.invalidateQueries({ queryKey: ['adminPayments'] });
      const txId = response.data?.transactionId || 'N/A';
      toast.success(`Premium Activated! You now have unlimited issue reporting. Transaction ID: ${txId}`);
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
        head: [['#', 'Type', 'Amount (kr)', 'Transaction ID', 'Issue', 'Date']],
        body: payments.map((p, i) => [
          i + 1,
          p.type,
          p.amount,
          p.transactionId || '—',
          p.issueTitle    || '—',
          new Date(p.date).toLocaleDateString(),
        ]),
        styles: { fontSize: 9 },
        headStyles: { fillColor: [48, 109, 41] },
      });

      doc.save(`civicclean-payments-${Date.now()}.pdf`);
    } catch {
      toast.error('Failed to generate PDF.');
    }
  };

  const avatarUrl = watch('avatar_url');
  const photoSrc = avatarUrl || dbUser?.avatar_url || currentUser?.photoURL || null;
  const displayName = dbUser?.name || currentUser?.displayName || 'User';

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-extrabold text-text mb-6">Profile</h1>

      {dbUser?.isBlocked && (
        <div className="flex items-center gap-3 mb-6 px-5 py-4 bg-danger/5 border border-danger/30 rounded-xl text-danger">
          <FiAlertTriangle size={20} className="flex-shrink-0" />
          <p className="font-medium">
            Your account has been blocked. Please contact the authorities.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
        <div className="bg-surface rounded-2xl shadow-sm border border-border p-6">
          <PhotoUploader
            currentUrl={photoSrc}
            displayName={displayName}
            uploadOnSelect={false}
            onFileSelected={(file) => {
              setPhotoFile(file);
              setValue('avatar_url', avatarUrl || dbUser?.avatar_url || '', { shouldDirty: true });
            }}
          />

          <div className="mb-6">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-bold text-text">{displayName}</h2>
              {dbUser?.isPremium && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 text-xs font-bold">
                  <FiStar size={10} /> Premium
                </span>
              )}
            </div>
            <p className="text-sm text-muted">{currentUser?.email}</p>
            <p className="text-xs text-muted mt-0.5">
              Issues reported: <strong>{dbUser?.issueCount ?? 0}</strong>
            </p>
          </div>

          <form onSubmit={handleSubmit((data) => updateMutation.mutate(data))} className="space-y-4" noValidate>
            <input type="hidden" {...register('avatar_url')} />
            <div>
              <label htmlFor="citizen-display-name" className="block text-sm font-semibold text-text mb-1.5">
                Display Name
              </label>
              <input
                id="citizen-display-name"
                autoComplete="name"
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? 'citizen-name-error' : undefined}
                {...register('name', {
                  required: 'Name is required',
                  minLength: { value: 2, message: 'Name must be at least 2 characters' },
                  maxLength: { value: 60, message: 'Name must be 60 characters or fewer' },
                })}
                className={inputClass}
              />
              {errors.name && <p id="citizen-name-error" role="alert" className="text-danger text-xs mt-1">{errors.name.message}</p>}
            </div>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="w-full py-2.5 bg-primary text-on-primary font-bold rounded-lg hover:bg-primary-hover transition disabled:opacity-60"
            >
              {updateMutation.isPending ? 'Uploading and saving…' : 'Save Profile'}
            </button>
          </form>
        </div>

        <div className="flex flex-col gap-6">
          <div className="bg-surface rounded-2xl shadow-sm border border-border p-6">
            {dbUser?.isPremium ? (
              <div className="text-center py-4">
                <FiStar className="mx-auto text-amber-400 mb-3" size={36} />
                <h3 className="text-lg font-bold text-text mb-1">
                  Premium Member
                </h3>
                <p className="text-sm text-muted">
                  You have unlimited issue reporting access.
                </p>
              </div>
            ) : (
              <>
                <h3 className="text-lg font-bold text-text mb-2">
                  Upgrade to Premium
                </h3>
                <p className="text-sm text-muted mb-5">
                  Free accounts can submit up to 3 issues. Subscribe to remove all limits.
                </p>
                <button
                  onClick={() => setShowSubModal(true)}
                  className="w-full py-3 bg-primary text-on-primary font-bold rounded-lg hover:bg-primary-hover transition"
                >
                  Subscribe for Unlimited Reporting
                </button>
              </>
            )}
          </div>

          <div className="bg-surface rounded-2xl shadow-sm border border-border p-6">
            <h3 className="text-lg font-bold text-text mb-2">Payment History</h3>
            <p className="text-sm text-muted mb-5">
              {paymentsLoading
                ? 'Loading…'
                : `${payments.length} transaction${payments.length !== 1 ? 's' : ''} on record`}
            </p>
            <button
              onClick={downloadPDF}
              disabled={paymentsLoading}
              className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-primary text-primary font-bold rounded-lg hover:bg-primary hover:text-on-primary transition disabled:opacity-50"
            >
              <FiDownload size={16} />
              Download PDF
            </button>
          </div>
        </div>
      </div>

      {showSubModal && (
        <SubscriptionModal
          onClose={() => !subscriptionMutation.isPending && setShowSubModal(false)}
          onConfirm={() => subscriptionMutation.mutate()}
          isPending={subscriptionMutation.isPending}
          paymentMethod={paymentMethod}
          onPaymentMethodChange={setPaymentMethod}
        />
      )}
    </div>
  );
};

export default CitizenProfile;
