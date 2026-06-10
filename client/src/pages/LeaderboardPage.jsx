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
      <div className="min-h-screen bg-bg py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto animate-pulse">
          <div className="text-center mb-12 space-y-3">
            <div className="h-12 w-80 bg-surface rounded-xl mx-auto" />
            <div className="h-5 w-64 bg-surface rounded-lg mx-auto" />
          </div>
          <div className="bg-surface rounded-xl border border-border overflow-hidden shadow-sm">
            <div className="bg-surface-alt/60 px-6 py-5 flex gap-8">
              <div className="h-4 w-10 bg-surface-alt rounded" />
              <div className="h-4 w-24 bg-surface-alt rounded" />
              <div className="h-4 w-36 bg-surface-alt rounded ml-auto" />
            </div>
            <div className="divide-y divide-border">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="px-6 py-5 flex items-center gap-4">
                  <div className="w-8 h-8 bg-surface-alt rounded-full flex-shrink-0" />
                  <div className="w-10 h-10 bg-surface-alt rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 bg-surface-alt rounded-md" />
                    <div className="h-3 w-20 bg-surface-alt rounded" />
                  </div>
                  <div className="h-7 w-14 bg-surface-alt rounded-md ml-auto" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const rankBadge = (index) => {
    if (index === 0) return 'bg-yellow-400 text-yellow-900';
    if (index === 1) return 'bg-gray-300 text-gray-800';
    if (index === 2) return 'bg-amber-600 text-white';
    return 'bg-surface-alt text-muted';
  };

  return (
    <div className="min-h-screen bg-bg py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-4xl mx-auto">
        <Fade direction="down" triggerOnce>
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold text-text mb-4">
              Community Leaderboard
            </h1>
            <p className="text-lg text-muted">
              Recognizing our top contributors making the community a better place.
            </p>
          </div>
        </Fade>

        <Fade direction="up" triggerOnce>
          <div className="bg-surface rounded-xl shadow-sm border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left whitespace-nowrap">
                <thead>
                  <tr className="bg-primary text-on-primary text-sm uppercase tracking-wider">
                    <th className="py-5 px-6 font-bold">Rank</th>
                    <th className="py-5 px-6 font-bold">Citizen</th>
                    <th className="py-5 px-6 font-bold text-right">Contribution Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {users.map((user, index) => (
                    <tr
                      key={user._id}
                      className={`hover:bg-surface-alt/60 transition-colors ${index < 3 ? 'bg-warning/5' : ''}`}
                    >
                      <td className="py-5 px-6">
                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${rankBadge(index)}`}>
                          {index + 1}
                        </span>
                      </td>
                      <td className="py-5 px-6">
                        <div className="flex items-center gap-4">
                          {user.avatar_url ? (
                            <img
                              src={user.avatar_url}
                              alt={user.name}
                              className="w-10 h-10 rounded-full object-cover border-2 border-border flex-shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-sm flex-shrink-0">
                              {(user.name || user.email || '?').charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-bold text-text truncate">{user.name}</p>
                            <p className="text-xs text-muted">Joined {new Date(user.created_at).getFullYear()}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-5 px-6 text-right font-black text-2xl text-primary">
                        {user.total_points}
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan="3" className="py-12 text-center text-muted italic">
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
