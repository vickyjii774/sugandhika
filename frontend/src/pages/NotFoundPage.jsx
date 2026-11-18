import { Link } from 'react-router-dom';
import { Home, Leaf } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-brand-cream flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* Decorative icon */}
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 rounded-full bg-brand-dark/10 flex items-center justify-center">
            <Leaf className="w-12 h-12 text-brand-dark" />
          </div>
        </div>

        {/* 404 */}
        <h1 className="text-8xl font-extrabold text-brand-dark leading-none mb-4">404</h1>
        <h2 className="text-2xl font-bold text-gray-800 mb-3">Page Not Found</h2>
        <p className="text-gray-500 mb-8 leading-relaxed">
          Oops! The page you're looking for doesn't exist or has been moved. Let's get you back on
          track.
        </p>

        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-brand-dark text-white font-semibold rounded-xl hover:bg-brand transition-colors shadow-md"
        >
          <Home className="w-5 h-5" />
          Back to Home
        </Link>
      </div>
    </div>
  );
}
