
import React from 'react';
import { RealtimeFarmerDirectory } from '@/pages/farmers/components/RealtimeFarmerDirectory';

const FarmersPage = () => {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Farmers Management</h1>
        <p className="text-muted-foreground">Real-time synced farmer data with live updates</p>
      </div>
      <RealtimeFarmerDirectory />
    </div>
  );
};

export default FarmersPage;
export { FarmersPage };
