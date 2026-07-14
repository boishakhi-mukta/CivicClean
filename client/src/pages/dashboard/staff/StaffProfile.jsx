// ─────────────────────────────────────────────────────────────────────────────
// StaffProfile.jsx — The staff member's profile and account settings page at
// /dashboard/staff/profile.
//
// Staff accounts are created by the admin and have a fixed role — staff cannot
// change their own role or email address. This page lets them manage their
// personal info and password.
//
// Three sections:
//
//   1. Profile hero — avatar, name, email, "Staff" role badge.
//      Three stat pills: Total Assigned, Active (in-progress/working/ongoing
//      issues), and Resolved.
//
//   2. Edit Profile form — name, phone, location, bio fields.
//      Collapsible "Change Password" section with PasswordInput helper
//      (same show/hide toggle pattern as CitizenProfile).
//      Unlike citizens, staff always signed up with email/password (created
//      by the admin), so the password section is always shown.
//
//   3. Account Details card (read-only) — shows:
//        • Role badge: "Staff" in blue
//        • Status badge: "Active" in green (staff accounts can't be blocked)
//        • Capabilities list: a read-only bullet list of what staff are
//          allowed to do on the platform (view, update status, resolve issues).
//          This is informational only — it reinforces what their role can do.
// ─────────────────────────────────────────────────────────────────────────────

import { useContext, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import {
  FiUser, FiMail, FiCheckCircle, FiBriefcase,
  FiLock, FiEdit2, FiX, FiPhone, FiEye, FiEyeOff, FiChevronDown,
} from 'react-icons/fi';
import { AuthContext } from '../../../context/AuthContext';
import axiosInstance from '../../../api/axiosInstance';
import PhotoUploader from '../../../components/PhotoUploader';
import { getUploadErrorMessage, uploadPhotoWithFallback } from '../../../utils/uploadPhoto';

const inputClass =
  'w-full px-4 py-2.5 rounded-lg border border-border bg-surface-alt text-text outline-none focus:ring-2 focus:ring-focus-ring transition text-sm';

const getPasswordError = (code) => {
  switch (code) {
    case 'auth/wrong-password':
    case 'auth/invalid-credential': return 'Current password is incorrect.';
    case 'auth/too-many-requests':  return 'Too many attempts. Please wait and try again.';
    case 'auth/requires-recent-login': return 'Session expired. Please log out and sign in again.';
    default: return 'Password update failed. Please try again.';
  }
};

/* ── Show/hide password input ── */
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
          aria-label={show ? 'Hide password' : 'Show password'}
        >
          {show ? <FiEyeOff size={14} /> : <FiEye size={14} />}
        </button>
      </div>
      {error && <p role="alert" className="text-danger text-xs mt-1">{error}</p>}
    </div>
  );
};

