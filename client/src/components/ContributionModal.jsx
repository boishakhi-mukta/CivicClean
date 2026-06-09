import { useContext } from 'react';
import { useForm } from 'react-hook-form';
import { AuthContext } from '../context/AuthContext';
import axiosInstance from '../api/axiosInstance';
import toast from 'react-hot-toast';
import { FiX } from 'react-icons/fi';

const inputClass = 'w-full px-4 py-3 rounded-lg bg-surface-alt border border-border text-text focus:ring-2 focus:ring-focus-ring focus:border-focus-ring outline-none transition-all';
const readonlyClass = 'w-full px-4 py-3 rounded-lg bg-border/20 border border-transparent text-muted cursor-not-allowed outline-none';

const ContributionModal = ({ issue, onClose, onContributionSuccess }) => {
  const { currentUser } = useContext(AuthContext);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      issueTitle: issue.title,
      email: currentUser?.email || '',
    },
  });

  const onSubmit = async (data) => {
    try {
      await axiosInstance.post('/donations', {
        issueId:        issue._id,
        issueTitle:     data.issueTitle,
        amount:         Number(data.amount),
        name:           data.name,
        email:          data.email,
        phone:          data.phone,
        address:        data.address,
        additionalInfo: data.additionalInfo,
        date:           new Date(),
      });
      toast.success('Thank you! Your contribution has been successfully processed.');
      onContributionSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to process contribution.');
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
            <h2 className="text-2xl font-bold text-text">Pay Clean-Up Contribution</h2>
            <p className="text-muted mt-1">Help fund the resolution of this issue.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-text mb-1">Issue</label>
              <input type="text" {...register('issueTitle')} readOnly className={readonlyClass} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-text mb-1">Contribution Amount (kr) *</label>
                <input
                  type="number"
                  {...register('amount', {
                    required: 'Amount is required',
                    min: { value: 1, message: 'Amount must be at least 1' },
                  })}
                  className={inputClass}
                  placeholder="500"
                />
                {errors.amount && <p className="mt-1 text-sm text-danger">{errors.amount.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-text mb-1">Contributor Name *</label>
                <input
                  type="text"
                  {...register('name', { required: 'Name is required' })}
                  className={inputClass}
                  placeholder="John Doe"
                />
                {errors.name && <p className="mt-1 text-sm text-danger">{errors.name.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-text mb-1">Email</label>
                <input type="email" {...register('email')} readOnly className={readonlyClass} />
              </div>

              <div>
                <label className="block text-sm font-semibold text-text mb-1">Phone Number *</label>
                <input
                  type="tel"
                  {...register('phone', { required: 'Phone is required' })}
                  className={inputClass}
                  placeholder="+47 123 45 678"
                />
                {errors.phone && <p className="mt-1 text-sm text-danger">{errors.phone.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-text mb-1">Address *</label>
              <input
                type="text"
                {...register('address', { required: 'Address is required' })}
                className={inputClass}
                placeholder="123 Civic Street, Oslo"
              />
              {errors.address && <p className="mt-1 text-sm text-danger">{errors.address.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-text mb-1">Additional Info (Optional)</label>
              <textarea
                rows="3"
                {...register('additionalInfo')}
                className={`${inputClass} resize-none`}
                placeholder="Any message you want to leave with your contribution..."
              />
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
                    Processing...
                  </>
                ) : (
                  'Pay Contribution'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContributionModal;
