// ─────────────────────────────────────────────────────────────────────────────
// RegisterPage.jsx — The account creation screen for new citizens.
//
// Two ways to register:
//   1. Fill in the form — name, email, password, and a profile photo.
//   2. "Sign up with Google" — skips the form and registers instantly using
//      your existing Google account.
//
// Profile photo upload:
//   The PhotoUploader is used with uploadOnSelect={false} which means the photo
//   is NOT uploaded to storage immediately when picked — it stays as a local
//   file object. The actual upload happens inside registerWithEmail() in
//   AuthContext, so the photo and the new account are created together.
//
// Password requirements:
//   A visible hint box reminds the user that the password must be at least 6
//   characters and must contain at least one uppercase and one lowercase letter.
//
// After successful registration, the user is sent directly to the citizen
// dashboard — no extra steps needed.
// ─────────────────────────────────────────────────────────────────────────────

import { useContext, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FcGoogle } from 'react-icons/fc';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import PhotoUploader from '../components/PhotoUploader';

const RegisterPage = () => {
  const { registerWithEmail, loginWithGoogle } = useContext(AuthContext);
  const navigate = useNavigate();
  const [photoFile, setPhotoFile]   = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    document.title = 'CivicClean | Register';
  }, []);

  const { register, handleSubmit, formState: { errors, isSubmitting }, setValue, watch } = useForm();

  const onSubmit = async (data) => {
    try {
      await registerWithEmail(data.name, data.email, photoFile, data.password);
      toast.success('Welcome to CivicClean! Your account has been created.');
      navigate('/dashboard/citizen', { replace: true });
    } catch (error) {
      toast.error(error.message || 'Failed to register. Please try again.');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      toast.success('Welcome to CivicClean!');
      navigate('/dashboard/citizen', { replace: true });
    } catch (error) {
      toast.error(error.message || 'Failed to register with Google.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gradient-to-br from-primary/5 to-on-primary/5 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-surface rounded-2xl shadow-xl overflow-hidden border border-border">
        <div className="p-8">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center space-x-2">
              <span className="text-3xl">🌿</span>
              <span className="text-primary font-bold text-3xl tracking-wide">CivicClean</span>
            </Link>
            <h2 className="mt-6 text-2xl font-bold text-text">Create your account</h2>
            <p className="mt-2 text-sm text-muted">Join the community to start reporting issues.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div>
              <label htmlFor="reg-name" className="block text-sm font-medium text-text">Full Name</label>
              <input
                id="reg-name"
                type="text"
                autoComplete="name"
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? 'reg-name-error' : undefined}
                {...register('name', {
                  required: 'Name is required',
                  minLength: { value: 2, message: 'Name must be at least 2 characters' },
                  maxLength: { value: 60, message: 'Name must be 60 characters or fewer' },
                })}
                className="mt-1 block w-full px-4 py-3 bg-surface-alt border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-focus-ring focus:border-focus-ring transition-colors aria-invalid:border-danger"
                placeholder="John Doe"
              />
              {errors.name && <p id="reg-name-error" role="alert" className="mt-1 text-sm text-danger">{errors.name.message}</p>}
            </div>

            <div>
              <label htmlFor="reg-email" className="block text-sm font-medium text-text">Email address</label>
              <input
                id="reg-email"
                type="email"
                autoComplete="email"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'reg-email-error' : undefined}
                {...register('email', {
                  required: 'Email is required',
                  pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email address' },
                })}
                className="mt-1 block w-full px-4 py-3 bg-surface-alt border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-focus-ring focus:border-focus-ring transition-colors aria-invalid:border-danger"
                placeholder="you@example.com"
              />
              {errors.email && <p id="reg-email-error" role="alert" className="mt-1 text-sm text-danger">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-text">Profile Photo</label>
              <PhotoUploader
                currentUrl={watch('photoURL')}
                displayName={watch('name')}
                uploadOnSelect={false}
                onFileSelected={(file) => {
                  setPhotoFile(file);
                  setValue('photoURL', file.name, { shouldValidate: true, shouldDirty: true });
                }}
              />
              <input type="hidden" {...register('photoURL', { required: 'Profile photo is required' })} />
              {errors.photoURL && <p role="alert" className="mt-1 text-sm text-danger">{errors.photoURL.message}</p>}
            </div>

            <div>
              <label htmlFor="reg-password" className="block text-sm font-medium text-text">Password</label>
              <div className="relative mt-1">
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  aria-invalid={!!errors.password}
                  aria-describedby="reg-password-hint reg-password-error"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 6, message: 'Password must be at least 6 characters' },
                    pattern: {
                      value: /^(?=.*[a-z])(?=.*[A-Z])/,
                      message: 'Password must contain at least one uppercase and one lowercase letter',
                    },
                  })}
                  className="block w-full px-4 py-3 pr-11 bg-surface-alt border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-focus-ring focus:border-focus-ring transition-colors aria-invalid:border-danger"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute inset-y-0 right-3 flex items-center text-muted hover:text-text"
                >
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
              {errors.password && <p id="reg-password-error" role="alert" className="mt-1 text-sm text-danger">{errors.password.message}</p>}

              <div id="reg-password-hint" className="mt-2 p-3 bg-surface-alt rounded-lg border border-border text-xs text-muted">
                <p className="font-semibold mb-1">Password Requirements:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>At least 6 characters long</li>
                  <li>Must have an uppercase letter</li>
                  <li>Must have a lowercase letter</li>
                </ul>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-lg shadow-sm text-lg font-bold bg-primary text-on-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-focus-ring transition-colors disabled:opacity-60"
            >
              {isSubmitting && <span className="animate-spin rounded-full h-4 w-4 border-2 border-on-primary border-t-transparent" aria-hidden="true" />}
              {isSubmitting ? 'Creating account…' : 'Sign Up'}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-surface text-muted">Or continue with</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center px-4 py-3 border border-border rounded-lg shadow-sm bg-surface text-sm font-medium text-text hover:bg-surface-alt transition-colors"
              >
                <FcGoogle className="h-5 w-5 mr-2" />
                Sign up with Google
              </button>
            </div>
          </div>
        </div>

        <div className="px-8 py-6 bg-surface-alt border-t border-border text-center">
          <p className="text-sm text-muted">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