/* ── Inline edit form ── */
const EditForm = ({ dbUser, currentUser, photoSrc, displayName, onSuccess, onCancel }) => {
  const { updateCurrentUserProfile, refreshDbUser, changePassword } = useContext(AuthContext);
  const [photoFile,   setPhotoFile]   = useState(null);
  const [pwExpanded,  setPwExpanded]  = useState(false);
  const [formError,   setFormError]   = useState('');
  const [submitting,  setSubmitting]  = useState(false);

  const isPwProvider = currentUser?.providerData?.some(p => p.providerId === 'password');

  const {
    register, handleSubmit, formState: { errors }, reset, setValue, watch, getValues,
  } = useForm({
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
      // Profile update
      const avatar_url = photoFile
        ? await uploadPhotoWithFallback(photoFile, { folder: 'avatars' })
        : data.avatar_url || dbUser?.avatar_url || '';
      const res = await axiosInstance.patch(`/users/${dbUser._id}`, {
        name: data.name, tNumber: data.tNumber, avatar_url,
      });
      updateCurrentUserProfile({ name: res.data.name || '', avatar_url: res.data.avatar_url || '' });
      await refreshDbUser();

      // Password change (only if current password filled)
      if (isPwProvider && data.currentPassword) {
        await changePassword(data.currentPassword, data.newPassword);
        toast.success('Profile & password updated!');
      } else {
        toast.success('Profile updated!');
      }
      onSuccess();
    } catch (err) {
      const pwError = err.code ? getPasswordError(err.code) : null;
      setFormError(pwError || err.response?.data?.message || getUploadErrorMessage(err) || 'Update failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-surface rounded-2xl border border-border p-6">
      <div className="flex items-center justify-between mb-5 pb-4 border-b border-border">
        <h3 className="text-sm font-bold text-text uppercase tracking-wider">Edit Profile</h3>
        <button onClick={onCancel} className="text-muted hover:text-text transition" type="button">
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

        {/* ── Profile fields ── */}
        <div>
          <label htmlFor="sp-name" className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
            Display Name
          </label>
          <div className="relative">
            <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={14} />
            <input
              id="sp-name"
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
          <label htmlFor="sp-tnumber" className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
            Phone Number
          </label>
          <div className="relative">
            <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={14} />
            <input
              id="sp-tnumber"
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
            <input
              value={currentUser?.email || ''}
              disabled readOnly
              className={`${inputClass} pl-9 opacity-60 cursor-not-allowed`}
            />
          </div>
          <p className="text-xs text-muted mt-1">Email cannot be changed here.</p>
        </div>

        {/* ── Password section ── */}
        <div className="pt-2 border-t border-border">
          <button
            type="button"
            onClick={() => setPwExpanded(v => !v)}
            className="flex items-center gap-2 text-sm font-semibold text-text hover:text-primary transition w-full"
          >
            <FiLock size={14} className="text-muted" />
            <span className="flex-1 text-left">Change Password</span>
            <span className="text-xs text-muted font-normal">optional</span>
            <FiChevronDown
              size={14}
              className={`text-muted transition-transform duration-200 ${pwExpanded ? 'rotate-180' : ''}`}
            />
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
                    <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                      Current Password
                    </label>
                    <PasswordInput
                      id="sp-curr-pw"
                      placeholder="Enter current password"
                      registration={register('currentPassword')}
                      error={errors.currentPassword?.message}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                      New Password
                    </label>
                    <PasswordInput
                      id="sp-new-pw"
                      placeholder="Min 6 characters"
                      registration={register('newPassword', {
                        validate: v => !getValues('currentPassword') || v.length >= 6 || 'At least 6 characters',
                      })}
                      error={errors.newPassword?.message}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                      Confirm New Password
                    </label>
                    <PasswordInput
                      id="sp-conf-pw"
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

/* ── Read-only info row ── */
const InfoRow = ({ label, value, fallback = '—' }) => (
  <div className="flex items-start gap-3 py-3 border-b border-border last:border-0">
    <span className="text-sm text-muted w-32 flex-shrink-0">{label}</span>
    <span className="text-sm text-text font-medium break-all">{value || fallback}</span>
  </div>
);

/* ═══════════════════════════════════════════ */

const StaffProfile = () => {
  const { currentUser, dbUser } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);

  const { data: assignedIssues = [] } = useQuery({
    queryKey: ['staffAssignedIssues', dbUser?._id],
    enabled: !!dbUser?._id,
    queryFn: async () => (await axiosInstance.get('/issues/assigned')).data?.issues || [],
  });

  const resolved = assignedIssues.filter(i => ['resolved', 'closed'].includes(i.status?.toLowerCase())).length;
  const active   = assignedIssues.filter(i => ['in-progress', 'working', 'ongoing'].includes(i.status?.toLowerCase())).length;

  const photoSrc    = dbUser?.avatar_url || currentUser?.photoURL || null;
  const displayName = dbUser?.name || currentUser?.displayName || 'Staff';
  const initials    = displayName.charAt(0).toUpperCase();

  return (
    <div className="max-w-4xl mx-auto space-y-6">

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
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-info/10 text-info text-xs font-bold">
                  <FiBriefcase size={10} /> Staff
                </span>
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

      {/* ── Stats strip ── */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Assigned', value: assignedIssues.length, color: 'text-primary' },
          { label: 'Active',         value: active,                color: 'text-info' },
          { label: 'Resolved',       value: resolved,              color: 'text-emerald-500' },
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
              <InfoRow label="Role"          value="Staff Member" />
              <InfoRow label="Member Since"  value={dbUser?.createdAt ? new Date(dbUser.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : undefined} />
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-surface rounded-2xl border border-border p-6">
            <h3 className="text-sm font-bold text-text uppercase tracking-wider mb-4 pb-4 border-b border-border">
              Account Details
            </h3>
            <div className="space-y-4">
              {[
                { label: 'Role',   value: 'Staff Member', pill: true, color: 'bg-info/10 text-info' },
                { label: 'Status', value: 'Active',       pill: true, color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
              ].map(({ label, value, pill, color }) => (
                <div key={label} className="flex items-center justify-between gap-3">
                  <span className="text-sm text-muted">{label}</span>
                  {pill ? (
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${color}`}>{value}</span>
                  ) : (
                    <span className="text-sm text-text font-medium">{value}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-surface rounded-2xl border border-border p-6">
            <h3 className="text-sm font-bold text-text uppercase tracking-wider mb-3">Capabilities</h3>
            <ul className="space-y-2">
              {['View assigned issues', 'Update issue status', 'Add progress notes', 'Mark issues resolved'].map(p => (
                <li key={p} className="flex items-center gap-2 text-sm text-muted">
                  <FiCheckCircle size={13} className="text-primary flex-shrink-0" />
                  {p}
                </li>
              ))}
            </ul>
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
    </div>
  );
};

export default StaffProfile;
