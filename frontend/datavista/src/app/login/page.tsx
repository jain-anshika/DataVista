"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";
import { FirebaseError } from "firebase/app";
import Link from "next/link";
import { motion } from "framer-motion";

// Define the Star interface
interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
}

const COLORS = ['#9333EA', '#7C3AED', '#6366F1', '#8B5CF6', '#A855F7', '#C084FC'];

// Animated Stars Background Component
const StarField = () => {
  const [starsINN, setStars] = useState<Star[]>([]);

  useEffect(() => {
    const generateStars = () => {
      const newStars: Star[] = [];
      for (let i = 0; i < 100; i++) {
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
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {starsINN.map((star) => (
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
      
      {/* Shooting stars */}
      {[...Array(3)].map((_, i) => (
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

// Main Login Component
export default function Login() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

  const handleError = (error: any) => {
    if (error instanceof FirebaseError) {
      switch (error.code) {
        case 'auth/user-not-found':
          setError("User not found. Please sign up first.");
          break;
        case 'auth/wrong-password':
          setError("Incorrect password. Please try again.");
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
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden">
      {/* Existing Galaxy Background */}
      <div className="absolute inset-0 z-0 bg-[url('/galaxy.gif')] bg-cover bg-center opacity-30 animate-float-stars"></div>
      
      {/* Add StarField Background */}
      <StarField />

      <div className="relative z-10 p-10 rounded-2xl shadow-2xl bg-[#1e1b2e]/50 backdrop-blur-md w-[32rem] text-white">
        <div className="flex justify-center mb-4">
          <img
            src="/bg-7.svg"
            alt="Analysis Icon"
            className="h-12 w-12 rounded-full object-contain bg-purple-700 p-2"
          />
        </div>
        <h2 className="text-3xl font-bold text-purple-400 text-center mb-2">Welcome Back</h2>
        <p className="text-gray-400 text-center mb-6">Login to your Data Analysis Dashboard!</p>

        {error && <div className="mb-4 p-3 bg-red-800 text-red-100 rounded-lg">{error}</div>}

        {/* Email Input with Icon */}
        <div className="flex items-center mb-4 bg-gray-800 rounded-lg border border-gray-600 focus-within:ring-2 focus-within:ring-purple-500">
          <svg
            className="h-5 w-5 text-purple-400 ml-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M16 12H8m4 4v-8m-4 4h8M4 6h16v12H4V6z"
            />
          </svg>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full p-3 bg-transparent text-white focus:outline-none"
          />
        </div>

        {/* Password Input with Icon */}
        <div className="flex items-center mb-4 bg-gray-800 rounded-lg border border-gray-600 focus-within:ring-2 focus-within:ring-purple-500">
          <svg
            className="h-5 w-5 text-purple-400 ml-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 11c0-1.1-.9-2-2-2s-2 .9-2 2c0 .7.4 1.3 1 1.7V15h2v-2.3c.6-.4 1-1 1-1.7zm-2-7C6.7 4 4 6.7 4 10v5h2v-5c0-2.2 1.8-4 4-4s4 1.8 4 4v5h2v-5c0-3.3-2.7-6-6-6zm0 14c-1.1 0-2-.9-2-2h-2c0 2.2 1.8 4 4 4s4-1.8 4-4h-2c0 1.1-.9 2-2 2z"
            />
          </svg>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full p-3 bg-transparent text-white focus:outline-none"
          />
        </div>

        <button
          onClick={handleEmailLogin}
          disabled={loading}
          className="w-full bg-purple-700 hover:bg-purple-600 p-3 rounded-lg font-semibold shadow-md mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Signing in..." : "Login"}
        </button>

        <div className="flex items-center justify-center mb-4">
          <span className="text-gray-500">or</span>
        </div>

        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full bg-gray-700 hover:bg-gray-600 p-3 rounded-lg text-lg font-semibold shadow-md flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px">
            <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
            <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
            <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
            <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
          </svg>
          {loading ? "Signing in..." : "Continue with Google"}
        </button>

        <p className="text-gray-400 mt-4 text-center">
          Don't have an account? <Link href="/signup" className="text-purple-400 hover:underline">Sign Up</Link>
        </p>
      </div>
    </div>
  );
}