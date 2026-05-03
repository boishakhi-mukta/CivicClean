import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import axiosInstance from '../api/axiosInstance';
import { Fade } from 'react-awesome-reveal';

const ProfilePage = () => {
  const { currentUser, logout } = useContext(AuthContext);
  const [userStats, setUserStats] = useState(null);

  useEffect(() => {
    document.title = "CivicClean | Profile";
    if (currentUser?.mongoId) {
      axiosInstance.get(`/users/${currentUser.mongoId}`).then(res => {
        setUserStats(res.data);
      });
    }
  }, [currentUser]);

  if (!currentUser) return <div>Please login.</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 transition-colors">
      <div className="max-w-3xl mx-auto">
        <Fade direction="down" triggerOnce>
          <h1 className="text-4xl font-extrabold text-[#1a3a2a] dark:text-white mb-8">My Profile</h1>
        </Fade>

        <Fade direction="up" triggerOnce>
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row items-center gap-8">
            <img 
              src={currentUser?.photoURL || 'https://via.placeholder.com/150'} 
              alt="Profile" 
              className="w-40 h-40 rounded-full border-4 border-[#d4ff00] shadow-md object-cover"
            />
            
            <div className="flex-grow">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{currentUser.displayName}</h2>
              <p className="text-lg text-gray-500 dark:text-gray-400 mb-6">{currentUser.email}</p>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-100 dark:bg-gray-700 rounded-xl p-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider mb-1">Total Points</p>
                  <p className="text-2xl font-black text-[#1a3a2a] dark:text-[#d4ff00]">{userStats?.total_points || 0}</p>
                </div>
                <div className="bg-gray-100 dark:bg-gray-700 rounded-xl p-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider mb-1">Role</p>
                  <p className="text-2xl font-black text-[#1a3a2a] dark:text-[#d4ff00]">{userStats?.role || 'User'}</p>
                </div>
              </div>
              
              <button 
                onClick={logout}
                className="px-6 py-3 bg-red-600 text-white font-bold rounded-lg shadow-md hover:bg-red-700 transition w-full md:w-auto"
              >
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
