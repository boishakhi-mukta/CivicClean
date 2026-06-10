import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  FiMail, FiMapPin, FiPhone, FiSend, FiCheckCircle,
  FiUser, FiMessageSquare, FiTag, FiArrowRight,
} from 'react-icons/fi';
import axiosInstance from '../api/axiosInstance';

/* ── Input styling — high contrast, clean border, white bg ── */
const inputBase =
  'w-full px-4 py-3 rounded-xl border bg-surface text-text text-sm outline-none transition placeholder:text-muted/50';
const inputNormal  = `${inputBase} border-border focus:border-primary focus:ring-2 focus:ring-primary/20`;
const inputInvalid = `${inputBase} border-border focus:border-primary focus:ring-2 focus:ring-primary/20`;

/* ── Labelled field wrapper ── */
const Field = ({ label, htmlFor, error, children }) => (
  <div className="space-y-1.5">
    <label
      htmlFor={htmlFor}
      className="block text-sm font-semibold text-text"
    >
      {label}
    </label>
    {children}
    {error && (
      <p className="text-xs font-medium text-danger flex items-center gap-1">
        {error}
      </p>
    )}
  </div>
);

const ContactPage = () => {
  useEffect(() => { document.title = 'CivicClean | Contact Us'; }, []);

  const [submitted,    setSubmitted]   = useState(false);
  const [serverError,  setServerError] = useState('');
  const [loading,      setLoading]     = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    setServerError('');
    try {
      await axiosInstance.post('/contact', data);
      setSubmitted(true);
      reset();
    } catch (err) {
      setServerError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg transition-colors duration-200">

      {/* ── Page header (no hero banner) ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">Get in Touch</p>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-text tracking-tight mb-3">
          Contact Us
        </h1>
        <p className="text-muted text-base max-w-lg leading-relaxed">
          Have a question, suggestion, or concern? We'd love to hear from you.
          Our team typically responds within 24 hours.
        </p>
      </div>

      {/* ── Main content ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* ── Form column ── */}
          <div className="lg:col-span-3">
            {submitted ? (
              /* Success state */
              <div className="bg-surface rounded-2xl shadow-xl border border-border p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-5">
                  <FiCheckCircle size={30} className="text-emerald-600 dark:text-emerald-400" />
                </div>
                <h2 className="text-2xl font-extrabold text-text mb-3">Message Sent!</h2>
                <p className="text-muted leading-relaxed mb-6 max-w-sm mx-auto">
                  Thanks for reaching out. We've received your message and will get back to you within 24 hours.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-7 py-3 bg-primary text-on-primary font-bold rounded-xl hover:bg-primary-hover transition text-sm shadow-md"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              /* Form card */
              <div className="bg-surface rounded-2xl shadow-xl border border-border p-7 sm:p-8">

                {/* Card header */}
                <div className="mb-7 pb-5 border-b border-border">
                  <h2 className="text-xl font-extrabold text-text mb-1">Send us a message</h2>
                  <p className="text-sm text-muted">All fields are required. We'll respond within 24 hours.</p>
                </div>

                {/* Server error — no pink/red border, just a subtle neutral notice */}
                {serverError && (
                  <div className="mb-5 flex items-start gap-3 px-4 py-3.5 bg-surface-alt rounded-xl border border-border">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0 mt-1.5" />
                    <p className="text-sm font-medium text-text">{serverError}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">

                  {/* Name + Email row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <Field label="Full Name" htmlFor="ct-name" error={errors.name?.message}>
                      <div className="relative">
                        <FiUser
                          size={14}
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
                        />
                        <input
                          id="ct-name"
                          placeholder="Your full name"
                          autoComplete="name"
                          aria-invalid={!!errors.name}
                          {...register('name', {
                            required: 'Name is required',
                            minLength: { value: 2, message: 'At least 2 characters' },
                            maxLength: { value: 100, message: 'Max 100 characters' },
                          })}
                          className={`${errors.name ? inputInvalid : inputNormal} pl-10`}
                        />
                      </div>
                    </Field>

                    <Field label="Email Address" htmlFor="ct-email" error={errors.email?.message}>
                      <div className="relative">
                        <FiMail
                          size={14}
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
                        />
                        <input
                          id="ct-email"
                          type="email"
                          placeholder="you@example.com"
                          autoComplete="email"
                          aria-invalid={!!errors.email}
                          {...register('email', {
                            required: 'Email is required',
                            pattern: {
                              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                              message: 'Enter a valid email address',
                            },
                          })}
                          className={`${errors.email ? inputInvalid : inputNormal} pl-10`}
                        />
                      </div>
                    </Field>
                  </div>

                  {/* Subject */}
                  <Field label="Subject" htmlFor="ct-subject" error={errors.subject?.message}>
                    <div className="relative">
                      <FiTag
                        size={14}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
                      />
                      <input
                        id="ct-subject"
                        placeholder="What is this about?"
                        aria-invalid={!!errors.subject}
                        {...register('subject', {
                          required: 'Subject is required',
                          minLength: { value: 4, message: 'At least 4 characters' },
                          maxLength: { value: 200, message: 'Max 200 characters' },
                        })}
                        className={`${errors.subject ? inputInvalid : inputNormal} pl-10`}
                      />
                    </div>
                  </Field>

                  {/* Message */}
                  <Field label="Message" htmlFor="ct-message" error={errors.message?.message}>
                    <div className="relative">
                      <FiMessageSquare
                        size={14}
                        className="absolute left-3.5 top-4 text-muted pointer-events-none"
                      />
                      <textarea
                        id="ct-message"
                        rows={6}
                        placeholder="Describe your question or concern in detail…"
                        aria-invalid={!!errors.message}
                        {...register('message', {
                          required: 'Message is required',
                          minLength: { value: 20, message: 'Please write at least 20 characters' },
                          maxLength: { value: 3000, message: 'Max 3000 characters' },
                        })}
                        className={`${errors.message ? inputInvalid : inputNormal} pl-10 resize-none`}
                      />
                    </div>
                  </Field>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary text-on-primary font-bold rounded-xl hover:bg-primary-hover active:scale-[0.99] transition-all shadow-md disabled:opacity-60 text-sm mt-2"
                  >
                    {loading ? (
                      <>
                        <span className="w-4 h-4 rounded-full border-2 border-on-primary/40 border-t-on-primary animate-spin" />
                        Sending…
                      </>
                    ) : (
                      <>
                        <FiSend size={14} />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* ── Info column ── */}
          <div className="lg:col-span-2 space-y-4">

            {/* Contact info cards */}
            {[
              {
                icon:  FiMail,
                label: 'Email Us',
                value: 'bgmukta11@gmail.com',
                sub:   'We reply within 24 hours',
                href:  'mailto:bgmukta11@gmail.com',
                accent: 'bg-primary/10 text-primary',
              },
              {
                icon:  FiMapPin,
                label: 'Our Location',
                value: 'Oslo, Norway',
                sub:   'Central Operations',
                accent: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
              },
              {
                icon:  FiPhone,
                label: 'Response Time',
                value: 'Within 24 hours',
                sub:   'Mon – Fri, 9am – 6pm CET',
                accent: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
              },
            ].map(({ icon: Icon, label, value, sub, href, accent }) => (
              <div
                key={label}
                className="bg-surface rounded-2xl border border-border shadow-md p-5 flex items-start gap-4"
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${accent}`}>
                  <Icon size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-muted uppercase tracking-wider mb-0.5">{label}</p>
                  {href ? (
                    <a
                      href={href}
                      className="text-sm font-semibold text-primary hover:underline break-all"
                    >
                      {value}
                    </a>
                  ) : (
                    <p className="text-sm font-semibold text-text">{value}</p>
                  )}
                  <p className="text-xs text-muted mt-0.5">{sub}</p>
                </div>
              </div>
            ))}

            {/* Help center teaser */}
            <div className="bg-surface rounded-2xl border border-border shadow-md p-5">
              <p className="text-sm font-bold text-text mb-1.5">Looking for quick answers?</p>
              <p className="text-xs text-muted leading-relaxed mb-4">
                Browse our Help &amp; Support page for answers to the most common questions about using CivicClean.
              </p>
              <Link
                to="/help"
                className="inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:underline"
              >
                Visit Help Center <FiArrowRight size={13} />
              </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
