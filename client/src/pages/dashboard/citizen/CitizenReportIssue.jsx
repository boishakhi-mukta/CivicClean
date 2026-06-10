import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { AuthContext } from '../../../context/AuthContext';
import axiosInstance from '../../../api/axiosInstance';
import PhotoUploader from '../../../components/PhotoUploader';

const CATEGORIES = ['Garbage', 'Illegal Construction', 'Broken Public Property', 'Road Damage'];
const PRIORITIES = ['low', 'medium', 'high'];

const Field = ({ label, required, error, children, id }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-semibold text-text mb-1.5">
      {label} {required && <span className="text-danger" aria-hidden="true">*</span>}
      {required && <span className="sr-only">(required)</span>}
    </label>
    {children}
    {error && <p id={id ? `${id}-error` : undefined} role="alert" className="text-danger text-xs mt-1">{error}</p>}
  </div>
);

const inputClass =
  'w-full px-4 py-2.5 rounded-lg border border-border bg-surface-alt text-text outline-none focus:ring-2 focus:ring-focus-ring transition';

const CitizenReportIssue = () => {
  const { currentUser, dbUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm();
  const imageUrl = watch('image');

  const isBlocked    = dbUser?.isBlocked === true;
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myIssues'] });
      reset();
      toast.success('Issue Reported! Your issue has been submitted to the community.');
      navigate('/dashboard/citizen/my-issues');
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Submission failed. Please try again.');
    },
  });

  if (isBlocked) {
    return (
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-text mb-6">
          Report Issue
        </h1>
        <div className="bg-surface rounded-2xl shadow-sm border border-border p-14 text-center max-w-lg mx-auto">
          <span className="text-5xl block mb-4">🚫</span>
          <h2 className="text-xl font-bold text-text mb-2">Account Blocked</h2>
          <p className="text-muted">
            Your account is blocked. Contact admin.
          </p>
        </div>
      </div>
    );
  }

  if (limitReached) {
    return (
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-text mb-6">
          Report Issue
        </h1>
        <div className="bg-surface rounded-2xl shadow-sm border border-border p-14 text-center max-w-lg mx-auto">
          <span className="text-5xl block mb-4">🔒</span>
          <h2 className="text-xl font-bold text-text mb-2">Free Limit Reached</h2>
          <p className="text-muted mb-6">
            You've reached the free limit of 3 issues. Upgrade to Premium for unlimited reporting.
          </p>
          <button
            onClick={() => navigate('/dashboard/citizen/profile')}
            className="px-8 py-3 bg-primary text-on-primary font-bold rounded-lg hover:bg-primary-hover transition"
          >
            Subscribe to Premium
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-extrabold text-text mb-6">
        Report an Issue
      </h1>

      <div className="bg-surface rounded-2xl shadow-sm border border-border p-6 md:p-8 max-w-2xl mx-auto">
        <form onSubmit={handleSubmit((data) => reportMutation.mutate(data))} className="space-y-5" noValidate>
          <Field label="Title" required error={errors.title?.message} id="cr-title">
            <input
              id="cr-title"
              aria-invalid={!!errors.title}
              aria-describedby={errors.title ? 'cr-title-error' : undefined}
              {...register('title', {
                required: 'Title is required',
                minLength: { value: 5, message: 'Title must be at least 5 characters' },
                maxLength: { value: 100, message: 'Title must be 100 characters or fewer' },
              })}
              placeholder="e.g. Overflowing garbage bin near park"
              className={inputClass}
            />
          </Field>

          <Field label="Category" required error={errors.category?.message} id="cr-category">
            <select
              id="cr-category"
              aria-invalid={!!errors.category}
              aria-describedby={errors.category ? 'cr-category-error' : undefined}
              {...register('category', { required: 'Category is required' })}
              className={inputClass}
            >
              <option value="">Select a category</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>

          <Field label="Priority" required error={errors.priority?.message} id="cr-priority">
            <select
              id="cr-priority"
              aria-invalid={!!errors.priority}
              aria-describedby={errors.priority ? 'cr-priority-error' : undefined}
              {...register('priority', { required: 'Priority is required' })}
              className={inputClass}
            >
              <option value="">Select priority</option>
              {PRIORITIES.map(p => (
                <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
              ))}
            </select>
          </Field>

          <Field label="Location" required error={errors.location?.message} id="cr-location">
            <input
              id="cr-location"
              aria-invalid={!!errors.location}
              aria-describedby={errors.location ? 'cr-location-error' : undefined}
              {...register('location', {
                required: 'Location is required',
                minLength: { value: 3, message: 'Location must be at least 3 characters' },
              })}
              placeholder="e.g. Mirpur 10, Dhaka"
              className={inputClass}
            />
          </Field>

          <Field label="Description" required error={errors.description?.message} id="cr-description">
            <textarea
              id="cr-description"
              aria-invalid={!!errors.description}
              aria-describedby={errors.description ? 'cr-description-error' : undefined}
              {...register('description', {
                required: 'Description is required',
                minLength: { value: 20, message: 'Minimum 20 characters required' },
              })}
              rows={4}
              placeholder="Describe the issue in detail (min 20 characters)..."
              className={`${inputClass} resize-none`}
            />
          </Field>

          <Field label="Issue Photo" required error={errors.image?.message} id="cr-image">
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
            className="w-full flex justify-center items-center gap-2 py-3 bg-primary text-on-primary font-bold rounded-lg hover:bg-primary-hover transition disabled:opacity-60"
          >
            {reportMutation.isPending && <span className="animate-spin rounded-full h-4 w-4 border-2 border-on-primary border-t-transparent" aria-hidden="true" />}
            {reportMutation.isPending ? 'Submitting…' : 'Submit Issue'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CitizenReportIssue;
