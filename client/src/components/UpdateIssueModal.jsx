// ─────────────────────────────────────────────────────────────────────────────
// UpdateIssueModal.jsx — Pop-up form that lets a citizen edit their own issue.
//
// This modal opens from the "My Issues" dashboard when the user clicks Edit
// on an issue that is still in "pending" status (only pending issues can be
// edited — once staff start working on it, editing is locked).
//
// Fields the user can change:
//   • Title
//   • Category (Garbage / Illegal Construction / Broken Public Property / Road Damage)
//   • Status (Pending / In Progress / Resolved)
//   • Location
//   • Suggested budget (in NOK / kr)
//   • Description (minimum 20 characters to ensure enough detail)
//
// On save, the updated data is sent to the server and the parent page refreshes
// to show the new values without a full browser reload.
// ─────────────────────────────────────────────────────────────────────────────

import { useForm } from 'react-hook-form';
import axiosInstance from '../api/axiosInstance';
import toast from 'react-hot-toast';
import { FiX } from 'react-icons/fi';

// Shared CSS for every editable input in this form
const inputClass = 'w-full px-4 py-3 rounded-lg bg-surface-alt border border-border text-text focus:ring-2 focus:ring-focus-ring focus:border-focus-ring outline-none transition-all';

// The four valid issue categories available for selection
const CATEGORIES = ['Garbage', 'Illegal Construction', 'Broken Public Property', 'Road Damage'];

const UpdateIssueModal = ({ issue, onClose, onUpdateSuccess }) => {
  // Pre-fill the form with the existing issue data so the user can see what they're changing
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

  // Called when the user clicks "Update Issue"
  const onSubmit = async (data) => {
    try {
      // Send the changed fields to the server — keep the original owner's email unchanged
      await axiosInstance.put(`/issues/${issue._id}`, {
        ...data,
        amount: Number(data.amount), // convert string input to a proper number
        email:  issue.email,
      });
      toast.success('Issue updated successfully!');
      onUpdateSuccess(); // Tell the parent to refresh the list
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update issue.');
    }
  };

  return (
    // Semi-transparent dark overlay behind the modal
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-overlay/60 backdrop-blur-sm">
      <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden relative">

        {/* X button to close without saving */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-muted hover:text-text transition-colors"
        >
          <FiX size={24} />
        </button>

        {/* Scrollable form area */}
        <div className="p-6 md:p-8 max-h-[90vh] overflow-y-auto">
          <div className="mb-6 pr-8">
            <h2 className="text-2xl font-bold text-text">Update Issue</h2>
            <p className="text-muted mt-1">Modify the details of your reported issue.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>

            {/* Issue title */}
            <div>
              <label htmlFor="upd-title" className="block text-sm font-semibold text-text mb-1">
                Issue Title <span className="text-danger" aria-hidden="true">*</span>
              </label>
              <input
                id="upd-title"
                type="text"
                aria-invalid={!!errors.title}
                aria-describedby={errors.title ? 'upd-title-error' : undefined}
                {...register('title', {
                  required: 'Title is required',
                  minLength: { value: 5, message: 'Title must be at least 5 characters' },
                })}
                className={inputClass}
              />
              {errors.title && <p id="upd-title-error" role="alert" className="mt-1 text-sm text-danger">{errors.title.message}</p>}
            </div>

            {/* Category + Status row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label htmlFor="upd-category" className="block text-sm font-semibold text-text mb-1">
                  Category <span className="text-danger" aria-hidden="true">*</span>
                </label>
                <select
                  id="upd-category"
                  aria-invalid={!!errors.category}
                  aria-describedby={errors.category ? 'upd-category-error' : undefined}
                  {...register('category', { required: 'Category is required' })}
                  className={inputClass}
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                {errors.category && <p id="upd-category-error" role="alert" className="mt-1 text-sm text-danger">{errors.category.message}</p>}
              </div>

              <div>
                <label htmlFor="upd-status" className="block text-sm font-semibold text-text mb-1">
                  Status <span className="text-danger" aria-hidden="true">*</span>
                </label>
                <select
                  id="upd-status"
                  aria-invalid={!!errors.status}
                  aria-describedby={errors.status ? 'upd-status-error' : undefined}
                  {...register('status', { required: 'Status is required' })}
                  className={`${inputClass} font-bold`}
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
                {errors.status && <p id="upd-status-error" role="alert" className="mt-1 text-sm text-danger">{errors.status.message}</p>}
              </div>
            </div>

            {/* Location + Budget row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label htmlFor="upd-location" className="block text-sm font-semibold text-text mb-1">
                  Location <span className="text-danger" aria-hidden="true">*</span>
                </label>
                <input
                  id="upd-location"
                  type="text"
                  aria-invalid={!!errors.location}
                  aria-describedby={errors.location ? 'upd-location-error' : undefined}
                  {...register('location', { required: 'Location is required' })}
                  className={inputClass}
                />
                {errors.location && <p id="upd-location-error" role="alert" className="mt-1 text-sm text-danger">{errors.location.message}</p>}
              </div>

              <div>
                <label htmlFor="upd-amount" className="block text-sm font-semibold text-text mb-1">
                  Suggested Budget (kr) <span className="text-danger" aria-hidden="true">*</span>
                </label>
                <input
                  id="upd-amount"
                  type="number"
                  aria-invalid={!!errors.amount}
                  aria-describedby={errors.amount ? 'upd-amount-error' : undefined}
                  {...register('amount', {
                    required: 'Budget is required',
                    min: { value: 1, message: 'Budget must be at least 1 kr' },
                  })}
                  className={inputClass}
                />
                {errors.amount && <p id="upd-amount-error" role="alert" className="mt-1 text-sm text-danger">{errors.amount.message}</p>}
              </div>
            </div>

            {/* Full description — must be at least 20 characters for enough detail */}
            <div>
              <label htmlFor="upd-description" className="block text-sm font-semibold text-text mb-1">
                Description <span className="text-danger" aria-hidden="true">*</span>
              </label>
              <textarea
                id="upd-description"
                rows="4"
                aria-invalid={!!errors.description}
                aria-describedby={errors.description ? 'upd-description-error' : undefined}
                {...register('description', {
                  required: 'Description is required',
                  minLength: { value: 20, message: 'Description must be at least 20 characters' },
                })}
                className={`${inputClass} resize-none`}
              />
              {errors.description && <p id="upd-description-error" role="alert" className="mt-1 text-sm text-danger">{errors.description.message}</p>}
            </div>

            {/* Cancel and Save buttons */}
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
                {/* Spinner while the save request is in progress */}
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
