import { useForm } from 'react-hook-form';
import axiosInstance from '../api/axiosInstance';
import toast from 'react-hot-toast';
import { FiX } from 'react-icons/fi';

const inputClass = 'w-full px-4 py-3 rounded-lg bg-surface-alt border border-border text-text focus:ring-2 focus:ring-focus-ring focus:border-focus-ring outline-none transition-all';

const CATEGORIES = ['Garbage', 'Illegal Construction', 'Broken Public Property', 'Road Damage'];

const UpdateIssueModal = ({ issue, onClose, onUpdateSuccess }) => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      title:       issue.title,
      category:    issue.category,
      location:    issue.location,
      amount:      issue.amount,
      description: issue.description,
      status:      issue.status,
    },
  });

  const onSubmit = async (data) => {
    try {
      await axiosInstance.put(`/issues/${issue._id}`, {
        ...data,
        amount: Number(data.amount),
        email:  issue.email,
      });
      toast.success('Issue updated successfully!');
      onUpdateSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update issue.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-overlay/60 backdrop-blur-sm">
      <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-muted hover:text-text transition-colors"
        >
          <FiX size={24} />
        </button>

        <div className="p-6 md:p-8 max-h-[90vh] overflow-y-auto">
          <div className="mb-6 pr-8">
            <h2 className="text-2xl font-bold text-text">Update Issue</h2>
            <p className="text-muted mt-1">Modify the details of your reported issue.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-text mb-1">Issue Title *</label>
              <input
                type="text"
                {...register('title', {
                  required: 'Title is required',
                  minLength: { value: 5, message: 'Title must be at least 5 characters' },
                })}
                className={inputClass}
              />
              {errors.title && <p className="mt-1 text-sm text-danger">{errors.title.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-text mb-1">Category *</label>
                <select
                  {...register('category', { required: 'Category is required' })}
                  className={inputClass}
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                {errors.category && <p className="mt-1 text-sm text-danger">{errors.category.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-text mb-1">Status *</label>
                <select
                  {...register('status', { required: 'Status is required' })}
                  className={`${inputClass} font-bold`}
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
                {errors.status && <p className="mt-1 text-sm text-danger">{errors.status.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-text mb-1">Location *</label>
                <input
                  type="text"
                  {...register('location', { required: 'Location is required' })}
                  className={inputClass}
                />
                {errors.location && <p className="mt-1 text-sm text-danger">{errors.location.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-text mb-1">Suggested Budget (kr) *</label>
                <input
                  type="number"
                  {...register('amount', {
                    required: 'Budget is required',
                    min: { value: 1, message: 'Budget must be at least 1 kr' },
                  })}
                  className={inputClass}
                />
                {errors.amount && <p className="mt-1 text-sm text-danger">{errors.amount.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-text mb-1">Description *</label>
              <textarea
                rows="4"
                {...register('description', {
                  required: 'Description is required',
                  minLength: { value: 20, message: 'Description must be at least 20 characters' },
                })}
                className={`${inputClass} resize-none`}
              />
              {errors.description && <p className="mt-1 text-sm text-danger">{errors.description.message}</p>}
            </div>

            <div className="pt-6 border-t border-border flex justify-end gap-3 mt-8">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border border-border rounded-lg text-text font-bold hover:bg-surface-alt transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-primary text-on-primary font-bold rounded-lg shadow-md hover:bg-primary-hover transition-colors disabled:opacity-70 flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-on-primary mr-2" />
                    Updating...
                  </>
                ) : (
                  'Update Issue'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UpdateIssueModal;
