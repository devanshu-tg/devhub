import Link from "next/link";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="text-8xl font-bold text-dark-600 mb-4">404</div>
      <h2 className="text-2xl font-bold text-white mb-2">Page not found</h2>
      <p className="text-dark-400 mb-6 max-w-md">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="flex gap-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-tiger-orange text-white font-semibold hover:bg-tiger-orange-dark transition-all"
        >
          <Home className="w-4 h-4" />
          Go Home
        </Link>
        <Link
          href="/resources"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-dark-700 text-white font-semibold hover:bg-dark-600 transition-all border border-dark-500"
        >
          <Search className="w-4 h-4" />
          Browse Resources
        </Link>
      </div>
    </div>
  );
}

