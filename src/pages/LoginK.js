import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBN3cGVw6BTGoGbOWT5NGBBLZsmbukcIcY",
  authDomain: "couple-website-a0cf4.firebaseapp.com",
  projectId: "couple-website-a0cf4",
  storageBucket: "couple-website-a0cf4.firebasestorage.app",
  messagingSenderId: "53111283456",
  appId: "1:53111283456:web:fd311ad0c63c739df2dde5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Initialize Firebase Authentication
const auth = getAuth(app);

const App = () => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const formData = new FormData(e.target);
    const email = formData.get('email');
    const password = formData.get('password');
    
    try {
      // Sign in with Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Show success notification
      toast.success('Login successful! Redirecting...', {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
      
      // Wait a moment for the user to see the success message
      setTimeout(() => {
        navigate('/home');
      }, 2000);
      
    } catch (error) {
      console.error('Login error:', error);
      const errorMsg = getErrorMessage(error.code);
      setError(errorMsg);
      
      // Show error notification
      toast.error(errorMsg, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper function to convert Firebase error codes to user-friendly messages
  const getErrorMessage = (errorCode) => {
    switch (errorCode) {
      case 'auth/invalid-email':
        return 'Invalid email address format.';
      case 'auth/user-disabled':
        return 'This account has been disabled.';
      case 'auth/user-not-found':
        return 'No account found with this email.';
      case 'auth/wrong-password':
        return 'Incorrect password.';
      default:
        return 'An error occurred during login. Please try again.';
    }
  };

  return (
    <>
      {/* Load Tailwind CSS via CDN */}
      <script src="https://cdn.tailwindcss.com"></script>
      <script>
        {`
          tailwind.config = {
            darkMode: 'class',
            theme: {
              extend: {
                colors: {
                  'gray-900': '#111827',
                  'gray-800': '#1f2937',
                  'gray-700': '#374151',
                  'pink-300': '#f9a8d4',
                  'purple-300': '#c7d2fe',
                  'pink-600': '#db2777',
                  'purple-600': '#9333ea',
                },
                animation: {
                  'pulse-slow': 'pulse 8s ease-in-out infinite',
                  'float': 'float 6s ease-in-out infinite',
                  'glow-pulse': 'glowPulse 4s ease-in-out infinite alternate',
                },
                keyframes: {
                  float: {
                    '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
                    '50%': { transform: 'translateY(-15px) rotate(5deg)' },
                  },
                  glowPulse: {
                    '0%': { boxShadow: '0 0 20px rgba(147, 51, 234, 0.3), 0 10px 20px rgba(0, 0, 0, 0.3)' },
                    '100%': { boxShadow: '0 0 30px rgba(147, 51, 234, 0.5), 0 15px 30px rgba(0, 0, 0, 0.4)' },
                  }
                }
              }
            }
          }
        `}
      </script>

      {/* Toast Container for notifications */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />

      {/* Main Container */}
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4 relative overflow-hidden">
        {/* 3D Background Particles (Tailwind blur + gradient) */}
        <div className="particles-container absolute inset-0 pointer-events-none">
          <div className="particle particle-1 absolute w-64 h-64 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full opacity-20 blur-3xl animate-pulse-slow top-1/4 left-10"></div>
          <div className="particle particle-2 absolute w-80 h-80 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full opacity-20 blur-3xl animate-pulse-slow top-1/3 right-10" style={{ animationDelay: '1s' }}></div>
          <div className="particle particle-3 absolute w-72 h-72 bg-gradient-to-r from-blue-500 to-pink-500 rounded-full opacity-20 blur-3xl animate-pulse-slow bottom-20 left-1/2" style={{ animationDelay: '2s' }}></div>
        </div>

        {/* Login Card */}
        <div className="login-card relative z-10 w-full max-w-md bg-gray-800 bg-opacity-70 backdrop-blur-lg rounded-3xl shadow-2xl border border-gray-700 transition-transform hover:scale-105 duration-300 animate-glow-pulse">
          {/* Header */}
          <header className="text-center pt-8 pb-6">
            <div className="heart-container mb-4 flex justify-center animate-float">
              <div className="heart w-16 h-16 flex items-center justify-center bg-gradient-to-r from-pink-500 to-rose-500 rounded-full shadow-lg hover:scale-110 transition-transform duration-300">
                ❤️
              </div>
            </div>
            <h1 className="text-3xl font-light bg-gradient-to-r from-pink-300 to-purple-300 bg-clip-text text-transparent">
              Welcome Back, Kinza
            </h1>
            <p className="text-gray-300 mt-2">Your journey continues here</p>
          </header>

          {/* Form */}
          <form onSubmit={handleLogin} className="px-8 pb-8 space-y-6">
            {/* Error Message */}
            {error && (
              <div className="error-message p-3 bg-red-500 bg-opacity-20 border border-red-500 rounded-lg text-red-200 text-sm">
                {error}
              </div>
            )}
            
            {/* Email Input */}
            <div className="input-group flex flex-col gap-1">
              <label htmlFor="email" className="input-label text-sm text-gray-300 font-light tracking-wide">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                placeholder="kinza@example.com"
                className="input-field w-full px-4 py-3 bg-gray-800 bg-opacity-70 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-300 hover:border-gray-500"
              />
            </div>

            {/* Password Input */}
            <div className="input-group flex flex-col gap-1">
              <label htmlFor="password" className="input-label text-sm text-gray-300 font-light tracking-wide">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                required
                placeholder="••••••••"
                className="input-field w-full px-4 py-3 bg-gray-800 bg-opacity-70 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-300 hover:border-gray-500"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 mt-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg font-semibold text-white shadow-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-purple-500 focus:ring-opacity-50 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing In...
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          {/* Footer */}
          <footer className="text-center px-8 pb-6">
            <a href="#" className="text-sm text-purple-300 hover:text-purple-100 transition-colors duration-200">
              Forgot password?
            </a>
            <p className="text-xs text-gray-400 mt-3">© 2025 Made with love for Kinza</p>
          </footer>
        </div>
      </div>
    </>
  );
};

export default App;