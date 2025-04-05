import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, 
  GoogleAuthProvider, 
  signInWithPopup, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword as firebaseSignInWithEmailPassword,
  signInAnonymously as firebaseSignInAnonymously,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { AuthContextType, UserProfile } from '../types';

// Create the context
const AuthContext = createContext<AuthContextType | null>(null);

// Create a provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setUser(user);
      
      if (user) {
        try {
          // Get user profile from Firestore
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            // User profile exists, set it
            setUserProfile(userDoc.data() as UserProfile);
          } else {
            // Create a new user profile
            const newUserProfile: UserProfile = {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              photoURL: user.photoURL,
              createdAt: new Date(),
              favorites: [],
              purchases: []
            };
            
            // Save to Firestore
            await setDoc(userDocRef, {
              ...newUserProfile,
              createdAt: serverTimestamp()
            });
            
            setUserProfile(newUserProfile);
          }
        } catch (err) {
          console.error('Error fetching user profile:', err);
          setError('Failed to load user profile');
        }
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      setError(null);
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error('Google sign in error:', err);
      setError('Failed to sign in with Google');
    }
  };

  // Sign in with email and password
  const signInWithEmailPassword = async (email: string, password: string) => {
    try {
      setError(null);
      await firebaseSignInWithEmailPassword(auth, email, password);
    } catch (err) {
      console.error('Email/password sign in error:', err);
      setError('Failed to sign in with email/password');
    }
  };

  // Sign up with email and password
  const signUpWithEmailPassword = async (email: string, password: string, displayName: string) => {
    try {
      setError(null);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile with display name
      if (userCredential.user) {
        await updateProfile(userCredential.user, {
          displayName
        });
      }
    } catch (err) {
      console.error('Email/password sign up error:', err);
      setError('Failed to sign up with email/password');
    }
  };

  // Sign in anonymously
  const signInAnonymously = async () => {
    try {
      setError(null);
      await firebaseSignInAnonymously(auth);
    } catch (err) {
      console.error('Anonymous sign in error:', err);
      setError('Failed to sign in anonymously');
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      setError(null);
      await firebaseSignOut(auth);
    } catch (err) {
      console.error('Sign out error:', err);
      setError('Failed to sign out');
    }
  };

  // Reset password
  const resetPassword = async (email: string) => {
    try {
      setError(null);
      await sendPasswordResetEmail(auth, email);
    } catch (err) {
      console.error('Password reset error:', err);
      setError('Failed to send password reset email');
    }
  };

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    error,
    signInWithGoogle,
    signInWithEmailPassword,
    signUpWithEmailPassword,
    signInAnonymously,
    signOut,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Create a hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};