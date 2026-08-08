import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/common/Button';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0b0f19] flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">
        404
      </h1>
      <h2 className="text-2xl font-bold text-white mt-4">Page Not Found</h2>
      <p className="text-sm text-gray-400 max-w-md mt-2 mb-8">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link to="/dashboard">
        <Button variant="primary" size="md">
          Return to Dashboard
        </Button>
      </Link>
    </div>
  );
};
