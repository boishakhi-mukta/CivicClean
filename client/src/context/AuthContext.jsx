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
import { readPhotoAsDataUrl } from '../utils/uploadPhoto';

export const AuthContext = createContext();

// Holds a photo URL set during registration so syncDbUser can save it to the DB.
// Firebase Auth rejects base64 data URLs in photoURL, so we bypass it entirely
// and write the photo straight to the DB instead.
let _pendingAvatarUrl = '';

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [dbUser, setDbUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const syncDbUser = async (firebaseUser) => {
    try {
      // Use pending avatar (set during registration) if available, otherwise
      // fall back to whatever Firebase Auth has on the user object.
      const avatar_url = _pendingAvatarUrl || firebaseUser.photoURL || '';
      _pendingAvatarUrl = '';

      await axiosInstance.post('/users', {
        firebase_uid: firebaseUser.uid,
        name: firebaseUser.displayName || '',
        email: firebaseUser.email,
        avatar_url,
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

  const updateCurrentUserProfile = async ({ name, avatar_url }) => {
    if (!auth.currentUser) return null;
    try {
      // Only pass HTTPS URLs to Firebase Auth — base64 data URLs are rejected
      const safePhotoURL = avatar_url?.startsWith('http') ? avatar_url : '';
      await updateProfile(auth.currentUser, {
        displayName: name || '',
        photoURL: safePhotoURL,
      });
      await auth.currentUser.reload();
      setCurrentUser({ ...auth.currentUser });
      return auth.currentUser;
    } catch (error) {
      console.error('Failed to sync Firebase profile:', error);
      return null;
    }
  };

  const registerWithEmail = async (name, email, photoFile, password) => {
    setLoading(true);

    // Convert photo to base64 immediately — no Firebase Storage round-trip.
    // Firebase Auth's photoURL doesn't accept base64 anyway, so we store it
    // in _pendingAvatarUrl and let syncDbUser write it to the DB directly.
    if (photoFile) {
      try {
        _pendingAvatarUrl = await readPhotoAsDataUrl(photoFile);
      } catch {
        _pendingAvatarUrl = '';
      }
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    // Only set displayName in Firebase Auth; photo goes to DB via syncDbUser
    await updateProfile(userCredential.user, { displayName: name, photoURL: '' });
    setCurrentUser({ ...userCredential.user, displayName: name, photoURL: '' });
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
    updateCurrentUserProfile,
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
