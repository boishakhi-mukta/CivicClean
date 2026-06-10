import { useContext, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FcGoogle } from 'react-icons/fc';
import { FiEye, FiEyeOff, FiShield, FiBriefcase, FiUser, FiMail, FiLock, FiZap } from 'react-icons/fi';

const getAuthErrorMessage = (code) => {
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Incorrect email or password.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/user-disabled':
      return 'This account has been disabled.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait and try again.';
    case 'auth/network-request-failed':
      return 'Network error. Check your connection.';
    default:
      return 'Failed to sign in. Please check your credentials.';
  }
};

const ROLES = [
  {
    key: 'citizen',
    label: 'Citizen',
    Icon: FiUser,
    email:    process.env.REACT_APP_DEMO_CITIZEN_EMAIL || 'citizen@civicclean.com',
    password: process.env.REACT_APP_DEMO_CITIZEN_PASS  || 'Citizen@123',
  },
  {
    key: 'staff',
    label: 'Staff',
    Icon: FiBriefcase,
    email:    process.env.REACT_APP_DEMO_STAFF_EMAIL || 'staff@civicclean.com',
    password: process.env.REACT_APP_DEMO_STAFF_PASS  || 'Staff@123',
  },
  {
    key: 'admin',
    label: 'Admin',
    Icon: FiShield,
    email:    process.env.REACT_APP_DEMO_ADMIN_EMAIL || 'admin@civicclean.com',
    password: process.env.REACT_APP_DEMO_ADMIN_PASS  || 'Admin@123',
  },
];

