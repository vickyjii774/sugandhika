import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Sparkles, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center text-center px-4 py-16">
      <div className="w-20 h-20 rounded-3xl bg-brand-cream text-brand-dark flex items-center justify-center mb-6 shadow-soft">
        <Sparkles className="w-10 h-10 text-brand-light" />
      </div>
      <span className="text-sm font-bold text-brand-light uppercase tracking-widest mb-1">
        Error 404
      </span>
      <h1 className="text-4xl font-extrabold text-slate-900 mb-3 font-serif">
        Page Not Found
      </h1>
      <p className="text-sm text-slate-500 max-w-md mb-8 leading-relaxed">
        The page or eco product you are looking for doesn't exist or has been moved to a new category.
      </p>
      <div className="flex gap-4">
        <Link href="/">
          <Button variant="primary">
            <Home className="w-4 h-4 mr-2" /> Back to Home
          </Button>
        </Link>
        <Link href="/shop">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" /> Browse Shop
          </Button>
        </Link>
      </div>
    </div>
  );
}
