import React, { useEffect } from 'react';

const AddIssuePage = () => {
  useEffect(() => {
    document.title = "CivicClean | Add Issue";
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">Add New Issue</h1>
      <p className="mt-4">Report a new cleanliness issue here.</p>
    </div>
  );
};

export default AddIssuePage;
