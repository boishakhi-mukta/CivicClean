// ─────────────────────────────────────────────────────────────────────────────
// AdminProfile.jsx — The admin's personal profile page at
// /dashboard/admin/profile.
//
// Layout:
//   • A green banner hero section with a decorative grid overlay and circular
//     background shapes. The avatar overlaps the banner with a negative margin
//     (-mt-10) to create the "floating over the banner" visual effect.
//   • Below the hero: three cards side-by-side (on desktop) showing:
//       – Edit Profile: name, phone, location, bio fields + photo upload
//       – Permissions: a read-only list of what the admin can do
//       – Security: a "Change Password" button → opens ChangePasswordModal
//
// EditProfileModal:
//   Uses React Hook Form with uploadOnSelect=false on PhotoUploader — the photo
//   is not uploaded to Firebase Storage when selected, but held in local state
//   as a file. On submit, if a photo file is present it is uploaded first and
//   the resulting URL is included in the PATCH /users/:id request body.
//
// updateMutation:
//   Calls AuthContext's updateUserProfile() to keep the in-memory user object
//   in sync after a successful profile update, so the navbar avatar updates
//   without requiring a page refresh.
// ─────────────────────────────────────────────────────────────────────────────

import { useContext, useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FiShield, FiMail, FiUser, FiCheckCircle, FiEdit2, FiX, FiLock } from 'react-icons/fi';
import ChangePasswordModal from '../../../components/ChangePasswordModal';
import { AuthContext } from '../../../context/AuthContext';
import axiosInstance from '../../../api/axiosInstance';
import PhotoUploader from '../../../components/PhotoUploader';
import { getUploadErrorMessage, uploadPhotoWithFallback } from '../../../utils/uploadPhoto';

const inputClass =
  'w-full px-4 py-2.5 rounded-lg border border-border bg-surface-alt text-text outline-none focus:ring-2 focus:ring-focus-ring transition text-sm';

