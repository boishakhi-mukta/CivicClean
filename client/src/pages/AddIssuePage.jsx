import React, { useContext, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { Fade } from 'react-awesome-reveal';
import PhotoUploader from '../components/PhotoUploader';

const AddIssuePage = () => {
  const { currentUser, dbUser } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "CivicClean | Report Issue";
  }, []);

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm({
    defaultValues: {
      email: currentUser?.email || '',
      status: 'pending'
    }
  });
  const imageUrl = watch('image');
  const issueTitle = watch('title');

  const onSubmit = async (data) => {
    try {
      const payload = {
        title: data.title,
        category: data.category,
        location: data.location,
        description: data.description,
        image: data.image,
        amount: Number(data.amount),
        email: data.email,
        reported_by: dbUser?._id,
        status: data.status,
        date: new Date()
      };

      await axiosInstance.post('/issues', payload);
      
      Swal.fire({
        title: 'Issue Reported!',
        text: 'Issue reported successfully!',
        icon: 'success',
        confirmButtonColor: '#1a3a2a'
      });
      
      navigate('/my-issues');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to report issue. Please try again.');
    }
  };

  const categories = ['Garbage', 'Illegal Construction', 'Broken Public Property', 'Road Damage'];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 text-center">
          <Fade direction="down" triggerOnce>
            <h1 className="text-4xl font-extrabold text-[#1a3a2a] dark:text-white mb-4">Report an Issue</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">Help us keep the community clean and safe.</p>
          </Fade>
        </div>

        <Fade direction="up" triggerOnce>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
            <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
              
              {/* Title & Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Issue Title *</label>
                  <input
                    type="text"
                    {...register("title", { 
                      required: "Title is required",
                      minLength: { value: 5, message: "Title must be at least 5 characters" }
                    })}
                    className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-[#d4ff00] focus:border-transparent outline-none transition-all dark:text-white"
                    placeholder="e.g., Overflowing trash bins"
                  />
                  {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Category *</label>
                  <select
                    {...register("category", { required: "Category is required" })}
                    className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-[#d4ff00] focus:border-transparent outline-none transition-all dark:text-white"
                  >
                    <option value="">Select a category</option>
                    {categories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  {errors.category && <p className="mt-1 text-sm text-red-500">{errors.category.message}</p>}
                </div>
              </div>

              {/* Location & Image */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Location *</label>
                  <input
                    type="text"
                    {...register("location", { required: "Location is required" })}
                    className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-[#d4ff00] focus:border-transparent outline-none transition-all dark:text-white"
                    placeholder="e.g., Central Park, Main St."
                  />
                  {errors.location && <p className="mt-1 text-sm text-red-500">{errors.location.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Issue Photo <span className="text-red-500">*</span></label>
                  <input type="hidden" {...register("image", { required: "Photo is required" })} />
                  <PhotoUploader
                    currentUrl={imageUrl}
                    displayName={issueTitle}
                    folder="issues"
                    variant="issue"
                    onUploadComplete={(url) => setValue('image', url, { shouldValidate: true, shouldDirty: true })}
                  />
                  {errors.image && <p className="mt-1 text-sm text-red-500">{errors.image.message}</p>}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Description *</label>
                <textarea
                  rows="4"
                  {...register("description", { 
                    required: "Description is required",
                    minLength: { value: 20, message: "Description must be at least 20 characters" }
                  })}
                  className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-[#d4ff00] focus:border-transparent outline-none transition-all dark:text-white resize-none"
                  placeholder="Provide detailed information about the issue..."
                ></textarea>
                {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>}
              </div>

              {/* Budget, Email, Status */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Suggested Fix Budget (kr) *</label>
                  <input
                    type="number"
                    {...register("amount", { 
                      required: "Budget is required",
                      min: { value: 1, message: "Budget must be at least 1 kr" }
                    })}
                    className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-[#d4ff00] focus:border-transparent outline-none transition-all dark:text-white"
                    placeholder="500"
                  />
                  {errors.amount && <p className="mt-1 text-sm text-red-500">{errors.amount.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Your Email</label>
                  <input
                    type="email"
                    {...register("email")}
                    readOnly
                    className="w-full px-4 py-3 rounded-lg bg-gray-200 dark:bg-gray-600 border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-300 cursor-not-allowed outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Status</label>
                  <input
                    type="text"
                    {...register("status")}
                    readOnly
                    className="w-full px-4 py-3 rounded-lg bg-gray-200 dark:bg-gray-600 border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-300 cursor-not-allowed outline-none uppercase font-bold"
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100 dark:border-gray-700">
                <button
                  type="submit"
                  className="w-full flex justify-center py-4 px-4 border border-transparent rounded-lg shadow-md text-xl font-bold text-[#1a3a2a] bg-[#d4ff00] hover:bg-[#bce600] focus:outline-none transition-transform hover:-translate-y-1"
                >
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        </Fade>
      </div>
    </div>
  );
};

export default AddIssuePage;
