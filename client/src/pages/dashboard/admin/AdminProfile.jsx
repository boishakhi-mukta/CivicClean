import { useContext, useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { AuthContext } from '../../../context/AuthContext';
import axiosInstance from '../../../api/axiosInstance';
import PhotoUploader from '../../../components/PhotoUploader';
import { getUploadErrorMessage, uploadPhotoWithFallback } from '../../../utils/uploadPhoto';

const inputClass =
  'w-full px-4 py-2.5 rounded-lg border dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-[#d4ff00] transition';

const AdminProfile = () => {
  const { currentUser, dbUser, refreshDbUser, updateCurrentUserProfile } = useContext(AuthContext);
  const [photoFile, setPhotoFile] = useState(null);

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

  const avatarUrl = watch('avatar_url');
  const photoSrc    = avatarUrl || dbUser?.avatar_url || currentUser?.photoURL || null;
  const displayName = dbUser?.name || currentUser?.displayName || 'Admin';

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white mb-6">Profile</h1>

      <div className="max-w-lg mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border dark:border-gray-700 p-6">
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
              {updateMutation.isPending ? 'Uploading and saving…' : 'Save Profile'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
