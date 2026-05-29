import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiAlertCircle } from 'react-icons/fi';
import axiosInstance from '../../../api/axiosInstance';
import PhotoUploader from '../../../components/PhotoUploader';

const inputClass =
  'w-full px-3 py-2.5 rounded-lg border dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-[#d4ff00] transition text-sm';

const StaffFormModal = ({ title, defaultValues, onClose, onSubmit, isPending }) => {
  const { register, handleSubmit, formState: { errors }, setValue } = useForm({ defaultValues });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-xl">
        <div className="flex justify-between items-center px-6 py-4 border-b dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <FiX size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <input type="hidden" {...register('avatar_url')} />
          <PhotoUploader
            currentUrl={defaultValues?.avatar_url}
            displayName={defaultValues?.name}
            onUploadComplete={(url) => setValue('avatar_url', url)}
          />
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">Name</label>
            <input {...register('name', { required: 'Required' })} className={inputClass} />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">Email</label>
            <input
              {...register('email', { required: 'Required', pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' } })}
              type="email"
              className={inputClass}
              disabled={!!defaultValues?.email}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>
          {!defaultValues?.email && (
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                {...register('password', {
                  required: 'Required',
                  minLength: { value: 6, message: 'Min 6 characters' },
                })}
                type="password"
                className={inputClass}
                placeholder="••••••••"
              />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>
          )}
          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 py-2.5 bg-[#1a3a2a] text-[#d4ff00] font-bold rounded-lg hover:bg-[#2c5f45] transition disabled:opacity-50"
            >
              {isPending ? 'Saving…' : 'Save'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition"
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

  const handleDelete = async (user) => {
    const { isConfirmed } = await Swal.fire({
      title: 'Remove staff member?',
      text: `${user.name || user.email} will be removed from the database. Their login account will remain active.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, remove',
      confirmButtonColor: '#e3342f',
    });
    if (isConfirmed) deleteMutation.mutate(user._id);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#1a3a2a] dark:border-[#d4ff00]" />
      </div>
    );
  }

  if (isError) {
    return (
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white mb-6">Manage Staff</h1>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 flex items-start gap-3">
          <FiAlertCircle className="text-red-500 mt-0.5 flex-shrink-0" size={20} />
          <div>
            <p className="font-semibold text-red-700 dark:text-red-400">Failed to load staff list</p>
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">
              {error?.response?.data?.message || error?.message || 'Unknown error'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white">Manage Staff</h1>
        <button
          onClick={() => setAddOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#1a3a2a] text-[#d4ff00] font-bold rounded-xl hover:bg-[#2c5f45] transition text-sm"
        >
          <FiPlus size={16} /> Add Staff
        </button>
      </div>

      {staffList.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-14 text-center">
          <span className="text-5xl block mb-4">👷</span>
          <p className="text-gray-500 dark:text-gray-400">No staff members yet. Add one to get started.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead className="bg-gray-50 dark:bg-gray-700/50 border-b dark:border-gray-700 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold">
                <tr>
                  <th className="px-5 py-4">Staff Member</th>
                  <th className="px-5 py-4">Email</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {staffList.map(user => (
                  <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {user.avatar_url ? (
                          <img src={user.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-[#d4ff00] flex items-center justify-center text-[#1a3a2a] text-xs font-bold">
                            {(user.name || user.email).charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span className="font-medium text-gray-900 dark:text-white text-sm">
                          {user.name || '—'}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">{user.email}</td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setEditUser(user)}
                          className="p-1.5 rounded-lg text-blue-600 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 transition"
                        >
                          <FiEdit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(user)}
                          disabled={deleteMutation.isPending}
                          className="p-1.5 rounded-lg text-red-600 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 transition disabled:opacity-50"
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
