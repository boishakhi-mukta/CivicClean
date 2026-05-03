import React, { useContext } from 'react';
import { useForm } from 'react-hook-form';
import { AuthContext } from '../context/AuthContext';
import axiosInstance from '../api/axiosInstance';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { FiX } from 'react-icons/fi';

const ContributionModal = ({ issue, onClose, onContributionSuccess }) => {
  const { currentUser } = useContext(AuthContext);
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      issueTitle: issue.title,
      email: currentUser?.email || ''
    }
  });

  const onSubmit = async (data) => {
    try {
      const payload = {
        issueId: issue._id,
        issueTitle: data.issueTitle,
        amount: Number(data.amount),
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        additionalInfo: data.additionalInfo,
        date: new Date()
      };

      await axiosInstance.post('/donations', payload);
      
      Swal.fire({
        title: 'Thank You!',
        text: 'Your contribution has been successfully processed.',
        icon: 'success',
        confirmButtonColor: '#1a3a2a'
      });
      
      onContributionSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to process contribution.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition-colors"
        >
          <FiX size={24} />
        </button>
        
        <div className="p-6 md:p-8 max-h-[90vh] overflow-y-auto">
          <div className="mb-6 pr-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Pay Clean-Up Contribution</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Help fund the resolution of this issue.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Issue</label>
              <input
                type="text"
                {...register("issueTitle")}
                readOnly
                className="w-full px-4 py-3 rounded-lg bg-gray-200 dark:bg-gray-700 border border-transparent text-gray-600 dark:text-gray-300 cursor-not-allowed outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Contribution Amount (NOK) *</label>
                <input
                  type="number"
                  {...register("amount", { 
                    required: "Amount is required",
                    min: { value: 1, message: "Amount must be at least 1" }
                  })}
                  className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-[#d4ff00] focus:border-transparent outline-none dark:text-white transition-all"
                  placeholder="500"
                />
                {errors.amount && <p className="mt-1 text-sm text-red-500">{errors.amount.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Contributor Name *</label>
                <input
                  type="text"
                  {...register("name", { required: "Name is required" })}
                  className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-[#d4ff00] focus:border-transparent outline-none dark:text-white transition-all"
                  placeholder="John Doe"
                />
                {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <input
                  type="email"
                  {...register("email")}
                  readOnly
                  className="w-full px-4 py-3 rounded-lg bg-gray-200 dark:bg-gray-700 border border-transparent text-gray-600 dark:text-gray-300 cursor-not-allowed outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  {...register("phone", { required: "Phone is required" })}
                  className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-[#d4ff00] focus:border-transparent outline-none dark:text-white transition-all"
                  placeholder="+47 123 45 678"
                />
                {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Address *</label>
              <input
                type="text"
                {...register("address", { required: "Address is required" })}
                className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-[#d4ff00] focus:border-transparent outline-none dark:text-white transition-all"
                placeholder="123 Civic Street, Oslo"
              />
              {errors.address && <p className="mt-1 text-sm text-red-500">{errors.address.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Additional Info (Optional)</label>
              <textarea
                rows="3"
                {...register("additionalInfo")}
                className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-[#d4ff00] focus:border-transparent outline-none dark:text-white resize-none transition-all"
                placeholder="Any message you want to leave with your contribution..."
              ></textarea>
            </div>

            <div className="pt-6 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3 mt-8">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-[#1a3a2a] text-[#d4ff00] font-bold rounded-lg shadow-md hover:bg-[#2c5f45] transition-colors disabled:opacity-70 flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-[#d4ff00] mr-2"></div>
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
