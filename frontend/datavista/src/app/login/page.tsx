"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";
import { FirebaseError } from "firebase/app";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
}

const COLORS = ['rgba(147, 51, 234, 0.8)', 'rgba(124, 58, 237, 0.8)', 'rgba(99, 102, 241, 0.8)', 'rgba(139, 92, 246, 0.8)', 'rgba(168, 85, 247, 0.8)', 'rgba(192, 132, 252, 0.8)'];

const StarField = () => {
  const [stars, setStars] = useState<Star[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (typeof window === 'undefined') return;

    const generateStars = () => {
      const newStars: Star[] = [];
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
    
    const handleResize = () => {
      generateStars();
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!isClient) return null;

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute rounded-full"
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

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { signInWithGoogle, signInWithEmailPassword, user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && !authLoading) {
      router.push("/dashboard");
    }
  }, [user, authLoading, router]);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      await signInWithGoogle();
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async () => {
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await signInWithEmailPassword(email, password);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleError = (error: unknown) => {
    if (error instanceof FirebaseError) {
      switch (error.code) {
        case 'auth/user-not-found':
          setError("User not found. Please sign up first.");
          break;
        case 'auth/wrong-password':
          setError("Incorrect password. Please try again.");
          break;
        case 'auth/invalid-email':
          setError("Invalid email address.");
          break;
        default:
          setError(error.message);
      }
    } else {
      setError("An unexpected error occurred. Please try again.");
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-purple-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 p-4 relative overflow-hidden">
      <Link href="/" className="absolute top-6 left-6 z-50">
        <motion.div 
          className="flex items-center gap-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="text-2xl">🔍</span>
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-indigo-200">
            DataVista
          </h1>
        </motion.div>
      </Link>

      <div className="absolute inset-0 bg-[url('/galaxy.gif')] bg-cover bg-center opacity-20"></div>
      <StarField />

      <div className="relative z-10 p-6 sm:p-8 rounded-2xl shadow-2xl w-full max-w-md backdrop-blur-lg mb-8"
           style={{
             background: 'radial-gradient(circle at center, rgba(30, 27, 46, 0.7) 0%, rgba(46, 16, 101, 0.7) 100%)',
             border: '1px solid rgba(139, 92, 246, 0.3)',
             boxShadow: '0 8px 32px 0 rgba(103, 58, 183, 0.37)'
           }}>
        <div className="flex justify-center mb-6">
          <div className="h-16 w-16 rounded-full flex items-center justify-center bg-gradient-to-br from-purple-600 to-indigo-600 p-2">
            <Image
              src="/bg-7.svg"
              alt="Analysis Icon"
              width={40}
              height={40}
              className="h-10 w-10 object-contain"
              priority
            />
          </div>
        </div>
        
        <h2 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-300 text-center mb-2">
          Welcome Back
        </h2>
        <p className="text-gray-300 text-center mb-6">Login to DataVista</p>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 rounded-lg bg-gradient-to-r from-red-900/80 to-pink-900/80 text-red-100"
          >
            {error}
          </motion.div>
        )}

        <div className="space-y-4">
          <div className="flex items-center bg-gray-800/50 rounded-lg border border-gray-700 focus-within:ring-2 focus-within:ring-purple-500 focus-within:border-transparent transition-all duration-200">
            <div className="pl-3 pr-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full p-3 bg-transparent text-white placeholder-gray-400 focus:outline-none"
            />
          </div>

          <div className="flex items-center bg-gray-800/50 rounded-lg border border-gray-700 focus-within:ring-2 focus-within:ring-purple-500 focus-within:border-transparent transition-all duration-200">
            <div className="pl-3 pr-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full p-3 bg-transparent text-white placeholder-gray-400 focus:outline-none"
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              className="px-3 text-gray-400 hover:text-purple-300 transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleEmailLogin}
            disabled={loading}
            className="w-full p-3 rounded-lg font-semibold shadow-md mb-4 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            style={{
              background: 'linear-gradient(45deg, rgba(124, 58, 237, 0.9) 0%, rgba(99, 102, 241, 0.9) 100%)',
              boxShadow: '0 4px 15px rgba(124, 58, 237, 0.4)'
            }}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </span>
            ) : (
              "Login"
            )}
          </motion.button>

          <div className="flex items-center justify-center mb-4">
            <div className="flex-1 h-px bg-gray-700"></div>
            <span className="px-3 text-gray-400 text-sm">or</span>
            <div className="flex-1 h-px bg-gray-700"></div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full p-3 rounded-lg font-medium shadow-md flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            style={{
              background: 'rgba(55, 65, 81, 0.7)',
              border: '1px solid rgba(75, 85, 99, 0.5)'
            }}
          >
            <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px">
              <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
              <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
              <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
              <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
            </svg>
            {loading ? "Signing in..." : "Continue with Google"}
          </motion.button>

          <p className="text-gray-400 mt-4 text-center text-sm sm:text-base">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-purple-300 hover:text-purple-200 hover:underline transition-colors duration-200">
              Sign Up
            </Link>
          </p>
        </div>
      </div>

      <footer className="relative z-10 w-full py-4 text-center text-gray-400 text-sm">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          © 2025 DataVista by Anshika Jain. All rights reserved.
        </motion.p>
      </footer>
    </div>
  );
}