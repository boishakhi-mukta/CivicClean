// ─────────────────────────────────────────────────────────────────────────────
// AdminManageStaff.jsx — Admin page for creating and managing staff accounts
// at /dashboard/admin/staff.
//
// Staff accounts are the workers who get assigned issues and update their
// status (in-progress → working → resolved). Only the admin can create, edit,
// or delete staff accounts.
//
// StaffFormModal — a single modal used for both adding new staff and editing
//   existing staff. When editing, `defaultValues` is pre-populated with the
//   existing staff member's data:
//   • Email is disabled in edit mode because Firebase doesn't allow email
//     changes via our API flow — the original email must stay the same.
//   • The password field is hidden entirely in edit mode (staff must use
//     "Change Password" from their own profile to update it).
//   • PhotoUploader is included so the admin can upload the staff's profile photo.
//
// Three mutations:
//   • addMutation: POST /users/create-staff — creates both the Firebase Auth
//     account and the MongoDB document for the new staff member.
//   • editMutation: PATCH /users/:id — updates name, photo, and other fields.
//   • deleteMutation: DELETE /users/:id — removes the staff account. A browser
//     confirm dialog is shown first to prevent accidental deletion.
//
// The staff table shows name, email, photo thumbnail, join date, and action
// buttons (edit/delete) for each staff member.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiAlertCircle, FiEye, FiEyeOff } from 'react-icons/fi';
import axiosInstance from '../../../api/axiosInstance';
import PhotoUploader from '../../../components/PhotoUploader';

const inputClass =
  'w-full px-3 py-2.5 rounded-lg border border-border bg-surface-alt text-text outline-none focus:ring-2 focus:ring-focus-ring transition text-sm';

