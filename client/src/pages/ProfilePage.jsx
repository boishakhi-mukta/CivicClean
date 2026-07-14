// ─────────────────────────────────────────────────────────────────────────────
// ProfilePage.jsx — A legacy read-only profile page at the /profile route.
//
// This is a simpler, older version of the profile experience. The main
// profile pages for each role (CitizenProfile, StaffProfile, AdminProfile)
// inside the respective dashboards are richer and fully editable.
//
// This page shows:
//   • The user's avatar or first-initial placeholder
//   • Display name and email
//   • Two stat tiles: how many issues they've reported, and their role
//   • A log-out button
//
// If the user is not logged in, a short "Please log in" message is shown
// instead of the profile.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Fade } from 'react-awesome-reveal';
import { FiLogOut } from 'react-icons/fi';

const ProfilePage = () => {
  const { currentUser, dbUser, logout } = useContext(AuthContext);

  useEffect(() => {
    document.title = "CivicClean | Profile";
  }, []);

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <p className="text-muted">Please log in to view your profile.</p>
      </div>
    );
  }

  const displayName = dbUser?.name || currentUser.displayName || 'User';
  const photoSrc = dbUser?.avatar_url || currentUser.photoURL || null;

  return (
    <div className="min-h-screen bg-bg py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-3xl mx-auto">
        <Fade direction="down" triggerOnce>
          <h1 className="text-3xl md:text-4xl font-extrabold text-text mb-8">My Profile</h1>
        </Fade>

        <Fade direction="up" triggerOnce>
          <div className="bg-surface p-6 sm:p-8 rounded-xl shadow-sm border border-border flex flex-col md:flex-row items-center gap-8">
            {photoSrc ? (
              <img
                src={photoSrc}
                alt="Profile"
                className="w-36 h-36 rounded-full border-4 border-primary shadow-md object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-36 h-36 rounded-full bg-primary flex items-center justify-center text-on-primary text-4xl font-extrabold flex-shrink-0">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}

            <div className="flex-grow min-w-0 w-full">
              <h2 className="text-2xl sm:text-3xl font-bold text-text mb-1 truncate">{displayName}</h2>
              <p className="text-muted mb-6 truncate">{currentUser.email}</p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-surface-alt rounded-xl p-4 border border-border">
                  <p className="text-xs text-muted uppercase font-semibold tracking-wider mb-1">Issues Reported</p>
                  <p className="text-2xl font-black text-primary">{dbUser?.issueCount || 0}</p>
                </div>
                <div className="bg-surface-alt rounded-xl p-4 border border-border">
                  <p className="text-xs text-muted uppercase font-semibold tracking-wider mb-1">Role</p>
                  <p className="text-2xl font-black text-primary capitalize">{dbUser?.role || 'citizen'}</p>
                </div>
              </div>

              <button
                onClick={logout}
                className="flex items-center gap-2 px-6 py-2.5 bg-danger/10 text-danger font-bold rounded-lg hover:bg-danger/20 transition-colors w-full md:w-auto justify-center md:justify-start"
              >
                <FiLogOut size={16} />
                Log Out
              </button>
            </div>
          </div>
        </Fade>
      </div>
    </div>
  );
};

export default ProfilePage;
