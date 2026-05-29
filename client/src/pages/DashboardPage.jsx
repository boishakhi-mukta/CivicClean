import React, { useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Fade } from 'react-awesome-reveal';

const DashboardPage = () => {
  const { currentUser, dbUser, loading } = useContext(AuthContext);

  useEffect(() => {
    document.title = "CivicClean | Dashboard";
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#1a3a2a] dark:border-[#d4ff00]"></div>
      </div>
    );
  }

  const displayName = dbUser?.name || currentUser?.displayName || 'User';
  const photoSrc = dbUser?.avatar_url || currentUser?.photoURL || 'https://via.placeholder.com/150';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 transition-colors">
      <div className="max-w-5xl mx-auto">
        <Fade direction="down" triggerOnce>
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#1a3a2a] dark:text-white mb-8">
            My Dashboard
          </h1>
        </Fade>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Fade direction="up" triggerOnce delay={100} className="md:col-span-1">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 h-full flex flex-col items-center text-center">
              <img 
                src={photoSrc}
                alt="Profile" 
                className="w-32 h-32 rounded-full mb-6 border-4 border-[#d4ff00]"
              />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{displayName}</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-6">{currentUser?.email}</p>
              
              <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-xl p-4 mb-4">
                <p className="text-sm text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider mb-1">Issues Reported</p>
                <p className="text-4xl font-black text-[#1a3a2a] dark:text-[#d4ff00]">{dbUser?.issueCount || 0}</p>
              </div>
            </div>
          </Fade>

          <div className="md:col-span-2 flex flex-col gap-6">
            <Fade direction="up" triggerOnce delay={200}>
              <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Link to="/add-issue" className="flex items-center justify-center p-4 bg-[#1a3a2a] text-[#d4ff00] font-bold rounded-xl hover:bg-[#2c5f45] transition transform hover:-translate-y-1">
                    + Report New Issue
                  </Link>
                  <Link to="/my-issues" className="flex items-center justify-center p-4 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition transform hover:-translate-y-1">
                    View My Issues
                  </Link>
                  <Link to="/map" className="flex items-center justify-center p-4 bg-[#d4ff00] text-[#1a3a2a] font-bold rounded-xl hover:bg-[#bce600] transition transform hover:-translate-y-1">
                    Explore Map
                  </Link>
                  <Link to="/all-issues" className="flex items-center justify-center p-4 bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 font-bold rounded-xl hover:bg-purple-200 dark:hover:bg-purple-900/50 transition transform hover:-translate-y-1">
                    Browse Issues
                  </Link>
                </div>
              </div>
            </Fade>

            <Fade direction="up" triggerOnce delay={300}>
              <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 flex-grow">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
                <p className="text-gray-500 dark:text-gray-400 italic">No recent activity to show yet.</p>
              </div>
            </Fade>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