const LoginPage = () => {
  const { currentUser, dbUser, loading, loginWithEmail, loginWithGoogle } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const from     = location.state?.from?.pathname || '/dashboard';

  useEffect(() => { document.title = 'CivicClean | Login'; }, []);

  useEffect(() => {
    if (!loading && currentUser && dbUser) {
      const roleBase    = dbUser.role === 'admin' ? '/dashboard/admin'
                        : dbUser.role === 'staff'  ? '/dashboard/staff'
                        : '/dashboard/citizen';
      const destination = from.startsWith('/dashboard') && !from.startsWith(roleBase)
        ? roleBase : from;
      navigate(destination, { replace: true });
    }
  }, [currentUser, loading, dbUser, from, navigate]);

  const [activeRole,   setActiveRole]   = useState(ROLES[0]);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn,  setIsLoggingIn]  = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setIsLoggingIn(true);
    try {
      await loginWithEmail(data.email, data.password);
      toast.success('Signed in successfully!');
    } catch (error) {
      setIsLoggingIn(false);
      toast.error(getAuthErrorMessage(error.code));
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    try {
      await loginWithGoogle();
      toast.success('Signed in with Google!');
    } catch (error) {
      setIsLoggingIn(false);
      toast.error(error.code === 'auth/popup-closed-by-user' ? 'Sign-in cancelled.' : getAuthErrorMessage(error.code));
    }
  };

  const handleDemoLogin = async () => {
    if (!activeRole.email || !activeRole.password) {
      toast.error('Demo credentials are not configured yet.');
      return;
    }
    setIsDemoLoading(true);
    try {
      await loginWithEmail(activeRole.email, activeRole.password);
      toast.success(`Exploring as Demo ${activeRole.label}!`);
    } catch (error) {
      setIsDemoLoading(false);
      toast.error(getAuthErrorMessage(error.code));
    }
  };

  const anyLoading = isLoggingIn || isDemoLoading;

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-surface-alt py-10 px-4">
      <div className="w-full max-w-md bg-surface rounded-2xl shadow-xl border border-border p-8">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-text">Welcome Back! 👋</h1>
          <p className="mt-2 text-sm text-muted">Sign in to continue to CivicClean.</p>
        </div>

        {/* Role selector */}
        <div className="mb-7">
          <p className="text-sm font-bold text-text mb-3">Login as</p>
          <div className="grid grid-cols-3 gap-3">
            {ROLES.map((role) => {
              const Icon     = role.Icon;
              const isActive = activeRole.key === role.key;
              return (
                <button
                  key={role.key}
                  type="button"
                  onClick={() => setActiveRole(role)}
                  className={`flex flex-col items-center gap-2 py-4 px-2 rounded-xl border-2 transition-all duration-150 focus:outline-none
                    ${isActive
                      ? 'border-primary bg-primary/8 text-primary'
                      : 'border-border bg-surface text-muted hover:border-primary/40 hover:text-text'
                    }`}
                >
                  <Icon size={26} strokeWidth={isActive ? 2.2 : 1.8} />
                  <span className={`text-xs font-bold ${isActive ? 'text-primary' : 'text-muted'}`}>
                    {role.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>

          <div>
            <label htmlFor="login-email" className="block text-sm font-semibold text-text mb-1.5">
              Email
            </label>
            <div className="relative">
              <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" size={16} />
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                aria-invalid={!!errors.email}
                {...register('email', {
                  required: 'Email is required',
                  pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email' },
                })}
                placeholder="Enter your email"
                className="w-full pl-10 pr-4 py-3 bg-surface-alt border border-border rounded-xl text-text text-sm outline-none focus:ring-2 focus:ring-focus-ring focus:border-primary transition aria-invalid:border-danger"
              />
            </div>
            {errors.email && <p role="alert" className="mt-1 text-xs text-danger">{errors.email.message}</p>}
          </div>

          <div>
            <label htmlFor="login-password" className="block text-sm font-semibold text-text mb-1.5">
              Password
            </label>
            <div className="relative">
              <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" size={16} />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                aria-invalid={!!errors.password}
                {...register('password', {
                  required: 'Password is required',
                  minLength: { value: 6, message: 'At least 6 characters' },
                })}
                placeholder="Enter your password"
                className="w-full pl-10 pr-11 py-3 bg-surface-alt border border-border rounded-xl text-text text-sm outline-none focus:ring-2 focus:ring-focus-ring focus:border-primary transition aria-invalid:border-danger"
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-text transition"
              >
                {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>
            {errors.password && <p role="alert" className="mt-1 text-xs text-danger">{errors.password.message}</p>}
          </div>

          <div className="flex justify-end">
            <button type="button" className="text-xs font-semibold text-primary hover:underline">
              Forgot Password?
            </button>
          </div>

          {/* Sign in button */}
          <button
            type="submit"
            disabled={anyLoading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-on-primary font-bold text-sm hover:bg-primary-hover transition disabled:opacity-60"
          >
            {isLoggingIn && <span className="w-4 h-4 rounded-full border-2 border-on-primary border-t-transparent animate-spin" />}
            {isLoggingIn ? 'Signing in…' : 'Login'}
          </button>
        </form>

        {/* Divider */}
        <div className="my-5 flex items-center gap-3">
          <div className="flex-1 border-t border-border" />
          <span className="text-xs text-muted">or</span>
          <div className="flex-1 border-t border-border" />
        </div>

        {/* Demo login */}
        <button
          type="button"
          onClick={handleDemoLogin}
          disabled={anyLoading}
          className="w-full flex items-center justify-center gap-2 py-3 mb-3 rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 text-primary font-bold text-sm hover:bg-primary/10 hover:border-primary/60 transition disabled:opacity-50"
        >
          {isDemoLoading
            ? <span className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            : <FiZap size={15} />
          }
          {isDemoLoading ? 'Loading demo…' : `Try Demo as ${activeRole.label}`}
        </button>

        {/* Google */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={anyLoading}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-border bg-surface text-sm font-medium text-text hover:bg-surface-alt transition disabled:opacity-60"
        >
          <FcGoogle size={18} />
          Continue with Google
        </button>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-muted">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-primary hover:underline">
            Sign up here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
