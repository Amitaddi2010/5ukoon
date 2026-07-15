import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
      <p className="text-[11px] tracking-[0.2em] text-white/20 uppercase font-medium mb-6">404</p>
      <h1 className="text-4xl md:text-5xl font-medium text-white mb-6 tracking-tight">Page not found</h1>
      <p className="text-[14px] text-white/40 font-light mb-12 max-w-xs leading-relaxed">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-3 px-7 h-10 border border-white/50 rounded-full text-[12px] tracking-[0.1em] uppercase font-medium text-white/70 hover:text-white hover:border-white transition-all"
      >
        Return Home
      </Link>
    </div>
  );
}
