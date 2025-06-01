'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { auth } from '../firebaseConfig';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';

// StarField component (same as login page)
const StarField = () => {
  const [stars, setStars] = useState<Array<{id: number, x: number, y: number, size: number, duration: number, delay: number}>>([]);

  useEffect(() => {
    const generateStars = () => {
      const newStars = [];
      const starCount = window.innerWidth < 768 ? 50 : 100;
      for (let i = 0; i < starCount; i++) {
        newStars.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 3 + 1,
          duration: Math.random() * 10 + 5,
          delay: Math.random() * 5,
        });
      }
      setStars(newStars);
    };

    generateStars();
    window.addEventListener('resize', generateStars);
    return () => window.removeEventListener('resize', generateStars);
  }, []);

  const COLORS = ['#9333EA', '#7C3AED', '#6366F1', '#8B5CF6', '#A855F7', '#C084FC'];

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute rounded-full opacity-80"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            backgroundColor: COLORS[Math.floor(Math.random() * COLORS.length)],
          }}
          animate={{
            opacity: [0.3, 1, 0.3],
            scale: [0.8, 1.2, 0.8],
            y: [0, -20, 0],
          }}
          transition={{
            duration: star.duration,
            repeat: Infinity,
            delay: star.delay,
            ease: "easeInOut",
          }}
        />
      ))}
      
      {[...Array(window.innerWidth < 768 ? 2 : 3)].map((_, i) => (
        <motion.div
          key={`shooting-${i}`}
          className="absolute w-1 h-1 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            backgroundColor: COLORS[Math.floor(Math.random() * COLORS.length)],
          }}
          animate={{
            x: [0, 200],
            y: [0, 100],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 3,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
};

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { user, signInWithGoogle, updateUserProfile } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }
    
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      
      if (displayName) {
        await updateUserProfile({
          displayName: displayName,
          email: email,
          createdAt: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error("Error signing up:", error);
      if (error instanceof FirebaseError) {
        switch (error.code) {
          case 'auth/email-already-in-use':
            setError('This email is already registered. Please login instead.');
            break;
          case 'auth/weak-password':
            setError('Password is too weak (min 6 characters).');
            break;
          case 'auth/invalid-email':
            setError('Invalid email address.');
            break;
          default:
            setError('Failed to create account. Please try again.');
        }
      } else {
        setError('Failed to create account. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      await signInWithGoogle();
    } catch (error) {
      console.error("Error signing in with Google:", error);
      if (error instanceof FirebaseError) {
        setError(error.code === 'auth/popup-closed-by-user' 
          ? 'Sign-in was cancelled.' 
          : 'Google sign-in failed. Please try again.');
      } else {
        setError('Google sign-in failed. Please try again.');
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden p-4">
      {/* Galaxy Background */}
      <div className="absolute inset-0 z-0 bg-[url('/galaxy.gif')] bg-cover bg-center opacity-30"></div>
      
      {/* StarField Background */}
      <StarField />

      <div className="relative z-10 p-6 sm:p-8 rounded-2xl shadow-2xl bg-[#1e1b2e]/50 backdrop-blur-md w-full max-w-md">
        <div className="flex justify-center mb-6 sm:mb-8">
          <img
            src="/bg-7.svg"
            alt="DataVista Logo"
            className="h-12 w-12 sm:h-15 sm:w-15 rounded-full object-contain bg-purple-700 p-2"
          />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-purple-400 text-center mb-2">Create Account</h2>
        <p className="text-sm sm:text-base text-gray-400 text-center mb-6">Join DataVista</p>

        {error && (
          <div className="mb-4 p-3 text-sm sm:text-base bg-red-800/80 text-red-100 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup}>
          {/* Display Name */}
          <div className="flex items-center mb-4 sm:mb-6 bg-gray-800 rounded-lg border border-gray-600 focus-within:ring-2 focus-within:ring-purple-500">
            <img
              src="/user.svg"
              alt="User Icon"
              className="h-4 w-4 sm:h-5 sm:w-5 ml-3"
            />
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Display Name"
              className="w-full p-2 sm:p-3 text-sm sm:text-base bg-transparent text-white focus:outline-none"
            />
          </div>

          {/* Email */}
          <div className="flex items-center mb-4 sm:mb-6 bg-gray-800 rounded-lg border border-gray-600 focus-within:ring-2 focus-within:ring-purple-500">
            <img
              src="/mail.svg"
              alt="Email Icon"
              className="h-4 w-4 sm:h-5 sm:w-5 ml-3"
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              className="w-full p-2 sm:p-3 text-sm sm:text-base bg-transparent text-white focus:outline-none"
            />
          </div>

          {/* Password */}
          <div className="flex items-center mb-4 sm:mb-6 bg-gray-800 rounded-lg border border-gray-600 focus-within:ring-2 focus-within:ring-purple-500">
            <img
              src="/lock.svg"
              alt="Password Icon"
              className="h-4 w-4 sm:h-5 sm:w-5 ml-3"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              minLength={6}
              className="w-full p-2 sm:p-3 text-sm sm:text-base bg-transparent text-white focus:outline-none"
            />
          </div>

          {/* Confirm Password */}
          <div className="flex items-center mb-4 sm:mb-6 bg-gray-800 rounded-lg border border-gray-600 focus-within:ring-2 focus-within:ring-purple-500">
            <img
              src="/lock.svg"
              alt="Confirm Password Icon"
              className="h-4 w-4 sm:h-5 sm:w-5 ml-3"
            />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm Password"
              required
              minLength={6}
              className="w-full p-2 sm:p-3 text-sm sm:text-base bg-transparent text-white focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-700 hover:bg-purple-600 p-2 sm:p-3 rounded-lg font-semibold text-sm sm:text-base shadow-md mb-3 sm:mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <div className="flex items-center justify-center mb-3 sm:mb-4">
          <span className="text-xs sm:text-sm text-gray-500">or</span>
        </div>

        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full bg-gray-700 hover:bg-gray-600 p-2 sm:p-3 rounded-lg text-sm sm:text-base font-semibold shadow-md flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="h-4 w-4 sm:h-5 sm:w-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px">
            <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
            <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
            <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
            <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
          </svg>
          {loading ? "Signing in..." : "Continue with Google"}
        </button>

        <p className="text-xs sm:text-sm text-gray-400 mt-4 text-center">
          Already have an account?{' '}
          <Link href="/login" className="text-purple-400 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}