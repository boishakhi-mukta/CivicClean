import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../api/axiosInstance';
import { Fade } from 'react-awesome-reveal';

const LeaderboardPage = () => {
  useEffect(() => {
    document.title = "CivicClean | Leaderboard";
  }, []);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => (await axiosInstance.get('/users/leaderboard?limit=20')).data,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#1a3a2a] dark:border-[#d4ff00]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 transition-colors">
      <div className="max-w-4xl mx-auto">
        <Fade direction="down" triggerOnce>
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold text-[#1a3a2a] dark:text-white mb-4">
              Community Leaderboard
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Recognizing our top contributors making the community a better place.
            </p>
          </div>
        </Fade>

        <Fade direction="up" triggerOnce>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#1a3a2a] text-[#d4ff00] uppercase text-sm tracking-wider">
                    <th className="py-5 px-6 font-bold">Rank</th>
                    <th className="py-5 px-6 font-bold">Citizen</th>
                    <th className="py-5 px-6 font-bold text-right">Contribution Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {users.map((user, index) => (
                    <tr
                      key={user._id}
                      className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${index < 3 ? 'bg-yellow-50/50 dark:bg-yellow-900/10' : ''}`}
                    >
                      <td className="py-5 px-6">
                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                          index === 0 ? 'bg-yellow-400 text-yellow-900' :
                          index === 1 ? 'bg-gray-300 text-gray-800' :
                          index === 2 ? 'bg-amber-600 text-white' :
                          'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                        }`}>
                          {index + 1}
                        </span>
                      </td>
                      <td className="py-5 px-6">
                        <div className="flex items-center">
                          <img
                            src={user.avatar_url || 'https://via.placeholder.com/40'}
                            alt={user.name}
                            className="w-10 h-10 rounded-full mr-4 border-2 border-gray-200 dark:border-gray-600"
                          />
                          <div>
                            <p className="font-bold text-gray-900 dark:text-white">{user.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Joined {new Date(user.created_at).getFullYear()}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-5 px-6 text-right font-black text-2xl text-[#1a3a2a] dark:text-[#d4ff00]">
                        {user.total_points}
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan="3" className="py-8 text-center text-gray-500 dark:text-gray-400 italic">
                        No contributors yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </Fade>
      </div>
    </div>
  );
};

export default LeaderboardPage;
