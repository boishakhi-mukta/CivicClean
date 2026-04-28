import React, { useEffect } from 'react';

const MyContributionPage = () => {
  useEffect(() => {
    document.title = "CivicClean | My Contributions";
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">My Contributions</h1>
      <p className="mt-4">View your leaderboard points and contributions.</p>
    </div>
  );
};

export default MyContributionPage;
