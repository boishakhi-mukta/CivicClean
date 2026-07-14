// ─────────────────────────────────────────────────────────────────────────────
// AuthContext.jsx — The app's login/logout system and user identity store.
//
// This file does two things:
//
//   1. Talks to Firebase Authentication (Google's free auth service) to handle
//      sign-up, sign-in, and sign-out operations securely.
//
//   2. After Firebase confirms who the user is, it syncs their details
//      (name, email, avatar) to our own MongoDB database and reads back their
//      role (citizen / staff / admin).  We need our own database record because
//      Firebase doesn't know about roles — that's CivicClean's own concept.
//
// Every component that needs to know "is anyone logged in?" or "what role do
// they have?" reads from this context using: const { currentUser, dbUser } = useContext(AuthContext)
//
// Exposed values:
//   currentUser           — the Firebase user object (null if not logged in)
//   dbUser                — our database record with the user's role, avatar, etc.
//   loading               — true while we're checking login state on page load
//   registerWithEmail()   — create a new account with email + password + photo
//   loginWithEmail()      — sign in with email + password
//   loginWithGoogle()     — sign in with Google's one-click pop-up
//   logout()              — sign out
//   changePassword()      — change the user's password (email accounts only)
//   refreshDbUser()       — re-fetch the database record (e.g. after a profile update)
//   updateCurrentUserProfile() — update name/avatar in Firebase Auth
// ─────────────────────────────────────────────────────────────────────────────

import { createContext, useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from 'firebase/auth';
import auth from '../firebase/firebase.config';
import axiosInstance from '../api/axiosInstance';
import { readPhotoAsDataUrl } from '../utils/uploadPhoto';

export const AuthContext = createContext();

// Temporary storage for the avatar selected during registration.
// Firebase Auth rejects base64 image data in its photoURL field, so we store
// it here and write it directly to our own database instead.
let _pendingAvatarUrl = '';

export const AuthProvider = ({ children }) => {
  // currentUser — the live Firebase user (null = not logged in)
  const [currentUser, setCurrentUser] = useState(null);

  // dbUser — our own database record containing the user's role and avatar
  const [dbUser, setDbUser] = useState(null);

  // loading — true while Firebase is figuring out if a session already exists
  const [loading, setLoading] = useState(true);

  // Called every time a user logs in (or the page loads and a session is found).
  // Sends the Firebase identity to our server, which creates/updates the DB record
  // and returns the user's role.
  const syncDbUser = async (firebaseUser) => {
    try {
      // If a photo was selected during registration, use it; otherwise use the Google photo
      const avatar_url = _pendingAvatarUrl || firebaseUser.photoURL || '';
      _pendingAvatarUrl = ''; // clear after use

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

  // Re-fetches the database user record — called after the user updates their profile
  const refreshDbUser = async () => {
    try {
      const { data } = await axiosInstance.get('/users/me');
      setDbUser(data);
      return data;
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  // Updates the display name and avatar URL in Firebase Auth (not just our DB)
  // Only passes HTTPS URLs to Firebase — base64 data is rejected by Firebase Auth
  const updateCurrentUserProfile = async ({ name, avatar_url }) => {
    if (!auth.currentUser) return null;
    try {
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

  // Creates a new account with email + password + optional profile photo.
  // The photo is converted to base64 locally and saved to our DB via syncDbUser
  // (Firebase Auth doesn't accept base64 in its photoURL field).
  const registerWithEmail = async (name, email, photoFile, password) => {
    setLoading(true);

    if (photoFile) {
      try {
        _pendingAvatarUrl = await readPhotoAsDataUrl(photoFile);
      } catch {
        _pendingAvatarUrl = '';
      }
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName: name, photoURL: '' });
    setCurrentUser({ ...userCredential.user, displayName: name, photoURL: '' });
    return userCredential;
  };

  // Signs in with email and password
  const loginWithEmail = (email, password) => {
    setLoading(true);
    return signInWithEmailAndPassword(auth, email, password);
  };

  // Opens a Google pop-up and signs in with the selected Google account
  const loginWithGoogle = () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  };

  // Signs the current user out and clears all session data
  const logout = () => {
    setLoading(true);
    return signOut(auth);
  };

  // Changes the password for email/password accounts.
  // Re-authenticates first (Firebase security requirement) to confirm identity.
  const changePassword = async (currentPassword, newPassword) => {
    const user = auth.currentUser;
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);
    await updatePassword(user, newPassword);
  };

  // Listen for Firebase auth state changes — runs on every page load to restore
  // any existing login session from the browser, and on every login/logout.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        await syncDbUser(user); // also load our DB record for this user
      } else {
        setCurrentUser(null);
        setDbUser(null);
      }
      setLoading(false); // done checking — hide the loading spinner
    });

    // Clean up the listener when the component unmounts
    return () => unsubscribe();
  }, []);

  // Everything we share with the rest of the app
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
    changePassword,
  };

  return (
    <AuthContext.Provider value={authInfo}>
      {children}
    </AuthContext.Provider>
  );
};
