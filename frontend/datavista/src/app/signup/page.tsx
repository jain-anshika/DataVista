'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { auth } from '../firebaseConfig';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { user, signInWithGoogle, updateUserProfile } = useAuth();
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      console.log("User is logged in, redirecting to dashboard");
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
      // Create the user with email and password
      await createUserWithEmailAndPassword(auth, email, password);
      
      // Store additional user information in Firestore
      if (displayName) {
        await updateUserProfile({
          displayName: displayName,
          email: email,
          createdAt: new Date().toISOString()
        });
      }
      
      // Redirect will happen automatically via the useEffect
    } catch (error) {
      console.error("Error signing up:", error);
      if (error instanceof FirebaseError) {
        if (error.code === 'auth/email-already-in-use') {
          setError('This email is already registered. Please login instead.');
        } else if (error.code === 'auth/weak-password') {
          setError('Password is too weak. Please use a stronger password.');
        } else if (error.code === 'auth/invalid-email') {
          setError('Invalid email address.');
        } else {
          setError('Failed to create an account. Please try again.');
        }
      } else {
        setError('Failed to create an account. Please try again.');
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
      // Redirect will happen automatically via the useEffect
    } catch (error) {
      console.error("Error signing in with Google:", error);
      if (error instanceof FirebaseError) {
        if (error.code === 'auth/popup-closed-by-user') {
          setError('Sign-in was cancelled. Please try again.');
        } else if (error.code === 'auth/popup-blocked') {
          setError('Pop-up was blocked by your browser. Please allow pop-ups for this site.');
        } else {
          setError('Google sign-in failed. Please try again.');
        }
      } else {
        setError('Google sign-in failed. Please try again.');
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="p-8 rounded-lg shadow-lg bg-gray-900 w-96">
        <h2 className="text-3xl font-bold text-purple-400 text-center">Sign Up</h2>
        <form className="mt-6" onSubmit={handleSignup}>
          <div>
            <label className="block text-gray-300">Display Name</label>
            <input 
              type="text" 
              value={displayName} 
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full mt-2 p-3 rounded bg-gray-800 text-white border border-gray-700" 
            />
          </div>
          <div className="mt-4">
            <label className="block text-gray-300">Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              required 
              className="w-full mt-2 p-3 rounded bg-gray-800 text-white border border-gray-700" 
            />
          </div>
          <div className="mt-4">
            <label className="block text-gray-300">Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              required 
              className="w-full mt-2 p-3 rounded bg-gray-800 text-white border border-gray-700" 
            />
          </div>
          <div className="mt-4">
            <label className="block text-gray-300">Confirm Password</label>
            <input 
              type="password" 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)}
              required 
              className="w-full mt-2 p-3 rounded bg-gray-800 text-white border border-gray-700" 
            />
          </div>
          {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white p-3 mt-6 rounded-lg text-lg font-semibold shadow-md hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Signing up..." : "Sign Up"}
          </button>
        </form>
        <button 
          onClick={handleGoogleSignIn} 
          disabled={loading}
          className="w-full bg-gray-700 text-white p-3 mt-4 rounded-lg text-lg font-semibold shadow-md flex items-center justify-center hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <img src="/google-icon.svg" alt="Google" className="w-6 h-6 mr-2" />
          Sign up with Google
        </button>
        <p className="text-gray-400 mt-4 text-center">
          Already have an account? <Link href="/login" className="text-purple-400 hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}
