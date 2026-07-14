// ─────────────────────────────────────────────────────────────────────────────
// AddIssuePage.jsx — A legacy "Report an Issue" page at the /add-issue route.
//
// Note: The newer, richer version of this form is CitizenReportIssue.jsx inside
// the citizen dashboard. That version enforces the free-account 3-issue limit
// and also increments the user's issue count in the database. This page is kept
// for backwards compatibility and direct-URL access.
//
// Fields on this form:
//   Title, Category, Location, Issue Photo (PhotoUploader), Description,
//   Suggested Fix Budget (in kr), Email (read-only, pre-filled from the logged-in
//   user), and Status (read-only, always "pending").
//
// On submit, the issue is posted to the /issues API endpoint and the user is
// redirected to the /my-issues page.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useContext, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Fade } from 'react-awesome-reveal';
import PhotoUploader from '../components/PhotoUploader';

const inputClass = 'w-full px-4 py-3 rounded-lg bg-surface-alt border border-border text-text focus:ring-2 focus:ring-focus-ring focus:border-focus-ring outline-none transition-all';
const readonlyClass = 'w-full px-4 py-3 rounded-lg bg-border/20 border border-transparent text-muted cursor-not-allowed outline-none';

const AddIssuePage = () => {
  const { currentUser, dbUser } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "CivicClean | Report Issue";
  }, []);

  const { register, handleSubmit, formState: { errors, isSubmitting }, setValue, watch } = useForm({
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
      toast.success('Issue reported successfully!');
      navigate('/my-issues');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to report issue. Please try again.');
    }
  };

  const categories = ['Garbage', 'Illegal Construction', 'Broken Public Property', 'Road Damage'];

  return (
    <div className="min-h-screen bg-bg py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 text-center">
          <Fade direction="down" triggerOnce>
            <h1 className="text-4xl font-extrabold text-text mb-4">Report an Issue</h1>
            <p className="text-lg text-muted">Help us keep the community clean and safe.</p>
          </Fade>
        </div>

        <Fade direction="up" triggerOnce>
          <div className="bg-surface rounded-2xl shadow-xl overflow-hidden border border-border">
            <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6" noValidate>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="issue-title" className="block text-sm font-semibold text-text mb-2">Issue Title <span className="text-danger" aria-hidden="true">*</span></label>
                  <input
                    id="issue-title"
                    type="text"
                    aria-invalid={!!errors.title}
                    aria-describedby={errors.title ? 'issue-title-error' : undefined}
                    {...register("title", {
                      required: "Title is required",
                      minLength: { value: 5, message: "Title must be at least 5 characters" },
                      maxLength: { value: 100, message: "Title must be 100 characters or fewer" },
                    })}
                    className={inputClass}
                    placeholder="e.g., Overflowing trash bins"
                  />
                  {errors.title && <p id="issue-title-error" role="alert" className="mt-1 text-sm text-danger">{errors.title.message}</p>}
                </div>

                <div>
                  <label htmlFor="issue-category" className="block text-sm font-semibold text-text mb-2">Category <span className="text-danger" aria-hidden="true">*</span></label>
                  <select
                    id="issue-category"
                    aria-invalid={!!errors.category}
                    aria-describedby={errors.category ? 'issue-category-error' : undefined}
                    {...register("category", { required: "Category is required" })}
                    className={inputClass}
                  >
                    <option value="">Select a category</option>
                    {categories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  {errors.category && <p id="issue-category-error" role="alert" className="mt-1 text-sm text-danger">{errors.category.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="issue-location" className="block text-sm font-semibold text-text mb-2">Location <span className="text-danger" aria-hidden="true">*</span></label>
                  <input
                    id="issue-location"
                    type="text"
                    aria-invalid={!!errors.location}
                    aria-describedby={errors.location ? 'issue-location-error' : undefined}
                    {...register("location", {
                      required: "Location is required",
                      minLength: { value: 3, message: "Location must be at least 3 characters" },
                    })}
                    className={inputClass}
                    placeholder="e.g., Central Park, Main St."
                  />
                  {errors.location && <p id="issue-location-error" role="alert" className="mt-1 text-sm text-danger">{errors.location.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-text mb-2">Issue Photo <span className="text-danger" aria-hidden="true">*</span></label>
                  <input type="hidden" {...register("image", { required: "Photo is required" })} />
                  <PhotoUploader
                    currentUrl={imageUrl}
                    displayName={issueTitle}
                    folder="issues"
                    variant="issue"
                    onUploadComplete={(url) => setValue('image', url, { shouldValidate: true, shouldDirty: true })}
                  />
                  {errors.image && <p role="alert" className="mt-1 text-sm text-danger">{errors.image.message}</p>}
                </div>
              </div>

              <div>
                <label htmlFor="issue-description" className="block text-sm font-semibold text-text mb-2">Description <span className="text-danger" aria-hidden="true">*</span></label>
                <textarea
                  id="issue-description"
                  rows="4"
                  aria-invalid={!!errors.description}
                  aria-describedby={errors.description ? 'issue-description-error' : undefined}
                  {...register("description", {
                    required: "Description is required",
                    minLength: { value: 20, message: "Description must be at least 20 characters" },
                  })}
                  className={`${inputClass} resize-none`}
                  placeholder="Provide detailed information about the issue..."
                />
                {errors.description && <p id="issue-description-error" role="alert" className="mt-1 text-sm text-danger">{errors.description.message}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="issue-amount" className="block text-sm font-semibold text-text mb-2">Suggested Fix Budget (kr) <span className="text-danger" aria-hidden="true">*</span></label>
                  <input
                    id="issue-amount"
                    type="number"
                    aria-invalid={!!errors.amount}
                    aria-describedby={errors.amount ? 'issue-amount-error' : undefined}
                    {...register("amount", {
                      required: "Budget is required",
                      min: { value: 1, message: "Budget must be at least 1 kr" },
                      max: { value: 1000000, message: "Budget seems unrealistically high" },
                    })}
                    className={inputClass}
                    placeholder="500"
                  />
                  {errors.amount && <p id="issue-amount-error" role="alert" className="mt-1 text-sm text-danger">{errors.amount.message}</p>}
                </div>

                <div>
                  <label htmlFor="issue-email" className="block text-sm font-semibold text-text mb-2">Your Email</label>
                  <input
                    id="issue-email"
                    type="email"
                    {...register("email")}
                    readOnly
                    className={readonlyClass}
                  />
                </div>

                <div>
                  <label htmlFor="issue-status" className="block text-sm font-semibold text-text mb-2">Status</label>
                  <input
                    id="issue-status"
                    type="text"
                    {...register("status")}
                    readOnly
                    className={`${readonlyClass} uppercase font-bold`}
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-border">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex justify-center items-center gap-2 py-4 px-4 rounded-lg shadow-md text-xl font-bold bg-primary text-on-primary hover:bg-primary-hover focus:outline-none transition-transform hover:-translate-y-1 disabled:opacity-60 disabled:hover:translate-y-0"
                >
                  {isSubmitting && <span className="animate-spin rounded-full h-5 w-5 border-2 border-on-primary border-t-transparent" aria-hidden="true" />}
                  {isSubmitting ? 'Submitting…' : 'Submit Report'}
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
