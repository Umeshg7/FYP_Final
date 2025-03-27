/* eslint-disable react/prop-types */
import React, { createContext, useState, useEffect } from 'react';
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile
} from 'firebase/auth';
import app from '../firebase/firebase.config';
import axios from 'axios';

export const AuthContext = createContext();
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Create user with email/password
  const createUser = async (email, password) => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await generateToken(userCredential.user);
      return userCredential;
    } finally {
      setLoading(false);
    }
  };

  // Google sign-in
  const signUpWithGmail = async () => {
    setLoading(true);
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      await generateToken(userCredential.user);
      return userCredential;
    } finally {
      setLoading(false);
    }
  };

  // Email/password login
  const login = async (email, password) => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await generateToken(userCredential.user);
      return userCredential;
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logOut = () => {
    localStorage.removeItem('access-token');
    return signOut(auth);
  };

  // Update profile
  const updateUserProfile = async (name, photoURL) => {
    return updateProfile(auth.currentUser, {
      displayName: name,
      photoURL: photoURL
    });
  };

  // Generate and store JWT token
  const generateToken = async (currentUser) => {
    try {
      const userInfo = { email: currentUser.email };
      const response = await axios.post('http://localhost:6001/jwt', userInfo);
      if (response.data.token) {
        localStorage.setItem('access-token', response.data.token);
      }
    } catch (error) {
      console.error('Token generation failed:', error);
      throw error;
    }
  };

  // Auth state observer
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        try {
          await generateToken(currentUser);
        } catch (error) {
          console.error('Failed to generate token:', error);
        }
      } else {
        localStorage.removeItem('access-token');
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const authInfo = {
    user,
    loading,
    createUser,
    login,
    logOut,
    signUpWithGmail,
    updateUserProfile
  };

  return (
    <AuthContext.Provider value={authInfo}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;