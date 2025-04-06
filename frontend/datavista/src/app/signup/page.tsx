'use client';

import { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../firebaseConfig'; 
import Link from 'next/link';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      window.location.href = '/dashboard'; // Redirect on success
    } catch (err) {
      setError('Failed to create an account. Please try again.');
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      window.location.href = '/dashboard'; // Redirect on success
    } catch (err) {
      setError('Google sign-in failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="p-8 rounded-lg shadow-lg bg-gray-900 w-96">
        <h2 className="text-3xl font-bold text-purple-400 text-center">Sign Up</h2>
        <form className="mt-6" onSubmit={handleSignup}>
          <div>
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
          <button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white p-3 mt-6 rounded-lg text-lg font-semibold shadow-md hover:opacity-80">Sign Up</button>
        </form>
        <button onClick={handleGoogleSignIn} className="w-full bg-gray-700 text-white p-3 mt-4 rounded-lg text-lg font-semibold shadow-md flex items-center justify-center hover:opacity-80">
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
