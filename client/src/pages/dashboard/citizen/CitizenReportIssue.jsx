import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import { AuthContext } from '../../../context/AuthContext';
import axiosInstance from '../../../api/axiosInstance';
import PhotoUploader from '../../../components/PhotoUploader';

const CATEGORIES = ['Garbage', 'Illegal Construction', 'Broken Public Property', 'Road Damage'];

const Field = ({ label, required, error, children }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

const inputClass =
  'w-full px-4 py-2.5 rounded-lg border dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-[#d4ff00] transition';

const CitizenReportIssue = () => {
  const { currentUser, dbUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm();
  const imageUrl = watch('image');

  const isBlocked   = dbUser?.isBlocked === true;
  const limitReached = !isBlocked && (dbUser?.issueCount ?? 0) >= 3 && !dbUser?.isPremium;

  const reportMutation = useMutation({
    mutationFn: async (formData) => {
      await axiosInstance.post('/issues', {
        ...formData,
        email: currentUser.email,
        reported_by: dbUser?._id,
        status: 'pending',
        date: new Date().toISOString(),
      });
      await axiosInstance.patch('/users/increment-count');
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['myIssues'] });
      reset();
      await Swal.fire({
        icon: 'success',
        title: 'Issue Reported!',
        text: 'Your issue has been submitted to the community.',
        confirmButtonColor: '#1a3a2a',
      });
      navigate('/dashboard/citizen/my-issues');
    },
    onError: (err) => {
      Swal.fire({
        icon: 'error',
        title: 'Submission Failed',
        text: err.response?.data?.error || 'Something went wrong. Please try again.',
        confirmButtonColor: '#e3342f',
      });
    },
  });

  if (isBlocked) {
    return (
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white mb-6">
          Report Issue
        </h1>
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border dark:border-gray-700 p-14 text-center max-w-lg mx-auto">
          <span className="text-5xl block mb-4">🚫</span>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Account Blocked</h2>
          <p className="text-gray-500 dark:text-gray-400">
            Your account is blocked. Contact admin.
          </p>
        </div>
      </div>
    );
  }

  if (limitReached) {
    return (
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white mb-6">
          Report Issue
        </h1>
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border dark:border-gray-700 p-14 text-center max-w-lg mx-auto">
          <span className="text-5xl block mb-4">🔒</span>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Free Limit Reached</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            You've reached the free limit of 3 issues. Upgrade to Premium for unlimited reporting.
          </p>
          <button
            onClick={() => navigate('/dashboard/citizen/profile')}
            className="px-8 py-3 bg-[#d4ff00] text-[#1a3a2a] font-bold rounded-lg hover:bg-[#bce600] transition"
          >
            Subscribe to Premium
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white mb-6">
        Report an Issue
      </h1>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border dark:border-gray-700 p-6 md:p-8 max-w-2xl">
        <form onSubmit={handleSubmit((data) => reportMutation.mutate(data))} className="space-y-5">
          <Field label="Title" required error={errors.title?.message}>
            <input
              {...register('title', { required: 'Title is required' })}
              placeholder="e.g. Overflowing garbage bin near park"
              className={inputClass}
            />
          </Field>

          <Field label="Category" required error={errors.category?.message}>
            <select
              {...register('category', { required: 'Category is required' })}
              className={inputClass}
            >
              <option value="">Select a category</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>

          <Field label="Location" required error={errors.location?.message}>
            <input
              {...register('location', { required: 'Location is required' })}
              placeholder="e.g. Mirpur 10, Dhaka"
              className={inputClass}
            />
          </Field>

          <Field label="Description" required error={errors.description?.message}>
            <textarea
              {...register('description', {
                required: 'Description is required',
                minLength: { value: 20, message: 'Minimum 20 characters required' },
              })}
              rows={4}
              placeholder="Describe the issue in detail (min 20 characters)..."
              className={`${inputClass} resize-none`}
            />
          </Field>

          <Field label="Issue Photo" required error={errors.image?.message}>
            <input type="hidden" {...register('image', { required: 'Photo is required' })} />
            <PhotoUploader
              currentUrl={imageUrl}
              displayName={watch('title')}
              folder="issues"
              variant="issue"
              onUploadComplete={(url) => setValue('image', url, { shouldValidate: true, shouldDirty: true })}
            />
          </Field>

          <button
            type="submit"
            disabled={reportMutation.isPending}
            className="w-full py-3 bg-[#1a3a2a] text-[#d4ff00] font-bold rounded-lg hover:bg-[#2c5f45] transition disabled:opacity-60"
          >
            {reportMutation.isPending ? 'Submitting…' : 'Submit Issue'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CitizenReportIssue;
