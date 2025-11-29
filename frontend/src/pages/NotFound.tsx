import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { FileQuestion } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="flex justify-center">
          <div className="p-4 bg-blue-100 rounded-full">
            <FileQuestion className="h-12 w-12 text-blue-600" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-slate-900">404</h1>
          <h2 className="text-xl font-semibold text-slate-700">Page Not Found</h2>
          <p className="text-slate-500">
            Sorry, we couldn't find the page you're looking for. It might have been moved or deleted.
          </p>
        </div>

        <div className="flex justify-center gap-4">
          <Button asChild variant="default">
            <Link to="/">Go to Dashboard</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="#" onClick={() => window.history.back()}>Go Back</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
