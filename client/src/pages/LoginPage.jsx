import { useContext, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FcGoogle } from 'react-icons/fc';
import { FiEye, FiEyeOff } from 'react-icons/fi';

const getAuthErrorMessage = (code) => {
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Incorrect email or password. Please try again.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Contact support for help.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please wait a moment before trying again.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection and try again.';
    default:
      return 'Failed to sign in. Please check your credentials and try again.';
  }
};

const LoginPage = () => {
  const { currentUser, dbUser, loading, loginWithEmail, loginWithGoogle } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect back to where the user came from, or fall through to role-based redirect
  const from = location.state?.from?.pathname || '/dashboard';

  useEffect(() => {
    document.title = "CivicClean | Login";
  }, []);

  // Navigate only after auth state (including dbUser sync) is fully ready.
  // If 'from' is a dashboard path that doesn't match the user's role
  // (e.g. staff was redirected from a citizen page), send them to their own dashboard.
  useEffect(() => {
    if (!loading && currentUser && dbUser) {
      const roleBase = dbUser.role === 'admin' ? '/dashboard/admin'
                     : dbUser.role === 'staff'  ? '/dashboard/staff'
                     : '/dashboard/citizen';

      const destination = (from.startsWith('/dashboard') && !from.startsWith(roleBase))
        ? roleBase
        : from;

      navigate(destination, { replace: true });
    }
  }, [currentUser, loading, dbUser, from, navigate]);

  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setIsLoggingIn(true);
    try {
      await loginWithEmail(data.email, data.password);
      toast.success('Successfully logged in!');
      // navigation handled by useEffect above
    } catch (error) {
      setIsLoggingIn(false);
      toast.error(getAuthErrorMessage(error.code));
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    try {
      await loginWithGoogle();
      toast.success('Successfully logged in with Google!');
      // navigation handled by useEffect above
    } catch (error) {
      setIsLoggingIn(false);
      toast.error(error.code === 'auth/popup-closed-by-user' ? 'Sign-in cancelled.' : getAuthErrorMessage(error.code));
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gradient-to-br from-[#1a3a2a]/10 to-[#d4ff00]/10 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
        <div className="p-8">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center space-x-2">
              <span className="text-3xl">🌿</span>
              <span className="text-[#1a3a2a] dark:text-[#d4ff00] font-bold text-3xl tracking-wide">
                CivicClean
              </span>
            </Link>
            <h2 className="mt-6 text-2xl font-bold text-gray-900 dark:text-white">Sign in to your account</h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Welcome back! Please enter your details.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email address</label>
              <input
                type="email"
                {...register("email", { required: "Email is required" })}
                className="mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-[#1a3a2a] focus:border-[#1a3a2a] dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors"
                placeholder="you@example.com"
              />
              {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
              <div className="relative mt-1">
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register("password", { required: "Password is required" })}
                  className="block w-full px-4 py-3 pr-11 bg-gray-50 border border-gray-200 rounded-lg focus:ring-[#1a3a2a] focus:border-[#1a3a2a] dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-bold text-[#1a3a2a] bg-[#d4ff00] hover:bg-[#bce600] focus:outline-none transition-colors disabled:opacity-60"
            >
              {isLoggingIn ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                <FcGoogle className="h-5 w-5 mr-2" />
                Sign in with Google
              </button>
            </div>
          </div>
        </div>
        <div className="px-8 py-6 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-100 dark:border-gray-600 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-[#1a3a2a] hover:underline dark:text-[#d4ff00]">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
