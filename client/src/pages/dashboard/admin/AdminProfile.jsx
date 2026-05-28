import { useContext, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { AuthContext } from '../../../context/AuthContext';
import axiosInstance from '../../../api/axiosInstance';
import PhotoUploader from '../../../components/PhotoUploader';

const inputClass =
  'w-full px-4 py-2.5 rounded-lg border dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-[#d4ff00] transition';

const AdminProfile = () => {
  const { currentUser, dbUser, refreshDbUser } = useContext(AuthContext);

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm({
    defaultValues: { name: '', avatar_url: '' },
  });

  useEffect(() => {
    if (dbUser) {
      reset({ name: dbUser.name || '', avatar_url: dbUser.avatar_url || '' });
    }
  }, [dbUser, reset]);

  const updateMutation = useMutation({
    mutationFn: (updates) => axiosInstance.patch(`/users/${dbUser._id}`, updates),
    onSuccess: async (_, updates) => {
      await refreshDbUser();
      reset({ name: updates.name, avatar_url: updates.avatar_url });
      toast.success('Profile updated!');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Update failed'),
  });

  const photoSrc    = dbUser?.avatar_url || currentUser?.photoURL || null;
  const displayName = dbUser?.name || currentUser?.displayName || 'Admin';

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white mb-6">Profile</h1>

      <div className="max-w-lg">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border dark:border-gray-700 p-6">
          <PhotoUploader
            currentUrl={photoSrc}
            displayName={displayName}
            onUploadComplete={(url) => setValue('avatar_url', url)}
          />

          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">{displayName}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{currentUser?.email}</p>
            <span className="mt-1 inline-block px-2.5 py-0.5 rounded-full bg-[#d4ff00]/20 text-[#1a3a2a] dark:text-[#d4ff00] text-xs font-semibold">
              Admin
            </span>
          </div>

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
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
              )}
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
      </div>
    </div>
  );
};

export default AdminProfile;
