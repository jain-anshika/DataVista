"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  User, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged,
  signOut as firebaseSignOut
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../app/firebaseConfig';

// Define a type for user profile data
interface UserProfileData {
  displayName?: string;
  photoURL?: string;
  bio?: string;
  preferences?: Record<string, unknown>;
  [key: string]: unknown;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updateUserProfile: (data: UserProfileData) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      // If user is logged in, ensure their data is stored in Firestore
      if (user) {
        await storeUserData(user);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Store user data in Firestore
  const storeUserData = async (user: User) => {
    try {
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        // Create new user document if it doesn't exist
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || '',
          photoURL: user.photoURL || '',
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
          provider: user.providerData[0]?.providerId || 'unknown'
        });
        console.log('New user data stored in Firestore');
      } else {
        // Update last login time for existing users
        await setDoc(userRef, {
          lastLogin: serverTimestamp()
        }, { merge: true });
        console.log('User login time updated in Firestore');
      }
    } catch (error) {
      console.error('Error storing user data:', error);
    }
  };

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      // User data will be stored via the onAuthStateChanged listener
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const updateUserProfile = async (data: UserProfileData) => {
    if (!user) return;
    
    try {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, data, { merge: true });
      console.log('User profile updated in Firestore');
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    signInWithGoogle,
    signOut,
    updateUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
} 