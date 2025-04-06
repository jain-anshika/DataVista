"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";
import { FirebaseError } from "firebase/app";
import Link from "next/link";

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signInWithGoogle, user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    if (user && !authLoading) {
      console.log("User is logged in, redirecting to dashboard");
      router.push("/dashboard");
    }
  }, [user, authLoading, router]);

  const handleGoogleSignIn = async () => {
    try {
      console.log("Starting Google sign-in from login page");
      setLoading(true);
      setError(null);
      
      // Call the signInWithGoogle function from the auth context
      await signInWithGoogle();
      
      // The redirect will happen automatically via the useEffect
      console.log("Sign-in successful, waiting for redirect");
    } catch (error) {
      console.error("Error signing in from login page:", error);
      
      // Provide more specific error messages based on the error code
      if (error instanceof FirebaseError) {
        console.error("Firebase error code:", error.code);
        console.error("Firebase error message:", error.message);
        
        if (error.code === 'auth/popup-closed-by-user') {
          setError("Sign-in was cancelled. Please try again.");
        } else if (error.code === 'auth/popup-blocked') {
          setError("Pop-up was blocked by your browser. Please allow pop-ups for this site.");
        } else if (error.code === 'auth/account-exists-with-different-credential') {
          setError("An account already exists with the same email address but different sign-in credentials.");
        } else if (error.code === 'auth/cancelled-popup-request') {
          setError("Sign-in was cancelled. Please try again.");
        } else if (error.code === 'auth/network-request-failed') {
          setError("Network error. Please check your internet connection and try again.");
        } else {
          setError(`Failed to sign in with Google: ${error.message || 'Unknown error'}`);
        }
      } else {
        console.error("Non-Firebase error:", error);
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="p-8 rounded-lg shadow-lg bg-gray-900 w-96">
        <h2 className="text-3xl font-bold text-purple-400 text-center">Sign In</h2>
        
        {error && (
          <div className="mt-4 p-3 bg-red-900 text-red-200 rounded-lg">
            {error}
          </div>
        )}
        
        <div className="mt-6">
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full bg-gray-700 text-white p-3 rounded-lg text-lg font-semibold shadow-md flex items-center justify-center hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px">
              <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
              <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
              <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
              <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
            </svg>
            {loading ? "Signing in..." : "Sign in with Google"}
          </button>
        </div>
        
        <p className="text-gray-400 mt-4 text-center">
          Don&apos;t have an account? <Link href="/signup" className="text-purple-400 hover:underline">Sign up</Link>
        </p>
        
        <div className="text-center mt-4">
          <Link href="/" className="text-gray-400 hover:text-gray-300">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
