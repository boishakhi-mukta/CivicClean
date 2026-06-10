import { useState, useContext, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import {
  FiX, FiStar, FiAlertTriangle, FiDownload, FiUser, FiMail,
  FiCheckCircle, FiFileText, FiLock, FiEdit2, FiPhone,
  FiEye, FiEyeOff, FiChevronDown,
} from 'react-icons/fi';
import { AuthContext } from '../../../context/AuthContext';
import axiosInstance from '../../../api/axiosInstance';
import PhotoUploader from '../../../components/PhotoUploader';
import { getUploadErrorMessage, uploadPhotoWithFallback } from '../../../utils/uploadPhoto';

const inputClass =
  'w-full px-4 py-2.5 rounded-lg border border-border bg-surface-alt text-text outline-none focus:ring-2 focus:ring-focus-ring transition text-sm';

const PAYMENT_METHODS = [
  { value: 'mobile-banking', label: 'Mobile Banking' },
  { value: 'card',           label: 'Card' },
  { value: 'bank-transfer',  label: 'Bank Transfer' },
];

const getPasswordError = (code) => {
  switch (code) {
    case 'auth/wrong-password':
    case 'auth/invalid-credential': return 'Current password is incorrect.';
    case 'auth/too-many-requests':  return 'Too many attempts. Please wait and try again.';
    case 'auth/requires-recent-login': return 'Session expired. Please log out and sign in again.';
    default: return 'Password update failed. Please try again.';
  }
};

/* ── Show/hide password field ── */
const PasswordInput = ({ id, placeholder, registration, error }) => {
  const [show, setShow] = useState(false);
  return (
    <div>
      <div className="relative">
        <FiLock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
        <input
          id={id}
          type={show ? 'text' : 'password'}
          placeholder={placeholder}
          autoComplete="off"
          className={`${inputClass} pl-9 pr-10`}
          {...registration}
        />
        <button
          type="button"
          onClick={() => setShow(v => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text transition"
          tabIndex={-1}
        >
          {show ? <FiEyeOff size={14} /> : <FiEye size={14} />}
        </button>
      </div>
      {error && <p role="alert" className="text-danger text-xs mt-1">{error}</p>}
    </div>
  );
};

/* ── Subscription modal ── */
const SubscriptionModal = ({ onClose, onConfirm, isPending, paymentMethod, onPaymentMethodChange }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay/50 p-4">
    <div className="bg-surface rounded-2xl w-full max-w-sm shadow-xl p-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-text">Premium Subscription</h3>
        <button onClick={onClose} disabled={isPending} className="text-muted hover:text-text disabled:opacity-50">
          <FiX size={20} />
        </button>
      </div>
      <div className="text-center mb-6">
        <FiStar className="mx-auto text-amber-400 mb-3" size={44} />
        <p className="text-3xl font-black text-text mb-1">1,000 kr</p>
        <p className="text-sm text-muted">One-time payment · Unlimited issue reporting</p>
      </div>
      <div className="mb-6">
        <p className="text-sm font-semibold text-text mb-2">Payment Method</p>
        <div className="grid gap-2">
          {PAYMENT_METHODS.map(method => (
            <label
              key={method.value}
              className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 cursor-pointer transition ${
                paymentMethod === method.value ? 'border-primary bg-primary/10' : 'border-border hover:bg-surface-alt'
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value={method.value}
                checked={paymentMethod === method.value}
                onChange={e => onPaymentMethodChange(e.target.value)}
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
        <button onClick={onClose} className="flex-1 py-3 bg-surface-alt text-text font-medium rounded-lg hover:bg-border/30 transition">
          Cancel
        </button>
      </div>
    </div>
  </div>
);

/* ── Read-only info row ── */
const InfoRow = ({ label, value, fallback = '—' }) => (
  <div className="flex items-start gap-3 py-3 border-b border-border last:border-0">
    <span className="text-sm text-muted w-32 flex-shrink-0">{label}</span>
    <span className="text-sm text-text font-medium break-all">{value || fallback}</span>
  </div>
);

/* ── Edit form (profile + password) ── */
const EditForm = ({ dbUser, currentUser, photoSrc, displayName, onSuccess, onCancel }) => {
  const { updateCurrentUserProfile, refreshDbUser, changePassword } = useContext(AuthContext);
  const [photoFile,   setPhotoFile]  = useState(null);
  const [pwExpanded,  setPwExpanded] = useState(false);
  const [formError,   setFormError]  = useState('');
  const [submitting,  setSubmitting] = useState(false);

  const isPwProvider = currentUser?.providerData?.some(p => p.providerId === 'password');

  const { register, handleSubmit, formState: { errors }, reset, setValue, watch, getValues } = useForm({
    defaultValues: {
      name: dbUser?.name || '', tNumber: dbUser?.tNumber || '', avatar_url: dbUser?.avatar_url || '',
      currentPassword: '', newPassword: '', confirmPassword: '',
    },
  });

  useEffect(() => {
    if (dbUser) {
      reset({
        name: dbUser.name || '', tNumber: dbUser.tNumber || '', avatar_url: dbUser.avatar_url || '',
        currentPassword: '', newPassword: '', confirmPassword: '',
      });
    }
  }, [dbUser, reset]);

  const avatarVal = watch('avatar_url');

  const onSubmit = async (data) => {
    setSubmitting(true);
    setFormError('');
    try {
      const avatar_url = photoFile
        ? await uploadPhotoWithFallback(photoFile, { folder: 'avatars' })
        : data.avatar_url || dbUser?.avatar_url || '';
      const res = await axiosInstance.patch(`/users/${dbUser._id}`, {
        name: data.name, tNumber: data.tNumber, avatar_url,
      });
      updateCurrentUserProfile({ name: res.data.name || '', avatar_url: res.data.avatar_url || '' });
      await refreshDbUser();

      if (isPwProvider && data.currentPassword) {
        await changePassword(data.currentPassword, data.newPassword);
        toast.success('Profile & password updated!');
      } else {
        toast.success('Profile updated!');
      }
      onSuccess();
    } catch (err) {
      const pwErr = err.code ? getPasswordError(err.code) : null;
      setFormError(pwErr || err.response?.data?.message || getUploadErrorMessage(err) || 'Update failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-surface rounded-2xl border border-border p-6">
      <div className="flex items-center justify-between mb-5 pb-4 border-b border-border">
        <h3 className="text-sm font-bold text-text uppercase tracking-wider">Edit Profile</h3>
        <button onClick={onCancel} type="button" className="text-muted hover:text-text transition">
          <FiX size={18} />
        </button>
      </div>

      <PhotoUploader
        currentUrl={avatarVal || photoSrc}
        displayName={displayName}
        uploadOnSelect={false}
        onFileSelected={(file) => {
          setPhotoFile(file);
          setValue('avatar_url', avatarVal || dbUser?.avatar_url || '', { shouldDirty: true });
        }}
      />

      <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-4" noValidate>
        <input type="hidden" {...register('avatar_url')} />

        {formError && (
          <div className="px-4 py-3 bg-danger/8 border border-danger/20 rounded-xl text-sm text-danger font-medium">
            {formError}
          </div>
        )}

        <div>
          <label htmlFor="cp-name" className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
            Display Name
          </label>
          <div className="relative">
            <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={14} />
            <input
              id="cp-name"
              autoComplete="name"
              aria-invalid={!!errors.name}
              {...register('name', {
                required: 'Name is required',
                minLength: { value: 2, message: 'At least 2 characters' },
                maxLength: { value: 60, message: 'Max 60 characters' },
              })}
              className={`${inputClass} pl-9`}
            />
          </div>
          {errors.name && <p role="alert" className="text-danger text-xs mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <label htmlFor="cp-phone" className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
            Phone Number
          </label>
          <div className="relative">
            <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={14} />
            <input
              id="cp-phone"
              type="tel"
              autoComplete="tel"
              placeholder="+1 234 567 8900"
              {...register('tNumber', {
                pattern: { value: /^[+\d\s\-().]{6,20}$/, message: 'Enter a valid phone number' },
              })}
              className={`${inputClass} pl-9`}
            />
          </div>
          {errors.tNumber && <p role="alert" className="text-danger text-xs mt-1">{errors.tNumber.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">Email Address</label>
          <div className="relative">
            <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={14} />
            <input value={currentUser?.email || ''} disabled readOnly className={`${inputClass} pl-9 opacity-60 cursor-not-allowed`} />
          </div>
          <p className="text-xs text-muted mt-1">Email cannot be changed here.</p>
        </div>

        {/* ── Change Password (collapsible) ── */}
        <div className="pt-2 border-t border-border">
          <button
            type="button"
            onClick={() => setPwExpanded(v => !v)}
            className="flex items-center gap-2 text-sm font-semibold text-text hover:text-primary transition w-full"
          >
            <FiLock size={14} className="text-muted" />
            <span className="flex-1 text-left">Change Password</span>
            <span className="text-xs text-muted font-normal">optional</span>
            <FiChevronDown size={14} className={`text-muted transition-transform duration-200 ${pwExpanded ? 'rotate-180' : ''}`} />
          </button>

          {pwExpanded && (
            <div className="mt-4 space-y-3">
              {!isPwProvider ? (
                <p className="text-sm text-muted bg-surface-alt rounded-xl px-4 py-3 border border-border">
                  Your account uses Google sign-in — password change is not available.
                </p>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">Current Password</label>
                    <PasswordInput
                      id="cp-curr-pw"
                      placeholder="Enter current password"
                      registration={register('currentPassword')}
                      error={errors.currentPassword?.message}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">New Password</label>
                    <PasswordInput
                      id="cp-new-pw"
                      placeholder="Min 6 characters"
                      registration={register('newPassword', {
                        validate: v => !getValues('currentPassword') || v.length >= 6 || 'At least 6 characters',
                      })}
                      error={errors.newPassword?.message}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">Confirm New Password</label>
                    <PasswordInput
                      id="cp-conf-pw"
                      placeholder="Repeat new password"
                      registration={register('confirmPassword', {
                        validate: v => !getValues('currentPassword') || v === getValues('newPassword') || 'Passwords do not match',
                      })}
                      error={errors.confirmPassword?.message}
                    />
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 py-2.5 bg-primary text-on-primary font-bold rounded-xl hover:bg-primary-hover transition disabled:opacity-60 text-sm"
          >
            {submitting ? 'Saving…' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 bg-surface-alt text-text font-semibold rounded-xl hover:bg-border/40 transition text-sm border border-border"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

/* ═══════════════════════════════════════════ */

const CitizenProfile = () => {
  const { currentUser, dbUser, refreshDbUser } = useContext(AuthContext);
  const queryClient   = useQueryClient();
  const [isEditing,      setIsEditing]      = useState(false);
  const [showSubModal,   setShowSubModal]   = useState(false);
  const [paymentMethod,  setPaymentMethod]  = useState('mobile-banking');

  const { data: payments = [], isLoading: paymentsLoading } = useQuery({
    queryKey: ['myPayments'],
    queryFn: async () => (await axiosInstance.get('/payments/mine')).data,
  });

  const subscriptionMutation = useMutation({
    mutationFn: () => {
      if (dbUser?.isPremium) throw new Error('Already premium.');
      return axiosInstance.post('/payments', { type: 'subscription', amount: 1000, paymentMethod });
    },
    onSuccess: async (response) => {
      setShowSubModal(false);
      setPaymentMethod('mobile-banking');
      await refreshDbUser();
      queryClient.invalidateQueries({ queryKey: ['myPayments'] });
      queryClient.invalidateQueries({ queryKey: ['adminPayments'] });
      toast.success(`Premium Activated! Transaction ID: ${response.data?.transactionId || 'N/A'}`);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Payment failed'),
  });

  const downloadPDF = async () => {
    if (payments.length === 0) { toast.error('No payment history to download.'); return; }
    try {
      const { jsPDF }              = await import('jspdf');
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
        body: payments.map((p, i) => [i + 1, p.type, p.amount, p.transactionId || '—', p.issueTitle || '—', new Date(p.date).toLocaleDateString()]),
        styles: { fontSize: 9 },
        headStyles: { fillColor: [48, 109, 41] },
      });
      doc.save(`civicclean-payments-${Date.now()}.pdf`);
    } catch {
      toast.error('Failed to generate PDF.');
    }
  };

  const photoSrc    = dbUser?.avatar_url || currentUser?.photoURL || null;
  const displayName = dbUser?.name || currentUser?.displayName || 'User';
  const initials    = displayName.charAt(0).toUpperCase();

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {dbUser?.isBlocked && (
        <div className="flex items-center gap-3 px-5 py-4 bg-danger/5 border border-danger/30 rounded-xl text-danger">
          <FiAlertTriangle size={20} className="flex-shrink-0" />
          <p className="font-medium">Your account has been blocked. Please contact the authorities.</p>
        </div>
      )}

      {/* ── Profile hero ── */}
      <div className="bg-surface rounded-2xl border border-border">
        <div className="h-32 bg-primary relative rounded-t-2xl overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)',
              backgroundSize: '28px 28px',
            }}
          />
          <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full bg-white/5 pointer-events-none" />
          <div className="absolute -top-8 -left-8 w-28 h-28 rounded-full bg-white/5 pointer-events-none" />
        </div>

        <div className="px-6 pb-6">
          <div className="-mt-11 mb-4 relative z-10">
            {photoSrc ? (
              <img src={photoSrc} alt="Avatar" className="w-[84px] h-[84px] rounded-2xl object-cover border-4 border-surface shadow-lg" />
            ) : (
              <div className="w-[84px] h-[84px] rounded-2xl bg-primary flex items-center justify-center text-on-primary text-3xl font-black border-4 border-surface shadow-lg">
                {initials}
              </div>
            )}
          </div>

          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h2 className="text-xl font-extrabold text-text">{displayName}</h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold">
                  Citizen
                </span>
                {dbUser?.isPremium && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 text-xs font-bold">
                    <FiStar size={10} /> Premium
                  </span>
                )}
              </div>
              <p className="text-sm text-muted">{currentUser?.email}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                Active
              </span>
              <button
                onClick={() => setIsEditing(v => !v)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-border bg-surface-alt text-text text-xs font-semibold hover:bg-border/40 transition"
              >
                <FiEdit2 size={12} />
                {isEditing ? 'View Profile' : 'Edit Profile'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: 'Issues Reported', value: dbUser?.issueCount ?? 0,                                       color: 'text-primary' },
          { label: 'Payments',        value: paymentsLoading ? '…' : payments.length,                       color: 'text-amber-500' },
          { label: 'Plan',            value: dbUser?.isPremium ? 'Premium' : 'Free', color: dbUser?.isPremium ? 'text-amber-500' : 'text-muted' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-surface rounded-2xl border border-border p-5 text-center">
            <p className={`text-2xl font-extrabold ${color}`}>{value}</p>
            <p className="text-xs text-muted font-medium mt-1 uppercase tracking-wide">{label}</p>
          </div>
        ))}
      </div>

      {/* ── Main content ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Left: view or edit */}
        <div className="lg:col-span-3">
          {isEditing ? (
            <EditForm
              dbUser={dbUser}
              currentUser={currentUser}
              photoSrc={photoSrc}
              displayName={displayName}
              onSuccess={() => setIsEditing(false)}
              onCancel={() => setIsEditing(false)}
            />
          ) : (
            <div className="bg-surface rounded-2xl border border-border p-6">
              <div className="flex items-center justify-between mb-5 pb-4 border-b border-border">
                <h3 className="text-sm font-bold text-text uppercase tracking-wider">Personal Information</h3>
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-surface-alt text-xs font-semibold text-text hover:bg-border/40 transition"
                >
                  <FiEdit2 size={11} /> Edit
                </button>
              </div>
              <InfoRow label="Display Name"  value={dbUser?.name} />
              <InfoRow label="Email"         value={currentUser?.email} />
              <InfoRow label="Phone Number"  value={dbUser?.tNumber} fallback="Not set" />
              <InfoRow label="Plan"          value={dbUser?.isPremium ? 'Premium' : 'Free'} />
              <InfoRow label="Member Since"  value={dbUser?.createdAt ? new Date(dbUser.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : undefined} />
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div className="lg:col-span-2 space-y-5">

          {/* Premium */}
          <div className="bg-surface rounded-2xl border border-border p-6">
            {dbUser?.isPremium ? (
              <div className="text-center py-2">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-3">
                  <FiStar className="text-amber-500" size={22} />
                </div>
                <h3 className="text-base font-bold text-text mb-1">Premium Member</h3>
                <p className="text-sm text-muted">Unlimited issue reporting access.</p>
                <div className="mt-3 flex items-center justify-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <FiCheckCircle size={12} /> Active subscription
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                    <FiStar className="text-amber-500" size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-text">Upgrade to Premium</h3>
                    <p className="text-xs text-muted">Remove issue reporting limits</p>
                  </div>
                </div>
                <p className="text-xs text-muted mb-4 leading-relaxed">
                  Free accounts can submit up to 3 issues. Subscribe once for unlimited reporting.
                </p>
                <button
                  onClick={() => setShowSubModal(true)}
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition text-sm"
                >
                  Subscribe — 1,000 kr
                </button>
              </>
            )}
          </div>

          {/* Payment history */}
          <div className="bg-surface rounded-2xl border border-border p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <FiFileText className="text-primary" size={16} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-text">Payment History</h3>
                <p className="text-xs text-muted">
                  {paymentsLoading ? 'Loading…' : `${payments.length} transaction${payments.length !== 1 ? 's' : ''}`}
                </p>
              </div>
            </div>
            <button
              onClick={downloadPDF}
              disabled={paymentsLoading}
              className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-primary text-primary font-bold rounded-xl hover:bg-primary hover:text-on-primary transition disabled:opacity-50 text-sm"
            >
              <FiDownload size={14} />
              Download PDF
            </button>
          </div>

          {/* Password hint */}
          <div className="bg-surface-alt border border-border rounded-2xl p-5 flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-surface flex items-center justify-center flex-shrink-0 border border-border">
              <FiLock size={14} className="text-muted" />
            </div>
            <div>
              <p className="text-sm font-semibold text-text mb-0.5">Change Password</p>
              <p className="text-xs text-muted leading-relaxed">
                Password can be updated from the{' '}
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-primary font-medium hover:underline"
                >
                  Edit Profile
                </button>{' '}
                section.
              </p>
            </div>
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
