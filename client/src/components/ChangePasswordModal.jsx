import { useContext, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FiX, FiLock, FiEye, FiEyeOff, FiShield } from 'react-icons/fi';
import { AuthContext } from '../context/AuthContext';

const getPasswordErrorMessage = (code) => {
  switch (code) {
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Current password is incorrect.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait and try again.';
    case 'auth/requires-recent-login':
      return 'Session expired. Please log out and log back in, then try again.';
    default:
      return 'Failed to update password. Please try again.';
  }
};

const ChangePasswordModal = ({ onClose }) => {
  const { currentUser, changePassword } = useContext(AuthContext);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew,     setShowNew]     = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isPending,   setIsPending]   = useState(false);

  const hasEmailProvider = currentUser?.providerData?.some(p => p.providerId === 'password');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const newPassword = watch('newPassword');

  const onSubmit = async ({ currentPassword, newPassword }) => {
    setIsPending(true);
    try {
      await changePassword(currentPassword, newPassword);
      toast.success('Password updated successfully!');
      onClose();
    } catch (err) {
      toast.error(getPasswordErrorMessage(err.code));
    } finally {
      setIsPending(false);
    }
  };

  const inputClass =
    'w-full pl-10 pr-11 py-2.5 rounded-lg border border-border bg-surface-alt text-text outline-none focus:ring-2 focus:ring-focus-ring transition text-sm';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay/50 p-4">
      <div className="bg-surface rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex justify-between items-center px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <FiShield size={15} className="text-primary" />
            </div>
            <h3 className="text-base font-bold text-text">Change Password</h3>
          </div>
          <button
            onClick={onClose}
            disabled={isPending}
            className="p-1.5 rounded-lg text-muted hover:text-text hover:bg-surface-alt transition disabled:opacity-50"
          >
            <FiX size={18} />
          </button>
        </div>

        <div className="p-6">
          {!hasEmailProvider ? (
            <div className="text-center py-6">
              <div className="w-14 h-14 rounded-2xl bg-surface-alt flex items-center justify-center mx-auto mb-4">
                <FiShield size={24} className="text-muted" />
              </div>
              <p className="font-semibold text-text mb-2">Password Change Unavailable</p>
              <p className="text-sm text-muted leading-relaxed">
                Your account uses Google Sign-In. Password management is handled through your Google account.
              </p>
              <button
                onClick={onClose}
                className="mt-5 px-5 py-2.5 bg-surface-alt text-text font-semibold rounded-xl hover:bg-border/40 transition text-sm"
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              {/* Current password */}
              <div>
                <label htmlFor="cp-current" className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                  Current Password
                </label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={14} />
                  <input
                    id="cp-current"
                    type={showCurrent ? 'text' : 'password'}
                    autoComplete="current-password"
                    aria-invalid={!!errors.currentPassword}
                    {...register('currentPassword', { required: 'Current password is required' })}
                    className={inputClass}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text transition"
                  >
                    {showCurrent ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                  </button>
                </div>
                {errors.currentPassword && (
                  <p role="alert" className="text-danger text-xs mt-1">{errors.currentPassword.message}</p>
                )}
              </div>

              {/* New password */}
              <div>
                <label htmlFor="cp-new" className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={14} />
                  <input
                    id="cp-new"
                    type={showNew ? 'text' : 'password'}
                    autoComplete="new-password"
                    aria-invalid={!!errors.newPassword}
                    {...register('newPassword', {
                      required: 'New password is required',
                      minLength: { value: 6, message: 'At least 6 characters' },
                    })}
                    className={inputClass}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text transition"
                  >
                    {showNew ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                  </button>
                </div>
                {errors.newPassword && (
                  <p role="alert" className="text-danger text-xs mt-1">{errors.newPassword.message}</p>
                )}
              </div>

              {/* Confirm password */}
              <div>
                <label htmlFor="cp-confirm" className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={14} />
                  <input
                    id="cp-confirm"
                    type={showConfirm ? 'text' : 'password'}
                    autoComplete="new-password"
                    aria-invalid={!!errors.confirmPassword}
                    {...register('confirmPassword', {
                      required: 'Please confirm your new password',
                      validate: (v) => v === newPassword || 'Passwords do not match',
                    })}
                    className={inputClass}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text transition"
                  >
                    {showConfirm ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p role="alert" className="text-danger text-xs mt-1">{errors.confirmPassword.message}</p>
                )}
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 py-2.5 bg-primary text-on-primary font-bold rounded-xl hover:bg-primary-hover transition disabled:opacity-60 text-sm flex items-center justify-center gap-2"
                >
                  {isPending && (
                    <span className="w-4 h-4 rounded-full border-2 border-on-primary border-t-transparent animate-spin" />
                  )}
                  {isPending ? 'Updating…' : 'Update Password'}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isPending}
                  className="flex-1 py-2.5 bg-surface-alt text-text font-semibold rounded-xl hover:bg-border/40 transition disabled:opacity-50 text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
