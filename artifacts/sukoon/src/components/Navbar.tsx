import { Link } from "wouter";
import { useState } from "react";

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 h-[52px] border-b border-white/[0.08] bg-black/90 backdrop-blur-md">
        {/* Logo */}
        <Link href="/" className="text-[13px] font-medium tracking-[0.18em] uppercase text-white select-none">
          SUKOON©
        </Link>

        {/* Nav links — desktop */}
        <div className="hidden md:flex items-center gap-10">
          {[
            { href: "/", label: "Home" },
            { href: "/#experience", label: "The Experience" },
            { href: "/#arc", label: "The Arc" },
            { href: "/#edition", label: "Edition I" },
            { href: "/#contact", label: "Contact" },
          ].map(({ href, label }) => (
            <a
              key={href}
              href={href}
              className="text-[13px] text-white/55 hover:text-white transition-colors duration-200 tracking-wide"
            >
              {label}
            </a>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <Link
            href="/request"
            className="hidden sm:inline-flex items-center px-5 h-8 text-[12px] tracking-[0.12em] uppercase border border-white/80 rounded-full text-white hover:bg-white hover:text-black transition-all duration-200 font-medium"
          >
            Let&apos;s Talk
          </Link>
          {/* Toggle dot — mobile menu trigger */}
          <button
            onClick={() => setMenuOpen(v => !v)}
            className="w-7 h-7 rounded-full border border-white/25 flex items-center justify-center hover:border-white/60 transition-colors duration-200 md:hidden"
            aria-label="Menu"
          >
            <div className="w-[7px] h-[7px] rounded-full bg-white/70" />
          </button>
          {/* Decorative dot — desktop */}
          <div className="hidden md:flex w-7 h-7 rounded-full border border-white/25 items-center justify-center">
            <div className="w-[7px] h-[7px] rounded-full bg-white/70" />
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-black flex flex-col pt-[52px]">
          <div className="flex flex-col px-8 py-10 gap-8">
            {[
              { href: "/", label: "Home" },
              { href: "/#experience", label: "The Experience" },
              { href: "/#arc", label: "The Arc" },
              { href: "/#edition", label: "Edition I" },
              { href: "/#contact", label: "Contact" },
            ].map(({ href, label }) => (
              <a
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className="text-2xl text-white/70 hover:text-white transition-colors tracking-wide font-light border-b border-white/10 pb-8"
              >
                {label}
              </a>
            ))}
            <Link
              href="/request"
              onClick={() => setMenuOpen(false)}
              className="inline-flex items-center justify-center px-5 h-12 text-[13px] tracking-[0.12em] uppercase border border-white/80 rounded-full text-white font-medium mt-4"
            >
              Request an Invite
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
