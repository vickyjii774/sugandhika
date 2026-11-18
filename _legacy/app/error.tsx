"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Uncaught app error:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-16">
      <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4 shadow-soft">
        <AlertTriangle className="w-8 h-8" />
      </div>
      <h1 className="text-2xl font-bold text-slate-800 mb-2">Something went wrong!</h1>
      <p className="text-sm text-slate-500 max-w-md mb-6">
        We encountered an unexpected error while loading this page. Please try again.
      </p>
      <Button onClick={reset} variant="primary">
        <RefreshCw className="w-4 h-4 mr-2" /> Try Again
      </Button>
    </div>
  );
}
