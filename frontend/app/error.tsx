"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
        <AlertTriangle className="w-8 h-8 text-red-500" />
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">Something went wrong!</h2>
      <p className="text-dark-400 mb-6 max-w-md">
        An unexpected error occurred. Please try again.
      </p>
      <button
        onClick={() => reset()}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-tiger-orange text-white font-semibold hover:bg-tiger-orange-dark transition-all"
      >
        <RefreshCw className="w-4 h-4" />
        Try again
      </button>
    </div>
  );
}

