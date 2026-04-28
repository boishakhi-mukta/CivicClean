import React, { useEffect } from 'react';

const MyIssuesPage = () => {
  useEffect(() => {
    document.title = "CivicClean | My Issues";
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">My Issues</h1>
      <p className="mt-4">View the issues you have reported.</p>
    </div>
  );
};

export default MyIssuesPage;