/* ── Edit Profile Modal ─────────────────────────────────── */
const EditProfileModal = ({ onClose, onSubmit, isPending, defaultName, email, photoSrc, displayName, onFileSelected }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { name: defaultName },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay/50 p-4">
      <div className="bg-surface rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex justify-between items-center px-6 py-4 border-b border-border">
          <h3 className="text-base font-bold text-text">Edit Profile</h3>
          <button
            onClick={onClose}
            disabled={isPending}
            className="p-1.5 rounded-lg text-muted hover:text-text hover:bg-surface-alt transition disabled:opacity-50"
          >
            <FiX size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5" noValidate>
          {/* Photo uploader */}
          <PhotoUploader
            currentUrl={photoSrc}
            displayName={displayName}
            uploadOnSelect={false}
            onFileSelected={onFileSelected}
          />

          {/* Name field */}
          <div>
            <label htmlFor="edit-admin-name" className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
              Display Name
            </label>
            <div className="relative">
              <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={14} />
              <input
                id="edit-admin-name"
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
            {errors.name && (
              <p role="alert" className="text-danger text-xs mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Email — read-only info */}
          <div className="p-3 rounded-xl bg-surface-alt border border-border flex items-center gap-2.5">
            <FiMail size={14} className="text-muted flex-shrink-0" />
            <div>
              <p className="text-xs text-muted font-medium">Email (cannot be changed)</p>
              <p className="text-sm text-text font-semibold">{email || '—'}</p>
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 py-2.5 bg-primary text-on-primary font-bold rounded-xl hover:bg-primary-hover transition disabled:opacity-60 text-sm"
            >
              {isPending ? 'Saving…' : 'Save Changes'}
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
      </div>
    </div>
  );
};

/* ── Main Component ─────────────────────────────────────── */
const AdminProfile = () => {
  const { currentUser, dbUser, refreshDbUser, updateCurrentUserProfile } = useContext(AuthContext);
  const [photoFile,      setPhotoFile]      = useState(null);
  const [editOpen,       setEditOpen]       = useState(false);
  const [pendingUrl,     setPendingUrl]     = useState(null);
  const [passwordOpen,   setPasswordOpen]   = useState(false);

  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm({
    defaultValues: { name: '', avatar_url: '' },
  });

  useEffect(() => {
    if (dbUser) {
      reset({ name: dbUser.name || '', avatar_url: dbUser.avatar_url || '' });
    }
  }, [dbUser, reset]);

  const updateMutation = useMutation({
    mutationFn: async (updates) => {
      if (!dbUser?._id) throw new Error('Profile is still loading. Please try again.');
      const avatar_url = photoFile
        ? await uploadPhotoWithFallback(photoFile, { folder: 'avatars' })
        : updates.avatar_url || dbUser.avatar_url || '';
      return axiosInstance.patch(`/users/${dbUser._id}`, { ...updates, avatar_url });
    },
    onSuccess: async (response) => {
      const updated = response.data;
      updateCurrentUserProfile({ name: updated.name || '', avatar_url: updated.avatar_url || '' });
      const refreshed = await refreshDbUser();
      const latest = refreshed || updated;
      reset({ name: latest.name || '', avatar_url: latest.avatar_url || '' });
      setPhotoFile(null);
      setPendingUrl(null);
      setEditOpen(false);
      toast.success('Profile updated!');
    },
    onError: (err) => toast.error(err.response?.data?.message || getUploadErrorMessage(err) || 'Update failed'),
  });

  const avatarUrl   = watch('avatar_url');
  const photoSrc    = pendingUrl || avatarUrl || dbUser?.avatar_url || currentUser?.photoURL || null;
  const displayName = dbUser?.name || currentUser?.displayName || 'Admin';
  const initials    = displayName.charAt(0).toUpperCase();

  const handleFileSelected = (file) => {
    setPhotoFile(file);
    setPendingUrl(URL.createObjectURL(file));
    setValue('avatar_url', avatarUrl || dbUser?.avatar_url || '', { shouldDirty: true });
  };

  const handleModalClose = () => {
    setEditOpen(false);
    setPhotoFile(null);
    setPendingUrl(null);
    reset({ name: dbUser?.name || '', avatar_url: dbUser?.avatar_url || '' });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">

      {/* ── Profile hero ── */}
      {/* No overflow-hidden on outer card so avatar can overlap the banner edge */}
      <div className="bg-surface rounded-2xl border border-border">
        {/* Banner — overflow-hidden only here, keeps decorative circles contained */}
        <div className="relative h-28 bg-primary rounded-t-2xl overflow-hidden">
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

        {/* Content — avatar uses -mt-10 to overlap banner bottom */}
        <div className="px-6 pb-6">
          <div className="-mt-10 mb-3 relative z-10">
            {photoSrc ? (
              <img
                src={photoSrc}
                alt="Avatar"
                className="w-20 h-20 rounded-2xl object-cover border-4 border-surface shadow-lg"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-primary-hover flex items-center justify-center text-on-primary text-2xl font-black border-4 border-surface shadow-lg select-none">
                {initials}
              </div>
            )}
          </div>

          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h2 className="text-xl font-extrabold text-text">{displayName}</h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold">
                  <FiShield size={10} /> Admin
                </span>
              </div>
              <p className="text-sm text-muted">{currentUser?.email}</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              Active
            </div>
          </div>
        </div>
      </div>

      {/* ── Two-column layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Profile Information — details view */}
        <div className="lg:col-span-3 bg-surface rounded-2xl border border-border overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <h3 className="text-sm font-bold text-text uppercase tracking-wider">Profile Information</h3>
            <button
              onClick={() => setEditOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition text-xs font-bold"
            >
              <FiEdit2 size={12} /> Update
            </button>
          </div>

          <div className="divide-y divide-border">
            {[
              {
                label: 'Display Name',
                value: displayName,
                sub: 'Your name shown across the platform',
                icon: FiUser,
              },
              {
                label: 'Email Address',
                value: currentUser?.email || '—',
                sub: 'Used for login and notifications',
                icon: FiMail,
              },
              {
                label: 'Role',
                value: 'Administrator',
                sub: 'Full access to the platform',
                icon: FiShield,
                badge: true,
              },
              {
                label: 'Account Status',
                value: 'Active',
                sub: 'Your account is in good standing',
                icon: FiCheckCircle,
                badge: true,
                badgeClass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
              },
            ].map(({ label, value, sub, icon: Icon, badge, badgeClass }) => (
              <div key={label} className="flex items-start gap-4 px-6 py-5">
                <div className="w-9 h-9 rounded-xl bg-surface-alt flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon size={15} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted font-medium mb-0.5">{label}</p>
                  {badge ? (
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${badgeClass || 'bg-primary/10 text-primary'}`}>
                      {value}
                    </span>
                  ) : (
                    <p className="text-sm font-semibold text-text">{value}</p>
                  )}
                  <p className="text-xs text-muted mt-1">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-surface rounded-2xl border border-border p-6">
            <h3 className="text-sm font-bold text-text uppercase tracking-wider mb-4 pb-4 border-b border-border">
              Permissions
            </h3>
            <ul className="space-y-3">
              {[
                'Manage all issues',
                'Manage users & staff',
                'View all payments',
                'Access all reports',
                'Configure platform settings',
              ].map(p => (
                <li key={p} className="flex items-center gap-2.5 text-sm text-text">
                  <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <FiCheckCircle size={11} className="text-primary" />
                  </span>
                  {p}
                </li>
              ))}
            </ul>
          </div>

          {/* Security */}
          <div className="bg-surface rounded-2xl border border-border p-6">
            <h3 className="text-sm font-bold text-text uppercase tracking-wider mb-4 pb-4 border-b border-border">
              Security
            </h3>
            <div className="flex items-start gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-surface-alt flex items-center justify-center flex-shrink-0">
                <FiLock size={15} className="text-muted" />
              </div>
              <div>
                <p className="text-sm font-semibold text-text">Password</p>
                <p className="text-xs text-muted mt-0.5">Update your account password</p>
              </div>
            </div>
            <button
              onClick={() => setPasswordOpen(true)}
              className="w-full py-2.5 border border-border rounded-xl text-sm font-semibold text-text hover:bg-surface-alt transition flex items-center justify-center gap-2"
            >
              <FiLock size={13} />
              Change Password
            </button>
          </div>
        </div>
      </div>

      {/* ── Password modal ── */}
      {passwordOpen && <ChangePasswordModal onClose={() => setPasswordOpen(false)} />}

      {/* ── Edit modal ── */}
      {editOpen && (
        <EditProfileModal
          onClose={handleModalClose}
          onSubmit={(data) => updateMutation.mutate(data)}
          isPending={updateMutation.isPending}
          defaultName={dbUser?.name || ''}
          email={currentUser?.email || ''}
          photoSrc={photoSrc}
          displayName={displayName}
          onFileSelected={handleFileSelected}
        />
      )}
    </div>
  );
};

export default AdminProfile;
