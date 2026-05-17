import Link from "next/link";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center text-center p-8">
      <div>
        <p className="font-display text-8xl font-bold text-rose-200 mb-4">404</p>
        <h1 className="font-display text-3xl font-bold text-charcoal mb-3">Page Not Found</h1>
        <p className="text-stone-400 text-sm mb-8">The page you're looking for doesn't exist or has been moved.</p>
        <div className="flex gap-3 justify-center">
          <Link href="/" className="btn-primary"><Home size={16}/> Go Home</Link>
          <Link href="/products" className="btn-outline">Shop Now</Link>
        </div>
      </div>
    </div>
  );
}
