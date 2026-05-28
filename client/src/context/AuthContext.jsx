import { createContext, useState, useEffect } from 'react';
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
import axiosInstance from '../api/axiosInstance';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [dbUser, setDbUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const syncDbUser = async (firebaseUser) => {
    try {
      await axiosInstance.post('/users', {
        firebase_uid: firebaseUser.uid,
        name: firebaseUser.displayName || '',
        email: firebaseUser.email,
        avatar_url: firebaseUser.photoURL || '',
      });
      const { data } = await axiosInstance.get('/users/me');
      setDbUser(data);
    } catch (error) {
      console.error('Failed to sync user with DB:', error);
      setDbUser(null);
    }
  };

  const refreshDbUser = async () => {
    try {
      const { data } = await axiosInstance.get('/users/me');
      setDbUser(data);
      return data;
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  const registerWithEmail = async (name, email, photoURL, password) => {
    setLoading(true);
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName: name, photoURL });
    setCurrentUser({ ...userCredential.user, displayName: name, photoURL });
    return userCredential;
  };

  const loginWithEmail = (email, password) => {
    setLoading(true);
    return signInWithEmailAndPassword(auth, email, password);
  };

  const loginWithGoogle = () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  };

  const logout = () => {
    setLoading(true);
    return signOut(auth);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        await syncDbUser(user);
      } else {
        setCurrentUser(null);
        setDbUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const authInfo = {
    currentUser,
    dbUser,
    loading,
    refreshDbUser,
    registerWithEmail,
    loginWithEmail,
    loginWithGoogle,
    logout,
  };

  return (
    <AuthContext.Provider value={authInfo}>
      {children}
    </AuthContext.Provider>
  );
};