const StaffFormModal = ({ title, defaultValues, onClose, onSubmit, isPending }) => {
  const { register, handleSubmit, formState: { errors }, setValue } = useForm({ defaultValues });
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay/50 p-4">
      <div className="bg-surface rounded-2xl w-full max-w-md shadow-xl">
        <div className="flex justify-between items-center px-6 py-4 border-b border-border">
          <h3 className="text-lg font-bold text-text">{title}</h3>
          <button onClick={onClose} className="text-muted hover:text-text">
            <FiX size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4" noValidate>
          <input type="hidden" {...register('avatar_url')} />
          <PhotoUploader
            currentUrl={defaultValues?.avatar_url}
            displayName={defaultValues?.name}
            onUploadComplete={(url) => setValue('avatar_url', url)}
          />
          <div>
            <label htmlFor="staff-name" className="block text-xs font-semibold text-muted mb-1">Name <span className="text-danger" aria-hidden="true">*</span></label>
            <input
              id="staff-name"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'staff-name-error' : undefined}
              {...register('name', {
                required: 'Name is required',
                minLength: { value: 2, message: 'Name must be at least 2 characters' },
              })}
              className={inputClass}
            />
            {errors.name && <p id="staff-name-error" role="alert" className="text-danger text-xs mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label htmlFor="staff-email" className="block text-xs font-semibold text-muted mb-1">Email <span className="text-danger" aria-hidden="true">*</span></label>
            <input
              id="staff-email"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'staff-email-error' : undefined}
              {...register('email', {
                required: 'Email is required',
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email address' },
              })}
              type="email"
              className={inputClass}
              disabled={!!defaultValues?.email}
            />
            {errors.email && <p id="staff-email-error" role="alert" className="text-danger text-xs mt-1">{errors.email.message}</p>}
          </div>
          {!defaultValues?.email && (
            <div>
              <label htmlFor="staff-password" className="block text-xs font-semibold text-muted mb-1">
                Password <span className="text-danger" aria-hidden="true">*</span>
              </label>
              <div className="relative">
                <input
                  id="staff-password"
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? 'staff-password-error' : undefined}
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 6, message: 'Password must be at least 6 characters' },
                    pattern: {
                      value: /^(?=.*[a-z])(?=.*[A-Z])/,
                      message: 'Must contain at least one uppercase and one lowercase letter',
                    },
                  })}
                  type={showPassword ? 'text' : 'password'}
                  className={`${inputClass} pr-10`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute inset-y-0 right-3 flex items-center text-muted hover:text-text"
                >
                  {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
              {errors.password && <p id="staff-password-error" role="alert" className="text-danger text-xs mt-1">{errors.password.message}</p>}
            </div>
          )}
          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 py-2.5 bg-primary text-on-primary font-bold rounded-lg hover:bg-primary-hover transition disabled:opacity-50"
            >
              {isPending ? 'Saving…' : 'Save'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-surface-alt text-text font-medium rounded-lg transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AdminManageStaff = () => {
  const queryClient    = useQueryClient();
  const [addOpen,  setAddOpen]  = useState(false);
  const [editUser, setEditUser] = useState(null);

  const { data: staffList = [], isLoading, isError, error } = useQuery({
    queryKey: ['staffList'],
    queryFn: async () => (await axiosInstance.get('/users/staff')).data,
  });

  const addMutation = useMutation({
    mutationFn: ({ name, email, avatar_url, password }) =>
      axiosInstance.post('/users/create-staff', { name, email, password, avatar_url }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staffList'] });
      toast.success('Staff member created! They can now log in with their email and password.');
      setAddOpen(false);
    },
    onError: (err) => toast.error(err.response?.data?.message || err.message || 'Failed to add staff'),
  });

  const editMutation = useMutation({
    mutationFn: ({ id, data }) => axiosInstance.patch(`/users/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staffList'] });
      toast.success('Staff updated!');
      setEditUser(null);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Update failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => axiosInstance.delete(`/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staffList'] });
      toast.success('Staff removed from database.');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Delete failed'),
  });

  const handleDelete = (user) => {
    const confirmed = window.confirm(
      `Remove staff member?\n\n${user.name || user.email} will be removed from the database. Their login account will remain active.`
    );
    if (confirmed) deleteMutation.mutate(user._id);
  };

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
          <div>
            <div className="h-7 w-32 bg-surface-alt rounded-lg mb-2" />
            <div className="h-4 w-52 bg-surface-alt rounded-lg" />
          </div>
          <div className="h-9 w-28 bg-surface-alt rounded-xl" />
        </div>
        <div className="bg-surface rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface-alt/50 border-b border-border">
                <tr>
                  {['Staff Member', 'Email', 'Actions'].map((_, i) => (
                    <th key={i} className="px-5 py-4">
                      <div className="h-3 w-20 bg-surface-alt rounded" />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-surface-alt flex-shrink-0" />
                        <div className="h-4 w-28 bg-surface-alt rounded" />
                      </div>
                    </td>
                    <td className="px-5 py-4"><div className="h-4 w-40 bg-surface-alt rounded" /></td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <div className="h-7 w-16 bg-surface-alt rounded-lg" />
                        <div className="h-7 w-16 bg-surface-alt rounded-lg" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div>
        <h1 className="text-2xl font-extrabold text-text">Manage Staff</h1>
        <div className="bg-danger/5 border border-danger/30 rounded-xl p-6 flex items-start gap-3 mt-6">
          <FiAlertCircle className="text-danger mt-0.5 flex-shrink-0" size={20} />
          <div>
            <p className="font-semibold text-danger">Failed to load staff list</p>
            <p className="text-sm text-danger mt-1">
              {error?.response?.data?.message || error?.message || 'Unknown error'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-extrabold text-text">Manage Staff</h1>
          <p className="text-sm text-muted mt-0.5">Add, edit, and remove staff members</p>
        </div>
        <button
          onClick={() => setAddOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-on-primary font-bold rounded-xl hover:bg-primary-hover transition text-sm"
        >
          <FiPlus size={16} /> Add Staff
        </button>
      </div>

      {staffList.length === 0 ? (
        <div className="bg-surface rounded-xl border border-border p-14 text-center">
          <span className="text-5xl block mb-4">👷</span>
          <p className="text-muted">No staff members yet. Add one to get started.</p>
        </div>
      ) : (
        <div className="bg-surface rounded-xl shadow-sm border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead className="bg-surface-alt/50 border-b border-border text-xs uppercase tracking-wider text-muted font-semibold">
                <tr>
                  <th className="px-5 py-4">Staff Member</th>
                  <th className="px-5 py-4">Email</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {staffList.map(user => (
                  <tr key={user._id} className="hover:bg-surface-alt/60 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {user.avatar_url ? (
                          <img src={user.avatar_url} alt="" loading="lazy" className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary text-xs font-bold">
                            {(user.name || user.email).charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span className="font-medium text-text text-sm">
                          {user.name || '—'}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-muted">{user.email}</td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setEditUser(user)}
                          className="p-1.5 rounded-lg text-info bg-info/10 hover:bg-info/20 transition"
                        >
                          <FiEdit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(user)}
                          disabled={deleteMutation.isPending}
                          className="p-1.5 rounded-lg text-danger bg-danger/10 hover:bg-danger/20 transition disabled:opacity-50"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {addOpen && (
        <StaffFormModal
          title="Add Staff Member"
          defaultValues={{ name: '', email: '', avatar_url: '', password: '' }}
          onClose={() => setAddOpen(false)}
          onSubmit={(data) => addMutation.mutate(data)}
          isPending={addMutation.isPending}
        />
      )}

      {editUser && (
        <StaffFormModal
          title="Edit Staff Member"
          defaultValues={{ name: editUser.name, email: editUser.email, avatar_url: editUser.avatar_url || '' }}
          onClose={() => setEditUser(null)}
          onSubmit={(data) => editMutation.mutate({ id: editUser._id, data })}
          isPending={editMutation.isPending}
        />
      )}
    </div>
  );
};

export default AdminManageStaff;
