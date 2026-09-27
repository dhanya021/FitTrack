import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import Button from '../components/common/Button';

export const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6">
      <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mb-4">
        <AlertCircle className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
        404 - Page Not Found
      </h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-sm">
        The fitness tracking route you are looking for doesn't exist or has moved.
      </p>
      <div className="mt-6">
        <Link to="/">
          <Button leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
