import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';

const IssueDetailPage = () => {
  const { id } = useParams();

  useEffect(() => {
    document.title = `CivicClean | Issue Details`;
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">Issue Details</h1>
      <p className="mt-4">Viewing details for issue ID: {id}</p>
    </div>
  );
};

export default IssueDetailPage;
