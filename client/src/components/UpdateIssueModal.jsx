import React from 'react';
import { useForm } from 'react-hook-form';
import axiosInstance from '../api/axiosInstance';
import toast from 'react-hot-toast';
import { FiX } from 'react-icons/fi';

const UpdateIssueModal = ({ issue, onClose, onUpdateSuccess }) => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      title: issue.title,
      category: issue.category,
      location: issue.location,
      amount: issue.amount,
      description: issue.description,
      status: issue.status
    }
  });

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        amount: Number(data.amount),
        email: issue.email // Ensure email is passed back for authorization
      };

      await axiosInstance.put(`/issues/${issue._id}`, payload);
      
      toast.success('Issue updated successfully!');
      onUpdateSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update issue.');
    }
  };

  const categories = ['Garbage', 'Illegal Construction', 'Broken Public Property', 'Road Damage'];

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
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Update Issue</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Modify the details of your reported issue.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Issue Title *</label>
              <input
                type="text"
                {...register("title", { 
                  required: "Title is required",
                  minLength: { value: 5, message: "Title must be at least 5 characters" }
                })}
                className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-[#d4ff00] focus:border-transparent outline-none dark:text-white transition-all"
              />
              {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Category *</label>
                <select
                  {...register("category", { required: "Category is required" })}
                  className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-[#d4ff00] focus:border-transparent outline-none dark:text-white transition-all"
                >
                  {categories.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                {errors.category && <p className="mt-1 text-sm text-red-500">{errors.category.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Status *</label>
                <select
                  {...register("status", { required: "Status is required" })}
                  className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-[#d4ff00] focus:border-transparent outline-none dark:text-white transition-all font-bold"
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
                {errors.status && <p className="mt-1 text-sm text-red-500">{errors.status.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Location *</label>
                <input
                  type="text"
                  {...register("location", { required: "Location is required" })}
                  className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-[#d4ff00] focus:border-transparent outline-none dark:text-white transition-all"
                />
                {errors.location && <p className="mt-1 text-sm text-red-500">{errors.location.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Suggested Budget (kr) *</label>
                <input
                  type="number"
                  {...register("amount", { 
                    required: "Budget is required",
                    min: { value: 1, message: "Budget must be at least 1 kr" }
                  })}
                  className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-[#d4ff00] focus:border-transparent outline-none dark:text-white transition-all"
                />
                {errors.amount && <p className="mt-1 text-sm text-red-500">{errors.amount.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Description *</label>
              <textarea
                rows="4"
                {...register("description", { 
                  required: "Description is required",
                  minLength: { value: 20, message: "Description must be at least 20 characters" }
                })}
                className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-[#d4ff00] focus:border-transparent outline-none dark:text-white resize-none transition-all"
              ></textarea>
              {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>}
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
