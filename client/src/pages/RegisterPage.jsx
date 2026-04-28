import React, { useContext, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { FcGoogle } from 'react-icons/fc';

const RegisterPage = () => {
  const { registerWithEmail, loginWithGoogle } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "CivicClean | Register";
  }, []);

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    try {
      await registerWithEmail(data.name, data.email, data.photoURL, data.password);
      Swal.fire({
        title: 'Registration Successful!',
        text: 'Welcome to CivicClean. You are now logged in.',
        icon: 'success',
        confirmButtonColor: '#1a3a2a',
      });
      navigate('/');
    } catch (error) {
      toast.error(error.message || 'Failed to register. Please try again.');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      Swal.fire({
        title: 'Registration Successful!',
        text: 'Welcome to CivicClean. You are now logged in via Google.',
        icon: 'success',
        confirmButtonColor: '#1a3a2a',
      });
      navigate('/');
    } catch (error) {
      toast.error(error.message || 'Failed to register with Google.');
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
            <h2 className="mt-6 text-2xl font-bold text-gray-900 dark:text-white">Create your account</h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Join the community to start reporting issues.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
              <input
                type="text"
                {...register("name", { required: "Name is required" })}
                className="mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-[#1a3a2a] focus:border-[#1a3a2a] dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="John Doe"
              />
              {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email address</label>
              <input
                type="email"
                {...register("email", { required: "Email is required" })}
                className="mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-[#1a3a2a] focus:border-[#1a3a2a] dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="you@example.com"
              />
              {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Photo URL</label>
              <input
                type="url"
                {...register("photoURL", { required: "Photo URL is required" })}
                className="mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-[#1a3a2a] focus:border-[#1a3a2a] dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="https://example.com/photo.jpg"
              />
              {errors.photoURL && <p className="mt-1 text-sm text-red-500">{errors.photoURL.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
              <input
                type="password"
                {...register("password", { 
                  required: "Password is required",
                  minLength: { value: 6, message: "Password must be at least 6 characters" },
                  pattern: {
                    value: /^(?=.*[a-z])(?=.*[A-Z])/,
                    message: "Password must contain at least one uppercase and one lowercase letter"
                  }
                })}
                className="mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-[#1a3a2a] focus:border-[#1a3a2a] dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="••••••••"
              />
              {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>}
              
              <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-600 text-xs text-gray-500 dark:text-gray-400">
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
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-bold text-[#1a3a2a] bg-[#d4ff00] hover:bg-[#bce600] transition-colors"
            >
              Sign Up
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
                Sign up with Google
              </button>
            </div>
          </div>
        </div>
        <div className="px-8 py-6 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-100 dark:border-gray-600 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-[#1a3a2a] hover:underline dark:text-[#d4ff00]">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
