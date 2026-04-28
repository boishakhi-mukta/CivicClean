import React, { createContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  GoogleAuthProvider, 
  signInWithPopup,
  updateProfile
} from 'firebase/auth';
import auth from '../firebase/firebase.config';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Register with email and password
  const registerWithEmail = async (name, email, photoURL, password) => {
    setLoading(true);
    // createUserWithEmailAndPassword will trigger onAuthStateChanged
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    // Update profile with name and photo
    await updateProfile(userCredential.user, {
      displayName: name,
      photoURL: photoURL
    });
    // Update local state to reflect the new profile data immediately
    setCurrentUser({ ...userCredential.user, displayName: name, photoURL });
    return userCredential;
  };

  // Login with email and password
  const loginWithEmail = (email, password) => {
    setLoading(true);
    return signInWithEmailAndPassword(auth, email, password);
  };

  // Login with Google
  const loginWithGoogle = () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  };

  // Logout
  const logout = () => {
    setLoading(true);
    return signOut(auth);
  };

  // Track user state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const authInfo = {
    currentUser,
    loading,
    registerWithEmail,
    loginWithEmail,
    loginWithGoogle,
    logout
  };

  return (
    <AuthContext.Provider value={authInfo}>
      {children}
    </AuthContext.Provider>
  );
};
